'use client;'

//definition typescript poyr les props
interface KeyboardProps {
    onKeyPress: (key: string) => void;
    letterStatuses: { [key: string]: 'correct' | 'present' | 'absent' };
    activeKey?: string | null;
}

export default function Keyboard({ onKeyPress, letterStatuses, activeKey }: KeyboardProps) {
    //matrice qui represente les touches de clavier
    const rows = [
        ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
        ['ENTRER', 'W', 'X', 'C', 'V', 'B', 'N', 'SUPPRIMER']
    ];

return (
    //conteneur principal du clavier
    <div className="flex flex-col gap-2 items-center my-6 w-full max-w-2xl mx-auto px-6">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1.5 justify-center w-full">
          {row.map((key) => {
            const status = letterStatuses[key];

            //Verification de pression de la touche
            const isPressed = activeKey === key;

            //Permet au bouton supprimer d'etre remplacé par le logo
            const isDelete = key === 'SUPPRIMER';

            //Permet au bouton entrer d'etre remplacé par le logo
            const isEnter = key === 'ENTRER';

            const isActionKey = isDelete || isEnter;
            
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
                className={`h-14 rounded font-bold uppercase flex justify-center items-center
                  transition-all duration-100 ease-out shadow-md
                  ${isActionKey ? 'flex-[1.5] text-xs' : 'flex-1 text-sm'}
                  ${bgClass}
                  ${isPressed ? 'scale-90 brightness-150 shadow-inner ring-2 ring-white/50' :'scale-100'}
                  `}>
                {isDelete ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} 
                  stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 
                    12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 
                    4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 
                    2.25h-9.284c-.298 0-.585-.119-.796-.33z"/>
                  </svg>
                ) : isEnter ? (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} 
                  stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 
                    12h-3" />
                  </svg>
                ) : (
                  key
                )}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
}