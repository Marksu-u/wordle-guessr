export type CsMode = {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: "grid" | "guess";
};

// Temporaire BDD / Call API
export const csModes: CsMode[] = [
  {
    id: "wordle",
    label: "Wordle",
    description:
      "Devine le pseudo du jour en 6 essais. Indices couleur à chaque tentative.",
    href: "/cs/wordle",
    icon: "grid",
  },
  {
    id: "guessr",
    label: "Guessr",
    description:
      "Retrouve le joueur pro à partir d'indices : équipe, rôle, nationalité, âge.",
    href: "/cs/guessr",
    icon: "guess",
  },
];
