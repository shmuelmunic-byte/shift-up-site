import { useEffect, useRef, useCallback } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Cursor         from './components/Cursor';
import Navbar         from './components/Navbar';
import Hero           from './components/Hero';
import MarqueeSection from './components/MarqueeSection';
import Stats          from './components/Stats';
import Process        from './components/Process';
import WhyMe          from './components/WhyMe';
import Manifesto      from './components/Manifesto';
import About          from './components/About';
import FAQ            from './components/FAQ';
import WhatsAppGroup  from './components/WhatsAppGroup';
import CTA            from './components/CTA';
import Footer         from './components/Footer';

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: 'expo.out', duration: 0.8 });

function ScrollProgress() {
  const barRef = useRef(null);

  useEffect(() => {
    const update = () => {
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? (window.scrollY / docH) * 100 : 0;
      if (barRef.current) {
        barRef.current.style.setProperty('--scroll-pct', `${pct}%`);
      }
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return <div ref={barRef} className="scroll-progress" aria-hidden="true" />;
}

export default function App() {
  const rootRef = useRef(null);

  // ── Lenis smooth scroll ──────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smoothTouch: false,
      touchMultiplier: 1.8,
    });

    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
  }, []);

  // ── Auto direction switch when Google Translate changes html[lang] ──
  useEffect(() => {
    const applyDir = () => {
      const lang = document.documentElement.lang || 'he';
      const isHebrew = lang === '' || lang.startsWith('he') || lang.startsWith('iw');
      const dir = isHebrew ? 'rtl' : 'ltr';
      if (rootRef.current) rootRef.current.dir = dir;
      document.documentElement.dir = dir;
    };

    const observer = new MutationObserver(applyDir);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['lang'] });
    applyDir();

    return () => observer.disconnect();
  }, []);

  const scrollToContact = () => {
    const el = document.getElementById('contact');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToProcess = () => {
    const el = document.getElementById('strategy');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div
      ref={rootRef}
      dir="rtl"
      style={{
        minHeight: '100vh',
        background: 'var(--bedrock)',
        color: 'var(--text-primary)',
        fontFamily: "'Heebo', sans-serif",
        overflowX: 'hidden',
        position: 'relative',
      }}
    >
      <ScrollProgress />
      <div className="noise-overlay" aria-hidden="true" />
      <Cursor />
      <Navbar onCta={scrollToContact} />
      <main>
        <Hero onProcess={scrollToProcess} />
        <MarqueeSection />
        <div className="section-divider" />
        <Stats />
        <div className="section-divider" />
        <Process />
        <div className="section-divider" />
        <WhyMe />
        <Manifesto />
        <div className="section-divider" />
        <About />
        <div className="section-divider" />
        <FAQ />
        <WhatsAppGroup />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}
