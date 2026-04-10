const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');

const DESSINS_UPLOAD_DIR = path.resolve(__dirname, '../uploads/dessins');

function ensureUploadDir() {
  fs.mkdirSync(DESSINS_UPLOAD_DIR, { recursive: true });
}

function sanitizeFileName(name) {
  return String(name || 'dessin')
    .toLowerCase()
    .replace(/[^a-z0-9._-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^[-.]+|[-.]+$/g, '') || 'dessin';
}

function parseImageDataUrl(dataUrl) {
  const match = String(dataUrl || '').match(/^data:(image\/(png|jpeg|jpg|webp));base64,(.+)$/i);
  if (!match) return null;
  return {
    mimeType: match[1].toLowerCase(),
    base64: match[3],
  };
}

// POST /api/dessins/upload
router.post('/upload', requireRole('administrateur', 'directeur', 'president', 'competiteur'), (req, res) => {
  const { fileName, dataUrl } = req.body || {};
  const parsed = parseImageDataUrl(dataUrl);
  if (!parsed) {
    return res.status(400).json({ error: 'Format image invalide. Utiliser un data URL image/png, image/jpeg ou image/webp.' });
  }

  const extByMime = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/webp': '.webp',
  };
  const ext = extByMime[parsed.mimeType];
  if (!ext) {
    return res.status(400).json({ error: 'Type de fichier non autorisé. Autorisés: PNG, JPG, WEBP.' });
  }

  const buffer = Buffer.from(parsed.base64, 'base64');
  const maxSize = 5 * 1024 * 1024;
  if (buffer.length > maxSize) {
    return res.status(400).json({ error: 'Fichier trop volumineux (max 5 Mo).' });
  }

  ensureUploadDir();
  const safeBase = sanitizeFileName(fileName).replace(/\.[a-z0-9]+$/i, '');
  const storedName = `${Date.now()}-${safeBase}${ext}`;
  const absPath = path.join(DESSINS_UPLOAD_DIR, storedName);
  fs.writeFileSync(absPath, buffer);

  return res.status(201).json({
    fileName: storedName,
    path: `/uploads/dessins/${storedName}`,
  });
});

// GET /api/dessins
router.get('/', (req, res) => {
  const db = getDb();
  const { numConcours, numCompetiteur, search } = req.query;
  let sql = `
    SELECT d.*,
      u.nom as competiteurNom, u.prenom as competiteurPrenom,
      cl.nomClub, cl.region,
      co.theme as concoursTheme,
      (SELECT ROUND(AVG(e.note), 2) FROM EVALUATION e WHERE e.numDessin = d.numDessin) as moyenneNote,
      (SELECT COUNT(*) FROM EVALUATION e WHERE e.numDessin = d.numDessin) as nbEvaluations
    FROM DESSIN d
    JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
    LEFT JOIN CLUB cl ON u.numClub = cl.numClub
    JOIN CONCOURS co ON d.numConcours = co.numConcours
    WHERE 1=1
  `;
  const params = [];
  if (req.auth?.role === 'competiteur') {
    sql += ' AND d.numCompetiteur = ?';
    params.push(req.auth.userId);
  }
  if (req.auth?.role === 'evaluateur') {
    sql += ' AND EXISTS (SELECT 1 FROM AFFECTATION_JURY aj WHERE aj.numDessin = d.numDessin AND aj.numEvaluateur = ?)';
    params.push(req.auth.userId);
  }
  if (numConcours) { sql += ' AND d.numConcours = ?'; params.push(numConcours); }
  if (numCompetiteur) { sql += ' AND d.numCompetiteur = ?'; params.push(numCompetiteur); }
  if (search) { sql += ' AND (d.titre LIKE ? OR d.commentaire LIKE ? OR u.nom LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  sql += ' ORDER BY d.numDessin DESC';
  res.json(db.prepare(sql).all(...params));
});

// GET /api/dessins/:id
router.get('/:id', (req, res) => {
  const db = getDb();
  const dessin = db.prepare(`
    SELECT d.*,
      u.nom as competiteurNom, u.prenom as competiteurPrenom,
      cl.nomClub, co.theme as concoursTheme,
      (SELECT ROUND(AVG(e.note), 2) FROM EVALUATION e WHERE e.numDessin = d.numDessin) as moyenneNote
    FROM DESSIN d
    JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
    LEFT JOIN CLUB cl ON u.numClub = cl.numClub
    JOIN CONCOURS co ON d.numConcours = co.numConcours
    WHERE d.numDessin = ?
  `).get(req.params.id);
  if (!dessin) return res.status(404).json({ error: 'Dessin non trouvé.' });

  if (req.auth?.role === 'competiteur' && Number(dessin.numCompetiteur) !== Number(req.auth.userId)) {
    return res.status(403).json({ error: 'Un compétiteur ne peut voir que ses propres dessins.' });
  }

  if (req.auth?.role === 'evaluateur') {
    const hasAccess = db.prepare(
      'SELECT 1 FROM AFFECTATION_JURY WHERE numDessin = ? AND numEvaluateur = ?'
    ).get(req.params.id, req.auth.userId);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Un évaluateur ne peut consulter que les dessins qui lui sont affectés.' });
    }
  }

  const evaluations = db.prepare(`
    SELECT ev.*, eu.nom as evaluateurNom, eu.prenom as evaluateurPrenom
    FROM EVALUATION ev
    JOIN UTILISATEUR eu ON ev.numEvaluateur = eu.numUtilisateur
    WHERE ev.numDessin = ?
  `).all(req.params.id);

  res.json({ ...dessin, evaluations });
});

// POST /api/dessins
router.post('/', requireRole('administrateur', 'directeur', 'president', 'competiteur'), (req, res) => {
  const db = getDb();
  const { commentaire, dateRemise, leDessin, titre, numCompetiteur, numConcours } = req.body;

  if (req.auth?.role === 'competiteur' && req.auth.userId !== Number(numCompetiteur)) {
    return res.status(403).json({ error: 'Un compétiteur ne peut déposer que ses propres dessins.' });
  }

  if (!numCompetiteur || !numConcours || !titre) {
    return res.status(400).json({ error: 'Compétiteur, concours et titre requis.' });
  }

  // Vérifier que le compétiteur est inscrit
  const inscrit = db.prepare('SELECT 1 FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ? AND numConcours = ?').get(numCompetiteur, numConcours);
  if (!inscrit) return res.status(400).json({ error: 'Ce compétiteur n\'est pas inscrit à ce concours.' });

  // Vérifier max dessins
  const concours = db.prepare('SELECT nbMaxDessinsParCompetiteur, etat FROM CONCOURS WHERE numConcours = ?').get(numConcours);
  if (!concours) {
    return res.status(400).json({ error: 'Concours introuvable.' });
  }
  if (concours.etat !== 'en_cours') {
    return res.status(400).json({ error: 'Le dépôt est autorisé uniquement quand le concours est en cours.' });
  }
  const max = concours?.nbMaxDessinsParCompetiteur || 3;
  const count = db.prepare('SELECT COUNT(*) as c FROM DESSIN WHERE numCompetiteur = ? AND numConcours = ?').get(numCompetiteur, numConcours).c;
  if (count >= max) {
    return res.status(400).json({ error: `Maximum ${max} dessins par compétiteur pour ce concours atteint (${count}/${max}).` });
  }

  const result = db.prepare(
    'INSERT INTO DESSIN (commentaire, dateRemise, leDessin, titre, numCompetiteur, numConcours) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(commentaire || null, dateRemise || null, leDessin || null, titre, numCompetiteur, numConcours);

  res.status(201).json({ numDessin: result.lastInsertRowid, ...req.body });
});

// PUT /api/dessins/:id
router.put('/:id', requireRole('administrateur', 'directeur', 'president', 'competiteur'), (req, res) => {
  const db = getDb();
  const { commentaire, classement, dateRemise, leDessin, titre } = req.body;
  const existing = db.prepare('SELECT * FROM DESSIN WHERE numDessin = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Dessin non trouvé.' });

  if (req.auth?.role === 'competiteur' && req.auth.userId !== Number(existing.numCompetiteur)) {
    return res.status(403).json({ error: 'Un compétiteur ne peut modifier que ses propres dessins.' });
  }

  db.prepare(
    'UPDATE DESSIN SET commentaire=?, classement=?, dateRemise=?, leDessin=?, titre=? WHERE numDessin=?'
  ).run(commentaire, classement || null, dateRemise, leDessin, titre, req.params.id);

  res.json({ numDessin: Number(req.params.id), ...req.body });
});

// DELETE /api/dessins/:id
router.delete('/:id', requireRole('administrateur', 'directeur', 'president', 'competiteur'), (req, res) => {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM DESSIN WHERE numDessin = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Dessin non trouvé.' });

  if (req.auth?.role === 'competiteur' && req.auth.userId !== Number(existing.numCompetiteur)) {
    return res.status(403).json({ error: 'Un compétiteur ne peut supprimer que ses propres dessins.' });
  }

  db.prepare('DELETE FROM EVALUATION WHERE numDessin = ?').run(req.params.id);
  db.prepare('DELETE FROM DESSIN WHERE numDessin = ?').run(req.params.id);
  res.json({ message: 'Dessin supprimé.' });
});

module.exports = router;
