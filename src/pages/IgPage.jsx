const BUSINESS_LINK =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, ראיתי אותך באינסטגרם ואשמח לקבוע שיחת פיצוח לעסק שלי');

const COMMUNITY_LINK = 'https://chat.whatsapp.com/LyJmliw2l7CL8Kq0ImYVFa';

const INSTAGRAM_URL = 'https://www.instagram.com/shiftup.il';

function IgIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

function PeopleIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );
}

export default function IgPage() {
  return (
    <div
      style={{
        minHeight: '100dvh',
        background: 'var(--bedrock)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '48px 24px 72px',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Heebo', sans-serif",
      }}
    >
      {/* Ambient blobs */}
      <div
        className="fluid-blob"
        style={{
          width: 320, height: 320,
          top: '-5%', left: '50%',
          transform: 'translateX(-50%)',
          background: 'radial-gradient(circle, oklch(0.65 0.22 200 / 0.18), transparent 70%)',
          '--dur': '22s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 260, height: 260,
          bottom: '5%', right: '-5%',
          background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.18), transparent 70%)',
          '--dur': '26s', '--delay': '-9s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 200, height: 200,
          bottom: '10%', left: '-5%',
          background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.10), transparent 70%)',
          '--dur': '19s', '--delay': '-5s',
        }}
      />

      {/* Main content */}
      <div
        style={{
          position: 'relative',
          zIndex: 1,
          width: '100%',
          maxWidth: 360,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          animation: 'ig-fade-up 0.65s ease-out both',
        }}
      >
        {/* Logo */}
        <img
          src="/logo.png"
          alt="Shift Up"
          style={{
            height: 52,
            width: 'auto',
            marginBottom: 32,
            animation: 'hue-drift 8s ease-in-out infinite',
          }}
        />

        {/* Profile photo with spinning ring */}
        <div style={{ position: 'relative', marginBottom: 22 }}>
          {/* Ambient glow behind photo */}
          <div
            style={{
              position: 'absolute',
              inset: -18,
              borderRadius: '50%',
              background:
                'radial-gradient(circle at 35% 50%, oklch(0.65 0.22 200 / 0.4), transparent 60%),' +
                'radial-gradient(circle at 65% 40%, oklch(0.50 0.20 285 / 0.35), transparent 60%)',
              filter: 'blur(16px)',
              zIndex: 0,
            }}
          />

          {/* Ring + photo container */}
          <div style={{ position: 'relative', width: 114, height: 114 }}>
            {/* Spinning conic gradient ring */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                borderRadius: '50%',
                background:
                  'conic-gradient(from 0deg, oklch(0.65 0.22 200 / 0.95), oklch(0.78 0.20 145), oklch(0.50 0.20 285 / 0.9), oklch(0.65 0.22 200 / 0.95))',
                animation: 'ring-spin 3.5s linear infinite',
              }}
            />
            {/* Photo */}
            <img
              src="/shmuel.png"
              alt="שמואל מוניץ"
              style={{
                position: 'absolute',
                top: 3,
                left: 3,
                width: 'calc(100% - 6px)',
                height: 'calc(100% - 6px)',
                borderRadius: '50%',
                objectFit: 'cover',
                objectPosition: 'center top',
                zIndex: 1,
              }}
            />
          </div>
        </div>

        {/* Name */}
        <h1
          style={{
            fontSize: '1.65rem',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            color: 'var(--text-primary)',
            marginBottom: 6,
            textAlign: 'center',
          }}
        >
          שמואל מוניץ
        </h1>

        {/* Title */}
        <p
          style={{
            fontSize: '0.88rem',
            color: 'var(--text-secondary)',
            textAlign: 'center',
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          אסטרטג שיווק דיגיטלי ומומחה AI
        </p>

        {/* Brand chip */}
        <div
          className="chip"
          style={{ marginBottom: 40 }}
        >
          <span
            style={{
              width: 5, height: 5,
              borderRadius: '50%',
              background: 'var(--brand-prime)',
              display: 'block',
              animation: 'breathing 2s ease-in-out infinite',
            }}
          />
          Shift Up
        </div>

        {/* Divider */}
        <div
          style={{
            width: '100%',
            height: 1,
            background: 'linear-gradient(to left, transparent, oklch(0.28 0.03 240), transparent)',
            marginBottom: 32,
          }}
        />

        {/* ── CTA Buttons ── */}
        <div
          style={{
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            gap: 14,
          }}
        >
          {/* Primary — Business CTA */}
          <a
            href={BUSINESS_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-btn-primary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '0 24px',
              minHeight: 64,
              background: 'var(--brand-prime)',
              color: 'oklch(0.08 0.01 240)',
              borderRadius: 18,
              fontWeight: 800,
              fontSize: '1.05rem',
              fontFamily: "'Heebo', sans-serif",
              textDecoration: 'none',
              boxShadow:
                '0 4px 40px oklch(0.78 0.20 145 / 0.45), 0 1px 0 oklch(0.92 0.18 140 / 0.3) inset',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <WhatsAppIcon size={20} />
            לעשות Shift Up לעסק
          </a>

          {/* Secondary — Community CTA */}
          <a
            href={COMMUNITY_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="ig-btn-secondary"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              padding: '0 24px',
              minHeight: 64,
              background: 'transparent',
              border: '1.5px solid oklch(0.78 0.20 145 / 0.28)',
              color: 'var(--text-primary)',
              borderRadius: 18,
              fontWeight: 700,
              fontSize: '1.05rem',
              fontFamily: "'Heebo', sans-serif",
              textDecoration: 'none',
            }}
          >
            <PeopleIcon size={20} />
            להצטרף לקהילת Shift Up
          </a>
        </div>

        {/* Footer — Instagram link */}
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            marginTop: 52,
            display: 'flex',
            alignItems: 'center',
            gap: 7,
            color: 'var(--text-muted)',
            textDecoration: 'none',
            fontSize: '0.82rem',
            opacity: 0.55,
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.opacity = '0.9'; }}
          onMouseLeave={e => { e.currentTarget.style.opacity = '0.55'; }}
        >
          <IgIcon size={15} />
          @shiftup.il
        </a>
      </div>
    </div>
  );
}
