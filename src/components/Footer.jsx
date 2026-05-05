import { useRef } from 'react';
import { gsap } from 'gsap';

const logoSrc = '/1000900906.jpg';

const whatsappLink =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות');

const socials = [
  {
    label: 'WhatsApp',
    href: whatsappLink,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:shmuelmunic@gmail.com',
    emailBtn: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="16" x="2" y="4" rx="2"/>
        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/shmuel-munitz-marketing',
    target: '_blank',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
        <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
      </svg>
    ),
  },
  {
    label: 'Facebook',
    href: 'https://www.facebook.com/share/1BZ8HrpBeo/',
    target: '_blank',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
      </svg>
    ),
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/shiftup.il?igsh=MTZod2E3NTk4dXI5Zg==',
    target: '_blank',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
      </svg>
    ),
  },
];

function onEmailClick(e) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    e.preventDefault();
    window.open('https://mail.google.com/mail/?view=cm&to=shmuelmunic@gmail.com', '_blank');
  }
  // touch device → mailto: fires naturally
}

function MagneticIcon({ children, href, label, target, emailBtn }) {
  const ref = useRef(null);

  const onMove = (e) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    gsap.to(el, { x: dx * 0.35, y: dy * 0.35, duration: 0.4, ease: 'power2.out' });
  };

  const onLeave = () => {
    gsap.to(ref.current, { x: 0, y: 0, duration: 0.6, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} style={{ display: 'inline-block' }}>
      <a
        href={href}
        aria-label={label}
        target={target || undefined}
        rel={target ? 'noopener noreferrer' : undefined}
        onClick={emailBtn ? onEmailClick : undefined}
        style={{
          width: 40, height: 40,
          borderRadius: '50%',
          background: 'var(--surface-1)',
          border: '1px solid var(--surface-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--text-muted)',
          transition: 'background 0.3s, color 0.3s, border-color 0.3s, box-shadow 0.3s',
          textDecoration: 'none',
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = 'oklch(0.78 0.20 145 / 0.15)';
          e.currentTarget.style.color = 'var(--brand-prime)';
          e.currentTarget.style.borderColor = 'oklch(0.78 0.20 145 / 0.35)';
          e.currentTarget.style.boxShadow = '0 0 16px oklch(0.78 0.20 145 / 0.2)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = 'var(--surface-1)';
          e.currentTarget.style.color = 'var(--text-muted)';
          e.currentTarget.style.borderColor = 'var(--surface-2)';
          e.currentTarget.style.boxShadow = 'none';
        }}
      >
        {children}
      </a>
    </div>
  );
}

export default function Footer() {
  return (
    <footer
      style={{
        background: 'var(--bedrock)',
        borderTop: '1px solid var(--surface-1)',
        padding: '40px 28px',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
        }}
      >
        {/* Logo */}
        <img
          src={logoSrc}
          alt="Shift Up"
          style={{
            height: 38,
            width: 'auto',
            objectFit: 'contain',
            animation: 'hue-drift 8s ease-in-out infinite',
          }}
        />

        {/* Social icons */}
        <div style={{ display: 'flex', gap: 10 }}>
          {socials.map(s => (
            <MagneticIcon key={s.label} href={s.href} label={s.label} target={s.target} emailBtn={s.emailBtn}>
              {s.icon}
            </MagneticIcon>
          ))}
        </div>

        {/* Copyright */}
        <p
          style={{
            fontSize: '0.8rem',
            color: 'var(--text-muted)',
            lineHeight: 1.6,
            textAlign: 'center',
          }}
        >
          © {new Date().getFullYear()} Shift Up · שמואל מוניץ
          <br />
          <span style={{ color: 'oklch(0.30 0.01 240)', fontSize: '0.72rem' }}>
            אסטרטגיה חכמה. קריאייטיב נועז.
          </span>
        </p>
      </div>
    </footer>
  );
}
