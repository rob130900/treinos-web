import { useEffect, useState } from 'react';
import { api } from './api.js';
import CustomExerciseForm from './CustomExerciseForm.jsx';

// Biblioteca própria de exercícios personalizados do personal (ver/criar/editar/excluir).
export default function CustomExLibrary({ onClose }) {
  const [list, setList] = useState(null);
  const [editing, setEditing] = useState(null); // 'new' | exercise object

  async function load() { try { setList((await api.listCustomEx()).exercises); } catch { setList([]); } }
  useEffect(() => { load(); }, []);
  async function del(id) { if (!confirm('Excluir este exercício?')) return; try { await api.deleteCustomEx(id); load(); } catch { /* */ } }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2 style={{ fontSize: 18 }}>Meus exercícios</h2><button className="close-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div className="sub" style={{ marginBottom: 10 }}>Seus exercícios personalizados ficam disponíveis para usar em qualquer aluno.</div>
          <button className="btn-sm" onClick={() => setEditing('new')}>+ Novo exercício personalizado</button>
          {!list ? <div className="skeleton-hero" style={{ marginTop: 12 }} /> : list.length === 0 ? (
            <p className="muted" style={{ marginTop: 14 }}>Você ainda não criou exercícios. Crie um com seu próprio vídeo.</p>
          ) : (
            <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {list.map((ex) => (
                <div className="edit-ex" key={ex.id}>
                  <div className="edit-ex-top">
                    {ex.video_data ? <video className="bubble-video" style={{ maxWidth: 90 }} src={ex.video_data} preload="metadata" /> : <div className="thumb" />}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{ex.name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>{ex.muscle_group || 'Sem grupo'}</div>
                    </div>
                    <button className="btn-ghost" onClick={() => setEditing(ex)}>Editar</button>
                    <button className="btn-ghost danger" onClick={() => del(ex.id)}>✕</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {editing && <CustomExerciseForm initial={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load(); }} />}
    </div>
  );
}
