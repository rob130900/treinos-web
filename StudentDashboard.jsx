import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0 });
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [details, setDetails] = useState({});

  async function load() {
    try {
      const [wData, pData] = await Promise.all([api.listWorkouts(), api.myProgress()]);
      setWorkouts(wData.workouts);
      setProgress({ total: Number(pData.totals.total), completed: Number(pData.totals.completed) });
    } catch (err) { setError(err.message); }
  }
  useEffect(() => { load(); }, []);

  async function toggle(w) {
    try {
      if (w.completed) await api.uncompleteWorkout(w.id);
      else await api.completeWorkout(w.id);
      load();
    } catch (err) { setError(err.message); }
  }

  async function openDetails(w) {
    if (openId === w.id) { setOpenId(null); return; }
    setOpenId(w.id);
    if (!details[w.id]) {
      const data = await api.getWorkout(w.id);
      setDetails((d) => ({ ...d, [w.id]: data.workout }));
    }
  }

  const pct = progress.total > 0 ? Math.round((progress.completed / progress.total) * 100) : 0;

  return (
    <div className="layout">
      <header className="topbar">
        <div><strong>Meus Treinos</strong><span className="muted"> — {user.name}</span></div>
        <button className="btn-ghost" onClick={logout}>Sair</button>
      </header>
      {error && <div className="alert">{error}</div>}
      <section className="card">
        <h2>Meu Progresso</h2>
        <div className="progress-stats">
          <div><strong>{progress.completed}</strong><small>Concluidos</small></div>
          <div><strong>{progress.total}</strong><small>Total</small></div>
          <div><strong>{pct}%</strong><small>Aproveitamento</small></div>
        </div>
        <div className="progress-bar"><div style={{ width: `${pct}%` }} /></div>
      </section>
      <section className="card">
        <h2>Treinos</h2>
        <div className="list">
          {workouts.map((w) => (
            <div key={w.id} className={`workout-item ${w.completed ? 'done' : ''}`}>
              <div style={{ flex: 1 }}>
                <button className="link-title" onClick={() => openDetails(w)}><strong>{w.title}</strong></button>
                <div className="muted">
                  {w.scheduled_date ? new Date(w.scheduled_date).toLocaleDateString('pt-BR') : 'Sem data'}
                  {' · '}{w.completed ? '✅ Concluido' : '⏳ Pendente'}
                </div>
                {openId === w.id && details[w.id] && (
                  <div className="details">
                    {details[w.id].description && <p>{details[w.id].description}</p>}
                    {details[w.id].exercises?.length > 0 ? (
                      <table className="ex-table">
                        <thead><tr><th>Exercicio</th><th>Series</th><th>Reps</th><th>Carga</th></tr></thead>
                        <tbody>
                          {details[w.id].exercises.map((ex) => (
                            <tr key={ex.id}>
                              <td>{ex.name}</td><td>{ex.sets || '-'}</td><td>{ex.reps || '-'}</td><td>{ex.weight || '-'}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    ) : <p className="muted">Sem exercicios cadastrados.</p>}
                  </div>
                )}
              </div>
              <button className={w.completed ? 'btn-ghost' : 'btn-sm'} onClick={() => toggle(w)}>
                {w.completed ? 'Desfazer' : 'Concluir'}
              </button>
            </div>
          ))}
          {workouts.length === 0 && <p className="muted">Voce ainda nao tem treinos. Fale com seu personal.</p>}
        </div>
      </section>
    </div>
  );
}
