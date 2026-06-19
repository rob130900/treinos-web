import { useEffect, useState } from 'react';
import { api } from './api.js';
import { IcoPlay, IcoCheck, IcoDumbbell } from './Icons.jsx';

function fmtDate(d) {
  if (!d) return 'Sem data';
  return new Date(d).toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' });
}

export default function StudentWorkouts({ onOpen }) {
  const [workouts, setWorkouts] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.listWorkouts().then((d) => setWorkouts(d.workouts)).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!workouts) return <div className="skeleton-hero" />;

  return (
    <div className="home">
      <h1 className="page-title">Seus treinos</h1>
      {workouts.length === 0 && <p className="muted">Você ainda não tem treinos. Fale com seu personal.</p>}
      <div className="wlist">
        {workouts.map((w) => (
          <button key={w.id} className={`wcard ${w.completed ? 'done' : ''}`} onClick={() => onOpen(w.id)}>
            <div className="wcard-ico">{w.completed ? <IcoCheck width={22} height={22} /> : <IcoDumbbell width={22} height={22} />}</div>
            <div className="wcard-info">
              <div className="wcard-title">{w.title}</div>
              <div className="wcard-meta">
                {w.exercise_count} exercícios · {fmtDate(w.scheduled_date)}
              </div>
            </div>
            <span className={`badge ${w.completed ? 'ok' : 'pend'}`}>{w.completed ? 'Feito' : 'Iniciar'}</span>
            <span className="wcard-play"><IcoPlay width={18} height={18} /></span>
          </button>
        ))}
      </div>
    </div>
  );
}
