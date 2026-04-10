# Étape 3 — Schéma logique relationnel

## 3.1 Stratégie de transformation
- **1:N** → clé étrangère du côté N
- **N:N** → table d'association avec PK composée
- **Héritage** → table par sous-classe (PK = FK vers UTILISATEUR)

## 3.2 Formalisme textuel

```
CLUB(numClub, nomClub, adresse, numTelephone, nombreAdherents, ville, departement, region, dateCreation)
  PK: numClub

UTILISATEUR(numUtilisateur, nom, prenom, adresse, login, motDePasse, email, dateNaissance, numClub)
  PK: numUtilisateur
  FK: numClub → CLUB(numClub)

ADMINISTRATEUR(numUtilisateur, dateDebut)
  PK: numUtilisateur
  FK: numUtilisateur → UTILISATEUR(numUtilisateur)

DIRECTEUR(numUtilisateur, dateDebut, numClub)
  PK: numUtilisateur
  FK: numUtilisateur → UTILISATEUR(numUtilisateur)
  FK: numClub → CLUB(numClub)

PRESIDENT(numUtilisateur, prime)
  PK: numUtilisateur
  FK: numUtilisateur → UTILISATEUR(numUtilisateur)

COMPETITEUR(numUtilisateur, datePremiereParticipation)
  PK: numUtilisateur
  FK: numUtilisateur → UTILISATEUR(numUtilisateur)

EVALUATEUR(numUtilisateur, specialite, niveau, experience)
  PK: numUtilisateur
  FK: numUtilisateur → UTILISATEUR(numUtilisateur)

CONCOURS(numConcours, theme, dateDebut, dateFin, etat, description, numPresident)
  PK: numConcours
  FK: numPresident → PRESIDENT(numUtilisateur)

PARTICIPATION_CLUB_CONCOURS(numClub, numConcours)
  PK: (numClub, numConcours)
  FK: numClub → CLUB(numClub)
  FK: numConcours → CONCOURS(numConcours)

INSCRIPTION_COMPETITEUR_CONCOURS(numCompetiteur, numConcours)
  PK: (numCompetiteur, numConcours)
  FK: numCompetiteur → COMPETITEUR(numUtilisateur)
  FK: numConcours → CONCOURS(numConcours)

INSCRIPTION_EVALUATEUR_CONCOURS(numEvaluateur, numConcours)
  PK: (numEvaluateur, numConcours)
  FK: numEvaluateur → EVALUATEUR(numUtilisateur)
  FK: numConcours → CONCOURS(numConcours)

DESSIN(numDessin, commentaire, classement, dateRemise, leDessin, titre, numCompetiteur, numConcours)
  PK: numDessin
  FK: numCompetiteur → COMPETITEUR(numUtilisateur)
  FK: numConcours → CONCOURS(numConcours)

EVALUATION(numEvaluateur, numDessin, dateEvaluation, note, commentaire)
  PK: (numEvaluateur, numDessin)
  FK: numEvaluateur → EVALUATEUR(numUtilisateur)
  FK: numDessin → DESSIN(numDessin)
```

## 3.3 Schéma logique graphique
Voir le fichier PlantUML : uml/schema_logique.puml
