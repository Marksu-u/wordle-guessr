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

    </div>
)
}