/**
 * Sauvegarde des grilles en cours dans le localStorage
 * Une grille par jour est conservée
 */

import type { LettreStatut } from "./compare";


//Sécurité : mise en variables des variables localStorage
export const CLE_PARTIES = "ligue1-parties";
export const CLE_DERNIERE_TAILLE = "ligue1-derniere-taille";
export const CLE_HISTORIQUE = "ligue1-historique";
export const CLE_STATS = "ligue1-stats";

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

export type StatsGlobales = {
    partiesJouees: number;
    victoires: number;
    record: number;
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

// -- GESTION DE L'HISTORIQUE -- 
//Lecture de l'historique
export function lireHistorique(): Record<string, number> {
    if (typeof window === "undefined") return {};
    try {
        const brut = window.localStorage.getItem(CLE_HISTORIQUE);
        return brut ? JSON.parse(brut) : {};
    } catch {
        return {};
    }
}

// -- GESTION DES STATS GLOBALES --
export function lireStatsGlobales(): StatsGlobales | null {
    if (typeof window === "undefined") return null;
    try {
        const brut = window.localStorage.getItem(CLE_STATS);
        return brut ? (JSON.parse(brut) as StatsGlobales) : null;
    } catch {
        return null;
    }
}

export function ecrireStatsGlobales(stats: StatsGlobales): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(CLE_STATS, JSON.stringify(stats));
    } catch {
        console.error("Erreur de sauvegarde des statistiques");
    }
}

//Sauvegarde de l'historique mis à jour
export function ecrireHistorique(historique: Record<string, number>): void {
    if (typeof window === "undefined") return;
    try {
        window.localStorage.setItem(CLE_HISTORIQUE, JSON.stringify(historique));
    } catch {
        console.error("Erreur de sauvegarde de l'historique");
    }
}