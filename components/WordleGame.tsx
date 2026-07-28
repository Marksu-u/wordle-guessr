"use client";

// import de tous les components
import { useState, useEffect } from 'react';
import WordleGrid from './WordleGrid';
import Keyboard from './Keyboard';


export default function WordleGame() {
    //OPTIONS DU JEU
    const [wordLength, setWordLength] = useState(5); //5 lettres par defaut
    const maxAttempts = 6; // 6 essais par mot

    // ETATS DU JEU
    const [guesses, setGuesses] = useState<string[]>([]);
    //Stockage des couleurs
    const [evaluations, setEvaluations] = useState<('correct' | 'present' | 'absent')[][]>([]);
    //Mot en cours de saisie
    const [currentGuess, setCurrentGuess] = useState('');

    const [letterStatuses, setLetterStatuses] = useState<{ [key: string]: 'correct' | 'present' | 'absent' }>({});
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    const [solution, setSolution] = useState<string>(''); //stockage du mot correct à afficher à la fin
    //Blocage double-clic
    const [isLoading, setIsLoading] = useState(false);

    //Etat pour animation du clavier physique
    const [activeKey, setActiveKey] = useState<string | null>(null);

    const [toastMessage, setToastMessage] = useState<string | null>(null);
    //Mouvement des cases quand le mot n'existe pas
    const [isShaking, setIsShaking] = useState(false);
    // GESTION DU SCORE ET LOCALSTORAGE
    const [historiqueScores, setHistoriqueScores] = useState<Record<string, number>>({});

    // TIROIR SAUVEGARDE DES PARTIES EN COURS
    type Gamestate = {
        guesses: string[];
        evaluations: ('correct' | 'present' | 'absent')[][];
        letterStatuses: { [key: string]: 'correct' | 'present' | 'absent' };
        gameStatus: 'playing' | 'won' | 'lost';
        solution: string;
    };
    //Dictionnaire des parties en cours
    const [savedGames, setSavedGames] = useState<Record<number, Gamestate>>({});

    //Sécurité de sauvegarde
    const [isInitialized, setIsInitialized] = useState(false);

    
    //Chargement 
    useEffect(() => {
        const donneesSave = localStorage.getItem('ligue1-historique');
        if (donneesSave) setHistoriqueScores(JSON.parse(donneesSave));

        //Vérification de date pour supprimer les essais
        const dateDuJour = new Date().toISOString().split('T')[0];
        const dateDernierePartie = localStorage.getItem('ligue1-date-derniere-partie');

        if (dateDernierePartie !== dateDuJour) {
            localStorage.removeItem('ligue1-parties-en-cours');
            localStorage.setItem('ligeue1-date-derniere-partie', dateDuJour);
        }

        //Recuperation de la derniere taille 
        const lastSizeSaved = localStorage.getItem('ligue1-derniere-taille');
        const initialSize = lastSizeSaved ? parseInt(lastSizeSaved) : 5;

        setWordLength(initialSize);
        
        const partiesSave = localStorage.getItem('ligue1-parties-en-cours');
        if (partiesSave) {
            const parsedSaves = JSON.parse(partiesSave);
            setSavedGames(parsedSaves);

            if (parsedSaves[5] && parsedSaves[5].guesses.length > 0) {
                const s = parsedSaves[5];
                setGuesses(s.guesses);
                setEvaluations(s.evaluations);
                setLetterStatuses(s.letterStatuses);
                setGameStatus(s.gameStatus);
                setSolution(s.solution);
            }
        }
        setIsInitialized(true);
    }, []);

    //Sauvegarde automatique
    useEffect(() => {
        if (!isInitialized) return;
        //Pas de sauvegarde de grille totalement vide
        if (guesses.length === 0 && gameStatus === 'playing') return;

        setSavedGames(prev => {
            const newState = {
                ...prev,
                [wordLength]: { guesses, evaluations, letterStatuses, gameStatus, solution }
            };
            localStorage.setItem('ligue1-parties-en-cours', JSON.stringify(newState));
            return newState;
        })
    }, [guesses, evaluations, letterStatuses, gameStatus, solution, wordLength, isInitialized]);

    //Sauvegarde du score
    const enregistrerScoreDuJour = (scoreObtenu: number) => {
        const dateDuJour = new Date().toISOString().split('T')[0];

        setHistoriqueScores((ancienHistorique) => {
            //Verification si score existant aujourd'hui
            const scoresDuJour = ancienHistorique[dateDuJour] || [];

            //Ajout du nouveau score à la fin de la liste
            const nouvelHistorique = {
                ...ancienHistorique,
                [dateDuJour]: bestScore
            };
            localStorage.setItem('ligue1-historique', JSON.stringify(nouvelHistorique));
            return nouvelHistorique;
        });
        window.dispatchEvent(new Event('maj-score'));
    };

    //Fonction Rejouer / Changement de taille
    const startNewGame = async (lengthToSet = wordLength) => {
        setIsLoading(true);
        try {
            const response = await fetch(`/api/game?length=${lengthToSet}`, { method: 'GET' });

            if (response.ok){
                setWordLength(lengthToSet);
                setGuesses([]);
                setEvaluations([]);
                setCurrentGuess('');
                setLetterStatuses({});
                setGameStatus('playing');
                setSolution('');

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

            try {
                //Envoi de la proposition de mot au serveur
                const response = await fetch('/api/game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ guess: currentGuess.toUpperCase(),
                        isLastAttempt: guesses.length >= (maxAttempts - 1)
                     }),
                });

                const data = await response.json();

                if (!response.ok) {
                    //Affichage du message d'erreur
                    setToastMessage("Mot introuvable dans la liste");
                    // On le fait disparaître après 2 secondes
                    setTimeout(() => setToastMessage(null), 2000);
                    setIsShaking(true);//Mouvement des cases
                    setTimeout(() => setIsShaking(false), 400);
                    return;//le mot est bloqué
                }

                //Recuperarion des couleurs
                const currentEval: ('correct' | 'present' | 'absent')[] = data.evaluation;

                //Maj historique des mots et des couleurs
                const newGuesses = [...guesses, currentGuess.toUpperCase()];
                setGuesses(newGuesses);
                setEvaluations([...evaluations, currentEval]);

                //Maj touches du clavier
                const updatedStatuses = { ...letterStatuses };
                for (let i = 0; i < currentGuess.length; i++) {
                    const char = currentGuess[i].toUpperCase();
                    const resultStatus = currentEval[i];

                    //Priorité des couleurs sur le clavier
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
                //si le joueur gagne
                if (data.isWon) {
                    setGameStatus('won');
                    //Calcul du score selon le nombre d'essais
                    const pointsGagnes = maxAttempts - newGuesses.length + 1;
                    // Sauvegarde dans le dico avec la date
                    enregistrerScoreDuJour(pointsGagnes);

                }   else if (newGuesses.length >= maxAttempts) {
                    //si le joueur perd 
                    setGameStatus('lost');
                    if (data.solution) {
                        setSolution(data.solution);
                        //Sauvegarde de la défaite (0 points)
                        enregistrerScoreDuJour(0);
                        
                    } else {
                        setSolution("INTROUVABLE");
                    }
                }

                setCurrentGuess('');
            }   catch (error) {
                alert("Impossible de contacter le serveur.");
            }
        }

        else {
            if (currentGuess.length < wordLength&& key.length === 1) {
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
    
    //Récupération des scores 
    const allScores = Object.values(historiqueScores);

    //Recherche du meilleur score
    const bestScore = allScores.length > 0 ? Math.max(...allScores) : 0;


    // AFFICHAGE
    return (
        <div className='flex flex-col items-center w-full p-4'>
            {/* SELECTEUR TAILLE MOT */}
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

        {/* Message d'erreur temporaire*/}
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

             {/* AFFICHAGE DU MOT CORRECT EN CAS DE DÉFAITE */}
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

            {/*Affichage du bouton "Rejouer" en cas de partie terminée*/}
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

            {/* LE CLAVIER VIRTUEL */}
            <div className="mt-12 w-full">
                <Keyboard 
                    onKeyPress={handleKeyPress} 
                    letterStatuses={letterStatuses} 
                    activeKey={activeKey}
                />
            </div>
            
        </div>
    );
}