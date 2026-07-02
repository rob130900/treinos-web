import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import KivoLogo from './KivoLogo.jsx';

const ACCOUNT_TYPES = [
  { v: 'personal_trainer', label: 'Personal Trainer' },
  { v: 'estudante_ed_fisica', label: 'Estudante de Educação Física' },
  { v: 'coach_consultor', label: 'Coach / Consultor / Instrutor' },
  { v: 'uso_pessoal', label: 'Uso pessoal (meus próprios treinos)' },
];

export default function Register() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', email: '', password: '', role: 'trainer', invite_code: '',
    cpf: '', account_type: 'personal_trainer', cref: '', phone: '', birth_date: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function update(field, value) { setForm((f) => ({ ...f, [field]: value })); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.register(form);
      saveSession(data);
      navigate(data.user.role === 'trainer' ? '/personal' : '/aluno');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const isPro = form.role === 'trainer';

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-head">
          <KivoLogo size={60} stack tag />
        </div>
        <h1 style={{ fontSize: 22, textAlign: 'center', margin: '22px 0 4px' }}>Criar conta</h1>

        {error && <div className="alert">{error}</div>}

        <label>Nome completo</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} required />

        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />

        <label>Senha</label>
        <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={4} />

        <label>CPF</label>
        <input inputMode="numeric" value={form.cpf} onChange={(e) => update('cpf', e.target.value)} placeholder="Somente números" required />
        <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Usado só para validar sua identidade e evitar contas falsas. Guardado com segurança.</p>

        <label>Telefone (opcional)</label>
        <input inputMode="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="(DDD) 9 9999-9999" />

        <label>Data de nascimento (opcional)</label>
        <input type="date" value={form.birth_date} onChange={(e) => update('birth_date', e.target.value)} />

        <label>Eu sou</label>
        <select value={form.role} onChange={(e) => update('role', e.target.value)}>
          <option value="trainer">Profissional (dou treinos)</option>
          <option value="student">Aluno</option>
        </select>

        {isPro && (
          <>
            <label>Tipo de conta</label>
            <select value={form.account_type} onChange={(e) => update('account_type', e.target.value)}>
              {ACCOUNT_TYPES.map((t) => <option key={t.v} value={t.v}>{t.label}</option>)}
            </select>

            <label>CREF (opcional)</label>
            <input value={form.cref} onChange={(e) => update('cref', e.target.value)} placeholder="Ex: 000000-G/SP" />
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Opcional. Se informar, você recebe o selo <b>Profissional Registrado</b>. Sem CREF o app funciona normalmente.</p>
          </>
        )}

        {form.role === 'student' && (
          <>
            <label>Código do personal (opcional)</label>
            <input value={form.invite_code} onChange={(e) => update('invite_code', e.target.value.toUpperCase())} placeholder="Ex: IMPACTO123" />
            <p className="muted" style={{ fontSize: 12, marginTop: 4 }}>Tem o código? Cole aqui. Sem código, você pode vincular depois dentro do app.</p>
          </>
        )}

        <div style={{ marginTop: 20 }}>
          <button className="btn" disabled={loading}>{loading ? 'Criando...' : 'Criar conta'}</button>
        </div>
        <p className="muted center" style={{ marginTop: 18, fontSize: 14 }}>
          Já tem conta? <Link to="/login">Entrar</Link>
        </p>
      </form>
    </div>
  );
}
