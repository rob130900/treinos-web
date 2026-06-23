import { useEffect, useState } from 'react';
import { api } from './api.js';
import ExercisePicker from './ExercisePicker.jsx';
import { exerciseDisplayName } from './exerciseI18n.js';

// Editor completo de um treino existente (personal).
export default function WorkoutEditor({ workoutId, onClose, onSaved }) {
  const [w, setW] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [exs, setExs] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getWorkout(workoutId).then((d) => {
      const wk = d.workout;
      setW(wk);
      setTitle(wk.title || '');
      setDescription(wk.description || '');
      setDate(wk.scheduled_date ? String(wk.scheduled_date).slice(0, 10) : '');
      setExs(wk.exercises || []);
    }).catch((e) => setError(e.message));
  }, [workoutId]);

  function upd(i, f, v) { setExs((a) => a.map((e, idx) => (idx === i ? { ...e, [f]: v } : e))); }
  function rm(i) { setExs((a) => a.filter((_, idx) => idx !== i)); }
  function move(i, dir) {
    setExs((a) => { const j = i + dir; if (j < 0 || j >= a.length) return a; const b = [...a]; [b[i], b[j]] = [b[j], b[i]]; return b; });
  }
  function addFromLibrary(list) { setExs((cur) => [...cur, ...list]); setShowPicker(false); }

  async function save() {
    if (!title.trim()) { setError('Título é obrigatório.'); return; }
    setLoading(true); setError('');
    try {
      await api.updateWorkout(workoutId, {
        title, description, scheduled_date: date || null,
        exercises: exs.map((e) => ({ ...e, sets: e.sets ? Number(e.sets) : null })),
      });
      onSaved && onSaved();
      onClose();
    } catch (e) { setError(e.message); } finally { setLoading(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      {showPicker && <ExercisePicker onClose={() => setShowPicker(false)} onConfirm={addFromLibrary} />}
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2 style={{ fontSize: 18 }}>Editar treino</h2><button className="close-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error && <div className="alert">{error}</div>}
          {!w ? <div className="skeleton-hero" /> : (
            <>
              <label>Título</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} />
              <label>Observações do treino</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
              <label>Data (opcional)</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />

              <div className="section-title" style={{ marginTop: 16 }}>Exercícios ({exs.length})</div>
              <button type="button" className="btn-outline" onClick={() => setShowPicker(true)}>+ Adicionar da biblioteca</button>

              {exs.map((ex, i) => (
                <div className="edit-ex" key={i}>
                  <div className="edit-ex-top">
                    <div className="reorder">
                      <button type="button" onClick={() => move(i, -1)} disabled={i === 0}>▲</button>
                      <button type="button" onClick={() => move(i, 1)} disabled={i === exs.length - 1}>▼</button>
                    </div>
                    {ex.image_url && <div className="thumb"><img src={ex.image_url} alt="" loading="lazy" /></div>}
                    <div style={{ flex: 1, minWidth: 0, fontWeight: 700, fontSize: 13 }}>{exerciseDisplayName(ex.name)}</div>
                    <button type="button" className="btn-ghost danger" onClick={() => rm(i)}>✕</button>
                  </div>
                  <div className="ex-row" style={{ marginTop: 6 }}>
                    <input className="mini" placeholder="Séries" value={ex.sets || ''} onChange={(e) => upd(i, 'sets', e.target.value)} />
                    <input className="mini" placeholder="Reps" value={ex.reps || ''} onChange={(e) => upd(i, 'reps', e.target.value)} />
                    <input className="mini" placeholder="Carga" value={ex.weight || ''} onChange={(e) => upd(i, 'weight', e.target.value)} />
                    <input className="mini" placeholder="Desc.(s)" value={ex.rest_seconds || ''} onChange={(e) => upd(i, 'rest_seconds', e.target.value)} />
                  </div>
                  <input className="mini" style={{ width: '100%', marginTop: 6 }} placeholder="Observação do exercício (opcional)" value={ex.notes || ''} onChange={(e) => upd(i, 'notes', e.target.value)} />
                </div>
              ))}
              {exs.length === 0 && <p className="muted" style={{ marginTop: 8 }}>Sem exercícios. Adicione da biblioteca.</p>}

              <button className="btn" style={{ marginTop: 16 }} disabled={loading} onClick={save}>{loading ? 'Salvando...' : 'Atualizar treino'}</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
