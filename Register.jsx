import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';

export default function Register() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'trainer' });
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
          <div className="kivo">KI<span className="v">V</span>O</div>
          <div className="kivo-tag" style={{ marginTop: 8 }}>Treine. <b>Evolua.</b> Repita.</div>
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
