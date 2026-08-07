/**
 * Statistiques du joueur (série + scores), gardées dans le cache du navigateur.
 * Pas de compte, pas de base : la "session" du joueur, c'est son navigateur.
 *
 * Les calculs sont des fonctions pures : testables sans navigateur.
 */

import { estLeLendemain } from "./daily";
import { EVENEMENT_MAJ_SCORE } from "./evenements";

export const CLE_STATS = "ligue1-stats";

export type StatsJoueur = {
  /** Jours consécutifs avec au moins une victoire. */
  serieActuelle: number;
  meilleureSerie: number;
  /** Dernier jour où le joueur a gagné au moins une grille. */
  dernierJourGagne: string | null;
  /** Jour du score en cours (les points s'additionnent sur la journée). */
  jourEnCours: string | null;
  scoreDuJour: number;
  meilleurScore: number;
  partiesJouees: number;
  victoires: number;
};

export function statsParDefaut(): StatsJoueur {
  return {
    serieActuelle: 0,
    meilleureSerie: 0,
    dernierJourGagne: null,
    jourEnCours: null,
    scoreDuJour: 0,
    meilleurScore: 0,
    partiesJouees: 0,
    victoires: 0,
  };
}

/**
 * La série affichée : elle retombe à 0 toute seule si la dernière victoire
 * date de plus d'un jour. Rien à nettoyer, on recalcule à la lecture.
 */
export function serieEffective(stats: StatsJoueur, date: string): number {
  const dernier = stats.dernierJourGagne;
  if (!dernier) return 0;
  return dernier === date || estLeLendemain(dernier, date)
    ? stats.serieActuelle
    : 0;
}

/** Série qu'aura le joueur s'il gagne aujourd'hui (le score en dépend). */
export function serieApresVictoire(stats: StatsJoueur, date: string): number {
  // Déjà gagné aujourd'hui sur une autre longueur : la série ne bouge plus.
  if (stats.dernierJourGagne === date) return Math.max(stats.serieActuelle, 1);
  return serieEffective(stats, date) + 1;
}

export function scoreDuJour(stats: StatsJoueur, date: string): number {
  return stats.jourEnCours === date ? stats.scoreDuJour : 0;
}

/** Applique le résultat d'une grille. Fonction pure. */
export function enregistrerPartie(
  stats: StatsJoueur,
  resultat: { date: string; gagne: boolean; score: number },
): StatsJoueur {
  const { date, gagne, score } = resultat;

  const serieActuelle = gagne
    ? serieApresVictoire(stats, date)
    : serieEffective(stats, date);
  const total = scoreDuJour(stats, date) + score;

  return {
    serieActuelle,
    meilleureSerie: Math.max(stats.meilleureSerie, serieActuelle),
    // Une défaite ne casse pas la série tout de suite : le joueur peut encore
    // gagner une autre longueur dans la journée.
    dernierJourGagne: gagne ? date : stats.dernierJourGagne,
    jourEnCours: date,
    scoreDuJour: total,
    meilleurScore: Math.max(stats.meilleurScore, total),
    partiesJouees: stats.partiesJouees + 1,
    victoires: stats.victoires + (gagne ? 1 : 0),
  };
}

// --- Cache du navigateur -----------------------------------------------------

export function lireStats(): StatsJoueur {
  if (typeof window === "undefined") return statsParDefaut();
  try {
    const brut = window.localStorage.getItem(CLE_STATS);
    // Le spread complète les champs manquants d'une vieille sauvegarde.
    return brut
      ? { ...statsParDefaut(), ...JSON.parse(brut) }
      : statsParDefaut();
  } catch {
    // Cache indisponible (navigation privée) ou JSON cassé.
    return statsParDefaut();
  }
}

export function ecrireStats(stats: StatsJoueur): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CLE_STATS, JSON.stringify(stats));
  } catch {
    // Perdre les stats ne doit jamais casser la partie en cours.
  }
}

/** Prévient le tableau de score qu'il doit se rafraîchir. */
export function notifierMajScore(): void {
  window.dispatchEvent(new Event(EVENEMENT_MAJ_SCORE));
}
