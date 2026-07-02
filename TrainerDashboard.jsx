import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import ExercisePicker from './ExercisePicker.jsx';
import TrainerMessages from './TrainerMessages.jsx';
import StudentEvolution from './StudentEvolution.jsx';
import TrainerFinance from './TrainerFinance.jsx';
import StudentFicha from './StudentFicha.jsx';
import WorkoutEditor from './WorkoutEditor.jsx';
import CustomExLibrary from './CustomExLibrary.jsx';
import KivoLogo from './KivoLogo.jsx';
import { Help, WelcomeTour } from './Help.jsx';
import Badge from './Badge.jsx';

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
  const [copied, setCopied] = useState(false);
  const [editWorkoutId, setEditWorkoutId] = useState(null);
  const [showCustomEx, setShowCustomEx] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  async function loadComm() {
    try { setUnread((await api.unreadCount()).unread || 0); } catch { /* */ }
    try { setAlerts((await api.alerts()).alerts || []); } catch { /* */ }
  }
  useEffect(() => { loadComm(); const t = setInterval(loadComm, 15000); return () => clearInterval(t); }, []);
  function openMsgs(studentId) { setMsgStudent(studentId || null); setShowMsgs(true); }

  async function loadStudents() {
    try { setStudents((await api.listStudents()).students); }
    catch (err) { setError(err.message); }
  }
  async function loadWorkouts(studentId) {
    try { setWorkouts((await api.listWorkouts(studentId)).workouts); }
    catch (err) { setError(err.message); }
  }
  useEffect(() => { loadStudents(); loadWorkouts(); }, []);

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
        <div className="topbar-brand">
          <KivoLogo size={26} />
          <span className="dim" style={{ fontSize: 13 }}>Painel do Personal</span>
        </div>
        <nav className="topbar-actions">
          <button className={`btn-ghost msg-btn ${showMsgs ? 'active' : ''}`} onClick={() => openMsgs(null)}>
            💬 Mensagens{unread > 0 && <span className="hdr-badge">{unread > 9 ? '9+' : unread}</span>}
          </button>
          <button className={`btn-ghost ${showFinance ? 'active' : ''}`} onClick={() => setShowFinance(true)}>💰 Financeiro</button>
          <button className="btn-ghost" onClick={() => setShowCustomEx(true)}>🎬 Exercícios</button>
          <button className="btn-ghost" onClick={downloadBackup} disabled={exporting} title="Baixar todos os dados em SQL (backup / migração)">
            {exporting ? 'Gerando...' : '⬇ Backup'}
          </button>
          <button className="btn-ghost" onClick={() => setShowHelp(true)} title="Ajuda e tutorial">❓ Ajuda</button>
        </nav>
        <div className="topbar-user">
          <span className="muted" style={{ fontSize: 13 }}>{user.name}</span>
          <Badge label={user.badge} />
          <button className="btn-ghost" onClick={logout}>Sair</button>
        </div>
      </header>

      {error && <div className="alert">{error}</div>}

      {showHelp && <Help role="trainer" onClose={() => setShowHelp(false)} />}
      <WelcomeTour role="trainer" />

      {user?.invite_code && (
        <div className="invite-card">
          <div>
            <div className="invite-lbl">Código de convite — compartilhe com seus alunos para vincularem a você:</div>
            <div className="invite-code">{user.invite_code}</div>
          </div>
          <button className="btn-mini" onClick={() => { try { navigator.clipboard.writeText(user.invite_code); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ } }}>
            {copied ? '✓ Copiado' : 'Copiar'}
          </button>
        </div>
      )}

      <ConnectPayout />

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

      {fichaStudent && (
        <StudentFicha
          student={fichaStudent}
          onClose={() => setFichaStudent(null)}
          onSaved={() => { loadStudents(); }}
        />
      )}

      {editWorkoutId && (
        <WorkoutEditor
          workoutId={editWorkoutId}
          onClose={() => setEditWorkoutId(null)}
          onSaved={() => loadWorkouts(selectedStudent?.id)}
        />
      )}

      {showCustomEx && <CustomExLibrary onClose={() => setShowCustomEx(false)} />}

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
          <div className="sub">Cadastre alunos e acompanhe a evolução — ilimitado e gratuito</div>

          <AddStudent onAdded={() => loadStudents()} setError={setError} />
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
                    <button className="btn-ghost" onClick={() => setEditWorkoutId(w.id)}>Editar</button>
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

// Conectar recebimento: cria a subconta Asaas do personal (walletId) p/ receber
// a mensalidade direto via split. Só aparece quando o pagamento (Asaas) está ativo.
function ConnectPayout() {
  const [info, setInfo] = useState(null);     // { connected, walletId } | null
  const [paymentOn, setPaymentOn] = useState(false);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [f, setF] = useState({ cpfCnpj: '', mobilePhone: '', incomeValue: '', postalCode: '', address: '', addressNumber: '', province: '', companyType: '' });

  async function load() {
    try {
      const p = await api.getPlan();
      setInfo({ connected: !!p.connected, walletId: p.walletId || null });
      setPaymentOn(!!p.paymentActive);
    } catch { /* */ }
  }
  useEffect(() => { load(); }, []);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const payload = { ...f };
      if (!payload.companyType) delete payload.companyType;
      const r = await api.connectAsaas(payload);
      setInfo({ connected: true, walletId: r.walletId }); setOpen(false);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  }

  if (!info) return null;
  // Em modo teste (sem Asaas), não mostra o card — só quando o pagamento está ativo.
  if (!info.connected && !paymentOn) return null;

  if (info.connected) {
    return (
      <div className="invite-card" style={{ borderColor: 'rgba(46,204,113,.4)' }}>
        <div>
          <div className="invite-lbl">💰 Recebimento conectado</div>
          <div className="dim" style={{ fontSize: 12 }}>A mensalidade dos seus alunos cai direto na sua carteira.</div>
        </div>
        <span className="btn-mini" style={{ pointerEvents: 'none' }}>✓ Ativo</span>
      </div>
    );
  }

  if (!open) {
    return (
      <div className="invite-card">
        <div>
          <div className="invite-lbl">💰 Conectar recebimento</div>
          <div className="dim" style={{ fontSize: 12 }}>Receba a mensalidade dos alunos direto na sua conta. (Pagamento real)</div>
        </div>
        <button className="btn-mini" onClick={() => setOpen(true)}>Conectar</button>
      </div>
    );
  }

  return (
    <form className="inline-form" onSubmit={submit} style={{ marginTop: 8 }}>
      <div className="invite-lbl" style={{ marginBottom: 4 }}>Dados para receber (Asaas)</div>
      {error && <div className="alert">{error}</div>}
      <input placeholder="CPF ou CNPJ (só números)" value={f.cpfCnpj} onChange={(e) => setF({ ...f, cpfCnpj: e.target.value })} required />
      <input placeholder="Celular com DDD" value={f.mobilePhone} onChange={(e) => setF({ ...f, mobilePhone: e.target.value })} required />
      <input inputMode="decimal" placeholder="Faturamento/renda mensal (R$)" value={f.incomeValue} onChange={(e) => setF({ ...f, incomeValue: e.target.value })} required />
      <input placeholder="CEP" value={f.postalCode} onChange={(e) => setF({ ...f, postalCode: e.target.value })} required />
      <input placeholder="Endereço (rua)" value={f.address} onChange={(e) => setF({ ...f, address: e.target.value })} required />
      <input placeholder="Número" value={f.addressNumber} onChange={(e) => setF({ ...f, addressNumber: e.target.value })} required />
      <input placeholder="Bairro" value={f.province} onChange={(e) => setF({ ...f, province: e.target.value })} required />
      <input placeholder="Tipo empresa (CNPJ): MEI / LIMITED / INDIVIDUAL (deixe vazio se CPF)" value={f.companyType} onChange={(e) => setF({ ...f, companyType: e.target.value })} />
      <div className="row">
        <button className="btn-sm" disabled={busy}>{busy ? 'Conectando...' : 'Conectar recebimento'}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  );
}

function AddStudent({ onAdded, setError }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', monthly_fee: '' });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.createStudent(form);
      setForm({ name: '', email: '', password: '', monthly_fee: '' });
      setOpen(false); onAdded();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  const fee = Number(form.monthly_fee) || 0;

  if (!open) return <button className="btn-sm" style={{ marginTop: 12 }} onClick={() => setOpen(true)}>+ Cadastrar aluno</button>;

  return (
    <form className="inline-form" onSubmit={submit}>
      <input placeholder="Nome do aluno" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      <input type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
      <input type="password" placeholder="Senha (o aluno usa para entrar)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={4} />
      <input inputMode="decimal" placeholder="Mensalidade que você recebe (R$)" value={form.monthly_fee} onChange={(e) => setForm({ ...form, monthly_fee: e.target.value })} />
      {fee > 0 && (
        <div className="muted" style={{ fontSize: 12, marginTop: -2 }}>
          O aluno paga <b>R$ {(fee + 20).toFixed(2).replace('.', ',')}</b> · você recebe <b>R$ {fee.toFixed(2).replace('.', ',')}</b> · taxa da plataforma R$ 20,00
        </div>
      )}
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
