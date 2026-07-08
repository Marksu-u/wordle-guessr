"use client";

// import de tous les components
import { useState } from 'react';
import Keyboard from './Keyboard';

interface WordleGameProps {
  solution?: string;
}

export default function WordleGame({ solution = 'PARIS' }: WordleGameProps) {
    const [currentGuess, setCurrentGuess] = useState('');

    const wordLength = solution.length;

    const handleKeyPress = (key: string) => {
        if (key === 'SUPPRIMER'){
            setCurrentGuess((prev) => prev.slice(0, -1));
        } 
        else if (key === 'ENTRER'){
            if (currentGuess.length === wordLength)
                console.log("Validation de :", currentGuess);
                if (currentGuess === solution) {
                    console.log("Gagné !");
        }
        }
        else {
            if (currentGuess.length < wordLength){
                setCurrentGuess((prev) => prev +key);
            }
        }
    };
    //Affichage
    return (
        <div className='flex flex-col items-center w-full'>
            <div className="my-8 p-4 bg-zinc-900 rounded-xl border border-zinc-700 w-full max-w-sm text-center">
                <p className="text-sm text-gray-400 mb-1 font-mono">PROPOSITION :</p>
                <p className="text-3xl font-mono tracking-widest uppercase font-bold text-white">
                    {currentGuess || '.....'}
                </p>
            </div>
            <Keyboard onKeyPress={handleKeyPress} />
        </div>
    );
}