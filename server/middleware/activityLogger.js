const { notifyVisit, notifyAction } = require('../lib/discord');

// Track recently seen IPs to avoid spamming Discord on every request
const recentVisitors = new Map();
const VISIT_COOLDOWN = 300000; // 5 min between visit alerts per IP

function getClientIp(req) {
  // Behind nginx proxy: trust X-Real-IP / X-Forwarded-For
  return req.headers['x-real-ip']
    || (req.headers['x-forwarded-for'] || '').split(',')[0].trim()
    || req.socket.remoteAddress
    || '?';
}

/**
 * Middleware: log page visits (HTML pages, not API/assets)
 */
function visitTracker(req, res, next) {
  if (req.method !== 'GET') return next();
  // Only track page navigations, skip API calls, static assets, etc.
  if (req.path.startsWith('/api') || req.path.startsWith('/assets') ||
      req.path.startsWith('/tp-assets') || req.path.startsWith('/uploads') ||
      /\.(js|css|png|jpg|svg|ico|woff|woff2|map|json)$/i.test(req.path)) {
    return next();
  }

  const ip = getClientIp(req);
  const now = Date.now();
  const lastSeen = recentVisitors.get(ip);

  if (!lastSeen || now - lastSeen > VISIT_COOLDOWN) {
    recentVisitors.set(ip, now);
    notifyVisit(ip, req.headers['user-agent'], req.path).catch(() => {});
  }

  next();
}

/**
 * Middleware: log API actions (POST/PUT/DELETE on /api/*)
 */
function actionTracker(req, res, next) {
  // Only track write operations on API
  if (!req.path.startsWith('/api')) return next();
  if (req.method === 'GET' || req.method === 'OPTIONS') return next();
  // Skip login (handled separately in auth route)
  if (req.path === '/api/auth/login') return next();

  const ip = getClientIp(req);
  const originalEnd = res.end;

  res.end = function (...args) {
    originalEnd.apply(res, args);
    const user = req.auth?.user || null;
    notifyAction(ip, user, req.method, req.path, res.statusCode).catch(() => {});
  };

  next();
}

module.exports = { visitTracker, actionTracker, getClientIp };
