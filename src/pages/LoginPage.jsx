import { ArrowRight, Lock, Mail } from 'lucide-react';
import Cursor from '../components/Cursor';

const logoSrc = '/logo.png';

export default function LoginPage() {
  return (
    <div
      dir="ltr"
      style={{
        minHeight: '100vh',
        background: 'var(--bedrock)',
        color: 'var(--text-primary)',
        fontFamily: "'Heebo', sans-serif",
        overflow: 'hidden',
        position: 'relative',
      }}
    >
      <div className="noise-overlay" aria-hidden="true" />
      <Cursor />

      <div
        className="grid-bg"
        style={{
          position: 'absolute',
          inset: 0,
          opacity: 0.7,
          pointerEvents: 'none',
        }}
      />

      <div
        className="fluid-blob"
        style={{
          width: 560,
          height: 560,
          top: '-18%',
          left: '-8%',
          background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.18), transparent 68%)',
          '--dur': '22s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 460,
          height: 460,
          right: '-10%',
          bottom: '-16%',
          background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.16), transparent 70%)',
          '--dur': '26s',
          '--delay': '-8s',
        }}
      />

      <main
        style={{
          minHeight: '100vh',
          display: 'grid',
          placeItems: 'center',
          padding: '32px',
          position: 'relative',
          zIndex: 1,
        }}
      >
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
          <a
            href="/"
            aria-label="Back to Shift Up homepage"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              marginBottom: 28,
              textDecoration: 'none',
            }}
          >
            <img
              src={logoSrc}
              alt="Shift Up"
              style={{
                height: 82,
                width: 'auto',
                objectFit: 'contain',
                animation: 'hue-drift 8s ease-in-out infinite',
              }}
            />
          </a>

          <div style={{ marginBottom: 30 }}>
            <p
              style={{
                color: 'var(--brand-prime)',
                fontSize: '0.72rem',
                fontWeight: 800,
                letterSpacing: '0.16em',
                textTransform: 'uppercase',
                marginBottom: 12,
              }}
            >
              Client Access
            </p>
            <h1
              id="login-title"
              style={{
                fontSize: 'clamp(2rem, 8vw, 3rem)',
                lineHeight: 1,
                fontWeight: 900,
                marginBottom: 12,
              }}
            >
              Sign in
            </h1>
            <p
              style={{
                color: 'var(--text-secondary)',
                fontSize: '0.98rem',
                lineHeight: 1.7,
              }}
            >
              Access your Shift Up workspace.
            </p>
          </div>

          <form
            onSubmit={(event) => event.preventDefault()}
            style={{ display: 'grid', gap: 16 }}
          >
            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>
                Email
              </span>
              <span style={{ position: 'relative', display: 'block' }}>
                <Mail
                  size={18}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  style={{
                    width: '100%',
                    minHeight: 50,
                    border: '1px solid var(--surface-2)',
                    borderRadius: 8,
                    background: 'oklch(0.08 0.01 240 / 0.74)',
                    color: 'var(--text-primary)',
                    padding: '0 16px 0 46px',
                    font: 'inherit',
                    fontSize: '0.96rem',
                  }}
                />
              </span>
            </label>

            <label style={{ display: 'grid', gap: 8 }}>
              <span style={{ color: 'var(--text-secondary)', fontSize: '0.84rem', fontWeight: 700 }}>
                Password
              </span>
              <span style={{ position: 'relative', display: 'block' }}>
                <Lock
                  size={18}
                  aria-hidden="true"
                  style={{
                    position: 'absolute',
                    left: 16,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--text-muted)',
                  }}
                />
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  style={{
                    width: '100%',
                    minHeight: 50,
                    border: '1px solid var(--surface-2)',
                    borderRadius: 8,
                    background: 'oklch(0.08 0.01 240 / 0.74)',
                    color: 'var(--text-primary)',
                    padding: '0 16px 0 46px',
                    font: 'inherit',
                    fontSize: '0.96rem',
                  }}
                />
              </span>
            </label>

            <button
              type="submit"
              style={{
                minHeight: 52,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                marginTop: 10,
                border: 'none',
                borderRadius: 999,
                background: 'var(--brand-prime)',
                color: 'oklch(0.08 0.01 240)',
                boxShadow: '0 0 36px oklch(0.78 0.20 145 / 0.38)',
                font: 'inherit',
                fontWeight: 900,
              }}
            >
              Continue
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </form>

          <p
            style={{
              marginTop: 22,
              color: 'var(--text-muted)',
              fontSize: '0.84rem',
              lineHeight: 1.6,
            }}
          >
            Authentication is ready for backend wiring.
          </p>
        </section>
      </main>
    </div>
  );
}
