import { useEffect, useState } from 'react';
import { useAuth } from './AuthContext.jsx';
import { api } from './api.js';
import StudentHome from './StudentHome.jsx';
import StudentWorkouts from './StudentWorkouts.jsx';
import StudentHistory from './StudentHistory.jsx';
import StudentChat from './StudentChat.jsx';
import StudentEvolution from './StudentEvolution.jsx';
import WelcomeBanner from './WelcomeBanner.jsx';
import StudentPlans from './StudentPlans.jsx';
import WorkoutPlayer from './WorkoutPlayer.jsx';
import { IcoHome, IcoDumbbell, IcoHistory, IcoChat, IcoChart, IcoLogout } from './Icons.jsx';

export default function StudentApp() {
  const { user, logout } = useAuth();
  const [tab, setTab] = useState('home');
  const [playerId, setPlayerId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [unread, setUnread] = useState(0);
  const [plan, setPlan] = useState(null);
  const [showPlans, setShowPlans] = useState(false);

  function openPlayer(id) { if (id) setPlayerId(id); }
  function closePlayer(done) {
    setPlayerId(null);
    if (done) { setRefreshKey((k) => k + 1); setTab('home'); }
  }
  async function loadPlan() { try { setPlan(await api.getPlan()); } catch { /* */ } }

  useEffect(() => {
    let alive = true;
    async function poll() {
      try { const d = await api.unreadCount(); if (alive) setUnread(d.unread || 0); } catch { /* ignore */ }
    }
    poll();
    const t = setInterval(poll, 10000);
    return () => { alive = false; clearInterval(t); };
  }, [tab]);

  useEffect(() => { loadPlan(); }, []);

  // Acesso bloqueado (trial vencido sem pagamento) -> paywall obrigatório
  if (plan?.blocked) {
    return (
      <div className="app-shell">
        <header className="app-top">
          <span className="kivo" style={{ fontSize: 22 }}>KI<span className="v">V</span>O</span>
        </header>
        <StudentPlans planInfo={plan} paywall onChange={loadPlan} onLogout={logout} />
      </div>
    );
  }

  if (playerId) return <WorkoutPlayer workoutId={playerId} onClose={closePlayer} />;

  const navItems = [
    { key: 'home', label: 'Início', Ico: IcoHome },
    { key: 'workouts', label: 'Treinos', Ico: IcoDumbbell },
    { key: 'history', label: 'Histórico', Ico: IcoHistory },
    { key: 'suporte', label: 'Suporte', Ico: IcoChat, badge: unread },
    { key: 'evolucao', label: 'Evolução', Ico: IcoChart },
  ];

  return (
    <div className="app-shell">
      <header className="app-top">
        <span className="kivo" style={{ fontSize: 22 }}>KI<span className="v">V</span>O</span>
        <button className="icon-btn" onClick={logout} title="Sair"><IcoLogout width={18} height={18} /></button>
      </header>

      <main className="app-main">
        {user?.trainer_name && (
          <div className="coach-line">Acompanhado por <b>{user.trainer_name}</b></div>
        )}
        {plan?.isTrial && (
          <div className="trial-banner" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ flex: 1 }}>🎁 Você tem <b>{plan.daysLeft}</b> {plan.daysLeft === 1 ? 'dia' : 'dias'} de teste grátis.</span>
            <button className="btn-mini" onClick={() => setShowPlans(true)}>Assinar</button>
          </div>
        )}
        <WelcomeBanner role="student" onAction={(action, nw) => {
          if (action === 'start') { if (nw?.id) openPlayer(nw.id); else setTab('workouts'); }
        }} />
        {tab === 'home' && <StudentHome key={`h${refreshKey}`} user={user} onStart={openPlayer} goTab={setTab} />}
        {tab === 'workouts' && <StudentWorkouts key={`w${refreshKey}`} onOpen={openPlayer} />}
        {tab === 'history' && <StudentHistory key={`hi${refreshKey}`} />}
        {tab === 'suporte' && <StudentChat />}
        {tab === 'evolucao' && <StudentEvolution studentId={null} />}
      </main>

      {showPlans && plan && (
        <StudentPlans planInfo={plan} onClose={() => setShowPlans(false)} onChange={loadPlan} />
      )}

      <nav className="bottom-nav">
        {navItems.map(({ key, label, Ico, badge }) => (
          <button key={key} className={`nav-item ${tab === key ? 'active' : ''}`} onClick={() => setTab(key)}>
            <span className="nav-ico-wrap">
              <Ico width={22} height={22} />
              {badge > 0 && <span className="nav-badge">{badge > 9 ? '9+' : badge}</span>}
            </span>
            <span>{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
}
