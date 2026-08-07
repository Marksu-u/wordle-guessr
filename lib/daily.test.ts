import { describe, expect, it } from "vitest";
import {
  ajouterJours,
  dateDuJour,
  estLeLendemain,
  formaterDuree,
  motDuJour,
  msAvantProchainMot,
  numeroDuJour,
} from "./daily";

const LISTE = ["ABDI", "BAYO", "DIOP", "FAYE", "SARR"];

describe("dateDuJour", () => {
  it("utilise le fuseau du jeu, pas celui du visiteur", () => {
    // 22h30 UTC le 3 août = 00h30 le 4 août à Paris (heure d'été).
    expect(dateDuJour(new Date("2026-08-03T22:30:00Z"))).toBe("2026-08-04");
    expect(dateDuJour(new Date("2026-08-03T21:30:00Z"))).toBe("2026-08-03");
  });
});

describe("ajouterJours", () => {
  it("gère les changements de mois et d'année", () => {
    expect(ajouterJours("2026-01-01", -1)).toBe("2025-12-31");
    expect(ajouterJours("2026-02-28", 1)).toBe("2026-03-01");
    // Nuit du changement d'heure : pas de décalage parasite.
    expect(ajouterJours("2026-03-28", 1)).toBe("2026-03-29");
  });
});

describe("estLeLendemain", () => {
  it("reconnaît deux jours consécutifs", () => {
    expect(estLeLendemain("2026-08-03", "2026-08-04")).toBe(true);
    expect(estLeLendemain("2026-08-02", "2026-08-04")).toBe(false);
    expect(estLeLendemain("2026-08-04", "2026-08-04")).toBe(false);
  });
});

describe("numeroDuJour", () => {
  it("compte les jours depuis l'origine", () => {
    expect(numeroDuJour("2026-01-01")).toBe(0);
    expect(numeroDuJour("2026-01-02")).toBe(1);
  });
});

describe("motDuJour", () => {
  it("donne le même mot à tout le monde pour une date donnée", () => {
    expect(motDuJour(LISTE, "2026-08-04")).toBe(motDuJour(LISTE, "2026-08-04"));
    expect(LISTE).toContain(motDuJour(LISTE, "2026-08-04"));
  });

  it("ne répète aucun mot avant d'avoir épuisé la liste", () => {
    const mots = Array.from({ length: LISTE.length }, (_, i) =>
      motDuJour(LISTE, ajouterJours("2026-08-04", i)),
    );
    expect(new Set(mots).size).toBe(LISTE.length);
  });

  it("ne suit pas l'ordre alphabétique de la liste", () => {
    expect(motDuJour(LISTE, "2026-08-05")).not.toBe(
      LISTE[LISTE.indexOf(motDuJour(LISTE, "2026-08-04")) + 1],
    );
  });

  it("refuse une liste vide", () => {
    expect(() => motDuJour([], "2026-08-04")).toThrow();
  });
});

describe("msAvantProchainMot", () => {
  it("compte jusqu'à minuit dans le fuseau du jeu", () => {
    // 21h59:59 UTC = 23h59:59 à Paris en été.
    expect(msAvantProchainMot(new Date("2026-08-04T21:59:59Z"))).toBe(1000);
    // 22h00 UTC = minuit pile à Paris : 24 h à attendre.
    expect(msAvantProchainMot(new Date("2026-08-04T22:00:00Z"))).toBe(
      86_400_000,
    );
  });
});

describe("formaterDuree", () => {
  it("affiche HH:MM:SS", () => {
    expect(formaterDuree(0)).toBe("00:00:00");
    expect(formaterDuree(3_661_000)).toBe("01:01:01");
    expect(formaterDuree(-5000)).toBe("00:00:00");
  });
});
