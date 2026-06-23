import { useEffect, useMemo, useState } from 'react';
import { EXERCISES, GROUPS, VIDEOS } from './exerciseLibrary.js';
import ExerciseDemo from './ExerciseDemo.jsx';
import { exerciseDisplayName } from './exerciseI18n.js';
import { api } from './api.js';
import CustomExerciseForm from './CustomExerciseForm.jsx';

export default function ExercisePicker({ onClose, onConfirm }) {
  const [q, setQ] = useState('');
  const [group, setGroup] = useState('todos');
  const [picked, setPicked] = useState({});
  const [customList, setCustomList] = useState([]);
  const [showCreate, setShowCreate] = useState(false);

  async function loadCustom() { try { setCustomList((await api.listCustomEx()).exercises || []); } catch { /* */ } }
  useEffect(() => { loadCustom(); }, []);

  // exercícios personalizados normalizados para o mesmo formato
  const customItems = useMemo(() => customList.map((c) => ({
    id: 'custom_' + c.id, name: c.name, muscle_group: c.muscle_group || '',
    instructions: c.description || '', notes: c.notes || '', video_data: c.video_data || null,
    custom: true, images: [],
  })), [customList]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (group === 'meus') {
      return customItems.filter((e) => !term || e.name.toLowerCase().includes(term));
    }
    return EXERCISES.filter((e) => {
      if (group !== 'todos' && e.group !== group) return false;
      if (term && !e.name.toLowerCase().includes(term) && !exerciseDisplayName(e.name).toLowerCase().includes(term)) return false;
      return true;
    });
  }, [q, group, customItems]);

  function toggle(ex) {
    setPicked((p) => {
      const next = { ...p };
      if (next[ex.id]) delete next[ex.id];
      else next[ex.id] = { ex, sets: '3', reps: '12', weight: '', rest: '60' };
      return next;
    });
  }
  function upd(id, field, value) { setPicked((p) => ({ ...p, [id]: { ...p[id], [field]: value } })); }

  function confirm() {
    const groupLabel = (k) => GROUPS.find((g) => g.key === k)?.label || '';
    const list = Object.values(picked).map(({ ex, sets, reps, weight, rest }) => {
      const base = { sets: sets ? Number(sets) : null, reps: reps || null, weight: weight || null, rest_seconds: rest ? Number(rest) : 60 };
      if (ex.custom) {
        return { ...base, name: ex.name, muscle_group: ex.muscle_group || null, image_url: null, image_url2: null, video_id: null, video_data: ex.video_data || null, instructions: ex.instructions || null, notes: ex.notes || null };
      }
      return { ...base, name: ex.name, muscle_group: groupLabel(ex.group), image_url: ex.images?.[0] || null, image_url2: ex.images?.[1] || null, video_id: VIDEOS[ex.id] || null, instructions: (ex.instructions || []).join('\n') || null };
    });
    onConfirm(list);
  }

  function onCreated(saved) {
    loadCustom();
    const item = { id: 'custom_' + saved.id, name: saved.name, muscle_group: saved.muscle_group || '', instructions: saved.description || '', notes: saved.notes || '', video_data: saved.video_data || null, custom: true, images: [] };
    setPicked((p) => ({ ...p, [item.id]: { ex: item, sets: '3', reps: '12', weight: '', rest: '60' } }));
    setGroup('meus'); setShowCreate(false);
  }

  const pickedArr = Object.values(picked);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <div>
            <h2 style={{ fontSize: 18 }}>Exercícios</h2>
            <div className="dim" style={{ fontSize: 12 }}>{EXERCISES.length} na biblioteca + os seus · toque para adicionar</div>
          </div>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>

        <div className="modal-tools">
          <input placeholder="Buscar exercício..." value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="chips">
            <button className={`chip ${group === 'todos' ? 'active' : ''}`} onClick={() => setGroup('todos')}>Todos</button>
            <button className={`chip ${group === 'meus' ? 'active' : ''}`} onClick={() => setGroup('meus')}>⭐ Meus</button>
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
                  <div className="thumb">
                    {ex.custom ? (ex.video_data ? <video src={ex.video_data} preload="metadata" /> : <span>🎬</span>) : <img src={ex.images?.[0]} alt={ex.name} loading="lazy" />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{ex.custom ? ex.name : exerciseDisplayName(ex.name)}</div>
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

          {group === 'meus' && (
            <button className="btn-outline" style={{ marginBottom: 12 }} onClick={() => setShowCreate(true)}>+ Criar exercício personalizado</button>
          )}

          <div className="ex-grid">
            {filtered.map((ex) => {
              const sel = !!picked[ex.id];
              return (
                <div key={ex.id} className="ex-card" onClick={() => toggle(ex)}
                  style={sel ? { borderColor: 'var(--orange)', boxShadow: '0 0 0 1px var(--orange) inset' } : null}>
                  {ex.custom
                    ? (ex.video_data ? <div className="demo"><video src={ex.video_data} preload="metadata" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></div> : <div className="demo demo-empty">🎬</div>)
                    : <ExerciseDemo img1={ex.images?.[0]} img2={ex.images?.[1]} />}
                  <div className="body">
                    <div className="nm">{ex.custom ? ex.name : exerciseDisplayName(ex.name)}</div>
                    <div className="mg">{ex.custom ? (ex.muscle_group || 'Personalizado') : GROUPS.find((g) => g.key === ex.group)?.label}{sel ? ' · ✓ adicionado' : ''}</div>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && group === 'meus' && <p className="muted">Você ainda não criou exercícios. Toque em "+ Criar exercício personalizado".</p>}
            {filtered.length === 0 && group !== 'meus' && <p className="muted">Nenhum exercício encontrado.</p>}
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

      {showCreate && <CustomExerciseForm onClose={() => setShowCreate(false)} onSaved={onCreated} />}
    </div>
  );
}
