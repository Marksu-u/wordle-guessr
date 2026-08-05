/**
 * Sauvegarde des grilles en cours dans le localStorage
 * Une grille par jour est conservée
 */

import type { LettreStatut } from "./compare";


//Sécurité : mise en variables des variables localStorage
export const CLE_PARTIES = "ligue1-parties";
export const CLE_DERNIERE_TAILLE = "ligue1-dernieree-taille";

export type StatutPartie = "playing" | "won" | "lost";

export type EtatPartie = {
    essais: string[];
    evaluations: LettreStatut[][];
    statutsLettres: Record<string, LettreStatut>;
    statut: StatutPartie;
    solution: string;
    indicesUtilises: number;
    score: number | null;
};

export type SauvegardeDuJour = {
    date: string;
    parties: Record<string, EtatPartie>;
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
 * Verifie la sauvegarde et la jette si elle date d'un autre jour
 */
export function lireSauvegarde(dateDuJour: string): SauvegardeDuJour {
    if (typeof window === "undefined") return { date: dateDuJour, parties: {} };
    try {
        const brut = window.localStorage.getItem(CLE_PARTIES);
        const sauvegarde = brut ? (JSON.parse(brut) as SauvegardeDuJour) : null;
        if (sauvegarde?.date !== dateDuJour || sauvegarde.parties) {
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

    }
}

export function lireDernieretaille(parDefaut: number): number {
    if (typeof window === "undefined") return parDefaut;
    const taille = Number(window.localStorage.getItem(CLE_DERNIERE_TAILLE));
    return taille > 0 ? taille :  parDefaut;
}

export function ecrireDerniereTaille(taille: number): void {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(CLE_DERNIERE_TAILLE, String(taille));
}

