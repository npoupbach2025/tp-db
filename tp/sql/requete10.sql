-- Requête 10 (libre)
-- Liste des évaluateurs surchargés (proches de 8 évaluations) dans un concours

SELECT 
    co.numConcours,
    co.theme,
    CONCAT(u.nom, ' ', u.prenom) AS evaluateur,
    COUNT(ev.numDessin) AS nb_dessins_evalues,
    (8 - COUNT(ev.numDessin)) AS places_restantes
FROM EVALUATION ev
JOIN DESSIN d ON ev.numDessin = d.numDessin
JOIN CONCOURS co ON d.numConcours = co.numConcours
JOIN UTILISATEUR u ON ev.numEvaluateur = u.numUtilisateur
GROUP BY co.numConcours, co.theme, ev.numEvaluateur, u.nom, u.prenom
HAVING COUNT(ev.numDessin) >= 3
ORDER BY nb_dessins_evalues DESC, co.numConcours;
