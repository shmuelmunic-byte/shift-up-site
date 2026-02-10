import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowUpRight, Brain, Lightbulb, Rocket, Target, MessageCircle } from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // נתיבי התמונות (כפי שהם בתיקיית public)
  const logoSrc = "1000900906.jpg"; 
  const profileSrc = "1000900908.jpg"; 

  // זיהוי גלילה לשינוי עיצוב התפריט
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-black text-slate-100 selection:bg-green-500 selection:text-black font-heebo">
      
      {/* Font Import */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Heebo:wght@300;400;700;900&display=swap');
        .font-heebo { font-family: 'Heebo', sans-serif; }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-black/95 border-b border-zinc-800 py-2' : 'bg-transparent py-4'}`}>
        <div className="container mx-auto px-6 flex justify-between items-center">
          
          {/* Logo Only - No Text */}
          <div className="cursor-pointer" onClick={() => scrollToSection('hero')}>
            <div className="h-12 w-auto overflow-hidden rounded">
               <img src={logoSrc} alt="Shift Up Logo" className="h-full object-contain" />
            </div>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-10">
            <button onClick={() => scrollToSection('strategy')} className="text-slate-300 hover:text-green-400 transition-colors font-medium">הפיצוח האסטרטגי</button>
            <button onClick={() => scrollToSection('about')} className="text-slate-300 hover:text-green-400 transition-colors font-medium">מי אני</button>
            <button onClick={() => scrollToSection('contact')} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded-md transition-all shadow-[0_0_10px_rgba(34,197,94,0.2)] hover:shadow-[0_0_20px_rgba(34,197,94,0.4)]">
              בוא נדבר תכלס
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-green-500" onClick={toggleMenu}>
            {isMenuOpen ? <X size={32} /> : <Menu size={32} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-950 border-b border-zinc-800 absolute w-full z-50 shadow-2xl">
            <div className="flex flex-col p-6 space-y-6">
              <button onClick={() => scrollToSection('strategy')} className="text-right text-lg text-slate-300 hover:text-green-400 font-medium">הפיצוח האסטרטגי</button>
              <button onClick={() => scrollToSection('about')} className="text-right text-lg text-slate-300 hover:text-green-400 font-medium">מי אני</button>
              <button onClick={() => scrollToSection('contact')} className="bg-green-600 py-3 rounded text-black font-bold text-center text-lg">בוא נדבר תכלס</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-6 relative overflow-hidden flex items-center min-h-[90vh]">
        {/* Abstract Tech Background */}
        <div className="absolute top-0 right-0 w-full h-full opacity-20 pointer-events-none">
            <div className="absolute top-10 left-10 w-64 h-64 bg-green-500/20 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]"></div>
        </div>

        <div className="container mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="text-right order-2 md:order-1">
            {/* English Slogan LTR */}
            <div dir="ltr" className="flex justify-start mb-6">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 border border-green-500/30 rounded bg-green-900/10 text-green-400 text-sm font-bold tracking-wide uppercase">
                <span className="w-2 h-2 bg-green-500 rounded-sm"></span>
                Smart Strategy. Bold Creativity.
                </div>
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] mb-6 tracking-tight">
              להפוך רעיונות <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                לאסטרטגיה.
              </span>
            </h1>

            {/* The Motto */}
            <div className="border-r-4 border-green-500 pr-6 mb-10">
              <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed">
                "רעיונות זה הדלק שלי. <br/>
                <span className="text-white font-bold">אנשים זה היעד."</span>
              </p>
            </div>

            <p className="text-lg text-slate-400 mb-10 max-w-xl leading-relaxed">
              לפני ששופכים תקציב על ממומן, צריך להבין <strong>מה הסיפור</strong>. 
              אני כאן כדי לפצח את האסטרטגיה שלכם, ורק אז לוודא שכולם ישמעו עליה.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollToSection('strategy')} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-black rounded font-bold text-lg transition-all flex items-center justify-center gap-2 hover:translate-x-[-4px]">
                מה זה אומר "פיצוח"? <ArrowUpRight size={20} />
              </button>
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center md:justify-end relative">
            <div className="relative w-full max-w-[400px] aspect-square">
                {/* Tech Frame */}
                <div className="absolute inset-0 border border-zinc-700/50 rounded-sm transform translate-x-4 translate-y-4 z-0"></div>
                <div className="absolute inset-0 bg-zinc-900 rounded-sm overflow-hidden border border-zinc-800 z-10">
                    <img 
                        src={profileSrc} 
                        alt="Shmuel Munitz" 
                        className="w-full h-full object-cover opacity-100" // Opacity fixed
                    />
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-black p-5 rounded border border-green-500/30 shadow-2xl flex items-center gap-4 z-20">
                    <div className="bg-green-500/10 p-3 rounded text-green-400">
                        <Brain size={28} />
                    </div>
                    <div>
                        <span className="block text-sm text-slate-400 uppercase tracking-wider">פוקוס עיקרי</span>
                        <span className="block font-bold text-white text-lg">אסטרטגיה מנצחת</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core: Strategy Section */}
      <section id="strategy" className="py-24 bg-zinc-950 border-y border-zinc-900">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-black mb-6 text-white">זה לא ה-PPC, <span className="text-green-500">זה המסר.</span></h2>
            <p className="text-slate-400 text-lg">
              רוב העסקים רצים "לעשות קמפיין" לפני שהם הבינו מה הם מוכרים ולמי.
              התוצאה? כסף שנשרף. התהליך שלי מתחיל בחדר הניתוח.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-10">
            {/* Step 1 */}
            <div className="bg-black p-8 rounded border border-zinc-800 hover:border-green-500/50 transition-all group relative">
                <div className="text-6xl font-black text-zinc-800 mb-6 group-hover:text-green-900/40 transition-colors absolute top-4 left-6">01</div>
                <div className="relative z-10 mt-8">
                    <div className="w-14 h-14 bg-zinc-900 rounded flex items-center justify-center text-green-400 mb-6 border border-zinc-700">
                        <Target size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">הפיצוח (The Crack)</h3>
                    <p className="text-slate-400 leading-relaxed">
                      אנחנו חופרים פנימה. מה ה-DNA של העסק? מי הקהל שבאמת משלם? למה שיבחרו בך ולא במתחרה? אנחנו מזקקים את <strong>הצעת הערך הייחודית</strong> שלך.
                    </p>
                </div>
            </div>

            {/* Step 2 */}
            <div className="bg-black p-8 rounded border border-zinc-800 hover:border-green-500/50 transition-all group relative">
                 <div className="text-6xl font-black text-zinc-800 mb-6 group-hover:text-green-900/40 transition-colors absolute top-4 left-6">02</div>
                 <div className="relative z-10 mt-8">
                    <div className="w-14 h-14 bg-zinc-900 rounded flex items-center justify-center text-green-400 mb-6 border border-zinc-700">
                        <Lightbulb size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">האסטרטגיה (The Shift)</h3>
                    <p className="text-slate-400 leading-relaxed">
                      לוקחים את התובנות ובונים תוכנית פעולה. איזה משפך שיווקי נכון לך? איזה תוכן יניע לפעולה? אנחנו בונים מפת דרכים ברורה. <strong>רעיונות זה הדלק.</strong>
                    </p>
                 </div>
            </div>

            {/* Step 3 */}
            <div className="bg-black p-8 rounded border border-zinc-800 hover:border-green-500/50 transition-all group relative">
                 <div className="text-6xl font-black text-zinc-800 mb-6 group-hover:text-green-900/40 transition-colors absolute top-4 left-6">03</div>
                 <div className="relative z-10 mt-8">
                    <div className="w-14 h-14 bg-zinc-900 rounded flex items-center justify-center text-green-400 mb-6 border border-zinc-700">
                        <Rocket size={28} />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 text-white">הביצוע (The Action)</h3>
                    <p className="text-slate-400 leading-relaxed">
                      רק עכשיו ניגשים לכלים. דפי נחיתה, קמפיינים, הפצה. כשהמסר מדויק, הטכנולוגיה עובדת בשבילנו ולא להיפך.
                    </p>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Adjusted */}
      <section id="about" className="py-24 px-6">
        <div className="container mx-auto max-w-4xl">
           <div className="flex flex-col md:flex-row items-start gap-12 bg-zinc-900/30 p-8 md:p-12 rounded border border-zinc-800/50">
              <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    מי מאחורי Shift Up?
                    <div className="h-1 w-12 bg-green-500 rounded hidden md:block"></div>
                  </h2>
                  <div className="space-y-6 text-slate-300 leading-relaxed text-lg">
                    <p>
                      נעים מאוד, אני <strong>שמואל מוניץ</strong>.
                    </p>
                    <p>
                      אני לא סוכנות ענקית עם 50 עובדים ומזכירה שלא עונה. אני יזם, בדיוק כמוכם. 
                      בזמן שאני עושה שירות לאומי, אני מקדיש את כל הזמן הפנוי שלי לחקור, ללמוד וליישם שיווק דיגיטלי.
                    </p>
                    <p>
                      למה זה יתרון בשבילכם? כי אני <strong>רעב להצלחה</strong>. אני לא עובד על "אוטומט". כל לקוח הוא פרויקט הדגל שלי.
                      אני משלב ראייה אסטרטגית רחבה עם הבנה מעמיקה ב-PPC ופסיכולוגיה צרכנית.
                    </p>
                    <div className="pt-4 font-bold text-green-400 text-xl">
                      אנשים זה היעד. העסקים שלכם הם הדרך לשם.
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 px-6 bg-gradient-to-b from-black to-green-950/10">
        <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-black mb-6">מוכנים לעשות Shift Up?</h2>
            <p className="text-xl text-slate-400 mb-12">
              הקפה עליי. הפיצוח עליי. ההחלטה עליכם.
            </p>
            
            <div className="bg-zinc-950 p-8 md:p-12 rounded border border-zinc-800 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-600"></div>
              
              <div className="flex flex-col gap-6 justify-center items-center">
                 <a href="https://wa.me/972500000000" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-black font-bold py-4 px-12 rounded text-lg transition-all transform hover:scale-105">
                    <MessageCircle size={24} />
                    שלח לי הודעה בוואטסאפ
                 </a>
                 <div className="text-slate-500 text-sm mt-2">
                    זמין לשיחה קצרה שתעשה לכם סדר בראש.
                 </div>
              </div>
              
            </div>
        </div>
      </section>

      <footer className="bg-black py-8 border-t border-zinc-900 text-center text-zinc-600 text-sm font-medium">
        <p>© {new Date().getFullYear()} Shift Up - שמואל מוניץ. אסטרטגיה חכמה. קריאייטיב נועז.</p>
      </footer>
    </div>
  );
};

export default App;