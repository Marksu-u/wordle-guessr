/**
 * Le "mot du jour".
 *
 * Règle : un mot par jour et par longueur, le MÊME pour tous les joueurs.
 * On ne tire donc rien au hasard : on calcule le mot à partir de la date.
 */

// Fuseau de référence : tout le monde change de mot au même moment.
export const FUSEAU_JEU = "Europe/Paris";

// Jour n°0 du jeu, pour numéroter les grilles ("Grille n°216").
export const JOUR_ORIGINE = "2026-01-01";

const MS_PAR_JOUR = 86_400_000;

/** Réponse de GET /api/game. */
export type ReponseMotDuJour = {
  secret: string;
  longueur: number;
  /** Date de jeu "AAAA-MM-JJ". */
  date: string;
  numero: number;
};

/** Date de jeu ("AAAA-MM-JJ") : "en-CA" formate déjà dans ce format. */
export function dateDuJour(maintenant: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: FUSEAU_JEU,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(maintenant);
}

function versUtc(dateIso: string): number {
  const [annee, mois, jour] = dateIso.split("-").map(Number);
  return Date.UTC(annee, mois - 1, jour);
}

/** ("2026-01-01", -1) -> "2025-12-31" */
export function ajouterJours(dateIso: string, jours: number): string {
  return new Date(versUtc(dateIso) + jours * MS_PAR_JOUR)
    .toISOString()
    .slice(0, 10);
}

export function estLeLendemain(veille: string, date: string): boolean {
  return ajouterJours(veille, 1) === date;
}

/** Numéro de la grille = nombre de jours depuis JOUR_ORIGINE. */
export function numeroDuJour(dateIso: string): number {
  return Math.round((versUtc(dateIso) - versUtc(JOUR_ORIGINE)) / MS_PAR_JOUR);
}

// On avance de 17 mots par jour dans la liste : comme 17 est premier (et ne
// divise aucune de nos listes), on passe par tous les mots avant d'en répéter
// un, sans suivre bêtement l'ordre alphabétique.
const PAS = 17;

/** Même date + même liste = même mot, pour tout le monde. */
export function motDuJour(liste: string[], dateIso: string): string {
  if (liste.length === 0) {
    throw new Error("Impossible de tirer un mot : la liste est vide");
  }
  const taille = liste.length;
  const index = (((numeroDuJour(dateIso) * PAS) % taille) + taille) % taille;
  return liste[index];
}

/**
 * Temps restant avant le prochain mot (minuit dans le fuseau du jeu).
 * Approximation d'une heure les deux jours de changement d'heure : sans
 * conséquence pour le jeu.
 */
export function msAvantProchainMot(maintenant: Date = new Date()): number {
  const [heures, minutes, secondes] = new Intl.DateTimeFormat("fr-FR", {
    timeZone: FUSEAU_JEU,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  })
    .format(maintenant)
    .split(":")
    .map(Number);

  return ((23 - heures) * 3600 + (59 - minutes) * 60 + (60 - secondes)) * 1000;
}

/** 25_269_000 -> "07:01:09" */
export function formaterDuree(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
