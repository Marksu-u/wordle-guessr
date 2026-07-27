import { NextResponse } from 'next/server';
import wordsData from '../../data/ligue1/wordle.json';
import { compareWords } from '../../../lib/compare';

//Dico qui retient un mot par taille 
let MotServeur: Record<string, string> = {};

//Fonction
function selectionNouveauMot(length: string){
  const wordsByLength = wordsData.words as Record<string, string[]>;
  const listeMots = wordsByLength[length] || wordsData.words["5"];

  const randomIndex = Math.floor(Math.random()*listeMots.length);
  MotServeur[length] = listeMots[randomIndex].toUpperCase();
  console.log("[BACKEND] Nouveau mot secret généré :", MotServeur[length]);
}

//Démarrage ou reinitialisation du jeu
export async function GET(request: Request){
const { searchParams } = new URL(request.url);
const length = searchParams.get('length') || "5";

  selectionNouveauMot(length);
  return NextResponse.json({ success: true, message: `Nouvelle partie lancée en ${length} lettres.`});
}

//Fonction pour valider le mot
export async function POST(request: Request) {
  try {
    // Le Front (ton composant) envoie un mot au serveur
    const body = await request.json();
    const { guess, isLastAttempt } = body;

    //Devine la taille de la grille en fonction du mot de la grille
    const currentLength = guess ? guess.length.toString() : "5";

    //Recup du mot secret à la taille specifique
    let motSecretActuel = MotServeur[currentLength];

    //Sécurité : si le serveur n'a plus le mot en mémoire, on le recrée
    if (!motSecretActuel){
      selectionNouveauMot(currentLength);
      motSecretActuel = MotServeur[currentLength];
    }

    // Sécurité 1 : Si le mot reçu n'a pas la bonne taille
    if (!guess || guess.length !== motSecretActuel.length) {
      return NextResponse.json(
        { error: `Le mot doit faire exactement ${motSecretActuel.length} lettres.` }, 
        { status: 400 }
      );
    }

    //Sécurité 2 : Si le mot n'existe pas dans la bdd
    const wordLengthStr = motSecretActuel.length.toString();
    const wordsByLength = wordsData.words as Record<string, string[]>;
    const listeMotsValides = wordsByLength[wordLengthStr] || [];

    //Recherche du mot dans la liste
    const isValidWord = listeMotsValides.some(
      (mot) => mot.toUpperCase() === guess.toUpperCase()
    );

    if (!isValidWord){
      return NextResponse.json(
        { error: "Mot introuvable dans la base de données"},
        { status: 400 }
      );
    }

    // On utilise ta fonction pure de lib/compare.ts pour analyser les lettres
    const evaluation = compareWords(guess, motSecretActuel);
    
    // On vérifie si le joueur a trouvé le mot exact
    const isWon = guess.toUpperCase() === motSecretActuel;

    const solutionWord = (isWon || isLastAttempt) ? motSecretActuel : "";

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
