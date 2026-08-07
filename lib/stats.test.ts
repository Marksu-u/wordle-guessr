import { describe, expect, it } from "vitest";
import {
  enregistrerPartie,
  scoreDuJour,
  serieApresVictoire,
  serieEffective,
  statsParDefaut,
} from "./stats";

const victoire = (date: string, score = 100) => ({ date, gagne: true, score });
const defaite = (date: string) => ({ date, gagne: false, score: 0 });

describe("serieEffective", () => {
  it("se maintient le jour même et le lendemain, puis retombe à 0", () => {
    const stats = enregistrerPartie(statsParDefaut(), victoire("2026-08-03"));
    expect(serieEffective(stats, "2026-08-03")).toBe(1);
    expect(serieEffective(stats, "2026-08-04")).toBe(1);
    expect(serieEffective(stats, "2026-08-05")).toBe(0);
  });

  it("vaut 0 sans aucune victoire", () => {
    expect(serieEffective(statsParDefaut(), "2026-08-04")).toBe(0);
  });
});

describe("serieApresVictoire", () => {
  it("annonce la série qu'aura le joueur s'il gagne aujourd'hui", () => {
    const stats = enregistrerPartie(statsParDefaut(), victoire("2026-08-03"));
    expect(serieApresVictoire(stats, "2026-08-04")).toBe(2); // lendemain
    expect(serieApresVictoire(stats, "2026-08-03")).toBe(1); // déjà gagné
    expect(serieApresVictoire(stats, "2026-08-10")).toBe(1); // série cassée
  });
});

describe("enregistrerPartie", () => {
  it("incrémente la série sur des jours consécutifs", () => {
    let stats = statsParDefaut();
    stats = enregistrerPartie(stats, victoire("2026-08-01"));
    stats = enregistrerPartie(stats, victoire("2026-08-02"));
    stats = enregistrerPartie(stats, victoire("2026-08-03"));
    expect(stats.serieActuelle).toBe(3);
    expect(stats.meilleureSerie).toBe(3);
  });

  it("repart à 1 après un jour sauté", () => {
    let stats = statsParDefaut();
    stats = enregistrerPartie(stats, victoire("2026-08-01"));
    stats = enregistrerPartie(stats, victoire("2026-08-05"));
    expect(stats.serieActuelle).toBe(1);
    expect(stats.meilleureSerie).toBe(1);
  });

  it("additionne les points de la journée, une seule série par jour", () => {
    let stats = statsParDefaut();
    stats = enregistrerPartie(stats, victoire("2026-08-01", 100));
    stats = enregistrerPartie(stats, victoire("2026-08-01", 50));
    expect(stats.serieActuelle).toBe(1);
    expect(scoreDuJour(stats, "2026-08-01")).toBe(150);
  });

  it("remet le score à zéro le lendemain mais garde le record", () => {
    let stats = statsParDefaut();
    stats = enregistrerPartie(stats, victoire("2026-08-01", 120));
    stats = enregistrerPartie(stats, victoire("2026-08-02", 80));
    expect(scoreDuJour(stats, "2026-08-02")).toBe(80);
    expect(stats.meilleurScore).toBe(120);
  });

  it("ne casse pas la série si une autre longueur est gagnée le même jour", () => {
    let stats = statsParDefaut();
    stats = enregistrerPartie(stats, victoire("2026-08-01"));
    stats = enregistrerPartie(stats, defaite("2026-08-02"));
    expect(stats.serieActuelle).toBe(1);
    stats = enregistrerPartie(stats, victoire("2026-08-02"));
    expect(stats.serieActuelle).toBe(2);
  });

  it("compte les parties jouées et les victoires", () => {
    let stats = statsParDefaut();
    stats = enregistrerPartie(stats, victoire("2026-08-01"));
    stats = enregistrerPartie(stats, defaite("2026-08-01"));
    expect(stats.partiesJouees).toBe(2);
    expect(stats.victoires).toBe(1);
  });
});
