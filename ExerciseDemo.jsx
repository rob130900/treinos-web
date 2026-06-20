import { useEffect, useState } from 'react';

// Mídia principal: anima a execução em loop (ida/volta) usando as 2 fotos reais.
// Leve (apenas <img>), funciona em qualquer celular, sem áudio/narração.
// Fallback robusto: se uma imagem falha, usa a outra; se faltam ambas, mostra placeholder limpo.
export default function ExerciseDemo({ img1, img2, label, speed = 700 }) {
  const [frame, setFrame] = useState(0);
  const [bad, setBad] = useState({});

  const frames = [img1, img2].filter((u) => u && !bad[u]);
  const animated = frames.length >= 2;

  useEffect(() => {
    if (!animated) return;
    const t = setInterval(() => setFrame((f) => (f + 1) % 2), speed);
    return () => clearInterval(t);
  }, [animated, speed]);

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
    <div className="demo">
      <img
        src={src}
        alt={label || 'execução do exercício'}
        loading="lazy"
        onError={() => setBad((b) => ({ ...b, [src]: true }))}
      />
      {animated && <span className="loop-badge">LOOP</span>}
      {label && <span className="tagpos">{label}</span>}
    </div>
  );
}
