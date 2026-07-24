"use client";

import { useEffect, useState } from 'react';

export default function Score() {
    const [meilleurScore, setMeilleurScore] = useState(0);

    useEffect(() => {

        const chargerScore = () => {
            const donneesSave = localStorage.getItem('ligue1-historique');
            if (donneesSave) {
                const historique = JSON.parse(donneesSave);
                const allScores = Object.values(historique).flat() as number[];
                if (allScores.length > 0) {
                    setMeilleurScore(Math.max(...allScores));
                }
            }
        };

        chargerScore();

        window.addEventListener('maj-score', chargerScore);

        return () => {
            window.removeEventListener('maj-score', chargerScore);
        };
    }, []);

    if (meilleurScore === 0) return null;

    return (
        <div className="flex flex-col items-start mb-4 mt-5">
            <span className="text-xs font-mono uppercase tracking-widest text-zinc-400 mb-2 ml-3">
                Record Personnel
            </span>
            <div className="flex items-center gap-2 bg-blue-600 px-6 py-2 rounded-2xl ring-2 
            ring-blue-400 shadow-sm ml-6">
                <span className="font-mono font-black text-white tracking-wider">
                    {meilleurScore} PTS
                </span>
            </div>
        </div>
    );
}