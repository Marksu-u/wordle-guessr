import { describe, expect, it } from "vitest";
import { compareWords } from "./compare";

describe("compareWords", () => {
  it("marque toutes les lettres du mot exact", () => {
    expect(compareWords("SARR", "SARR")).toEqual([
      "correct",
      "correct",
      "correct",
      "correct",
    ]);
  });

  it("distingue bien placé, mal placé et absent", () => {
    expect(compareWords("DIOP", "DOPE")).toEqual([
      "correct", // D
      "absent", // I
      "present", // O
      "present", // P
    ]);
  });

  it("ne colore pas deux fois une lettre présente une seule fois", () => {
    // Un seul A dans la solution : le A bien placé est vert, l'autre reste gris.
    expect(compareWords("AABC", "CABD")).toEqual([
      "absent", // A en trop
      "correct", // A
      "correct", // B
      "present", // C
    ]);
  });
});
