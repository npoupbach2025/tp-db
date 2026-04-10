# Projet : Plateforme de gestion des concours de dessins
## CNAM-ESAIP 2025-2026 — Introduction à la gestion des données à large échelle

## Structure du projet

```
projet_concours_dessins/
├── docs/
│   ├── etape0_comprehension.md      # Résumé du besoin
│   ├── etape2_contraintes.md        # Analyse des 8 contraintes métier
│   └── etape3_schema_logique.md     # Schéma logique relationnel (textuel)
├── uml/
│   ├── diagramme_classes.puml       # Diagramme UML (PlantUML)
│   ├── diagramme_classes.drawio.xml # Diagramme UML (draw.io)
│   ├── schema_logique.puml          # Schéma logique (PlantUML)
│   └── schema_logique.drawio.xml    # Schéma logique (draw.io)
├── sql/
│   ├── creationConcoursDessins.sql  # CREATE TABLE (schéma physique)
│   ├── insertionConcoursDessins.sql # INSERT (8 concours, 2023-2024)
│   ├── triggers.sql                 # 5 triggers MySQL
│   ├── requete1.sql à requete10.sql # 10 requêtes SQL
├── web/
│   ├── config.php                   # Connexion PDO + session
│   ├── style.css                    # CSS moderne
│   ├── index.php                    # Redirection → login
│   ├── login.php                    # Authentification
│   ├── logout.php                   # Déconnexion
│   ├── dashboard.php                # Redirection selon rôle
│   ├── admin.php                    # Page administrateur
│   ├── competiteur.php              # Page compétiteur
│   ├── evaluateur.php               # Page évaluateur
│   ├── resultats.php                # Classements concours
│   └── statistiques.php             # Statistiques plateforme
└── README.md
```

## Installation

### 1. Base de données
```bash
# Dans MySQL / phpMyAdmin :
1. Exécuter sql/creationConcoursDessins.sql
2. Exécuter sql/insertionConcoursDessins.sql
3. Exécuter sql/triggers.sql
```

### 2. Interface web
```bash
# Copier le dossier web/ dans le répertoire de votre serveur web (ex: htdocs/)
# Modifier web/config.php si nécessaire (host, user, password)
# Accéder via http://localhost/web/
```

### 3. Comptes de test
| Login    | Mot de passe  | Rôle           |
|----------|--------------|----------------|
| adminAL  | Syst3m!2020  | Administrateur |
| jmarch   | aZ3k9pQ      | Compétiteur    |
| sbern    | wW2i5pM      | Évaluateur     |

### 4. Diagrammes UML
Les fichiers `.drawio.xml` s'ouvrent directement dans :
- [draw.io](https://app.diagrams.net/) (glisser-déposer le fichier)
- Extension VS Code "Draw.io Integration"

Les fichiers `.puml` peuvent être rendus via :
- [PlantUML Online](https://www.plantuml.com/plantuml/uml)
- Extension VS Code "PlantUML"

## Données insérées
- **8 clubs** (Paris, Lyon, Marseille, Toulouse, Nantes, Bordeaux, Lille, Strasbourg)
- **93 utilisateurs** (1 admin, 8 directeurs, 8 présidents, 48 compétiteurs, 24 évaluateurs)
- **8 concours** (4 en 2023, 4 en 2024) — 6 évalués, 1 en attente, 1 en cours
- **~330 dessins** (48 par concours 1-5 et 7, 45 concours 6, 12 concours 8)
- **~700 évaluations** (2 par dessin concours 1-6, 40 partielles concours 7, aucune concours 8)

## Contraintes respectées
- ✅ Max 4 concours/an (1 par saison)
- ✅ ≤ 3 dessins par compétiteur par concours
- ✅ Exactement 2 évaluations par dessin (concours évalués)
- ✅ ≤ 8 dessins évalués par évaluateur par concours
- ✅ ≥ 6 clubs par concours
- ✅ ≥ 6 compétiteurs et ≥ 3 évaluateurs par club par concours
- ✅ Président ≠ compétiteur/évaluateur du même concours
- ✅ Évaluateur ≠ compétiteur du même concours
