// Selo de verificação do profissional (Personal Verificado / Profissional Registrado / Estudante).
export default function Badge({ label }) {
  if (!label) return null;
  const verified = label === 'Personal Verificado';
  return (
    <span
      title={label}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700,
        padding: '2px 8px', borderRadius: 20, marginLeft: 6, verticalAlign: 'middle', whiteSpace: 'nowrap',
        background: verified ? 'rgba(46,204,113,.15)' : 'rgba(255,106,26,.15)',
        color: verified ? '#2ecc71' : 'var(--orange)',
        border: `1px solid ${verified ? 'rgba(46,204,113,.4)' : 'rgba(255,106,26,.4)'}`,
      }}
    >
      {verified ? '✔' : '★'} {label}
    </span>
  );
}
