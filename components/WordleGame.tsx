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
            } 
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    //Relance de la partie si user clique sur bouton de taille
    const handleLengthChange = (newLength: number) => {
        if (isLoading) return;
        startNewGame(newLength);
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
                alert(`Le mot doit faire exactement ${wordLength} lettres.`);
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
                    alert(data.error || "Une erreur est survenue.");
                    return;
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

                //Fin de partie 
                if (data.isWon) {
                    setGameStatus('won');
                }   else if (newGuesses.length >= maxAttempts) {
                    setGameStatus('lost');
                    if (data.solution) {
                        setSolution(data.solution);
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
  
    //Affichage grille et selecteur taille
    return (
        <div className='flex flex-col items-center w-full p-4'>
            {/* SELECTEUR TAILLE MOT */}
            <div className='flex flex-col items-center mb-6 w-full'>
                <span className='text-xs font-mono uppercase tracking-wider text-zinc-400 mb-2'>
                    Longueur du mot :
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

            <WordleGrid
                guesses={guesses}
                currentGuess={currentGuess}
                wordLength={wordLength}
                evaluations={evaluations} // On passe directement les couleurs reçues du serveur !
                maxAttempts={maxAttempts}//prop appliquée à la grille 
            />

             {/* AFFICHAGE DU MOT CORRECT EN CAS DE DÉFAITE */}
             { gameStatus === 'lost' && (
                <div className='mb-4 p-3 bg-green-950/20 border border-green-800 rounded-xl text-center
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
                <div className="flex flex-col items-center gap-3 my-4 ">
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
            <Keyboard 
                onKeyPress={handleKeyPress} 
                letterStatuses={letterStatuses} 
            />
            
        </div>
    );
}