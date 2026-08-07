import { describe, expect, it } from "vitest";
import { calculerScore, multiplicateurSerie } from "./scoring";

const partieType = {
  gagne: true,
  essaisUtilises: 3,
  indicesUtilises: 0,
  longueurMot: 5,
  serie: 1,
};

describe("multiplicateurSerie", () => {
  it("démarre à x1, grimpe de 10 % par jour et plafonne à x2", () => {
    expect(multiplicateurSerie(0)).toBe(1);
    expect(multiplicateurSerie(1)).toBe(1);
    expect(multiplicateurSerie(5)).toBeCloseTo(1.4);
    expect(multiplicateurSerie(11)).toBeCloseTo(2);
    expect(multiplicateurSerie(500)).toBeCloseTo(2);
  });
});

describe("calculerScore", () => {
  it("ne donne aucun point en cas de défaite", () => {
    expect(calculerScore({ ...partieType, gagne: false, serie: 8 })).toBe(0);
  });

  it("récompense les victoires rapides", () => {
    expect(calculerScore({ ...partieType, essaisUtilises: 1 })).toBeGreaterThan(
      calculerScore({ ...partieType, essaisUtilises: 6 }),
    );
  });

  it("récompense les mots longs", () => {
    expect(calculerScore({ ...partieType, longueurMot: 8 })).toBeGreaterThan(
      calculerScore({ ...partieType, longueurMot: 4 }),
    );
  });

  it("pénalise les indices", () => {
    expect(calculerScore({ ...partieType, indicesUtilises: 2 })).toBe(
      calculerScore(partieType) - 50,
    );
  });

  it("multiplie le score par la série", () => {
    expect(calculerScore({ ...partieType, serie: 11 })).toBe(
      calculerScore({ ...partieType, serie: 1 }) * 2,
    );
  });
});
