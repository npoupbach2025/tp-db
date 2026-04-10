const { getDb } = require('../database');
const { getUserRole } = require('../lib/userRole');

function requireAuth(req, res, next) {
  if (req.method === 'OPTIONS') return next();

  const userIdRaw = req.headers['x-user-id'];
  const roleHeader = req.headers['x-user-role'];

  const userId = Number(userIdRaw);
  if (!userId || Number.isNaN(userId)) {
    return res.status(401).json({ error: 'Authentification requise (x-user-id manquant).' });
  }

  const db = getDb();
  const user = db.prepare('SELECT numUtilisateur, nom, prenom, login FROM UTILISATEUR WHERE numUtilisateur = ?').get(userId);
  if (!user) {
    return res.status(401).json({ error: 'Utilisateur de session introuvable.' });
  }

  const role = getUserRole(db, userId);
  if (roleHeader && roleHeader !== role) {
    return res.status(403).json({ error: 'Rôle de session invalide.' });
  }

  req.auth = { userId, role, user };
  next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (!req.auth) return res.status(401).json({ error: 'Authentification requise.' });
    if (!allowedRoles.includes(req.auth.role)) {
      return res.status(403).json({ error: 'Accès refusé pour ce rôle.' });
    }
    next();
  };
}

module.exports = { requireAuth, requireRole };
