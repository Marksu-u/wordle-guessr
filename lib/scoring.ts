/** Score d'une grille */

export const MAX_ESSAIS = 6;

const POINTS_VICTOIRE = 100;
const POINTS_PAR_ESSAIS_RESTANTS = 20;
const POINTS_PAR_LETTRE_SUPP = 15;
const MALUS_PAR_INDICE = 25;

export function calculerMaxIndices(wordLength: number): number {
    return Math.floor(wordLength / 2) + 1;
}

export type PartieTerminee = {
    gagne: boolean;
    essaisUtilises: number;
    indicesUtilises: number;
    longueurMot: number;
};

export function calculerScore(partie: PartieTerminee): number {
    if (!partie.gagne) return 0;
    
    const essaisRestants = Math.max(MAX_ESSAIS - partie.essaisUtilises, 0);
    const points = POINTS_VICTOIRE + essaisRestants * POINTS_PAR_ESSAIS_RESTANTS +
        Math.max(partie.longueurMot - 4, 0) * POINTS_PAR_LETTRE_SUPP -
        partie.indicesUtilises * MALUS_PAR_INDICE;

    return points;
}