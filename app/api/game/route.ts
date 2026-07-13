import { NextResponse } from 'next/server';
import wordsData from '../../data/ligue1/wordle.json';
import { compareWords } from '../../../lib/compare';


const Longueur_imposée = 5;

//Choix aleatoire du mot de 5 lettres
const motsde5Lettres = wordsData.words["5"];

//Pioche d'un mot au hasard
const MotServeur = motsde5Lettres[Math.floor(Math.random()*motsde5Lettres.length)];


console.log("[BACKEND] Le mot est : ", MotServeur);

//Route API
//Fonction appelée par le front
export async function POST(request: Request) {
  try {
    // Le Front (ton composant) envoie un mot au serveur, ex: { guess: "LYONS" }
    const body = await request.json();
    const { guess } = body; 

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

    // On renvoie la réponse au format JSON au navigateur
    return NextResponse.json({
      evaluation, // Renvoie un tableau du style : ['correct', 'present', 'absent', 'absent', 'correct']
      isWon       // Renvoie true ou false
    });

  } catch (error) {
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
  }
}
