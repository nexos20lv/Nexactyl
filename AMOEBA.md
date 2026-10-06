# Amoeba IDE - Jexactyl Project Rules

Ces règles s'appliquent à tous les agents IA et modèles utilisés dans Amoeba pour le projet Jexactyl.

## 1. Stack Technique et Standards
- **Backend** : PHP / Laravel. Respectez les conventions Laravel et PSR-12.
- **Frontend** : React, TypeScript, Tailwind CSS, Vite. Gardez le typage strict.
- **API** : Utilisez les hooks SWR et la structure de requêtes définie dans `resources/scripts/api`.

## 2. Commandes et Validations
- Avant de considérer une tâche terminée sur le frontend, vérifiez le linter : `npm run lint`.
- Pour le backend, assurez-vous que les tests passent : `php artisan test`.
- La compilation de production s'effectue avec `npm run build:production` (ou `pnpm build:production`).

## 3. Comportement des Agents (Amoeba)
- L'IDE Amoeba est collaboratif et peut occasionnellement redémarrer l'environnement.
- Découpez les tâches complexes en étapes plus petites.
- Utilisez des sous-agents spécialisés (Frontend, Backend, QA) pour travailler en parallèle. Si un agent est interrompu par un redémarrage, n'hésitez pas à le relancer ou à reprendre son travail manuellement.

## 4. UI / UX
- Utilisez les composants de base Jexactyl (ex: `Button`, `ScreenBlock`, `Can` pour les permissions) existants dans `resources/scripts/elements`.
- Gardez une trace et corrigez les commentaires de type `// TODO:` laissés dans le code d'origine si vous modifiez un fichier.
