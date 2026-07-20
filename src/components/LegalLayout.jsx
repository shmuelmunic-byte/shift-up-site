import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Cursor from './Cursor';

/* פריסה משותפת לעמודים משפטיים (הצהרת נגישות + מדיניות פרטיות)
   dir=rtl, Cursor, מיתוג Shift Up, קישור דילוג לתוכן, ניגודיות גבוהה. */

export default function LegalLayout({ title, subtitle, updated, children }) {
  useEffect(() => {
    document.title = `${title} | Shift Up`;
  }, [title]);

  return (
    <div dir="rtl" style={{
      minHeight: '100vh',
      background: 'var(--bedrock)',
      color: 'var(--text-primary)',
      fontFamily: "'Heebo', sans-serif",
      position: 'relative',
    }}>
      <a href="#legal-main" className="skip-link">דלג לתוכן הראשי</a>
      <Cursor />

      <header style={{ borderBottom: '1px solid var(--surface-1)', padding: '20px 28px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Link to="/" aria-label="חזרה לדף הבית של Shift Up" style={{ display: 'inline-flex', alignItems: 'center' }}>
            <img src="/logo.svg" alt="Shift Up" style={{ height: 44, width: 'auto' }} />
          </Link>
          <Link to="/" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textDecoration: 'none' }}>
            ← חזרה לאתר
          </Link>
        </div>
      </header>

      <main id="legal-main" tabIndex={-1} style={{ maxWidth: 820, margin: '0 auto', padding: 'clamp(32px, 6vw, 72px) 28px 96px' }}>
        <h1 style={{ fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', fontWeight: 900, letterSpacing: '-0.02em', lineHeight: 1.15, marginBottom: 14 }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ fontSize: 'clamp(1rem, 2.4vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 10 }}>
            {subtitle}
          </p>
        )}
        {updated && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 40 }}>
            עודכן לאחרונה: {updated}
          </p>
        )}
        <div className="legal-body">{children}</div>
      </main>
    </div>
  );
}
