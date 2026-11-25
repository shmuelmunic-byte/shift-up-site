import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PageNav from '../components/PageNav';
import Tied, { fin } from '../content/Tied';

const FALLBACK_LINKS = [
  {
    id: 'business',
    label: 'לעשות Shift Up לעסק',
    href: 'https://wa.me/972534673151?text=' + encodeURIComponent('היי שמואל, ראיתי אותך באינסטגרם ואשמח לשמוע איך נראית תוכנית לעסק שלי'),
    style: 'primary',
  },
  {
    id: 'community',
    label: 'להצטרף לקהילת Shift Up',
    href: 'https://chat.whatsapp.com/BBhSKstQEgg3jZsSo9RvdZ?s=cl&p=a&mlu=3',
    style: 'secondary',
  },
];

const INSTAGRAM_URL = 'https://www.instagram.com/shiftup.marketing';

// אבחון /audit — כפתור קבוע בראש הרשימה (דלת רכה מהריל ומהביו)
const AUDIT_HREF = '/audit';

/* כל הטקסטים של הדף במקום אחד, כדי שיהיה קל להחליף כשהקופי החדש יגיע (סבב 2, 25.11.2026) */
const COPY = {
  name: 'שמואל מוניץ',
  title: 'אסטרטג שיווק · קודם תוכנית, אחר כך קמפיין',
  chip: 'Shift Up · תוכנית לפני תקציב',
  audit: 'אבחון שיווק חינם',
  auditTag: '3 דקות',
  trust: 'שיחת היכרות בטלפון, בלי עלות · תוכנית כתובה תוך שבוע מפגישת העומק',
  handle: '@shiftup.marketing',
};

function IgIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  );
}

function WhatsAppIcon({ size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

/* כיוון C (סבב 2): רקע לילה מלא, דיוקן חד במסגרת ירוקה בהיסט (כמו בריבוע ההבטחה בעמוד הראשי),
   כפתורים מרובעים ברוחב מלא. בלי הילות, בלי טבעת מסתובבת ובלי אייקונים גנריים */
export default function IgPage() {
  const [links, setLinks] = useState(FALLBACK_LINKS);

  useEffect(() => {
    supabase.from('ig_links').select('*').order('position').then(({ data, error }) => {
      if (!error && data && data.length > 0) {
        // כפתור האבחון מרונדר קבוע למעלה — לסנן כפילות אם הוא הוזן גם בטבלה
        setLinks(data.filter((l) => !String(l.href || '').includes('/audit')));
      }
    });
  }, []);

  useEffect(() => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', 'ViewContent', { content_name: 'IG Bio Page', content_category: 'ig_bio' });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'view_item', { item_id: 'ig_bio', item_name: 'IG Bio Page' });
    }
  }, []);

  const trackClick = (linkStyle) => {
    if (typeof window.fbq === 'function') {
      window.fbq('track', linkStyle === 'primary' ? 'Lead' : 'Contact', { content_category: 'ig_bio' });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', linkStyle === 'primary' ? 'generate_lead' : 'join_group', { source: 'ig_bio' });
    }
  };

  const trackAudit = () => {
    if (typeof window.fbq === 'function') {
      window.fbq('trackCustom', 'AuditStart', { content_name: 'ig_bio_audit', content_category: 'ig_bio' });
    }
    if (typeof window.gtag === 'function') {
      window.gtag('event', 'select_content', { source: 'ig_bio', button: 'audit' });
    }
  };

  return (
    <div dir="rtl" className="c-page c-ig">
      <PageNav />
      <main className="c-ig__main">
        <div className="c-ig__top">
          <div className="c-gface">
            <div className="c-gface__frame" aria-hidden="true" />
            <div className="c-gface__crop"><img src="/shmuel.jpg" alt={COPY.name} /></div>
          </div>
          <div>
            <h1 className="c-ig__name">{COPY.name}</h1>
            <p className="c-ig__title"><Tied text={fin(COPY.title)} /></p>
            <span className="c-ig__chip">{COPY.chip}</span>
          </div>
        </div>

        <div className="c-ig__links">
          {/* אבחון — כפתור קבוע, ראשון ברשימה */}
          <a href={AUDIT_HREF} onClick={trackAudit} className="c-btn c-btn--ghost c-ig__btn">
            <span>{COPY.audit}</span>
            <span className="c-btn__tag">{COPY.auditTag}</span>
          </a>

          {links.map((link) => (
            <a
              key={link.id}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => trackClick(link.style)}
              className={`c-btn c-ig__btn${link.style === 'primary' ? '' : ' c-btn--line'}`}
            >
              <span>{link.label}</span>
              {link.style === 'primary' && <WhatsAppIcon size={20} />}
            </a>
          ))}
        </div>

        <p className="c-ig__trust"><Tied text={fin(COPY.trust)} /></p>

        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="c-ig__handle" dir="ltr">
          <IgIcon size={15} />
          {COPY.handle}
        </a>
      </main>
    </div>
  );
}
