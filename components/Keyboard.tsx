'use client;'

//definition typescript poyr les props
interface KeyboardProps {
    onKeyPress: (key: string) => void;
    letterStatuses: { [key: string]: 'correct' | 'present' | 'absent' }; 
}

export default function Keyboard({ onKeyPress, letterStatuses }: KeyboardProps) {
    //matrice qui represente les touches de clavier
    const rows = [
        ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
        ['ENTRER', 'W', 'X', 'C', 'V', 'B', 'N', 'SUPPRIMER']
    ];

return (
    //conteneur principal du clavier
    <div className="flex flex-col gap-2 items-center my-4 w-full">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1 justify-center w-full">
          {row.map((key) => {
            const status = letterStatuses[key];
            
            // couleur de base des touches
            let bgClass = 'bg-zinc-700 hover:bg-zinc-600 cursor-pointer hover:scale-105 active:scale-95 transition-all text-white'; 
            
            // Changement de style dynamique selon le résultat du mot
            if (status === 'correct') {
              bgClass = 'bg-green-600 text-white font-bold'; // Vert
            } else if (status === 'present') {
              bgClass = 'bg-yellow-500 text-white font-bold'; // Jaune
            } else if (status === 'absent') {
              // Gris foncé, lettres grisées et bouton cliquable désactivé (pointer-events-none)
              bgClass = 'bg-zinc-800 text-zinc-500 opacity-40 pointer-events-none cursor-not-allowed'; 
            }
            return (
              <button
                key={key}
                onClick={() => onKeyPress(key)}
                className={`px-2 py-4 rounded font-bold text-sm min-w-[35px] 
                  transition-all uppercase ${bgClass}`}>
                {key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}