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

function StatItem({ stat, index }) {
  const numRef  = useRef(null);
  const itemRef = useRef(null);
  const [online, setOnline] = useState(false);

  useEffect(() => {
    if (stat.live) setOnline(isOnlineNow());
  }, [stat.live]);

  useEffect(() => {
    const el = itemRef.current;
    if (!el) return;

    gsap.fromTo(
      el,
      { y: 40, opacity: 0 },
      {
        y: 0, opacity: 1, duration: 0.8, ease: 'expo.out',
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
      return (
        <span ref={numRef} className="counter-num" style={gradientStyle}>
          0{stat.suffix || ''}
        </span>
      );
    }

    if (stat.live) {
      return (
        <span style={gradientStyle}>
          מענה מיידי
        </span>
      );
    }

    return (
      <span style={gradientStyle}>
        {stat.display}
      </span>
    );
  };

  return (
    <div ref={itemRef} style={{ textAlign: 'right', opacity: 0, padding: '8px 0' }}>

      {/* Main value */}
      <div
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.2rem)',
          fontWeight: 900,
          letterSpacing: '-0.03em',
          lineHeight: 1.1,
          marginBottom: 10,
          fontFamily: "'Heebo', sans-serif",
        }}
      >
        {renderMain()}
      </div>

      {/* Live availability badge */}
      {stat.live && (
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: showOnline ? 'oklch(0.78 0.20 145 / 0.1)' : 'var(--surface-1)',
            border: `1px solid ${showOnline ? 'oklch(0.78 0.20 145 / 0.3)' : 'var(--surface-2)'}`,
            borderRadius: 999,
            padding: '3px 10px',
            marginBottom: 8,
            transition: 'all 0.4s ease',
          }}
        >
          <span
            style={{
              width: 6, height: 6,
              borderRadius: '50%',
              background: showOnline ? 'var(--brand-prime)' : 'oklch(0.4 0.01 240)',
              display: 'block',
              flexShrink: 0,
              boxShadow: showOnline ? '0 0 6px var(--brand-prime)' : 'none',
              animation: showOnline ? 'pulse-ring 2s ease-out infinite' : 'none',
            }}
          />
          <span style={{ fontSize: '0.7rem', fontWeight: 700, color: showOnline ? 'var(--brand-prime)' : 'var(--text-muted)', letterSpacing: '0.04em' }}>
            {showOnline ? 'זמין עכשיו' : 'בד״כ תוך שעה'}
          </span>
        </div>
      )}

      {/* Divider */}
      {!stat.live && (
        <div style={{ height: 2, width: 36, background: 'var(--brand-prime)', borderRadius: 999, marginBottom: 10, opacity: 0.45 }} />
      )}

      {/* Label */}
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.04em' }}>
        {stat.label}
      </div>
    </div>
  );
}

const statsData = [
  { count: 100, suffix: '%', label: 'מותאם אישית' },
  { live: true,              label: 'זמינות לפנייה' },
  { display: 'AI',           label: 'כלים מתקדמים' },
  { display: 'ROI',          label: 'הפוקוס היחיד' },
];

export default function Stats() {
  return (
    <section style={{ padding: '80px 28px', background: 'var(--bedrock)' }}>
      <div className="stats-layout" style={{ maxWidth: 1200, margin: '0 auto' }}>
        {statsData.map((s, i) => <StatItem key={i} stat={s} index={i} />)}
      </div>
    </section>
  );
}
