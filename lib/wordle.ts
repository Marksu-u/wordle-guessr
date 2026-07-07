export type LetterStatus = "correct" | "present" | "absent";

export interface LetterResult {
  letter: string;
  status: LetterStatus;
}

/**
 * Choisit le pseudo du jour de façon déterministe : tout le monde qui joue
 * le même jour, pour la même longueur, obtient le même mot.
 * On utilise la date (YYYY-MM-DD) comme graine simple.
 */
export function pickDailyWord(
  words: string[],
  date: Date = new Date(),
): string {
  if (words.length === 0) {
    throw new Error("La liste de mots est vide");
  }

  const dateKey = date.toISOString().slice(0, 10); // ex: "2026-07-07"

  // Petit hash déterministe (pas besoin de crypto, juste stable)
  let hash = 0;
  for (let i = 0; i < dateKey.length; i++) {
    hash = (hash * 31 + dateKey.charCodeAt(i)) >>> 0;
  }

  const index = hash % words.length;
  return words[index];
}

/**
 * Compare une proposition (guess) au mot à deviner (answer), lettre par lettre.
 * Gère les lettres en double comme le vrai Wordle :
 * - "correct" : bonne lettre, bonne position
 * - "present" : la lettre existe dans le mot, mais pas à cette position
 * - "absent"  : la lettre n'existe pas (ou plus de disponible après les "correct"/"present")
 *
 * Les deux mots doivent avoir la même longueur.
 */
export function evaluateGuess(guess: string, answer: string): LetterResult[] {
  const guessUpper = guess.toUpperCase();
  const answerUpper = answer.toUpperCase();

  if (guessUpper.length !== answerUpper.length) {
    throw new Error(
      `La longueur de l'essai (${guessUpper.length}) ne correspond pas à celle du mot à deviner (${answerUpper.length})`,
    );
  }

  const length = guessUpper.length;
  const result: LetterResult[] = new Array(length);
  const answerLetters = answerUpper.split("");

  // Compteur des lettres restantes disponibles dans answer (pour gérer les doublons)
  const remaining: Record<string, number> = {};
  for (const letter of answerLetters) {
    remaining[letter] = (remaining[letter] ?? 0) + 1;
  }

  // Passe 1 : on marque d'abord toutes les lettres bien placées ("correct")
  for (let i = 0; i < length; i++) {
    const letter = guessUpper[i];
    if (letter === answerLetters[i]) {
      result[i] = { letter, status: "correct" };
      remaining[letter]--;
    }
  }

  // Passe 2 : pour le reste, on regarde si la lettre existe encore ailleurs ("present"),
  // sinon elle est "absent"
  for (let i = 0; i < length; i++) {
    if (result[i]) continue; // déjà traité en passe 1

    const letter = guessUpper[i];
    if (remaining[letter] > 0) {
      result[i] = { letter, status: "present" };
      remaining[letter]--;
    } else {
      result[i] = { letter, status: "absent" };
    }
  }

  return result;
}

/** Vérifie si un essai est une victoire (toutes les lettres "correct") */
export function isWinningGuess(result: LetterResult[]): boolean {
  return result.every((r) => r.status === "correct");
}
