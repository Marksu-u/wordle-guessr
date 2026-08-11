"use client";

// import de tous les components
import { useCallback, useEffect, useRef, useState } from 'react';
import WordleGrid from './WordleGrid';
import Keyboard from './Keyboard';
import Countdown from './Countdown';
import DevSolution from "./DevSolution";
import { compareWords, type LettreStatut } from "@/lib/compare";
import type { ReponseMotDuJour } from "@/lib/daily";
import { EVENEMENT_DEMANDE_INDICE, EVENEMENT_MAJ_SCORE } from "@/lib/events";
import { MAX_ESSAIS, MAX_INDICES, calculerScore } from "@/lib/scoring";
import {
    ecrireDerniereTaille,
    ecrireSauvegarde,
    lireDernieretaille,
    lireSauvegarde,
    partieVierge,
    lireHistorique,
    ecrireHistorique,
    type EtatPartie,
    type SauvegardeDuJour,
} from "@/lib/sauvegarde";

const LONGUEURS_DISPONIBLES = [4, 5, 6, 7, 8];
const LONGUEUR_PAR_DEFAUT = 5;

//Couleur des touches du clavier apres un essai (vert -> jaune -> gris)
function fusionnerStatuts(
    statuts: Record<string, LettreStatut>,
    essai: string,
    evaluation: LettreStatut[],
): Record<string, LettreStatut> {
    const priorite = { absent: 0, present: 1, correct: 2 };
    const suivants = { ...statuts };

    for (let i = 0; i < essai.length; i++) {
        const ancien = suivants[essai[i]];
        if (!ancien || priorite[evaluation[i]] > priorite[ancien]) {
            suivants[essai[i]] = evaluation[i];
        }
    }
    return suivants;
}

export default function WordleGame() {
    const [wordLength, setWordLength] = useState(LONGUEUR_PAR_DEFAUT); //5 lettres par defaut
    const [currentGuess, setCurrentGuess] = useState("");

    //Copie de toutes les grilles du jour (chaque taille) dans le localStorage
    const [sauvegarde, setSauvegarde] = useState<SauvegardeDuJour | null>(null);
    const [numeroGrille, setNumeroGrille] = useState<number | null>(null);

    //Blocage double-clic
    const [isLoading, setIsLoading] = useState(false);

    const [erreur, setErreur] = useState(false);
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    const [isShaking, setIsShaking] = useState(false);

    const partie = sauvegarde?.parties[wordLength] ?? null;

    const afficherToast = useCallback((message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(null), 2500);
    }, []);

    //La grille courante est mise en mémoire et dans le localStorage
    const majPartie = useCallback((longueur: number, nouvelle: EtatPartie) => {
        setSauvegarde((precedente) => {
            if (!precedente) return precedente;
            const suivante = {
                date: precedente.date,
                parties: { ...precedente.parties, [longueur]: nouvelle },
            };
            ecrireSauvegarde(suivante);
            return suivante;
        });
    }, []);

    //Charge du mot du jour : grille vierge ou celle commencée auj
    const chargerGrille = useCallback(async (longueur: number) => {
        try {
            const response = await fetch(`/api/game?length=${longueur}`);
            if (!response.ok) throw new Error(`API: ${response.status}`);
            const data: ReponseMotDuJour = await response.json();

            //lireSauvegarde jette automatiquement les anciennes grilles
            const enCache = lireSauvegarde(data.date);
            const existante = enCache.parties[longueur];
            //Si le mot change, on repart de 0
            const grille = existante?.solution === data.secret 
            ? existante : partieVierge(data.secret);

            const aJour = { 
                date: data.date,
                parties: { ...enCache.parties, [longueur]: grille},
            };
            ecrireSauvegarde(aJour);
            ecrireDerniereTaille(longueur);

            setSauvegarde(aJour);
            setNumeroGrille(data.numero);
            setWordLength(longueur);
            setCurrentGuess("");
            setErreur(false);
        } catch (error) {
            console.error(error);
            setErreur(true);
        } finally {
            setIsLoading(false);
        }
    }, []);

    //Synchronisation : reprise de la derniere longueur jouée
    useEffect(() => {
        chargerGrille(lireDernieretaille(LONGUEUR_PAR_DEFAUT));
    }, [chargerGrille]);

    const changerLongueur = (longueur: number) => {
        if (isLoading) return;
        setIsLoading(true);
        chargerGrille(longueur);
    };

    //Gestion du clavier physique
    const handleKeyPress = (key: string) => {
        if (!partie || !sauvegarde || partie.statut !== "playing") return;

        if (key === "SUPPRIMER") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
        }

        if (key !== "ENTRER") {
        if (key.length === 1 && currentGuess.length < wordLength) {
            setCurrentGuess((prev) => prev + key.toUpperCase());
        }
        return;
        }

        if (currentGuess.length !== wordLength) {
            afficherToast(`Le mot doit faire ${wordLength} lettres`);
            setIsShaking(true);
            setTimeout(() => setIsShaking(false), 400);
            return;
        }

        const essai = currentGuess.toUpperCase();
        const evaluation = compareWords(essai, partie.solution);
        const essais = [...partie.essais, essai];
        const gagne = evaluation.every((statut) => statut === "correct");
        const perdu = !gagne && essais.length >= MAX_ESSAIS;

        const grille: EtatPartie = {
            ...partie,
            essais,
            evaluations: [...partie.evaluations, evaluation],
            statutsLettres: fusionnerStatuts(
                partie.statutsLettres,
                essai,
                evaluation,
            ),
            statut: gagne ? "won" : perdu ? "lost" : "playing",
        };

        if (gagne || perdu ) {
            //const stats = lireStats();
            const date = sauvegarde.date;

            grille.score = calculerScore({
                gagne,
                essaisUtilises: essais.length,
                indicesUtilises: partie.indicesUtilises,
                longueurMot: partie.solution.length,
            });

            //Lecture de l'historique
            const historique = lireHistorique();

            //Verification points aujourd'hui
            const scoreExistant = historique[date] || 0;

            //Meilleur score gardé et sauvegarde
            historique[date] = Math.max(scoreExistant, grille.score);
            ecrireHistorique(historique);

            window.dispatchEvent(new Event(EVENEMENT_MAJ_SCORE));

        }

        majPartie(wordLength, grille);
        setCurrentGuess("");
    };

    //L'ecoute du clavier est posée qu'une fois, la ref lui donne toujours la derniere version
    const handleKeyPressRef = useRef(handleKeyPress);
    useEffect(() => {
        handleKeyPressRef.current = handleKeyPress;
    });

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.ctrlKey || event.metaKey || event.altKey) return;
            const touche = event.key.toUpperCase();

            let action: string | null = null;
            if (event.key === "Enter") action = "ENTRER";
            else if (event.key === "Backspace") action = "SUPPRIMER";
            else if (/^[A-Z]$/.test(touche)) action = touche;
            if (!action) return;

            setActiveKey(action);
            setTimeout(() => setActiveKey(null), 150);
            handleKeyPressRef.current(action);
        };

        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, []);

    //Bouton indice
    useEffect(() => {
    const surDemandeIndice = () => {
      if (!partie || partie.statut !== "playing") return;
      if (partie.indicesUtilises >= MAX_INDICES) {
        afficherToast(`${MAX_INDICES} indices maximum par grille.`);
        return;
      }

      //Lettres du mot ni vertes ni jaunes sur le clavier
      const manquantes = [...new Set(partie.solution.split(""))].filter(
        (lettre) =>
          partie.statutsLettres[lettre] !== "correct" &&
          partie.statutsLettres[lettre] !== "present",
      );

      if (manquantes.length === 0) {
        afficherToast("Tu as déjà trouvé toutes les lettres !");
        return;
      }

      const lettre = manquantes[Math.floor(Math.random() * manquantes.length)];
      majPartie(wordLength, {
        ...partie,
        statutsLettres: { ...partie.statutsLettres, [lettre]: "present" },
        indicesUtilises: partie.indicesUtilises + 1,
      });
      afficherToast(`Indice : le mot contient un ${lettre} (score réduit)`);
    };

    window.addEventListener(EVENEMENT_DEMANDE_INDICE, surDemandeIndice);
    return () =>
      window.removeEventListener(EVENEMENT_DEMANDE_INDICE, surDemandeIndice);
  }, [partie, wordLength, majPartie, afficherToast]);

  return (
    <div className="flex w-full flex-col items-center p-4">
      {/* GRILLE DU JOUR */}
      <div className="mb-6 flex flex-col items-center gap-1">
        <span className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
          {numeroGrille !== null ? `Grille n°${numeroGrille}` : "Chargement..."}
        </span>
        <span className="font-mono text-[11px] text-zinc-500">
          Le même mot pour tout le monde, chaque jour.
        </span>
      </div>

      {/* SELECTEUR TAILLE MOT */}
      <div className="mb-10 flex w-full flex-col items-center">
        <span className="mb-2 font-mono text-xs tracking-wider text-zinc-400 uppercase">
          Longueur du mot
        </span>
        <div className="flex gap-2">
          {LONGUEURS_DISPONIBLES.map((longueur) => (
            <button
              key={longueur}
              disabled={isLoading}
              onClick={() => changerLongueur(longueur)}
              className={`rounded-lg px-3 py-1.5 font-mono text-sm font-bold transition-all ${
                wordLength === longueur
                  ? "scale-105 bg-blue-600 text-white ring-2 ring-blue-400"
                  : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
              }`}
            >
              {longueur}
            </button>
          ))}
        </div>
      </div>

      {/* Message temporaire */}
      {toastMessage && (
        <div className="absolute top-38 z-50 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 font-bold tracking-wider text-white shadow-2xl">
          {toastMessage}
        </div>
      )}

      {erreur && (
        <button
          onClick={() => changerLongueur(wordLength)}
          className="mb-4 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 font-mono text-sm text-red-400"
        >
          Mot du jour indisponible — réessayer
        </button>
      )}

      <WordleGrid
        guesses={partie?.essais ?? []}
        currentGuess={currentGuess}
        wordLength={wordLength}
        evaluations={partie?.evaluations ?? []}
        maxAttempts={MAX_ESSAIS}
        isShaking={isShaking}
      />

      {/* FIN DE GRILLE : pas de "Rejouer", il faut attendre demain */}
      {partie && partie.statut !== "playing" && (
        <div className="mt-8 flex w-full max-w-xs flex-col items-center gap-3">
          <p className="text-lg font-bold">
            {partie.statut === "won" ? "Gagné !" : "Dommage..."}
          </p>

          {partie.statut === "lost" && (
            <div className="w-full rounded-xl border border-green-800 bg-green-950/20 p-3 text-center">
              <p className="font-mono text-xs tracking-widest text-green-600 uppercase">
                La réponse correcte est :
              </p>
              <p className="mt-1 font-mono text-xl font-black tracking-widest text-green-500 uppercase">
                {partie.solution}
              </p>
            </div>
          )}

          <p className="font-mono text-sm text-zinc-300">
            <span className="font-black text-white">{partie.score ?? 0}</span>{" "}
            points
          </p>

          <div className="mt-2 text-center">
            <p className="font-mono text-xs tracking-widest text-zinc-400 uppercase">
              Prochain mot dans
            </p>
            <Countdown
              onFin={() => changerLongueur(wordLength)}
              className="font-mono text-2xl font-black tracking-widest text-blue-400"
            />
            <p className="mt-2 font-mono text-[11px] text-zinc-500">
              En attendant, tente une autre longueur de mot.
            </p>
          </div>
        </div>
      )}

      <DevSolution solution={partie?.solution ?? ""} />

      {/* LE CLAVIER VIRTUEL */}
      <div className="mt-12 w-full">
        <Keyboard
          onKeyPress={handleKeyPress}
          letterStatuses={partie?.statutsLettres ?? {}}
          activeKey={activeKey}
        />
      </div>
    </div>
  );
}
    
/** 
    //Sauvegarde automatique
    useEffect(() => {
        if (!isInitialized) return;
        //Pas de sauvegarde de grille totalement vide
        if (guesses.length === 0 && gameStatus === 'playing') return;

        setSavedGames(prev => {
            const newState = {
                ...prev,
                [wordLength]: { guesses, evaluations, letterStatuses, gameStatus, solution, indicesUtilises }
            };
            localStorage.setItem('ligue1-parties-en-cours', JSON.stringify(newState));
            return newState;
        })
    }, [guesses, evaluations, letterStatuses, gameStatus, solution, wordLength, indicesUtilises, isInitialized]);

    //Sauvegarde du score
    const enregistrerScoreDuJour = (scoreObtenu: number) => {
        console.log("Victoire! Points gagnés : ", scoreObtenu);
        const dateDuJour = new Date().toISOString().split('T')[0];
        //Lecture de l'historique
        const donneesSave = localStorage.getItem('ligue1-historique');
        const historique = donneesSave ? JSON.parse(donneesSave) : {};
        //Récuperation du score du jour
        const scoreExistant = historique[dateDuJour] || 0;

        //Addition avec les nouveaux points
        historique[dateDuJour] = Math.max(scoreExistant, scoreObtenu);
        //Destruction de l'ancienne sauvegarde par la nouvelle
        localStorage.setItem('ligue1-historique', JSON.stringify(historique));
        console.log("Nouvel historique enregistré : ", historique);

        //Rafraichissement du component Score
        window.dispatchEvent(new Event('maj-score'));
    };

    //Fonction Rejouer / Changement de taille
    const startNewGame = async (lengthToSet = wordLength) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/game?length=${lengthToSet}`, { method: 'GET' });
            const data = await response.json();

            if (data.secret){
                setSolution(data.secret);
                setWordLength(lengthToSet);
                setGuesses([]);
                setEvaluations([]);
                setCurrentGuess('');
                setLetterStatuses({});
                setGameStatus('playing');
                setIndicesUtilises(0);

                //Efface l'ancienne sauvegarde pour cette taille
                setSavedGames(prev => {
                    const newState = { ...prev };
                    delete newState[lengthToSet];
                    localStorage.setItem('ligue1-parties-en-cours', JSON.stringify(newState));
                    return newState;
                });
            } 
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isInitialized && solution === '' && gameStatus === 'playing') {
            startNewGame(wordLength);
        }
    }, [isInitialized, solution]);

    //Relance de la partie si user clique sur bouton de taille
    const handleLengthChange = (newLength: number) => {
        if (isLoading || newLength === wordLength) return;

        const saved = savedGames[newLength];
        //Si sauvegarde il y a, on la récupère
        if (saved && saved.guesses.length > 0) {
            setGuesses(saved.guesses);
            setEvaluations(saved.evaluations);
            setLetterStatuses(saved.letterStatuses);
            setGameStatus(saved.gameStatus);
            setSolution(saved.solution);
            setCurrentGuess('');
            setWordLength(newLength);
        } else {
            //Sinon lancement nouvelle partie
            startNewGame(newLength);
        }
    };
    //Calcul des couleurs sans le serveur
    const evaluerEssai = (essai: string, motSecret: string) => {
        const resultat = Array(essai.length).fill('absent') as ('correct' | 'present' | 'absent')[];
        const lettresSecretes = motSecret.split('');
        const lettresEssai = essai.split('');

        //1er passage : Lettres vertes
        for (let i = 0; i < essai.length; i++) {
            if (lettresEssai[i] === lettresSecretes[i]) {
                resultat[i] = 'correct';
                lettresSecretes[i] = null as any;
            }
        }
        //2e passage : Lettres jaunes
        for (let i = 0; i < essai.length; i++) {
            if (resultat[i] !== 'correct' && lettresSecretes.includes(lettresEssai[i])) {
                resultat[i] = 'present';
                lettresSecretes[lettresSecretes.indexOf(lettresEssai[i])] = null as any;
            }
        }
        return resultat;
    }

    //Gestion des touches
    const handleKeyPress = async (key: string) => {
        //Blocage du clavier si partie terminée
        if (gameStatus !== 'playing') return;
        if (key === 'SUPPRIMER') {
            setCurrentGuess((prev) => prev.slice(0, -1));
        }

        else if (key === 'ENTRER') {
            if (currentGuess.length !== wordLength) {
                //Affichage du message d'erreur
                    setToastMessage(`Le mot doit faire ${wordLength} lettres`);
                    setTimeout(() => setToastMessage(null), 2000);//Temps d'affichage du message
                    setIsShaking(true); //Mouvement des cases
                    setTimeout(() => setIsShaking(false), 400);                
                    return;
            }

            const currentEval = evaluerEssai(currentGuess.toUpperCase(), solution);
            const newGuesses = [...guesses, currentGuess.toUpperCase()];

            setGuesses(newGuesses);
            setEvaluations([...evaluations, currentEval]);

            //Maj touches du clavier
            const updatedStatuses = { ...letterStatuses };
            for (let i = 0; i < currentGuess.length; i++) {
                const char = currentGuess[i].toUpperCase();
                const resultStatus = currentEval[i];

                if (resultStatus === 'correct') {
                    updatedStatuses[char] = 'correct';
                } else if (resultStatus === 'present') {
                    if (updatedStatuses[char] !== 'correct') {
                        updatedStatuses[char] = 'present';
                    }
                } else if (resultStatus === 'absent') {
                    if (updatedStatuses[char] !== 'correct' && updatedStatuses[char] !== 'present') {
                        updatedStatuses[char] = 'absent';
                    }
                }
            }
            setLetterStatuses(updatedStatuses);

            //FIN DE PARTIE
            //Vérification des lettres, si elles sont "correct"
            const isWon = currentEval.every(status => status === 'correct');

            if (isWon) {
                //En cas de victoire
                setGameStatus('won');
                let pointsGagnes = maxAttempts - newGuesses.length + 1;
                pointsGagnes = pointsGagnes - indicesUtilises;
                if (pointsGagnes < 1) pointsGagnes = 1;
                enregistrerScoreDuJour(pointsGagnes);

            //En cas de défaite
            } else if (newGuesses.length >= maxAttempts) {
                setGameStatus('lost');
                enregistrerScoreDuJour(0);
            }
            
            setCurrentGuess('');
        } else {
            if (currentGuess.length < wordLength && key.length === 1) {
                setCurrentGuess((prev) => prev + key.toUpperCase());
            }
        }

    };

    //Gerer le clavier physique
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            const key = event.key.toUpperCase();

            // DECLENCHEMENT DE L'ANIMATION 
            let keyToAnimate = key;
            if (event.key === 'Enter') keyToAnimate = 'ENTRER';
            if (event.key === 'Backspace') keyToAnimate = 'SUPPRIMER';

            if (/^[A-Z]$/.test(key) || event.key === 'Enter' || event.key === 'Backspace') {
                setActiveKey(keyToAnimate);
                setTimeout(() => {
                    setActiveKey(null);
                }, 150);
            }

            //Cas 1 : Touche entrer
            if (event.key === 'Enter') {
                handleKeyPress('ENTRER');
            }
            //Cas 2 : Touche supprimer
            else if (event.key === 'Backspace') {
                handleKeyPress('SUPPRIMER');
            }
            //Cas 3 : Touches lettres
            else if (/^[A-Z]$/.test(key)) {
                handleKeyPress(key);
            }
        };
        //Attache event à la fenetre dès ouverture du jeu
        window.addEventListener('keydown', handleKeyDown);
        //Nettoyage de l'event
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [wordLength, currentGuess, guesses, gameStatus ]);
    
    
         
        window.addEventListener('demande-indice', handleIndice);
        return () => window.removeEventListener('demande-indice', handleIndice);
    }, [letterStatuses, gameStatus, solution]);

    // AFFICHAGE
    return (
        <div className='flex flex-col items-center w-full p-4'>
            {// SELECTEUR TAILLE MOT //}
            <div className='flex flex-col items-center mt-6 mb-12 w-full'>
                <span className='text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2'>
                    Longueur du mot
                </span>
                <div className='flex gap-2'>
                    {[4, 5, 6, 7, 8].map((length) => (
                        <button
                            key={length}
                            disabled={isLoading}
                            onClick={() => handleLengthChange(length)}
                            className={`px-3 py-1.5 rounded-lg text-sm font-mono font-bold transition-all ${ wordLength === length ? 
                                'bg-blue-600 text-white ring-2 ring-blue-400 scale-105'
                                : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white'
                            }`}
                        >
                            {length}
                        </button>
                    ))}
                </div>
            </div>

        {// Message d'erreur temporaire//}
        {toastMessage && (
            <div className="absolute top-38 bg-zinc-900 text-white text-sm border border-zinc-700 px-4 py-3
            rounded-lg shadow-2xl z-50 font-bold tracking-wider">
                {toastMessage}
            </div>
        )}
                <WordleGrid
                    guesses={guesses}
                    currentGuess={currentGuess}
                    wordLength={wordLength}
                    evaluations={evaluations} // On passe directement les couleurs reçues du serveur !
                    maxAttempts={maxAttempts}//prop appliquée à la grille
                    isShaking={isShaking}//prop du mouvement
                />

             {// AFFICHAGE DU MOT CORRECT EN CAS DE DÉFAITE //}
             { gameStatus === 'lost' && (
                <div className='mt-8 mb-4 p-3 bg-green-950/20 border border-green-800 rounded-xl text-center
                w-full max-w-xs animate-fade-in'>
                    <p className='text-xs font-mono text-green-600 uppercase tracking-widest'>
                        La réponse correcte est :
                    </p>
                    <p className='text-xl font-black text-green-500 tracking-widest uppercase mt-1 font-mono'>
                        {solution}
                    </p>
                </div>
             )}

            {//Affichage du bouton "Rejouer" en cas de partie terminée//}
            {gameStatus !== 'playing' && (
                <div className="flex flex-col items-center mt-7 gap-3 my-4 ">
                    <p className="text-lg font-bold">
                        {gameStatus === 'won' ? 'Gagné ! ' : 'Dommage...'}
                    </p>
                    <button
                        onClick={() => startNewGame()}
                        disabled={isLoading}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 
                        disabled:bg-zinc-700 text-white font-extrabold rounded-xl shadow-md 
                        transition-all transform hover:scale-105 active:scale-95">
                        {isLoading ? 'Génération...' : 'Rejouer'}
                    </button>
                </div>
            
            )}

            {// LE CLAVIER VIRTUEL //}
            <div className="mt-12 w-full">
                <Keyboard 
                    onKeyPress={handleKeyPress} 
                    letterStatuses={letterStatuses} 
                    activeKey={activeKey}
                />
            </div>
            
        </div>
    );
}*/