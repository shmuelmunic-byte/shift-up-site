import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { supabase } from '../lib/supabase';

gsap.registerPlugin(ScrollTrigger);

const FALLBACK_FAQS = [
  { q: 'כמה זמן לוקח לראות תוצאות?', a: 'המחקר והאסטרטגיה לוקחים כשבועיים. לראות לידים איכותיים זורמים — בין 30 ל-60 יום, תלוי בענף. אני בונה איתך לטווח ארוך, לא הבטחות סרק של "תוצאות בעוד שבוע".' },
  { q: 'כמה זה עולה?', a: 'מחיר קבוע וסגור שנקבע בשיחת ההיכרות, לפי היקף העבודה: הקמה חד-פעמית + ניהול חודשי (תקציב המדיה נפרד). בלי חבילות מעורפלות ובלי הפתעות — תדע בדיוק כמה, לפני שמתחילים.' },
  { q: 'במה אתה שונה משאר משווקי הדיגיטל?', a: 'רובם מתחילים ב"בוא נריץ קמפיין". אני מתחיל במחקר — קהל, מתחרים, מסר — ורק אז בונה קמפיין. בנוסף, אני משלב כלי AI שחוסכים זמן וכסף, ולוקח מספר מצומצם של לקוחות.' },
  { q: 'כבר נכוויתי מספק קודם. למה שהפעם יהיה שונה?', a: 'בגלל זה יש הבטחת ביצוע. שיהיה ברור — זה לא "חודש ראשון חינם": אם בחודש הניהול הראשון אין פניות, אני ממשיך לנהל בחינם עד שיש. הסיכון עליי, לא עליך.' },
  { q: 'מה כולל שלב המחקר והאסטרטגיה?', a: 'מסמך אסטרטגי מלא: ניתוח מתחרים, מיפוי קהל יעד, הצעת ערך מדויקת, מסרים מרכזיים, ערוצי שיווק מומלצים, ומפת דרכים יישומית של 90 יום.' },
  { q: 'אתה גם מבצע או רק מייעץ?', a: 'שניהם. אחרי שסוגרים אסטרטגיה, אני בונה ומפעיל לך את הקמפיינים הממומנים ב-Meta וב-Google, מטפל במסרים ובקריאייטיב. שותף ביצוע — מהמחקר ועד שהקמפיין באוויר.' },
];

function ChatItem({ item, isActive, onOpen }) {
  const [displayed, setDisplayed] = useState('');
  const [thinking,  setThinking]  = useState(false);
  const timerRef  = useRef(null);
  const thinkRef  = useRef(null);

  useEffect(() => {
    if (!isActive) {
      setDisplayed('');
      setThinking(false);
      clearInterval(timerRef.current);
      clearTimeout(thinkRef.current);
      return;
    }

    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reducedMotion) {
      setThinking(false);
      setDisplayed(item.a);
      return;
    }

    setDisplayed('');
    setThinking(true);

    thinkRef.current = setTimeout(() => {
      setThinking(false);
      let i = 0;
      timerRef.current = setInterval(() => {
        i++;
        setDisplayed(item.a.slice(0, i));
        if (i >= item.a.length) clearInterval(timerRef.current);
      }, 16);
    }, 450);

    return () => {
      clearInterval(timerRef.current);
      clearTimeout(thinkRef.current);
    };
  }, [isActive, item.a]);

  return (
    <div
      style={{
        marginBottom: 14,
        opacity: 0,
      }}
      className="faq-item"
    >
      {/* Question bubble */}
      <button
        onClick={onOpen}
        style={{
          width: '100%',
          textAlign: 'right',
          background: isActive ? 'var(--surface-2)' : 'var(--surface-1)',
          border: `1px solid ${isActive ? 'oklch(0.78 0.20 145 / 0.3)' : 'oklch(0.22 0.02 240)'}`,
          borderRadius: isActive ? '16px 16px 0 16px' : 16,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          transition: 'background 0.3s, border-color 0.3s, border-radius 0.3s',
          fontFamily: "'Heebo', sans-serif",
        }}
        aria-expanded={isActive}
      >
        <span
          style={{
            fontSize: 'clamp(0.9rem, 1.5vw, 1rem)',
            fontWeight: 700,
            color: 'var(--text-primary)',
            lineHeight: 1.5,
            flex: 1,
          }}
        >
          {item.q}
        </span>
        {/* arrow icon */}
        <span
          style={{
            flexShrink: 0,
            width: 28, height: 28,
            borderRadius: '50%',
            background: isActive ? 'oklch(0.78 0.20 145 / 0.2)' : 'oklch(0.18 0.025 240)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'transform 0.35s var(--ease-spring), background 0.3s',
            transform: isActive ? 'rotate(45deg)' : 'rotate(0deg)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand-prime)" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
        </span>
      </button>

      {/* Answer bubble */}
      {isActive && (
        <div
          style={{
            background: 'oklch(0.11 0.015 240)',
            border: '1px solid oklch(0.22 0.02 240)',
            borderTop: 'none',
            borderRadius: '0 0 16px 16px',
            padding: '16px 20px 18px',
          }}
        >
          {thinking ? (
            <div
              className="chat-thinking"
              style={{ display: 'flex', gap: 5, alignItems: 'center', height: 24 }}
              aria-label="...חושב"
            >
              <span /><span /><span />
            </div>
          ) : (
            <p
              style={{
                fontSize: 'clamp(0.88rem, 1.5vw, 0.96rem)',
                color: 'var(--text-secondary)',
                lineHeight: 1.78,
                minHeight: 24,
              }}
            >
              {displayed}
              {displayed.length < item.a.length && displayed.length > 0 && (
                <span
                  style={{
                    display: 'inline-block',
                    width: 2,
                    height: '1em',
                    background: 'var(--brand-prime)',
                    marginRight: 2,
                    verticalAlign: 'text-bottom',
                    animation: 'breathing 0.8s ease-in-out infinite',
                  }}
                />
              )}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const sectionRef = useRef(null);
  const [activeIdx, setActiveIdx] = useState(null);
  const [faqs, setFaqs] = useState(FALLBACK_FAQS);

  useEffect(() => {
    supabase.from('faqs').select('*').order('position')
      .then(({ data }) => {
        if (data?.length) setFaqs(data.map(r => ({ q: r.question, a: r.answer })));
      });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.faq-header',
        { y: 50, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.9, ease: 'expo.out',
          scrollTrigger: { trigger: '.faq-header', start: 'top 80%', once: true },
        }
      );

      gsap.fromTo(
        '.faq-item',
        { y: 30, opacity: 0 },
        {
          y: 0, opacity: 1, duration: 0.65, ease: 'expo.out',
          stagger: 0.08,
          scrollTrigger: { trigger: '.faq-list', start: 'top 78%', once: true },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleOpen = (i) => {
    setActiveIdx(prev => (prev === i ? null : i));
  };

  return (
    <section
      id="faq"
      ref={sectionRef}
      style={{
        padding: 'clamp(80px, 10vw, 130px) 28px',
        background: 'var(--bedrock)',
        position: 'relative',
      }}
    >
      <div style={{ maxWidth: 760, margin: '0 auto' }}>

        <div className="faq-header" style={{ textAlign: 'right', marginBottom: 52, opacity: 0 }}>
          <div className="section-label">FAQ</div>
          <h2
            style={{
              fontSize: 'clamp(2rem, 4.5vw, 3.4rem)',
              fontWeight: 900,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
              marginBottom: 14,
              fontFamily: "'Heebo', sans-serif",
            }}
          >
            שאלות נפוצות
          </h2>
        </div>

        <div className="faq-list">
          {faqs.map((item, i) => (
            <ChatItem
              key={i}
              item={item}
              isActive={activeIdx === i}
              onOpen={() => handleOpen(i)}
            />
          ))}
        </div>

        {/* bottom note */}
        <div
          style={{
            marginTop: 32,
            textAlign: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 10,
          }}
        >
          <span style={{ height: 1, width: 20, background: 'var(--surface-2)', display: 'block' }} />
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            שאלה שלא מופיעה כאן?{' '}
            <a
              href="https://wa.me/972534673151"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: 'var(--brand-prime)',
                fontWeight: 700,
                textDecoration: 'none',
              }}
            >
              שלח הודעה
            </a>{' '}
            ואחזור אליך מהר.
          </p>
          <span style={{ height: 1, width: 20, background: 'var(--surface-2)', display: 'block' }} />
        </div>
      </div>
    </section>
  );
}
