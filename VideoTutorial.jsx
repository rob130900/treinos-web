// Vídeo tutorial embutido no app (slideshow animado, sem YouTube).
// Roda dentro da tela de Ajuda, para Personal e Aluno.
import { useEffect, useRef, useState } from 'react';

const SLIDES = [
  { e: '▶️', t: 'Bem-vindo ao KIVO', x: 'O app que conecta personal e aluno num só lugar.' },
  { e: '🤝', t: 'Um app, dois lados', x: 'O personal cria e acompanha; o aluno treina.' },
  { e: '🔗', t: 'Código de convite', x: 'O personal copia o código e envia ao aluno para vincular.' },
  { e: '🏋️', t: 'Monte o treino', x: 'Biblioteca com mais de 800 exercícios, com animação.' },
  { e: '📲', t: 'É só tocar e treinar', x: 'O aluno abre e toca no cartão laranja “Próximo treino”.' },
  { e: '⏱️', t: 'Treino guiado', x: 'Animação, cronômetro de descanso e “Concluir exercício”.' },
  { e: '📈', t: 'Acompanhe a evolução', x: 'Peso, medidas, fotos e o gráfico de progresso.' },
  { e: '💬', t: 'Tire dúvidas', x: 'Fale com o personal por texto ou vídeo.' },
  { e: '🔥', t: 'Treine. Evolua. Repita.', x: 'Personal monta, aluno treina, os dois evoluem juntos.' },
];
const DUR = 3400; // ms por slide

export default function VideoTutorial() {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [done, setDone] = useState(false);
  const [prog, setProg] = useState(0); // 0..1 do slide atual
  const elapsed = useRef(0);

  useEffect(() => {
    if (!playing || done) return undefined;
    let last = performance.now();
    const id = setInterval(() => {
      const now = performance.now();
      elapsed.current += now - last; last = now;
      const p = elapsed.current / DUR;
      if (p >= 1) {
        if (i < SLIDES.length - 1) { elapsed.current = 0; setProg(0); setI(i + 1); }
        else { setProg(1); setDone(true); setPlaying(false); }
      } else setProg(p);
    }, 50);
    return () => clearInterval(id);
  }, [i, playing, done]);

  function toggle() { if (!done) setPlaying((p) => !p); }
  function replay() { elapsed.current = 0; setProg(0); setI(0); setDone(false); setPlaying(true); }

  const overall = done ? 1 : (i + prog) / SLIDES.length;
  const s = SLIDES[i];

  return (
    <div style={wrap}>
      <style>{`@keyframes kvfade{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}`}</style>

      {/* logo canto */}
      <div style={brand}>
        <svg viewBox="0 0 132 132" width="18" height="18" style={{ display: 'block' }}>
          <polyline points="30,92 66,60 102,92" fill="none" stroke="#FF6A1A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="30,66 66,34 102,66" fill="none" stroke="#FF6A1A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ fontWeight: 800, fontSize: 13, letterSpacing: .5 }}>KI<span style={{ color: 'var(--orange)' }}>V</span>O</span>
      </div>

      {/* slide */}
      <div key={i} style={slide}>
        <div style={{ fontSize: 46, lineHeight: 1 }}>{s.e}</div>
        <div style={{ fontSize: 19, fontWeight: 800, marginTop: 8 }}>{s.t}</div>
        <div style={{ fontSize: 13.5, color: '#b9bbc2', marginTop: 6, maxWidth: 320 }}>{s.x}</div>
      </div>

      {/* replay */}
      {done && (
        <button onClick={replay} style={replayBtn}>↻ Assistir de novo</button>
      )}

      {/* controles */}
      <div style={ctrls}>
        <button onClick={toggle} style={ctrlBtn} aria-label="play/pause">{done ? '↻' : (playing ? '⏸' : '▶')}</button>
        <div style={track}><div style={{ ...trackFill, width: `${overall * 100}%` }} /></div>
        <span style={{ fontSize: 11, color: '#cfd0d4', minWidth: 34, textAlign: 'right' }}>{i + 1}/{SLIDES.length}</span>
      </div>
    </div>
  );
}

const wrap = { position: 'relative', width: '100%', height: 230, background: 'linear-gradient(160deg,#141416,#0b0b0d)', borderRadius: 12, overflow: 'hidden', marginBottom: 16, border: '1px solid rgba(255,255,255,.08)' };
const brand = { position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 6, opacity: .9, zIndex: 2 };
const slide = { position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '30px 20px 46px', animation: 'kvfade .5s ease' };
const ctrls = { position: 'absolute', left: 0, right: 0, bottom: 0, height: 40, display: 'flex', alignItems: 'center', gap: 10, padding: '0 12px', background: 'linear-gradient(0deg,rgba(0,0,0,.65),transparent)' };
const ctrlBtn = { background: 'transparent', border: 0, color: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1 };
const track = { flex: 1, height: 5, background: 'rgba(255,255,255,.22)', borderRadius: 5, overflow: 'hidden' };
const trackFill = { height: '100%', background: 'var(--orange)', transition: 'width .1s linear' };
const replayBtn = { position: 'absolute', inset: 0, margin: 'auto', width: 180, height: 44, background: 'var(--orange)', color: '#fff', border: 0, borderRadius: 12, fontSize: 15, fontWeight: 700, cursor: 'pointer', zIndex: 3 };
