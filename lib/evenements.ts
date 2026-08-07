/**
 * Noms des événements `window` qui font communiquer des composants voisins
 * (le bouton Indice et le tableau de score sont dans la page, la logique est
 * dans WordleGame). Les centraliser ici évite les fautes de frappe.
 */

/** Le joueur demande un indice. */
export const EVENEMENT_DEMANDE_INDICE = "demande-indice";

/** Les statistiques ont changé : le tableau de score se rafraîchit. */
export const EVENEMENT_MAJ_SCORE = "maj-score";
