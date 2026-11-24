/* ── מי אני (כיוון C, 25.11.2026; קופי סבב 2: מיצוב_תוכנית_קודם.md 3.10) ──
   "אנשים זה היעד" ירד לפי הקופי (יחזור רק אם שמואל יסביר מה הוא אומר).
   כהה, בלי תמונה (הפנים כבר בהירו ובהבטחה), פס מותג אנכי ירוק-טורקיז-סגול ליד הטקסט.
   הטקסט לא השתנה, רק הוסרו נקודות בסוף שורה. */
export default function About() {
  const paras = [
    <>נעים מאוד, אני <strong>שמואל מוניץ</strong>, אסטרטג שיווק</>,
    <>לפני שאני נוגע במודעה אני יושב עם בעל העסק, קורא את השיחות שלו עם לקוחות וחוקר את השוק, ורק אז כותב תוכנית</>,
    <>אני עובד לבד ולוקח <strong className="c-g">מעט לקוחות במקביל</strong>, כך שמי שכותב לך את התוכנית הוא מי שמנהל לך את הקמפיין</>,
    <>אצל לקוח אחד ראיתי בהקלטת גלישה שהטופס דוחה מספרי טלפון שמתחילים ב-<bdi dir="ltr">+972</bdi>, ו<strong className="c-g">תיקנתי את זה באותו בוקר</strong>, לפני שהלכה עוד פנייה</>,
    <>אני יזם, ואני יודע שעסק צריך <strong>החזר על ההשקעה</strong> ולא לייקים, לכן אצלי כל שקל נמדד, כל שבוע מדווח, וגם מה שלא עובד נאמר בקול</>,
  ];

  return (
    <section id="about" className="c-sec c-dark c-about" aria-labelledby="about-h">
      <div className="c-wrap c-about__grid">
        <div className="c-about__head">
          <div className="c-lbl">מי אני</div>
          <h2 id="about-h" className="c-h2">
            מי מאחורי <span className="c-g" lang="en" dir="ltr">Shift Up</span>
          </h2>
        </div>

        <div className="c-about__body">
          {paras.map((p, i) => <p key={i}>{p}</p>)}
        </div>
      </div>
    </section>
  );
}
