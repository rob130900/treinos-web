import { useState } from 'react';
import { api } from './api.js';

function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtD(d) { return d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'; }

export default function TrainerPlans({ planInfo, onClose, onUpgraded }) {
  const [step, setStep] = useState('list'); // list | pay | done
  const [sel, setSel] = useState(null);
  const [billing, setBilling] = useState('PIX');
  const [cpf, setCpf] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  const current = planInfo?.current;
  const status = planInfo?.planStatus;

  function pick(p) { setSel(p); setError(''); setStep('pay'); }

  async function generate() {
    setBusy(true); setError('');
    try {
      const r = await api.checkoutPlan({ plan: sel.key, billingType: billing, cpfCnpj: cpf.replace(/\D/g, '') });
      if (r.mode === 'test') { onUpgraded && onUpgraded(r); onClose(); return; }
      setResult(r); setStep('done');
    } catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  async function cancel() {
    if (!confirm('Cancelar a assinatura e voltar ao plano gratuito?')) return;
    setBusy(true);
    try { await api.cancelPlan(); onUpgraded && onUpgraded({ current: 'trial' }); onClose(); }
    catch (e) { setError(e.message); } finally { setBusy(false); }
  }

  function copyPix() {
    try { navigator.clipboard.writeText(result.pix.payload); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* */ }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: 18 }}>{step === 'list' ? 'Planos' : step === 'pay' ? 'Pagamento' : 'Quase lá!'}</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          {error && <div className="alert">{error}</div>}

          {step === 'list' && (
            <>
              {planInfo?.isTrial && (
                <div className="trial-banner">
                  🎁 Você está no <b>plano gratuito</b> (até 3 alunos)
                  {planInfo.daysLeft != null && <> — <b>{planInfo.daysLeft}</b> {planInfo.daysLeft === 1 ? 'dia restante' : 'dias restantes'}</>}.
                  Após esse período, será necessário realizar o pagamento para continuar.
                </div>
              )}
              {status === 'pending' && (
                <div className="trial-banner" style={{ borderColor: 'rgba(255,170,0,.5)' }}>
                  ⏳ Pagamento pendente. Assim que confirmado, seu plano ativa automaticamente.
                  {planInfo.paymentLink && <> <a href={planInfo.paymentLink} target="_blank" rel="noreferrer">Abrir pagamento</a></>}
                </div>
              )}
              <div className="plan-grid">
                {planInfo?.plans?.map((p) => {
                  const isCur = p.key === current;
                  const featured = p.key === 'intermediario';
                  return (
                    <div key={p.key} className={`plan-card ${featured ? 'featured' : ''} ${isCur ? 'current' : ''}`}>
                      {p.badge && <span className="plan-badge">{p.badge}</span>}
                      <div className="plan-name">{p.name}</div>
                      <div className="plan-price">{brl(p.price)}<small>/mês</small></div>
                      <div className="plan-limit">{p.limit == null ? '∞ Alunos ilimitados' : `Até ${p.limit} alunos`}</div>
                      <div className="plan-desc">{p.desc}</div>
                      {p.key === 'premium' && <div className="plan-extra">🚀 Sem limite de crescimento</div>}
                      <button className={`btn ${featured ? '' : 'btn-outline'}`} disabled={isCur} onClick={() => pick(p)}>
                        {isCur ? '✓ Plano atual' : 'Assinar'}
                      </button>
                    </div>
                  );
                })}
              </div>
              {(status === 'pending' || status === 'active') && (
                <button className="btn-ghost danger" style={{ marginTop: 14 }} disabled={busy} onClick={cancel}>Cancelar assinatura</button>
              )}
            </>
          )}

          {step === 'pay' && sel && (
            <>
              <div className="pay-summary">
                <div><b>{sel.name}</b> · {brl(sel.price)}/mês</div>
                <div className="muted" style={{ fontSize: 12 }}>{sel.limit == null ? 'Alunos ilimitados' : `Até ${sel.limit} alunos`}</div>
              </div>
              <div className="fb-label">CPF ou CNPJ</div>
              <input placeholder="Somente números" value={cpf} onChange={(e) => setCpf(e.target.value)} inputMode="numeric" />
              <div className="fb-label">Forma de pagamento</div>
              <div className="row" style={{ gap: 8, flexWrap: 'wrap' }}>
                {[['PIX', 'PIX'], ['BOLETO', 'Boleto'], ['CREDIT_CARD', 'Cartão']].map(([k, l]) => (
                  <button key={k} className={`fb-opt ${billing === k ? 'on' : ''}`} onClick={() => setBilling(k)}>{l}</button>
                ))}
              </div>
              <button className="btn" style={{ marginTop: 16 }} disabled={busy || !cpf.trim()} onClick={generate}>
                {busy ? 'Gerando...' : 'Gerar pagamento'}
              </button>
              <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setStep('list')}>Voltar</button>
            </>
          )}

          {step === 'done' && result && (
            <>
              <div className="pay-summary">
                <div><b>{sel.name}</b> · {brl(result.value)}</div>
                <div className="muted" style={{ fontSize: 12 }}>Vencimento: {fmtD(result.dueDate)}</div>
              </div>

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

              <p className="muted" style={{ fontSize: 12.5, marginTop: 14, textAlign: 'center' }}>
                Após o pagamento, seu plano é <b>ativado automaticamente</b>. Você pode fechar esta janela.
              </p>
              <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={onClose}>Fechar</button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
