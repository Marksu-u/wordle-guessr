import { compareGuess, norm } from "@/lib/guessr/compare";
import { randomTarget } from "@/lib/guessr/selection";
import type { GameState, GuessrData } from "@/lib/guessr/types";

export type GuessrAction =
  | { type: "GUESS"; name: string }
  | { type: "REPLAY" };

// État de départ : cible aléatoire, partie en cours, aucun guess.
export function createInitialState(data: GuessrData): GameState {
  return { target: randomTarget(data), guesses: [], status: "playing" };
}

// Factory : reducer fermé sur `data` → pur et testable.
export function createGuessrReducer(data: GuessrData) {
  return function reducer(state: GameState, action: GuessrAction): GameState {
    switch (action.type) {
      case "GUESS": {
        if (state.status !== "playing") return state;
        const guess = data.players.find((p) => norm(p.name) === norm(action.name));
        if (!guess) return state; // nom hors pool
        if (state.guesses.some((g) => norm(g.player.name) === norm(guess.name)))
          return state; // déjà proposé
        const result = compareGuess(guess, state.target);
        return {
          ...state,
          guesses: [result, ...state.guesses],
          status: result.correct ? "won" : "playing",
        };
      }

      // Nouvelle partie : nouvelle cible aléatoire, grille vidée.
      case "REPLAY":
        return createInitialState(data);

      default:
        return state;
    }
  };
}
