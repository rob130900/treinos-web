import { useMemo, useState } from 'react';
import { EXERCISES, GROUPS, VIDEOS } from './exerciseLibrary.js';
import ExerciseDemo from './ExerciseDemo.jsx';

export default function ExercisePicker({ onClose, onConfirm }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('todos');
  const [picked, setPicked] = useState({}); // id -> {ex, sets, reps, weight}

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return EXERCISES.filter((e) => {
      if (group !== 'todos' && e.group !== group) return false;
      if (term && !e.name.toLowerCase().includes(term)) return false;
      return true;
    });
  }, [q, group]);

  function toggle(ex) {
    setPicked((p) => {
      const next = { ...p };
      if (next[ex.id]) delete next[ex.id];
      else next[ex.id] = { ex, sets: '3', reps: '12', weight: '', rest: '60' };
      return next;
    });
  }
  function upd(id, field, value) {
    setPicked((p) => ({ ...p, [id]: { ...p[id], [field]: value } }));
  }

  function confirm() {
    const groupLabel = (k) => GROUPS.find((g) => g.key === k)?.label || '';
    const list = Object.values(picked).map(({ ex, sets, reps, weight, rest }) => ({
      name: ex.name,
      muscle_group: groupLabel(ex.group),
      image_url: ex.images?.[0] || null,
      image_url2: ex.images?.[1] || null,
      video_id: VIDEOS[ex.id] || null,
      instructions: (ex.instructions || []).join('\n') || null,
      sets: sets ? Number(sets) : null,
      reps: reps || null,
      weight: weight || null,
      rest_seconds: rest ? Number(rest) : 60,
    }));
    onConfirm(list);
  }

  const pickedArr = Object.values(picked);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 style={{ fontSize: 18 }}>Biblioteca de exercícios</h2>
            <div className="dim" style={{ fontSize: 12 }}>{EXERCISES.length} exercícios · toque para adicionar</div>
          </div>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tools">
          <input placeholder="Buscar exercício..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips">
            <button className={`chip ${group === 'todos' ? 'active' : ''}`} onClick={() => setGroup('todos')}>Todos</button>
            {GROUPS.map((g) => (
              <button key={g.key} className={`chip ${group === g.key ? 'active' : ''}`} onClick={() => setGroup(g.key)}>{g.label}</button>
            ))}
          </div>
        </div>

        <div className="modal-body">
          {pickedArr.length > 0 && (
            <div style={{ marginBottom: 18 }}>
              <div className="section-title">Selecionados ({pickedArr.length}) — defina séries/reps/carga</div>
              {pickedArr.map(({ ex, sets, reps, weight, rest }) => (
                <div className="picked" key={ex.id}>
                  <div className="thumb"><img src={ex.images?.[0]} alt={ex.name} loading="lazy" /></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.name}</div>
                    <div className="ex-row" style={{ marginTop: 6 }}>
                      <input className="mini" placeholder="Séries" value={sets} onChange={(e) => upd(ex.id, 'sets', e.target.value)} />
                      <input className="mini" placeholder="Reps" value={reps} onChange={(e) => upd(ex.id, 'reps', e.target.value)} />
                      <input className="mini" placeholder="Carga" value={weight} onChange={(e) => upd(ex.id, 'weight', e.target.value)} />
                      <input className="mini" placeholder="Desc.(s)" value={rest} onChange={(e) => upd(ex.id, 'rest', e.target.value)} />
                    </div>
                  </div>
                  <button className="btn-ghost danger" onClick={() => toggle(ex)}>✕</button>
                </div>
              ))}
            </div>
          )}

          <div className="ex-grid">
            {filtered.map((ex) => {
              const sel = !!picked[ex.id];
              return (
                <div key={ex.id} className="ex-card" onClick={() => toggle(ex)}
                  style={sel ? { borderColor: 'var(--orange)', boxShadow: '0 0 0 1px var(--orange) inset' } : null}>
                  <ExerciseDemo img1={ex.images?.[0]} img2={ex.images?.[1]} />

                  <div className="body">
                    <div className="nm">{ex.name}</div>
                    <div className="mg">{GROUPS.find((g) => g.key === ex.group)?.label}{sel ? ' · ✓ adicionado' : ''}</div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && <p className="muted">Nenhum exercício encontrado.</p>}
          </div>
        </div>

        <div className="count-bar">
          <span className="muted">{pickedArr.length} selecionado(s)</span>
          <div className="row">
            <button className="btn-ghost" onClick={onClose}>Cancelar</button>
            <button className="btn-sm" disabled={pickedArr.length === 0} onClick={confirm}>Adicionar ao treino</button>
          </div>
        </div>
      </div>
    </div>
  );
}
