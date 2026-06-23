import { useEffect, useState } from 'react';
import { api } from './api.js';
import { pickStudentMessage, pickTrainerMessage } from './welcomeMessages.js';

// Banner de boas-vindas contextual. Mostra no máximo 1 vez por sessão,
// some sozinho após alguns segundos e pode ser fechado manualmente.
export default function WelcomeBanner({ role, onAction }) {
  const [msg, setMsg] = useState(null);
  const [payload, setPayload] = useState(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const key = 'welcome_shown_' + role;
    try { if (sessionStorage.getItem(key)) return; } catch { /* */ }
    let alive = true;
    let timer;
    (async () => {
      try {
        let m = null; let pl = null;
        if (role === 'student') {
          const d = await api.dashboard();
          m = pickStudentMessage(d);
          pl = d?.nextWorkout || null;
        } else {
          const p = await api.getPlan();
          m = pickTrainerMessage(p);
        }
        if (!alive || !m) return;
        try { sessionStorage.setItem(key, '1'); } catch { /* */ }
        setMsg(m); setPayload(pl); setShow(true);
        timer = setTimeout(() => { if (alive) setShow(false); }, 12000);
      } catch { /* */ }
    })();
    return () => { alive = false; clearTimeout(timer); };
  }, [role]);

  if (!msg || !show) return null;

  function act() { onAction && onAction(msg.cta.action, payload); setShow(false); }

  return (
    <div className={`welcome-banner ${msg.tone}`}>
      <div className="welcome-text">{msg.text}</div>
      <div className="welcome-actions">
        {msg.cta && <button className="welcome-cta" onClick={act}>{msg.cta.label}</button>}
        <button className="welcome-x" onClick={() => setShow(false)} aria-label="Fechar">✕</button>
      </div>
    </div>
  );
}
