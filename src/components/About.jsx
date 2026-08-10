import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const profileSrc = '/shmuel.png';

export default function About() {
  const sectionRef = useRef(null);
  const imgRef     = useRef(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.about-header',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: '.about-header', start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        '.about-img',
        { y: 60, opacity: 0, scale: 0.95 },
        {
          y: 0, opacity: 1, scale: 1, duration: 1.0, ease: 'expo.out',
          scrollTrigger: { trigger: '.about-img', start: 'top 80%', once: true },
        }
      );

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

    // 3D tilt on the image block (not the float wrapper)
    const el = imgRef.current;
    const onMove = (e) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / rect.width;
      const dy = (e.clientY - cy) / rect.height;
      gsap.to(el, {
        rotateY: dx * 7,
        rotateX: -dy * 7,
        duration: 0.6,
        ease: 'power2.out',
        overwrite: 'auto',
      });
    };
    const onLeave = () => {
      gsap.to(el, { rotateY: 0, rotateX: 0, duration: 0.9, ease: 'elastic.out(1, 0.55)' });
    };

    el?.addEventListener('mousemove', onMove);
    el?.addEventListener('mouseleave', onLeave);

    return () => {
      ctx.revert();
      el?.removeEventListener('mousemove', onMove);
      el?.removeEventListener('mouseleave', onLeave);
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
      {/* ambient blobs */}
      <div
        className="fluid-blob"
        style={{
          width: 500, height: 500,
          top: '-5%', right: '-5%',
          background: 'radial-gradient(circle, oklch(0.508 0.155 292.2 / 0.09), transparent 70%)',
          '--dur': '24s',
        }}
      />
      <div
        className="fluid-blob"
        style={{
          width: 350, height: 350,
          bottom: '0%', left: '-5%',
          background: 'radial-gradient(circle, oklch(0.65 0.22 200 / 0.07), transparent 70%)',
          '--dur': '28s', '--delay': '-10s',
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
        {/* ── Image column ── */}
        <div
          className="about-img"
          style={{ opacity: 0, maxWidth: 340, margin: '0 auto', width: '100%' }}
        >
          {/* Float wrapper — CSS float animation, separate from tilt target */}
          <div style={{ animation: 'float 7s ease-in-out infinite', position: 'relative' }}>

            {/* Tilt target */}
            <div
              ref={imgRef}
              style={{
                position: 'relative',
                transformStyle: 'preserve-3d',
                perspective: 900,
              }}
            >
              {/* Ambient glow matching photo (teal left, purple right) */}
              <div
                style={{
                  position: 'absolute',
                  inset: -40,
                  background:
                    'radial-gradient(ellipse at 25% 50%, oklch(0.65 0.22 200 / 0.35) 0%, transparent 55%),' +
                    'radial-gradient(ellipse at 75% 40%, oklch(0.508 0.155 292.2 / 0.30) 0%, transparent 55%)',
                  filter: 'blur(30px)',
                  zIndex: 0,
                  borderRadius: 40,
                  pointerEvents: 'none',
                }}
              />

              {/* Spinning border ring wrapper */}
              <div
                style={{
                  position: 'relative',
                  zIndex: 1,
                  borderRadius: 24,
                  padding: 2,
                  overflow: 'hidden',
                  aspectRatio: '1 / 1',
                }}
              >
                {/* Rotating conic gradient ring — angle-only animation, no transform */}
                <div className="photo-ring" />

                {/* Image frame */}
                <div
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    borderRadius: 22,
                    overflow: 'hidden',
                    height: '100%',
                    background: 'var(--surface-0)',
                  }}
                >
                  <img
                    src={profileSrc}
                    alt="שמואל מוניץ - אסטרטג שיווק דיגיטלי ומומחה AI"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      objectPosition: 'center top',
                      display: 'block',
                    }}
                  />

                  {/* Bottom vignette */}
                  <div
                    style={{
                      position: 'absolute',
                      inset: 0,
                      background: 'linear-gradient(to top, oklch(0.08 0.01 240 / 0.3), transparent 50%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Scan line sweep */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 0, right: 0,
                      top: 0,
                      height: 90,
                      background:
                        'linear-gradient(to bottom, transparent, oklch(0.785 0.173 156.6 / 0.07) 50%, transparent)',
                      animation: 'scan-sweep 5s ease-in-out 3.5s infinite',
                      pointerEvents: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Name badge — top */}
              <div
                style={{
                  position: 'absolute',
                  top: -16,
                  left: 14,
                  zIndex: 2,
                  background: 'oklch(0.14 0.02 240 / 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid oklch(0.28 0.03 240)',
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
                    boxShadow: '0 0 8px var(--brand-prime)',
                    animation: 'breathing 2s ease-in-out infinite',
                  }}
                />
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-primary)', fontFamily: "'Heebo', sans-serif" }}>
                  שמואל מוניץ
                </span>
              </div>

              {/* Available badge — bottom */}
              <div
                style={{
                  position: 'absolute',
                  bottom: -16,
                  right: 14,
                  zIndex: 2,
                  background: 'oklch(0.14 0.02 240 / 0.92)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid oklch(0.785 0.173 156.6 / 0.3)',
                  borderRadius: 999,
                  padding: '6px 14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span
                  style={{
                    position: 'relative',
                    display: 'flex',
                    width: 8, height: 8, flexShrink: 0,
                  }}
                >
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
                <span style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-prime)', fontFamily: "'Heebo', sans-serif" }}>
                  זמין לפרויקטים
                </span>
              </div>

              {/* Floating "Shift Up" tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '35%',
                  right: -22,
                  zIndex: 2,
                  background: 'oklch(0.13 0.02 240 / 0.88)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid oklch(0.785 0.173 156.6 / 0.2)',
                  borderRadius: 10,
                  padding: '7px 11px',
                  transform: 'rotate(3deg)',
                  animation: 'float 9s 2s ease-in-out infinite',
                }}
              >
                <span
                  className="text-gradient"
                  style={{ fontSize: '0.76rem', fontWeight: 900, fontFamily: "'Heebo', sans-serif" }}
                >
                  Shift Up ↑
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Text column ── */}
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
              <>אני יזם בנשמה. אני מבין שעסק צריך <strong style={{ color: 'var(--text-primary)' }}>החזר השקעה (ROI)</strong> ולא רק "לייקים". כאן כדי לבנות מערכת שיווקית שעובדת — ולהוציא אותה לפועל.</>,
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
                    background: i === 0 ? 'var(--brand-prime)' : 'oklch(0.22 0.02 240)',
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
