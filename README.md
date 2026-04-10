# Art Contest Hub — Concours de Dessins Inter-Clubs

Application web complète pour la gestion de concours de dessins inter-clubs.
**Stack** : React + Vite + TailwindCSS + shadcn/ui (frontend) — Express + better-sqlite3 (backend)

## Installation et lancement

### 1. Installer les dépendances frontend
```bash
cd art-contest-hub-main
npm install
```

### 2. Installer les dépendances backend
```bash
cd server
npm install
```

### 3. Initialiser la base SQLite3 (importe les données du TP)
```bash
cd server
node init-db.js
```
Cela crée `server/concours_dessins.db` avec toutes les données.

### 4. Lancer le backend (terminal 1)
```bash
cd server
npm run dev
```
→ API sur http://localhost:3001

### 5. Lancer le frontend (terminal 2)
```bash
cd art-contest-hub-main
npm run dev
```
→ Frontend sur http://localhost:8080

### 6. Ouvrir l'application
Aller sur **http://localhost:8080**

## Comptes de connexion

| Rôle | Login | Mot de passe |
|------|-------|-------------|
| Admin | admin | admin123 |
| Compétiteur | (voir base) | (voir base) |
| Évaluateur | (voir base) | (voir base) |

## Architecture

```
art-contest-hub-main/
├── server/                  # Backend Express + SQLite3
│   ├── index.js             # Serveur principal
│   ├── database.js          # Connexion SQLite3
│   ├── schema.sql           # Schéma SQLite3
│   ├── init-db.js           # Script d'initialisation
│   ├── concours_dessins.db  # Base SQLite3 (généré)
│   └── routes/              # Routes API REST
│       ├── auth.js
│       ├── clubs.js
│       ├── utilisateurs.js
│       ├── concours.js
│       ├── dessins.js
│       ├── evaluations.js
│       ├── inscriptions.js
│       ├── dashboard.js
│       └── resultats.js
├── src/                     # Frontend React
│   ├── App.tsx              # Routes + Auth
│   ├── contexts/            # DataContext (API)
│   ├── lib/api.ts           # Client API
│   ├── pages/               # Pages de l'application
│   ├── components/          # Composants UI
│   └── types/               # Types TypeScript
└── ...
```

## API REST

| Endpoint | Méthodes | Description |
|----------|----------|-------------|
| `/api/auth/login` | POST | Authentification |
| `/api/dashboard` | GET | Statistiques |
| `/api/clubs` | GET, POST | CRUD Clubs |
| `/api/clubs/:id` | GET, PUT, DELETE | Détail Club |
| `/api/utilisateurs` | GET, POST | CRUD Utilisateurs |
| `/api/concours` | GET, POST | CRUD Concours |
| `/api/dessins` | GET, POST | CRUD Dessins |
| `/api/evaluations` | GET, POST | CRUD Évaluations |
| `/api/inscriptions/*` | GET, POST, DELETE | Inscriptions |
| `/api/resultats` | GET | Classements |

## Règles métier implémentées

- Max 3 dessins par compétiteur par concours
- Max 2 évaluations par dessin
- Max 8 évaluations par évaluateur par concours
- Président ne peut pas être compétiteur dans son concours
- Évaluateur ne peut pas être compétiteur dans le même concours
- Note entre 0 et 20
- Login unique
- Validation des enums (état, catégorie, niveau, appréciation)

## Projet original here
