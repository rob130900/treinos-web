import { useEffect, useState } from 'react';

// Anima a execucao do exercicio alternando as 2 fotos reais (inicio/fim do movimento)
export default function ExerciseDemo({ img1, img2, label }) {
  const [frame, setFrame] = useState(0);
  const hasTwo = img1 && img2;

  useEffect(() => {
    if (!hasTwo) return;
    const t = setInterval(() => setFrame((f) => (f === 0 ? 1 : 0)), 850);
    return () => clearInterval(t);
  }, [hasTwo]);

  const src = frame === 0 ? img1 : img2 || img1;
  if (!img1) {
    return (
      <div className="demo" style={{ background: 'var(--card2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <span className="dim" style={{ fontSize: 12 }}>sem imagem</span>
      </div>
    );
  }
  return (
    <div className="demo">
      <img src={src} alt={label || 'exercicio'} loading="lazy" />
      {label && <span className="tagpos">{label}</span>}
    </div>
  );
}
