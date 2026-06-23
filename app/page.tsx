import GameCard from "@/components/GameCard";

export default function Home() {
  const titre = "Choisis ton jeu"

  return (
    <main>
      <h1>{titre}</h1>
      <p>Un jeu par jour</p>

      {/**  Game Cards avec les différents */}
      <GameCard label="Valorant"/>
    </main>
  );
}
