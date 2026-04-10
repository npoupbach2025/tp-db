-- Requête 8 (libre)
-- Taux de participation (nombre de compétiteurs inscrits) par concours

SELECT 
    co.numConcours,
    co.theme,
    co.etat,
    COUNT(icc.numCompetiteur) AS nb_competiteurs,
    (SELECT COUNT(*) FROM COMPETITEUR) AS total_competiteurs,
    ROUND(COUNT(icc.numCompetiteur) * 100.0 / (SELECT COUNT(*) FROM COMPETITEUR), 1) AS taux_participation_pct
FROM CONCOURS co
LEFT JOIN INSCRIPTION_COMPETITEUR_CONCOURS icc ON co.numConcours = icc.numConcours
GROUP BY co.numConcours, co.theme, co.etat
ORDER BY co.numConcours;
