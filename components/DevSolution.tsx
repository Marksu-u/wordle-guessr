"use client";

import { useState } from "react";

/**
 * Aide au test : révèle le mot du jour dans une bulle.
 * Absent du build de production (retirer la condition sur NODE_ENV si tu veux
 * aussi le voir en ligne).
 */
export default function DevSolution({ solution }: { solution: string }) {
    const [survol, setSurvol] = useState(false);
    const [epingle, setEpingle] = useState(false);
    const visible = survol || epingle;
    
    if (process.env.NODE_ENV === "production" || !solution) return null;

    return (
        <div className="fixed right-4 bottom-4 z-50 flex flex-col items-end gap-2">
            {visible && (
                <span className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 
                    font-mono text-sm font-black tracking-widest text-green-400 uppercase 
                    shadow-xl">
                    {solution}
                </span>
            )}

            <button
                onClick={() => setEpingle((prev) => !prev)}
                onMouseEnter={() => setSurvol(true)}
                onMouseLeave={() => setSurvol(false)}
                title="Révéler le mot du jour (dev)"
                className="flex h-8 w-8 items-center justify-center rounded-full border 
                border-zinc-700 bg-zinc-900 text-zinc-500 opacity-30 transition-opacity
                hover:opacity-100">
                
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.8}
                    stroke="currentColor"
                    className="h-4 w-4">
                
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638
                        0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 
                        19.5c-4.638 0-8.573-3.007-9.964-7.178z"/>
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
            </button>
        </div>        
    );
}