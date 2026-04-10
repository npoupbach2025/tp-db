/**
 * Script d'initialisation de la base SQLite3
 * Lit le schéma SQLite3 et importe les données depuis le fichier MySQL du TP
 * Usage: node init-db.js
 */
const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'concours_dessins.db');

async function main() {
  // Supprimer la base existante si elle existe
  if (fs.existsSync(DB_PATH)) {
    fs.unlinkSync(DB_PATH);
    console.log('Base existante supprimee.');
  }

  const SQL = await initSqlJs();
  const db = new SQL.Database();

  // 1. Créer le schéma
  console.log('Creation du schema...');
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
  db.run(schema);
  console.log('Schema cree.');

  // 2. Lire le fichier d'insertion MySQL du TP
  const tpProjectRoot = process.env.TP_PROJECT_ROOT || path.resolve(__dirname, '../tp');
  const insertionPath = path.join(tpProjectRoot, 'sql', 'insertionConcoursDessins.sql');

  if (!fs.existsSync(insertionPath)) {
    console.error(`Fichier d'insertion non trouve: ${insertionPath}`);
    console.log('Utilisation des donnees integrees...');
    insertBuiltinData(db);
  } else {
    console.log(`Import depuis: ${insertionPath}`);
    importFromMysqlFile(db, insertionPath);
  }

  // Vérification
  function count(table) {
    const stmt = db.prepare(`SELECT COUNT(*) as c FROM ${table}`);
    stmt.step();
    const row = stmt.getAsObject();
    stmt.free();
    return row.c;
  }

  const counts = {
    clubs: count('CLUB'),
    utilisateurs: count('UTILISATEUR'),
    administrateurs: count('ADMINISTRATEUR'),
    directeurs: count('DIRECTEUR'),
    presidents: count('PRESIDENT'),
    competiteurs: count('COMPETITEUR'),
    evaluateurs: count('EVALUATEUR'),
    concours: count('CONCOURS'),
    dessins: count('DESSIN'),
    evaluations: count('EVALUATION'),
    participations: count('PARTICIPATION_CLUB_CONCOURS'),
    inscriptions_comp: count('INSCRIPTION_COMPETITEUR_CONCOURS'),
    inscriptions_eval: count('INSCRIPTION_EVALUATEUR_CONCOURS'),
  };

  console.log('\n=== Base initialisee avec succes ===');
  console.table(counts);

  // Sauvegarder
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
  console.log(`\nBase sauvegardee dans: ${DB_PATH}`);

  db.close();
}

// ============================================================
// Fonctions
// ============================================================

function importFromMysqlFile(db, filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  let currentStatement = '';
  let insertCount = 0;

  for (const line of lines) {
    const trimmed = line.trim();

    // Ignorer commentaires et lignes vides
    if (!trimmed || trimmed.startsWith('--') || trimmed.startsWith('/*') || trimmed.startsWith('*')) continue;

    // Ignorer les commandes MySQL spécifiques
    if (trimmed.startsWith('USE ') || trimmed.startsWith('SET ') ||
        trimmed.startsWith('DROP ') || trimmed.startsWith('CREATE DATABASE') ||
        trimmed.startsWith('CREATE TABLE') || trimmed.startsWith('PRIMARY KEY') ||
        trimmed.startsWith('FOREIGN KEY') || trimmed.startsWith(') ENGINE')) continue;

    currentStatement += ' ' + trimmed;

    if (trimmed.endsWith(';')) {
      let stmt = currentStatement.trim();
      currentStatement = '';

      // Ne traiter que les INSERT
      if (!stmt.toUpperCase().startsWith('INSERT')) continue;

      // Adaptations MySQL → SQLite3
      stmt = stmt.replace(/`/g, '');

      try {
        db.run(stmt);
        insertCount++;
      } catch (err) {
        if (err.message.includes('no column named') || err.message.includes('UNIQUE constraint')) {
          console.warn(`  Avertissement: ${err.message.substring(0, 100)}`);
        } else {
          console.error(`  Erreur SQL: ${err.message}`);
          console.error(`  Statement: ${stmt.substring(0, 120)}...`);
        }
      }
    }
  }

  console.log(`${insertCount} instructions INSERT executees.`);
}

function insertBuiltinData(db) {
  db.run(`
    INSERT INTO CLUB VALUES
    (1,'Les Artistes de Paris','15 rue de Rivoli','01 42 33 44 55',45,'Paris','Paris','Ile-de-France','2010-03-15'),
    (2,'Atelier Lyonnais','28 rue de la Republique','04 72 11 22 33',38,'Lyon','Rhone','Auvergne-Rhone-Alpes','2011-06-20'),
    (3,'Couleurs de Marseille','42 bd de la Canebiere','04 91 22 33 44',42,'Marseille','Bouches-du-Rhone','Provence-Alpes-Cote d Azur','2012-01-10'),
    (4,'Pinceaux Toulousains','7 place du Capitole','05 61 33 44 55',35,'Toulouse','Haute-Garonne','Occitanie','2013-09-05'),
    (5,'Dessins Nantais','19 rue Crebillon','02 40 44 55 66',30,'Nantes','Loire-Atlantique','Pays de la Loire','2014-02-28'),
    (6,'Palette Bordelaise','31 cours de l Intendance','05 56 55 66 77',40,'Bordeaux','Gironde','Nouvelle-Aquitaine','2012-07-15'),
    (7,'Croquis Lillois','14 rue de Bethune','03 20 66 77 88',28,'Lille','Nord','Hauts-de-France','2015-04-12'),
    (8,'Aquarelles Strasbourgeoises','22 place Kleber','03 88 77 88 99',33,'Strasbourg','Bas-Rhin','Grand Est','2013-11-20'),
    (9,'Atelier des Alpes','8 cours Jean Jaures','04 76 88 99 00',25,'Grenoble','Isere','Auvergne-Rhone-Alpes','2016-05-08'),
    (10,'Palette Bretonne','45 rue de Fougeres','02 99 99 00 11',27,'Rennes','Ille-et-Vilaine','Bretagne','2017-01-25'),
    (11,'Arts Azureens','33 rue de France','04 93 00 11 22',32,'Nice','Alpes-Maritimes','Provence-Alpes-Cote d Azur','2014-08-30'),
    (12,'Trait d Union','21 rue de la Loge','04 67 11 22 33',36,'Montpellier','Herault','Occitanie','2015-10-18');
  `);

  db.run(`INSERT INTO UTILISATEUR VALUES (1,'Admin','System','1 rue Admin','admin','admin123','admin@concours.fr','1980-01-01',1);`);
  db.run(`INSERT INTO ADMINISTRATEUR VALUES (1,'2020-01-15');`);

  console.log('Donnees minimales integrees inserees.');
}

main().catch(err => {
  console.error('Erreur:', err);
  process.exit(1);
});
