# Wordle D&D

Hub de jeux de devinette quotidiens dans l'univers D&D. Gratuit, sans compte, sans backend (phase 1).

> 🎯 La vision complète, les principes et la roadmap sont dans [`docs/vision.md`](docs/vision.md). **À lire avant de coder.**

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
app/        # routes (App Router). À venir : app/[categorie]/[longueur]/page.tsx
public/     # assets statiques
docs/       # vision et notes de conception
```

- **Alias d'import** : `@/` pointe sur la racine du projet (ex. `import x from "@/lib/x"`).
- **Tests** : à côté du code testé, en `*.test.ts` / `*.test.tsx`
  (ex. `lib/rotation.ts` → `lib/rotation.test.ts`). Le runner est prêt, à toi d'écrire les tests.
- **Contenu data-driven** : le contenu des catégories vivra dans des fichiers JSON
  (voir le contrat de données dans [`docs/vision.md`](docs/vision.md)). Ajouter une
  catégorie = ajouter un fichier, pas du code.
- **Formatage** : ne te bats pas avec le style — `npm run format`, ou active _format on save_
  (config VS Code fournie dans [`.vscode/`](.vscode/)).
