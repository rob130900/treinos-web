import { useEffect, useState } from 'react';
import { api } from './api.js';
import { IcoPlay, IcoFlame, IcoCheck, IcoClock, IcoDumbbell } from './Icons.jsx';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Bom dia';
  if (h < 18) return 'Boa tarde';
  return 'Boa noite';
}
function firstName(name) { return (name || '').trim().split(' ')[0] || 'Atleta'; }
function fmtDur(s) {
  if (!s) return null;
  const m = Math.round(s / 60);
  return m < 60 ? `${m} min` : `${Math.floor(m / 60)}h${String(m % 60).padStart(2, '0')}`;
}
function fmtDate(d) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
}

export default function StudentHome({ user, onStart, goTab }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    api.dashboard().then(setData).catch((e) => setError(e.message));
  }, []);

  if (error) return <div className="alert">{error}</div>;
  if (!data) return <div className="skeleton-hero" />;

  const { week, streak, lastWorkout, nextWorkout, totals } = data;
  const pct = week.goal > 0 ? Math.min(100, Math.round((week.completed / week.goal) * 100)) : 0;

  return (
    <div className="home">
      <div className="hello">
        <div className="hello-sub">{greeting()},</div>
        <h1 className="hello-name">{firstName(user.name)} <span className="wave">👋</span></h1>
      </div>

      {/* Card semana */}
      <div className="week-card">
        <div className="spread" style={{ marginBottom: 12 }}>
          <div>
            <div className="wk-label">Sua semana</div>
            <div className="wk-count"><b>{week.completed}</b> de {week.goal} treinos</div>
          </div>
          <div className="wk-pct">{pct}%</div>
        </div>
        <div className="bar"><div className="bar-fill" style={{ width: `${pct}%` }} /></div>
        <div className="wk-dots">
          {Array.from({ length: week.goal }).map((_, i) => (
            <span key={i} className={`wk-dot ${i < week.completed ? 'on' : ''}`} />
          ))}
        </div>
      </div>

      {/* CTA principal */}
      {nextWorkout ? (
        <button className="cta-start" onClick={() => onStart(nextWorkout.id)}>
          <div className="cta-left">
            <span className="cta-kicker">Próximo treino</span>
            <span className="cta-title">{nextWorkout.title}</span>
            <span className="cta-meta">{nextWorkout.exercise_count} exercícios{nextWorkout.scheduled_date ? ` · ${fmtDate(nextWorkout.scheduled_date)}` : ''}</span>
          </div>
          <span className="cta-play"><IcoPlay width={26} height={26} /></span>
        </button>
      ) : totals.total === 0 ? (
        <div className="cta-done" style={{ background: 'var(--card)', borderColor: 'var(--line)', color: '#fff' }}>
          <IcoDumbbell width={26} height={26} />
          <div>
            <strong>Nenhum treino ainda</strong>
            <div className="muted" style={{ fontSize: 13 }}>Seu personal vai montar seu plano em breve.</div>
          </div>
        </div>
      ) : (
        <div className="cta-done">
          <IcoCheck width={26} height={26} />
          <div>
            <strong>Tudo concluído!</strong>
            <div className="muted" style={{ fontSize: 13 }}>Você terminou todos os treinos. 🎉</div>
          </div>
        </div>
      )}
      {nextWorkout && <div className="cta-hint">Toque para iniciar o treino guiado</div>}

      {/* Stats */}
      <div className="stats-row">
        <div className="mini-stat">
          <span className="ms-ico flame"><IcoFlame width={18} height={18} /></span>
          <b>{streak}</b>
          <small>dias seguidos</small>
        </div>
        <div className="mini-stat">
          <span className="ms-ico"><IcoCheck width={18} height={18} /></span>
          <b>{totals.completed}</b>
          <small>concluídos</small>
        </div>
        <div className="mini-stat">
          <span className="ms-ico"><IcoDumbbell width={18} height={18} /></span>
          <b>{totals.total}</b>
          <small>no plano</small>
        </div>
      </div>

      {/* Ultimo treino */}
      {lastWorkout && (
        <div className="last-card">
          <div className="section-title" style={{ marginBottom: 10 }}>Último treino</div>
          <div className="spread">
            <div>
              <div style={{ fontWeight: 700 }}>{lastWorkout.title}</div>
              <div className="muted" style={{ fontSize: 13, marginTop: 3 }}>
                {fmtDate(lastWorkout.completed_at)}{fmtDur(lastWorkout.duration_seconds) ? ` · ${fmtDur(lastWorkout.duration_seconds)}` : ''}
              </div>
            </div>
            <span className="badge ok">Concluído</span>
          </div>
        </div>
      )}

      <button className="btn-outline" style={{ marginTop: 4 }} onClick={() => goTab('workouts')}>
        Ver todos os treinos
      </button>
    </div>
  );
}
