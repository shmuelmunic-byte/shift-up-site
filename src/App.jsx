import { useEffect } from 'react';
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
import CTA            from './components/CTA';
import Footer         from './components/Footer';

gsap.registerPlugin(ScrollTrigger);

// default GSAP config
gsap.defaults({ ease: 'expo.out', duration: 0.8 });

export default function App() {
  // ── Lenis smooth scroll ──────────────────────────────────────────
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      smoothTouch: false,
      touchMultiplier: 1.8,
    });

    // connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
      gsap.ticker.remove((time) => lenis.raf(time * 1000));
    };
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
      {/* Persistent layers */}
      <div className="noise-overlay" aria-hidden="true" />
      <Cursor />

      {/* Navigation */}
      <Navbar onCta={scrollToContact} />

      {/* Sections */}
      <main>
        <Hero onProcess={scrollToProcess} />
        <MarqueeSection />
        <Stats />
        <Process />
        <WhyMe />
        <Manifesto />
        <About />
        <FAQ />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}
