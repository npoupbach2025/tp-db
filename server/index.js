const express = require('express');
const cors = require('cors');
const path = require('path');
const { initDb, closeDb, startAutoSave } = require('./database');
const { requireAuth } = require('./middleware/auth');
const { visitTracker, actionTracker } = require('./middleware/activityLogger');

const app = express();
app.set('trust proxy', true);
const PORT = 3001;
const tpProjectRoot = process.env.TP_PROJECT_ROOT || path.resolve(__dirname, '../tp');
const tpDocsDir = path.join(tpProjectRoot, 'docs');
const uploadsDir = path.join(__dirname, 'uploads');

// Middleware
app.use(cors());
app.use(express.json());

// Activity tracking (Discord notifications)
app.use(visitTracker);
app.use(actionTracker);

// Routes API
app.use('/api/auth', require('./routes/auth'));
app.use('/api/activity', require('./routes/activity'));
app.use('/api', requireAuth);
app.use('/api/clubs', require('./routes/clubs'));
app.use('/api/utilisateurs', require('./routes/utilisateurs'));
app.use('/api/concours', require('./routes/concours'));
app.use('/api/dessins', require('./routes/dessins'));
app.use('/api/evaluations', require('./routes/evaluations'));
app.use('/api/inscriptions', require('./routes/inscriptions'));
app.use('/api/jury', require('./routes/jury'));
app.use('/api/dashboard', require('./routes/dashboard'));
app.use('/api/resultats', require('./routes/resultats'));
app.use('/api/requetes-tp', require('./routes/requetesTp'));
app.use('/api/tp', require('./routes/tp'));
app.use('/api/sql-console', require('./routes/sqlConsole'));
app.use('/tp-assets', express.static(tpDocsDir));
app.use('/uploads', express.static(uploadsDir));

// Servir le frontend en production
const frontendDist = path.join(__dirname, '..', 'dist');
app.use(express.static(frontendDist));
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(frontendDist, 'index.html'));
  }
});

// Gestion erreurs globale
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Erreur serveur interne' });
});

// Démarrage asynchrone (sql.js est async)
async function start() {
  await initDb();
  startAutoSave();
  app.listen(PORT, () => {
    console.log(`\n  Serveur Concours de Dessins demarre sur http://localhost:${PORT}`);
    console.log(`  API disponible sur http://localhost:${PORT}/api\n`);
  });
}

start().catch(err => {
  console.error('Erreur au demarrage:', err);
  process.exit(1);
});

// Fermer proprement la base
process.on('SIGINT', () => { closeDb(); process.exit(0); });
process.on('SIGTERM', () => { closeDb(); process.exit(0); });
