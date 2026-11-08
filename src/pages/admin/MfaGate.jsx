import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../../lib/supabase';
import './admin.css';

/* Second step after the password, before anything in /admin is shown.
   - No authenticator yet: one-time setup (QR + code), then the session is aal2.
   - Authenticator exists: a 6-digit code on every new sign-in.
   The database enforces it too: is_hub_admin() is true only for an aal2 session
   (migration 20261108_hub_admin_require_mfa.sql), so skipping this screen shows nothing. */

const onlyDigits = (v) => v.replace(/\D/g, '').slice(0, 6);

export default function MfaGate({ children }) {
  const [state, setState] = useState({ step: 'checking' });
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const check = useCallback(async () => {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (error) { setState({ step: 'error', msg: 'לא הצלחתי לבדוק את האימות. רענן ונסה שוב.' }); return; }
    if (data.currentLevel === 'aal2') { setState({ step: 'ok' }); return; }
    const { data: f } = await supabase.auth.mfa.listFactors();
    const verified = (f?.totp || []).find((x) => x.status === 'verified');
    if (verified) { setState({ step: 'code', factorId: verified.id }); return; }
    setState({ step: 'intro' });
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- first check after mount; state is set after the network call
  useEffect(() => { check(); }, [check]);

  const startEnroll = async () => {
    setBusy(true); setErr('');
    // a setup that was started and never finished blocks a new one with the same name
    const { data: f } = await supabase.auth.mfa.listFactors();
    for (const x of (f?.all || []).filter((y) => y.status !== 'verified')) await supabase.auth.mfa.unenroll({ factorId: x.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: 'totp', friendlyName: `Shift Up admin ${new Date().toISOString().slice(0, 10)}` });
    setBusy(false);
    if (error) { setErr('לא הצלחתי להתחיל את ההגדרה: ' + error.message); return; }
    setState({ step: 'enroll', factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verify = async (e) => {
    e.preventDefault();
    if (code.length !== 6) { setErr('צריך 6 ספרות'); return; }
    setBusy(true); setErr('');
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: state.factorId, code });
    setBusy(false);
    if (error) { setErr('הקוד לא נכון או שפג תוקפו. נסה את הקוד הבא שמופיע באפליקציה.'); setCode(''); return; }
    setState({ step: 'ok' });
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  if (state.step === 'ok') return children;

  const codeForm = (
    <form onSubmit={verify} className="mfa-form">
      <label htmlFor="mfa-code">הקוד מ-Google Authenticator</label>
      <input id="mfa-code" className="mfa-code" inputMode="numeric" autoComplete="one-time-code" dir="ltr"
        value={code} onChange={(e) => setCode(onlyDigits(e.target.value))} placeholder="000000" autoFocus />
      {err && <p className="mfa-err" role="alert">{err}</p>}
      <button type="submit" className="hub-act hub-act-main mfa-btn" disabled={busy}>{busy ? 'בודק...' : 'כניסה'}</button>
    </form>
  );

  return (
    <div className="admin-scope" dir="rtl" style={{ minHeight: '100dvh' }}>
      <div className="adm-denied mfa">
        {state.step === 'checking' && <div className="hub-skel" aria-label="בודק" />}

        {state.step === 'error' && <><h1>משהו נתקע</h1><p>{state.msg}</p></>}

        {state.step === 'code' && (
          <>
            <h1>אימות דו-שלבי</h1>
            <p>פתח את Google Authenticator והקלד את 6 הספרות של Shift Up.</p>
            {codeForm}
          </>
        )}

        {state.step === 'intro' && (
          <>
            <h1>עוד שלב אחד, פעם אחת</h1>
            <p>מעכשיו הכניסה למרכז דורשת גם קוד מהטלפון, כי יש כאן נתוני לקוחות. ההגדרה לוקחת דקה, ב-Google Authenticator שכבר יש לך.</p>
            {err && <p className="mfa-err" role="alert">{err}</p>}
            <button type="button" className="hub-act hub-act-main mfa-btn" onClick={startEnroll} disabled={busy}>{busy ? 'מכין...' : 'להגדרה'}</button>
          </>
        )}

        {state.step === 'enroll' && (
          <>
            <h1>סרוק עם Google Authenticator</h1>
            <p>באפליקציה: + ואז "סריקת קוד QR". במחשב, סרוק מהמסך עם הטלפון.</p>
            <img className="mfa-qr" src={state.qr} alt="קוד QR להגדרת אימות דו-שלבי" width="200" height="200" />
            <details className="mfa-secret">
              <summary>אי אפשר לסרוק? להקלדה ידנית</summary>
              <code dir="ltr">{state.secret}</code>
            </details>
            {codeForm}
            <p className="mfa-note">כדאי להוסיף את אותו קוד גם במכשיר שני, כגיבוי. אם הטלפון יאבד, אין קוד שחזור.</p>
          </>
        )}

        {state.step !== 'checking' && <button type="button" className="adm-link-quiet mfa-out" onClick={signOut}>יציאה</button>}
      </div>
    </div>
  );
}
