import { useEffect, useState } from 'react';
import { api } from './api.js';
import { IcoFlame, IcoCheck, IcoClock } from './Icons.jsx';

function fmtDur(s) {
  if (!s) return null;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
}

export default function StudentHistory() {
  const [streak, setStreak] = useState(0);
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.dashboard(), api.listWorkouts()])
      .then(([d, w]) => {
        setStreak(d.streak || 0);
        const done = w.workouts
          .filter((x) => x.completed)
          .sort((a, b) => new Date(b.completed_at || 0) - new Date(a.completed_at || 0));
        setItems(done);
      })
      .catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!items) return <div className="skeleton-hero" />;

  return (
    <div className="home">
      <h1 className="page-title">Histórico</h1>

      <div className="streak-banner">
        <span className="streak-flame"><IcoFlame width={26} height={26} /></span>
        <div>
          <div className="streak-num">{streak} {streak === 1 ? 'dia' : 'dias'}</div>
          <div className="streak-sub">{streak > 0 ? 'de sequência treinando. Não pare agora!' : 'Comece sua sequência hoje!'}</div>
        </div>
      </div>

      {items.length === 0 && <p className="muted">Nenhum treino concluído ainda. Bora começar!</p>}

      <div className="hlist">
        {items.map((w) => (
          <div key={w.id} className="hcard">
            <div className="hcard-ico"><IcoCheck width={20} height={20} /></div>
            <div className="hcard-info">
              <div className="hcard-title">{w.title}</div>
              <div className="hcard-meta">{fmtDate(w.completed_at)}</div>
            </div>
            {fmtDur(w.duration_seconds) && (
              <span className="hcard-dur"><IcoClock width={13} height={13} /> {fmtDur(w.duration_seconds)}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
