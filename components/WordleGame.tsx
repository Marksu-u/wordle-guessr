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
import { MAX_ESSAIS, calculerMaxIndices, calculerScore } from "@/lib/scoring";
import motsJson from "@/app/data/ligue1/wordle.json";
import { ecrireDerniereTaille, ecrireSauvegarde, lireDernieretaille, lireSauvegarde, partieVierge, 
  lireHistorique, ecrireHistorique, lireStatsGlobales, ecrireStatsGlobales, type StatsGlobales, 
  type EtatPartie, type SauvegardeDuJour, } from "@/lib/sauvegarde";

const LONGUEURS_DISPONIBLES = [4, 5, 6, 7, 8];
const LONGUEUR_PAR_DEFAUT = 5;

const MotsClient = motsJson.words as Record<string, string[]>;

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

    const [isReportClosed, setIsReportClosed] = useState(false);

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

        //Bouclier anti doublons
        if (partie.essais.includes(essai)) {
          afficherToast("Tu as déjà essayé ce mot !");
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 400);
          return;
        }

        //Bouclier anti mots inventés
        const listeDeMots = MotsClient[wordLength.toString()] || [];
        const motValide = listeDeMots.some(
          (motDuDictionnaire) => motDuDictionnaire.toUpperCase() === essai.toUpperCase()
        );
        if (!motValide) {
          afficherToast("Ce mot n'est pas dans la liste !");
          setIsShaking(true);
          setTimeout(() => setIsShaking(false), 400);
          return;
        }

        const evaluation = compareWords(essai, partie.solution);
        const essais = [...partie.essais, essai];
        const gagne = evaluation.every((statut) => statut === "correct");
        const perdu = !gagne && essais.length >= MAX_ESSAIS;

        let scoreObtenu = null;

        if (gagne || perdu ) {
            const date = sauvegarde.date;

            scoreObtenu = calculerScore({
                gagne,
                essaisUtilises: essais.length,
                indicesUtilises: partie.indicesUtilises,
                longueurMot: partie.solution.length,
            });

            //Lecture de l'historique
            const historique = lireHistorique();
            //Verification points aujourd'hui
            const scoreExistant = historique[date] || 0;
            //Addition du nouveau score avec l'existant
            const nouveauScoreDuJour = scoreExistant + (scoreObtenu || 0);
            //Meilleur score gardé et sauvegarde
            historique[date] = nouveauScoreDuJour;
            ecrireHistorique(historique);

            const statsCourantes = lireStatsGlobales();
            const stats: StatsGlobales = statsCourantes ? statsCourantes : { partiesJouees: 0, 
                victoires: 0, record: 0 };
            
            stats.partiesJouees += 1;
            if (gagne) stats.victoires += 1;

            stats.record = Math.max(stats.record, nouveauScoreDuJour);

            ecrireStatsGlobales(stats);

            window.dispatchEvent(new Event(EVENEMENT_MAJ_SCORE));
        }

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
            score: scoreObtenu,
        };

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

      const limiteIndices = calculerMaxIndices(wordLength);

      if (partie.indicesUtilises >= limiteIndices) {
        afficherToast(`${limiteIndices} indices maximum par grille.`);
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

const toutesGrillesJouees = sauvegarde ? LONGUEURS_DISPONIBLES.every((longueur) => 
  sauvegarde.parties[longueur] && sauvegarde.parties[longueur].statut !== 'playing'): false;

const scoreTotalDuJour = sauvegarde ? (lireHistorique()[sauvegarde.date] || 0): 0;

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
        <div className="absolute top-38 z-50 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 
        font-bold tracking-wider text-white shadow-2xl">
          {toastMessage}
        </div>
      )}

      {erreur && (
        <button
          onClick={() => changerLongueur(wordLength)}
          className="mb-4 rounded-lg border border-red-800 bg-red-950/30 px-4 py-3 font-mono text-sm 
          text-red-400">
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

          <p className="font-mono text-sm text-zinc-500">
            <span className="font-black ">{partie.score ?? 0}</span>{" "}
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
      {/* MESSAGE DE FIN DE JOURNEE */}
      {toutesGrillesJouees && !isReportClosed && (
        <div 
          onClick={() => setIsReportClosed(true)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 p-4
          backdrop-blur-sm">
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-sm rounded-3xl border border-blue-600/30 bg-zinc-900
            p-8 text-center shadow-2xl">
            {/* Bouton pour fermer la fenetre */}
            <button
              onClick={() => setIsReportClosed(true)}
              className="absolute right-5 top-5 flex h-8 w-8 items-center justify-center rounded-full
              bg-zinc-800 text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-white">
                x
              </button>
              <h2 className="font-mono text-lg font-bold tracking-widest text-blue-500 uppercase">
                Bilan du Jour
              </h2>
              <p className="mt-3 text-sm text-zinc-400">
                Mission accomplie, tu as terminé toutes les grilles de la journée !
              </p>

              <div className="mt-6 rounded-2xl bg-zinc-950 py-4">
                <p className="font-mono text-xs tracking-widest text-zinc-500 uppercase">
                  Score Total</p>
                <p className="mt-1 font-mono text-3xl font-black text-white">
                  {scoreTotalDuJour} <span className="text-sm text-zinc-500">PTS</span>
                </p>
              </div>

              <p className="mt-6 font-mono text-xs tracking-widest text-blue-400/50 uppercase">
                Reviens demain pour de nouveaux mots
              </p>
          </div>
        </div>
      )}
      
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
