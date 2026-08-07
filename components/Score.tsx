"use client";

import { useEffect, useState } from "react";
import { dateDuJour } from "@/lib/daily";
import { EVENEMENT_MAJ_SCORE } from "@/lib/evenements";
import { multiplicateurSerie } from "@/lib/scoring";
import {
  lireStats,
  scoreDuJour,
  serieEffective,
  statsParDefaut,
  type StatsJoueur,
} from "@/lib/stats";

/** Score du jour, série en cours et records du joueur. */
export default function Score() {
  // On part des stats vides : le localStorage n'existe pas côté serveur, et
  // lire dans un effet évite toute différence entre serveur et client.
  const [stats, setStats] = useState<StatsJoueur>(statsParDefaut);
  const [aujourdhui, setAujourdhui] = useState<string | null>(null);

  useEffect(() => {
    const rafraichir = () => {
      setStats(lireStats());
      setAujourdhui(dateDuJour());
    };

    rafraichir();
    window.addEventListener(EVENEMENT_MAJ_SCORE, rafraichir);
    return () => window.removeEventListener(EVENEMENT_MAJ_SCORE, rafraichir);
  }, []);

  const serie = aujourdhui ? serieEffective(stats, aujourdhui) : 0;
  const points = aujourdhui ? scoreDuJour(stats, aujourdhui) : 0;

  return (
    <div className="flex w-full max-w-[240px] flex-col gap-4">
      <div>
        <span className="mb-2 block font-mono text-xs tracking-widest text-zinc-400 uppercase">
          Score du jour
        </span>
        <div className="flex items-baseline gap-2 rounded-2xl bg-blue-600 px-6 py-2 ring-2 ring-blue-400">
          <span className="font-mono text-2xl font-black text-white">
            {points}
          </span>
          <span className="font-mono text-xs text-blue-100">PTS</span>
        </div>
      </div>

      <div>
        <span className="mb-2 block font-mono text-xs tracking-widest text-zinc-400 uppercase">
          Série en cours
        </span>
        <div
          className={`flex items-baseline gap-2 rounded-2xl px-6 py-2 ring-2 ${
            serie > 0
              ? "bg-orange-600 ring-orange-400"
              : "bg-zinc-800 ring-zinc-700"
          }`}
        >
          <span className="font-mono text-2xl font-black text-white">
            {serie > 0 ? `${serie} 🔥` : "—"}
          </span>
          {serie > 0 && (
            <span className="font-mono text-xs text-orange-100">
              x{multiplicateurSerie(serie).toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <dl className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 font-mono text-xs text-zinc-400">
        <div className="flex justify-between">
          <dt>Record de points</dt>
          <dd className="font-bold text-white">{stats.meilleurScore}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Meilleure série</dt>
          <dd className="font-bold text-white">{stats.meilleureSerie}</dd>
        </div>
        <div className="flex justify-between">
          <dt>Victoires</dt>
          <dd className="font-bold text-white">
            {stats.victoires}/{stats.partiesJouees}
          </dd>
        </div>
      </dl>
    </div>
  );
}
