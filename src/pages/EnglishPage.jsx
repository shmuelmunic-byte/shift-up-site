import { useEffect, useState } from 'react';
import Lenis from 'lenis';
import { supabase } from '../lib/supabase';
import { useSiteLinks } from '../lib/useSiteLinks';
import PageNav from '../components/PageNav';
import Tied from '../content/Tied';
import { nd } from '../content/heroCopy';
import PlanSection from '../components/PlanSection';
import { TESTIMONIALS } from '../components/SaarSections';

/* ════════════════════════════════════════════════════════════════════
   /en בכיוון C (סבב 2, 25.11.2026). LTR.
   כותרות Space Grotesk 700 (Secular One לא נבנה ללטינית), גוף Heebo, מספרים Space Grotesk.
   אותם רכיבים כמו בעמוד הראשי (c-design.css + c-pages.css): קצב כהה ובהיר, כפתורים מרובעים,
   בלי glass, הילות, כרטיסים מעוגלים או אייקונים גנריים. הטקסטים לא השתנו (רק בלי נקודה בסוף שורה),
   והם מרוכזים בקבועים כדי שיהיה קל להחליף
   ════════════════════════════════════════════════════════════════════ */

const WA_TEXT = encodeURIComponent("Hi Shmuel, I'd like to learn more about your services");
const profileSrc = '/shmuel.jpg';
const logoSrc    = '/logo.png';

const WA_ICON = (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
  </svg>
);

const goto = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

/* ─── Navbar ─────────────────────────────────────────────────────────── */

const navLinks = [
  { label: 'The Plan',    id: 'plan'        },
  { label: 'The Process', id: 'en-strategy' },
  { label: 'Why Me',      id: 'en-why'      },
  { label: 'About',       id: 'en-about'    },
  { label: 'FAQ',         id: 'en-faq'      },
];

function EnNavbar() {
  const [open, setOpen] = useState(false);
  const [activeId, setActiveId] = useState('');

  useEffect(() => {
    const ids = ['en-hero', ...navLinks.map(l => l.id), 'en-contact'];
    const obs = ids.map(id => {
      const el = document.getElementById(id);
      if (!el) return null;
      const o = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-30% 0px -60% 0px' }
      );
      o.observe(el);
      return o;
    });
    return () => obs.forEach(o => o?.disconnect());
  }, []);

  const go = (id) => { goto(id); setOpen(false); };

  return (
    <>
      <PageNav
        logoHref="#en-hero"
        onLogo={(e) => { e.preventDefault(); go('en-hero'); }}
        logoLabel="Shift Up, back to top"
        navLabel="Main navigation"
      >
        <ul className="c-nav__links">
          {navLinks.map(l => (
            <li key={l.id}>
              <button type="button" onClick={() => go(l.id)} aria-current={activeId === l.id ? 'true' : undefined}>{l.label}</button>
            </li>
          ))}
          <li><a href="/" lang="he" dir="rtl">עב</a></li>
        </ul>
        <a className="c-nav__cta" href="#en-contact" onClick={(e) => { e.preventDefault(); go('en-contact'); }}>Let's Talk</a>
        <button
          type="button"
          className="c-nav__burger"
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Close menu' : 'Menu'}
          aria-expanded={open}
          aria-controls="c-en-menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="square" aria-hidden="true">
            {open ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></> : <><line x1="3" y1="7" x2="21" y2="7"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="17" x2="21" y2="17"/></>}
          </svg>
        </button>
      </PageNav>

      {open && (
        <div id="c-en-menu" className="c-nav__menu c-en-menu">
          <div className="c-wrap">
            {navLinks.map(l => (
              <button type="button" key={l.id} onClick={() => go(l.id)}>{l.label}</button>
            ))}
            <a href="/" lang="he" dir="rtl">עברית →</a>
          </div>
        </div>
      )}
    </>
  );
}

/* ─── Hero (5.1) ─────────────────────────────────────────────────────── */

const EN_HERO = {
  eyebrow: 'Shmuel Munitz · Marketing strategist',
  h1: 'Know exactly how to bring clients to your business, within a week of our deep-dive session, *without~burning budget on experiments*',
  sub: 'After a deep-dive session I research your customers, your competitors and your market, and write you a clear plan that I build your campaign on',
  bullets: [
    'A written plan: what your customers say, who to advertise to, the message, three ad directions and the numbers',
    'I set up and run your campaign on it, on Meta and Google',
    'No inquiries in the first month of management? Another month of management is free',
  ],
  cta: 'Book a 30-minute intro call',
  under: "On the call we'll figure out what your business needs, and you'll leave with a fixed price",
  ctaWa: 'Got a question? Message me',
  steps: ['Intro call', 'Deep-dive session', 'Plan', 'Campaign'],
  badges: [['AVAILABILITY', 'A few clients at a time'], ['FIRST', 'A written plan']],
};

function EnHero({ onForm }) {
  const links = useSiteLinks();
  const WA_LINK = links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT;
  const h = EN_HERO;

  return (
    <section id="en-hero" className="c-hero c-en-hero">
      <div className="c-hero__photo">
        <img src={profileSrc} alt="Shmuel Munitz, marketing strategist" fetchPriority="high" />
      </div>

      <div className="c-wrap">
        <div className="c-hero__copy">
          <div className="c-eyebrow c-rise">{h.eyebrow}</div>
          <h1 className="c-hero__h1 c-rise"><Tied text={h.h1} /></h1>
          <p className="c-hero__sub c-rise">{nd(h.sub)}</p>
          <ul className="c-hero__bullets c-rise">
            {h.bullets.map((b) => <li key={b}>{nd(b)}</li>)}
          </ul>
          <div className="c-hero__ctas c-rise">
            <div className="c-hero__ctarow">
              <button type="button" className="c-btn" onClick={onForm}>{h.cta}</button>
              <a className="c-q" href={WA_LINK} target="_blank" rel="noopener noreferrer">{WA_ICON} {h.ctaWa}</a>
            </div>
            <p className="c-hero__under">{nd(h.under)}</p>
          </div>
          <ol className="c-tl c-rise" aria-label="How it works">
            {h.steps.map((s, i) => <li key={s} className="c-tl__s"><i aria-hidden="true">{i + 1}</i>{s}</li>)}
          </ol>
          <div className="c-en-hero__badges c-rise">
            {h.badges.map(([k, v]) => <div key={k} className="c-en-badge"><span>{k}</span><b>{v}</b></div>)}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust (5.2) ────────────────────────────────────────────────────── */

function isOnlineNow() {
  const h = parseInt(new Intl.DateTimeFormat('he-IL', { hour: 'numeric', hour12: false, timeZone: 'Asia/Jerusalem' }).format(new Date()), 10);
  return h >= 8 && h < 17;
}

const EN_TRUST = {
  title: 'Why trust me?',
  accent: 'Because the risk is on me',
  pillars: [
    { title: 'A plan before budget', text: 'Before a single shekel goes into ads, you get a written plan: who we advertise to, what we say, and how we\'ll know it works' },
    { title: 'Performance guarantee', text: "You pay for setup and management as usual, and if the first month of management brings no inquiries, I manage another month for free, and if there's still nothing, I tell you straight and we stop" },
    { title: 'Eye-level', text: 'The person who writes your plan is the person who runs your campaign, and picks up when you call' },
  ],
};

function EnTrustStrip() {
  const [online, setOnline] = useState(isOnlineNow);
  useEffect(() => {
    const id = setInterval(() => setOnline(isOnlineNow()), 60000);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="c-sec c-dark c-dark--2 c-trust" aria-labelledby="en-trust-h">
      <div className="c-wrap">
        <div className="c-trust__head">
          <h2 id="en-trust-h" className="c-h2">{EN_TRUST.title} <span className="c-g">{EN_TRUST.accent}</span></h2>
          <p className={`c-live${online ? ' is-on' : ''}`}>
            <span aria-hidden="true" />
            {online ? 'Available now' : 'Usually replies within an hour'}
          </p>
        </div>
        <ol className="c-pillars">
          {EN_TRUST.pillars.map((p, i) => (
            <li key={p.title}>
              <span className="c-num" aria-hidden="true">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{nd(p.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── Pain (5.3) ─────────────────────────────────────────────────────── */

const EN_PAIN = {
  label: 'A moment of truth',
  title: "You're advertising, and not really sure what brings you clients?",
  items: [
    "There are too many ways to advertise, and it's not clear where to start",
    "You worked with a campaign manager, and what came out wasn't focused",
    "You asked ChatGPT, and what you got didn't speak to you",
    'Most of your clients come by word of mouth, and what comes, comes',
  ],
  bridge: 'Before the next ad, you need to know',
  bridgeAccent: "who it's for and what it says",
};

function EnPain() {
  return (
    <section className="c-sec c-dark c-pain" aria-labelledby="en-pain-h">
      <div className="c-wrap">
        <div className="c-lbl">{EN_PAIN.label}</div>
        <h2 id="en-pain-h" className="c-h2 c-pain__h"><Tied text={EN_PAIN.title} /></h2>
        <ul className="c-pain__list">
          {EN_PAIN.items.map((t) => <li key={t}>{nd(t)}</li>)}
        </ul>
        <p className="c-pain__bridge">{EN_PAIN.bridge} <span className="c-g">{EN_PAIN.bridgeAccent}</span></p>
      </div>
    </section>
  );
}

/* ─── The plan (5.4): אותו רכיב של הבית, עם קופי באנגלית ─────────────── */

const EN_PLAN = {
  label: 'The plan',
  title: "What's in your plan",
  titleAccent: 'chapter by chapter',
  lead: 'A written, designed plan built on your business, and I walk you through it in a meeting',
  items: [
    { title: 'Your business today', text: 'Where you stand and where you want to get, in numbers' },
    { title: 'What your customers say', text: 'Real quotes from your calls and WhatsApp chats with customers, and what keeps coming up' },
    { title: 'Who your customer is', text: "What excites them, what scares them, and what they've already tried" },
    { title: 'The market', text: "Who else is advertising, what everyone says, and where there's room" },
    { title: 'The strategy', text: 'Who to advertise to, your one line and the message' },
    { title: 'The ads', text: 'Three directions, and a sample ad for each' },
    { title: "The customer's path", text: 'From the ad to the deal, and where people drop off' },
    { title: 'The numbers', text: "What one client is worth to you, how much makes sense to invest, and how we'll know it works" },
    { title: 'Bottom line', text: 'The first 90 days, and what we do tomorrow morning' },
  ],
  summary: "D&D Projects' plan, for example, came to about 90 pages, and their campaign went live on it",
};

/* ─── Process (5.5) ──────────────────────────────────────────────────── */

const EN_PROC = {
  label: 'The process',
  title: 'Plan first, *campaign second*',
  sub: 'You can stop after the plan and decide, and I only build a campaign on a plan',
  steps: [
    { n: '01', title: 'Intro call', text: 'Half an hour on the phone, at no cost: we figure out what your business needs, and you leave with a fixed price' },
    { n: '02', title: 'Deep-dive session', text: "I ask and you tell me: how clients find you, what they say, what you've tried and what came of it" },
    { n: '03', title: 'Written plan', text: 'I read your conversations with customers, research the market and the competitors, and present you a clear plan' },
    { n: '04', title: 'Setup', text: 'On the plan I set up the campaign on Meta and Google: the ads, the form and the tracking, and I check myself that every inquiry reaches you' },
    { n: '05', title: 'Management', text: 'I run it and report to you every week on how many inquiries came in and what I changed, with a performance guarantee on the first month' },
  ],
};

function EnProcess() {
  return (
    <section id="en-strategy" className="c-sec c-dark c-proc" aria-labelledby="en-proc-h">
      <div className="c-wrap">
        <div className="c-proc__head">
          <div className="c-lbl">{EN_PROC.label}</div>
          <h2 id="en-proc-h" className="c-h2"><Tied text={EN_PROC.title} /></h2>
          <p className="c-lead">{nd(EN_PROC.sub)}</p>
        </div>
        <ol className="c-en-steps">
          {EN_PROC.steps.map((s) => (
            <li key={s.n}>
              <div className="c-proc__big" aria-hidden="true">{s.n}</div>
              <h3>{s.title}</h3>
              <p>{nd(s.text)}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ─── Testimonials (5.6, החלטת שמואל 25.11): המקור בעברית מילה במילה, ומתחתיו תרגום ─── */

const EN_TESTI = {
  label: 'Testimonials',
  lead: 'What clients said to me, word for word',
  translated: 'Translated from Hebrew',
  // התרגום מילולי, בלי תוספות (אותו נוסח כמו ב-public/en.md)
  items: [
    { en: "It came out very nice, this is the ad we added at the end, it's this one I connect with the most, the credit goes to you", who: 'Daniel Ezran', role: 'D&D Projects, renovations and finishing', src: 'From WhatsApp' },
    { en: "Working with Shmuel is really a good atmosphere, everything is transparent... he's really available... and you can see he does it with all his heart and all his soul", who: 'Roi Kapach', role: 'Director, Orot pre-military academy', src: 'From a voice message' },
  ],
};

function EnTestimonials() {
  return (
    <section id="en-testimonials" className="c-sec c-light" aria-labelledby="en-tst-h">
      <div className="c-wrap">
        <div className="c-lbl">{EN_TESTI.label}</div>
        <h2 id="en-tst-h" className="c-h2" style={{ marginBottom: 48 }}>{EN_TESTI.lead}</h2>
        <div className="c-tg">
          {TESTIMONIALS.map((t, i) => {
            const e = EN_TESTI.items[i];
            return (
              <figure key={t.name} className="c-msg">
                <div className="c-msg__src">{e.src}</div>
                <blockquote className="c-bubble c-bubble--he" lang="he" dir="rtl">"{t.quote}"</blockquote>
                <p className="c-tr"><span>{EN_TESTI.translated}</span>"{e.en}"</p>
                <figcaption className="c-who">
                  <span className="c-who__tile"><img src={t.logo} alt={`${e.role} logo`} loading="lazy" /></span>
                  <div>
                    <div className="c-who__nm">{e.who}</div>
                    <div className="c-who__rl">{e.role}</div>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ─── Guarantee (5.7) ────────────────────────────────────────────────── */

function EnGuarantee({ onForm }) {
  return (
    <section className="c-sec c-dark c-gsec" aria-labelledby="en-g-h">
      <div className="c-wrap">
        <div className="c-ggrid">
          <div className="c-gtext">
            <span className="c-tag">My promise to you</span>
            <h2 id="en-g-h" className="c-h2">
              If the first month of management brings no inquiries
              <span className="c-block c-g">I manage another month for free</span>
            </h2>
            <p>This isn't a "free first month", you pay for setup and management as usual, but if the first month didn't bring inquiries, the second month is on me</p>
            <p>And if there are still no inquiries after two months, I tell you so to your face and we stop, without burning more of your money</p>
            <p className="c-gtext__fine">The promise covers management, the plan is work that's delivered to you and has no refund</p>
            <button type="button" className="c-btn" onClick={onForm}>Book an intro call</button>
          </div>
          <div className="c-gface">
            <div className="c-gface__frame" aria-hidden="true" />
            <div className="c-gface__crop"><img src={profileSrc} alt="Shmuel Munitz" loading="lazy" /></div>
            <div className="c-gface__nm">Shmuel Munitz<span>Shift Up</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Fit (5.8) ──────────────────────────────────────────────────────── */

const EN_FIT = {
  title: "I don't work with everyone, *and that's on purpose*",
  yesTitle: "It's a fit if",
  noTitle: "It's not for you if",
  yes: [
    "You have a business that works and clients who are happy with you, and you're missing a steady flow of inquiries",
    'You want to understand why something works, not just have someone run ads',
    "You're ready to invest in advertising and measure it by what one client is worth to you",
    'You want someone who owns the marketing and reports to you, without you chasing them',
  ],
  no: [
    "You're just starting and it's not clear yet what you sell and to whom",
    'You want someone to run an ad tomorrow morning',
    "You're looking for the cheapest price on the market",
    'You expect results in the first week',
  ],
};

function EnFit() {
  const col = (title, items, yes) => (
    <div className={`c-fit__col${yes ? ' is-yes' : ''}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((it) => <li key={it}><span aria-hidden="true">{yes ? '✓' : '✕'}</span><span>{it}</span></li>)}
      </ul>
    </div>
  );
  return (
    <section className="c-sec c-light c-light--alt" aria-labelledby="en-fit-h">
      <div className="c-wrap">
        <h2 id="en-fit-h" className="c-h2"><Tied text={EN_FIT.title} /></h2>
        <div className="c-fit">
          {col(EN_FIT.yesTitle, EN_FIT.yes, true)}
          {col(EN_FIT.noTitle, EN_FIT.no, false)}
        </div>
      </div>
    </section>
  );
}

/* ─── Comparison (5.9) ───────────────────────────────────────────────── */

const EN_CMP = {
  label: 'Why me',
  title: "What's the difference between a strategist",
  accent: 'and a campaign manager?',
  sub: "Both can launch a campaign, the difference is what you're holding before it goes live",
  me: 'With me',
  them: 'A campaign manager who starts with the ads',
  rows: [
    ['Where we start', 'A deep-dive session and research on your customers', '"Let\'s launch a campaign and see"'],
    ['What you hold before a shekel goes into ads', 'A written plan: audience, message, ads and the numbers', 'A price quote'],
    ['Where the message comes from', 'What your customers say', 'What worked for a previous client'],
    ['If the first month brought no inquiries', 'Another month of management for free', 'You keep paying'],
    ["What isn't working", 'Said out loud, every week', 'Shows up in the report at the end of the month'],
    ['Running campaigns on Meta and Google', '✓', '✓'],
  ],
};

function EnComparison() {
  const col = (title, idx, me) => (
    <div className={`c-cmp__col${me ? ' is-me' : ''}`}>
      <h3>{title}</h3>
      <dl>
        {EN_CMP.rows.map((r) => <div key={r[0]} className="c-cmp__row"><dt>{r[0]}</dt><dd>{r[idx]}</dd></div>)}
      </dl>
    </div>
  );
  return (
    <section id="en-why" className="c-sec c-light c-light--alt c-cmp" aria-labelledby="en-why-h">
      <div className="c-wrap">
        <div className="c-split">
          <div>
            <div className="c-lbl">{EN_CMP.label}</div>
            <h2 id="en-why-h" className="c-h2">{EN_CMP.title} <span className="c-g c-block">{EN_CMP.accent}</span></h2>
          </div>
          <p className="c-lead">{nd(EN_CMP.sub)}</p>
        </div>
        <div className="c-cmp__grid">
          {col(EN_CMP.me, 1, true)}
          {col(EN_CMP.them, 2, false)}
        </div>
      </div>
    </section>
  );
}

/* ─── Proof: הפורטפוליו נשאר (סעיף 5.14), אחרי העדויות ─────────────── */

const EN_GRID = [
  { file: 'events-yehuda.jpg',      client: 'Yehuda Siman-Tov', field: 'Events' },
  { file: 'realestate-villas.jpg',  client: 'Real Estate',      field: '' },  // אין מקור לשם הלקוח, אז בלי תחום כפול (AD דפים 1, #7ג)
  { file: 'legal-skler.jpg',        client: 'Skler Law',        field: 'Legal' },
  { file: 'retail-kehilot-card.jpg',client: 'Kehilot Card',     field: 'Retail' },
  { file: 'food-shira-events.jpg',  client: 'SHIRA',            field: 'Food' },
  { file: 'health-24fit.png',       client: '24fit',            field: 'Fitness' },
  { file: 'home-emanuel.jpg',       client: 'Emanuel Paint',    field: 'Home Services' },
  { file: 'beauty-hili.jpg',        client: 'Hili Nails',       field: 'Beauty' },
  { file: 'education-imahot.jpg',   client: 'Mothers Workshop',  field: 'Parenting' },
];

function EnLightbox({ item, onClose }) {
  if (!item) return null;
  return (
    <div className="c-en-lb" onClick={onClose} role="dialog" aria-modal="true" aria-label={`${item.client} creative`}>
      <button type="button" onClick={onClose} aria-label="Close">×</button>
      <img src={`/portfolio/${item.file}`} alt={`${item.client} creative${item.field ? ` · ${item.field}` : ''}`} onClick={(e) => e.stopPropagation()} />
    </div>
  );
}

function EnProof() {
  const [open, setOpen] = useState(null);
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setOpen(null); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <section id="en-work" className="c-sec c-dark" aria-labelledby="en-work-h">
      <div className="c-wrap">
        <div className="c-split">
          <div>
            <div className="c-lbl">Work</div>
            <h2 id="en-work-h" className="c-h2">Creative I've made, <span className="c-g">every field</span></h2>
          </div>
          <p className="c-lead">{nd('Real ads I put in the air for businesses across different fields. Click any ad to enlarge.')}</p>
        </div>
        <div className="c-en-grid">
          {EN_GRID.map((g) => (
            <button type="button" key={g.file} className="c-en-tile" onClick={() => setOpen(g)} aria-label={`Enlarge ad: ${g.client}`}>
              <span className="c-en-tile__img"><img src={`/portfolio/${g.file}`} alt={`${g.client} creative${g.field ? ` · ${g.field}` : ''}`} loading="lazy" /></span>
              <b>{g.client}</b>
              {g.field && <small>{g.field}</small>}
            </button>
          ))}
        </div>
      </div>
      <EnLightbox item={open} onClose={() => setOpen(null)} />
    </section>
  );
}

/* ─── About (5.10) ───────────────────────────────────────────────────── */

function EnAbout() {
  const paras = [
    <>Nice to meet you, I'm <strong>Shmuel Munitz</strong>, a marketing strategist</>,
    <>Before I touch an ad, I sit with the business owner, read his conversations with customers and research the market, and only then write a plan</>,
    <>I work alone and take on <strong className="c-g">a few clients at a time</strong>, so the person who writes your plan is the person who runs your campaign</>,
    <>With one client I saw in a session recording that the form rejected phone numbers starting with <bdi>+972</bdi>, and <strong className="c-g">I fixed it that same morning</strong>, before another inquiry was lost</>,
    <>I'm an entrepreneur, and I know a business needs <strong className="c-g">a return on its investment</strong>, not likes, so with me every shekel is measured, every week is reported, and what isn't working is said out loud</>,
  ];
  return (
    <section id="en-about" className="c-sec c-dark c-about" aria-labelledby="en-about-h">
      <div className="c-wrap c-about__grid">
        <div className="c-about__head">
          <div className="c-lbl">About</div>
          <h2 id="en-about-h" className="c-h2">Who's behind <span className="c-g">Shift Up</span></h2>
        </div>
        <div className="c-about__body">
          {paras.map((para, i) => <p key={i}>{para}</p>)}
        </div>
      </div>
    </section>
  );
}

/* ─── FAQ (5.11) ─────────────────────────────────────────────────────── */

const enFaqs = [
  { q: 'Why pay for a plan, if I can just launch a campaign?', a: 'Because a campaign without a plan is an experiment on your money, and the plan says up front who we advertise to, what we say and what counts as success, and I build the campaign on it' },
  { q: 'Can I buy just the plan?', a: 'Yes, you can buy just the plan and decide later, and I only build setup and management on a plan' },
  { q: "And if the campaign doesn't bring inquiries?", a: "If the first month of management brings no inquiries, I manage another month for free, and if there's still nothing, I tell you so and we stop, and the promise covers management, not the plan" },
  { q: 'How much does it cost?', a: 'A fixed, closed price for each stage, set in the intro call by the scope of work, and the ad budget is separate, so you know exactly how much before we start' },
  { q: 'How long does it take?', a: 'The plan is ready about a week after the deep-dive session, and the campaign goes live about two weeks after you approve it' },
  { q: 'Who owns the plan?', a: 'You do, and even if you decide not to continue with me, it stays with you' },
  { q: 'What do I need to prepare for the deep-dive session?', a: "Your business numbers, and if you can, screenshots of conversations with customers, because that's where the message comes from" },
  { q: "I've been burned by a previous provider, why would this time be different?", a: 'Because this time we start with a plan and not a campaign, so you see what every decision rests on before a shekel goes in, and in management the risk of the first month is on me' },
  { q: 'What happens after I leave my details?', a: 'I call you back for a half-hour intro call, where we figure out what your business needs, work out what one client is worth to you, and you leave with a fixed price' },
];

function EnFAQ() {
  const links = useSiteLinks();
  const WA_LINK = links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT;

  return (
    <section id="en-faq" className="c-sec c-light" aria-labelledby="en-faq-h">
      <div className="c-wrap c-faq">
        <div className="c-faq__head">
          <div className="c-lbl">FAQ</div>
          <h2 id="en-faq-h" className="c-h2">Frequently Asked Questions</h2>
          <p className="c-faq__note">
            Have another question?{' '}
            <a href={WA_LINK} target="_blank" rel="noopener noreferrer">Send a message</a>{' '}
            and I'll get back to you quickly
          </p>
        </div>
        <div className="c-acc">
          {enFaqs.map((item) => (
            <details key={item.q} className="c-acc__item">
              <summary>{item.q}</summary>
              <div className="c-acc__a"><p>{nd(item.a)}</p></div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Lead Form ──────────────────────────────────────────────────────── */

const EN_PHONE = '972534673151';

function enBuildWaLink(form) {
  const lines = [
    "Hi Shmuel, I'd love to hear about your services.",
    form.name && `Name: ${form.name}`,
    form.business && `Business field: ${form.business}`,
    form.message && `What I'm after: ${form.message}`,
  ].filter(Boolean);
  return `https://wa.me/${EN_PHONE}?text=${encodeURIComponent(lines.join('\n'))}`;
}

function enFireLead() {
  if (typeof window.fbq === 'function') window.fbq('track', 'Lead', { content_name: 'Lead Form (EN)' });
  if (typeof window.gtag === 'function') window.gtag('event', 'generate_lead', { method: 'form_en' });
}

function EnLeadForm() {
  const links = useSiteLinks();
  const waSecondary = (links.whatsapp_url && links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT)
    || `https://wa.me/${EN_PHONE}?text=${WA_TEXT}`;

  const [form, setForm] = useState({ name: '', phone: '', business: '', message: '' });
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [touched, setTouched] = useState(false);

  const valid = form.name.trim().length > 1 && /\d{7,}/.test(form.phone.replace(/\D/g, ''));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched(true);
    if (!valid || status === 'sending') return;
    setStatus('sending');

    // best-effort save; lead is also captured via WhatsApp regardless of DB result
    try {
      const { error } = await supabase.from('leads').insert({
        name: form.name.trim(),
        phone: form.phone.trim(),
        business: form.business.trim() || null,
        message: form.message.trim() || null,
        source: 'landing_form_en',
      });
      if (error) throw error;
      enFireLead();
      setStatus('done');
    } catch (err) {
      // DB save failed (schema/RLS/offline) — don't lose the lead: push to WhatsApp prefilled
      console.warn('[EnLeadForm] supabase insert failed, falling back to WhatsApp:', err?.message);
      enFireLead();
      setStatus('error');
    }
  };

  return (
    <section id="en-contact" className="c-sec c-dark c-lf" aria-labelledby="en-lf-h">
      <div className="c-wrap">
        <div className="c-lf__head">
          <span className="c-lf__pill">I take a few clients at a time</span>
          <h2 id="en-lf-h" className="c-h2 c-lf__h">Get back to running your business <span className="c-g c-block">Leave the marketing to me</span></h2>
          <p className="c-lead">{nd("Leave your details and I'll call you back for a half-hour intro call, where we'll figure out what your business needs, and you'll leave with a fixed price")}</p>
          <p className="c-lf__note">{nd('A fixed price for each stage in the intro call · If the first month of management brings no inquiries, another month of management is free')}</p>
        </div>

        <div className="c-lf__grid">
          <div className="c-lf__panel">
            {status === 'done' ? (
              <div className="c-lf__state">
                <h3>{nd("Got it, thank you, I'll call you back for a half-hour intro call")}</h3>
                <p>{nd("Don't want to wait? Message me on WhatsApp now")}</p>
                <a href={enBuildWaLink(form)} target="_blank" rel="noopener noreferrer" className="c-wa-btn">{WA_ICON}Open a WhatsApp chat</a>
              </div>
            ) : status === 'error' ? (
              <div className="c-lf__state">
                <h3>Almost there</h3>
                <p>{nd('The fastest way to continue is WhatsApp, your details are already filled in.')}</p>
                <a href={enBuildWaLink(form)} target="_blank" rel="noopener noreferrer" className="c-wa-btn">{WA_ICON}Continue on WhatsApp</a>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="c-field">
                  <label htmlFor="en-lf-name">Full name *</label>
                  <input id="en-lf-name" type="text" value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className={touched && form.name.trim().length <= 1 ? 'is-err' : undefined}
                    placeholder="What should I call you?" autoComplete="name" />
                </div>
                <div className="c-field">
                  <label htmlFor="en-lf-phone">Phone *</label>
                  <input id="en-lf-phone" type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="050-0000000" autoComplete="tel" />
                </div>
                <div className="c-field">
                  <label htmlFor="en-lf-business">Business field</label>
                  <input id="en-lf-business" type="text" value={form.business}
                    onChange={(e) => setForm({ ...form, business: e.target.value })}
                    placeholder="e.g. restaurant, real estate, clinic…" />
                </div>
                <div className="c-field">
                  <label htmlFor="en-lf-message">What's most urgent? (optional)</label>
                  <textarea id="en-lf-message" rows={3} value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder="e.g. it's not clear to me what brings me clients" />
                </div>

                {touched && !valid && (
                  <p className="c-err" style={{ marginBottom: 12 }}>{nd('Please add a name and a valid phone so I can get back to you.')}</p>
                )}

                <button type="submit" className="c-btn c-btn--full" disabled={status === 'sending'}>
                  {status === 'sending' ? 'Sending…' : 'Book my intro call'}
                </button>
                <p className="c-form__fine">{nd('Your details stay with me, no spam and no sharing with anyone')}</p>
              </form>
            )}
          </div>

          <div className="c-lf__side">
            <div className="c-lf__wa">
              <h3>Prefer to talk now?</h3>
              <p>{nd("Message me on WhatsApp and I'll get back to you fast.")}</p>
              <a href={waSecondary} target="_blank" rel="noopener noreferrer" className="c-wa-btn">{WA_ICON}Talk to me on WhatsApp</a>
            </div>
            <p className="c-lf__soft">
              {nd("Not the right time? That's fine, you can join my marketing community on WhatsApp, right below")}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── WhatsApp Community ─────────────────────────────────────────────── */

const enPerks = [
  { title: 'Strategy', desc: 'Why customers buy, and how to make them choose you.' },
  { title: 'AI Tools', desc: 'Prompts and methods to save time and money.' },
  { title: 'Deep Dives', desc: 'Breaking down marketing moves, adapted for business owners' },
];

function EnWhatsAppGroup() {
  const { whatsapp_group: WA_GROUP } = useSiteLinks();

  return (
    <section className="c-sec c-dark c-dark--2 c-wag" aria-labelledby="en-wag-h">
      <div className="c-wrap c-wag__grid">
        <div>
          <div className="c-lbl">WhatsApp Community</div>
          <h2 id="en-wag-h" className="c-h2">The marketing <span className="c-g">back room</span></h2>
          <p className="c-lead">
            {nd('For business owners who want to understand how the game really works, no slogans and no theory, just practical business, sales psychology and smart use of AI')}
          </p>
        </div>
        <div>
          <ul className="c-wag__perks">
            {enPerks.map((p) => (
              <li key={p.title}><strong>{p.title}</strong>: {nd(p.desc)}</li>
            ))}
          </ul>
          <div className="c-wag__row">
            <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--ghost">
              {WA_ICON}
              Join the group, free
            </a>
            <span className="c-wag__dose">Short, sharp, to the point</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */

function onEmailClick(e) {
  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  if (!isTouch) {
    e.preventDefault();
    window.open('https://mail.google.com/mail/?view=cm&to=shmuelmunic@gmail.com', '_blank');
  }
}

const EN_SOCIAL_ICONS = {
  WhatsApp:  WA_ICON,
  Email:     <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>,
  LinkedIn:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>,
  Facebook:  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>,
  Instagram: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>,
};

const enNavLinks = [
  { label: 'The Plan',    id: 'plan'        },
  { label: 'The Process', id: 'en-strategy' },
  { label: 'Why Me',      id: 'en-why'      },
  { label: 'About',       id: 'en-about'    },
  { label: 'FAQ',         id: 'en-faq'      },
  { label: 'Contact',     id: 'en-contact'  },
];

function EnFooter() {
  const links = useSiteLinks();
  const WA_LINK = links.whatsapp_url.split('?')[0] + '?text=' + WA_TEXT;
  const enSocials = [
    { label: 'WhatsApp',  href: WA_LINK,                 target: '_blank' },
    { label: 'Email',     href: `mailto:${links.email}`, emailBtn: true },
    { label: 'LinkedIn',  href: links.linkedin,          target: '_blank' },
    { label: 'Facebook',  href: links.facebook,          target: '_blank' },
    { label: 'Instagram', href: links.instagram,         target: '_blank' },
  ];

  return (
    <footer className="c-foot">
      <div className="c-wrap">
        <div className="c-foot__top">
          <div>
            <img src={logoSrc} alt="Shift Up" className="c-foot__logo" />
            <p className="c-foot__tl">
              A written plan first, and the campaign built on it<br />{nd('A performance guarantee that puts the risk on me.')}
            </p>
          </div>

          <nav aria-label="Quick navigation">
            <div className="c-foot__h">Navigation</div>
            <div className="c-foot__nav">
              {enNavLinks.map(l => (
                <button type="button" key={l.id} onClick={() => goto(l.id)}>{l.label}</button>
              ))}
            </div>
          </nav>

          <div>
            <div className="c-foot__h">Get in Touch</div>
            <a className="c-foot__ln" href={WA_LINK} target="_blank" rel="noopener noreferrer" dir="ltr" style={{ marginBottom: 8 }}>{links.phone}</a>
            <a className="c-foot__ln" href={`mailto:${links.email}`} onClick={onEmailClick}>{links.email}</a>
            <div className="c-foot__socials">
              {enSocials.map(s => (
                <a key={s.label} href={s.href} aria-label={s.label} className="c-social"
                  target={s.target || undefined} rel={s.target ? 'noopener noreferrer' : undefined}
                  onClick={s.emailBtn ? onEmailClick : undefined}
                >{EN_SOCIAL_ICONS[s.label]}</a>
              ))}
            </div>
          </div>
        </div>

        <div className="c-foot__bot">
          <p>{nd(`© ${new Date().getFullYear()} Shift Up · Shmuel Munitz. All rights reserved.`)}</p>
          <a href="/" lang="he" dir="rtl">גרסה עברית →</a>
        </div>
      </div>
    </footer>
  );
}

/* ─── Root ───────────────────────────────────────────────────────────── */

export default function EnglishPage() {
  useEffect(() => {
    const lenis = new Lenis({ duration: 1.15, easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), smoothTouch: false, touchMultiplier: 1.8 });
    let raf = 0;
    const loop = (t) => { lenis.raf(t); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); lenis.destroy(); };
  }, []);

  const scrollToForm = () => goto('en-contact');

  return (
    <div dir="ltr" lang="en" className="c-page c-page--en">
      <EnNavbar />
      <main>
        <EnHero onForm={scrollToForm} />
        <EnTrustStrip />
        <EnPain />
        <PlanSection {...EN_PLAN} />
        <EnProcess />
        <EnTestimonials />
        <EnProof />
        <EnGuarantee onForm={scrollToForm} />
        <EnFit />
        <EnComparison />
        <EnAbout />
        <EnFAQ />
        <EnLeadForm />
        <EnWhatsAppGroup />
      </main>
      <EnFooter />
    </div>
  );
}
