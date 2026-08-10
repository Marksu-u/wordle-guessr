"use client";

export default function Hint() {
    const askIndice = () => {
        window.dispatchEvent(new Event('demande-indice'));
    };

    return (
        <button
            onClick={askIndice}
            title="Obtenir un indice"
            className="w-15 h-16 border-[3px] border-zinc-700 bg-zinc-900 rounded-xl flex 
            items-center justify-center hover:bg-zinc-800 hover:border-blue-500 hover:scale-110
            active:scale-95 transition-all shadow-lg">
            
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill ="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-8 h-8 text-zinc-400 group-hover:text-yellow-400 transition-colors">
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 
                    01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 
                    01-3 0M14.25 18v-.192c0-.983.658-1.82 1.508-2.316a7.5 7.5 0 10-7.516 0c.85.496 
                    1.508 1.333 1.508 2.316V18"/>
            </svg>
        </button>
    );
}

/**
 *     //Bouton indice
    useEffect(() => {
        const handleIndice = async () => {
            if (gameStatus !== 'playing' || !solution) return;

            //Recherche de lettres ni vertes ni jaunes
            const lettresSecretes = solution.split('');
            const lettresManquantes = lettresSecretes.filter(
                lettre => letterStatuses[lettre] !== 'correct' && letterStatuses[lettre] !== 'present'
            );

            if (lettresManquantes.length > 0) {
                //Pioche au hasard d'une lettre du mot
                const randomLettre = lettresManquantes[Math.floor(Math.random() * lettresManquantes.length)];
                //Coloration de la lettre en jaune, elle passe en mode 'present'
                setLetterStatuses(prev => ({
                    ...prev,
                    [randomLettre]: 'present'
                }));

                //Enregistrement de l'utilisation d'un indice
                setIndicesUtilises(prev => prev + 1);
            } else {
                //Si toutes les lettres sont trouvées
                setToastMessage("Vous avez déjà trouvé toutes les lettres !");
                setTimeout(() => setToastMessage(null), 2000);
            }
        };
         
        window.addEventListener('demande-indice', handleIndice);
        return () => window.removeEventListener('demande-indice', handleIndice);
    }, [letterStatuses, gameStatus, solution]);
 */