import GameCard from "@/components/GameCard";

// Fake Call API
import { games } from "@/data/games"

export default function Home() {
  const titre = "Choisis ton jeu"

  return (
    <main className="mx-auto max-w-3xl p-8">

      <h1 className="mb-6 text-3xl font-bold">{titre}</h1>

      <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        {/**  Game Cards avec les différents */}
        {games.map((game) => (
          <li key={game.id}>
            <GameCard label={game.label} />
          </li>
        ))}
      </ul>

    </main>
  );
}