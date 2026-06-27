import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { useAuth } from './AuthContext.jsx';
import KivoLogo from './KivoLogo.jsx';

export default function Login() {
  const { saveSession } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api.login({ email, password });
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
        <h1 style={{ fontSize: 22, textAlign: 'center', margin: '22px 0 4px' }}>Entrar</h1>

        {error && <div className="alert">{error}</div>}

        <label>Email</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>Senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

        <div style={{ marginTop: 20 }}>
          <button className="btn" disabled={loading}>{loading ? 'Entrando...' : 'Começar agora'}</button>
        </div>
        <p className="muted center" style={{ marginTop: 18, fontSize: 14 }}>
          Não tem conta? <Link to="/cadastro">Cadastre-se</Link>
        </p>
      </form>
    </div>
  );
}
