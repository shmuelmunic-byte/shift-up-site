import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

function isOnlineNow() {
  const hour = parseInt(
    new Intl.DateTimeFormat('he-IL', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()),
    10
  );
  return hour >= 8 && hour < 17;
}

const gradientStyle = {
  background: 'linear-gradient(120deg, var(--brand-glow) 0%, var(--brand-prime) 55%, var(--accent-void) 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
};

function StatCard({ stat, index }) {
  const numRef  = useRef(null);
  const cardRef = useRef(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (stat.live) setOnline(isOnlineNow());
  }, [stat.live]);

  useEffect(() => {
    const el = cardRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { y: 40, opacity: 0, scale: 0.96 },
      {
        y: 0, opacity: 1, scale: 1, duration: 0.8, ease: 'expo.out',
        delay: index * 0.1,
        scrollTrigger: { trigger: el, start: 'top 82%', once: true },
      }
    );

    if (typeof stat.count === 'number') {
      const obj = { val: 0 };
      ScrollTrigger.create({
        trigger: el, start: 'top 82%', once: true,
        onEnter: () => {
          gsap.to(obj, {
            val: stat.count, duration: 1.8, ease: 'power2.out',
            onUpdate: () => {
              if (numRef.current) numRef.current.textContent = Math.round(obj.val) + (stat.suffix || '');
            },
          });
        },
      });
    }
  }, [stat, index]);

  const showOnline = stat.live && online;

  const renderMain = () => {
    if (typeof stat.count === 'number') {
      return <span ref={numRef} className="counter-num" style={gradientStyle}>0{stat.suffix || ''}</span>;
    }
    if (stat.live) {
      return <span style={gradientStyle}>מענה מיידי</span>;
    }
    return <span style={gradientStyle}>{stat.display}</span>;
  };

  return (
    <div
      ref={cardRef}
      className="stat-card shimmer-card"
      style={{ opacity: 0, textAlign: 'right' }}
    >
      {/* Top glow line */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: 1,
        background: 'linear-gradient(to right, transparent, oklch(0.78 0.20 145 / 0.3), transparent)',
      }} />

      {/* Main value */}
      <div style={{
        fontSize: 'clamp(2rem, 5vw, 3.4rem)',
        fontWeight: 900,
        letterSpacing: '-0.03em',
        lineHeight: 1.1,
        marginBottom: 12,
        fontFamily: "'Heebo', sans-serif",
      }}>
        {renderMain()}
      </div>

      {/* Live availability badge */}
      {stat.live && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          background: showOnline ? 'oklch(0.78 0.20 145 / 0.1)' : 'oklch(0.14 0.02 240)',
          border: `1px solid ${showOnline ? 'oklch(0.78 0.20 145 / 0.3)' : 'oklch(0.22 0.02 240)'}`,
          borderRadius: 999,
          padding: '3px 10px',
          marginBottom: 8,
          transition: 'all 0.4s ease',
        }}>
          <span style={{
            width: 6, height: 6,
            borderRadius: '50%',
            background: showOnline ? 'var(--brand-prime)' : 'oklch(0.4 0.01 240)',
            display: 'block',
            flexShrink: 0,
            boxShadow: showOnline ? '0 0 6px var(--brand-prime)' : 'none',
            animation: showOnline ? 'pulse-ring 2s ease-out infinite' : 'none',
          }} />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: showOnline ? 'var(--brand-prime)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {showOnline ? 'זמין עכשיו' : 'בד״כ תוך שעה'}
          </span>
        </div>
      )}

      {/* Accent line */}
      {!stat.live && (
        <div style={{ height: 2, width: 32, background: 'var(--brand-prime)', borderRadius: 999, marginBottom: 10, opacity: 0.5 }} />
      )}

      {/* Label */}
      <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
        {stat.label}
      </div>
    </div>
  );
}

const statsData = [
  { count: 100, suffix: '%', label: 'מותאם אישית לכל עסק' },
  { live: true,              label: 'זמינות לפנייה' },
  { display: 'AI',           label: 'כלים מתקדמים' },
  { display: 'ROI',          label: 'הפוקוס היחיד' },
];

export default function Stats() {
  return (
    <section style={{ padding: 'clamp(48px, 8vw, 80px) 28px', background: 'var(--bedrock)' }}>
      <div className="stats-layout" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {statsData.map((s, i) => <StatCard key={i} stat={s} index={i} />)}
      </div>
    </section>
  );
}
