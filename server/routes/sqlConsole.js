const express = require('express');
const router = express.Router();
const { getDb } = require('../database');

const ALLOWED_FIRST_KEYWORDS = new Set(['select', 'with', 'pragma', 'explain', 'insert', 'update', 'delete']);
const READ_ONLY_KEYWORDS = new Set(['select', 'with', 'pragma', 'explain']);
const MAX_ROWS = 200;
const FORBIDDEN_COLUMN_PATTERNS = [
  /\bmotdepasse\b/i,
  /\bmot_de_passe\b/i,
  /\bpassword\b/i,
  /\bpwd\b/i,
];

function normalizeQuery(raw) {
  const input = String(raw || '').trim();
  if (!input) return '';
  return input.replace(/;+\s*$/, '').trim();
}

function hasMultipleStatements(query) {
  const sanitized = query.replace(/'[^']*'/g, '').replace(/"[^"]*"/g, '');
  return sanitized.includes(';');
}

function normalizeDateFnsForSqlite(query) {
  let q = query;

  q = q.replace(/\bCURDATE\s*\(\s*\)/gi, "date('now')");

  q = q.replace(/\bTIMESTAMPDIFF\s*\(\s*YEAR\s*,\s*((?:[^(),]|\([^()]*\))+?)\s*,\s*((?:[^()]|\([^()]*\))+?)\s*\)/gi, (match, fromExpr, toExpr) => {
    const from = String(fromExpr).trim();
    const to = String(toExpr).trim();
    if (!from || !to) return match;
    return `CAST((julianday(${to}) - julianday(${from})) / 365.25 AS INT)`;
  });

  q = q.replace(/\bYEAR\s*\(\s*([^\)]+?)\s*\)/gi, (match, expr) => {
    const normalizedExpr = String(expr).trim();
    if (!normalizedExpr) return match;
    return `CAST(strftime('%Y', ${normalizedExpr}) AS INT)`;
  });

  return q;
}

router.post('/execute', (req, res) => {
  const db = getDb();
  const query = normalizeQuery(req.body?.query);

  if (!query) {
    return res.status(400).json({ error: 'Requête SQL vide.' });
  }

  if (hasMultipleStatements(query)) {
    return res.status(400).json({ error: 'Une seule requête SQL est autorisée à la fois.' });
  }

  if (FORBIDDEN_COLUMN_PATTERNS.some((pattern) => pattern.test(query))) {
    return res.status(403).json({
      error: 'Accès interdit: la console SQL ne permet pas de consulter des colonnes de mot de passe.',
    });
  }

  const firstKeyword = query.split(/\s+/)[0]?.toLowerCase();
  if (!ALLOWED_FIRST_KEYWORDS.has(firstKeyword)) {
    return res.status(400).json({
      error: 'Commandes autorisées: SELECT, WITH, PRAGMA, EXPLAIN, INSERT, UPDATE, DELETE.',
    });
  }

  try {
    const sqliteQuery = normalizeDateFnsForSqlite(query);
    const start = Date.now();

    if (READ_ONLY_KEYWORDS.has(firstKeyword)) {
      const rows = db.prepare(sqliteQuery).all();
      const executionMs = Date.now() - start;

      const allColumns = new Set();
      for (const row of rows) {
        Object.keys(row || {}).forEach((k) => allColumns.add(k));
      }

      const limitedRows = rows.slice(0, MAX_ROWS);

      return res.json({
        query,
        sqliteQuery,
        columns: Array.from(allColumns),
        rows: limitedRows,
        totalRows: rows.length,
        truncated: rows.length > MAX_ROWS,
        maxRows: MAX_ROWS,
        executionMs,
        mode: 'read',
      });
    }

    const runResult = db.prepare(sqliteQuery).run();
    db._save();
    const executionMs = Date.now() - start;

    return res.json({
      query,
      sqliteQuery,
      columns: [],
      rows: [],
      totalRows: 0,
      truncated: false,
      maxRows: MAX_ROWS,
      executionMs,
      mode: 'write',
      changes: runResult.changes || 0,
      lastInsertRowid: runResult.lastInsertRowid ?? null,
    });
  } catch (err) {
    res.status(400).json({ error: err.message || 'Erreur SQL.' });
  }
});

module.exports = router;
