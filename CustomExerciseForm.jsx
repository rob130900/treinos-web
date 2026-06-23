import { useRef, useState } from 'react';
import { api } from './api.js';
import { videoFileToDataUrl } from './mediaUtils.js';

// Formulário de exercício personalizado (criar/editar) com vídeo próprio.
export default function CustomExerciseForm({ initial, onClose, onSaved }) {
  const [name, setName] = useState(initial?.name || '');
  const [description, setDescription] = useState(initial?.description || '');
  const [muscle, setMuscle] = useState(initial?.muscle_group || '');
  const [notes, setNotes] = useState(initial?.notes || '');
  const [video, setVideo] = useState(initial?.video_data || null);
  const [videoChanged, setVideoChanged] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const recRef = useRef(null);
  const galRef = useRef(null);

  async function pickVideo(file) {
    setError('');
    try { const d = await videoFileToDataUrl(file); setVideo(d); setVideoChanged(true); }
    catch (e) { setError(e.message); }
  }

  async function save() {
    if (!name.trim()) { setError('Nome do exercício é obrigatório.'); return; }
    setBusy(true); setError('');
    try {
      const payload = {
        name, description, muscle_group: muscle, notes,
        video_data: videoChanged ? video : (initial ? null : video),
      };
      const r = initial ? await api.updateCustomEx(initial.id, payload) : await api.createCustomEx(payload);
      onSaved && onSaved(r.exercise);
      onClose();
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2 style={{ fontSize: 18 }}>{initial ? 'Editar exercício' : 'Novo exercício personalizado'}</h2><button className="close-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error && <div className="alert">{error}</div>}
          <label>Nome do exercício *</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Agachamento búlgaro" />
          <label>Descrição (como executar)</label>
          <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Explique a execução passo a passo" />
          <label>Grupo muscular (opcional)</label>
          <input value={muscle} onChange={(e) => setMuscle(e.target.value)} placeholder="Ex: Pernas" />
          <label>Observações (opcional)</label>
          <textarea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />

          <label>Vídeo de demonstração</label>
          {video && <video className="bubble-video" style={{ maxWidth: '100%' }} controls src={video} />}
          <input ref={recRef} type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && pickVideo(e.target.files[0])} />
          <input ref={galRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && pickVideo(e.target.files[0])} />
          <div className="row" style={{ gap: 8, marginTop: 6 }}>
            <button type="button" className="btn-outline" onClick={() => recRef.current?.click()}>🎥 Gravar</button>
            <button type="button" className="btn-outline" onClick={() => galRef.current?.click()}>📎 Galeria</button>
          </div>

          <button className="btn" style={{ marginTop: 16 }} disabled={busy} onClick={save}>{busy ? 'Salvando...' : (initial ? 'Salvar alterações' : 'Criar exercício')}</button>
        </div>
      </div>
    </div>
  );
}
