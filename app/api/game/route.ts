import { NextResponse } from 'next/server';
import wordsData from '../../data/ligue1/wordle.json';
import { compareWords } from '../../../lib/compare';

//Variable qui change à chaque fois
let MotServeur = "";

//Fonction
function selectionNouveauMot(length: string = "5"){
  const wordsByLength = wordsData.words as Record<string, string[]>;
  const listeMots = wordsByLength[length] || wordsData.words["5"];

  const randomIndex = Math.floor(Math.random()*listeMots.length);
  MotServeur = listeMots[randomIndex].toUpperCase();
  console.log("[BACKEND] Nouveau mot secret généré :", MotServeur);
}

selectionNouveauMot("5");

//Démarrage ou reinitialisation du jeu
export async function GET(request: Request){
const { searchParams } = new URL(request.url);
const length = searchParams.get('length') || "5";

  selectionNouveauMot();
  return NextResponse.json({ success: true, message: "Nouvelle partie lancée en ${length} lettres."});
}

//Fonction pour valider le mot
export async function POST(request: Request) {
  try {
    // Le Front (ton composant) envoie un mot au serveur, ex: { guess: "LYONS" }
    const body = await request.json();
    const { guess, isLastAttempt } = body; 

    // Sécurité : Si le mot reçu n'a pas la bonne taille
    if (!guess || guess.length !== MotServeur.length) {
      return NextResponse.json(
        { error: `Le mot doit faire exactement ${MotServeur.length} lettres.` }, 
        { status: 400 }
      );
    }

    // On utilise ta fonction pure de lib/compare.ts pour analyser les lettres
    const evaluation = compareWords(guess, MotServeur);
    
    // On vérifie si le joueur a trouvé le mot exact
    const isWon = guess.toUpperCase() === MotServeur;

    const solutionWord = (isWon || isLastAttempt) ? MotServeur : "";

    // On renvoie la réponse au format JSON au navigateur
    return NextResponse.json({
      evaluation, // Renvoie un tableau du style : ['correct', 'present', 'absent', 'absent', 'correct']
      isWon,       // Renvoie true ou false
      solution: solutionWord
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
