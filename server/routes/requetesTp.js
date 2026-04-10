const express = require('express');
const router = express.Router();

const { getDb } = require('../database');

const REQUETES = {
  1: {
    titre: 'Compétiteurs ayant participé à un concours en 2024',
    sql: `
      SELECT DISTINCT u.nom, u.prenom, u.adresse,
        CAST((julianday('now') - julianday(u.dateNaissance)) / 365.25 AS INT) AS age,
        co.description, co.dateDebut, co.dateFin,
        cl.nomClub, cl.departement, cl.region
      FROM UTILISATEUR u
      JOIN COMPETITEUR comp ON comp.numUtilisateur = u.numUtilisateur
      JOIN INSCRIPTION_COMPETITEUR_CONCOURS icc ON icc.numCompetiteur = u.numUtilisateur
      JOIN CONCOURS co ON co.numConcours = icc.numConcours
      JOIN CLUB cl ON cl.numClub = u.numClub
      WHERE strftime('%Y', co.dateDebut) = '2024'
      ORDER BY u.nom, u.prenom
    `,
  },
  2: {
    titre: 'Dessins évalués en 2023 triés par note croissante',
    sql: `
      SELECT d.numDessin, e.note, u.nom AS nomCompetiteur, u.prenom AS prenomCompetiteur,
        co.description, co.theme
      FROM EVALUATION e
      JOIN DESSIN d ON d.numDessin = e.numDessin
      JOIN UTILISATEUR u ON u.numUtilisateur = d.numCompetiteur
      JOIN CONCOURS co ON co.numConcours = d.numConcours
      WHERE strftime('%Y', co.dateDebut) = '2023'
      ORDER BY e.note ASC, d.numDessin ASC
    `,
  },
  3: {
    titre: 'Informations détaillées de tous les dessins évalués',
    sql: `
      SELECT d.numDessin,
        strftime('%Y', co.dateDebut) AS annee,
        co.description,
        cu.nom AS nomCompetiteur,
        cu.prenom AS prenomCompetiteur,
        d.commentaire AS commentaireDessin,
        e.note,
        e.commentaire AS commentaireEvaluation,
        eu.nom AS nomEvaluateur,
        eu.prenom AS prenomEvaluateur
      FROM DESSIN d
      JOIN CONCOURS co ON co.numConcours = d.numConcours
      JOIN UTILISATEUR cu ON cu.numUtilisateur = d.numCompetiteur
      JOIN EVALUATION e ON e.numDessin = d.numDessin
      JOIN UTILISATEUR eu ON eu.numUtilisateur = e.numEvaluateur
      ORDER BY annee, d.numDessin
    `,
  },
  4: {
    titre: 'Compétiteurs ayant participé à tous les concours 2023-2024',
    sql: `
      SELECT u.nom, u.prenom,
        CAST((julianday('now') - julianday(u.dateNaissance)) / 365.25 AS INT) AS age
      FROM UTILISATEUR u
      JOIN COMPETITEUR comp ON comp.numUtilisateur = u.numUtilisateur
      WHERE NOT EXISTS (
        SELECT 1
        FROM CONCOURS c
        WHERE strftime('%Y', c.dateDebut) IN ('2023', '2024')
          AND NOT EXISTS (
            SELECT 1
            FROM INSCRIPTION_COMPETITEUR_CONCOURS i
            WHERE i.numCompetiteur = u.numUtilisateur
              AND i.numConcours = c.numConcours
          )
      )
      ORDER BY age ASC
    `,
  },
  5: {
    titre: 'Région ayant la meilleure moyenne de notes',
    sql: `
      SELECT cl.region, ROUND(AVG(e.note), 2) AS moyenne
      FROM EVALUATION e
      JOIN DESSIN d ON d.numDessin = e.numDessin
      JOIN UTILISATEUR u ON u.numUtilisateur = d.numCompetiteur
      JOIN CLUB cl ON cl.numClub = u.numClub
      GROUP BY cl.region
      ORDER BY moyenne DESC
      LIMIT 1
    `,
  },
  6: {
    titre: 'Classement final d\'un concours évalué (concours 1)',
    sql: `
      SELECT d.numDessin, d.titre,
        u.nom || ' ' || u.prenom AS competiteur,
        cl.nomClub,
        ROUND(AVG(e.note), 2) AS moyenne,
        RANK() OVER (ORDER BY AVG(e.note) DESC) AS classement
      FROM DESSIN d
      JOIN EVALUATION e ON d.numDessin = e.numDessin
      JOIN UTILISATEUR u ON d.numCompetiteur = u.numUtilisateur
      JOIN CLUB cl ON u.numClub = cl.numClub
      WHERE d.numConcours = 1
      GROUP BY d.numDessin, d.titre, u.nom, u.prenom, cl.nomClub
      ORDER BY moyenne DESC
    `,
  },
  7: {
    titre: 'Nombre de dessins soumis par club et par concours',
    sql: `
      SELECT cl.nomClub, co.theme AS concours,
        COUNT(d.numDessin) AS nb_dessins
      FROM CLUB cl
      JOIN UTILISATEUR u ON cl.numClub = u.numClub
      JOIN DESSIN d ON u.numUtilisateur = d.numCompetiteur
      JOIN CONCOURS co ON d.numConcours = co.numConcours
      GROUP BY cl.numClub, cl.nomClub, co.numConcours, co.theme
      ORDER BY co.numConcours, cl.nomClub
    `,
  },
  8: {
    titre: 'Taux de participation par concours',
    sql: `
      SELECT co.numConcours, co.theme, co.etat,
        COUNT(icc.numCompetiteur) AS nb_competiteurs,
        (SELECT COUNT(*) FROM COMPETITEUR) AS total_competiteurs,
        ROUND(COUNT(icc.numCompetiteur) * 100.0 / (SELECT COUNT(*) FROM COMPETITEUR), 1) AS taux_participation_pct
      FROM CONCOURS co
      LEFT JOIN INSCRIPTION_COMPETITEUR_CONCOURS icc ON co.numConcours = icc.numConcours
      GROUP BY co.numConcours, co.theme, co.etat
      ORDER BY co.numConcours
    `,
  },
  9: {
    titre: 'Dessins en attente d\'évaluation complète',
    sql: `
      SELECT co.numConcours, co.theme,
        d.numDessin, d.titre,
        COUNT(e.numEvaluateur) AS nb_evaluations,
        (2 - COUNT(e.numEvaluateur)) AS evaluations_manquantes
      FROM CONCOURS co
      JOIN DESSIN d ON co.numConcours = d.numConcours
      LEFT JOIN EVALUATION e ON d.numDessin = e.numDessin
      WHERE co.etat = 'attente'
      GROUP BY co.numConcours, co.theme, d.numDessin, d.titre
      HAVING COUNT(e.numEvaluateur) < 2
      ORDER BY co.numConcours, d.numDessin
    `,
  },
  10: {
    titre: 'Évaluateurs avec le plus d\'évaluations par concours',
    sql: `
      SELECT co.numConcours, co.theme,
        u.nom || ' ' || u.prenom AS evaluateur,
        COUNT(e.numDessin) AS nb_dessins_evalues,
        (8 - COUNT(e.numDessin)) AS places_restantes
      FROM EVALUATION e
      JOIN DESSIN d ON e.numDessin = d.numDessin
      JOIN CONCOURS co ON d.numConcours = co.numConcours
      JOIN UTILISATEUR u ON e.numEvaluateur = u.numUtilisateur
      GROUP BY co.numConcours, co.theme, e.numEvaluateur, u.nom, u.prenom
      HAVING COUNT(e.numDessin) >= 3
      ORDER BY nb_dessins_evalues DESC, co.numConcours
    `,
  },
};

router.get('/', (req, res) => {
  const db = getDb();
  const payload = Object.entries(REQUETES).map(([id, def]) => {
    const rows = db.prepare(def.sql).all();
    return { id: Number(id), titre: def.titre, rows };
  });
  res.json(payload);
});

router.get('/:id', (req, res) => {
  const db = getDb();
  const def = REQUETES[req.params.id];
  if (!def) return res.status(404).json({ error: 'Requête TP inconnue.' });
  const rows = db.prepare(def.sql).all();
  res.json({ id: Number(req.params.id), titre: def.titre, rows });
});

module.exports = router;
