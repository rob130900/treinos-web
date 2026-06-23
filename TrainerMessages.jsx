import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { videoFileToDataUrl } from './mediaUtils.js';
import { IcoSend } from './Icons.jsx';

function fmtTime(d) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function TrainerMessages({ initialStudentId, onClose }) {
  const [convos, setConvos] = useState([]);
  const [sel, setSel] = useState(initialStudentId || null);
  const [msgs, setMsgs] = useState([]);
  const [filter, setFilter] = useState('all');
  const [text, setText] = useState('');
  const [asFeedback, setAsFeedback] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [showLib, setShowLib] = useState(false);
  const [models, setModels] = useState([]);
  const [toast, setToast] = useState('');
  const endRef = useRef(null);
  const recRef = useRef(null);
  const galRef = useRef(null);

  async function loadConvos() { try { const d = await api.conversations(); setConvos(d.conversations); } catch { /* */ } }
  async function loadThread(sid) { try { const d = await api.thread(sid); setMsgs(d.messages); } catch { /* */ } }
  async function loadModels() { try { const d = await api.listModels(); setModels(d.models || []); } catch { /* */ } }

  useEffect(() => { loadConvos(); const t = setInterval(loadConvos, 10000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!sel) return;
    loadThread(sel);
    const t = setInterval(() => loadThread(sel), 7000);
    return () => clearInterval(t);
  }, [sel]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  function flash(msg) { setToast(msg); setTimeout(() => setToast(''), 2000); }

  async function send() {
    if (!text.trim() || sending || !sel) return;
    setSending(true);
    try {
      await api.sendMessage({ student_id: sel, body: text.trim(), kind: asFeedback ? 'feedback' : 'chat' });
      setText(''); await loadThread(sel); await loadConvos();
    } catch (e) { setError(e.message); } finally { setSending(false); }
  }

  async function sendVideo(file) {
    if (!sel) return;
    setError(''); setSending(true);
    try {
      const media_data = await videoFileToDataUrl(file);
      await api.sendMessage({ student_id: sel, body: '', media_type: 'video', media_data, kind: 'feedback' });
      await loadThread(sel); await loadConvos();
    } catch (e) { setError(e.message); } finally { setSending(false); }
  }

  async function saveAsModel(m) {
    try {
      await api.saveModel({ exercise_name: m.exercise_name || null, label: m.exercise_name || 'Correção', media_data: m.media_data });
      flash('Salvo na biblioteca de modelos ✓');
    } catch (e) { setError(e.message); }
  }

  async function sendModel(model) {
    if (!sel) return;
    setSending(true);
    try {
      await api.sendMessage({ student_id: sel, body: model.label ? `Modelo: ${model.label}` : '', media_type: 'video', media_data: model.media_data, kind: 'feedback' });
      setShowLib(false); await loadThread(sel);
    } catch (e) { setError(e.message); } finally { setSending(false); }
  }

  async function delModel(id) { try { await api.deleteModel(id); await loadModels(); } catch { /* */ } }

  const selName = convos.find((c) => c.student_id === sel)?.student_name;
  const shown = filter === 'all' ? msgs : msgs.filter((m) => m.kind === filter);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal msg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: 18 }}>Central de mensagens</h2>
          <div className="row" style={{ gap: 8 }}>
            <button className="btn-ghost" onClick={() => { setShowLib(true); loadModels(); }}>📚 Modelos</button>
            <button className="close-x" onClick={onClose}>✕</button>
          </div>
        </div>
        {toast && <div className="link-ok" style={{ margin: '0 0 0 0', borderRadius: 0 }}>{toast}</div>}
        <div className="msg-layout">
          <div className="msg-list">
            {convos.length === 0 && <p className="muted" style={{ padding: 14, fontSize: 13 }}>Sem conversas ainda.</p>}
            {convos.map((c) => (
              <button key={c.student_id} className={`msg-conv ${sel === c.student_id ? 'active' : ''}`} onClick={() => setSel(c.student_id)}>
                <div className="avatar">{c.student_name.charAt(0).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div className="spread">
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{c.student_name}</div>
                    {Number(c.unread) > 0 && <span className="conv-badge">{c.unread}</span>}
                  </div>
                  <div className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_body || '🎥 vídeo'}</div>
                </div>
              </button>
            ))}
          </div>

          <div className="msg-thread">
            {!sel ? (
              <div className="muted" style={{ padding: 30, textAlign: 'center' }}>Selecione um aluno à esquerda.</div>
            ) : (
              <>
                <div className="msg-thread-head">
                  <strong style={{ fontSize: 15 }}>{selName}</strong>
                  <div className="chips" style={{ marginTop: 8 }}>
                    {[['all', 'Todas'], ['duvida', 'Dúvidas'], ['feedback', 'Feedback']].map(([k, l]) => (
                      <button key={k} className={`chip ${filter === k ? 'active' : ''}`} onClick={() => setFilter(k)}>{l}</button>
                    ))}
                  </div>
                </div>
                {error && <div className="alert" style={{ margin: '8px 12px' }}>{error}</div>}
                <div className="chat-body" style={{ padding: '10px 12px', flex: 1 }}>
                  {shown.map((m) => (
                    <div key={m.id} className={`bubble ${m.sender_role === 'trainer' ? 'mine' : 'theirs'}`}>
                      {m.kind === 'duvida' && m.exercise_name && <div className="bubble-tag">Dúvida · {m.exercise_name}</div>}
                      {m.kind === 'feedback' && <div className="bubble-tag fb">Feedback</div>}
                      {m.media_type === 'video' && m.media_data && (
                        <>
                          <video className="bubble-video" controls preload="metadata" src={m.media_data} />
                          <button className="save-model" onClick={() => saveAsModel(m)}>★ Salvar como modelo</button>
                        </>
                      )}
                      {m.body && <div className="bubble-body">{m.body}</div>}
                      <div className="bubble-time">{fmtTime(m.created_at)}</div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="msg-compose">
                  <div className="row" style={{ gap: 8, marginBottom: 6 }}>
                    <button className={`mini-toggle ${asFeedback ? 'on' : ''}`} onClick={() => setAsFeedback((v) => !v)}>★ Feedback</button>
                    <input ref={recRef} type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && sendVideo(e.target.files[0])} />
                    <input ref={galRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && sendVideo(e.target.files[0])} />
                    <button className="mini-toggle" disabled={sending} onClick={() => recRef.current?.click()}>🎥 Gravar</button>
                    <button className="mini-toggle" disabled={sending} onClick={() => galRef.current?.click()}>📎 Vídeo</button>
                  </div>
                  <div className="chat-input" style={{ borderTop: 'none', paddingTop: 0 }}>
                    <textarea placeholder={sending ? 'Enviando...' : 'Responder ao aluno...'} rows={1} value={text} disabled={sending}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                    <button className="chat-send" disabled={sending || !text.trim()} onClick={send}><IcoSend width={18} height={18} /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {showLib && (
          <div className="modal-bg" onClick={() => setShowLib(false)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-head"><h2 style={{ fontSize: 17 }}>Biblioteca de modelos</h2><button className="close-x" onClick={() => setShowLib(false)}>✕</button></div>
              <div className="modal-body">
                {models.length === 0 ? <p className="muted">Nenhum vídeo modelo salvo ainda. Salve um vídeo de correção pela conversa.</p> : (
                  <div className="model-grid">
                    {models.map((mo) => (
                      <div className="model-card" key={mo.id}>
                        <video className="bubble-video" controls preload="metadata" src={mo.media_data} />
                        <div className="model-lbl">{mo.label || mo.exercise_name || 'Correção'}</div>
                        <div className="row" style={{ gap: 6 }}>
                          <button className="btn-sm" disabled={!sel || sending} onClick={() => sendModel(mo)}>Enviar</button>
                          <button className="btn-ghost danger" onClick={() => delModel(mo.id)}>Excluir</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {!sel && <p className="muted" style={{ fontSize: 12, marginTop: 10 }}>Selecione um aluno na conversa para poder enviar um modelo.</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
