# Étape 0 — Compréhension du besoin

## Domaine
Plateforme web Full Stack pour la gestion de concours de dessins, gérée par des clubs.
Les utilisateurs s'authentifient, possèdent des rôles, participent à des concours multi-états,
soumettent des dessins, sont évalués par un jury de 2 évaluateurs.

## Objets métier indispensables
- **Club** : entité organisatrice, identifiée par numClub, possède nom, adresse, téléphone, ville, département, région, nombreAdherents
- **Utilisateur** : personne authentifiée (login/motDePasse), membre d'un club
- **Rôles** (héritage depuis Utilisateur) :
  - **Administrateur** (dateDebut) : crée concours, gère la plateforme
  - **Directeur** (dateDebut) : dirige un club, décide qui participe comme compétiteur/évaluateur
  - **Président** (prime) : préside un concours, assigne les jurys
  - **Compétiteur** (datePremiereParticipation) : s'inscrit à un concours, soumet des dessins
  - **Évaluateur** (specialite) : note les dessins assignés
- **Concours** : thème, dates, état (workflow), description
- **Dessin** : soumis par un compétiteur dans un concours, avec commentaire, classement, dateRemise, leDessin
- **Évaluation** : classe d'association entre Évaluateur et Dessin (note 0-20, commentaire, dateEvaluation)

## Actions clés
1. Création/gestion des concours (par l'administrateur)
2. Inscription à un concours (compétiteur ou évaluateur)
3. Dépôt de dessins (compétiteur, si concours "en cours")
4. Affectation d'un jury de 2 évaluateurs à chaque dessin (par le président)
5. Évaluation : note (0-20) + commentaire (par évaluateur, si concours en "attente")
6. Calcul classement/résultats (quand concours passe à "évalué")
7. Statistiques (par concours, par plateforme, annuelles et triennales)

## États d'un concours (workflow)
| État             | Description |
|------------------|-------------|
| pas_commence     | Date de début non atteinte, aucun dépôt possible |
| en_cours         | Les compétiteurs peuvent déposer leurs dessins |
| attente          | Dépôt fini (date fin passée), évaluateurs notent les dessins |
| resultat         | Toutes les notes sont connues, classement effectué |
| evalue           | Concours finalisé, résultats publiés |

> Note : le cahier des charges mentionne 4 états (pas commencé, en cours, attente des résultats, évalué).
> On utilise l'enum : 'pas_commence', 'en_cours', 'attente', 'evalue' (+ 'resultat' optionnel).
