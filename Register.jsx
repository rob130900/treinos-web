import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import KivoLogo from './KivoLogo.jsx';

export default function Register() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'trainer', invite_code: '' });
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

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-head">
          <KivoLogo size={60} stack tag />
        </div>
        <h1 style={{ fontSize: 22, textAlign: 'center', margin: '22px 0 4px' }}>Criar conta</h1>

        {error && <div className="alert">{error}</div>}

        <label>Nome</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={(e) => update('email', e.target.value)} required />
        <label>Senha</label>
        <input type="password" value={form.password} onChange={(e) => update('password', e.target.value)} required minLength={4} />
        <label>Eu sou</label>
        <select value={form.role} onChange={(e) => update('role', e.target.value)}>
          <option value="trainer">Personal Trainer</option>
          <option value="student">Aluno</option>
        </select>

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
