// Ajuda dentro do app (modal por perfil) + Tour de boas-vindas (1º acesso).
// Sem dependência de CSS novo: reaproveita classes de modal e usa estilos inline.
import { useState } from 'react';
import VideoTutorial from './VideoTutorial.jsx';

// ---------- Conteúdo da Ajuda ----------
const HELP = {
  trainer: {
    title: 'Ajuda — Personal',
    intro: 'Tudo o que você precisa para usar o KIVO. Toque em um tópico para abrir.',
    sections: [
      { t: '1. Como começar', s: [
        'Sua conta de Personal é gratuita e ilimitada.',
        'Copie seu código de convite (no topo do painel) e envie ao aluno.',
        'O aluno usa esse código para se vincular a você.',
      ] },
      { t: '2. Cadastrar aluno', s: [
        'Toque em "+ Cadastrar aluno".',
        'Preencha nome, e-mail, senha e (opcional) a mensalidade que você recebe.',
        'O app mostra quanto o aluno paga, quanto você recebe e a taxa (R$ 20).',
      ] },
      { t: '3. Montar treino', s: [
        'Selecione o aluno na lista à esquerda.',
        'Toque em "+ Novo treino" e dê um título (ex.: Treino A — Peito).',
        'Toque em "+ Adicionar exercícios da biblioteca" (800+ exercícios).',
        'Busque ou filtre por grupo muscular, escolha e defina séries, reps, carga e descanso.',
        'Toque em "Criar treino" — já aparece para o aluno.',
      ] },
      { t: '4. Exercícios com seu vídeo', s: [
        'Toque em "🎬 Exercícios" no topo.',
        'Crie um exercício seu com nome, grupo e um vídeo (gravado ou da galeria).',
        'Ele fica disponível na aba "⭐ Meus" dentro da biblioteca.',
      ] },
      { t: '5. Mensagens e dúvidas', s: [
        'Toque em "💬 Mensagens" para conversar com os alunos.',
        'Responda por texto ou grave um vídeo da execução.',
        'Você pode salvar vídeos como modelo para reutilizar.',
      ] },
      { t: '6. Evolução do aluno', s: [
        'Selecione o aluno e toque em "📈 Evolução".',
        'Veja peso, medidas, fotos e o gráfico de progresso.',
      ] },
      { t: '7. Financeiro', s: [
        'Toque em "💰 Financeiro".',
        'Veja o que foi faturado, o que está a receber e o que está vencido.',
      ] },
      { t: '8. Editar, duplicar e backup', s: [
        'Em cada treino há "Editar" e "Duplicar" (reaproveite como base).',
        'Use "⬇ Backup" para baixar uma cópia de segurança dos seus dados.',
      ] },
    ],
  },
  student: {
    title: 'Ajuda — Aluno',
    intro: 'Como usar o KIVO para treinar e acompanhar sua evolução. Toque em um tópico.',
    sections: [
      { t: '1. Vincular ao seu personal', s: [
        'Se você tem o código do personal, cole no cartão "Vincular ao seu personal".',
        'Assim ele passa a montar e acompanhar seus treinos.',
      ] },
      { t: '2. Iniciar o treino', s: [
        'Na tela Início, toque no cartão laranja "Próximo treino".',
        'Ou vá na aba "Treinos" e toque em "Iniciar".',
      ] },
      { t: '3. Durante o treino', s: [
        'Veja a animação do exercício (toque na imagem para ampliar).',
        'Faça as séries e toque em "Concluir exercício".',
        'Respeite o cronômetro de descanso.',
        'Use as setas ◀ ▶ para navegar. A barra mostra quanto falta (ex.: 5/12).',
      ] },
      { t: '4. Histórico', s: [
        'Na aba "Histórico" você vê os treinos já concluídos e sua sequência.',
      ] },
      { t: '5. Evolução', s: [
        'Na aba "Evolução", toque em "+ Registrar" para anotar peso e medidas.',
        'Toque em "+ Foto" para fotos de antes/depois.',
        'Com 2 medições, o gráfico aparece sozinho.',
      ] },
      { t: '6. Dúvidas', s: [
        'Na aba "Dúvidas", fale com seu personal por texto ou vídeo (🎥).',
      ] },
      { t: '7. Assinatura', s: [
        'Quando o período grátis acabar, toque em "Assinar agora".',
        'Escolha PIX, cartão ou boleto. O acesso libera após a confirmação.',
      ] },
    ],
  },
};

// ---------- Vídeo tutorial dentro do app ----------
// Cole o link do YouTube quando o vídeo estiver pronto. Vazio = mostra "em breve".
const VIDEO_URLS = {
  trainer: '',
  student: '',
};
function ytEmbed(url) {
  if (!url) return '';
  const m = url.match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([\w-]{11})/);
  return m ? `https://www.youtube.com/embed/${m[1]}` : url;
}
function VideoBlock({ role }) {
  const url = ytEmbed(VIDEO_URLS[role] || '');
  // Sem link de YouTube definido -> usa o vídeo animado embutido no próprio app.
  if (!url) return <VideoTutorial />;
  return (
    <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, borderRadius: 12, overflow: 'hidden', marginBottom: 16, background: '#000' }}>
      <iframe
        src={url}
        title="Vídeo tutorial KIVO"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
      />
    </div>
  );
}

export function Help({ role = 'student', onClose }) {
  const data = HELP[role] || HELP.student;
  const [open, setOpen] = useState(0); // primeira seção aberta
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: 18 }}>❓ {data.title}</h2>
          <button className="close-x" onClick={onClose}>✕</button>
        </div>
        <div className="modal-body">
          <VideoBlock role={role} />
          <p className="muted" style={{ fontSize: 13, marginTop: 0 }}>{data.intro}</p>
          {data.sections.map((sec, i) => {
            const isOpen = open === i;
            return (
              <div key={i} style={{ border: '1px solid rgba(255,255,255,.08)', borderRadius: 10, marginBottom: 8, overflow: 'hidden' }}>
                <button
                  onClick={() => setOpen(isOpen ? -1 : i)}
                  style={{ width: '100%', textAlign: 'left', background: isOpen ? 'rgba(255,106,26,.12)' : 'transparent', color: 'inherit', border: 0, padding: '12px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>{sec.t}</span>
                  <span style={{ color: 'var(--orange)' }}>{isOpen ? '−' : '+'}</span>
                </button>
                {isOpen && (
                  <ul style={{ margin: 0, padding: '4px 18px 14px 30px', fontSize: 13.5, lineHeight: 1.6 }}>
                    {sec.s.map((line, j) => <li key={j} style={{ marginBottom: 4 }}>{line}</li>)}
                  </ul>
                )}
              </div>
            );
          })}
          <p className="muted" style={{ fontSize: 12, marginTop: 14 }}>
            {role === 'student'
              ? 'Ainda com dúvida? Fale com seu personal na aba Dúvidas.'
              : 'Dica: o aluno também tem uma tela de Ajuda no app dele.'}
          </p>
        </div>
      </div>
    </div>
  );
}

// ---------- Tour de boas-vindas (1ª vez) ----------
const TOUR = {
  trainer: [
    { e: '👋', t: 'Bem-vindo ao KIVO!', x: 'Aqui você cadastra alunos, monta treinos e acompanha tudo num lugar só.' },
    { e: '🔗', t: 'Seu código de convite', x: 'Copie o código no topo do painel e envie ao aluno para ele se vincular a você.' },
    { e: '🏋️', t: 'Monte o treino', x: 'Selecione o aluno e use a biblioteca com mais de 800 exercícios, com animação.' },
    { e: '💬', t: 'Acompanhe de perto', x: 'Mensagens, evolução e financeiro sempre à mão. Bons treinos!' },
  ],
  student: [
    { e: '👋', t: 'Bem-vindo ao KIVO!', x: 'Seu treino na palma da mão, guiado exercício por exercício.' },
    { e: '▶️', t: 'Inicie seu treino', x: 'Toque no cartão laranja "Próximo treino" e siga as animações.' },
    { e: '📈', t: 'Acompanhe sua evolução', x: 'Registre peso, medidas e fotos para ver seu progresso.' },
    { e: '💬', t: 'Tire dúvidas', x: 'Fale com seu personal por texto ou vídeo na aba Dúvidas.' },
  ],
};

export function WelcomeTour({ role = 'student' }) {
  const key = `kivo_tour_${role}_v1`;
  const [done, setDone] = useState(() => {
    try { return localStorage.getItem(key) === '1'; } catch { return false; }
  });
  const [i, setI] = useState(0);
  const slides = TOUR[role] || TOUR.student;

  if (done) return null;

  function finish() {
    try { localStorage.setItem(key, '1'); } catch { /* */ }
    setDone(true);
  }
  const last = i === slides.length - 1;
  const s = slides[i];

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.72)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}>
      <div style={{ background: '#1a1b1f', border: '1px solid rgba(255,255,255,.1)', borderRadius: 18, width: '100%', maxWidth: 360, padding: '26px 22px', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}>
        <div style={{ fontSize: 46, lineHeight: 1, marginBottom: 10 }}>{s.e}</div>
        <h2 style={{ fontSize: 20, margin: '0 0 8px' }}>{s.t}</h2>
        <p style={{ color: '#b9bbc2', fontSize: 14.5, margin: '0 0 18px', lineHeight: 1.55 }}>{s.x}</p>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginBottom: 18 }}>
          {slides.map((_, j) => (
            <span key={j} style={{ width: j === i ? 22 : 8, height: 8, borderRadius: 8, background: j === i ? 'var(--orange)' : 'rgba(255,255,255,.25)', transition: 'all .2s' }} />
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          {!last ? (
            <>
              <button onClick={finish} style={btnGhost}>Pular</button>
              <button onClick={() => setI(i + 1)} style={btnPrimary}>Próximo</button>
            </>
          ) : (
            <button onClick={finish} style={{ ...btnPrimary, flex: 1 }}>Começar 💪</button>
          )}
        </div>
      </div>
    </div>
  );
}

const btnPrimary = { flex: 1, background: 'var(--orange)', color: '#fff', border: 0, borderRadius: 10, padding: '12px 14px', fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const btnGhost = { flex: 1, background: 'transparent', color: '#b9bbc2', border: '1px solid rgba(255,255,255,.15)', borderRadius: 10, padding: '12px 14px', fontWeight: 600, fontSize: 14, cursor: 'pointer' };
