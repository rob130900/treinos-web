import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';
import Login from './Login.jsx';
import Register from './Register.jsx';
import TrainerDashboard from './TrainerDashboard.jsx';
import StudentApp from './StudentApp.jsx';

function Home() {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return user.role === 'trainer'
    ? <Navigate to="/personal" replace />
    : <Navigate to="/aluno" replace />;
}

function Protected({ role, children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center">Carregando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/cadastro" element={<Register />} />
      <Route path="/personal" element={<Protected role="trainer"><TrainerDashboard /></Protected>} />
      <Route path="/aluno" element={<Protected role="student"><StudentApp /></Protected>} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
