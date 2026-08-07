/**
 * Sauvegarde des grilles en cours dans le cache du navigateur.
 *
 * Une seule journée est conservée : si la sauvegarde ne porte pas la date du
 * jour, on repart de grilles vierges. C'est ce qui empêche de rejouer hier.
 */

import type { LettreStatut } from "./compare";

export const CLE_PARTIES = "ligue1-parties";
export const CLE_DERNIERE_TAILLE = "ligue1-derniere-taille";

export type StatutPartie = "playing" | "won" | "lost";

export type EtatPartie = {
  essais: string[];
  evaluations: LettreStatut[][];
  statutsLettres: Record<string, LettreStatut>;
  statut: StatutPartie;
  solution: string;
  indicesUtilises: number;
  /** Points gagnés, une fois la grille terminée. */
  score: number | null;
};

export type SauvegardeDuJour = {
  date: string;
  /** Une grille par longueur de mot. */
  parties: Record<number, EtatPartie>;
};

export function partieVierge(solution: string): EtatPartie {
  return {
    essais: [],
    evaluations: [],
    statutsLettres: {},
    statut: "playing",
    solution,
    indicesUtilises: 0,
    score: null,
  };
}

/**
 * Lit la sauvegarde, et la jette si elle date d'un autre jour.
 * (Bug d'origine : la date était écrite sous une clé mal orthographiée, donc la
 * remise à zéro quotidienne ne se déclenchait jamais.)
 */
export function lireSauvegarde(dateDuJour: string): SauvegardeDuJour {
  if (typeof window === "undefined") return { date: dateDuJour, parties: {} };
  try {
    const brut = window.localStorage.getItem(CLE_PARTIES);
    const sauvegarde = brut ? (JSON.parse(brut) as SauvegardeDuJour) : null;
    if (sauvegarde?.date !== dateDuJour || !sauvegarde.parties) {
      return { date: dateDuJour, parties: {} };
    }
    return sauvegarde;
  } catch {
    return { date: dateDuJour, parties: {} };
  }
}

export function ecrireSauvegarde(sauvegarde: SauvegardeDuJour): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_PARTIES, JSON.stringify(sauvegarde));
  } catch {
    // Cache plein ou indisponible : la partie continue, sans sauvegarde.
  }
}

export function lireDerniereTaille(parDefaut: number): number {
  if (typeof window === "undefined") return parDefaut;
  const taille = Number(window.localStorage.getItem(CLE_DERNIERE_TAILLE));
  return taille > 0 ? taille : parDefaut;
}

export function ecrireDerniereTaille(taille: number): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CLE_DERNIERE_TAILLE, String(taille));
}
