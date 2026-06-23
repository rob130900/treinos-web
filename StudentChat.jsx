import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';
import { videoFileToDataUrl } from './mediaUtils.js';
import { IcoSend } from './Icons.jsx';

function fmtTime(d) {
  return new Date(d).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

export default function StudentChat() {
  const [msgs, setMsgs] = useState(null);
  const [hasTrainer, setHasTrainer] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const endRef = useRef(null);
  const recRef = useRef(null);
  const galRef = useRef(null);

  async function load() {
    try {
      const d = await api.thread();
      setMsgs(d.messages);
      setHasTrainer(d.hasTrainer !== false);
    } catch (e) { setError(e.message); }
  }

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [msgs]);

  async function send() {
    if (!text.trim() || sending) return;
    setSending(true);
    try { await api.sendMessage({ body: text.trim() }); setText(''); await load(); }
    catch (e) { setError(e.message); } finally { setSending(false); }
  }

  async function sendVideo(file) {
    setError('');
    setSending(true);
    try {
      const media_data = await videoFileToDataUrl(file);
      await api.sendMessage({ body: '', media_type: 'video', media_data });
      await load();
    } catch (e) { setError(e.message); } finally { setSending(false); }
  }

  if (error && !msgs) return <div className="alert">{error}</div>;
  if (!msgs) return <div className="skeleton-hero" />;

  return (
    <div className="chat">
      <h1 className="page-title">Dúvidas</h1>
      <p className="muted" style={{ marginTop: -2, marginBottom: 8, fontSize: 13 }}>Tire dúvidas com seu personal — texto e vídeo da execução.</p>
      {!hasTrainer && <div className="alert">Você ainda não tem um personal vinculado.</div>}
      {error && <div className="alert">{error}</div>}

      <div className="chat-body">
        {msgs.length === 0 && <p className="muted" style={{ textAlign: 'center', marginTop: 30 }}>Nenhuma mensagem ainda. Mande a primeira! 👋</p>}
        {msgs.map((m) => (
          <div key={m.id} className={`bubble ${m.sender_role === 'student' ? 'mine' : 'theirs'}`}>
            {m.kind === 'duvida' && m.exercise_name && <div className="bubble-tag">Dúvida · {m.exercise_name}</div>}
            {m.kind === 'feedback' && <div className="bubble-tag fb">Feedback do personal</div>}
            {m.media_type === 'video' && m.media_data && <video className="bubble-video" controls preload="metadata" src={m.media_data} />}
            {m.body && <div className="bubble-body">{m.body}</div>}
            <div className="bubble-time">{fmtTime(m.created_at)}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <input ref={recRef} type="file" accept="video/*" capture="environment" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && sendVideo(e.target.files[0])} />
        <input ref={galRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={(e) => e.target.files[0] && sendVideo(e.target.files[0])} />
        <button className="chat-attach" disabled={sending} onClick={() => recRef.current?.click()} title="Gravar vídeo">🎥</button>
        <button className="chat-attach" disabled={sending} onClick={() => galRef.current?.click()} title="Enviar vídeo da galeria">📎</button>
        <textarea
          placeholder={sending ? 'Enviando...' : 'Escreva uma mensagem...'}
          value={text}
          rows={1}
          disabled={sending}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
        />
        <button className="chat-send" disabled={sending || !text.trim()} onClick={send}><IcoSend width={18} height={18} /></button>
      </div>
    </div>
  );
}
