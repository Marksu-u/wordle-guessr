# wordle-guessr

Hub de jeux de devinette quotidiens sur la **scène esport** (lancement : Valorant). Deux moteurs au-dessus d'une même donnée : **Wordle** (devine le nom) et **Guessr** (devine une entité via ses attributs). Gratuit, sans compte, sans backend (phase 1).

## Prérequis

- **Node.js 24** — version épinglée dans [`.nvmrc`](.nvmrc). Avec `nvm` : `nvm use`.
- **npm** (livré avec Node).

## Démarrage

```bash
npm install      # installe les dépendances
npm run dev      # serveur de dev → http://localhost:3000
```

La page se recharge automatiquement à chaque modification.

## Scripts

| Commande               | Rôle                                               |
| ---------------------- | -------------------------------------------------- |
| `npm run dev`          | Serveur de développement (Turbopack)               |
| `npm run build`        | Build de production                                |
| `npm start`            | Sert le build de production                        |
| `npm run lint`         | ESLint                                             |
| `npm run typecheck`    | Vérification TypeScript (sans émettre de fichiers) |
| `npm run format`       | Formate tout le code (Prettier)                    |
| `npm run format:check` | Vérifie le formatage sans modifier                 |
| `npm test`             | Lance les tests une fois (Vitest)                  |
| `npm run test:watch`   | Tests en mode watch                                |

## Stack

- **Next.js 16** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS 4**
- **Vitest** + **Testing Library** pour les tests
- **ESLint** + **Prettier** pour la qualité et le formatage

## Structure & conventions

```
app/        # routes (App Router). À venir : app/[game]/word/[length] et app/[game]/guess
app/data/   # contenu data-driven (JSON). Ex. app/data/valorant/{teams,players}.json
public/     # assets statiques
docs/       # vision, spec de design, guide stagiaire
```

- **Alias d'import** : `@/` pointe sur la racine du projet (ex. `import x from "@/lib/x"`).
- **Tests** : à côté du code testé, en `*.test.ts` / `*.test.tsx`
  (ex. `lib/rotation.ts` → `lib/rotation.test.ts`). Le runner est prêt, à toi d'écrire les tests.
- **Contenu data-driven** : le contenu vit dans des fichiers JSON sous `app/data/`. Chaque entité
  suit le contrat `{ id, type, game, name, attributes }` — le `name` alimente le Wordle, les
  `attributes` le Guessr. Ajouter un jeu = ajouter des fichiers, pas du code (voir le spec).
- **Pas de `fetch` pour la donnée locale** (phase 1) : on `import` les JSON du repo. La bascule
  vers une base ne viendra qu'en phase 2, motivée par un vrai besoin.
- **Formatage** : ne te bats pas avec le style — `npm run format`, ou active _format on save_
  (config VS Code fournie dans [`.vscode/`](.vscode/)).
