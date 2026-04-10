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
};

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
  sendToDiscord({
    title: `⚡ Action ${method}`,
    color: statusCode >= 400 ? COLORS.error : COLORS.action,
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

module.exports = { notifyVisit, notifyLogin, notifyAction, geolocateIp, formatDate };
