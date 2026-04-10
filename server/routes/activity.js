const express = require('express');
const router = express.Router();
const { notifyPageView, notifyClick } = require('../lib/discord');
const { getClientIp } = require('../middleware/activityLogger');

// Rate limit: max 1 page view per user per 2 seconds
const recentPageViews = new Map();
const PAGE_VIEW_COOLDOWN = 2000;

// POST /api/activity/track
router.post('/track', (req, res) => {
  const { type, page, referrer, action, details, user } = req.body;
  if (!type) return res.status(400).json({ error: 'type requis' });

  const ip = getClientIp(req);
  const userLabel = user || null;

  if (type === 'pageview') {
    const key = `${ip}:${page}`;
    const now = Date.now();
    if (recentPageViews.has(key) && now - recentPageViews.get(key) < PAGE_VIEW_COOLDOWN) {
      return res.json({ ok: true, throttled: true });
    }
    recentPageViews.set(key, now);
    notifyPageView(ip, userLabel, page || '/', referrer).catch(() => {});
  } else if (type === 'click') {
    notifyClick(ip, userLabel, action || 'Clic', details).catch(() => {});
  }

  res.json({ ok: true });
});

// Cleanup old entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - PAGE_VIEW_COOLDOWN * 10;
  for (const [key, ts] of recentPageViews) {
    if (ts < cutoff) recentPageViews.delete(key);
  }
}, 300000);

module.exports = router;
