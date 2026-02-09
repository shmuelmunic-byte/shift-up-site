import React, { useState } from 'react';
import { Menu, X, ArrowUpRight, Brain, Lightbulb, Rocket, Target, MessageCircle, ChevronDown } from 'lucide-react';

const App = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // **החלף את הכתובות כאן בקישורים האמיתיים לתמונות שלך**
  // אם התמונות נמצאות באותה תיקייה, פשוט שים את שם הקובץ
  const logoSrc = "1000900906.jpg"; // הלוגו שהעלית
  const profileSrc = "1000900908.jpg"; // התמונה שלך

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  return (
    <div dir="rtl" className="min-h-screen bg-black text-slate-100 font-sans selection:bg-green-500 selection:text-black">
      
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-black/90 backdrop-blur-md border-b border-green-900/30 z-50">
        <div className="container mx-auto px-6 py-3 flex justify-between items-center">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('hero')}>
            {/* Logo Placeholder - replace src with your actual logo file */}
            <div className="h-10 w-auto overflow-hidden rounded">
               <img src={logoSrc} alt="Shift Up" className="h-full object-contain" />
            </div>
            <span className="font-bold text-xl tracking-wider text-white hidden sm:block">Shift Up</span>
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8 space-x-reverse">
            <button onClick={() => scrollToSection('strategy')} className="hover:text-green-400 transition-colors font-medium">הפיצוח האסטרטגי</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-green-400 transition-colors font-medium">מי אני</button>
            <button onClick={() => scrollToSection('contact')} className="px-6 py-2 bg-green-600 hover:bg-green-500 text-black font-bold rounded-full transition-all shadow-[0_0_15px_rgba(34,197,94,0.3)] hover:shadow-[0_0_25px_rgba(34,197,94,0.5)]">
              בוא נפיץ את זה
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden text-green-400" onClick={toggleMenu}>
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMenuOpen && (
          <div className="md:hidden bg-zinc-900 border-b border-green-900 absolute w-full z-50">
            <div className="flex flex-col p-4 space-y-4">
              <button onClick={() => scrollToSection('strategy')} className="text-right text-slate-300 hover:text-green-400">הפיצוח האסטרטגי</button>
              <button onClick={() => scrollToSection('about')} className="text-right text-slate-300 hover:text-green-400">מי אני</button>
              <button onClick={() => scrollToSection('contact')} className="bg-green-600 py-3 rounded text-black font-bold text-center">צור קשר</button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section id="hero" className="pt-32 pb-20 px-6 relative overflow-hidden">
        {/* Green Glow Effects */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-green-600/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px]"></div>

        <div className="container mx-auto grid md:grid-cols-2 gap-12 items-center relative z-10">
          <div className="text-right order-2 md:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 border border-green-500/30 rounded-full bg-green-500/10 text-green-400 text-sm font-bold">
              <span className="animate-pulse w-2 h-2 bg-green-500 rounded-full"></span>
              Smart Strategy. Bold Creativity.
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-extrabold leading-tight mb-6">
              להפוך רעיונות <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-600">
                למנועי צמיחה.
              </span>
            </h1>

            {/* The Motto */}
            <div className="border-r-4 border-green-500 pr-4 mb-8">
              <p className="text-xl md:text-2xl text-slate-300 font-medium italic">
                "רעיונות זה הדלק שלי. <br/>
                <span className="text-white font-bold">אנשים זה היעד."</span>
              </p>
            </div>

            <p className="text-lg text-slate-400 mb-8 max-w-xl leading-relaxed">
              לפני ששופכים תקציב על ממומן, צריך להבין **מה הסיפור**. 
              אני כאן כדי לפצח את האסטרטגיה שלכם, ורק אז לוודא שכולם ישמעו עליה.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button onClick={() => scrollToSection('strategy')} className="px-8 py-4 bg-green-600 hover:bg-green-500 text-black rounded-lg font-bold text-lg transition-all transform hover:translate-y-[-2px] shadow-lg hover:shadow-green-500/25 flex items-center justify-center gap-2">
                מה זה אומר "פיצוח"? <ArrowUpRight size={20} />
              </button>
            </div>
          </div>

          <div className="order-1 md:order-2 flex justify-center md:justify-end relative">
            <div className="relative w-72 h-72 md:w-96 md:h-96">
                {/* Decorative Frame */}
                <div className="absolute inset-0 border-2 border-green-500/30 rounded-2xl rotate-6 transform translate-x-4 translate-y-4"></div>
                <div className="absolute inset-0 bg-zinc-900 rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 rotate-0 hover:rotate-2 transition-all duration-500">
                    <img 
                        src={profileSrc} 
                        alt="Shmuel Munitz" 
                        className="w-full h-full object-cover"
                    />
                     {/* Overlay gradient so text pops if needed */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                </div>
                
                {/* Floating Badge */}
                <div className="absolute -bottom-6 -left-6 bg-zinc-900 p-4 rounded-xl border border-green-500/30 shadow-xl flex items-center gap-3">
                    <div className="bg-green-500/20 p-2 rounded-full text-green-400">
                        <Brain size={24} />
                    </div>
                    <div>
                        <span className="block text-sm text-slate-400">פוקוס עיקרי</span>
                        <span className="block font-bold text-white">אסטרטגיה מנצחת</span>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Core: Strategy Section (NEW) */}
      <section id="strategy" className="py-24 bg-zinc-900 border-y border-zinc-800">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16 max-w-3xl mx-auto">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">זה לא ה-PPC, <span className="text-green-500">זה המסר.</span></h2>
            <p className="text-slate-300 text-lg">
              רוב העסקים רצים "לעשות קמפיין" לפני שהם הבינו מה הם מוכרים ולמי.
              התוצאה? כסף שנשרף. התהליך שלי מתחיל בחדר הניתוח.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="bg-black p-8 rounded-2xl border border-zinc-800 hover:border-green-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Target size={100} />
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 font-bold text-xl mb-6 border border-zinc-700 group-hover:bg-green-500 group-hover:text-black transition-colors">1</div>
                <h3 className="text-2xl font-bold mb-3 text-white">הפיצוח (The Crack)</h3>
                <p className="text-slate-400 leading-relaxed">
                  אנחנו חופרים פנימה. מה ה-DNA של העסק? מי הקהל שבאמת משלם? למה שיבחרו בך ולא במתחרה? אנחנו מזקקים את **הצעת הערך הייחודית** שלך.
                </p>
            </div>

            {/* Step 2 */}
            <div className="bg-black p-8 rounded-2xl border border-zinc-800 hover:border-green-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Lightbulb size={100} />
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 font-bold text-xl mb-6 border border-zinc-700 group-hover:bg-green-500 group-hover:text-black transition-colors">2</div>
                <h3 className="text-2xl font-bold mb-3 text-white">האסטרטגיה (The Shift)</h3>
                <p className="text-slate-400 leading-relaxed">
                  לוקחים את התובנות ובונים תוכנית פעולה. איזה משפך שיווקי נכון לך? איזה תוכן יניע לפעולה? אנחנו בונים מפת דרכים ברורה. **רעיונות זה הדלק.**
                </p>
            </div>

            {/* Step 3 */}
            <div className="bg-black p-8 rounded-2xl border border-zinc-800 hover:border-green-500/50 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Rocket size={100} />
                </div>
                <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-green-400 font-bold text-xl mb-6 border border-zinc-700 group-hover:bg-green-500 group-hover:text-black transition-colors">3</div>
                <h3 className="text-2xl font-bold mb-3 text-white">הביצוע (The Action)</h3>
                <p className="text-slate-400 leading-relaxed">
                  רק עכשיו ניגשים לכלים. דפי נחיתה, קמפיינים, אוטומציות. כשהמסר מדויק, הטכנולוגיה עובדת בשבילנו ולא להיפך.
                </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section - Adjusted */}
      <section id="about" className="py-20 px-6">
        <div className="container mx-auto max-w-4xl">
           <div className="flex flex-col md:flex-row items-start gap-8 bg-zinc-900/50 p-8 md:p-12 rounded-3xl border border-zinc-800">
              <div className="flex-1">
                  <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
                    מי מאחורי Shift Up?
                    <div className="h-1 w-20 bg-green-500 rounded-full hidden md:block"></div>
                  </h2>
                  <div className="space-y-4 text-slate-300 leading-relaxed">
                    <p>
                      נעים מאוד, אני **שמואל מוניץ**.
                    </p>
                    <p>
                      אני לא סוכנות ענקית עם 50 עובדים ומזכירה שלא עונה. אני יזם, בדיוק כמוכם. 
                      בזמן שאני עושה שירות לאומי, אני מקדיש את כל הזמן הפנוי שלי לחקור, ללמוד וליישם את חזית השיווק הדיגיטלי.
                    </p>
                    <p>
                      למה זה יתרון בשבילכם? כי אני **רעב להצלחה**. אני לא עובד על "אוטומט". כל לקוח הוא פרויקט הדגל שלי.
                      השילוב בין הראייה האסטרטגית שלי לשליטה בכלים הטכנולוגיים (AI, אוטומציות) מאפשר לי לתת לכם ערך שמשרדים גדולים פשוט לא יודעים לתת.
                    </p>
                    <div className="pt-4 font-bold text-green-400">
                      אנשים זה היעד. העסקים שלכם הם הדרך לשם.
                    </div>
                  </div>
              </div>
           </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-20 px-6 bg-gradient-to-b from-black to-green-950/20">
        <div className="container mx-auto max-w-3xl text-center">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">מוכנים לעשות Shift Up?</h2>
            <p className="text-xl text-slate-400 mb-10">
              הקפה עליי. הפיצוח עליי. ההחלטה עליכם.
            </p>
            
            <div className="bg-zinc-900 p-8 rounded-3xl border border-zinc-700 shadow-2xl">
              <div className="flex flex-col md:flex-row gap-6 justify-center items-center">
                 <a href="https://wa.me/972500000000" target="_blank" rel="noopener noreferrer" className="w-full md:w-auto flex items-center justify-center gap-3 bg-green-600 hover:bg-green-500 text-black font-bold py-4 px-8 rounded-xl transition-all transform hover:scale-105">
                    <MessageCircle size={24} />
                    שלח לי הודעה בוואטסאפ
                 </a>
                 <div className="text-slate-500 text-sm">
                    או השאירו פרטים ואחזור אליכם
                 </div>
              </div>
              
              {/* Simple Form Placeholder */}
              <div className="mt-8 pt-8 border-t border-zinc-800 grid gap-4 text-right">
                  <input type="text" placeholder="שם מלא" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
                  <input type="tel" placeholder="טלפון" className="w-full bg-black border border-zinc-700 rounded-lg p-3 text-white focus:border-green-500 outline-none" />
                  <button className="w-full bg-zinc-800 hover:bg-zinc-700 text-white py-3 rounded-lg font-medium transition-colors border border-zinc-700 hover:border-zinc-500">
                    דברו איתי, אני זמין
                  </button>
              </div>
            </div>
        </div>
      </section>

      <footer className="bg-black py-8 border-t border-zinc-900 text-center text-zinc-600 text-sm">
        <p>© {new Date().getFullYear()} Shift Up - שמואל מוניץ. אסטרטגיה חכמה. קריאייטיב נועז.</p>
      </footer>
    </div>
  );
};

export default App;