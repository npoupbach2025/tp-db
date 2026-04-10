# Étape 2 — Analyse des contraintes (règles métier)

## C1 : Max 4 concours par année (1 par saison)
- **Représentée dans l'UML ?** Non (cardinalités insuffisantes pour exprimer cette limite temporelle)
- **Implémentation BD :** Trigger BEFORE INSERT sur CONCOURS qui compte le nombre de concours existants pour l'année de dateDebut. Si >= 4, SIGNAL SQLSTATE erreur.
- **Impact INSERT :** Respecter 4 concours max par année (2023 et 2024).

## C2 : Un évaluateur ne peut pas évaluer plus de 8 dessins dans un même concours
- **Représentée dans l'UML ?** Non (pas exprimable par cardinalité)
- **Implémentation BD :** Trigger BEFORE INSERT sur EVALUATION qui compte les évaluations de cet évaluateur pour le concours du dessin. Si >= 8, erreur.
- **Impact INSERT :** Chaque évaluateur évalue ≤ 8 dessins par concours.

## C3 : Un dessin doit être évalué par exactement 2 évaluateurs (jury)
- **Représentée dans l'UML ?** Partiellement (la cardinalité "2" est visible côté évaluateur sur l'association évalue)
- **Implémentation BD :** Trigger BEFORE INSERT sur EVALUATION qui vérifie que le dessin n'a pas déjà 2 évaluations. Le contrôle "exactement 2" (pas moins) sera fait au niveau applicatif ou lors du changement d'état du concours.
- **Impact INSERT :** Chaque dessin a exactement 2 lignes dans EVALUATION.

## C4 : Le président d'un concours ne peut pas être évaluateur ni compétiteur du même concours
- **Représentée dans l'UML ?** Non (contrainte inter-associations)
- **Implémentation BD :** Trigger BEFORE INSERT sur INSCRIPTION_COMPETITEUR et EVALUATION, vérifiant que l'utilisateur n'est pas président du concours concerné. + Trigger sur CONCOURS vérifiant que le président choisi n'est ni inscrit comme compétiteur ni évaluateur.
- **Impact INSERT :** Ne jamais inscrire/faire évaluer le président de son propre concours.

## C5 : Un compétiteur ne peut pas déposer plus de 3 dessins dans un même concours
- **Représentée dans l'UML ?** Non (cardinalité * est trop large)
- **Implémentation BD :** Trigger BEFORE INSERT sur DESSIN comptant les dessins du compétiteur dans ce concours. Si >= 3, erreur.
- **Impact INSERT :** Max 3 dessins par compétiteur par concours.

## C6 : Un concours doit mobiliser au moins 6 clubs
- **Représentée dans l'UML ?** Partiellement (cardinalité * sur participe)
- **Implémentation BD :** Contrôle applicatif au changement d'état (pas_commence → en_cours). On peut aussi vérifier via trigger sur PARTICIPATION_CLUB_CONCOURS.
- **Impact INSERT :** Chaque concours a ≥ 6 clubs participants.

## C7 : Chaque club participant doit mobiliser ≥ 6 compétiteurs et ≥ 3 évaluateurs dans ce concours
- **Représentée dans l'UML ?** Non
- **Implémentation BD :** Contrôle applicatif (le directeur du club valide). Vérification avant changement d'état.
- **Impact INSERT :** Pour chaque club dans un concours, prévoir ≥ 6 compétiteurs et ≥ 3 évaluateurs.

## C8 : Un évaluateur d'un concours ne peut pas concourir dans ce même concours
- **Représentée dans l'UML ?** Non (contrainte croisée entre 2 rôles)
- **Implémentation BD :** Trigger BEFORE INSERT sur INSCRIPTION_COMPETITEUR vérifiant que l'utilisateur n'est pas évaluateur du même concours, et inversement sur l'inscription évaluateur.
- **Impact INSERT :** Ne jamais inscrire quelqu'un comme compétiteur ET évaluateur du même concours.
