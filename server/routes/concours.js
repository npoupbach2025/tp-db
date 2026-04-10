const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');

// GET /api/concours
router.get('/', (req, res) => {
  const db = getDb();
  const { etat, search } = req.query;
  let sql = `
    SELECT co.*, u.nom as presidentNom, u.prenom as presidentPrenom,
      (SELECT COUNT(*) FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numConcours = co.numConcours) as nbCompetiteurs,
      (SELECT COUNT(*) FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numConcours = co.numConcours) as nbEvaluateurs,
      (SELECT COUNT(*) FROM PARTICIPATION_CLUB_CONCOURS WHERE numConcours = co.numConcours) as nbClubs,
      (SELECT COUNT(*) FROM DESSIN WHERE numConcours = co.numConcours) as nbDessins
    FROM CONCOURS co
    LEFT JOIN UTILISATEUR u ON co.numPresident = u.numUtilisateur
    WHERE 1=1
  `;
  const params = [];
  if (etat) { sql += ' AND co.etat = ?'; params.push(etat); }
  if (search) { sql += ' AND (co.theme LIKE ? OR co.description LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }
  sql += ' ORDER BY co.dateDebut DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/concours/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const concours = db.prepare(`
    SELECT co.*, u.nom as presidentNom, u.prenom as presidentPrenom
    FROM CONCOURS co
    LEFT JOIN UTILISATEUR u ON co.numPresident = u.numUtilisateur
    WHERE co.numConcours = ?
  `).get(req.params.id);
  if (!concours) return res.status(404).json({ error: 'Concours non trouvé.' });

  // Clubs participants
  const clubs = db.prepare(`
    SELECT c.* FROM CLUB c
    JOIN PARTICIPATION_CLUB_CONCOURS p ON c.numClub = p.numClub
    WHERE p.numConcours = ? ORDER BY c.nomClub
  `).all(req.params.id);

  // Compétiteurs inscrits
  const competiteurs = db.prepare(`
    SELECT u.numUtilisateur, u.nom, u.prenom, cl.nomClub, comp.categorie
    FROM INSCRIPTION_COMPETITEUR_CONCOURS i
    JOIN UTILISATEUR u ON i.numCompetiteur = u.numUtilisateur
    JOIN COMPETITEUR comp ON u.numUtilisateur = comp.numUtilisateur
    LEFT JOIN CLUB cl ON u.numClub = cl.numClub
    WHERE i.numConcours = ? ORDER BY u.nom
  `).all(req.params.id);

  // Évaluateurs inscrits
  const evaluateurs = db.prepare(`
    SELECT u.numUtilisateur, u.nom, u.prenom, ev.specialite, ev.niveau
    FROM INSCRIPTION_EVALUATEUR_CONCOURS i
    JOIN UTILISATEUR u ON i.numEvaluateur = u.numUtilisateur
    JOIN EVALUATEUR ev ON u.numUtilisateur = ev.numUtilisateur
    WHERE i.numConcours = ? ORDER BY u.nom
  `).all(req.params.id);

  res.json({ ...concours, clubs, competiteurs, evaluateurs });
});

// POST /api/concours
router.post('/', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { theme, dateDebut, dateFin, etat, description, nbMaxDessinsParCompetiteur, nbMinClubs, numPresident } = req.body;
  if (!theme || !dateDebut || !dateFin) {
    return res.status(400).json({ error: 'Thème, date début et date fin requis.' });
  }
  const validEtats = ['pas_commence', 'en_cours', 'attente', 'resultat', 'evalue'];
  if (etat && !validEtats.includes(etat)) {
    return res.status(400).json({ error: `État invalide. Valeurs acceptées: ${validEtats.join(', ')}` });
  }

  const result = db.prepare(
    'INSERT INTO CONCOURS (theme, dateDebut, dateFin, etat, description, nbMaxDessinsParCompetiteur, nbMinClubs, numPresident) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
  ).run(theme, dateDebut, dateFin, etat || 'pas_commence', description || null, nbMaxDessinsParCompetiteur || 3, nbMinClubs || 6, numPresident || null);

  res.status(201).json({ numConcours: result.lastInsertRowid, ...req.body });
});

// PUT /api/concours/:id
router.put('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { theme, dateDebut, dateFin, etat, description, nbMaxDessinsParCompetiteur, nbMinClubs, numPresident } = req.body;
  const existing = db.prepare('SELECT * FROM CONCOURS WHERE numConcours = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Concours non trouvé.' });

  db.prepare(
    'UPDATE CONCOURS SET theme=?, dateDebut=?, dateFin=?, etat=?, description=?, nbMaxDessinsParCompetiteur=?, nbMinClubs=?, numPresident=? WHERE numConcours=?'
  ).run(theme, dateDebut, dateFin, etat, description, nbMaxDessinsParCompetiteur, nbMinClubs, numPresident, req.params.id);

  res.json({ numConcours: Number(req.params.id), ...req.body });
});

// DELETE /api/concours/:id
router.delete('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM CONCOURS WHERE numConcours = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Concours non trouvé.' });

  const deleteConcours = db.transaction(() => {
    db.prepare('DELETE FROM EVALUATION WHERE numDessin IN (SELECT numDessin FROM DESSIN WHERE numConcours = ?)').run(id);
    db.prepare('DELETE FROM DESSIN WHERE numConcours = ?').run(id);
    db.prepare('DELETE FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numConcours = ?').run(id);
    db.prepare('DELETE FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numConcours = ?').run(id);
    db.prepare('DELETE FROM PARTICIPATION_CLUB_CONCOURS WHERE numConcours = ?').run(id);
    db.prepare('DELETE FROM CONCOURS WHERE numConcours = ?').run(id);
  });

  try {
    deleteConcours();
    res.json({ message: 'Concours supprimé.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
