-- Requête 4 (imposée)
-- Nom, prénom, âge des compétiteurs qui ont participé à TOUS les concours
-- organisés en 2023 et 2024. Tri par âge croissant.

SELECT 
    u.nom,
    u.prenom,
    TIMESTAMPDIFF(YEAR, u.dateNaissance, CURDATE()) AS age
FROM UTILISATEUR u
JOIN COMPETITEUR c ON u.numUtilisateur = c.numUtilisateur
JOIN INSCRIPTION_COMPETITEUR_CONCOURS icc ON c.numUtilisateur = icc.numCompetiteur
JOIN CONCOURS co ON icc.numConcours = co.numConcours
WHERE YEAR(co.dateDebut) IN (2023, 2024)
GROUP BY u.numUtilisateur, u.nom, u.prenom, u.dateNaissance
HAVING COUNT(DISTINCT co.numConcours) = (
    SELECT COUNT(*) FROM CONCOURS WHERE YEAR(dateDebut) IN (2023, 2024)
)
ORDER BY age ASC;
