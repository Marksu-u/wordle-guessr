export type LettreStatut = 'correct' | 'absent' | 'present';

//Comparaison du mot proposé avec la solution, lettre par lettre
export function compareWords(guess: string, solution: string):
LettreStatut[] {
    const size = solution.length;
    //Initialisation de toutes les lettres à l'état 'absent'
    const results: LettreStatut[] = Array(size).fill('absent');

    //Éviter les doublons de jaune
    const solutionLettres = solution.split('');
    const guessLettres = guess.split('');

    //1e passage : Recherche des lettres bien placées (Vert)
    for (let i = 0; i<size; i++) {
        if (guessLettres[i] === solutionLettres[i]){
            results[i] = 'correct';
            solutionLettres[i] = '_'; //effacement de la lettre pour ne pas la recompter
            guessLettres[i] = ''; //la variable est vidée pour le passage suivant
        }
    }

    //2e passage : Recherche des lettres mal placées (Jaune)
    for (let i = 0; i<size; i++) {
        if (guessLettres[i] === '') continue; //on passe les lettres déjà vertes

        const indexSolution = solutionLettres.indexOf(guessLettres[i]);
        if (indexSolution !== -1) {
            results[i] = 'present';
            solutionLettres[indexSolution] = '_';
        }
    }

    return results;
}
