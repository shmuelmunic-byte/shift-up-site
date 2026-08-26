import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const words = [
  'רעיונות', 'זה', 'הדלק', 'שלי.', 'אנשים', 'זה', 'היעד.', 'העסקים', 'שלכם', 'הם', 'הדרך', 'לשם.'
];

export default function Manifesto() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const wordEls = section.querySelectorAll('.manifesto-word');

    const ctx = gsap.context(() => {
      // One-time reveal (not scroll-scrubbed): the manifesto becomes fully
      // readable when it enters and stays complete — no vanishing on scroll.
      gsap.fromTo(
        wordEls,
        { opacity: 0.12, y: 12, filter: 'blur(2px)' },
        {
          opacity: 1, y: 0, filter: 'blur(0px)',
          duration: 0.5, ease: 'power2.out', stagger: 0.05,
          scrollTrigger: { trigger: section, start: 'top 78%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      style={{
        padding: 'clamp(56px, 8vw, 96px) 28px',
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
          background: 'radial-gradient(circle, oklch(0.785 0.173 156.6 / 0.06), transparent 70%)',
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
          האני מאמין
        </div>

        <p
          translate="no"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            gap: '0.3em 0.5em',
            fontSize: 'clamp(2rem, 5vw, 4rem)',
            fontWeight: 900,
            lineHeight: 1.25,
            letterSpacing: '-0.02em',
            fontFamily: "'Space Grotesk', 'Secular One', sans-serif",
          }}
          aria-label={words.join(' ')}
        >
          {words.map((word, i) => {
            const isHighlight = ['רעיונות', 'הדלק', 'אנשים', 'היעד.'].includes(word);
            return (
              <span
                key={i}
                className="manifesto-word"
                style={{
                  display: 'inline-block',
                  opacity: 0.08,
                  color: isHighlight ? 'var(--accent)' : 'var(--text-primary)',
                  willChange: 'opacity, transform, filter',
                }}
              >
                {word}
              </span>
            );
          })}
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
