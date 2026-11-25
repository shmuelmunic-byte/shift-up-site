import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

import Navbar         from './components/Navbar';
import Hero           from './components/Hero';
import TrustStrip     from './components/TrustStrip';
import PainSection    from './components/PainSection';
import Process        from './components/Process';
import { Testimonials, Guarantee, Fit, Comparison } from './components/SaarSections';
import About          from './components/About';
import FAQ                  from './components/FAQ';
import LeadForm             from './components/LeadForm';
import WhatsAppGroup        from './components/WhatsAppGroup';
import Footer         from './components/Footer';
import PlanSection    from './components/PlanSection';

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

  // הגעה מקישור בפוטר של דף פנימי (/#faq וכו', סבב 2): גלילה לסקשן אחרי הטעינה
  useEffect(() => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (!id) return;
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView(), 350);
    return () => clearTimeout(t);
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
      className="c-site"
      style={{
        minHeight: '100vh',
        background: 'var(--bedrock)',
        color: 'var(--text-primary)',
        fontFamily: 'var(--font)',
        overflowX: 'clip',
        position: 'relative',
      }}
    >
      <ScrollProgress />
      <Navbar onCta={scrollToContact} />
      <main>
        {/* כיוון C, סבב 2 (25.11.2026). סדר לפי מיצוב_תוכנית_קודם.md סעיף 3. קצב: כהה (הירו, אמון, כאב)
            · בהיר (התוכנית) · כהה (תהליך) · בהיר (עדויות) · כהה (הבטחה) · בהיר (התאמה, השוואה)
            · כהה (מי אני) · בהיר (שאלות) · כהה (טופס, קהילה, פוטר). "מה מקבלים" הוחלף ב"התוכנית" */}
        <Hero onContact={scrollToContact} onProcess={scrollToProcess} />
        <TrustStrip />
        <PainSection />
        <PlanSection />
        <Process />
        <Testimonials />
        <Guarantee onContact={scrollToContact} />
        <Fit />
        <Comparison />
        <About />
        <FAQ />
        <LeadForm />
        <WhatsAppGroup />
      </main>
      <Footer />
    </div>
  );
}
