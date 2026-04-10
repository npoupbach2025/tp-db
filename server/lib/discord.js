const https = require('https');
const http = require('http');
const { URL } = require('url');

const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL || '';
const GEOLOC_CACHE = new Map();
const CACHE_TTL = 3600000; // 1h

/**
 * Lookup IP geolocation via ip-api.com (free, no key needed, 45 req/min)
 */
async function geolocateIp(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return { country: 'Local', city: 'localhost', isp: '-' };
  }

  const cached = GEOLOC_CACHE.get(ip);
  if (cached && Date.now() - cached.ts < CACHE_TTL) return cached.data;

  try {
    const data = await new Promise((resolve, reject) => {
      const req = http.get(`http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,country,city,regionName,isp,org`, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try { resolve(JSON.parse(body)); } catch { reject(new Error('Invalid JSON')); }
        });
      });
      req.on('error', reject);
      req.setTimeout(3000, () => { req.destroy(); reject(new Error('timeout')); });
    });

    if (data.status === 'success') {
      const geo = { country: data.country, city: data.city, region: data.regionName, isp: data.isp || data.org || '-' };
      GEOLOC_CACHE.set(ip, { data: geo, ts: Date.now() });
      return geo;
    }
  } catch { /* silent fail */ }

  return { country: '?', city: '?', isp: '?' };
}

/**
 * Send a message to Discord via webhook
 */
function sendToDiscord(embed) {
  if (!WEBHOOK_URL) return;

  const payload = JSON.stringify({ embeds: [embed] });
  let url;
  try {
    url = new URL(WEBHOOK_URL);
  } catch {
    return;
  }

  const options = {
    hostname: url.hostname,
    port: 443,
    path: url.pathname + url.search,
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(payload) },
  };

  const req = https.request(options);
  req.on('error', () => {}); // silent
  req.write(payload);
  req.end();
}

/**
 * Format timestamp as DD/MM/YYYY HH:MM:SS
 */
function formatDate(date) {
  const d = date || new Date();
  const pad = n => String(n).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

// Color constants for embeds
const COLORS = {
  visit: 0x3b82f6,   // blue
  login: 0x22c55e,   // green
  action: 0xf59e0b,  // amber
  error: 0xef4444,   // red
  logout: 0x6b7280,  // gray
  pageView: 0x8b5cf6, // purple
  click: 0x06b6d4,   // cyan
  getData: 0x64748b,  // slate
};

// Human-readable page names
const PAGE_NAMES = {
  '/': 'Tableau de bord',
  '/clubs': 'Clubs',
  '/utilisateurs': 'Utilisateurs',
  '/concours': 'Concours',
  '/dessins': 'Dessins',
  '/evaluations': 'Évaluations',
  '/resultats': 'Résultats',
  '/inscriptions': 'Inscriptions',
  '/jury': 'Jury',
  '/requetes-tp': 'Requêtes TP',
  '/tp': 'TP SQL',
};

// Human-readable API action descriptions
const ACTION_DESCRIPTIONS = {
  'GET /api/dashboard': 'Consulte le tableau de bord',
  'GET /api/clubs': 'Consulte la liste des clubs',
  'GET /api/utilisateurs': 'Consulte la liste des utilisateurs',
  'GET /api/concours': 'Consulte la liste des concours',
  'GET /api/dessins': 'Consulte la liste des dessins',
  'GET /api/evaluations': 'Consulte les évaluations',
  'GET /api/resultats': 'Consulte les résultats',
  'GET /api/inscriptions': 'Consulte les inscriptions',
  'GET /api/jury': 'Consulte les affectations jury',
  'POST /api/clubs': 'Crée un nouveau club',
  'POST /api/utilisateurs': 'Crée un nouvel utilisateur',
  'POST /api/concours': 'Crée un nouveau concours',
  'POST /api/dessins': 'Crée un nouveau dessin',
  'POST /api/dessins/upload': 'Upload un fichier dessin',
  'POST /api/evaluations': 'Crée une évaluation',
  'POST /api/inscriptions/clubs': 'Inscrit un club à un concours',
  'POST /api/inscriptions/competiteurs': 'Inscrit un compétiteur',
  'POST /api/inscriptions/evaluateurs': 'Inscrit un évaluateur',
  'POST /api/jury': 'Affecte un évaluateur au jury',
  'POST /api/sql-console': 'Exécute une requête SQL',
};

function describeAction(method, path) {
  // Exact match
  const key = `${method} ${path}`;
  if (ACTION_DESCRIPTIONS[key]) return ACTION_DESCRIPTIONS[key];

  // Match base path (e.g. GET /api/clubs/5 → "Consulte le club #5")
  const parts = path.match(/^\/api\/([\w-]+)\/(.+)/);
  if (parts) {
    const [, resource, rest] = parts;
    const names = {
      clubs: 'club', utilisateurs: 'utilisateur', concours: 'concours',
      dessins: 'dessin', evaluations: 'évaluation', jury: 'jury',
    };
    const singular = names[resource] || resource;
    if (method === 'GET') return `Consulte le ${singular} #${rest}`;
    if (method === 'PUT') return `Modifie le ${singular} #${rest}`;
    if (method === 'DELETE') return `Supprime le ${singular} #${rest}`;
  }

  return `${method} ${path}`;
}

/**
 * Notify: new visitor
 */
async function notifyVisit(ip, userAgent, path) {
  const geo = await geolocateIp(ip);
  sendToDiscord({
    title: '🌐 Nouvelle visite',
    color: COLORS.visit,
    fields: [
      { name: '📅 Date', value: `\`${formatDate()}\``, inline: true },
      { name: '🌍 IP', value: `\`${ip}\``, inline: true },
      { name: '📍 Localisation', value: `${geo.city}, ${geo.region || ''} (${geo.country})`, inline: true },
      { name: '🏢 FAI', value: geo.isp, inline: true },
      { name: '📄 Page', value: `\`${path}\``, inline: true },
      { name: '🖥️ User-Agent', value: `\`\`\`${(userAgent || '?').substring(0, 200)}\`\`\`` },
    ],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify: user login
 */
async function notifyLogin(ip, user, role) {
  const geo = await geolocateIp(ip);
  sendToDiscord({
    title: '🔑 Connexion utilisateur',
    color: COLORS.login,
    fields: [
      { name: '📅 Date', value: `\`${formatDate()}\``, inline: true },
      { name: '👤 Utilisateur', value: `**${user.prenom} ${user.nom}** (${user.login})`, inline: true },
      { name: '🎭 Rôle', value: `\`${role}\``, inline: true },
      { name: '🌍 IP', value: `\`${ip}\``, inline: true },
      { name: '📍 Localisation', value: `${geo.city}, ${geo.region || ''} (${geo.country})`, inline: true },
      { name: '🏢 FAI', value: geo.isp, inline: true },
    ],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify: user action (API call)
 */
async function notifyAction(ip, user, method, path, statusCode) {
  const geo = await geolocateIp(ip);
  const desc = describeAction(method, path);
  const isRead = method === 'GET';
  sendToDiscord({
    title: isRead ? `📖 ${desc}` : `⚡ ${desc}`,
    color: statusCode >= 400 ? COLORS.error : (isRead ? COLORS.getData : COLORS.action),
    fields: [
      { name: '📅 Date', value: `\`${formatDate()}\``, inline: true },
      { name: '👤 Utilisateur', value: user ? `**${user.prenom} ${user.nom}**` : 'Non connecté', inline: true },
      { name: '🎯 Endpoint', value: `\`${method} ${path}\``, inline: true },
      { name: '📊 Status', value: `\`${statusCode}\``, inline: true },
      { name: '🌍 IP', value: `\`${ip}\``, inline: true },
      { name: '📍 Localisation', value: `${geo.city}, ${geo.region || ''} (${geo.country})`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify: page navigation (from SPA frontend)
 */
async function notifyPageView(ip, user, page, referrer) {
  const geo = await geolocateIp(ip);
  const pageName = PAGE_NAMES[page] || page;
  sendToDiscord({
    title: `📄 Navigation — ${pageName}`,
    color: COLORS.pageView,
    fields: [
      { name: '📅 Date', value: `\`${formatDate()}\``, inline: true },
      { name: '👤 Utilisateur', value: user ? `**${user}**` : 'Non connecté', inline: true },
      { name: '📄 Page', value: `\`${page}\``, inline: true },
      ...(referrer ? [{ name: '↩️ Depuis', value: `\`${referrer}\``, inline: true }] : []),
      { name: '🌍 IP', value: `\`${ip}\``, inline: true },
      { name: '📍 Localisation', value: `${geo.city}, ${geo.region || ''} (${geo.country})`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  });
}

/**
 * Notify: user click/interaction (from frontend)
 */
async function notifyClick(ip, user, action, details) {
  const geo = await geolocateIp(ip);
  sendToDiscord({
    title: `🖱️ ${action}`,
    color: COLORS.click,
    fields: [
      { name: '📅 Date', value: `\`${formatDate()}\``, inline: true },
      { name: '👤 Utilisateur', value: user ? `**${user}**` : 'Non connecté', inline: true },
      ...(details ? [{ name: '📝 Détails', value: `\`${details.substring(0, 200)}\``, inline: false }] : []),
      { name: '🌍 IP', value: `\`${ip}\``, inline: true },
      { name: '📍 Localisation', value: `${geo.city}, ${geo.region || ''} (${geo.country})`, inline: true },
    ],
    timestamp: new Date().toISOString(),
  });
}

module.exports = { notifyVisit, notifyLogin, notifyAction, notifyPageView, notifyClick, geolocateIp, formatDate, describeAction };
