'use client;'//client compononent

//definition typescript poyr les props
interface KeyboardProps {
    onKeyPress: (key: string) => void;
}

export default function Keyboard({ onKeyPress }: KeyboardProps) {
    //matrice qui represente les touches de clavier
    const rows = [
        ['A', 'Z', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
        ['Q', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M'],
        ['ENTRER', 'W', 'X', 'C', 'V', 'B', 'N', 'SUPPRIMER']
    ];

return (
    //conteneur principal du clavier
    <div className="flex flex-col gap-2 items-center my-4">
      {rows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((key) => (
            <button
              key={key}
              onClick={() => onKeyPress(key)}
              className="px-3 py-4 bg-gray-200 rounded font-bold hover:bg-gray-300 active:bg-gray-400 min-w-[40px] text-black"
            >
              {key}
            </button>
          ))}
        </div>
      ))}
    </div>
  );
}