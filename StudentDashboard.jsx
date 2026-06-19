import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import ExerciseDemo from './ExerciseDemo.jsx';
import VideoModal from './VideoModal.jsx';

function Ring({ pct }) {
  const r = 56, c = 2 * Math.PI * r;
  const off = c - (pct / 100) * c;
  return (
    <div className="ring">
      <svg width="132" height="132" viewBox="0 0 132 132">
        <circle cx="66" cy="66" r={r} fill="none" stroke="#23262e" strokeWidth="11" />
        <circle cx="66" cy="66" r={r} fill="none" stroke="#ff6a00" strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 66 66)" style={{ transition: 'stroke-dashoffset .6s' }} />
      </svg>
      <div className="pct"><b>{pct}%</b><small>da sua meta</small></div>
    </div>
  );
}

export default function StudentDashboard() {
  const { user, logout } = useAuth();
  const [workouts, setWorkouts] = useState([]);
  const [progress, setProgress] = useState({ total: 0, completed: 0 });
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);
  const [details, setDetails] = useState({});
  const [video, setVideo] = useState(null);

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
        <span className="kivo" style={{ fontSize: 22 }}>KI<span className="v">V</span>O</span>
        <div className="row">
          <span className="muted" style={{ fontSize: 13 }}>{user.name}</span>
          <button className="btn-ghost" onClick={logout}>Sair</button>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      <section className="card">
        <div className="section-title">Seu progresso</div>
        <div className="progress-hero">
          <Ring pct={pct} />
          <div className="stat-grid">
            <div className="stat"><b>{progress.completed}</b><small>Concluídos</small></div>
            <div className="stat"><b>{progress.total}</b><small>Total</small></div>
            <div className="stat"><b>{progress.total - progress.completed}</b><small>Pendentes</small></div>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="section-title">Seus treinos</div>
        <div className="list">
          {workouts.map((w) => (
            <div key={w.id} className={`workout-item ${w.completed ? 'done' : ''}`}>
              <div className="spread">
                <button className="link-title" onClick={() => openDetails(w)}>
                  {w.title} <span style={{ fontSize: 13, color: 'var(--dim)' }}>{openId === w.id ? '▴' : '▾'}</span>
                </button>
                <div className="row">
                  <span className={`badge ${w.completed ? 'ok' : 'pend'}`}>{w.completed ? 'Concluído' : 'Pendente'}</span>
                  <button className={w.completed ? 'btn-ghost' : 'btn-sm'} onClick={() => toggle(w)}>
                    {w.completed ? 'Desfazer' : 'Concluir'}
                  </button>
                </div>
              </div>
              <div className="dim" style={{ fontSize: 12, marginTop: 6 }}>
                {w.scheduled_date ? new Date(w.scheduled_date).toLocaleDateString('pt-BR') : 'Sem data'}
              </div>

              {openId === w.id && details[w.id] && (
                <div style={{ marginTop: 12 }}>
                  {details[w.id].description && <p className="muted" style={{ fontSize: 14 }}>{details[w.id].description}</p>}
                  {details[w.id].exercises?.length ? details[w.id].exercises.map((ex) => (
                    <div className="ex-detail" key={ex.id}>
                      <button className="ex-thumb" onClick={() => ex.video_id && setVideo({ id: ex.video_id, title: ex.name })}>
                        <ExerciseDemo img1={ex.image_url} img2={ex.image_url2} />
                        {ex.video_id && <span className="play-mini">▶</span>}
                      </button>
                      <div className="meta">
                        <div style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.2 }}>{ex.name}</div>
                        {ex.muscle_group && <div className="mg">{ex.muscle_group}</div>}
                        <div className="dim" style={{ fontSize: 13, marginTop: 5 }}>
                          {[ex.sets && `${ex.sets} séries`, ex.reps && `${ex.reps} reps`, ex.weight && `carga ${ex.weight}`].filter(Boolean).join('  ·  ')}
                        </div>
                        {ex.video_id && (
                          <button className="btn-video sm" onClick={() => setVideo({ id: ex.video_id, title: ex.name })}>
                            <span className="vicon">▶</span> Ver execução
                          </button>
                        )}
                        {ex.instructions && (
                          <ol className="instr">
                            {ex.instructions.split('\n').filter(Boolean).slice(0, 3).map((s, i) => <li key={i}>{s}</li>)}
                          </ol>
                        )}
                      </div>
                    </div>
                  )) : <p className="muted">Sem exercícios cadastrados.</p>}
                </div>
              )}
            </div>
          ))}
          {workouts.length === 0 && <p className="muted">Você ainda não tem treinos. Fale com seu personal.</p>}
        </div>
      </section>

      {video && <VideoModal videoId={video.id} title={video.title} onClose={() => setVideo(null)} />}
    </div>
  );
}
