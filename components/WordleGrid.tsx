'use client';

interface WordleGridProps {
  guesses: string[];
  currentGuess: string;
  wordLength: number;
  evaluations: ('correct' | 'present' | 'absent')[][]; // Reçoit l'historique des couleurs du serveur
  maxAttempts?: number;
  isShaking?: boolean;
}

export default function WordleGrid({ guesses, currentGuess, wordLength, evaluations, maxAttempts = 6, isShaking }: WordleGridProps) {
  const totalRows = maxAttempts;

  return (
    <div className="flex flex-col gap-2">
      {Array.from({ length: maxAttempts }).map((_, rowIndex) => {
        const isCurrentRow = rowIndex === guesses.length;
        const isPastRow = rowIndex < guesses.length;
        
        let rowWord = '';
        if (isPastRow) rowWord = guesses[rowIndex];
        if (isCurrentRow) rowWord = currentGuess;

        return (
          <div key={rowIndex} className={`flex gap-2 ${isCurrentRow && isShaking ? 'animate-shake' : ''}`}>
            {Array.from({ length: wordLength }).map((_, letterIndex) => {
              const letter = rowWord[letterIndex] || '';
              
              // Style par défaut
              let bgColor = 'bg-zinc-800/80 border-zinc-700';
              let textColor = 'text-white';

              // Si c'est une ligne passée, on applique la couleur stockée par le serveur
              if (isPastRow && letter && evaluations[rowIndex]) {
                const status = evaluations[rowIndex][letterIndex];
                if (status === 'correct') {
                  bgColor = 'bg-green-600 border-green-600';
                } else if (status === 'present') {
                  bgColor = 'bg-yellow-500 border-yellow-500';
                } else if (status === 'absent') {
                  bgColor = 'bg-zinc-600 border-zinc-600';
                }
              }

              return (
                <div
                  key={letterIndex}
                  className={`w-12 h-12 border-2 flex items-center justify-center font-bold text-xl 
                    rounded uppercase transition-all duration-300 ${bgColor} ${textColor}`}>
                  {letter}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}