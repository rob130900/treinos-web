import { useState } from 'react';
import { api } from './api.js';

function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtD(d) { return d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'; }

// Planos do aluno. paywall=true -> tela cheia obrigatória (acesso bloqueado).
export default function StudentPlans({ planInfo, onClose, onChange, paywall, onLogout }) {
  const [step, setStep] = useState('list');
  const [sel, setSel] = useState(null);
  const [billing, setBilling] = useState('PIX');
  const [cpf, setCpf] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  function pick(p) { setSel(p); setError(''); setStep('pay'); }

  async function generate() {
    setBusy(true); setError('');
    try {
      const r = await api.checkoutPlan({ plan: sel.key, billingType: billing, cpfCnpj: cpf.replace(/\D/g, '') });
      if (r.mode === 'test') { onChange && onChange(); if (!paywall && onClose) onClose(); return; }
      setResult(r); setStep('done');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  function copyPix() {
    try { navigator.clipboard.writeText(result.pix.payload); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  }

  const inner = (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-head">
        <h2 style={{ fontSize: 18 }}>{step === 'list' ? 'Escolha seu plano' : step === 'pay' ? 'Pagamento' : 'Quase lá!'}</h2>
        {!paywall && <button className="close-x" onClick={onClose}>✕</button>}
      </div>
      <div className="modal-body">
        {error && <div className="alert">{error}</div>}

        {step === 'list' && (
          <>
            {paywall ? (
              <div className="trial-banner" style={{ borderColor: 'rgba(255,77,79,.45)' }}>
                🔒 Seu período de teste terminou. Assine um plano para continuar treinando. Seus dados estão salvos.
              </div>
            ) : planInfo?.isTrial && (
              <div className="trial-banner">
                🎁 Você tem <b>{planInfo.daysLeft}</b> {planInfo.daysLeft === 1 ? 'dia' : 'dias'} de teste grátis. Assine para não perder o acesso.
              </div>
            )}
            <div className="plan-grid">
              {planInfo?.plans?.map((p) => {
                const featured = p.key === 'trimestral';
                return (
                  <div key={p.key} className={`plan-card ${featured ? 'featured' : ''}`}>
                    {p.badge && <span className="plan-badge">{p.badge}</span>}
                    <div className="plan-name">{p.name}</div>
                    <div className="plan-price">{brl(p.price)}</div>
                    <div className="plan-limit">{p.days} dias de acesso</div>
                    <div className="plan-desc">{p.desc}</div>
                    <button className={`btn ${featured ? '' : 'btn-outline'}`} onClick={() => pick(p)}>Assinar</button>
                  </div>
                );
              })}
            </div>
            {paywall && onLogout && (
              <button className="btn-ghost" style={{ marginTop: 14, width: '100%' }} onClick={onLogout}>Sair</button>
            )}
          </>
        )}

        {step === 'pay' && sel && (
          <>
            <div className="pay-summary"><div><b>{sel.name}</b> · {brl(sel.price)}</div><div className="muted" style={{ fontSize: 12 }}>{sel.days} dias de acesso</div></div>
            <div className="fb-label">CPF ou CNPJ</div>
            <input placeholder="Somente números" value={cpf} onChange={(e) => setCpf(e.target.value)} inputMode="numeric" />
            <div className="fb-label">Forma de pagamento</div>
            <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
              {[['PIX', 'PIX'], ['BOLETO', 'Boleto'], ['CREDIT_CARD', 'Cartão']].map(([k, l]) => (
                <button key={k} className={`fb-opt ${billing === k ? 'on' : ''}`} onClick={() => setBilling(k)}>{l}</button>
              ))}
            </div>
            <button className="btn" style={{ marginTop: 16 }} disabled={busy || !cpf.trim()} onClick={generate}>{busy ? 'Gerando...' : 'Gerar pagamento'}</button>
            <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setStep('list')}>Voltar</button>
          </>
        )}

        {step === 'done' && result && (
          <>
            <div className="pay-summary"><div><b>{sel.name}</b> · {brl(result.value)}</div><div className="muted" style={{ fontSize: 12 }}>Vencimento: {fmtD(result.dueDate)}</div></div>
            {result.pix?.payload && (
              <div className="pix-box">
                {result.pix.encodedImage && <img src={`data:image/png;base64,${result.pix.encodedImage}`} alt="PIX QR" className="pix-qr" />}
                <div className="fb-label">PIX copia e cola</div>
                <div className="pix-code">{result.pix.payload}</div>
                <button className="btn-sm" onClick={copyPix}>{copied ? '✓ Copiado!' : 'Copiar código PIX'}</button>
              </div>
            )}
            {result.invoiceUrl && (
              <a className="btn" style={{ marginTop: 12, display: 'block', textAlign: 'center', textDecoration: 'none' }} href={result.invoiceUrl} target="_blank" rel="noreferrer">
                Abrir página de pagamento (PIX, boleto ou cartão)
              </a>
            )}
            <p className="muted" style={{ fontSize: 12.5, marginTop: 14, textAlign: 'center' }}>Após o pagamento, seu acesso é liberado automaticamente.</p>
            <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => { onChange && onChange(); if (onClose) onClose(); }}>Já paguei / Fechar</button>
          </>
        )}
      </div>
    </div>
  );

  if (paywall) return <div className="paywall-overlay">{inner}</div>;
  return <div className="modal-bg" onClick={onClose}>{inner}</div>;
}
