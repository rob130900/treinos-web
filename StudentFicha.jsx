import { useState } from 'react';
import { api } from './api.js';

const STATUS = [['ativo', 'Ativo'], ['inativo', 'Inativo'], ['inadimplente', 'Inadimplente']];

export default function StudentFicha({ student, onClose, onSaved }) {
  const [f, setF] = useState({
    status: student.status || 'ativo',
    phone: student.phone || '',
    birth_date: student.birth_date ? String(student.birth_date).slice(0, 10) : '',
    goal: student.goal || '',
    monthly_fee: student.monthly_fee || '',
    student_notes: student.student_notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    try { await api.updateStudent(student.id, f); onSaved && onSaved(); onClose(); }
    catch (e) { setError(e.message); } finally { setSaving(false); }
  }

  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head"><h2 style={{ fontSize: 18 }}>Ficha · {student.name}</h2><button className="close-x" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {error && <div className="alert">{error}</div>}
          <div className="fb-label">Status do aluno</div>
          <div className="row" style={{ gap: 8 }}>
            {STATUS.map(([k, l]) => <button key={k} className={`fb-opt ${f.status === k ? 'on' : ''}`} onClick={() => setF({ ...f, status: k })}>{l}</button>)}
          </div>
          <label className="evo-field" style={{ marginTop: 14 }}><span>Telefone / WhatsApp</span><input value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} /></label>
          <div className="evo-grid">
            <label className="evo-field"><span>Nascimento</span><input type="date" value={f.birth_date} onChange={(e) => setF({ ...f, birth_date: e.target.value })} /></label>
            <label className="evo-field"><span>Mensalidade (R$)</span><input inputMode="decimal" value={f.monthly_fee} onChange={(e) => setF({ ...f, monthly_fee: e.target.value })} /></label>
          </div>
          {Number(f.monthly_fee) > 0 && (
            <div className="muted" style={{ fontSize: 12, marginTop: 4 }}>
              O aluno paga <b>R$ {(Number(f.monthly_fee) + 20).toFixed(2).replace('.', ',')}</b> · você recebe <b>R$ {Number(f.monthly_fee).toFixed(2).replace('.', ',')}</b> · taxa da plataforma R$ 20,00
            </div>
          )}
          <label className="evo-field"><span>Objetivo</span><input value={f.goal} placeholder="Ex: hipertrofia, emagrecimento..." onChange={(e) => setF({ ...f, goal: e.target.value })} /></label>
          <label className="evo-field"><span>Observações</span><textarea rows={3} value={f.student_notes} onChange={(e) => setF({ ...f, student_notes: e.target.value })} /></label>
          <button className="btn" disabled={saving} onClick={save}>{saving ? 'Salvando...' : 'Salvar ficha'}</button>
        </div>
      </div>
    </div>
  );
}
