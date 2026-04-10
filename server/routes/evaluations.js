const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');

// GET /api/evaluations
router.get('/', (req, res) => {
  const db = getDb();
  const { numConcours, numEvaluateur, numDessin, search } = req.query;
  let sql = `
    SELECT ev.*,
      eu.nom as evaluateurNom, eu.prenom as evaluateurPrenom,
      d.titre as dessinTitre, d.numConcours,
      co.theme as concoursTheme,
      cu.nom as competiteurNom, cu.prenom as competiteurPrenom
    FROM EVALUATION ev
    JOIN UTILISATEUR eu ON ev.numEvaluateur = eu.numUtilisateur
    JOIN DESSIN d ON ev.numDessin = d.numDessin
    JOIN CONCOURS co ON d.numConcours = co.numConcours
    JOIN UTILISATEUR cu ON d.numCompetiteur = cu.numUtilisateur
    WHERE 1=1
  `;
  const params = [];
  if (req.auth?.role === 'evaluateur') {
    sql += ' AND ev.numEvaluateur = ?';
    params.push(req.auth.userId);
  }
  if (req.auth?.role === 'competiteur') {
    sql += ' AND d.numCompetiteur = ?';
    params.push(req.auth.userId);
  }
  if (numConcours) { sql += ' AND d.numConcours = ?'; params.push(numConcours); }
  if (numEvaluateur) { sql += ' AND ev.numEvaluateur = ?'; params.push(numEvaluateur); }
  if (numDessin) { sql += ' AND ev.numDessin = ?'; params.push(numDessin); }
  if (search) { sql += ' AND (d.titre LIKE ? OR ev.commentaire LIKE ? OR eu.nom LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY ev.dateEvaluation DESC, ev.numDessin';
  res.json(db.prepare(sql).all(...params));
});

// POST /api/evaluations
router.post('/', requireRole('administrateur', 'directeur', 'president', 'evaluateur'), (req, res) => {
  const db = getDb();
  const { numEvaluateur, numDessin, dateEvaluation, note, commentaire, appreciation } = req.body;

  if (req.auth?.role === 'evaluateur' && req.auth.userId !== Number(numEvaluateur)) {
    return res.status(403).json({ error: 'Un évaluateur ne peut soumettre que ses propres évaluations.' });
  }

  if (numEvaluateur == null || numDessin == null || note == null) {
    return res.status(400).json({ error: 'Évaluateur, dessin et note requis.' });
  }

  // Valider la note
  if (note < 0 || note > 20) {
    return res.status(400).json({ error: 'La note doit être entre 0 et 20.' });
  }

  // Valider l'appréciation
  const validAppreciations = ['insuffisant', 'passable', 'bien', 'tres_bien', 'excellent'];
  if (appreciation && !validAppreciations.includes(appreciation)) {
    return res.status(400).json({ error: `Appréciation invalide. Valeurs: ${validAppreciations.join(', ')}` });
  }

  // Vérifier doublon
  const existing = db.prepare('SELECT 1 FROM EVALUATION WHERE numEvaluateur = ? AND numDessin = ?').get(numEvaluateur, numDessin);
  if (existing) {
    return res.status(409).json({ error: 'Cet évaluateur a déjà évalué ce dessin.' });
  }

  // Max 2 évaluations par dessin
  const evalsForDessin = db.prepare('SELECT COUNT(*) as c FROM EVALUATION WHERE numDessin = ?').get(numDessin).c;
  if (evalsForDessin >= 2) {
    return res.status(400).json({ error: 'Maximum 2 évaluations par dessin atteint.' });
  }

  // Max 8 évaluations par évaluateur par concours
  const dessin = db.prepare('SELECT numConcours FROM DESSIN WHERE numDessin = ?').get(numDessin);
  if (!dessin) {
    return res.status(400).json({ error: 'Dessin introuvable.' });
  }

  const concours = db.prepare('SELECT etat FROM CONCOURS WHERE numConcours = ?').get(dessin.numConcours);
  if (!concours) {
    return res.status(400).json({ error: 'Concours introuvable pour ce dessin.' });
  }
  if (concours.etat !== 'attente') {
    return res.status(400).json({ error: 'Les évaluations sont autorisées uniquement quand le concours est en attente.' });
  }

  const evaluateurInscrit = db.prepare(
    'SELECT 1 FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numEvaluateur = ? AND numConcours = ?'
  ).get(numEvaluateur, dessin.numConcours);
  if (!evaluateurInscrit) {
    return res.status(400).json({ error: 'Cet évaluateur n\'est pas inscrit dans ce concours.' });
  }

  const affecteJury = db.prepare(
    'SELECT 1 FROM AFFECTATION_JURY WHERE numDessin = ? AND numEvaluateur = ?'
  ).get(numDessin, numEvaluateur);
  if (!affecteJury) {
    return res.status(400).json({ error: 'Cet évaluateur n\'est pas affecté au jury de ce dessin.' });
  }

  if (dessin) {
    const evalsInConcours = db.prepare(`
      SELECT COUNT(*) as c FROM EVALUATION ev
      JOIN DESSIN d ON ev.numDessin = d.numDessin
      WHERE ev.numEvaluateur = ? AND d.numConcours = ?
    `).get(numEvaluateur, dessin.numConcours).c;
    if (evalsInConcours >= 8) {
      return res.status(400).json({ error: 'Maximum 8 évaluations par évaluateur par concours atteint.' });
    }
  }

  // Vérifier que l'évaluateur n'est pas compétiteur dans ce concours
  const isComp = db.prepare('SELECT 1 FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ? AND numConcours = ?').get(numEvaluateur, dessin.numConcours);
  if (isComp) {
    return res.status(400).json({ error: 'Un évaluateur ne peut pas évaluer dans un concours où il est compétiteur.' });
  }

  db.prepare(
    'INSERT INTO EVALUATION (numEvaluateur, numDessin, dateEvaluation, note, commentaire, appreciation) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(numEvaluateur, numDessin, dateEvaluation || new Date().toISOString().split('T')[0], note, commentaire || null, appreciation || null);

  res.status(201).json({ numEvaluateur, numDessin, note });
});

// PUT /api/evaluations/:evaluateur/:dessin
router.put('/:evaluateur/:dessin', requireRole('administrateur', 'directeur', 'president', 'evaluateur'), (req, res) => {
  const db = getDb();
  const { dateEvaluation, note, commentaire, appreciation } = req.body;

  if (req.auth?.role === 'evaluateur' && req.auth.userId !== Number(req.params.evaluateur)) {
    return res.status(403).json({ error: 'Un évaluateur ne peut modifier que ses propres évaluations.' });
  }

  if (note < 0 || note > 20) {
    return res.status(400).json({ error: 'La note doit être entre 0 et 20.' });
  }

  const existing = db.prepare('SELECT * FROM EVALUATION WHERE numEvaluateur = ? AND numDessin = ?').get(req.params.evaluateur, req.params.dessin);
  if (!existing) return res.status(404).json({ error: 'Évaluation non trouvée.' });

  db.prepare(
    'UPDATE EVALUATION SET dateEvaluation=?, note=?, commentaire=?, appreciation=? WHERE numEvaluateur=? AND numDessin=?'
  ).run(dateEvaluation, note, commentaire, appreciation, req.params.evaluateur, req.params.dessin);

  res.json({ message: 'Évaluation mise à jour.' });
});

// DELETE /api/evaluations/:evaluateur/:dessin
router.delete('/:evaluateur/:dessin', requireRole('administrateur', 'directeur', 'president', 'evaluateur'), (req, res) => {
  const db = getDb();
  if (req.auth?.role === 'evaluateur' && req.auth.userId !== Number(req.params.evaluateur)) {
    return res.status(403).json({ error: 'Un évaluateur ne peut supprimer que ses propres évaluations.' });
  }
  const existing = db.prepare('SELECT * FROM EVALUATION WHERE numEvaluateur = ? AND numDessin = ?').get(req.params.evaluateur, req.params.dessin);
  if (!existing) return res.status(404).json({ error: 'Évaluation non trouvée.' });

  db.prepare('DELETE FROM EVALUATION WHERE numEvaluateur = ? AND numDessin = ?').run(req.params.evaluateur, req.params.dessin);
  res.json({ message: 'Évaluation supprimée.' });
});

module.exports = router;
