export type Game = {
    id: string;
    label: string;
}

// Temporaire BDD / Call API
export const games: Game[] = [
    { id: "valo", label: "Valorant" },
    { id: "cs", label: "Counter Strike 2"},
    { id: "rl", label: "Rocket League"},
]