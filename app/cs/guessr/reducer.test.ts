import { describe, expect, it } from "vitest";
import { createGuessrReducer, createInitialState } from "./reducer";
import type { GuessrData, Player } from "@/lib/guessr/types";

function p(name: string, over: Partial<Player> = {}): Player {
  return {
    name,
    nationality: "France",
    current_team: "T",
    previous_teams: [],
    role: ["Rifler"],
    age: 25,
    majors: 0,
    tournaments_won: 0,
    achievements: [],
    ...over,
  };
}

const data: GuessrData = {
  game: "guessr",
  players: [p("ZywOo"), p("apEX"), p("ropz"), p("rain"), p("flameZ")],
};

const names = data.players.map((x) => x.name);

describe("createInitialState", () => {
  it("démarre en playing avec une cible du pool et zéro guess", () => {
    const s = createInitialState(data);
    expect(s.status).toBe("playing");
    expect(s.guesses).toEqual([]);
    expect(names).toContain(s.target.name);
  });
});

describe("reducer GUESS", () => {
  it("ignore un nom inconnu du pool", () => {
    const reducer = createGuessrReducer(data);
    const s0 = createInitialState(data);
    const s1 = reducer(s0, { type: "GUESS", name: "unknown_player" });
    expect(s1.guesses).toHaveLength(0);
  });

  it("ajoute le guess en tête et passe won si c'est la cible", () => {
    const reducer = createGuessrReducer(data);
    const s0 = createInitialState(data);
    const s1 = reducer(s0, { type: "GUESS", name: s0.target.name });
    expect(s1.guesses).toHaveLength(1);
    expect(s1.guesses[0].correct).toBe(true);
    expect(s1.status).toBe("won");
  });

  it("reste playing sur un mauvais guess, plus récent en tête", () => {
    const reducer = createGuessrReducer(data);
    const s0 = createInitialState(data);
    const wrong = data.players.find((x) => x.name !== s0.target.name)!;
    const s1 = reducer(s0, { type: "GUESS", name: wrong.name });
    expect(s1.status).toBe("playing");
    expect(s1.guesses[0].player.name).toBe(wrong.name);
  });

  it("ignore un doublon de proposition", () => {
    const reducer = createGuessrReducer(data);
    const s0 = createInitialState(data);
    const wrong = data.players.find((x) => x.name !== s0.target.name)!;
    const s1 = reducer(s0, { type: "GUESS", name: wrong.name });
    const s2 = reducer(s1, { type: "GUESS", name: wrong.name });
    expect(s2.guesses).toHaveLength(1);
  });

  it("n'accepte plus de guess après victoire", () => {
    const reducer = createGuessrReducer(data);
    const s0 = createInitialState(data);
    const won = reducer(s0, { type: "GUESS", name: s0.target.name });
    const after = reducer(won, { type: "GUESS", name: data.players[0].name });
    expect(after).toBe(won);
  });
});

describe("reducer REPLAY", () => {
  it("vide les guesses, repart en playing avec une cible du pool", () => {
    const reducer = createGuessrReducer(data);
    const s0 = createInitialState(data);
    const won = reducer(s0, { type: "GUESS", name: s0.target.name });
    const replay = reducer(won, { type: "REPLAY" });
    expect(replay.status).toBe("playing");
    expect(replay.guesses).toEqual([]);
    expect(names).toContain(replay.target.name);
  });
});
