import GameCard from "@/components/GameCard";
import Link from 'next/link'

// Fake Call API
import { games } from "@/data/games"

export default function Home() {
  const titre = "Choisis ton Univers"

  return (
    <main className="mx-auto max-w-3xl p-8">

      <h1 className="mb-6 text-3xl font-bold">{titre}</h1>

    {games.length === 0 ? (
      <p className="text-gray-500">Aucun jeux disponible</p>
    ) : (
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {/**  Game Cards avec les différents */}
          {games.map((game) => (
            <li className="bg-gray-500 hover:bg-gray-700" key={game.id}>
              <Link href={game.id}>
                <GameCard label={game.label} />
              </Link>
            </li>
          ))}
        </ul>
      )}

    </main>
  );
}
