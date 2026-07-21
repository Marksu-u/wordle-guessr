import Image from 'next/image'
import WordleGame from '@/components/WordleGame';

export default function FifaPage() {
    return (
        <main className="mx-auto min-h-screen flex flex-col justify-center items-center p-6 max-w-6xl">
                <h1 className="p-6 text-3xl font-bold mb-1 text-center font-mono tracking-wide uppercase">
                    Wordle - Ligue 1
                </h1>
                <p className='mb-8 text-center font-mono'>Retrouvez le nom d'un joueur du championnat 
                    français</p>

                <div className='flex flex-col md:flex-row gap-8 md:gap-16 justify-center items-center 
                md:items-start w-full flex-grow'>
                    <FifaImage/>
                    <div className='w-full max-w-xl'>
                        <WordleGame/>
                    </div>
                 </div>   
        </main>
    )
}

export function FifaImage(){
    return (
        <div className="flex justify-center w-full md:w-auto shrink-0 mt-30">
        <Image
            src="/ligue1.webp"
            width={300}
            height={300}
            alt="Logo de Ligue 1"
            className="rounded-xl shadow-lg"
        /></div>
    );
}


