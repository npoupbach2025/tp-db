const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/dashboard
router.get('/', (req, res) => {
  const db = getDb();

  const stats = {
    nbClubs: db.prepare('SELECT COUNT(*) as c FROM CLUB').get().c,
    nbUtilisateurs: db.prepare('SELECT COUNT(*) as c FROM UTILISATEUR').get().c,
    nbConcours: db.prepare('SELECT COUNT(*) as c FROM CONCOURS').get().c,
    nbDessins: db.prepare('SELECT COUNT(*) as c FROM DESSIN').get().c,
    nbEvaluations: db.prepare('SELECT COUNT(*) as c FROM EVALUATION').get().c,
    moyenneGlobale: db.prepare('SELECT ROUND(AVG(note), 2) as m FROM EVALUATION').get().m || 0,
  };

  // Répartition compétiteurs par catégorie
  const categoriesRaw = db.prepare(`
    SELECT categorie, COUNT(*) as count FROM COMPETITEUR GROUP BY categorie ORDER BY categorie
  `).all();
  stats.competiteursParCategorie = categoriesRaw;

  // Répartition concours par état
  const etatsRaw = db.prepare(`
    SELECT etat, COUNT(*) as count FROM CONCOURS GROUP BY etat ORDER BY etat
  `).all();
  stats.concoursParEtat = etatsRaw;

  // Top 5 clubs par nombre de dessins
  stats.topClubs = db.prepare(`
    SELECT cl.numClub, cl.nomClub, cl.ville, COUNT(d.numDessin) as nbDessins,
      ROUND(AVG(e.note), 2) as moyenneNote
    FROM CLUB cl
    JOIN UTILISATEUR u ON cl.numClub = u.numClub
    JOIN DESSIN d ON u.numUtilisateur = d.numCompetiteur
    LEFT JOIN EVALUATION e ON d.numDessin = e.numDessin
    GROUP BY cl.numClub
    ORDER BY nbDessins DESC
    LIMIT 5
  `).all();

  // Top 5 concours par participation
  stats.topConcours = db.prepare(`
    SELECT co.numConcours, co.theme, co.etat,
      (SELECT COUNT(*) FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numConcours = co.numConcours) as nbCompetiteurs,
      (SELECT COUNT(*) FROM DESSIN WHERE numConcours = co.numConcours) as nbDessins
    FROM CONCOURS co
    ORDER BY nbCompetiteurs DESC
    LIMIT 5
  `).all();

  // Répartition rôles
  stats.roles = {
    administrateurs: db.prepare('SELECT COUNT(*) as c FROM ADMINISTRATEUR').get().c,
    directeurs: db.prepare('SELECT COUNT(*) as c FROM DIRECTEUR').get().c,
    presidents: db.prepare('SELECT COUNT(*) as c FROM PRESIDENT').get().c,
    competiteurs: db.prepare('SELECT COUNT(*) as c FROM COMPETITEUR').get().c,
    evaluateurs: db.prepare('SELECT COUNT(*) as c FROM EVALUATEUR').get().c,
  };

  // Notes distribution (0-5, 6-10, 11-15, 16-20)
  stats.notesDistribution = db.prepare(`
    SELECT
      CASE
        WHEN note BETWEEN 0 AND 5 THEN '0-5'
        WHEN note BETWEEN 6 AND 10 THEN '6-10'
        WHEN note BETWEEN 11 AND 15 THEN '11-15'
        WHEN note BETWEEN 16 AND 20 THEN '16-20'
      END as tranche,
      COUNT(*) as count
    FROM EVALUATION
    GROUP BY tranche
    ORDER BY tranche
  `).all();

  res.json(stats);
});

module.exports = router;
