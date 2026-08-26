import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import Cursor from '../components/Cursor';
import { supabase } from '../lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const next = searchParams.get('next') || '/admin';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError('אימייל או סיסמה שגויים');
    } else {
      navigate(next, { replace: true });
    }
  };

  return (
    <div
      dir="ltr"
      style={{
        minHeight: '100vh',
        background: 'var(--bedrock)',
        color: 'var(--text-primary)',
        fontFamily: "'Space Grotesk', 'Rubik', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="noise-overlay" aria-hidden="true" />
      <Cursor />

      <div className="fluid-blob" style={{ width: 560, height: 560, top: '-18%', left: '-8%', background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.18), transparent 68%)', '--dur': '22s' }} />
      <div className="fluid-blob" style={{ width: 460, height: 460, right: '-10%', bottom: '-16%', background: 'radial-gradient(circle, oklch(0.508 0.155 292.2 / 0.16), transparent 70%)', '--dur': '26s', '--delay': '-8s' }} />

      <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '32px', position: 'relative', zIndex: 1 }}>
        <section
          className="glow-border"
          aria-labelledby="login-title"
          style={{
            width: 'min(100%, 420px)',
            background: 'oklch(0.11 0.015 240 / 0.88)',
            border: '1px solid var(--surface-2)',
            borderRadius: 8,
            padding: 'clamp(28px, 7vw, 44px)',
            backdropFilter: 'blur(22px) saturate(1.35)',
            WebkitBackdropFilter: 'blur(22px) saturate(1.35)',
            boxShadow: '0 22px 80px oklch(0 0 0 / 0.34)',
          }}
        >
          <a href="/" aria-label="Back to Shift Up homepage" style={{ display: 'inline-flex', alignItems: 'center', marginBottom: 28, textDecoration: 'none' }}>
            <img src="/logo.png" alt="Shift Up" style={{ height: 82, width: 'auto', objectFit: 'contain', animation: 'hue-drift 8s ease-in-out infinite' }} />
          </a>

          <div style={{ marginBottom: 30 }}>
            <p style={{ color: 'var(--brand-prime)', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', marginBottom: 12 }}>
              Admin Access
            </p>
            <h1 id="login-title" style={{ fontSize: 'clamp(2rem, 8vw, 3rem)', lineHeight: 1, fontWeight: 900, marginBottom: 12 }}>
              Sign in
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.98rem', lineHeight: 1.7 }}>
              ממשק ניהול Shift Up
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 16 }}>
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>Email</span>
              <span style={{ position: 'relative', display: 'block' }}>
                <Mail size={18} aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  style={{ width: '100%', minHeight: 50, border: `1px solid ${error ? 'oklch(0.65 0.22 25)' : 'var(--surface-2)'}`, borderRadius: 8, background: 'oklch(0.08 0.01 240 / 0.74)', color: 'var(--text-primary)', padding: '0 16px 0 46px', font: 'inherit', fontSize: '0.96rem', outline: 'none' }}
                />
              </span>
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>Password</span>
              <span style={{ position: 'relative', display: 'block' }}>
                <Lock size={18} aria-hidden="true" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  style={{ width: '100%', minHeight: 50, border: `1px solid ${error ? 'oklch(0.65 0.22 25)' : 'var(--surface-2)'}`, borderRadius: 8, background: 'oklch(0.08 0.01 240 / 0.74)', color: 'var(--text-primary)', padding: '0 16px 0 46px', font: 'inherit', fontSize: '0.96rem', outline: 'none' }}
                />
              </span>
            </label>

            {error && (
              <p style={{ color: 'oklch(0.70 0.22 25)', fontSize: '0.85rem', fontWeight: 600, margin: 0, padding: '10px 14px', background: 'oklch(0.65 0.22 25 / 0.1)', borderRadius: 8, border: '1px solid oklch(0.65 0.22 25 / 0.3)' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                minHeight: 52,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 10,
                border: 'none',
                borderRadius: 3,
                background: loading ? 'oklch(0.55 0.15 145)' : 'var(--brand-prime)',
                color: 'oklch(0.08 0.01 240)',
                boxShadow: '0 0 36px oklch(0.785 0.173 156.6 / 0.38)',
                font: 'inherit',
                fontWeight: 900,
                fontSize: '1rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'background 0.2s',
              }}
            >
              {loading ? 'מתחבר...' : 'כניסה'}
              {!loading && <ArrowRight size={18} aria-hidden="true" />}
            </button>
          </form>
        </section>
      </main>
    </div>
  );
}
