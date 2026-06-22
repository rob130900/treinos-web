import { useState } from 'react';
import { api } from './api.js';

function brl(v) { return Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }

export default function TrainerPlans({ planInfo, onClose, onUpgraded }) {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const current = planInfo?.current;

  async function choose(key) {
    if (key === current) return;
    setBusy(key); setError('');
    try {
      const r = await api.upgradePlan(key);
      onUpgraded && onUpgraded(r);
      onClose();
    } catch (e) { setError(e.message); } finally { setBusy(''); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2 style={{ fontSize: 18 }}>Planos</h2><button className="close-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error && <div className="alert">{error}</div>}
          {planInfo?.isTrial && (
            <div className="trial-banner">
              🎁 Você está no <b>plano gratuito</b> (até 3 alunos)
              {planInfo.daysLeft != null && <> — <b>{planInfo.daysLeft}</b> {planInfo.daysLeft === 1 ? 'dia restante' : 'dias restantes'}</>}.
              Assine um plano para desbloquear mais alunos.
            </div>
          )}
          <p className="muted" style={{ marginBottom: 14, fontSize: 13 }}>
            Escolha o plano ideal para o tamanho da sua operação. O upgrade libera o novo limite na hora e mantém todos os alunos já cadastrados.
          </p>
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
                  <button className={`btn ${featured ? '' : 'btn-outline'}`} disabled={isCur || !!busy} onClick={() => choose(p.key)}>
                    {isCur ? '✓ Plano atual' : (busy === p.key ? 'Mudando...' : 'Escolher este')}
                  </button>
                </div>
              );
            })}
          </div>
          <p className="muted" style={{ marginTop: 12, fontSize: 11, textAlign: 'center' }}>
            O pagamento do plano (via Asaas) será ativado em breve.
          </p>
        </div>
      </div>
    </div>
  );
}
