const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { requireRole } = require('../middleware/auth');
const { getUserRole } = require('../lib/userRole');

// GET /api/utilisateurs
router.get('/', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { role, numClub, search } = req.query;
  let sql = `
    SELECT u.*,
      CASE
        WHEN EXISTS (SELECT 1 FROM ADMINISTRATEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'administrateur'
        WHEN EXISTS (SELECT 1 FROM PRESIDENT WHERE numUtilisateur = u.numUtilisateur) THEN 'president'
        WHEN EXISTS (SELECT 1 FROM DIRECTEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'directeur'
        WHEN EXISTS (SELECT 1 FROM COMPETITEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'competiteur'
        WHEN EXISTS (SELECT 1 FROM EVALUATEUR WHERE numUtilisateur = u.numUtilisateur) THEN 'evaluateur'
        ELSE 'aucun'
      END as role,
      c.nomClub
    FROM UTILISATEUR u
    LEFT JOIN CLUB c ON u.numClub = c.numClub
    WHERE 1=1
  `;
  const params = [];

  if (numClub) { sql += ' AND u.numClub = ?'; params.push(numClub); }
  if (search) { sql += ' AND (u.nom LIKE ? OR u.prenom LIKE ? OR u.login LIKE ? OR u.email LIKE ?)'; params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`); }

  sql += ' ORDER BY u.numUtilisateur';

  let results = db.prepare(sql).all(...params);

  if (role) {
    results = results.filter(r => r.role === role);
  }

  res.json(results);
});

// GET /api/utilisateurs/:id
router.get('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const user = db.prepare('SELECT u.*, c.nomClub FROM UTILISATEUR u LEFT JOIN CLUB c ON u.numClub = c.numClub WHERE u.numUtilisateur = ?').get(req.params.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

  const role = getUserRole(db, user.numUtilisateur);
  let roleData = null;
  if (role === 'administrateur') roleData = db.prepare('SELECT * FROM ADMINISTRATEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'president') roleData = db.prepare('SELECT * FROM PRESIDENT WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'directeur') roleData = db.prepare('SELECT * FROM DIRECTEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'competiteur') roleData = db.prepare('SELECT * FROM COMPETITEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'evaluateur') roleData = db.prepare('SELECT * FROM EVALUATEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);

  res.json({ ...user, role, roleData });
});

// POST /api/utilisateurs
router.post('/', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { nom, prenom, adresse, login, motDePasse, email, dateNaissance, numClub, role, roleData } = req.body;

  if (!nom || !prenom || !login || !motDePasse) {
    return res.status(400).json({ error: 'Nom, prénom, login et mot de passe requis.' });
  }

  // Vérifier login unique
  const existing = db.prepare('SELECT 1 FROM UTILISATEUR WHERE login = ?').get(login);
  if (existing) return res.status(409).json({ error: 'Ce login est déjà utilisé.' });

  const insertUser = db.transaction(() => {
    const result = db.prepare(
      'INSERT INTO UTILISATEUR (nom, prenom, adresse, login, motDePasse, email, dateNaissance, numClub) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    ).run(nom, prenom, adresse || null, login, motDePasse, email || null, dateNaissance || null, numClub || null);

    const id = result.lastInsertRowid;

    if (role && roleData) {
      switch (role) {
        case 'administrateur':
          db.prepare('INSERT INTO ADMINISTRATEUR (numUtilisateur, dateDebut) VALUES (?, ?)').run(id, roleData.dateDebut || null);
          break;
        case 'directeur':
          db.prepare('INSERT INTO DIRECTEUR (numUtilisateur, dateDebut, numClub) VALUES (?, ?, ?)').run(id, roleData.dateDebut || null, roleData.numClub || numClub);
          break;
        case 'president':
          db.prepare('INSERT INTO PRESIDENT (numUtilisateur, prime, dateElection) VALUES (?, ?, ?)').run(id, roleData.prime || 0, roleData.dateElection || null);
          db.prepare('INSERT INTO DIRECTEUR (numUtilisateur, dateDebut, numClub) VALUES (?, ?, ?)').run(id, roleData.dateElection || null, numClub);
          break;
        case 'competiteur':
          db.prepare('INSERT INTO COMPETITEUR (numUtilisateur, datePremiereParticipation, categorie) VALUES (?, ?, ?)').run(id, roleData.datePremiereParticipation || null, roleData.categorie || 'junior');
          break;
        case 'evaluateur':
          db.prepare('INSERT INTO EVALUATEUR (numUtilisateur, specialite, niveau, experience) VALUES (?, ?, ?, ?)').run(id, roleData.specialite || null, roleData.niveau || 'debutant', roleData.experience || 0);
          break;
      }
    }

    return id;
  });

  try {
    const id = insertUser();
    res.status(201).json({ numUtilisateur: id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/utilisateurs/:id
router.put('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const { nom, prenom, adresse, login, motDePasse, email, dateNaissance, numClub } = req.body;

  const existing = db.prepare('SELECT * FROM UTILISATEUR WHERE numUtilisateur = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

  // Vérifier login unique (si changé)
  if (login !== existing.login) {
    const dup = db.prepare('SELECT 1 FROM UTILISATEUR WHERE login = ? AND numUtilisateur != ?').get(login, req.params.id);
    if (dup) return res.status(409).json({ error: 'Ce login est déjà utilisé.' });
  }

  db.prepare(
    'UPDATE UTILISATEUR SET nom=?, prenom=?, adresse=?, login=?, motDePasse=?, email=?, dateNaissance=?, numClub=? WHERE numUtilisateur=?'
  ).run(nom, prenom, adresse, login, motDePasse || existing.motDePasse, email, dateNaissance, numClub, req.params.id);

  res.json({ numUtilisateur: Number(req.params.id), ...req.body });
});

// DELETE /api/utilisateurs/:id
router.delete('/:id', requireRole('administrateur', 'directeur', 'president'), (req, res) => {
  const db = getDb();
  const id = Number(req.params.id);
  const existing = db.prepare('SELECT * FROM UTILISATEUR WHERE numUtilisateur = ?').get(id);
  if (!existing) return res.status(404).json({ error: 'Utilisateur non trouvé.' });

  const deleteUser = db.transaction(() => {
    // Supprimer les données liées au rôle
    db.prepare('DELETE FROM ADMINISTRATEUR WHERE numUtilisateur = ?').run(id);
    db.prepare('DELETE FROM DIRECTEUR WHERE numUtilisateur = ?').run(id);
    db.prepare('DELETE FROM PRESIDENT WHERE numUtilisateur = ?').run(id);
    // Supprimer évaluations de cet évaluateur
    db.prepare('DELETE FROM EVALUATION WHERE numEvaluateur = ?').run(id);
    // Supprimer évaluations de ses dessins puis ses dessins
    db.prepare('DELETE FROM EVALUATION WHERE numDessin IN (SELECT numDessin FROM DESSIN WHERE numCompetiteur = ?)').run(id);
    db.prepare('DELETE FROM DESSIN WHERE numCompetiteur = ?').run(id);
    // Supprimer inscriptions
    db.prepare('DELETE FROM INSCRIPTION_COMPETITEUR_CONCOURS WHERE numCompetiteur = ?').run(id);
    db.prepare('DELETE FROM INSCRIPTION_EVALUATEUR_CONCOURS WHERE numEvaluateur = ?').run(id);
    db.prepare('DELETE FROM COMPETITEUR WHERE numUtilisateur = ?').run(id);
    db.prepare('DELETE FROM EVALUATEUR WHERE numUtilisateur = ?').run(id);
    db.prepare('DELETE FROM UTILISATEUR WHERE numUtilisateur = ?').run(id);
  });

  try {
    deleteUser();
    res.json({ message: 'Utilisateur supprimé.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
