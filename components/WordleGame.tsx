"use client";
// corriger les erreurs avec derniere requete gemini
// import de tous les components
import { useState, useEffect } from 'react';
import WordleGrid from './WordleGrid';
import Keyboard from './Keyboard';

export default function WordleGame() {
    const wordLength = 5;

    // Etats du jeu
    const [guesses, setGuesses] = useState<string[]>([]);

    //Stockage des couleurs
    const [evaluations, setEvaluations] = useState<('correct' | 'present' | 'absent')[][]>([]);

    //Mot en cours de saisie
    const [currentGuess, setCurrentGuess] = useState('');

    const [letterStatuses, setLetterStatuses] = useState<{ [key: string]: 'correct' | 'present' | 'absent' }>({});
    const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
    
    //Blocage double-clic
    const [isLoading, setIsLoading] = useState(false);

    const startNewGame = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/game', { method: 'GET' });

            if (response.ok){
                setGuesses([]);
                setEvaluations([]);
                setCurrentGuess('');
                setLetterStatuses({});
                setGameStatus('playing');
            } else {
                alert("Impossible de générer un nouveau mot.");
            }
        } catch (error) {
            console.error("Erreur lors de la réalisation :", error);
        } finally {
            setIsLoading(false);
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
                alert('Le mot doit faire exactement ${wordleLength} lettres.');
                return;
            }

            try {
                //Envoi de la proposition de mot au serveur
                const response = await fetch('api/game', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ guess: currentGuess.toLocaleUpperCase() }),
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

                if (data.isWon) {
                    setGameStatus('won');
                    alert('Victoire!');
                }   else if (newGuesses.length >= 5) {
                    setGameStatus('lost');
                    alert('Défaite, les 5 essais sont épuisés.');
                }

                setCurrentGuess('');
            }   catch (error) {
                console.error("Erreur API :", error);
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
            if (gameStatus !== 'playing') return;

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
    }, [gameStatus, currentGuess, guesses]);
  
    //Affichage 
    return (
        <div className='flex flex-col items-center w-full p-6'>
            <WordleGrid
                guesses={guesses}
                currentGuess={currentGuess}
                wordLength={wordLength}
                evaluations={evaluations} // On passe directement les couleurs reçues du serveur !
            />

            {/*Affichage du bouton "Rejouer" en cas de partie terminée*/}
            {gameStatus !== 'playing' && (
                <div className="flex flex-col items-center gap-3 my-4 animate-bounce">
                    <p className="text-lg font-bold">
                        {gameStatus === 'won' ? 'Gagné ! ' : 'Dommage...'}
                    </p>
                    <button
                        onClick={startNewGame}
                        disabled={isLoading}
                        className="px-6 py-3 bg-green-600 hover:bg-green-500 
                        disabled:bg-zinc-700 text-white font-extrabold rounded-xl shadow-lg 
                        transition-all transform hover:scale-105 active:scale-95 uppercase font-mono tracking-wider"
                    >
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