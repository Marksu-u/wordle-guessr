/**
 * Score d'une grille : on récompense la performance (peu d'essais, mot long,
 * pas d'indice) puis on multiplie par la série de jours consécutifs.
 */

export const MAX_ESSAIS = 6;
export const MAX_INDICES = 2;

const POINTS_VICTOIRE = 100;
const POINTS_PAR_ESSAI_RESTANT = 20;
const POINTS_PAR_LETTRE_SUPP = 15; // au-delà de 4 lettres
const MALUS_PAR_INDICE = 25;

/** La série ne multiplie plus le score au-delà de 10 jours (x2 maximum). */
const SERIE_MAX_BONUS = 10;

export type PartieTerminee = {
  gagne: boolean;
  essaisUtilises: number;
  indicesUtilises: number;
  longueurMot: number;
  /** Série EN COMPTANT le jour courant (1 = premier jour). */
  serie: number;
};

/** x1 le premier jour, +10 % par jour de série, plafonné à x2. */
export function multiplicateurSerie(serie: number): number {
  return 1 + Math.min(Math.max(serie - 1, 0), SERIE_MAX_BONUS) * 0.1;
}

export function calculerScore(partie: PartieTerminee): number {
  if (!partie.gagne) return 0;

  const essaisRestants = Math.max(MAX_ESSAIS - partie.essaisUtilises, 0);
  const points =
    POINTS_VICTOIRE +
    essaisRestants * POINTS_PAR_ESSAI_RESTANT +
    Math.max(partie.longueurMot - 4, 0) * POINTS_PAR_LETTRE_SUPP -
    partie.indicesUtilises * MALUS_PAR_INDICE;

  return Math.round(points * multiplicateurSerie(partie.serie));
}
