const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');

// GET /api/clubs
router.get('/', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { ville, region, search } = req.query;
  let sql = 'SELECT * FROM CLUB WHERE 1=1';
  const params = [];

  if (ville) { sql += ' AND ville LIKE ?'; params.push(`%${ville}%`); }
  if (region) { sql += ' AND region LIKE ?'; params.push(`%${region}%`); }
  if (search) { sql += ' AND (nomClub LIKE ? OR ville LIKE ? OR region LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }

  sql += ' ORDER BY numClub';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/clubs/:id
router.get('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const club = db.prepare('SELECT * FROM CLUB WHERE numClub = ?').get(req.params.id);
  if (!club) return res.status(404).json({ error: 'Club non trouvé.' });
  res.json(club);
});

// GET /api/clubs/:id/membres
router.get('/:id/membres', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const membres = db.prepare(`
    SELECT u.*,
      CASE
        WHEN EXISTS (SELECT 1 FROM ADMINISTRATEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'administrateur'
        WHEN EXISTS (SELECT 1 FROM PRESIDENT WHERE numUtilisateur = u.numUtilisateur) THEN 'president'
        WHEN EXISTS (SELECT 1 FROM DIRECTEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'directeur'
        WHEN EXISTS (SELECT 1 FROM COMPETITEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'competiteur'
        WHEN EXISTS (SELECT 1 FROM EVALUATEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'evaluateur'
        ELSE 'aucun'
      END as role
    FROM UTILISATEUR u WHERE u.numClub = ? ORDER BY u.nom, u.prenom
  `).all(req.params.id);
  res.json(membres);
});

// POST /api/clubs
router.post('/', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { nomClub, adresse, numTelephone, nombreAdherents, ville, departement, region, dateCreation } = req.body;
  if (!nomClub || !adresse || !ville || !departement || !region) {
    return res.status(400).json({ error: 'Champs obligatoires manquants.' });
  }
  const result = db.prepare(
    'INSERT INTO CLUB (nomClub, adresse, numTelephone, nombreAdherents, ville, departement, region, dateCreation) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(nomClub, adresse, numTelephone || null, nombreAdherents || 0, ville, departement, region, dateCreation || null);
  res.status(201).json({ numClub: result.lastInsertRowid, ...req.body });
});

// PUT /api/clubs/:id
router.put('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { nomClub, adresse, numTelephone, nombreAdherents, ville, departement, region, dateCreation } = req.body;
  const existing = db.prepare('SELECT * FROM CLUB WHERE numClub = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Club non trouvé.' });

  db.prepare(
    'UPDATE CLUB SET nomClub=?, adresse=?, numTelephone=?, nombreAdherents=?, ville=?, departement=?, region=?, dateCreation=? WHERE numClub=?'
  ).run(nomClub, adresse, numTelephone, nombreAdherents, ville, departement, region, dateCreation, req.params.id);
  res.json({ numClub: Number(req.params.id), ...req.body });
});

// DELETE /api/clubs/:id
router.delete('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM CLUB WHERE numClub = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Club non trouvé.' });

  const members = db.prepare('SELECT COUNT(*) as c FROM UTILISATEUR WHERE numClub = ?').get(req.params.id);
  if (members.c > 0) {
    return res.status(409).json({ error: `Impossible de supprimer : ${members.c} membre(s) rattaché(s).` });
  }

  db.prepare('DELETE FROM PARTICIPATION_CLUB_CONCOURS WHERE numClub = ?').run(req.params.id);
  db.prepare('DELETE FROM CLUB WHERE numClub = ?').run(req.params.id);
  res.json({ message: 'Club supprimé.' });
});

// GET /api/clubs/meta/villes
router.get('/meta/villes', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT DISTINCT ville FROM CLUB ORDER BY ville').all().map(r => r.ville));
});

// GET /api/clubs/meta/regions
router.get('/meta/regions', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  res.json(db.prepare('SELECT DISTINCT region FROM CLUB ORDER BY region').all().map(r => r.region));
});

module.exports = router;
