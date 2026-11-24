import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { WhatsAppIcon } from './icons';

const logoSrc = '/logo.png';

const DEFAULT_WA =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות');

const SOCIAL_ICONS = {
  WhatsApp: <WhatsAppIcon size={18} />,
  Email: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="16" x="2" y="4" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  ),
  LinkedIn: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  ),
  Facebook: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
  ),
  Instagram: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  ),
};

function onEmailClick(e) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    e.preventDefault();
    window.open('https://mail.google.com/mail/?view=cm&to=shmuelmunic@gmail.com', '_blank');
  }
  // touch device → mailto: fires naturally
}

/* כיוון C: אייקון מרובע וחד, בלי אפקט מגנטי */
function MagneticIcon({ children, href, label, target, emailBtn }) {
  return (
    <a
      href={href}
      aria-label={label}
      target={target || undefined}
      rel={target ? 'noopener noreferrer' : undefined}
      onClick={emailBtn ? onEmailClick : undefined}
      className="c-social"
    >
      {children}
    </a>
  );
}

const legalLinkStyle = { fontSize: '0.78rem', color: '#8A9097', textDecoration: 'none', transition: 'color 0.2s', cursor: 'pointer' };

const quickLinks = [
  { label: 'התהליך', id: 'strategy' },
  { label: 'למה אני', id: 'why' },
  { label: 'מי אני',  id: 'about' },
  { label: 'שאלות',  id: 'faq' },
  { label: 'צור קשר', id: 'contact' },
];

export default function Footer() {
  const [contacts, setContacts] = useState({
    whatsapp: DEFAULT_WA,
    phone: '+972-53-467-3151',
    email: 'shmuelmunic@gmail.com',
    linkedin: 'https://www.linkedin.com/in/shmuel-munitz-marketing',
    facebook: 'https://www.facebook.com/share/1BZ8HrpBeo/',
    instagram: 'https://www.instagram.com/shiftup.il?igsh=MTZod2E3NTk4dXI5Zg==',
  });

  useEffect(() => {
    supabase.from('site_content')
      .select('key, value')
      .in('key', ['contact.whatsapp_url', 'contact.phone', 'contact.email', 'contact.linkedin', 'contact.facebook', 'contact.instagram'])
      .then(({ data }) => {
        if (!data?.length) return;
        const map = {};
        data.forEach(row => { map[row.key] = row.value; });
        setContacts(prev => ({
          whatsapp:  map['contact.whatsapp_url'] ?? prev.whatsapp,
          phone:     map['contact.phone']        ?? prev.phone,
          email:     map['contact.email']        ?? prev.email,
          linkedin:  map['contact.linkedin']     ?? prev.linkedin,
          facebook:  map['contact.facebook']     ?? prev.facebook,
          instagram: map['contact.instagram']    ?? prev.instagram,
        }));
      });
  }, []);

  const socials = [
    { label: 'WhatsApp', href: contacts.whatsapp },
    { label: 'Email',    href: `mailto:${contacts.email}`, emailBtn: true },
    { label: 'LinkedIn', href: contacts.linkedin,  target: '_blank' },
    { label: 'Facebook', href: contacts.facebook,  target: '_blank' },
    { label: 'Instagram',href: contacts.instagram, target: '_blank' },
  ];

  const goto = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer
      style={{
        background: 'oklch(0.09 0.012 240)',
        borderTop: 'none',
        paddingTop: '56px',
        paddingBottom: '32px',
        paddingRight: '28px',
        paddingLeft: '28px',
        position: 'relative',
      }}
    >
      {/* Gradient top border */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 1,
        background: 'linear-gradient(to left, transparent, var(--brand-deep) 25%, oklch(0.785 0.173 156.6 / 0.35) 50%, var(--brand-deep) 75%, transparent)',
      }} />
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* Top row */}
        <div style={{
          display: 'flex', flexWrap: 'wrap', alignItems: 'flex-start',
          justifyContent: 'space-between', gap: 40, marginBottom: 48,
        }}>
          {/* Logo + tagline */}
          <div>
            <img
              src={logoSrc}
              alt="Shift Up"
              style={{ height: 80, width: 'auto', objectFit: 'contain', display: 'block', marginBottom: 14 }}
            />
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.65, maxWidth: 240 }}>
              אסטרטגיה חכמה + קריאייטיב נועז<br />שיווק שמביא תוצאות אמיתיות
            </p>
          </div>

          {/* Quick nav */}
          <nav aria-label="ניווט מהיר">
            <div style={{ fontSize: '0.68rem', color: '#8A9097', fontWeight: 700, marginBottom: 16 }}>
              ניווט
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {quickLinks.map(l => (
                <button
                  key={l.id}
                  onClick={() => goto(l.id)}
                  style={{
                    background: 'none', border: 'none', textAlign: 'right',
                    color: 'var(--text-secondary)', fontSize: '0.88rem', fontWeight: 500,
                    fontFamily: "'Space Grotesk', 'Secular One', sans-serif", cursor: 'pointer',
                    transition: 'color 0.2s', padding: 0,
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </nav>

          {/* Contact + socials */}
          <div>
            <div style={{ fontSize: '0.68rem', color: '#8A9097', fontWeight: 700, marginBottom: 16 }}>
              יצירת קשר
            </div>
            <a
              href={contacts.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: 8, transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              <bdi dir="ltr">{contacts.phone}</bdi>
            </a>
            <a
              href={`mailto:${contacts.email}`}
              style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.88rem', textDecoration: 'none', marginBottom: 20, transition: 'color 0.2s', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            >
              {contacts.email}
            </a>
            <div style={{ display: 'flex', gap: 8 }}>
              {socials.map(s => (
                <MagneticIcon key={s.label} href={s.href} label={s.label} target={s.target} emailBtn={s.emailBtn}>
                  {SOCIAL_ICONS[s.label]}
                </MagneticIcon>
              ))}
            </div>
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--surface-1)', marginBottom: 24 }} />

        {/* Bottom row */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <p style={{ fontSize: '0.78rem', color: '#8A9097' }}>
            © {new Date().getFullYear()} Shift Up · שמואל מוניץ · כל הזכויות שמורות
          </p>
          <nav aria-label="קישורים משפטיים" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
            <a href="/accessibility" style={legalLinkStyle}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = '#8A9097'}
            >
              הצהרת נגישות
            </a>
            <a href="/privacy" style={legalLinkStyle}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = '#8A9097'}
            >
              מדיניות פרטיות
            </a>
            <a href="/en" style={legalLinkStyle}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand-prime)'}
              onMouseLeave={e => e.currentTarget.style.color = '#8A9097'}
            >
              English Version →
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
