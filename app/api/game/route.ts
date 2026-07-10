import { NextResponse } from 'next/server';
import wordsData from '../../data/ligue1/wordle.json';
//import { compareWords } from '../../lib/compare.ts';

//Choix aleatoire du mot 

const MotServeur5 = wordsData.words["5"];

console.log("[BACKEND] Le mot est : ", MotServeur5);

//Route API
//Fonction appelée par le front
/*export async function POST(request: Request){
    try {
        //Récupération de la reponse du joueur
        const body = await request.json();
        const { guess } = body;

        
//tout reverifier!!

    }
}*/
