-- Requête 6 (libre)
-- Classement final d'un concours évalué (moyenne des 2 notes par dessin, tri décroissant)
-- Exemple : concours 1

SELECT 
    d.numDessin,
    d.titre,
    CONCAT(u.nom, ' ', u.prenom) AS competiteur,
    cl.nomClub,
    AVG(ev.note) AS moyenne,
    RANK() OVER (ORDER BY AVG(ev.note) DESC) AS classement
FROM DESSIN d
JOIN EVALUATION ev ON d.numDessin = ev.numDessin
JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
JOIN CLUB cl ON u.numClub = cl.numClub
WHERE d.numConcours = 1
GROUP BY d.numDessin, d.titre, u.nom, u.prenom, cl.nomClub
ORDER BY moyenne DESC;
