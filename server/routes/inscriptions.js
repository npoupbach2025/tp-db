const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');

// ============================================================
// PARTICIPATION CLUB ↔ CONCOURS
// ============================================================

// GET /api/inscriptions/clubs?numConcours=
router.get('/clubs', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numConcours } = req.query;
  let sql = `
    SELECT p.*, c.nomClub, c.ville, c.region, co.theme as concoursTheme
    FROM PARTICIPATION_CLUB_CONCOURS p
    JOIN CLUB c ON p.numClub = c.numClub
    JOIN CONCOURS co ON p.numConcours = co.numConcours
    WHERE 1=1
  `;
  const params = [];
  if (numConcours) { sql += ' AND p.numConcours = ?'; params.push(numConcours); }
  sql += ' ORDER BY co.numConcours, c.nomClub';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/inscriptions/clubs
router.post('/clubs', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numClub, numConcours } = req.body;
  if (!numClub || !numConcours) return res.status(400).json({ error: 'Club et concours requis.' });

  const existing = db.prepare('SELECT 1 FROM PARTICIPATION_CLUB_CONCOURS WHERE numClub = ? AND numConcours = ?').get(numClub, numConcours);
  if (existing) return res.status(409).json({ error: 'Ce club participe déjà à ce concours.' });

  db.prepare('INSERT INTO PARTICIPATION_CLUB_CONCOURS (numClub, numConcours) VALUES (?, ?)').run(numClub, numConcours);
  res.status(201).json({ numClub, numConcours });
});

// DELETE /api/inscriptions/clubs/:numClub/:numConcours
router.delete('/clubs/:numClub/:numConcours', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM PARTICIPATION_CLUB_CONCOURS WHERE numClub = ? AND numConcours = ?').run(req.params.numClub, req.params.numConcours);
  res.json({ message: 'Participation supprimée.' });
});

// ============================================================
// INSCRIPTION COMPÉTITEUR ↔ CONCOURS
// ============================================================

// GET /api/inscriptions/competiteurs?numConcours=
router.get('/competiteurs', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numConcours } = req.query;
  let sql = `
    SELECT i.*, u.nom, u.prenom, c.nomClub, comp.categorie, co.theme as concoursTheme
    FROM INSCRIPTION_COMPETITEUR_CONCOURS i
    JOIN UTILISATEUR u ON i.numCompetiteur = u.numUtilisateur
    JOIN COMPETITEUR comp ON i.numCompetiteur = comp.numUtilisateur
    LEFT JOIN CLUB c ON u.numClub = c.numClub
    JOIN CONCOURS co ON i.numConcours = co.numConcours
    WHERE 1=1
  `;
  const params = [];
  if (numConcours) { sql += ' AND i.numConcours = ?'; params.push(numConcours); }
  sql += ' ORDER BY co.numConcours, u.nom';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/inscriptions/competiteurs
router.post('/competiteurs', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numCompetiteur, numConcours } = req.body;
  if (!numCompetiteur || !numConcours) return res.status(400).json({ error: 'Compétiteur et concours requis.' });

  // Vérifier que c'est bien un compétiteur
  const isComp = db.prepare('SELECT 1 FROM COMPETITEUR WHERE numUtilisateur = ?').get(numCompetiteur);
  if (!isComp) return res.status(400).json({ error: 'Cet utilisateur n\'est pas un compétiteur.' });

  // Vérifier doublon
  const existing = db.prepare('SELECT 1 FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ? AND numConcours = ?').get(numCompetiteur, numConcours);
  if (existing) return res.status(409).json({ error: 'Déjà inscrit.' });

  // Le président ne peut pas être compétiteur dans son propre concours
  const concours = db.prepare('SELECT numPresident FROM CONCOURS WHERE numConcours = ?').get(numConcours);
  if (concours && concours.numPresident === numCompetiteur) {
    return res.status(400).json({ error: 'Le président du concours ne peut pas y participer comme compétiteur.' });
  }

  // Un évaluateur ne peut pas être compétiteur dans le même concours
  const isEval = db.prepare('SELECT 1 FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numEvaluateur = ? AND numConcours = ?').get(numCompetiteur, numConcours);
  if (isEval) return res.status(400).json({ error: 'Cet utilisateur est déjà évaluateur dans ce concours.' });

  db.prepare('INSERT INTO INSCRIPTION_COMPETITEUR_CONCOURS (numCompetiteur, numConcours) VALUES (?, ?)').run(numCompetiteur, numConcours);
  res.status(201).json({ numCompetiteur, numConcours });
});

// DELETE /api/inscriptions/competiteurs/:numCompetiteur/:numConcours
router.delete('/competiteurs/:numCompetiteur/:numConcours', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ? AND numConcours = ?').run(req.params.numCompetiteur, req.params.numConcours);
  res.json({ message: 'Inscription supprimée.' });
});

// ============================================================
// INSCRIPTION ÉVALUATEUR ↔ CONCOURS
// ============================================================

// GET /api/inscriptions/evaluateurs?numConcours=
router.get('/evaluateurs', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numConcours } = req.query;
  let sql = `
    SELECT i.*, u.nom, u.prenom, ev.specialite, ev.niveau, co.theme as concoursTheme
    FROM INSCRIPTION_EVALUATEUR_CONCOURS i
    JOIN UTILISATEUR u ON i.numEvaluateur = u.numUtilisateur
    JOIN EVALUATEUR ev ON i.numEvaluateur = ev.numUtilisateur
    JOIN CONCOURS co ON i.numConcours = co.numConcours
    WHERE 1=1
  `;
  const params = [];
  if (numConcours) { sql += ' AND i.numConcours = ?'; params.push(numConcours); }
  sql += ' ORDER BY co.numConcours, u.nom';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/inscriptions/evaluateurs
router.post('/evaluateurs', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numEvaluateur, numConcours } = req.body;
  if (!numEvaluateur || !numConcours) return res.status(400).json({ error: 'Évaluateur et concours requis.' });

  const isEval = db.prepare('SELECT 1 FROM EVALUATEUR WHERE numUtilisateur = ?').get(numEvaluateur);
  if (!isEval) return res.status(400).json({ error: 'Cet utilisateur n\'est pas un évaluateur.' });

  const existing = db.prepare('SELECT 1 FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numEvaluateur = ? AND numConcours = ?').get(numEvaluateur, numConcours);
  if (existing) return res.status(409).json({ error: 'Déjà inscrit.' });

  // Un compétiteur ne peut pas être évaluateur dans le même concours
  const isComp = db.prepare('SELECT 1 FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ? AND numConcours = ?').get(numEvaluateur, numConcours);
  if (isComp) return res.status(400).json({ error: 'Cet utilisateur est déjà compétiteur dans ce concours.' });

  db.prepare('INSERT INTO INSCRIPTION_EVALUATEUR_CONCOURS (numEvaluateur, numConcours) VALUES (?, ?)').run(numEvaluateur, numConcours);
  res.status(201).json({ numEvaluateur, numConcours });
});

// DELETE /api/inscriptions/evaluateurs/:numEvaluateur/:numConcours
router.delete('/evaluateurs/:numEvaluateur/:numConcours', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  db.prepare('DELETE FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numEvaluateur = ? AND numConcours = ?').run(req.params.numEvaluateur, req.params.numConcours);
  res.json({ message: 'Inscription supprimée.' });
});

module.exports = router;
