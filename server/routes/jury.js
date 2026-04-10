const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');

// GET /api/jury?numConcours=&numDessin=
router.get('/', (req, res) => {
  const db = getDb();
  const { numConcours, numDessin } = req.query;

  let sql = `
    SELECT aj.numDessin, aj.numEvaluateur, aj.dateAffectation,
      d.titre as dessinTitre, d.numConcours,
      co.theme as concoursTheme,
      eu.nom as evaluateurNom, eu.prenom as evaluateurPrenom,
      cl.nomClub as evaluateurClub
    FROM AFFECTATION_JURY aj
    JOIN DESSIN d ON d.numDessin = aj.numDessin
    JOIN CONCOURS co ON co.numConcours = d.numConcours
    JOIN UTILISATEUR eu ON eu.numUtilisateur = aj.numEvaluateur
    LEFT JOIN CLUB cl ON cl.numClub = eu.numClub
    WHERE 1=1
  `;

  const params = [];
  if (numConcours) { sql += ' AND d.numConcours = ?'; params.push(numConcours); }
  if (numDessin) { sql += ' AND d.numDessin = ?'; params.push(numDessin); }
  sql += ' ORDER BY d.numDessin, eu.nom, eu.prenom';

  res.json(db.prepare(sql).all(...params));
});

// POST /api/jury
router.post('/', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numDessin, numEvaluateur, dateAffectation } = req.body;

  if (!numDessin || !numEvaluateur) {
    return res.status(400).json({ error: 'numDessin et numEvaluateur sont requis.' });
  }

  const dessin = db.prepare('SELECT numDessin, numConcours FROM DESSIN WHERE numDessin = ?').get(numDessin);
  if (!dessin) return res.status(404).json({ error: 'Dessin introuvable.' });

  const isEval = db.prepare('SELECT 1 FROM EVALUATEUR WHERE numUtilisateur = ?').get(numEvaluateur);
  if (!isEval) return res.status(400).json({ error: 'Cet utilisateur n\'est pas évaluateur.' });

  const inscrit = db.prepare('SELECT 1 FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numEvaluateur = ? AND numConcours = ?').get(numEvaluateur, dessin.numConcours);
  if (!inscrit) return res.status(400).json({ error: 'Évaluateur non inscrit à ce concours.' });

  const isComp = db.prepare('SELECT 1 FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ? AND numConcours = ?').get(numEvaluateur, dessin.numConcours);
  if (isComp) return res.status(400).json({ error: 'Un compétiteur ne peut pas être évaluateur dans le même concours.' });

  const alreadyAssigned = db.prepare('SELECT 1 FROM AFFECTATION_JURY WHERE numDessin = ? AND numEvaluateur = ?').get(numDessin, numEvaluateur);
  if (alreadyAssigned) return res.status(409).json({ error: 'Cet évaluateur est déjà affecté à ce dessin.' });

  const countForDessin = db.prepare('SELECT COUNT(*) as c FROM AFFECTATION_JURY WHERE numDessin = ?').get(numDessin).c;
  if (countForDessin >= 2) return res.status(400).json({ error: 'Un dessin doit avoir exactement 2 évaluateurs maximum.' });

  const loadInConcours = db.prepare(`
    SELECT COUNT(*) as c
    FROM AFFECTATION_JURY aj
    JOIN DESSIN d ON d.numDessin = aj.numDessin
    WHERE aj.numEvaluateur = ? AND d.numConcours = ?
  `).get(numEvaluateur, dessin.numConcours).c;
  if (loadInConcours >= 8) return res.status(400).json({ error: 'Cet évaluateur est déjà à la limite de 8 dessins dans ce concours.' });

  db.prepare('INSERT INTO AFFECTATION_JURY (numDessin, numEvaluateur, dateAffectation) VALUES (?, ?, ?)')
    .run(numDessin, numEvaluateur, dateAffectation || new Date().toISOString().slice(0, 10));

  res.status(201).json({ numDessin, numEvaluateur });
});

// DELETE /api/jury/:numDessin/:numEvaluateur
router.delete('/:numDessin/:numEvaluateur', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { numDessin, numEvaluateur } = req.params;

  const existing = db.prepare('SELECT 1 FROM AFFECTATION_JURY WHERE numDessin = ? AND numEvaluateur = ?').get(numDessin, numEvaluateur);
  if (!existing) return res.status(404).json({ error: 'Affectation introuvable.' });

  const evalExists = db.prepare('SELECT 1 FROM EVALUATION WHERE numDessin = ? AND numEvaluateur = ?').get(numDessin, numEvaluateur);
  if (evalExists) return res.status(409).json({ error: 'Impossible de retirer: une évaluation existe déjà pour ce jury.' });

  db.prepare('DELETE FROM AFFECTATION_JURY WHERE numDessin = ? AND numEvaluateur = ?').run(numDessin, numEvaluateur);
  res.json({ message: 'Affectation jury supprimée.' });
});

module.exports = router;
