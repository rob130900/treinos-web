import { useEffect, useState } from 'react';
import { api } from './api.js';
import ExerciseDemo from './ExerciseDemo.jsx';
import { IcoClose, IcoCheck, IcoNext, IcoPrev, IcoClock } from './Icons.jsx';

function mmss(s) {
  const m = Math.floor(s / 60), x = s % 60;
  return `${String(m).padStart(2, '0')}:${String(x).padStart(2, '0')}`;
}

export default function WorkoutPlayer({ workoutId, onClose }) {
  const [w, setW] = useState(null);
  const [ex, setEx] = useState([]);
  const [idx, setIdx] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [rest, setRest] = useState(null);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  // carregar treino
  useEffect(() => {
    api.getWorkout(workoutId).then((d) => {
      setW(d.workout);
      const list = d.workout.exercises || [];
      setEx(list);
      const firstPending = list.findIndex((e) => !e.completed);
      setIdx(firstPending >= 0 ? firstPending : 0);
    }).catch((e) => setError(e.message));
  }, [workoutId]);

  // cronometro total
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  // cronometro de descanso
  useEffect(() => {
    if (rest === null) return;
    if (rest <= 0) { setRest(null); setIdx((i) => Math.min(i + 1, ex.length - 1)); return; }
    const t = setTimeout(() => setRest((r) => r - 1), 1000);
    return () => clearTimeout(t);
  }, [rest, ex.length]);

  if (error) return <div className="player"><div className="alert" style={{ margin: 16 }}>{error}</div><button className="btn-outline" style={{ margin: 16, width: 'auto' }} onClick={() => onClose(false)}>Voltar</button></div>;
  if (!w) return <div className="player"><div className="skeleton-hero" style={{ margin: 16 }} /></div>;

  const total = ex.length;
  const completedCount = ex.filter((e) => e.completed).length;
  const allDone = total > 0 && completedCount === total;
  const cur = ex[idx];

  function markCurrent() {
    const e = cur;
    if (!e) return;
    if (e.completed) {
      api.uncompleteExercise(workoutId, e.id).catch(() => {});
      setEx((p) => p.map((x, i) => (i === idx ? { ...x, completed: false } : x)));
      return;
    }
    api.completeExercise(workoutId, e.id).catch(() => {});
    setEx((p) => p.map((x, i) => (i === idx ? { ...x, completed: true } : x)));
    const isLast = idx >= total - 1;
    const r = Number(e.rest_seconds) || 0;
    if (!isLast && r > 0) setRest(r);
    else if (!isLast) setIdx(idx + 1);
  }

  async function finish() {
    try { await api.completeWorkout(workoutId, elapsed); } catch { /* ignore */ }
    setDone(true);
  }

  // Tela de conclusao
  if (done) {
    return (
      <div className="player finish">
        <div className="finish-burst"><IcoCheck width={46} height={46} /></div>
        <h1>Treino concluído!</h1>
        <p className="muted">Mandou bem. Continue a sequência. 🔥</p>
        <div className="finish-stats">
          <div><b>{mmss(elapsed)}</b><small>duração</small></div>
          <div><b>{total}</b><small>exercícios</small></div>
        </div>
        <button className="btn" onClick={() => onClose(true)}>Voltar ao início</button>
      </div>
    );
  }

  const progPct = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  return (
    <div className="player">
      {/* Topo */}
      <div className="player-top">
        <button className="icon-btn" onClick={() => onClose(false)}><IcoClose width={18} height={18} /></button>
        <div className="player-title">{w.title}</div>
        <div className="player-time"><IcoClock width={14} height={14} /> {mmss(elapsed)}</div>
      </div>

      {/* Barra de progresso */}
      <div className="player-prog">
        <div className="bar"><div className="bar-fill" style={{ width: `${progPct}%` }} /></div>
        <div className="player-prog-label">{completedCount}/{total} exercícios</div>
      </div>

      {/* Passos */}
      <div className="steps">
        {ex.map((e, i) => (
          <button key={e.id} className={`step ${i === idx ? 'cur' : ''} ${e.completed ? 'ok' : ''}`} onClick={() => setIdx(i)}>
            {e.completed ? <IcoCheck width={13} height={13} /> : i + 1}
          </button>
        ))}
      </div>

      {/* Conteudo */}
      {cur && (
        <div className="player-body">
          <div className="ex-banner">
            <ExerciseDemo img1={cur.image_url} img2={cur.image_url2} label="execução" speed={650} />
            {cur.muscle_group && <span className="banner-tag">{cur.muscle_group}</span>}
          </div>

          <h2 className="ex-name">{cur.name}</h2>

          <div className="ex-stats">
            <div className="es"><b>{cur.sets || '-'}</b><small>séries</small></div>
            <div className="es"><b>{cur.reps || '-'}</b><small>reps</small></div>
            <div className="es"><b>{cur.weight || '-'}</b><small>carga</small></div>
            <div className="es"><b>{cur.rest_seconds || 60}s</b><small>descanso</small></div>
          </div>

          {cur.instructions && (
            <ol className="instr">
              {cur.instructions.split('\n').filter(Boolean).slice(0, 4).map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          )}
        </div>
      )}

      {/* Acoes fixas */}
      <div className="player-actions">
        <button className="btn-nav" disabled={idx === 0} onClick={() => setIdx(idx - 1)}><IcoPrev width={20} height={20} /></button>
        <button className={`btn-conclude ${cur?.completed ? 'undo' : ''}`} onClick={markCurrent}>
          {cur?.completed ? 'Desfazer' : <><IcoCheck width={18} height={18} /> Concluir exercício</>}
        </button>
        <button className="btn-nav" disabled={idx >= total - 1} onClick={() => setIdx(idx + 1)}><IcoNext width={20} height={20} /></button>
      </div>

      {allDone && (
        <div className="finish-bar">
          <button className="btn" onClick={finish}>Finalizar treino</button>
        </div>
      )}

      {/* Overlay de descanso */}
      {rest !== null && (
        <div className="rest-overlay">
          <div className="rest-card">
            <div className="rest-kicker">Descanso</div>
            <div className="rest-count">{mmss(rest)}</div>
            <div className="rest-next muted">A seguir: {ex[Math.min(idx + 1, total - 1)]?.name}</div>
            <div className="rest-btns">
              <button className="btn-ghost" onClick={() => setRest((r) => r + 15)}>+15s</button>
              <button className="btn-sm" onClick={() => { setRest(null); setIdx((i) => Math.min(i + 1, total - 1)); }}>Pular descanso</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
