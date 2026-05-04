import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const profileSrc = '/1000900908.jpg';

export default function About() {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // header
      gsap.fromTo(
        '.about-header',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: '.about-header', start: 'top 80%', once: true },
        }
      );

      // image
      gsap.fromTo(
        '.about-img',
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out',
          scrollTrigger: { trigger: '.about-img', start: 'top 80%', once: true },
        }
      );

      // paragraphs — each gets a left-border draw and fade
      gsap.utils.toArray('.about-para').forEach((el, i) => {
        gsap.fromTo(
          el,
          { x: -20, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 0.7, ease: 'expo.out',
            delay: i * 0.08,
            scrollTrigger: { trigger: el, start: 'top 85%', once: true },
          }
        );
      });
    }, sectionRef);

    // parallax tilt on image
    const img = imgRef.current;
    const onMove = (e) => {
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      gsap.to(img, {
        rotateY: dx * 6,
        rotateX: -dy * 6,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    const onLeave = () => {
      gsap.to(img, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)' });
    };

    img?.addEventListener('mousemove', onMove);
    img?.addEventListener('mouseleave', onLeave);

    return () => {
      ctx.revert();
      img?.removeEventListener('mousemove', onMove);
      img?.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <section
      id="about"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 10vw, 130px) 28px',
        background: 'var(--surface-0)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* ambient */}
      <div
        className="fluid-blob"
        style={{
          width: 500, height: 500,
          top: '-5%', right: '-5%',
          background: 'radial-gradient(circle, oklch(0.50 0.20 285 / 0.09), transparent 70%)',
          '--dur': '24s',
        }}
      />

      <div
        className="about-layout"
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Image column */}
        <div
          className="about-img"
          style={{
            opacity: 0,
            maxWidth: 320,
            margin: '0 auto',
            width: '100%',
          }}
        >
          <div
            ref={imgRef}
            style={{
              position: 'relative',
              transformStyle: 'preserve-3d',
              perspective: 800,
            }}
          >
            {/* glow halo */}
            <div
              style={{
                position: 'absolute',
                inset: -20,
                background: 'radial-gradient(circle at 50% 50%, oklch(0.78 0.20 145 / 0.2), oklch(0.50 0.20 285 / 0.12) 60%, transparent 80%)',
                borderRadius: 28,
                filter: 'blur(24px)',
                zIndex: 0,
              }}
            />

            {/* frame */}
            <div
              className="glow-border living-border"
              style={{
                position: 'relative',
                zIndex: 1,
                borderRadius: 20,
                overflow: 'hidden',
                aspectRatio: '4/5',
              }}
            >
              <img
                src={profileSrc}
                alt="שמואל מוניץ"
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.4), transparent 55%)',
                }}
              />
            </div>

            {/* name badge */}
            <div
              style={{
                position: 'absolute',
                top: -14,
                left: 16,
                zIndex: 2,
                background: 'var(--surface-1)',
                backdropFilter: 'blur(16px)',
                border: '1px solid var(--surface-2)',
                borderRadius: 999,
                padding: '6px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  width: 7, height: 7,
                  borderRadius: '50%',
                  background: 'var(--brand-prime)',
                  display: 'block',
                  boxShadow: '0 0 6px var(--brand-prime)',
                }}
              />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                שמואל מוניץ
              </span>
            </div>
          </div>
        </div>

        {/* Text column */}
        <div
          className="about-header"
          style={{ textAlign: 'right', opacity: 0 }}
        >
          <div className="section-label">About Me</div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.5rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 36,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            מי מאחורי{' '}
            <span className="text-gradient">Shift Up?</span>
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              <>נעים מאוד, אני <strong style={{ color: 'var(--text-primary)' }}>שמואל מוניץ</strong>.</>,
              <>אני לא אשקר לכם — אני לא מגיע ממשרד פרסום עם ותק של 20 שנה. וזה בדיוק <strong style={{ color: 'var(--brand-prime)' }}>היתרון שלכם</strong>.</>,
              <>בזמן שאחרים נחים על זרי הדפנה, אני חוקר את כלי ה-<strong style={{ color: 'var(--brand-prime)' }}>AI</strong> החדשים ביותר ומוצא דרכים חדשניות להביא לידים. כל לקוח הוא פרויקט הדגל שלי.</>,
              <>אני יזם בנשמה. אני מבין שעסק צריך <strong style={{ color: 'var(--text-primary)' }}>החזר השקעה (ROI)</strong> ולא רק "לייקים". כאן כדי לבנות מערכת שיווקית שעובדת — ולהפעיל אותה בפועל.</>,
            ].map((para, i) => (
              <div
                key={i}
                className="about-para"
                style={{
                  opacity: 0,
                  display: 'flex',
                  gap: 16,
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 2,
                    minHeight: 48,
                    background: i === 0
                      ? 'var(--brand-prime)'
                      : 'oklch(0.22 0.02 240)',
                    borderRadius: 999,
                    flexShrink: 0,
                    marginTop: 4,
                    transition: 'background 0.3s',
                  }}
                />
                <p style={{
                  fontSize: 'clamp(0.92rem, 1.6vw, 1.05rem)',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.78,
                }}>
                  {para}
                </p>
              </div>
            ))}

            {/* closing quote */}
            <div
              className="about-para"
              style={{
                opacity: 0,
                marginTop: 10,
                padding: '20px 24px',
                background: 'var(--surface-1)',
                borderRadius: 16,
                borderRight: '3px solid var(--brand-prime)',
              }}
            >
              <p
                style={{
                  fontSize: 'clamp(1.1rem, 2vw, 1.35rem)',
                  fontWeight: 800,
                  fontFamily: "'Heebo', sans-serif",
                  color: 'var(--text-primary)',
                  lineHeight: 1.5,
                }}
                className="text-gradient"
              >
                אנשים זה היעד.
              </p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginTop: 4 }}>
                העסקים שלכם הם הדרך לשם.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
