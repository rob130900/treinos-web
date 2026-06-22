import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import ExercisePicker from './ExercisePicker.jsx';
import TrainerMessages from './TrainerMessages.jsx';
import StudentEvolution from './StudentEvolution.jsx';
import TrainerFinance from './TrainerFinance.jsx';
import StudentFicha from './StudentFicha.jsx';
import TrainerPlans from './TrainerPlans.jsx';

export default function TrainerDashboard() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');
  const [showMsgs, setShowMsgs] = useState(false);
  const [msgStudent, setMsgStudent] = useState(null);
  const [unread, setUnread] = useState(0);
  const [alerts, setAlerts] = useState([]);
  const [showEvo, setShowEvo] = useState(false);
  const [showFinance, setShowFinance] = useState(false);
  const [fichaStudent, setFichaStudent] = useState(null);

  async function loadComm() {
    try { setUnread((await api.unreadCount()).unread || 0); } catch { /* */ }
    try { setAlerts((await api.alerts()).alerts || []); } catch { /* */ }
  }
  useEffect(() => { loadComm(); const t = setInterval(loadComm, 15000); return () => clearInterval(t); }, []);
  function openMsgs(studentId) { setMsgStudent(studentId || null); setShowMsgs(true); }

  const [planInfo, setPlanInfo] = useState(null);
  const [showPlans, setShowPlans] = useState(false);

  async function loadStudents() {
    try { setStudents((await api.listStudents()).students); }
    catch (err) { setError(err.message); }
  }
  async function loadPlan() {
    try { setPlanInfo(await api.getPlan()); } catch { /* */ }
  }
  async function loadWorkouts(studentId) {
    try { setWorkouts((await api.listWorkouts(studentId)).workouts); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { loadStudents(); loadWorkouts(); loadPlan(); }, []);

  function selectStudent(s) { setSelectedStudent(s); loadWorkouts(s?.id); }

  const [exporting, setExporting] = useState(false);
  async function downloadBackup() {
    setExporting(true); setError('');
    try {
      const sql = await api.exportSql();
      const blob = new Blob([sql], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'kivo-backup.sql';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    } catch (err) { setError(err.message); } finally { setExporting(false); }
  }

  return (
    <div className="layout">
      <header className="topbar">
        <div className="row" style={{ gap: 12 }}>
          <span className="kivo" style={{ fontSize: 22 }}>KI<span className="v">V</span>O</span>
          <span className="dim" style={{ fontSize: 13 }}>Painel do Personal</span>
        </div>
        <div className="row">
          <button className="btn-ghost msg-btn" onClick={() => openMsgs(null)}>
            💬 Mensagens{unread > 0 && <span className="hdr-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          <button className="btn-ghost" onClick={() => setShowFinance(true)}>💰 Financeiro</button>
          <button className="btn-ghost" onClick={() => setShowPlans(true)}>⭐ Planos</button>
          <button className="btn-ghost" onClick={downloadBackup} disabled={exporting} title="Baixar todos os dados em SQL (backup / migração)">
            {exporting ? 'Gerando...' : '⬇ Backup'}
          </button>
          <span className="muted" style={{ fontSize: 13 }}>{user.name}</span>
          <button className="btn-ghost" onClick={logout}>Sair</button>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {alerts.length > 0 && (
        <div className="alerts-card">
          <div className="alerts-head">🔔 Alertas inteligentes ({alerts.length})</div>
          {alerts.map((a, i) => (
            <button key={i} className={`alert-row ${a.type}`} onClick={() => openMsgs(a.student_id)}>
              <span className="alert-dot" />
              <span>{a.text}</span>
              <span className="alert-go">falar →</span>
            </button>
          ))}
        </div>
      )}

      {showMsgs && <TrainerMessages initialStudentId={msgStudent} onClose={() => { setShowMsgs(false); loadComm(); }} />}

      {showFinance && <TrainerFinance students={students} onClose={() => setShowFinance(false)} onChange={loadStudents} />}

      {showPlans && planInfo && (
        <TrainerPlans
          planInfo={planInfo}
          onClose={() => setShowPlans(false)}
          onUpgraded={() => { loadPlan(); loadStudents(); }}
        />
      )}

      {fichaStudent && (
        <StudentFicha
          student={fichaStudent}
          onClose={() => setFichaStudent(null)}
          onSaved={() => { loadStudents(); }}
        />
      )}

      {showEvo && selectedStudent && (
        <div className="modal-bg" onClick={() => setShowEvo(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h2 style={{ fontSize: 18 }}>Evolução · {selectedStudent.name}</h2>
              <button className="close-x" onClick={() => setShowEvo(false)}>✕</button>
            </div>
            <div className="modal-body">
              <StudentEvolution studentId={selectedStudent.id} readOnly />
            </div>
          </div>
        </div>
      )}

      <div className="grid">
        <section className="card">
          <h2>Meus Alunos</h2>
          <div className="sub">Cadastre e acompanhe a evolução</div>

          {planInfo && (() => {
            const limit = planInfo.limit;
            const used = planInfo.used;
            const atLimit = limit != null && used >= limit;
            const pct = limit != null ? Math.min(100, Math.round((used / limit) * 100)) : 0;
            return (
              <div className={`plan-meter ${atLimit ? 'full' : ''}`}>
                <div className="spread">
                  {planInfo.isTrial ? (
                    <span className="plan-meter-txt">
                      Você cadastrou <b>{used}</b> de <b>3</b> alunos no <span className="plan-meter-name">plano gratuito</span>
                      {planInfo.daysLeft != null && <> · <b>{planInfo.daysLeft}</b> {planInfo.daysLeft === 1 ? 'dia restante' : 'dias restantes'}</>}
                    </span>
                  ) : (
                    <span className="plan-meter-txt">
                      Você está usando <b>{used}</b> de <b>{limit == null ? '∞' : limit}</b> alunos · <span className="plan-meter-name">{planInfo.plan?.name}</span>
                    </span>
                  )}
                  <button className="btn-mini" onClick={() => setShowPlans(true)}>{limit == null ? 'Ver planos' : 'Upgrade'}</button>
                </div>
                {limit != null && <div className="meter-bar"><div className="meter-fill" style={{ width: `${pct}%` }} /></div>}
                {atLimit ? (
                  <div className="plan-meter-warn">
                    {planInfo.isTrial
                      ? 'Você atingiu o limite de alunos do período gratuito. Faça upgrade para continuar cadastrando.'
                      : 'Você atingiu o limite do seu plano. Faça upgrade para continuar adicionando alunos.'}
                  </div>
                ) : planInfo.isTrial && (
                  <div className="plan-meter-hint">Teste o sistema com até 3 alunos. Desbloqueie mais ao assinar um plano. 🚀</div>
                )}
              </div>
            );
          })()}

          <AddStudent onAdded={() => { loadStudents(); loadPlan(); }} setError={setError} onOpenPlans={() => setShowPlans(true)} />
          <div className="list">
            <button className={`student-item ${!selectedStudent ? 'active' : ''}`} onClick={() => selectStudent(null)}>
              <div className="nm">Todos os treinos</div>
            </button>
            {students.map((s) => (
              <button key={s.id} className={`student-item ${selectedStudent?.id === s.id ? 'active' : ''}`} onClick={() => selectStudent(s)}>
                <div className="row" style={{ width: '100%' }}>
                  <div className="avatar">{s.name.charAt(0).toUpperCase()}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="nm">{s.name}</div>
                    <small className="muted">{s.completed_workouts}/{s.total_workouts} treinos concluídos</small>
                  </div>
                  <span className={`status-tag ${s.overdue ? 'inadimplente' : (s.status || 'ativo')}`}>
                    {s.overdue ? 'inadimplente' : (s.status || 'ativo')}
                  </span>
                </div>
              </button>
            ))}
            {students.length === 0 && <p className="muted">Nenhum aluno ainda.</p>}
          </div>
        </section>

        <section className="card">
          <div className="spread">
            <h2>{selectedStudent ? `Treinos de ${selectedStudent.name}` : 'Todos os treinos'}</h2>
            {selectedStudent && (
              <div className="row" style={{ gap: 8 }}>
                <button className="btn-ghost" onClick={() => setFichaStudent(selectedStudent)}>📋 Ficha</button>
                <button className="btn-ghost" onClick={() => setShowEvo(true)}>📈 Evolução</button>
              </div>
            )}
          </div>
          <div className="sub">Monte treinos usando a biblioteca de exercícios</div>
          {selectedStudent
            ? <NewWorkout student={selectedStudent} onCreated={() => loadWorkouts(selectedStudent.id)} setError={setError} />
            : <p className="muted">Selecione um aluno à esquerda para criar um treino.</p>}
          <div className="list">
            {workouts.map((w) => (
              <div key={w.id} className="workout-item">
                <div className="spread">
                  <div>
                    <strong style={{ fontSize: 15 }}>{w.title}</strong>
                    {w.student_name && <span className="dim" style={{ fontSize: 13 }}> · {w.student_name}</span>}
                    <div className="dim" style={{ fontSize: 12, marginTop: 4 }}>
                      {w.scheduled_date ? new Date(w.scheduled_date).toLocaleDateString('pt-BR') : 'Sem data'}
                    </div>
                  </div>
                  <div className="row">
                    <span className={`badge ${w.completed ? 'ok' : 'pend'}`}>{w.completed ? 'Concluído' : 'Pendente'}</span>
                    <button className="btn-ghost" onClick={async () => {
                      try { await api.duplicateWorkout(w.id); loadWorkouts(selectedStudent?.id); }
                      catch (e) { setError(e.message); }
                    }}>Duplicar</button>
                    <button className="btn-ghost danger" onClick={async () => {
                      if (!confirm('Excluir este treino?')) return;
                      await api.deleteWorkout(w.id);
                      loadWorkouts(selectedStudent?.id);
                    }}>Excluir</button>
                  </div>
                </div>
              </div>
            ))}
            {workouts.length === 0 && <p className="muted">Nenhum treino ainda.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function AddStudent({ onAdded, setError, onOpenPlans }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [limitMsg, setLimitMsg] = useState('');

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError(''); setLimitMsg('');
    try {
      await api.createStudent(form);
      setForm({ name: '', email: '', password: '' });
      setOpen(false); onAdded();
    } catch (err) {
      if (/limite/i.test(err.message)) setLimitMsg(err.message);
      else setError(err.message);
    } finally { setLoading(false); }
  }

  if (limitMsg) {
    return (
      <div className="limit-box">
        <div>{limitMsg}</div>
        <div className="row" style={{ marginTop: 10 }}>
          <button className="btn-sm" onClick={() => { setLimitMsg(''); onOpenPlans && onOpenPlans(); }}>Ver planos</button>
          <button className="btn-ghost" onClick={() => setLimitMsg('')}>Fechar</button>
        </div>
      </div>
    );
  }

  if (!open) return <button className="btn-sm" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>+ Cadastrar aluno</button>;

  return (
    <form className="inline-form" onSubmit={submit}>
      <input placeholder="Nome do aluno" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Senha (o aluno usa para entrar)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={4} />
      <div className="row">
        <button className="btn-sm" disabled={loading}>{loading ? 'Salvando...' : 'Salvar'}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  );
}

function NewWorkout({ student, onCreated, setError }) {
  const [open, setOpen] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(false);

  function addFromLibrary(list) {
    setExercises((cur) => [...cur, ...list]);
    setShowPicker(false);
  }
  function updEx(i, field, value) {
    setExercises((arr) => arr.map((e, idx) => (idx === i ? { ...e, [field]: value } : e)));
  }
  function rmEx(i) { setExercises((arr) => arr.filter((_, idx) => idx !== i)); }

  async function submit(e) {
    e.preventDefault();
    if (exercises.length === 0) { setError('Adicione ao menos um exercício da biblioteca.'); return; }
    setLoading(true); setError('');
    try {
      await api.createWorkout({
        student_id: student.id, title, description, scheduled_date: date || null,
        exercises: exercises.map((ex) => ({
          ...ex,
          sets: ex.sets ? Number(ex.sets) : null,
        })),
      });
      setTitle(''); setDescription(''); setDate(''); setExercises([]);
      setOpen(false); onCreated();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  if (!open) return <button className="btn-sm" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>+ Novo treino</button>;

  return (
    <>
      {showPicker && <ExercisePicker onClose={() => setShowPicker(false)} onConfirm={addFromLibrary} />}
      <form className="inline-form" onSubmit={submit}>
        <input placeholder="Título (ex: Treino A — Peito e Tríceps)" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <textarea placeholder="Observações (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
        <label style={{ margin: '4px 0 0' }}>Data (opcional)</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

        <button type="button" className="btn-outline" style={{ marginTop: 6 }} onClick={() => setShowPicker(true)}>
          + Adicionar exercícios da biblioteca ({exercises.length})
        </button>

        {exercises.map((ex, i) => (
          <div className="picked" key={i}>
            <div className="thumb"><img src={ex.image_url} alt={ex.name} loading="lazy" /></div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
              <div className="ex-row" style={{ marginTop: 6 }}>
                <input className="mini" placeholder="Séries" value={ex.sets || ''} onChange={(e) => updEx(i, 'sets', e.target.value)} />
                <input className="mini" placeholder="Reps" value={ex.reps || ''} onChange={(e) => updEx(i, 'reps', e.target.value)} />
                <input className="mini" placeholder="Carga" value={ex.weight || ''} onChange={(e) => updEx(i, 'weight', e.target.value)} />
              </div>
            </div>
            <button type="button" className="btn-ghost danger" onClick={() => rmEx(i)}>✕</button>
          </div>
        ))}

        <div className="row" style={{ marginTop: 6 }}>
          <button className="btn-sm" disabled={loading}>{loading ? 'Salvando...' : 'Criar treino'}</button>
          <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
        </div>
      </form>
    </>
  );
}
