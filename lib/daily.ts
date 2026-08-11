/**
 * Permet d'avoir le mot du jour
 * Un mot par jour et par longueur pour TOUS les joueurs
 */

//Fuseau horaire de reference
export const FUSEAU_JEU = "Europe/Paris";

//Numerotation des grilles par rapport au jour
export const JOUR_ORIGINE = "2026-01-01";

const MS_PAR_JOUR = 86_400_000;

//Reponse de GET /api/game
export type ReponseMotDuJour = {
    secret: string;
    longueur: number;
    date: string;
    numero: number;
};

//Date du jeu formatée
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

//
export function ajouterJours(dateIso: string, jours: number): string {
    return new Date(versUtc(dateIso) + jours * MS_PAR_JOUR)
    .toISOString()
    .slice(0, 10);
}

export function estLeLendemain(veille: string, date: string): boolean {
    return ajouterJours(veille, 1) === date;
}

//Numero de la grille = nb de jours depuis JOUR_ORIGINE
export function numeroDuJour(dateIso: string): number {
    return Math.round((versUtc(dateIso) - versUtc(JOUR_ORIGINE)) / MS_PAR_JOUR);
}

/**On crée une liste aléeatoire de 17 mots, on choisit tous les mots de la liste sans ordre
 * alphabetique avant d'en créer une nouvelle 
 */
const PAS = 17;

//Meme date + meme liste = meme mot pour tout le monde
export function motDuJour(liste: string[], dateIso: string): string {
    if (liste.length === 0) {
      throw new Error("Impossible de tirer un mot : la liste est vide");  
    }
    const taille = liste.length;
    const index = (((numeroDuJour(dateIso)* PAS) % taille) + taille) % taille;
    return liste[index];
}

/** Temps restant avant le prochain mot à minuit */
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

//Changement des ms en date
export function formaterDuree(ms: number): string {
    const total = Math.max(0, Math.floor(ms / 1000));
    return [Math.floor(total / 3600), Math.floor((total % 3600) / 60), total % 60]
    .map((n) => String(n).padStart(2, "0"))
    .join(":");
}
