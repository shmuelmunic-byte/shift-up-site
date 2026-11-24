import { useSiteLinks } from '../lib/useSiteLinks';
import { WhatsAppIcon } from './icons';
import { nd } from '../content/heroCopy';

const perks = [
  { title: 'אסטרטגיה', desc: 'למה לקוחות קונים, ואיך לגרום להם לבחור בך.' },
  { title: 'כלי AI', desc: 'פרומפטים ושיטות לחיסכון בזמן וכסף.' },
  { title: 'ניתוחי עומק', desc: 'פירוק מהלכים שיווקיים והתאמה לבעלי עסקים.' },
];

/* קהילת הוואטסאפ (כיוון C): כהה, בלי כרטיס זוהר ובלי אייקונים גנריים, רשימה עם קו ירוק */
export default function WhatsAppGroup() {
  const { whatsapp_group: WA_GROUP } = useSiteLinks();

  return (
    <section className="c-sec c-dark c-dark--2 c-wag" aria-labelledby="wag-h">
      <div className="c-wrap c-wag__grid">
        <div>
          <div className="c-lbl">קהילת וואטסאפ</div>
          <h2 id="wag-h" className="c-h2">
            החדר האחורי <span className="c-g">של השיווק</span>
          </h2>
          <p className="c-lead c-lead--dark">
            לבעלי עסקים שרוצים להבין איך המשחק עובד באמת, בלי סיסמאות ובלי תיאוריות,
            רק פרקטיקה עסקית, פסיכולוגיה של מכירות ושימוש חכם ב-AI
          </p>
        </div>
        <div>
          <ul className="c-wag__perks">
            {perks.map((p) => (
              <li key={p.title}><strong>{p.title}</strong>: {nd(p.desc)}</li>
            ))}
          </ul>
          <div className="c-wag__row">
            <a href={WA_GROUP} target="_blank" rel="noopener noreferrer" className="c-btn c-btn--ghost">
              <WhatsAppIcon size={20} />
              הצטרף לקבוצה, בחינם
            </a>
            <span className="c-wag__dose">קצר, חד, לעניין</span>
          </div>
        </div>
      </div>
    </section>
  );
}
