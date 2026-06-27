// Types partagés du jeu « Guessr ». Génériques (indépendants de CS2) pour
// réutilisation future (val, fifa-l1).

// Un joueur du pool. `achievements` est du texte d'affichage (révélation), jamais comparé.
export type Player = {
  name: string;
  nationality: string; // nom de pays → drapeau (lib/more-or-lessr/flags)
  current_team: string;
  previous_teams: string[]; // ensemble, comparaison partielle
  role: string[]; // rôles normalisés, comparaison partielle
  age: number;
  majors: number; // nb de Majors gagnés
  tournaments_won: number; // nb de tournois S-tier gagnés
  achievements: string[]; // texte affiché à la victoire
};

// Forme du JSON (app/data/cs2/guessr_players.json).
export type GuessrData = { game: string; players: Player[] };

// Résultat de couleur d'une cellule.
export type Match = "exact" | "partial" | "miss";

// Sens d'une comparaison numérique : la cible est-elle au-dessus / en-dessous / égale au guess ?
export type Direction = "up" | "down" | "equal";

// Résultat d'une colonne, discriminé par `kind` pour le rendu.
export type FieldResult =
  | { kind: "text"; match: Match; value: string }
  | { kind: "set"; match: Match; value: string[] }
  | { kind: "number"; match: Match; value: number; direction: Direction };

// Résultat complet d'une proposition (les 8 colonnes).
export type GuessResult = {
  player: Player;
  correct: boolean; // le nom correspond à la cible
  nationality: FieldResult;
  current_team: FieldResult;
  previous_teams: FieldResult;
  role: FieldResult;
  age: FieldResult;
  majors: FieldResult;
  tournaments_won: FieldResult;
};

// Écran courant : on joue, ou on a gagné. Essais illimités → pas de défaite.
export type Status = "playing" | "won";

export type GameState = {
  target: Player; // joueur du jour (caché)
  guesses: GuessResult[]; // plus récent en tête
  status: Status;
};
