import React, { useState, useEffect } from 'react';
import {
  Menu, X, Brain, Lightbulb, Rocket, Target,
  MessageCircle, Zap, TrendingUp, Search, Users,
  ChevronDown, Mail, Linkedin
} from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [openFaq, setOpenFaq] = useState(0);

  const logoSrc = '/1000900906.jpg';
  const profileSrc = '/1000900908.jpg';
  const whatsappLink =
    'https://wa.me/972534673151?text=' +
    encodeURIComponent('היי שמואל, אשמח לשמוע פרטים על השירות');

  // Meta Pixel — track WhatsApp click as Lead conversion
  const trackLead = () => {
    if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
      window.fbq('track', 'Lead', { content_name: 'WhatsApp Click' });
    }
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setIsMenuOpen(false);
  };

  const marqueeWords = [
    'אסטרטגיה שיווקית', '↑', 'Meta Ads', '↑', 'Google Ads', '↑',
    'דפי נחיתה', '↑', 'לידים איכותיים', '↑', 'AI שיווקי', '↑',
    'מסר מדויק', '↑', 'ROI', '↑',
  ];

  const steps = [
    {
      n: '01',
      title: 'הפיצוח',
      en: 'The Crack',
      icon: Search,
      desc:
        'אנחנו חופרים פנימה. מי הקהל שבאמת משלם, מה ה-DNA של העסק, ולמה שיבחרו בך ולא במתחרה. מזקקים את הצעת הערך הייחודית שלך, בלי בלבולי מוח.',
      bullets: ['ניתוח מתחרים', 'מיפוי קהל יעד', 'הצעת ערך חדה'],
    },
    {
      n: '02',
      title: 'האסטרטגיה',
      en: 'The Shift',
      icon: Lightbulb,
      desc:
        'לוקחים את התובנות ובונים תוכנית פעולה ברורה. איזה משפך שיווקי נכון לך, איזה תוכן יניע לפעולה, ובאיזה ערוצים נשים את הכסף. מפת דרכים, לא הימור.',
      bullets: ['בניית משפך שיווקי', 'תוכנית תוכן', 'מסרים לכל ערוץ'],
    },
    {
      n: '03',
      title: 'הביצוע',
      en: 'The Action',
      icon: Rocket,
      desc:
        'רק עכשיו ניגשים לכלים. אני מקים ומנהל לך את הקמפיינים הממומנים ב-Meta וב-Google, בונה דפי נחיתה ממירים, ומקים אוטומציות AI שחוסכות זמן.',
      bullets: ['קמפיינים ב-Meta + Google', 'דפי נחיתה ממירים', 'אוטומציות AI'],
    },
  ];

  const stats = [
    { num: '100%', label: 'מותאם אישית', icon: Target },
    { num: '24h', label: 'זמן תגובה', icon: Zap },
    { num: 'AI', label: 'כלים מתקדמים', icon: Brain },
    { num: 'ROI', label: 'הפוקוס היחיד', icon: TrendingUp },
  ];

  const reasons = [
    {
      icon: TrendingUp,
      title: 'גישה יזמית',
      desc: 'אני חושב כמו בעלים של עסק, לא כמו ספק שירות. אני שואל את השאלות הקשות לפני שאני שולח הצעת מחיר.',
    },
    {
      icon: Brain,
      title: 'AI ראשון',
      desc: 'אני חוקר את כלי ה-AI החדשים יום-יום. מה שלוקח לאחרים שבוע, אני מבצע בכמה שעות, ובאיכות גבוהה יותר.',
    },
    {
      icon: Users,
      title: 'מספר לקוחות מצומצם',
      desc: 'אני לא משרד פרסום שמטפל ב-50 לקוחות במקביל. כל לקוח מקבל ראש שלם, לא חצי תשומת לב.',
    },
    {
      icon: Target,
      title: 'מסר לפני תקציב',
      desc: 'לא שורפים כסף בקמפיינים לפני שהבנו מה אנחנו מוכרים ולמי. הכסף שלך עובד רק כשהמסר מדויק.',
    },
  ];

  const faqs = [
    {
      q: 'כמה זמן לוקח לראות תוצאות?',
      a: 'הפיצוח עצמו לוקח כשבועיים. לראות לידים איכותיים זורמים, בין 30 ל-60 יום, תלוי בענף. אני בונה איתך לטווח ארוך, לא הבטחות סרק של "תוצאות בעוד שבוע".',
    },
    {
      q: 'אני עסק קטן, זה לא יקר לי מדי?',
      a: 'בדיוק לעסקים קטנים זה הכי קריטי. אתה לא יכול להרשות לעצמך לבזבז תקציב על מסרים לא נכונים. אני מתאים את ההיקף לכיס שלך, ופותחים בשיחה ללא עלות.',
    },
    {
      q: 'במה אתה שונה משאר משווקי הדיגיטל?',
      a: 'רובם מתחילים ב"בוא נריץ קמפיין". אני מתחיל ב"בוא נבין מה אנחנו מוכרים ולמי". בנוסף, אני משלב כלי AI שחוסכים לך זמן וכסף, ולוקח מספר מצומצם של לקוחות.',
    },
    {
      q: 'אתה מתאים לכל סוג של עסק?',
      a: 'אני עובד עם עסקים קטנים ובינוניים, גם B2B וגם B2C. עסקי שירות, מסחר, יזמים, חברות מבוססות. אם אני לא מרגיש שאני יכול להביא ערך אמיתי, אגיד לך את זה כבר בשיחת ההיכרות, בלי בלבולי מוח.',
    },
    {
      q: 'מה כולל הפיצוח האסטרטגי?',
      a: 'מסמך אסטרטגי מלא: ניתוח מתחרים, מיפוי קהל יעד, הצעת ערך מדויקת, מסרים מרכזיים, ערוצי שיווק מומלצים, ומפת דרכים יישומית של 90 יום.',
    },
    {
      q: 'אתה גם מבצע או רק מייעץ?',
      a: 'שניהם. אחרי שאנחנו סוגרים אסטרטגיה, אני בונה ומפעיל לך את הקמפיינים הממומנים ב-Meta וב-Google, בונה דפי נחיתה ומטמיע אוטומציות AI. אתה מקבל אסטרטג ומבצע באותו אדם.',
    },
  ];

  // section-eyebrow: a short label with a leading line, replacing the AI-style pill badge
  const SectionEyebrow = ({ children }) => (
    <div className="flex items-center gap-3 mb-5">
      <span className="h-px w-10 bg-green-400/60" />
      <span className="text-green-400 text-xs font-bold tracking-[0.2em] uppercase">{children}</span>
    </div>
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#07080a] text-zinc-100 font-sans relative overflow-x-hidden"
      style={{ fontFamily: "'Heebo', system-ui, sans-serif" }}
    >
      {/* Background grid */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-[0.04]"
           style={{
             backgroundImage:
               'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
             backgroundSize: '64px 64px',
           }}
      />

      {/* Navigation */}
      <nav
        className={`fixed top-0 w-full z-50 transition-all duration-500 ${
          scrolled
            ? 'bg-[#07080a]/85 backdrop-blur-xl py-2'
            : 'bg-transparent py-4'
        }`}
      >
        <div className="container mx-auto px-6 flex justify-between items-center">
          <button
            onClick={() => scrollToSection('hero')}
            className="cursor-pointer flex items-center"
            aria-label="Shift Up"
          >
            <img
              src={logoSrc}
              alt="Shift Up"
              className="h-10 md:h-12 w-auto object-contain"
            />
          </button>

          <div className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection('strategy')} className="text-sm text-zinc-300 hover:text-green-400 transition font-medium">
              התהליך
            </button>
            <button onClick={() => scrollToSection('why')} className="text-sm text-zinc-300 hover:text-green-400 transition font-medium">
              למה אני
            </button>
            <button onClick={() => scrollToSection('about')} className="text-sm text-zinc-300 hover:text-green-400 transition font-medium">
              מי אני
            </button>
            <button onClick={() => scrollToSection('faq')} className="text-sm text-zinc-300 hover:text-green-400 transition font-medium">
              שאלות
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="px-5 py-2.5 bg-green-500 hover:bg-green-400 text-black font-bold rounded-full transition-all text-sm shadow-[0_0_30px_rgba(34,197,94,0.3)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)]"
            >
              בוא נדבר תכלס
            </button>
          </div>

          <button className="md:hidden text-white" onClick={toggleMenu} aria-label="תפריט">
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden bg-[#0c0e12]/95 backdrop-blur-xl absolute w-full">
            <div className="flex flex-col p-6 gap-5">
              <button onClick={() => scrollToSection('strategy')} className="text-right text-base text-zinc-300 hover:text-green-400 font-medium">התהליך</button>
              <button onClick={() => scrollToSection('why')} className="text-right text-base text-zinc-300 hover:text-green-400 font-medium">למה אני</button>
              <button onClick={() => scrollToSection('about')} className="text-right text-base text-zinc-300 hover:text-green-400 font-medium">מי אני</button>
              <button onClick={() => scrollToSection('faq')} className="text-right text-base text-zinc-300 hover:text-green-400 font-medium">שאלות</button>
              <button onClick={() => scrollToSection('contact')} className="bg-green-500 py-3 rounded-full text-black font-bold text-center">
                בוא נדבר תכלס
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* HERO */}
      <section
        id="hero"
        className="relative pt-32 md:pt-40 pb-24 px-6 mesh-bg overflow-hidden"
      >
        <div className="absolute top-20 right-10 w-72 h-72 bg-green-500/30 rounded-full blur-[120px] animate-blob" />
        <div className="absolute top-40 left-20 w-96 h-96 bg-green-400/15 rounded-full blur-[140px] animate-blob animation-delay-2000" />
        <div className="absolute bottom-10 right-1/3 w-80 h-80 bg-violet-600/15 rounded-full blur-[120px] animate-blob animation-delay-4000" />
        <div className="noise" />

        <div className="container mx-auto relative z-10">
          <div className="grid md:grid-cols-12 gap-12 items-center">
            <div className="md:col-span-7 text-right">
              {/* Slogan — typographic, no pill */}
              <div dir="ltr" className="flex items-center justify-end gap-3 mb-7 fade-up">
                <span className="text-green-400 text-sm md:text-base font-bold tracking-[0.18em] uppercase">
                  Smart Strategy. Bold Creativity.
                </span>
                <span className="h-px w-12 bg-green-400/50" />
              </div>

              <h1 className="text-[2.6rem] sm:text-6xl lg:text-7xl xl:text-[5rem] font-black leading-[0.98] mb-7 tracking-tight fade-up" style={{ fontFamily: "'Heebo', sans-serif", animationDelay: '0.1s' }}>
                להפוך{' '}
                <span className="text-gradient-brand">רעיונות</span>
                <br />
                <span className="text-white">ל</span>
                <span className="text-gradient-brand">אסטרטגיה שיווקית</span>
                <span className="text-green-400">.</span>
              </h1>

              <p className="text-lg md:text-xl text-zinc-300 mb-4 max-w-xl leading-relaxed fade-up font-medium" style={{ animationDelay: '0.2s' }}>
                לפני ששורפים תקציב על ממומן, צריך לדעת{' '}
                <span className="text-white">מה אנחנו מוכרים, ולמי</span>.
              </p>
              <p className="text-base md:text-lg text-zinc-400 mb-10 max-w-xl leading-relaxed fade-up" style={{ animationDelay: '0.25s' }}>
                אני בונה איתך את האסטרטגיה השיווקית, ואז מקים ומפעיל לך את הקמפיינים הממומנים ב-Meta וב-Google. ייעוץ וביצוע, באותו אדם.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 fade-up" style={{ animationDelay: '0.3s' }}>
                <a
                  href={whatsappLink}
                  onClick={trackLead}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-green-500 hover:bg-green-400 text-black rounded-full font-bold text-base transition-all shadow-[0_0_30px_rgba(34,197,94,0.4)] hover:shadow-[0_0_50px_rgba(34,197,94,0.7)] hover:-translate-y-0.5"
                >
                  <MessageCircle size={20} />
                  בוא נדבר תכלס
                </a>
                <button
                  onClick={() => scrollToSection('strategy')}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/15 rounded-full font-semibold text-base text-white transition-all backdrop-blur-sm"
                >
                  איך התהליך עובד?
                </button>
              </div>

              <div className="mt-12 flex items-start gap-4 fade-up" style={{ animationDelay: '0.4s' }}>
                <div className="w-1 h-16 bg-gradient-to-b from-green-400 to-violet-600 rounded-full" />
                <div>
                  <p className="text-base md:text-lg text-zinc-300 font-medium leading-relaxed">
                    "רעיונות זה הדלק שלי.
                    <br />
                    <span className="text-white font-bold">אנשים זה היעד."</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Profile image */}
            <div className="md:col-span-5 flex justify-center md:justify-end fade-up" style={{ animationDelay: '0.2s' }}>
              <div className="relative w-full max-w-[340px] aspect-[4/5]">
                <div className="absolute -inset-3 bg-gradient-to-br from-green-400/40 to-violet-600/30 rounded-3xl blur-2xl opacity-60" />
                <div className="relative w-full h-full bg-zinc-900 rounded-2xl overflow-hidden">
                  <img src={profileSrc} alt="שמואל מוניץ" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#07080a]/40 via-transparent to-transparent" />
                </div>
                <div className="absolute -bottom-6 -right-4 md:-right-6 bg-[#0c0e12] py-3 px-4 rounded-2xl shadow-2xl flex items-center gap-3 z-20 backdrop-blur-xl">
                  <div className="bg-green-500/15 p-2 rounded-xl text-green-400">
                    <Brain size={20} />
                  </div>
                  <div>
                    <span className="block text-[10px] text-zinc-500 uppercase tracking-widest font-bold">פוקוס</span>
                    <span className="block font-bold text-white text-sm">אסטרטגיה מנצחת</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section className="bg-[#0c0e12] py-6 overflow-hidden">
        <div className="flex animate-marquee-rtl whitespace-nowrap" style={{ width: 'max-content' }}>
          {[...marqueeWords, ...marqueeWords, ...marqueeWords].map((w, i) => (
            <span
              key={i}
              className={`mx-6 text-2xl md:text-3xl font-black tracking-tight ${
                w === '↑' ? 'text-green-400' : 'text-white/55'
              }`}
              style={{ fontFamily: "'Heebo', sans-serif" }}
            >
              {w}
            </span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="py-16 px-6">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((s, i) => {
            const Icon = s.icon;
            return (
              <div key={i} className="text-right">
                <div className="text-green-400 mb-3 flex justify-end">
                  <Icon size={28} strokeWidth={1.5} />
                </div>
                <div className="text-4xl md:text-5xl font-black tracking-tight mb-1">
                  {s.num}
                </div>
                <div className="text-zinc-500 text-sm font-medium">{s.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* STRATEGY / PROCESS */}
      <section id="strategy" className="py-24 md:py-32 px-6 relative overflow-hidden bg-[#0a0c10]">
        <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-green-500/8 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px]" />

        <div className="container mx-auto relative z-10">
          <div className="text-right max-w-3xl mb-16">
            <SectionEyebrow>The Process</SectionEyebrow>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              זה לא ה-PPC,
              <br />
              <span className="text-gradient-brand">זה המסר.</span>
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              רוב העסקים רצים "לעשות קמפיין" לפני שהבינו מה הם מוכרים ולמי. התוצאה? כסף שנשרף.
              התהליך שלי מתחיל בחדר הניתוח, לא במערכת המודעות.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="group relative rounded-2xl bg-[#14171c] hover:bg-[#181b21] p-7 md:p-8 overflow-hidden card-tilt transition-colors"
                >
                  <div className="absolute -top-20 -left-20 w-48 h-48 bg-green-500/10 blur-3xl group-hover:bg-green-500/20 transition" />

                  <div className="flex items-start justify-between mb-7 relative">
                    <div className="w-14 h-14 rounded-xl bg-green-500 flex items-center justify-center text-black">
                      <Icon size={26} strokeWidth={2.2} />
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold">Step</div>
                      <div className="text-4xl font-black text-white/10 leading-none">{step.n}</div>
                    </div>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black mb-1 tracking-tight">
                    {step.title}
                  </h3>
                  <div className="text-xs text-zinc-500 mb-5 tracking-widest uppercase font-bold" dir="ltr">
                    {step.en}
                  </div>

                  <p className="text-zinc-400 leading-relaxed mb-6 text-sm md:text-base">
                    {step.desc}
                  </p>

                  <div className="space-y-2 pt-5">
                    {step.bullets.map((b, j) => (
                      <div key={j} className="flex items-center gap-2 text-sm text-zinc-300">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                        {b}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* WHY ME */}
      <section id="why" className="py-24 md:py-32 px-6 bg-[#07080a] relative overflow-hidden">
        <div className="container mx-auto relative z-10">
          <div className="text-right max-w-3xl mb-16">
            <SectionEyebrow>Why Me</SectionEyebrow>
            <h2 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
              למה לעבוד דווקא{' '}
              <span className="text-gradient-brand">איתי?</span>
            </h2>
            <p className="text-lg text-zinc-400 leading-relaxed">
              יש המון משווקי דיגיטל. יש לי 4 סיבות אמיתיות למה אני אהיה ההחלטה החכמה שלך.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            {reasons.map((r, i) => {
              const Icon = r.icon;
              return (
                <div
                  key={i}
                  className="bg-[#14171c] hover:bg-[#181b21] rounded-2xl p-7 md:p-8 transition-colors card-tilt"
                >
                  <div className="flex items-start gap-5">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-green-500/15 text-green-400 flex items-center justify-center">
                      <Icon size={22} strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2 tracking-tight">{r.title}</h3>
                      <p className="text-zinc-400 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT */}
      <section id="about" className="py-24 md:py-32 px-6 relative overflow-hidden bg-[#0a0c10]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-600/10 rounded-full blur-[140px]" />
        <div className="container mx-auto max-w-5xl relative z-10">
          <div className="grid md:grid-cols-5 gap-12 items-center">
            <div className="md:col-span-2 order-2 md:order-1">
              <div className="relative max-w-[300px] mx-auto">
                <div className="absolute -inset-2 bg-gradient-to-br from-green-400/30 to-violet-600/20 rounded-3xl blur-xl" />
                <div className="relative aspect-[4/5] rounded-2xl overflow-hidden">
                  <img src={profileSrc} alt="שמואל מוניץ" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-3 right-4 bg-[#14171c] text-white px-3 py-1.5 rounded-full text-xs font-bold tracking-wider flex items-center gap-1.5 backdrop-blur-xl">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                  שמואל מוניץ
                </div>
              </div>
            </div>

            <div className="md:col-span-3 order-1 md:order-2 text-right">
              <SectionEyebrow>About Me</SectionEyebrow>
              <h2 className="text-4xl md:text-5xl font-black mb-8 tracking-tight leading-tight">
                מי מאחורי{' '}
                <span className="text-gradient-brand">Shift Up?</span>
              </h2>
              <div className="space-y-5 text-zinc-300 text-base md:text-lg leading-relaxed">
                <p>
                  נעים מאוד, אני <span className="text-white font-bold">שמואל מוניץ</span>.
                </p>
                <p>
                  אני לא אשקר לכם, אני לא מגיע ממשרד פרסום עם ותק של 20 שנה. וזה בדיוק <span className="text-green-400 font-bold">היתרון</span> שלכם.
                </p>
                <p>
                  בזמן שאחרים נחים על זרי הדפנה, אני חוקר את כלי ה-<span className="text-green-400 font-bold">AI</span> החדשים ביותר ומוצא דרכים חדשניות להביא לידים. אני לא עובד על "אוטומט". כל לקוח הוא פרויקט הדגל שלי.
                </p>
                <p>
                  אני יזם בנשמה. אני מבין שעסק צריך <span className="text-white font-bold">החזר השקעה (ROI)</span> ולא רק "לייקים". אני כאן כדי לבנות איתך מערכת שיווקית שעובדת, ולהפעיל אותה בפועל.
                </p>
                <div className="pt-4 mt-2">
                  <p className="text-xl md:text-2xl font-black text-gradient-brand">
                    אנשים זה היעד.
                  </p>
                  <p className="text-zinc-400 text-base mt-1">
                    העסקים שלכם הם הדרך לשם.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="py-24 md:py-32 px-6 bg-[#07080a]">
        <div className="container mx-auto max-w-3xl">
          <div className="text-right mb-16">
            <SectionEyebrow>FAQ</SectionEyebrow>
            <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tight">
              שאלות שמרבים לשאול
            </h2>
            <p className="text-zinc-400">
              עוד שאלה שלא מופיעה? שלח לי הודעה ואחזור אליך תוך 24 שעות.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className={`rounded-2xl transition-all ${
                  openFaq === i
                    ? 'bg-[#181b21]'
                    : 'bg-[#14171c] hover:bg-[#181b21]'
                }`}
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  className="w-full flex items-center justify-between gap-4 p-5 md:p-6 text-right"
                >
                  <ChevronDown
                    size={22}
                    className={`shrink-0 text-green-400 transition-transform ${
                      openFaq === i ? 'rotate-180' : ''
                    }`}
                  />
                  <span className="font-bold text-base md:text-lg flex-1">{f.q}</span>
                </button>
                {openFaq === i && (
                  <div className="px-5 md:px-6 pb-6 text-zinc-400 leading-relaxed pt-1">
                    {f.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section
        id="contact"
        className="py-24 md:py-32 px-6 relative overflow-hidden bg-[#0a0c10]"
      >
        <div className="absolute inset-0 mesh-bg opacity-80" />
        <div className="absolute top-10 left-10 w-96 h-96 bg-green-500/25 rounded-full blur-[140px] animate-blob" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-violet-600/15 rounded-full blur-[140px] animate-blob animation-delay-2000" />
        <div className="noise" />

        <div className="container mx-auto max-w-3xl text-center relative z-10">
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="h-px w-10 bg-green-400/60" />
            <span className="text-green-400 text-xs font-bold tracking-[0.2em] uppercase">Let's Talk</span>
            <span className="h-px w-10 bg-green-400/60" />
          </div>
          <h2 className="text-4xl md:text-7xl font-black mb-6 tracking-tight leading-[1.05]">
            מוכנים לעשות{' '}
            <span className="text-gradient-brand">Shift Up?</span>
          </h2>
          <p className="text-lg md:text-xl text-zinc-300 mb-12 max-w-xl mx-auto">
            הקפה עליי. הפיצוח עליי. ההחלטה עליכם.
          </p>

          <div className="bg-[#0c0e12]/80 backdrop-blur-xl p-8 md:p-12 rounded-3xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-violet-600" />

            <div className="flex flex-col gap-4 items-center">
              <a
                href={whatsappLink}
                onClick={trackLead}
                target="_blank"
                rel="noopener noreferrer"
                className="group w-full md:w-auto inline-flex items-center justify-center gap-3 bg-green-500 hover:bg-green-400 text-black font-bold py-5 px-12 rounded-full text-lg transition-all shadow-[0_0_40px_rgba(34,197,94,0.4)] hover:shadow-[0_0_60px_rgba(34,197,94,0.7)] hover:-translate-y-0.5"
              >
                <MessageCircle size={24} />
                שלח הודעה בוואטסאפ
              </a>

              <div className="text-zinc-400 text-sm flex items-center gap-2 mt-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
                </span>
                זמין לשיחת היכרות קצרה. חינם, ללא התחייבות.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#07080a] py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <img src={logoSrc} alt="Shift Up" className="h-10 w-auto object-contain" />

            <div className="flex items-center gap-3">
              <a
                href={whatsappLink}
                onClick={trackLead}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-green-400/15 hover:text-green-400 flex items-center justify-center transition-all"
              >
                <MessageCircle size={18} />
              </a>
              <a
                href="mailto:shmuelmunic@gmail.com"
                aria-label="Email"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-green-400/15 hover:text-green-400 flex items-center justify-center transition-all"
              >
                <Mail size={18} />
              </a>
              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-green-400/15 hover:text-green-400 flex items-center justify-center transition-all"
              >
                <Linkedin size={18} />
              </a>
            </div>

            <div className="text-zinc-500 text-sm text-center md:text-right">
              © {new Date().getFullYear()} Shift Up · שמואל מוניץ
              <br className="md:hidden" />
              <span className="hidden md:inline"> · </span>
              <span className="text-zinc-600">אסטרטגיה חכמה. קריאייטיב נועז.</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
