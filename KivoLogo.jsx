// Logo oficial do KIVO: marca (seta dupla = "evolua") + wordmark.
// Versão pra fundo escuro do app (seta laranja, sem o selo preto).
// Props: size (px do ícone), stack (vertical, p/ login), tag (mostra o lema).
export default function KivoLogo({ size = 28, stack = false, tag = false }) {
  const mark = (
    <svg width={size} height={size} viewBox="0 0 132 132" aria-hidden="true" style={{ flexShrink: 0 }}>
      <polyline points="30,96 66,60 102,96" fill="none" stroke="#FF6A1A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="30,72 66,36 102,72" fill="none" stroke="#FF6A1A" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const words = (
    <span style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1, alignItems: stack ? 'center' : 'flex-start' }}>
      <span className="kivo" style={{ fontSize: Math.round(size * 0.82) }}>KI<span className="v">V</span>O</span>
      {tag && <span className="kivo-tag" style={{ marginTop: 6 }}>Treine. <b>Evolua.</b> Repita.</span>}
    </span>
  );
  return (
    <span style={{ display: 'inline-flex', flexDirection: stack ? 'column' : 'row', alignItems: 'center', gap: stack ? 10 : 8 }}>
      {mark}
      {words}
    </span>
  );
}
