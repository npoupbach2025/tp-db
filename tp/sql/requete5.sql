-- Requête 5 (imposée)
-- Région avec la meilleure moyenne des notes : région + moyenne

SELECT 
    cl.region,
    AVG(ev.note) AS moyenne_notes
FROM EVALUATION ev
JOIN DESSIN d ON ev.numDessin = d.numDessin
JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
JOIN CLUB cl ON u.numClub = cl.numClub
GROUP BY cl.region
ORDER BY moyenne_notes DESC
LIMIT 1;
