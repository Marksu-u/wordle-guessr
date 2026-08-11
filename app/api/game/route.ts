import { NextResponse } from "next/server";
import motsJson from "@/app/data/ligue1/wordle.json";
import {
  dateDuJour,
  motDuJour,
  msAvantProchainMot,
  numeroDuJour,
  type ReponseMotDuJour,
} from "@/lib/daily";

const MotsServeur = motsJson.words as Record<string, string[]>;

// Le mot dépend de l'heure : pas de pré-rendu au build.
export const dynamic = "force-dynamic";

/**
 * Mot du jour pour une longueur donnée. Il n'est pas tiré au hasard mais
 * calculé à partir de la date : tous les joueurs ont la même grille.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const longueur = searchParams.get("length") ?? "5";

  const listeDeMots = MotsServeur[longueur];
  if (!listeDeMots || listeDeMots.length === 0) {
    return NextResponse.json(
      { error: "Taille non supportée" },
      { status: 400 },
    );
  }

  const date = dateDuJour();
  const reponse: ReponseMotDuJour = {
    secret: motDuJour(listeDeMots, date),
    longueur: Number(longueur),
    date,
    numero: numeroDuJour(date),
  };

  return NextResponse.json(reponse, {
    headers: {
      // Inutile de redemander le mot avant le prochain changement.
      "Cache-Control": `public, max-age=${Math.floor(msAvantProchainMot() / 1000)}`,
    },
  });
}