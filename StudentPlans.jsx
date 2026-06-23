import { useState } from 'react';
import { api } from './api.js';

function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

// Planos do aluno. paywall=true -> tela cheia obrigatória (acesso bloqueado).
export default function StudentPlans({ planInfo, onClose, onChange, paywall, onLogout }) {
  const [step, setStep] = useState('list'); // list | pay | redirect
  const [sel, setSel] = useState(null);
  const [cpf, setCpf] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [invoiceUrl, setInvoiceUrl] = useState(null);

  function pick(p) { setSel(p); setError(''); setStep('pay'); }

  async function subscribe() {
    setBusy(true); setError('');
    try {
      const r = await api.checkoutPlan({ plan: sel.key, cpfCnpj: cpf.replace(/\D/g, '') });
      if (r.mode === 'test') {
        // Modo teste (sem Asaas): libera na hora
        onChange && onChange();
        if (!paywall && onClose) onClose();
        else setStep('list');
        setBusy(false);
        return;
      }
      // Asaas: redireciona para a página de pagamento segura
      setInvoiceUrl(r.invoiceUrl || null);
      setStep('redirect');
      if (r.invoiceUrl) setTimeout(() => { window.location.href = r.invoiceUrl; }, 1500);
    } catch (e) { setError(e.message); setBusy(false); }
  }

  const inner = (
    <div className="modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-head">
        <h2 style={{ fontSize: 18 }}>{step === 'list' ? 'Escolha seu plano' : step === 'pay' ? 'Assinatura' : 'Redirecionando...'}</h2>
        {!paywall && step !== 'redirect' && <button className="close-x" onClick={onClose}>✕</button>}
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
                    <button className={`btn ${featured ? '' : 'btn-outline'}`} onClick={() => pick(p)}>Assinar agora</button>
                  </div>
                );
              })}
            </div>
            <p className="muted" style={{ fontSize: 11.5, textAlign: 'center', marginTop: 12 }}>
              Pagamento seguro via Asaas — PIX, cartão ou boleto.
            </p>
            {paywall && onLogout && (
              <button className="btn-ghost" style={{ marginTop: 12, width: '100%' }} onClick={onLogout}>Sair</button>
            )}
          </>
        )}

        {step === 'pay' && sel && (
          <>
            <div className="pay-summary">
              <div><b>Plano {sel.name}</b> · {brl(sel.price)}</div>
              <div className="muted" style={{ fontSize: 12 }}>{sel.days} dias de acesso completo</div>
            </div>
            <div className="fb-label">CPF ou CNPJ</div>
            <input placeholder="Somente números" value={cpf} onChange={(e) => setCpf(e.target.value)} inputMode="numeric" />
            <p className="muted" style={{ fontSize: 12.5, marginTop: 12 }}>
              Você será direcionado para finalizar sua assinatura com segurança (PIX, cartão ou boleto).
            </p>
            <button className="btn" style={{ marginTop: 14 }} disabled={busy || !cpf.trim()} onClick={subscribe}>
              {busy ? 'Gerando...' : 'Assinar agora'}
            </button>
            <button className="btn-ghost" style={{ marginTop: 8, width: '100%' }} onClick={() => setStep('list')}>Voltar</button>
          </>
        )}

        {step === 'redirect' && (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🔒</div>
            <p style={{ fontWeight: 700, fontSize: 15 }}>Você será direcionado para finalizar sua assinatura com segurança.</p>
            <p className="muted" style={{ fontSize: 13, marginTop: 8 }}>
              Pague com PIX, cartão ou boleto na página do Asaas. Após o pagamento, seu acesso é liberado automaticamente.
            </p>
            {invoiceUrl
              ? <a className="btn" style={{ marginTop: 16, display: 'block', textDecoration: 'none' }} href={invoiceUrl}>Ir para o pagamento agora</a>
              : <p className="muted" style={{ marginTop: 14 }}>Não foi possível gerar o link. Tente novamente.</p>}
          </div>
        )}
      </div>
    </div>
  );

  if (paywall) return <div className="paywall-overlay">{inner}</div>;
  return <div className="modal-bg" onClick={onClose}>{inner}</div>;
}
