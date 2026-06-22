import { useEffect, useState } from 'react';
import { api } from './api.js';

function brl(v) { return Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }); }
function fmtD(d) { return d ? new Date(d + 'T00:00:00').toLocaleDateString('pt-BR') : '—'; }
const today = () => new Date().toISOString().slice(0, 10);

export default function TrainerFinance({ students, onClose, onChange }) {
  const [sum, setSum] = useState(null);
  const [pays, setPays] = useState([]);
  const [form, setForm] = useState({ student_id: '', amount: '', due_date: '', method: '', paid: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    try {
      const [s, p] = await Promise.all([api.paymentsSummary(), api.listPayments()]);
      setSum(s); setPays(p.payments);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!form.student_id || !form.amount) return;
    setSaving(true);
    try {
      await api.addPayment({
        student_id: Number(form.student_id), amount: form.amount,
        due_date: form.due_date || null, method: form.method || null,
        paid_on: form.paid ? today() : null,
      });
      setForm({ student_id: '', amount: '', due_date: '', method: '', paid: false });
      await load(); onChange && onChange();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }
  async function pay(id) { try { await api.markPaid(id); await load(); onChange && onChange(); } catch (e) { setError(e.message); } }
  async function del(id) { try { await api.deletePayment(id); await load(); onChange && onChange(); } catch (e) { setError(e.message); } }

  function statusOf(p) {
    if (p.paid_on) return 'pago';
    if (p.due_date && p.due_date < today()) return 'vencido';
    return 'pendente';
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2 style={{ fontSize: 18 }}>💰 Financeiro</h2><button className="close-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error && <div className="alert">{error}</div>}

          {sum && (
            <div className="fin-cards">
              <div className="fin-card ok"><div className="fin-num">{brl(sum.faturadoMes)}</div><div className="fin-lbl">Faturado no mês</div></div>
              <div className="fin-card"><div className="fin-num">{brl(sum.aReceber)}</div><div className="fin-lbl">A receber</div></div>
              <div className="fin-card danger"><div className="fin-num">{brl(sum.vencidoTotal)}</div><div className="fin-lbl">Vencido ({sum.vencidos.length})</div></div>
            </div>
          )}

          <div className="fin-add">
            <div className="section-title">Registrar pagamento</div>
            <select value={form.student_id} onChange={(e) => setForm({ ...form, student_id: e.target.value })}>
              <option value="">Selecione o aluno...</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <div className="ex-row" style={{ marginTop: 8 }}>
              <input className="mini" placeholder="Valor (R$)" inputMode="decimal" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              <input className="mini" type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              <input className="mini" placeholder="Forma" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })} />
            </div>
            <label className="fin-check"><input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} /> Já está pago</label>
            <button className="btn-sm" disabled={saving || !form.student_id || !form.amount} onClick={add}>{saving ? 'Salvando...' : '+ Adicionar'}</button>
          </div>

          <div className="section-title" style={{ marginTop: 16 }}>Histórico de pagamentos</div>
          {pays.length === 0 ? <p className="muted">Nenhum pagamento registrado.</p> : (
            <div className="fin-list">
              {pays.map((p) => {
                const st = statusOf(p);
                return (
                  <div className="fin-row" key={p.id}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700 }}>{p.student_name}</div>
                      <div className="muted" style={{ fontSize: 12 }}>Venc.: {fmtD(p.due_date)}{p.paid_on ? ` · pago ${fmtD(p.paid_on)}` : ''}{p.method ? ` · ${p.method}` : ''}</div>
                    </div>
                    <div className="fin-amt">{brl(p.amount)}</div>
                    <span className={`fin-badge ${st}`}>{st}</span>
                    {!p.paid_on && <button className="btn-ghost" onClick={() => pay(p.id)}>Baixar</button>}
                    <button className="evo-del" onClick={() => del(p.id)}>✕</button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
