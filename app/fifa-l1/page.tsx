import Image from 'next/image'

export default function FifaPage() {
    return (

       <div><h1>Ligue 1</h1>
        <FifaImage/></div>
    )
}

export function FifaImage(){
    return (
        <Image
            src="/fifa14.jpg"
            width={400}
            height={400}
            alt="Pochette de FIFA 14"
        />
    )
}


