import Image from 'next/image'
import WordleGame from '@/components/WordleGame';

export default function FifaPage() {
    return (

       <div>
            <h1 className="text-3xl font-bold mb-6 text-center font-mono tracking-wide uppercase">Ligue 1 - Wordle Game</h1>
            <FifaImage/>
            <WordleGame/>
        </div>
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


