-- Requête 1 (imposée)
-- Afficher nom, adresse, âge des compétiteurs ayant participé à un concours en 2024
-- + description concours + dates + club + département + région

SELECT 
    u.nom,
    u.adresse,
    TIMESTAMPDIFF(YEAR, u.dateNaissance, CURDATE()) AS age,
    co.description,
    co.dateDebut,
    co.dateFin,
    cl.nomClub,
    cl.departement,
    cl.region
FROM UTILISATEUR u
JOIN COMPETITEUR c ON u.numUtilisateur = c.numUtilisateur
JOIN INSCRIPTION_COMPETITEUR_CONCOURS icc ON c.numUtilisateur = icc.numCompetiteur
JOIN CONCOURS co ON icc.numConcours = co.numConcours
JOIN CLUB cl ON u.numClub = cl.numClub
WHERE YEAR(co.dateDebut) = 2024
ORDER BY u.nom, co.dateDebut;
