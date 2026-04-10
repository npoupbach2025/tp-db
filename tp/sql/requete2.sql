-- Requête 2 (imposée)
-- Afficher par note croissante les dessins évalués en 2023 :
-- numDessin, note, nom du compétiteur, description concours, thème

SELECT 
    d.numDessin,
    ev.note,
    u.nom AS nom_competiteur,
    co.description,
    co.theme
FROM DESSIN d
JOIN EVALUATION ev ON d.numDessin = ev.numDessin
JOIN CONCOURS co ON d.numConcours = co.numConcours
JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
WHERE YEAR(ev.dateEvaluation) = 2023
ORDER BY ev.note ASC;
