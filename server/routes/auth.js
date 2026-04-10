const express = require('express');
const router = express.Router();
const { getDb } = require('../database');
const { getUserRole } = require('../lib/userRole');

// POST /api/auth/login
router.post('/login', (req, res) => {
  const { login, motDePasse } = req.body;
  if (!login || !motDePasse) {
    return res.status(400).json({ error: 'Login et mot de passe requis.' });
  }

  const db = getDb();
  const user = db.prepare('SELECT * FROM UTILISATEUR WHERE login = ?').get(login);

  if (!user || user.motDePasse !== motDePasse) {
    return res.status(401).json({ error: 'Identifiants incorrects.' });
  }

  const role = getUserRole(db, user.numUtilisateur);
  let roleData = null;
  if (role === 'administrateur') roleData = db.prepare('SELECT * FROM ADMINISTRATEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'president') roleData = db.prepare('SELECT * FROM PRESIDENT WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'directeur') roleData = db.prepare('SELECT * FROM DIRECTEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'competiteur') roleData = db.prepare('SELECT * FROM COMPETITEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);
  else if (role === 'evaluateur') roleData = db.prepare('SELECT * FROM EVALUATEUR WHERE numUtilisateur = ?').get(user.numUtilisateur);

  // Récupérer le nom du club
  const club = db.prepare('SELECT nomClub FROM CLUB WHERE numClub = ?').get(user.numClub);

  res.json({
    user: {
      numUtilisateur: user.numUtilisateur,
      nom: user.nom,
      prenom: user.prenom,
      login: user.login,
      email: user.email,
      numClub: user.numClub,
      nomClub: club?.nomClub || '',
    },
    role,
    roleData,
  });
});

module.exports = router;
