const express = require('express');
const fs = require('fs');
const path = require('path');

const router = express.Router();

const TP_ROOT = process.env.TP_PROJECT_ROOT || path.resolve(__dirname, '../../tp');

function safeRead(relPath) {
  const fullPath = path.join(TP_ROOT, relPath);
  if (!fs.existsSync(fullPath)) return '';
  return fs.readFileSync(fullPath, 'utf-8');
}

router.get('/', (req, res) => {
  const payload = {
    meta: {
      title: 'Conception d’un SI pour la gestion des concours de dessins',
      sourceRoot: TP_ROOT,
    },
    docs: {
      etape0: safeRead('docs/etape0_comprehension.md'),
      etape2: safeRead('docs/etape2_contraintes.md'),
      etape3: safeRead('docs/etape3_schema_logique.md'),
      schemaTextuel: safeRead('docs/schema_logique_textuel.txt'),
      documentReponses: safeRead('Document_Reponses_Projet.html'),
    },
    sql: {
      creation: safeRead('sql/creationConcoursDessins.sql'),
      triggers: safeRead('sql/triggers.sql'),
      requete1: safeRead('sql/requete1.sql'),
      requete2: safeRead('sql/requete2.sql'),
      requete3: safeRead('sql/requete3.sql'),
      requete4: safeRead('sql/requete4.sql'),
      requete5: safeRead('sql/requete5.sql'),
      requete6: safeRead('sql/requete6.sql'),
      requete7: safeRead('sql/requete7.sql'),
      requete8: safeRead('sql/requete8.sql'),
      requete9: safeRead('sql/requete9.sql'),
      requete10: safeRead('sql/requete10.sql'),
    },
    uml: {
      diagrammeClassesPuml: safeRead('uml/diagramme_classes.puml'),
      schemaLogiquePuml: safeRead('uml/schema_logique.puml'),
      diagrammeClassesDrawioXml: safeRead('uml/diagramme_classes.drawio.xml'),
      schemaLogiqueDrawioXml: safeRead('uml/schema_logique.drawio.xml'),
    },
  };

  res.json(payload);
});

// Serve TP images (PNG files from docs/)
router.get('/images/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(TP_ROOT, 'docs', filename);
  if (!fs.existsSync(filePath) || !filename.endsWith('.png')) {
    return res.status(404).send('Not found');
  }
  res.sendFile(filePath);
});

module.exports = router;
