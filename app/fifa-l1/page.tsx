import Image from 'next/image'
import WordleGame from '@/components/WordleGame';
import Link from 'next/link';
import Score from '@/components/Score';
import Hint from '@/components/Hint';

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
                    <div className="flex flex-col mt-6 items-center">
                        <Score/>
                        <FifaImage/>

                        <div className="mt-14 flex justify-center w-full">
                            <Hint/>
                        </div>
                    </div>
                    
                    <div className='w-full max-w-xl'>
                        <WordleGame/>
                    </div>
                 </div>   
        </main>
    )
}

export function FifaImage(){
    return (
        <div className="flex justify-center w-full md:w-auto shrink-0 mt-13 ">
            <Link
                href="https://www.ligue1.com"
                target="_blank"
                rel="noopener noreferrer">
                <Image
                    src="/ligue1.webp"
                    width={250}
                    height={250}
                    alt="Logo de Ligue 1"
                    title="Visiter le site officiel de la Ligue 1"
                    className="rounded-xl shadow-lg"
                />
            </Link>
        </div>
    );
}


