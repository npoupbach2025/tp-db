import { useState, useEffect, useRef, useCallback } from 'react';
import { api } from '@/lib/api';

interface LoginPageProps {
  onLogin: (user: any, role: string) => void;
}

/* ── Animated canvas background ── */
function useAnimatedBackground(canvasRef: React.RefObject<HTMLCanvasElement | null>) {
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext('2d');
    if (!ctx) return;

    let animId = 0;
    const dpr = window.devicePixelRatio || 1;
    let w = 0, h = 0;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cvs!.width = w * dpr;
      cvs!.height = h * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // Orbs: large soft colored circles
    const orbs = [
      { x: 0.15, y: 0.2, r: 300, color: 'rgba(139,92,246,0.12)', vx: 0.00015, vy: 0.0001 },
      { x: 0.8, y: 0.3, r: 250, color: 'rgba(59,130,246,0.10)', vx: -0.0001, vy: 0.00012 },
      { x: 0.5, y: 0.8, r: 350, color: 'rgba(236,72,153,0.08)', vx: 0.00008, vy: -0.00006 },
      { x: 0.3, y: 0.6, r: 200, color: 'rgba(16,185,129,0.07)', vx: -0.00012, vy: -0.0001 },
    ];

    // Particles
    const particles = Array.from({ length: 50 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.1,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    let t = 0;
    function draw() {
      t++;
      ctx!.clearRect(0, 0, w, h);

      // Draw orbs
      for (const orb of orbs) {
        orb.x += orb.vx;
        orb.y += orb.vy;
        if (orb.x < -0.1 || orb.x > 1.1) orb.vx *= -1;
        if (orb.y < -0.1 || orb.y > 1.1) orb.vy *= -1;

        const grad = ctx!.createRadialGradient(
          orb.x * w, orb.y * h, 0,
          orb.x * w, orb.y * h, orb.r
        );
        grad.addColorStop(0, orb.color);
        grad.addColorStop(1, 'transparent');
        ctx!.fillStyle = grad;
        ctx!.fillRect(0, 0, w, h);
      }

      // Draw particles
      for (const p of particles) {
        ctx!.beginPath();
        ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx!.fillStyle = `rgba(255,255,255,${p.opacity})`;
        ctx!.fill();
        p.y -= p.speed;
        p.x += p.drift;
        if (p.y < -5) { p.y = h + 5; p.x = Math.random() * w; }
        if (p.x < -5) p.x = w + 5;
        if (p.x > w + 5) p.x = -5;
      }

      // Subtle grid lines
      ctx!.strokeStyle = 'rgba(255,255,255,0.015)';
      ctx!.lineWidth = 1;
      const spacing = 60;
      for (let x = 0; x < w; x += spacing) {
        ctx!.beginPath();
        ctx!.moveTo(x, 0);
        ctx!.lineTo(x, h);
        ctx!.stroke();
      }
      for (let y = 0; y < h; y += spacing) {
        ctx!.beginPath();
        ctx!.moveTo(0, y);
        ctx!.lineTo(w, y);
        ctx!.stroke();
      }

      animId = requestAnimationFrame(draw);
    }
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, [canvasRef]);
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [login, setLogin] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDemo, setShowDemo] = useState(true);
  const [focusField, setFocusField] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useAnimatedBackground(canvasRef);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result: any = await api.login(login, motDePasse);
      onLogin(result.user, result.role);
    } catch (err: any) {
      setError(err.message || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }, [login, motDePasse, onLogin]);

  const fillDemo = (l: string, p: string) => {
    setLogin(l);
    setMotDePasse(p);
    setError('');
  };

  const demoAccounts = [
    { label: 'Administrateur', icon: '👑', login: 'adminAL', pass: 'Syst3m!2020', accent: '#a78bfa' },
    { label: 'Compétiteur', icon: '🎨', login: 'jmarch', pass: 'aZ3k9pQ', accent: '#34d399' },
    { label: 'Évaluateur', icon: '⭐', login: 'sbern', pass: 'wW2i5pM', accent: '#f472b6' },
    { label: 'Directeur', icon: '📋', login: 'cmorel', pass: 'Hk4$pLm9', accent: '#fbbf24' },
  ];

  /* All inline styles to guarantee dark rendering regardless of CSS theme */
  return (
    <div style={{
      position: 'relative', minHeight: '100vh', overflow: 'hidden',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      background: '#080613',
    }}>
      {/* Canvas */}
      <canvas ref={canvasRef} style={{
        position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none',
      }} />

      {/* Content */}
      <div style={{
        position: 'relative', zIndex: 10, width: '100%', maxWidth: 440,
        animation: 'fadeInUp 0.7s ease-out',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 72, height: 72, borderRadius: 20,
            background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
            boxShadow: '0 20px 60px rgba(124,58,237,0.4), 0 0 0 1px rgba(255,255,255,0.1)',
            marginBottom: 16,
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r="2.5" fill="#f87171" stroke="none" />
              <circle cx="17" cy="11" r="2" fill="#fbbf24" stroke="none" />
              <circle cx="8" cy="8" r="2" fill="#34d399" stroke="none" />
              <circle cx="7" cy="14" r="2" fill="#60a5fa" stroke="none" />
              <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c1.1 0 2-.9 2-2v-.5c0-.5-.2-1-.5-1.4-.3-.3-.5-.8-.5-1.3 0-1.1.9-2 2-2h2.3c3 0 5.5-2.5 5.5-5.5C22.8 5.6 18 2 12 2z" fill="none" stroke="white" />
            </svg>
          </div>
          <h1 style={{
            fontSize: 26, fontWeight: 700, color: '#ffffff',
            letterSpacing: '-0.02em', margin: 0,
          }}>Art Contest Hub</h1>
          <p style={{
            fontSize: 13, color: 'rgba(255,255,255,0.4)', marginTop: 4,
          }}>Plateforme de Concours de Dessins Inter-Clubs</p>
        </div>

        {/* Glass card */}
        <div style={{
          borderRadius: 20, padding: '36px 32px 28px',
          background: 'rgba(255,255,255,0.04)',
          backdropFilter: 'blur(40px) saturate(1.2)',
          WebkitBackdropFilter: 'blur(40px) saturate(1.2)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {/* Quick access banner */}
          <div style={{
            marginBottom: 24, borderRadius: 14, padding: '14px 18px',
            background: 'linear-gradient(135deg, rgba(124,58,237,0.12), rgba(79,70,229,0.08))',
            border: '1px solid rgba(139,92,246,0.2)',
          }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Accès rapide — Correction
            </div>
            <div style={{ fontSize: 12, color: 'rgba(196,181,253,0.7)', marginTop: 6 }}>
              Cliquer pour remplir :{' '}
              <span
                onClick={() => fillDemo('adminAL', 'Syst3m!2020')}
                style={{
                  fontFamily: 'monospace', fontWeight: 600, color: '#c4b5fd',
                  cursor: 'pointer', borderBottom: '1px dashed rgba(196,181,253,0.3)',
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#fff')}
                onMouseLeave={e => (e.currentTarget.style.color = '#c4b5fd')}
              >
                adminAL / Syst3m!2020
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {error && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', marginBottom: 16, borderRadius: 12,
                background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)',
                fontSize: 13, color: '#fca5a5',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            {/* Login field */}
            <div style={{ marginBottom: 18 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                marginBottom: 8, marginLeft: 2, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Identifiant</label>
              <div style={{
                position: 'relative', borderRadius: 14,
                background: focusField === 'login' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${focusField === 'login' ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: focusField === 'login' ? '0 0 0 3px rgba(139,92,246,0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <input
                  id="login" type="text" placeholder="Entrez votre login"
                  value={login} onChange={(e) => setLogin(e.target.value)}
                  onFocus={() => setFocusField('login')} onBlur={() => setFocusField(null)}
                  required autoFocus autoComplete="username"
                  style={{
                    width: '100%', height: 48, padding: '0 16px 0 42px',
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: 14, fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Password field */}
            <div style={{ marginBottom: 24 }}>
              <label style={{
                display: 'block', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                marginBottom: 8, marginLeft: 2, textTransform: 'uppercase', letterSpacing: '0.05em',
              }}>Mot de passe</label>
              <div style={{
                position: 'relative', borderRadius: 14,
                background: focusField === 'password' ? 'rgba(255,255,255,0.07)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${focusField === 'password' ? 'rgba(139,92,246,0.5)' : 'rgba(255,255,255,0.08)'}`,
                boxShadow: focusField === 'password' ? '0 0 0 3px rgba(139,92,246,0.15)' : 'none',
                transition: 'all 0.2s ease',
              }}>
                <div style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.3)' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <input
                  id="password" type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  value={motDePasse} onChange={(e) => setMotDePasse(e.target.value)}
                  onFocus={() => setFocusField('password')} onBlur={() => setFocusField(null)}
                  required autoComplete="current-password"
                  style={{
                    width: '100%', height: 48, padding: '0 44px 0 42px',
                    background: 'transparent', border: 'none', outline: 'none',
                    color: '#fff', fontSize: 14, fontFamily: 'inherit',
                  }}
                />
                <button
                  type="button" onClick={() => setShowPassword(!showPassword)} tabIndex={-1}
                  style={{
                    position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                    color: 'rgba(255,255,255,0.3)', transition: 'color 0.2s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.3)')}
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', height: 50, borderRadius: 14, border: 'none',
                background: loading ? 'rgba(124,58,237,0.5)' : 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: '0 8px 32px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)',
                transition: 'all 0.2s ease', fontFamily: 'inherit',
                transform: 'translateY(0)',
              }}
              onMouseEnter={e => {
                if (!loading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(124,58,237,0.45), inset 0 1px 0 rgba(255,255,255,0.15)';
                }
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 8px 32px rgba(124,58,237,0.35), inset 0 1px 0 rgba(255,255,255,0.15)';
              }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: 18, height: 18, border: '2px solid rgba(255,255,255,0.3)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    animation: 'spin 0.6s linear infinite', display: 'inline-block',
                  }} />
                  Connexion en cours...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Se connecter
                </>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div style={{
            marginTop: 24, paddingTop: 20,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <button
              type="button" onClick={() => setShowDemo(!showDemo)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0',
                fontSize: 11, color: 'rgba(255,255,255,0.25)', fontFamily: 'inherit',
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.5)')}
              onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.25)')}
            >
              Comptes de démonstration
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                style={{ transform: showDemo ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s ease' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {showDemo && (
              <div style={{
                marginTop: 12, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8,
                animation: 'fadeInUp 0.3s ease-out',
              }}>
                {demoAccounts.map((d) => (
                  <button
                    key={d.login} type="button"
                    onClick={() => fillDemo(d.login, d.pass)}
                    style={{
                      padding: '12px 14px', borderRadius: 12, textAlign: 'left',
                      background: 'rgba(255,255,255,0.03)',
                      border: '1px solid rgba(255,255,255,0.06)',
                      cursor: 'pointer', transition: 'all 0.2s ease', fontFamily: 'inherit',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.07)';
                      e.currentTarget.style.borderColor = `${d.accent}40`;
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontSize: 14 }}>{d.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: d.accent }}>{d.label}</span>
                    </div>
                    <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'rgba(255,255,255,0.3)' }}>
                      {d.login} / {d.pass}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <p style={{
          textAlign: 'center', fontSize: 11, color: 'rgba(255,255,255,0.15)', marginTop: 24,
        }}>
          v1.0 — Art Contest Hub · Concours de Dessins
        </p>
      </div>

      {/* Animations CSS */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        input::placeholder {
          color: rgba(255,255,255,0.2) !important;
        }
      `}</style>
    </div>
  );
}
