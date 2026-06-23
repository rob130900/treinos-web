// Mensagens dinâmicas e contextuais exibidas ao abrir o app.

const MOTIVACIONAIS = [
  'Bora treinar hoje? Seu resultado depende de você. 💪',
  'Cada treino te deixa mais perto do seu objetivo. 🔥',
  'Disciplina vence motivação. Vamos nessa! 🚀',
  'Um treino de cada vez. Hoje é dia de evoluir!',
  'Seu eu do futuro agradece o treino de hoje. 🙌',
  'Consistência é o segredo. Mantenha o ritmo!',
];

// Rotaciona as mensagens motivacionais a cada abertura
function rotate(arr) {
  let n = 0;
  try {
    n = Number(localStorage.getItem('welcome_rot') || '0');
    localStorage.setItem('welcome_rot', String((n + 1) % 100000));
  } catch { /* */ }
  return arr[n % arr.length];
}

function daysSince(iso) {
  if (!iso) return null;
  return Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
}

// Mensagem para o ALUNO, com base no comportamento de treino
export function pickStudentMessage(d) {
  const since = daysSince(d?.lastWorkout?.completed_at);
  const weekDone = d?.week?.completed || 0;

  // Inativo: 2+ dias sem treinar
  if (since != null && since >= 2) {
    return {
      id: 'retorno', tone: 'warn',
      text: `Você está há ${since} dias sem treinar. Vamos voltar hoje? 🙌`,
      cta: { label: 'Iniciar treino', action: 'start' },
    };
  }
  // Progresso: já treinou nesta semana
  if (weekDone > 0) {
    return {
      id: 'progresso', tone: 'good',
      text: `Você já completou ${weekDone} treino${weekDone > 1 ? 's' : ''} essa semana. Continue assim! 🔥`,
      cta: { label: 'Iniciar treino', action: 'start' },
    };
  }
  // Motivacional (rotativa)
  return {
    id: 'motiv', tone: 'orange',
    text: rotate(MOTIVACIONAIS),
    cta: { label: 'Iniciar treino', action: 'start' },
  };
}

// Mensagem para o PERSONAL (conversão / limite)
export function pickTrainerMessage(p) {
  if (!p) return null;
  if (p.isTrial && p.daysLeft != null && p.daysLeft <= 3) {
    return {
      id: 'conversao', tone: 'orange',
      text: p.daysLeft <= 0
        ? 'Seu período gratuito termina hoje. Garanta seu plano para continuar! 🚀'
        : `Faltam ${p.daysLeft} dia${p.daysLeft > 1 ? 's' : ''} para o fim do seu período gratuito.`,
      cta: { label: 'Ver planos', action: 'plans' },
    };
  }
  if (p.limit != null && p.used >= p.limit) {
    return {
      id: 'limite', tone: 'warn',
      text: 'Você atingiu o limite de alunos do seu plano. Faça upgrade para crescer! 📈',
      cta: { label: 'Ver planos', action: 'plans' },
    };
  }
  return null;
}
