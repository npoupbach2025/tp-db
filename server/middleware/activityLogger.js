const { notifyVisit, notifyAction } = require('../lib/discord');

// Track recently seen IPs to avoid spamming Discord on every request
const recentVisitors = new Map();
const VISIT_COOLDOWN = 300000; // 5 min between visit alerts per IP

// Throttle GET API tracking: max 1 per endpoint per user per 30s
const recentGets = new Map();
const GET_COOLDOWN = 30000;

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
 * Middleware: log API actions (all methods on /api/*)
 */
function actionTracker(req, res, next) {
  if (!req.path.startsWith('/api')) return next();
  if (req.method === 'OPTIONS') return next();
  // Skip login (handled separately) and activity tracking endpoint
  if (req.path === '/api/auth/login') return next();
  if (req.path === '/api/activity/track') return next();

  const ip = getClientIp(req);

  // For GET requests, apply throttle to avoid spam
  if (req.method === 'GET') {
    const userId = req.headers['x-user-id'] || ip;
    // Normalize path: strip query params and trailing IDs for grouping
    const basePath = req.path.replace(/\/\d+(\/|$)/g, '/:id$1');
    const key = `${userId}:${basePath}`;
    const now = Date.now();
    if (recentGets.has(key) && now - recentGets.get(key) < GET_COOLDOWN) {
      return next();
    }
    recentGets.set(key, now);
  }

  const originalEnd = res.end;
  res.end = function (...args) {
    originalEnd.apply(res, args);
    // Don't notify 401/403 (unauthenticated noise) or 304 (not modified)
    if (res.statusCode === 401 || res.statusCode === 403 || res.statusCode === 304) {
      return;
    }
    const user = req.auth?.user || null;
    notifyAction(ip, user, req.method, req.path, res.statusCode).catch(() => {});
  };

  next();
}

// Cleanup throttle maps every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - GET_COOLDOWN * 5;
  for (const [key, ts] of recentGets) {
    if (ts < cutoff) recentGets.delete(key);
  }
  const visitCutoff = Date.now() - VISIT_COOLDOWN * 2;
  for (const [key, ts] of recentVisitors) {
    if (ts < visitCutoff) recentVisitors.delete(key);
  }
}, 300000);

module.exports = { visitTracker, actionTracker, getClientIp };
