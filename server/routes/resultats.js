const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

// GET /api/resultats — classements par concours
router.get('/', (req, res) => {
  const db = getDb();
  const { numConcours } = req.query;

  if (numConcours) {
    // Classement pour un concours spécifique
    const concours = db.prepare('SELECT * FROM CONCOURS WHERE numConcours = ?').get(numConcours);
    if (!concours) return res.status(404).json({ error: 'Concours non trouvé.' });

    const classement = db.prepare(`
      SELECT d.numDessin, d.titre, d.commentaire as dessinCommentaire,
        u.numUtilisateur, u.nom, u.prenom,
        cl.nomClub, cl.region,
        comp.categorie,
        ROUND(AVG(e.note), 2) as moyenneNote,
        COUNT(e.numEvaluateur) as nbEvaluations,
        GROUP_CONCAT(e.note, ', ') as detailNotes
      FROM DESSIN d
      JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
      JOIN COMPETITEUR comp ON u.numUtilisateur = comp.numUtilisateur
      LEFT JOIN CLUB cl ON u.numClub = cl.numClub
      LEFT JOIN EVALUATION e ON d.numDessin = e.numDessin
      WHERE d.numConcours = ?
      GROUP BY d.numDessin
      HAVING nbEvaluations > 0
      ORDER BY moyenneNote DESC
    `).all(numConcours);

    // Ajouter le rang
    classement.forEach((item, idx) => { item.rang = idx + 1; });

    res.json({ concours, classement });
  } else {
    // Liste des concours avec stats
    const concoursList = db.prepare(`
      SELECT co.*,
        u.nom as presidentNom, u.prenom as presidentPrenom,
        (SELECT COUNT(*) FROM DESSIN WHERE numConcours = co.numConcours) as nbDessins,
        (SELECT ROUND(AVG(e.note), 2) FROM EVALUATION e JOIN DESSIN d ON e.numDessin = d.numDessin WHERE d.numConcours = co.numConcours) as moyenneNote
      FROM CONCOURS co
      LEFT JOIN UTILISATEUR u ON co.numPresident = u.numUtilisateur
      ORDER BY co.dateDebut DESC
    `).all();
    res.json(concoursList);
  }
});

// GET /api/resultats/palmares-clubs
router.get('/palmares-clubs', (req, res) => {
  const db = getDb();
  const palmares = db.prepare(`
    SELECT cl.numClub, cl.nomClub, cl.ville, cl.region,
      COUNT(DISTINCT d.numDessin) as nbDessins,
      COUNT(DISTINCT d.numCompetiteur) as nbCompetiteurs,
      ROUND(AVG(e.note), 2) as moyenneNote,
      MAX(e.note) as meilleureNote
    FROM CLUB cl
    JOIN UTILISATEUR u ON cl.numClub = u.numClub
    JOIN DESSIN d ON u.numUtilisateur = d.numCompetiteur
    JOIN EVALUATION e ON d.numDessin = e.numDessin
    GROUP BY cl.numClub
    ORDER BY moyenneNote DESC
  `).all();
  res.json(palmares);
});

// GET /api/resultats/palmares-regions
router.get('/palmares-regions', (req, res) => {
  const db = getDb();
  const palmares = db.prepare(`
    SELECT cl.region,
      COUNT(DISTINCT cl.numClub) as nbClubs,
      COUNT(DISTINCT d.numDessin) as nbDessins,
      ROUND(AVG(e.note), 2) as moyenneNote
    FROM CLUB cl
    JOIN UTILISATEUR u ON cl.numClub = u.numClub
    JOIN DESSIN d ON u.numUtilisateur = d.numCompetiteur
    JOIN EVALUATION e ON d.numDessin = e.numDessin
    GROUP BY cl.region
    ORDER BY moyenneNote DESC
  `).all();
  res.json(palmares);
});

// GET /api/resultats/top-competiteurs
router.get('/top-competiteurs', (req, res) => {
  const db = getDb();
  const top = db.prepare(`
    SELECT u.numUtilisateur, u.nom, u.prenom, comp.categorie,
      cl.nomClub,
      COUNT(DISTINCT d.numDessin) as nbDessins,
      ROUND(AVG(e.note), 2) as moyenneNote,
      MAX(e.note) as meilleureNote
    FROM UTILISATEUR u
    JOIN COMPETITEUR comp ON u.numUtilisateur = comp.numUtilisateur
    JOIN DESSIN d ON u.numUtilisateur = d.numCompetiteur
    JOIN EVALUATION e ON d.numDessin = e.numDessin
    LEFT JOIN CLUB cl ON u.numClub = cl.numClub
    GROUP BY u.numUtilisateur
    ORDER BY moyenneNote DESC
    LIMIT 20
  `).all();
  res.json(top);
});

module.exports = router;
