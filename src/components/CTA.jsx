import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const DEFAULT_WA =
  'https://wa.me/972534673151?text=' +
  encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות');

const DEFAULT_SUBTEXT = 'הקפה עליי. הפיצוח עליי. ההחלטה עליכם.';
const DEFAULT_LINKEDIN = 'https://www.linkedin.com/in/shmuel-munitz-marketing';

function MagneticCTA({ children }) {
  const wrapRef = useRef(null);

  const onMove = (e) => {
    const el = wrapRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    gsap.to(el, { x: dx * 0.42, y: dy * 0.42, duration: 0.45, ease: 'power2.out' });
  };

  const onLeave = () => {
    gsap.to(wrapRef.current, { x: 0, y: 0, duration: 0.7, ease: 'elastic.out(1, 0.5)' });
  };

  return (
    <div
      ref={wrapRef}
      style={{ display: 'inline-block', position: 'relative' }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
    >
      {children}
    </div>
  );
}

export default function CTA() {
  const sectionRef  = useRef(null);
  const btnRef      = useRef(null);
  const [hovered, setHovered]   = useState(false);
  const idleTimerRef = useRef(null);
  const [idlePulse, setIdlePulse] = useState(false);
  const [whatsappLink, setWhatsappLink] = useState(DEFAULT_WA);
  const [subtext, setSubtext]           = useState(DEFAULT_SUBTEXT);
  const [linkedinUrl, setLinkedinUrl]   = useState(DEFAULT_LINKEDIN);

  useEffect(() => {
    supabase.from('site_content')
      .select('key, value')
      .in('key', ['contact.whatsapp_url', 'cta.subtext', 'contact.linkedin'])
      .then(({ data }) => {
        if (!data) return;
        data.forEach(row => {
          if (row.key === 'contact.whatsapp_url') setWhatsappLink(row.value);
          if (row.key === 'cta.subtext')          setSubtext(row.value);
          if (row.key === 'contact.linkedin')     setLinkedinUrl(row.value);
        });
      });
  }, []);

  const trackLead = () => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'WhatsApp Click' });
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.cta-content',
        { y: 60, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 1.0, ease: 'expo.out',
          scrollTrigger: { trigger: '.cta-content', start: 'top 78%', once: true },
        }
      );

      // idle attention pulse after 5s in viewport
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top 60%',
        once: true,
        onEnter: () => {
          idleTimerRef.current = setTimeout(() => setIdlePulse(true), 5000);
        },
      });
    }, sectionRef);

    return () => {
      ctx.revert();
      clearTimeout(idleTimerRef.current);
    };
  }, []);

  // stop idle pulse the moment the user engages with the button
  const handleEnter = () => {
    setHovered(true);
    setIdlePulse(false);
    clearTimeout(idleTimerRef.current);
  };

  return (
    <section
      id="contact"
      ref={sectionRef}
      className="cta-bg"
      style={{
        padding: 'clamp(80px, 12vw, 140px) 28px',
        position: 'relative',
        overflow: 'hidden',
        textAlign: 'center',
      }}
    >
      {/* background blobs */}
      <div
        className="fluid-blob"
        style={{
          width: 700, height: 700,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.10), transparent 65%)',
          '--dur': '20s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 400, height: 400,
          top: '10%', right: '5%',
          background: 'radial-gradient(circle, oklch(0.508 0.155 292.2 / 0.12), transparent 70%)',
          '--dur': '26s', '--delay': '-7s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 350, height: 350,
          bottom: '5%', left: '8%',
          background: 'radial-gradient(circle, oklch(0.65 0.22 145 / 0.09), transparent 70%)',
          '--dur': '22s', '--delay': '-12s',
        }}
      />

      <div
        className="cta-content"
        style={{
          maxWidth: 700,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          opacity: 0,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 14,
            marginBottom: 24,
          }}
        >
          <span style={{ height: 1, width: 24, background: 'var(--brand-prime)', opacity: 0.5, display: 'block' }} />
          <span style={{ fontSize: '0.7rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--brand-prime)', fontWeight: 700 }}>
            Let's Talk
          </span>
          <span style={{ height: 1, width: 24, background: 'var(--brand-prime)', opacity: 0.5, display: 'block' }} />
        </div>

        <h2
          style={{
            fontSize: 'clamp(2.4rem, 6vw, 5rem)',
            fontWeight: 900,
            letterSpacing: '-0.025em',
            lineHeight: 1.05,
            marginBottom: 20,
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          מוכנים לעשות{' '}
          <span className="text-gradient">Shift Up?</span>
        </h2>

        <p
          style={{
            fontSize: 'clamp(1rem, 2vw, 1.2rem)',
            color: 'var(--text-secondary)',
            marginBottom: 52,
            lineHeight: 1.7,
          }}
        >
          {subtext}
        </p>


        {/* Card */}
        <div
          className="animated-border glass-panel"
          style={{
            padding: 'clamp(32px, 4vw, 52px)',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          {/* top accent line */}
          <div
            style={{
              position: 'absolute',
              top: 0, left: 0, right: 0,
              height: 2,
              background: 'linear-gradient(to right, var(--brand-deep), var(--brand-prime), var(--accent-void))',
            }}
          />

          {/* WhatsApp button with pulse rings */}
          <div
            style={{
              position: 'relative',
              display: 'inline-flex',
              justifyContent: 'center',
              marginBottom: 24,
            }}
          >
            {/* pulse rings */}
            {[1, 2].map(k => (
              <div
                key={k}
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: 999,
                  border: `1.5px solid oklch(0.785 0.173 156.6 / ${hovered || idlePulse ? 0.5 : 0.25})`,
                  animation: (hovered || idlePulse)
                    ? `pulse-ring ${1.4 + k * 0.5}s ease-out ${k * 0.35}s infinite`
                    : 'none',
                  pointerEvents: 'none',
                }}
              />
            ))}

            <MagneticCTA>
              <a
                ref={btnRef}
                href={whatsappLink}
                onClick={trackLead}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={handleEnter}
                onMouseLeave={() => setHovered(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '16px 40px',
                  background: hovered
                    ? 'var(--brand-glow)'
                    : 'var(--brand-prime)',
                  color: 'oklch(0.08 0.01 240)',
                  borderRadius: 999,
                  fontWeight: 800,
                  fontSize: 'clamp(1rem, 2vw, 1.1rem)',
                  fontFamily: "'Heebo', sans-serif",
                  textDecoration: 'none',
                  boxShadow: hovered || idlePulse
                    ? '0 0 60px oklch(0.785 0.173 156.6 / 0.65), 0 0 100px oklch(0.785 0.173 156.6 / 0.25)'
                    : '0 0 40px oklch(0.785 0.173 156.6 / 0.35)',
                  transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
                  transition: 'background 0.25s, box-shadow 0.35s, transform 0.3s',
                  position: 'relative',
                  zIndex: 1,
                }}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                שלח הודעה בוואטסאפ
              </a>
            </MagneticCTA>
          </div>

          {/* LinkedIn secondary CTA */}
          <div style={{ marginTop: 20, marginBottom: 4 }}>
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                padding: '10px 24px',
                background: 'transparent',
                border: '1px solid var(--surface-2)',
                borderRadius: 999,
                color: 'var(--text-secondary)',
                fontSize: '0.88rem',
                fontWeight: 600,
                fontFamily: "'Heebo', sans-serif",
                textDecoration: 'none',
                transition: 'border-color 0.25s, color 0.25s',
                cursor: 'pointer',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'oklch(0.785 0.173 156.6 / 0.4)'; e.currentTarget.style.color = 'var(--brand-prime)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-2)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
              </svg>
              עקוב ב-LinkedIn
            </a>
          </div>

          {/* availability */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              fontSize: '0.82rem',
              color: 'var(--text-muted)',
              marginTop: 16,
            }}
          >
            <span style={{ position: 'relative', display: 'flex', width: 8, height: 8, flexShrink: 0 }}>
              <span
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '50%',
                  background: 'var(--brand-prime)',
                  opacity: 0.6,
                  animation: 'pulse-ring 1.8s ease-out infinite',
                }}
              />
              <span
                style={{
                  position: 'relative',
                  width: 8, height: 8,
                  borderRadius: '50%',
                  background: 'var(--brand-prime)',
                  display: 'block',
                }}
              />
            </span>
            זמין לשיחת היכרות קצרה — חינם, ללא התחייבות.
          </div>
        </div>
      </div>
    </section>
  );
}
