import { useEffect, useRef, useState } from 'react';

// Player do vídeo personalizado do personal: loop, velocidade ajustável e tela cheia (controles nativos).
export default function VideoDemo({ src, label }) {
  const ref = useRef(null);
  const [mult, setMult] = useState(0.85); // começa um pouco mais lento

  useEffect(() => { if (ref.current) ref.current.playbackRate = mult; }, [mult, src]);

  return (
    <div className="vdemo">
      <video
        ref={ref}
        src={src}
        loop
        autoPlay
        muted
        playsInline
        controls
        aria-label={label || 'execução do exercício'}
        onLoadedMetadata={(e) => { e.currentTarget.playbackRate = mult; }}
      />
      <div className="vdemo-speeds">
        {[[1, '1x'], [0.85, '0.85x'], [0.5, '0.5x']].map(([v, l]) => (
          <button key={l} className={`spd ${mult === v ? 'on' : ''}`} onClick={() => setMult(v)}>{l}</button>
        ))}
      </div>
    </div>
  );
}
