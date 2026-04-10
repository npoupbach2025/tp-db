const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'concours_dessins.db');

let db = null;
let dbReady = null;

// Wrapper qui émule l'API de better-sqlite3 par-dessus sql.js
class DbWrapper {
  constructor(sqlDb) {
    this._db = sqlDb;
  }

  exec(sql) {
    this._db.run(sql);
  }

  prepare(sql) {
    const self = this;
    return {
      get(...params) {
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        if (stmt.step()) {
          const row = stmt.getAsObject();
          stmt.free();
          return row;
        }
        stmt.free();
        return undefined;
      },
      all(...params) {
        const results = [];
        const stmt = self._db.prepare(sql);
        if (params.length > 0) stmt.bind(params);
        while (stmt.step()) {
          results.push(stmt.getAsObject());
        }
        stmt.free();
        return results;
      },
      run(...params) {
        self._db.run(sql, params);
        return {
          changes: self._db.getRowsModified(),
          lastInsertRowid: self._lastInsertRowid(),
        };
      },
    };
  }

  _lastInsertRowid() {
    const stmt = this._db.prepare('SELECT last_insert_rowid() as id');
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row.id;
  }

  pragma(str) {
    this._db.run(`PRAGMA ${str}`);
  }

  transaction(fn) {
    const self = this;
    return function (...args) {
      self._db.run('BEGIN TRANSACTION');
      try {
        const result = fn(...args);
        self._db.run('COMMIT');
        self._save();
        return result;
      } catch (err) {
        self._db.run('ROLLBACK');
        throw err;
      }
    };
  }

  _save() {
    const data = this._db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  }

  close() {
    this._save();
    this._db.close();
  }
}

async function initDbEngine() {
  const SQL = await initSqlJs();
  let sqlDb;
  if (fs.existsSync(DB_PATH)) {
    const fileBuffer = fs.readFileSync(DB_PATH);
    sqlDb = new SQL.Database(fileBuffer);
  } else {
    sqlDb = new SQL.Database();
  }
  db = new DbWrapper(sqlDb);
  db.pragma('foreign_keys = ON');

  // Créer le schéma si nécessaire
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.exec(schema);
  db.exec(`
    CREATE TRIGGER IF NOT EXISTS trg_block_admin_user_update
    BEFORE UPDATE ON UTILISATEUR
    FOR EACH ROW
    WHEN EXISTS (SELECT 1 FROM ADMINISTRATEUR a WHERE a.numUtilisateur = OLD.numUtilisateur)
    BEGIN
      SELECT RAISE(ABORT, 'Modification du compte administrateur interdite.');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_block_admin_user_delete
    BEFORE DELETE ON UTILISATEUR
    FOR EACH ROW
    WHEN EXISTS (SELECT 1 FROM ADMINISTRATEUR a WHERE a.numUtilisateur = OLD.numUtilisateur)
    BEGIN
      SELECT RAISE(ABORT, 'Suppression du compte administrateur interdite.');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_block_administrateur_changes
    BEFORE INSERT ON ADMINISTRATEUR
    BEGIN
      SELECT RAISE(ABORT, 'Modification de la table ADMINISTRATEUR interdite.');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_block_administrateur_update
    BEFORE UPDATE ON ADMINISTRATEUR
    BEGIN
      SELECT RAISE(ABORT, 'Modification de la table ADMINISTRATEUR interdite.');
    END;

    CREATE TRIGGER IF NOT EXISTS trg_block_administrateur_delete
    BEFORE DELETE ON ADMINISTRATEUR
    BEGIN
      SELECT RAISE(ABORT, 'Modification de la table ADMINISTRATEUR interdite.');
    END;
  `);
  db.exec(`
    INSERT OR IGNORE INTO AFFECTATION_JURY (numDessin, numEvaluateur, dateAffectation)
    SELECT numDessin, numEvaluateur, COALESCE(dateEvaluation, date('now'))
    FROM EVALUATION
  `);
  db._save();
  return db;
}

// Initialise la DB et retourne une promesse
function initDb() {
  if (!dbReady) {
    dbReady = initDbEngine();
  }
  return dbReady;
}

function getDb() {
  if (!db) throw new Error('Database not initialized. Call initDb() first.');
  return db;
}

function closeDb() {
  if (db) {
    db.close();
    db = null;
    dbReady = null;
  }
}

// Sauvegarde périodique (toutes les 5 secondes si des changements)
function startAutoSave() {
  setInterval(() => {
    if (db) db._save();
  }, 5000);
}

module.exports = { getDb, initDb, closeDb, startAutoSave, DB_PATH };
