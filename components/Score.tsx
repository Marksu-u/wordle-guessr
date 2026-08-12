"use client";

import { useEffect, useState } from 'react';
import { dateDuJour } from "@/lib/daily";
import { EVENEMENT_MAJ_SCORE } from "@/lib/events";
import { lireHistorique } from "@/lib/sauvegarde";


export default function Score() {
    
    const [pointsDuJour, setPointsDuJour] = useState(0);
    const [record, setRecord] = useState(0);
    const [victoires, setVictoires] = useState(0);
    const [partiesJouees, setPartiesJouees] = useState(0);

    useEffect(() => {
        const rafraichir = () => {
            const aujourdhui = dateDuJour();
            const historique = lireHistorique();
            const scores = Object.values(historique);

            setPointsDuJour(historique[aujourdhui] || 0);
            setRecord(scores.length > 0 ? Math.max(...scores) : 0);
            setPartiesJouees(scores.length);

            setVictoires(scores.filter(score => score > 0).length);
        };

    rafraichir();
    window.addEventListener(EVENEMENT_MAJ_SCORE, rafraichir);
    return () => window.removeEventListener(EVENEMENT_MAJ_SCORE, rafraichir);
  }, []);
    

    return (
        <div className="flex w-full max-w-[240px] flex-col gap-4">
            <div>
                <span className="mb-2 block font-mono text-xs tracking-widest text-zinc-400 uppercase">
                    Score du jour
                </span>

                <div className="flex items-baseline gap-2 rounded-2xl bg-blue-600 px-6 py-2  ring-2 
                ring-blue-400">
                    <span className="font-mono text-2xl font-black text-white">
                        {pointsDuJour}
                    </span>
                    <span className="font-mono text-xs text-blue-100">PTS</span>
                </div>
            </div>

            <dl className="rounded-xl border border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs text-zinc-400">
                <div className="flex justify-between">
                    <dt>Record de points </dt>
                    <dd className="font-bold text-white"> {record}</dd>
                </div>
                <div className="flex justify-between">
                    <dt>Victoires </dt>
                    <dd className="font-bold text-white">
                        {victoires}/{partiesJouees}
                    </dd>
                </div>
            </dl>
        </div>
    );
}