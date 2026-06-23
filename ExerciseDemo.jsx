import { useEffect, useState } from 'react';

// Mídia principal: anima a execução em loop usando as 2 fotos reais (leve, sem áudio).
// Loop mais lento/fluido. Toque abre em TELA CHEIA com play/pause e controle de velocidade.
// Fallback robusto: se uma imagem falha usa a outra; sem ambas, mostra placeholder.
const BASE_MS = 850; // tempo por quadro em 1x (mais lento que antes)

export default function ExerciseDemo({ img1, img2, label, zoomable = false }) {
  const [frame, setFrame] = useState(0);
  const [bad, setBad] = useState({});
  const [open, setOpen] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [mult, setMult] = useState(1); // 1x, 0.75x, 0.5x (menor = mais lento)

  const frames = [img1, img2].filter((u) => u && !bad[u]);
  const animated = frames.length >= 2;

  useEffect(() => {
    if (!animated || !playing) return;
    const ms = BASE_MS / mult; // mult menor -> intervalo maior -> mais lento
    const t = setInterval(() => setFrame((f) => (f + 1) % 2), ms);
    return () => clearInterval(t);
  }, [animated, playing, mult]);

  // trava o scroll do fundo enquanto em tela cheia
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  if (frames.length === 0) {
    return (
      <div className="demo demo-empty">
        <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6.5 6.5l11 11" /><path d="M21 21l-1-1" /><path d="M3 3l1 1" />
          <rect x="2" y="8" width="4" height="8" rx="1" transform="rotate(-45 4 12)" />
          <rect x="18" y="8" width="4" height="8" rx="1" transform="rotate(-45 20 12)" />
        </svg>
      </div>
    );
  }

  const src = frames[frame % frames.length];

  return (
    <>
      <div className={`demo ${zoomable ? 'demo-zoom' : ''}`} onClick={zoomable ? () => setOpen(true) : undefined}>
        <img src={src} alt={label || 'execução do exercício'} loading="lazy" onError={() => setBad((b) => ({ ...b, [src]: true }))} />
        {animated && <span className="loop-badge">LOOP</span>}
        {label && <span className="tagpos">{label}</span>}
        {zoomable && <span className="demo-expand" aria-hidden>⛶</span>}
      </div>

      {open && (
        <div className="demo-fs" onClick={() => setOpen(false)}>
          <button className="demo-fs-x" onClick={() => setOpen(false)} aria-label="Sair da tela cheia">✕</button>
          <img className="demo-fs-img" src={src} alt={label || 'execução do exercício'} onClick={(e) => e.stopPropagation()} />
          <div className="demo-fs-bar" onClick={(e) => e.stopPropagation()}>
            <button className="demo-fs-play" onClick={() => setPlaying((p) => !p)}>{playing ? '⏸' : '▶'}</button>
            <div className="demo-fs-speeds">
              {[[1, '1x'], [0.75, '0.75x'], [0.5, '0.5x']].map(([v, l]) => (
                <button key={l} className={`spd ${mult === v ? 'on' : ''}`} onClick={() => setMult(v)}>{l}</button>
              ))}
            </div>
          </div>
          <div className="demo-fs-hint">Gire o celular para ver em paisagem 🔄</div>
        </div>
      )}
    </>
  );
}
