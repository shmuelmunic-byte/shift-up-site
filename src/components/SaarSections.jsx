/* ── סקשנים לפי שיטת סער בל לדף ארוך לקהל קר (24.11.2026), עיצוב כיוון C (25.11.2026) ──
   עדויות אמיתיות (מקור: וואטסאפ/הקלטה, אישור שם התקבל), ריבוע הבטחה באמצע הדף,
   למי מתאים / למי לא, ואני מול רוב השוק (טבלה כנה, שורה אחת שגם לאחרים יש).
   ציטוטים מילה במילה, השמטות מסומנות ב-"...". */
import { nd } from '../content/heroCopy';
import Tied from '../content/Tied';

export const TESTIMONIALS = [
  {
    name: 'דניאל עזרן',
    role: 'D&D פרויקטים, שיפוצים וגמר',
    logo: '/clients/dd.png',
    quote: 'יצא יפה מאוד, זה המודעה שהוספנו בסוף, דווקא אליה אני הכי מתחבר, הקרדיט מגיע לך',
    source: 'מתוך וואטסאפ',
  },
  {
    name: 'רועי קפח',
    role: 'מנהל מכינה קדם צבאית אורות',
    logo: '/clients/orot-mark.png',
    quote: 'לעבוד עם שמואל זה ממש באווירה טובה, הכל בשקיפות... הוא זמין ממש... ואתה רואה שהוא עושה את זה מכל הלב ומכל הנשמה',
    source: 'מתוך הודעה קולית',
  },
];

/* ── עדויות: רקע בהיר, הודעה חדה עם זנב אחד ── */
export function Testimonials() {
  return (
    <section id="testimonials" className="c-sec c-light" aria-labelledby="tst-h">
      <div className="c-wrap">
        <div className="c-split">
          <div>
            <div className="c-lbl">עדויות</div>
            <h2 id="tst-h" className="c-h2">
              לא צריך להאמין לי <span className="c-g c-block">תשמע מהם</span>
            </h2>
          </div>
          <p className="c-lead">מה שלקוחות אמרו לי, מילה במילה</p>
        </div>

        <div className="c-tg">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="c-msg">
              <div className="c-msg__src">{t.source}</div>
              <blockquote className="c-bubble">"{t.quote}"</blockquote>
              <figcaption className="c-who">
                <span className="c-who__tile"><img src={t.logo} alt={`הלוגו של ${t.role}`} loading="lazy" /></span>
                <div>
                  <div className="c-who__nm">{t.name}</div>
                  <div className="c-who__rl">{t.role}</div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── ההבטחה שלי אליך: הבטחה מפנים אמיתיות ── */
export function Guarantee({ onContact }) {
  return (
    <section id="guarantee" className="c-sec c-dark c-gsec" aria-labelledby="g-h">
      <div className="c-wrap">
        <div className="c-ggrid">
          <div className="c-gtext">
            <span className="c-tag">ההבטחה שלי אליך</span>
            <h2 id="g-h" className="c-h2">
              אם בחודש הניהול הראשון אין פניות
              <span className="c-block">אני מנהל <span className="c-g c-nw">עוד חודש בחינם</span></span>
            </h2>
            <p>
              זה לא "חודש ראשון חינם", אתה משלם על ההקמה ועל הניהול כרגיל, אבל אם החודש הראשון לא הביא פניות, החודש השני עליי
            </p>
            <p>
              ואם גם אחרי חודשיים אין פניות, אני אומר לך את זה בפנים ועוצרים, בלי לשרוף לך עוד כסף
            </p>
            <p className="c-gtext__fine">ההבטחה חלה על הניהול, התוכנית היא עבודה שנמסרת לך ואין עליה החזר</p>
            <button type="button" className="c-btn" onClick={onContact}>לשיחת היכרות</button>
          </div>
          <div className="c-gface">
            <div className="c-gface__frame" aria-hidden="true" />
            <div className="c-gface__crop"><img src="/shmuel.jpg" alt="שמואל מוניץ" loading="lazy" /></div>
            <div className="c-gface__nm">שמואל מוניץ<span>Shift Up</span></div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ── למי זה מתאים / למי לא ── */
const FIT_YES = [
  'יש לך עסק שעובד ולקוחות שמרוצים ממך, וחסרות לך פניות קבועות',
  'אתה רוצה להבין למה משהו עובד, ולא רק שמישהו יריץ מודעות',
  'אתה מוכן להשקיע בפרסום ולמדוד אותו לפי כמה לקוח אחד שווה לך',
  'אתה רוצה מישהו שאחראי על השיווק ומדווח לך, בלי שתרדוף אחריו',
];
const FIT_NO = [
  'אתה רק מתחיל ועוד לא ברור לך מה אתה מוכר ולמי',
  'אתה רוצה שמישהו יריץ מודעה כבר מחר בבוקר',
  'אתה מחפש את המחיר הכי זול בשוק',
  'אתה מצפה לתוצאות כבר בשבוע הראשון',
];

function FitList({ title, items, yes }) {
  return (
    <div className={`c-fit__col${yes ? ' is-yes' : ''}`}>
      <h3>{title}</h3>
      <ul>
        {items.map((it) => (
          <li key={it}>
            <span aria-hidden="true">{yes ? '✓' : '✕'}</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Fit() {
  return (
    <section id="fit" className="c-sec c-light c-light--alt" aria-labelledby="fit-h">
      <div className="c-wrap">
        <div className="c-lbl">למי זה מתאים</div>
        <h2 id="fit-h" className="c-h2">
          <Tied text="אני לא עובד עם כולם, *וזה בכוונה*" />
        </h2>
        <div className="c-fit">
          <FitList title="זה מתאים לך אם" items={FIT_YES} yes />
          <FitList title="זה לא בשבילך אם" items={FIT_NO} />
        </div>
      </div>
    </section>
  );
}

/* ── השוואה: אסטרטג מול קמפיינר (סבב 2) ──
   שתי עמודות חדות, בלי טבלה ובלי כרטיסים. כל שורה מופיעה בשתי העמודות עם התווית שלה,
   כך שגם במובייל (עמודות זו מתחת לזו) כל ערך נקרא עם ההקשר שלו. */
const CMP_ROWS = [
  ['איפה מתחילים', 'פגישת עומק ומחקר על הלקוחות שלך', '"בוא נעלה קמפיין ונראה"'],
  ['מה יש לך ביד לפני שקל לפרסום', 'תוכנית כתובה: קהל, מסר, מודעות וחשבון', 'הצעת מחיר'],
  ['מאיפה בא המסר', 'ממה שהלקוחות שלך אומרים', 'ממה שעבד אצל לקוח קודם'],
  ['אם החודש הראשון לא הביא פניות', 'חודש ניהול נוסף בחינם', 'ממשיכים לשלם'],
  ['מה שלא עובד', 'נאמר לך בקול, כל שבוע', 'מתגלה בדוח בסוף החודש'],
  ['ניהול קמפיינים במטא ובגוגל', '✓', '✓'],
];

function CmpCol({ title, idx, me }) {
  return (
    <div className={`c-cmp__col${me ? ' is-me' : ''}`}>
      <h3>{title}</h3>
      <dl>
        {CMP_ROWS.map((row) => (
          <div key={row[0]} className="c-cmp__row">
            <dt>{row[0]}</dt>
            <dd>{row[idx]}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function Comparison() {
  return (
    <section id="why" className="c-sec c-light c-light--alt c-cmp" aria-labelledby="why-h">
      <div className="c-wrap">
        <div className="c-split">
          <div>
            <div className="c-lbl">למה אני</div>
            <h2 id="why-h" className="c-h2">
              מה ההבדל בין אסטרטג <span className="c-g c-block">לקמפיינר?</span>
            </h2>
          </div>
          <p className="c-lead">
            {nd('שניהם יודעים להעלות קמפיין, ההבדל הוא מה יש לך ביד לפני שהוא עולה')}
          </p>
        </div>
        <div className="c-cmp__grid">
          <CmpCol title="אצלי" idx={1} me />
          <CmpCol title="קמפיינר שמתחיל במודעות" idx={2} />
        </div>
      </div>
    </section>
  );
}
