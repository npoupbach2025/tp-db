-- Requête 7 (libre)
-- Nombre de dessins soumis par club et par concours

SELECT 
    cl.nomClub,
    co.theme AS concours,
    COUNT(d.numDessin) AS nb_dessins
FROM CLUB cl
JOIN UTILISATEUR u ON cl.numClub = u.numClub
JOIN DESSIN d ON u.numUtilisateur = d.numCompetiteur
JOIN CONCOURS co ON d.numConcours = co.numConcours
GROUP BY cl.numClub, cl.nomClub, co.numConcours, co.theme
ORDER BY co.numConcours, cl.nomClub;
