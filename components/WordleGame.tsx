"use client";

// import de tous les components
import { useState, useEffect } from 'react';
import WordleGrid from './WordleGrid';
import Keyboard from './Keyboard';


export default function WordleGame() {
    //OPTIONS DU JEU
    const [wordLength, setWordLength] = useState(5); //5 lettres par defaut
    const [solution, setSolution] = useState<string>(''); //stockage du mot correct à afficher à la fin
    const maxAttempts = 6;

    // ETATS DU JEU
    const [guesses, setGuesses] = useState<string[]>([]);
    //Stockage des couleurs
    const [evaluations, setEvaluations] = useState<('correct' | 'present' | 'absent')[][]>([]);
    //Mot en cours de saisie
    const [currentGuess, setCurrentGuess] = useState('');
    const [letterStatuses, setLetterStatuses] = useState<{ [key: string]: 'correct' | 'present' | 'absent' }>({});
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');

    //Blocage double-clic
    const [isLoading, setIsLoading] = useState(false);
    //Etat pour animation du clavier physique
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);
    //Mouvement des cases quand le mot n'existe pas
    const [isShaking, setIsShaking] = useState(false);
    //Mémoire des indices
    const [indicesUtilises, setIndicesUtilises] = useState(0);

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

            if (parsedSaves[initialSize] && parsedSaves[initialSize].guesses.length > 0) {
                const s = parsedSaves[initialSize];
                setGuesses(s.guesses);
                setEvaluations(s.evaluations);
                setLetterStatuses(s.letterStatuses);
                setGameStatus(s.gameStatus);
                setSolution(s.solution);
                setIndicesUtilises(s.indicesUtilises || 0);
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
    
    //Bouton indice
    useEffect(() => {
        const handleIndice = async () => {
            if (gameStatus !== 'playing' || !solution) return;

            //Recherche de lettres ni vertes ni jaunes
            const lettresSecretes = solution.split('');
            const lettresManquantes = lettresSecretes.filter(
                lettre => letterStatuses[lettre] !== 'correct' && letterStatuses[lettre] !== 'present'
            );

            if (lettresManquantes.length > 0) {
                //Pioche au hasard d'une lettre du mot
                const randomLettre = lettresManquantes[Math.floor(Math.random() * lettresManquantes.length)];
                //Coloration de la lettre en jaune, elle passe en mode 'present'
                setLetterStatuses(prev => ({
                    ...prev,
                    [randomLettre]: 'present'
                }));

                //Enregistrement de l'utilisation d'un indice
                setIndicesUtilises(prev => prev + 1);
            } else {
                //Si toutes les lettres sont trouvées
                setToastMessage("Vous avez déjà trouvé toutes les lettres !");
                setTimeout(() => setToastMessage(null), 2000);
            }
        };
         
        window.addEventListener('demande-indice', handleIndice);
        return () => window.removeEventListener('demande-indice', handleIndice);
    }, [letterStatuses, gameStatus, solution]);

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