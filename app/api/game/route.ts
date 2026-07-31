import { NextResponse } from 'next/server';
import motsJson from '@/app/data/ligue1/wordle.json';


const MotsServeur = motsJson.words as Record<string, string[]>;

//Démarrage ou reinitialisation du jeu
export async function GET(request: Request){
  const { searchParams } = new URL(request.url);
  const length = searchParams.get('length') || "5";

  //Recuperation de la liste des mots en fonction de la taille
  const listeDeMots = MotsServeur[length];

  if (!listeDeMots || listeDeMots.length === 0) {
    return NextResponse.json({ error: "Taille non supportée"}, { status: 400 });
  }

  //Pioche du mot au hasard
  const motAleatoire = listeDeMots[Math.floor(Math.random() * listeDeMots.length)];

  //Envoie du mot pioché
  return NextResponse.json({ secret: motAleatoire });
}
