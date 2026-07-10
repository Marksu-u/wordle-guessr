import Image from 'next/image'
import WordleGame from '@/components/WordleGame';
//import wordsData from './data/ligue1/wordle.json';

export default function FifaPage() {
    return (
        <main className="mx-auto min-h-screen flex-col justify-center">
            <div>
                <h1 className="p-6 max-w-5xl text-3xl font-bold mb-4 text-center font-mono tracking-wide uppercase">
                    Wordle - Ligue 1
                </h1>
                <p className='mb-6 text-center font-mono'>Retrouvez le nom d'un joueur du championnat français</p>
                <FifaImage/>
                <WordleGame/>
            </div>
        </main>
    )
}

export function FifaImage(){
    return (
        <div className="flex justify-center w-full">
        <Image
            src="/fifa14.jpg"
            width={300}
            height={300}
            alt="Pochette de FIFA 14"
            className="rounded-xl shadow-lg"
        /></div>
    );
}


