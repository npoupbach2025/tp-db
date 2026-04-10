-- Requête 9 (libre)
-- Concours "en attente" dont il manque des évaluations
-- (dessins pas encore évalués par 2 évaluateurs)

SELECT 
    co.numConcours,
    co.theme,
    d.numDessin,
    d.titre,
    COUNT(ev.numEvaluateur) AS nb_evaluations,
    (2 - COUNT(ev.numEvaluateur)) AS evaluations_manquantes
FROM CONCOURS co
JOIN DESSIN d ON co.numConcours = d.numConcours
LEFT JOIN EVALUATION ev ON d.numDessin = ev.numDessin
WHERE co.etat = 'attente'
GROUP BY co.numConcours, co.theme, d.numDessin, d.titre
HAVING COUNT(ev.numEvaluateur) < 2
ORDER BY co.numConcours, d.numDessin;
