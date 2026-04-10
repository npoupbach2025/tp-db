-- Requête 3 (imposée)
-- Afficher infos sur tous les dessins évalués :
-- numéro, année, description concours, auteur, commentaire dessin,
-- note + commentaire évaluation, nom évaluateur

SELECT 
    d.numDessin,
    YEAR(co.dateDebut) AS annee,
    co.description,
    CONCAT(u_comp.nom, ' ', u_comp.prenom) AS auteur,
    d.commentaire AS commentaire_dessin,
    ev.note,
    ev.commentaire AS commentaire_evaluation,
    CONCAT(u_eval.nom, ' ', u_eval.prenom) AS evaluateur
FROM DESSIN d
JOIN CONCOURS co ON d.numConcours = co.numConcours
JOIN UTILISATEUR u_comp ON d.numCompetiteur = u_comp.numUtilisateur
JOIN EVALUATION ev ON d.numDessin = ev.numDessin
JOIN UTILISATEUR u_eval ON ev.numEvaluateur = u_eval.numUtilisateur
ORDER BY co.numConcours, d.numDessin;
