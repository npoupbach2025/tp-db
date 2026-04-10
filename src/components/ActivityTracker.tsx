import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

const AUTH_KEY = 'concours-auth';

function getUserLabel(): string | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const { user, role } = JSON.parse(raw);
    if (!user) return null;
    return `${user.prenom} ${user.nom} (${role})`;
  } catch {
    return null;
  }
}

function sendTrackEvent(data: Record<string, unknown>) {
  // Fire-and-forget beacon
  try {
    const payload = JSON.stringify({ ...data, user: getUserLabel() });
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/activity/track', new Blob([payload], { type: 'application/json' }));
    } else {
      fetch('/api/activity/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
  } catch { /* silent */ }
}

// Page name mapping for readable click descriptions
const PAGE_NAMES: Record<string, string> = {
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

/**
 * Track meaningful clicks (buttons, links, tabs, dialogs)
 */
function getClickDescription(el: HTMLElement): string | null {
  // Buttons
  if (el.tagName === 'BUTTON' || el.closest('button')) {
    const btn = (el.tagName === 'BUTTON' ? el : el.closest('button')!) as HTMLButtonElement;
    const text = btn.textContent?.trim().substring(0, 80);
    if (!text || text.length < 2) return null;
    // Skip trivial UI toggles
    if (/^(×|x|close|fermer)$/i.test(text)) return null;
    return `Bouton: ${text}`;
  }

  // Navigation links (sidebar, tabs)
  const link = el.closest('a[href]') as HTMLAnchorElement | null;
  if (link) {
    const href = link.getAttribute('href') || '';
    if (href.startsWith('/')) {
      const pageName = PAGE_NAMES[href] || href;
      return `Navigation: ${pageName}`;
    }
  }

  // Tab triggers
  const tab = el.closest('[role="tab"]');
  if (tab) {
    const text = tab.textContent?.trim().substring(0, 60);
    if (text) return `Onglet: ${text}`;
  }

  // Select/dropdown triggers
  const trigger = el.closest('[role="combobox"], [data-radix-collection-item]');
  if (trigger) {
    const text = trigger.textContent?.trim().substring(0, 60);
    if (text) return `Sélection: ${text}`;
  }

  return null;
}

export default function ActivityTracker() {
  const location = useLocation();
  const prevPath = useRef<string | null>(null);

  // Track page navigation
  useEffect(() => {
    const currentPath = location.pathname;
    if (currentPath !== prevPath.current) {
      sendTrackEvent({
        type: 'pageview',
        page: currentPath,
        referrer: prevPath.current,
      });
      prevPath.current = currentPath;
    }
  }, [location.pathname]);

  // Track clicks
  useEffect(() => {
    // Throttle: max 1 click event per second
    let lastClickTime = 0;

    function handleClick(e: MouseEvent) {
      const now = Date.now();
      if (now - lastClickTime < 1000) return;

      const target = e.target as HTMLElement;
      if (!target) return;

      const desc = getClickDescription(target);
      if (!desc) return;

      lastClickTime = now;
      sendTrackEvent({
        type: 'click',
        action: desc,
        details: `Page: ${PAGE_NAMES[location.pathname] || location.pathname}`,
      });
    }

    document.addEventListener('click', handleClick, true);
    return () => document.removeEventListener('click', handleClick, true);
  }, [location.pathname]);

  return null; // This component renders nothing
}
