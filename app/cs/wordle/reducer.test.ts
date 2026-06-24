import { describe, expect, it } from "vitest";
import { createInitialState, createWordleReducer } from "./reducer";
import { evaluateGuess } from "@/lib/wordle/engine";
import type { BoardState, WordleData, WordleState } from "@/lib/wordle/types";

const data: WordleData = {
  game: "test",
  words: { "3": ["CAT", "DOG", "BAT"], "4": ["ROPZ", "DONK"] },
};
const reducer = createWordleReducer(data);

function board(target: string, over: Partial<BoardState> = {}): BoardState {
  return {
    target,
    length: target.length,
    guesses: [],
    evaluations: [],
    current: "",
    status: "playing",
    invalid: false,
    ...over,
  };
}
function stateOf(b: BoardState): WordleState {
  return { activeLength: b.length, boards: { [b.length]: b } };
}

describe("createInitialState", () => {
  it("crée le board de la longueur par défaut", () => {
    const s = createInitialState(data, 4);
    expect(s.activeLength).toBe(4);
    expect(s.boards[4].status).toBe("playing");
    expect(data.words["4"]).toContain(s.boards[4].target);
  });
});

describe("reducer", () => {
  it("KEY_INPUT ajoute le caractère en majuscule", () => {
    const s = reducer(stateOf(board("CAT")), { type: "KEY_INPUT", char: "c" });
    expect(s.boards[3].current).toBe("C");
  });

  it("KEY_INPUT ignoré quand la saisie est pleine", () => {
    const s = reducer(stateOf(board("CAT", { current: "DOG" })), {
      type: "KEY_INPUT",
      char: "X",
    });
    expect(s.boards[3].current).toBe("DOG");
  });

  it("KEY_INPUT ignoré quand la partie est finie", () => {
    const s = reducer(stateOf(board("CAT", { status: "won" })), {
      type: "KEY_INPUT",
      char: "X",
    });
    expect(s.boards[3].current).toBe("");
  });

  it("DELETE retire le dernier caractère", () => {
    const s = reducer(stateOf(board("CAT", { current: "CA" })), {
      type: "DELETE",
    });
    expect(s.boards[3].current).toBe("C");
  });

  it("SUBMIT incomplet → invalid, aucun essai consommé", () => {
    const s = reducer(stateOf(board("CAT", { current: "CA" })), {
      type: "SUBMIT",
    });
    expect(s.boards[3].invalid).toBe(true);
    expect(s.boards[3].guesses).toHaveLength(0);
  });

  it("SUBMIT mot inconnu → invalid", () => {
    const s = reducer(stateOf(board("CAT", { current: "XYZ" })), {
      type: "SUBMIT",
    });
    expect(s.boards[3].invalid).toBe(true);
    expect(s.boards[3].guesses).toHaveLength(0);
  });

  it("SUBMIT correct → won", () => {
    const s = reducer(stateOf(board("CAT", { current: "CAT" })), {
      type: "SUBMIT",
    });
    expect(s.boards[3].status).toBe("won");
    expect(s.boards[3].guesses).toEqual(["CAT"]);
    expect(s.boards[3].current).toBe("");
  });

  it("SUBMIT valide mais faux (pas le 6e) → playing", () => {
    const s = reducer(stateOf(board("CAT", { current: "DOG" })), {
      type: "SUBMIT",
    });
    expect(s.boards[3].status).toBe("playing");
    expect(s.boards[3].guesses).toHaveLength(1);
  });

  it("SUBMIT du 6e essai faux → lost", () => {
    const prior = ["DOG", "BAT", "DOG", "BAT", "DOG"];
    const start = stateOf(
      board("CAT", {
        current: "BAT",
        guesses: prior,
        evaluations: prior.map((g) => evaluateGuess(g, "CAT")),
      }),
    );
    const s = reducer(start, { type: "SUBMIT" });
    expect(s.boards[3].status).toBe("lost");
    expect(s.boards[3].guesses).toHaveLength(6);
  });

  it("SELECT_LENGTH crée le board manquant et conserve l'existant", () => {
    const start: WordleState = {
      activeLength: 3,
      boards: { 3: board("CAT", { current: "CA" }) },
    };
    const s = reducer(start, { type: "SELECT_LENGTH", length: 4 });
    expect(s.activeLength).toBe(4);
    expect(s.boards[4].status).toBe("playing");
    expect(data.words["4"]).toContain(s.boards[4].target);
    expect(s.boards[3].current).toBe("CA");
  });

  it("SELECT_LENGTH vers un board existant ne le recrée pas", () => {
    const start: WordleState = {
      activeLength: 4,
      boards: { 3: board("CAT", { current: "CA" }), 4: board("ROPZ") },
    };
    const s = reducer(start, { type: "SELECT_LENGTH", length: 3 });
    expect(s.boards[3].target).toBe("CAT");
    expect(s.boards[3].current).toBe("CA");
  });

  it("REPLAY réinitialise le board avec un nouveau mot", () => {
    const start = stateOf(
      board("CAT", {
        guesses: ["CAT"],
        evaluations: [evaluateGuess("CAT", "CAT")],
        status: "won",
      }),
    );
    const s = reducer(start, { type: "REPLAY" });
    expect(s.boards[3].status).toBe("playing");
    expect(s.boards[3].guesses).toHaveLength(0);
    expect(s.boards[3].current).toBe("");
    expect(data.words["3"]).toContain(s.boards[3].target);
  });

  it("CLEAR_INVALID remet le flag à false", () => {
    const s = reducer(stateOf(board("CAT", { invalid: true })), {
      type: "CLEAR_INVALID",
    });
    expect(s.boards[3].invalid).toBe(false);
  });
});
