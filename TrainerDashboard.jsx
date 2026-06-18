import { useEffect, useState } from 'react';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

export default function TrainerDashboard() {
  const { user, logout } = useAuth();
  const [students, setStudents] = useState([]);
  const [workouts, setWorkouts] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [error, setError] = useState('');

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

  return (
    <div className="layout">
      <header className="topbar">
        <div><strong>Painel do Personal</strong><span className="muted"> — {user.name}</span></div>
        <button className="btn-ghost" onClick={logout}>Sair</button>
      </header>
      {error && <div className="alert">{error}</div>}
      <div className="grid">
        <section className="card">
          <h2>Meus Alunos</h2>
          <AddStudent onAdded={loadStudents} setError={setError} />
          <div className="list">
            <button className={`student-item ${!selectedStudent ? 'active' : ''}`} onClick={() => selectStudent(null)}>
              Todos os treinos
            </button>
            {students.map((s) => (
              <button key={s.id} className={`student-item ${selectedStudent?.id === s.id ? 'active' : ''}`} onClick={() => selectStudent(s)}>
                <div>{s.name}</div>
                <small className="muted">{s.completed_workouts}/{s.total_workouts} treinos concluidos</small>
              </button>
            ))}
            {students.length === 0 && <p className="muted">Nenhum aluno ainda.</p>}
          </div>
        </section>
        <section className="card">
          <h2>{selectedStudent ? `Treinos de ${selectedStudent.name}` : 'Todos os treinos'}</h2>
          {selectedStudent
            ? <NewWorkout student={selectedStudent} onCreated={() => loadWorkouts(selectedStudent.id)} setError={setError} />
            : <p className="muted">Selecione um aluno a esquerda para criar um treino.</p>}
          <div className="list">
            {workouts.map((w) => (
              <div key={w.id} className="workout-item">
                <div>
                  <strong>{w.title}</strong>
                  {w.student_name && <span className="muted"> — {w.student_name}</span>}
                  <div className="muted">
                    {w.scheduled_date ? new Date(w.scheduled_date).toLocaleDateString('pt-BR') : 'Sem data'}
                    {' · '}{w.completed ? '✅ Concluido' : '⏳ Pendente'}
                  </div>
                </div>
                <button className="btn-ghost danger" onClick={async () => {
                  if (!confirm('Excluir este treino?')) return;
                  await api.deleteWorkout(w.id);
                  loadWorkouts(selectedStudent?.id);
                }}>Excluir</button>
              </div>
            ))}
            {workouts.length === 0 && <p className="muted">Nenhum treino ainda.</p>}
          </div>
        </section>
      </div>
    </div>
  );
}

function AddStudent({ onAdded, setError }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.createStudent(form);
      setForm({ name: '', email: '', password: '' });
      setOpen(false); onAdded();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  if (!open) return <button className="btn-sm" onClick={() => setOpen(true)}>+ Cadastrar aluno</button>;

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
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [exercises, setExercises] = useState([{ name: '', sets: '', reps: '', weight: '' }]);
  const [loading, setLoading] = useState(false);

  function updateEx(i, field, value) { setExercises((arr) => arr.map((e, idx) => (idx === i ? { ...e, [field]: value } : e))); }
  function addEx() { setExercises((arr) => [...arr, { name: '', sets: '', reps: '', weight: '' }]); }
  function removeEx(i) { setExercises((arr) => arr.filter((_, idx) => idx !== i)); }

  async function submit(e) {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      await api.createWorkout({
        student_id: student.id, title, description, scheduled_date: date || null,
        exercises: exercises.filter((ex) => ex.name.trim()).map((ex) => ({
          name: ex.name, sets: ex.sets ? Number(ex.sets) : null, reps: ex.reps || null, weight: ex.weight || null,
        })),
      });
      setTitle(''); setDescription(''); setDate('');
      setExercises([{ name: '', sets: '', reps: '', weight: '' }]);
      setOpen(false); onCreated();
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  }

  if (!open) return <button className="btn-sm" onClick={() => setOpen(true)}>+ Novo treino</button>;

  return (
    <form className="inline-form" onSubmit={submit}>
      <input placeholder="Titulo (ex: Treino A - Peito e Triceps)" value={title} onChange={(e) => setTitle(e.target.value)} required />
      <textarea placeholder="Observacoes (opcional)" value={description} onChange={(e) => setDescription(e.target.value)} />
      <label className="muted">Data (opcional)</label>
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
      <div className="muted" style={{ marginTop: 8 }}>Exercicios:</div>
      {exercises.map((ex, i) => (
        <div className="ex-row" key={i}>
          <input placeholder="Exercicio" value={ex.name} onChange={(e) => updateEx(i, 'name', e.target.value)} />
          <input placeholder="Series" value={ex.sets} style={{ width: 70 }} onChange={(e) => updateEx(i, 'sets', e.target.value)} />
          <input placeholder="Reps" value={ex.reps} style={{ width: 80 }} onChange={(e) => updateEx(i, 'reps', e.target.value)} />
          <input placeholder="Carga" value={ex.weight} style={{ width: 80 }} onChange={(e) => updateEx(i, 'weight', e.target.value)} />
          {exercises.length > 1 && <button type="button" className="btn-ghost danger" onClick={() => removeEx(i)}>×</button>}
        </div>
      ))}
      <button type="button" className="btn-ghost" onClick={addEx}>+ Adicionar exercicio</button>
      <div className="row">
        <button className="btn-sm" disabled={loading}>{loading ? 'Salvando...' : 'Criar treino'}</button>
        <button type="button" className="btn-ghost" onClick={() => setOpen(false)}>Cancelar</button>
      </div>
    </form>
  );
}
