const ROLE_PRIORITY = ['administrateur', 'president', 'directeur', 'competiteur', 'evaluateur'];

function getUserRole(db, numUtilisateur) {
  if (db.prepare('SELECT 1 FROM ADMINISTRATEUR WHERE numUtilisateur = ?').get(numUtilisateur)) return 'administrateur';
  if (db.prepare('SELECT 1 FROM PRESIDENT WHERE numUtilisateur = ?').get(numUtilisateur)) return 'president';
  if (db.prepare('SELECT 1 FROM DIRECTEUR WHERE numUtilisateur = ?').get(numUtilisateur)) return 'directeur';
  if (db.prepare('SELECT 1 FROM COMPETITEUR WHERE numUtilisateur = ?').get(numUtilisateur)) return 'competiteur';
  if (db.prepare('SELECT 1 FROM EVALUATEUR WHERE numUtilisateur = ?').get(numUtilisateur)) return 'evaluateur';
  return 'aucun';
}

function hasAnyRole(role, allowedRoles) {
  return allowedRoles.includes(role);
}

module.exports = { getUserRole, hasAnyRole, ROLE_PRIORITY };
