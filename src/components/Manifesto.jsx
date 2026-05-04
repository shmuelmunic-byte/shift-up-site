import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Manifesto() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.manifesto-text',
        { opacity: 0, y: 24, filter: 'blur(6px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 1.3, ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 70%',
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 12vw, 140px) 28px',
        background: 'var(--surface-0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ambient */}
      <div
        className="fluid-blob"
        style={{
          width: 600, height: 600,
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, oklch(0.78 0.20 145 / 0.06), transparent 70%)',
          '--dur': '30s',
        }}
      />

      <div
        style={{
          maxWidth: 960,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
        }}
      >
        <div className="section-label" style={{ justifyContent: 'center', marginBottom: 32 }}>
          The Manifesto
        </div>

        <p
          className="manifesto-text"
          style={{
            opacity: 0,
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.35,
            letterSpacing: '-0.02em',
            fontFamily: "'Heebo', sans-serif",
          }}
        >
          <span style={{ color: 'var(--brand-prime)' }}>רעיונות</span>{' '}
          זה{' '}
          <span style={{ color: 'var(--brand-prime)' }}>הדלק</span>{' '}
          שלי.{' '}
          <span style={{ color: 'var(--brand-prime)' }}>אנשים</span>{' '}
          זה{' '}
          <span style={{ color: 'var(--brand-prime)' }}>היעד.</span>{' '}
          <span style={{ color: 'var(--text-primary)' }}>העסקים שלכם הם הדרך לשם.</span>
        </p>

        {/* attribution */}
        <div
          style={{
            marginTop: 40,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            opacity: 0.5,
          }}
        >
          <span style={{ height: 1, width: 24, background: 'var(--brand-prime)', display: 'block' }} />
          <span style={{ fontSize: '0.75rem', letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600 }}>
            שמואל מוניץ
          </span>
          <span style={{ height: 1, width: 24, background: 'var(--brand-prime)', display: 'block' }} />
        </div>
      </div>
    </section>
  );
}
