import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
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
  const endRef = useRef(null);

  async function loadConvos() { try { const d = await api.conversations(); setConvos(d.conversations); } catch { /* */ } }
  async function loadThread(sid) { try { const d = await api.thread(sid); setMsgs(d.messages); } catch { /* */ } }

  useEffect(() => { loadConvos(); const t = setInterval(loadConvos, 10000); return () => clearInterval(t); }, []);
  useEffect(() => {
    if (!sel) return;
    loadThread(sel);
    const t = setInterval(() => loadThread(sel), 7000);
    return () => clearInterval(t);
  }, [sel]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function send() {
    if (!text.trim() || sending || !sel) return;
    setSending(true);
    try {
      await api.sendMessage({ student_id: sel, body: text.trim(), kind: asFeedback ? 'feedback' : 'chat' });
      setText('');
      await loadThread(sel);
      await loadConvos();
    } catch { /* */ } finally { setSending(false); }
  }

  const selName = convos.find((c) => c.student_id === sel)?.student_name;
  const shown = filter === 'all' ? msgs : msgs.filter((m) => m.kind === filter);

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal msg-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: 18 }}>Central de mensagens</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
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
                  <div className="muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.last_body || '—'}</div>
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
                <div className="chat-body" style={{ padding: '10px 12px', flex: 1 }}>
                  {shown.length === 0 && <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>Nenhuma mensagem nesse filtro.</p>}
                  {shown.map((m) => (
                    <div key={m.id} className={`bubble ${m.sender_role === 'trainer' ? 'mine' : 'theirs'}`}>
                      {m.kind === 'duvida' && m.exercise_name && <div className="bubble-tag">Dúvida · {m.exercise_name}</div>}
                      {m.kind === 'feedback' && <div className="bubble-tag fb">Feedback</div>}
                      <div className="bubble-body">{m.body}</div>
                      <div className="bubble-time">{fmtTime(m.created_at)}</div>
                    </div>
                  ))}
                  <div ref={endRef} />
                </div>
                <div className="msg-compose">
                  <button className={`mini-toggle ${asFeedback ? 'on' : ''}`} onClick={() => setAsFeedback((v) => !v)}>★ Enviar como feedback</button>
                  <div className="chat-input" style={{ borderTop: 'none', paddingTop: 6 }}>
                    <textarea placeholder={asFeedback ? 'Escreva um feedback...' : 'Responder ao aluno...'} rows={1} value={text}
                      onChange={(e) => setText(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }} />
                    <button className="chat-send" disabled={sending || !text.trim()} onClick={send}><IcoSend width={18} height={18} /></button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
