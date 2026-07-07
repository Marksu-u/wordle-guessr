import { describe, it, expect } from "vitest";
import { pickDailyWord, evaluateGuess, isWinningGuess } from "./wordle";

describe("pickDailyWord", () => {
  it("retourne toujours le même mot pour la même date", () => {
    const words = ["KEN", "ASH", "RAZ"];
    const date = new Date("2026-07-07T10:00:00Z");

    const first = pickDailyWord(words, date);
    const second = pickDailyWord(words, date);

    expect(first).toBe(second);
  });

  it("retourne un mot qui fait partie de la liste", () => {
    const words = ["KEN", "ASH", "RAZ"];
    const word = pickDailyWord(words, new Date("2026-07-07"));

    expect(words).toContain(word);
  });

  it("lève une erreur si la liste est vide", () => {
    expect(() => pickDailyWord([], new Date())).toThrow();
  });
});

describe("evaluateGuess", () => {
  it("marque toutes les lettres 'correct' si l'essai est identique au mot", () => {
    const result = evaluateGuess("ZEKKEN", "ZEKKEN");

    expect(result.every((r) => r.status === "correct")).toBe(true);
  });

  it("marque une lettre 'present' si elle existe ailleurs dans le mot", () => {
    // "RAZ" à deviner, on propose "ZAR" : mêmes lettres, mauvais ordre
    const result = evaluateGuess("ZAR", "RAZ");

    expect(result[0]).toEqual({ letter: "Z", status: "present" });
    expect(result[1]).toEqual({ letter: "A", status: "correct" });
    expect(result[2]).toEqual({ letter: "R", status: "present" });
  });

  it("marque une lettre 'absent' si elle n'existe pas dans le mot", () => {
    const result = evaluateGuess("XYZ", "KEN");

    expect(result.every((r) => r.status === "absent")).toBe(true);
  });

  it("gère correctement les lettres en double (piège classique du Wordle)", () => {
    // Mot à deviner : "JINGGG" (3 G, aux positions 3, 4, 5)
    const result = evaluateGuess("GINGGG", "JINGGG");

    // position 0 : G proposé vs J attendu -> pas "correct" au premier passage
    // positions 3,4,5 : G vs G -> "correct", ce qui consomme les 3 G disponibles
    // il ne reste alors plus aucun G "libre" pour le G de la position 0,
    // qui doit donc être "absent" (et surtout pas "present")
    expect(result[0]).toEqual({ letter: "G", status: "absent" });
    expect(result[3].status).toBe("correct");
    expect(result[4].status).toBe("correct");
    expect(result[5].status).toBe("correct");
  });

  it("lève une erreur si les longueurs ne correspondent pas", () => {
    expect(() => evaluateGuess("AB", "ABC")).toThrow();
  });
});

describe("isWinningGuess", () => {
  it("retourne true si toutes les lettres sont correctes", () => {
    const result = evaluateGuess("ASH", "ASH");
    expect(isWinningGuess(result)).toBe(true);
  });

  it("retourne false si au moins une lettre est incorrecte", () => {
    const result = evaluateGuess("ASK", "ASH");
    expect(isWinningGuess(result)).toBe(false);
  });
});
