// Resolve os músculos ativados de um exercício + tradução PT.
// Prioridade: primaryMuscles/secondaryMuscles reais (base free-exercise-db) →
// senão deriva do grupo muscular (funciona p/ qualquer exercício, até digitado à mão).

export const MUSCLE_PT = {
  chest: 'Peitoral', shoulders: 'Ombros', biceps: 'Bíceps', triceps: 'Tríceps',
  forearms: 'Antebraço', abdominals: 'Abdômen', lats: 'Dorsais', 'middle back': 'Costas',
  'lower back': 'Lombar', traps: 'Trapézio', neck: 'Pescoço', quadriceps: 'Quadríceps',
  hamstrings: 'Posterior', glutes: 'Glúteos', calves: 'Panturrilha',
  adductors: 'Adutores', abductors: 'Abdutores',
};

// grupo (chave normalizada = igual ao label sem acento) -> músculos
const GROUP = {
  peito:       { primary: ['chest'],       secondary: ['shoulders', 'triceps'] },
  costas:      { primary: ['lats'],        secondary: ['middle back', 'biceps'] },
  ombros:      { primary: ['shoulders'],   secondary: ['triceps', 'traps'] },
  biceps:      { primary: ['biceps'],      secondary: ['forearms'] },
  triceps:     { primary: ['triceps'],     secondary: ['shoulders'] },
  antebraco:   { primary: ['forearms'],    secondary: [] },
  pernas:      { primary: ['quadriceps'],  secondary: ['glutes', 'hamstrings', 'calves'] },
  posterior:   { primary: ['hamstrings'],  secondary: ['glutes', 'lower back'] },
  gluteos:     { primary: ['glutes'],      secondary: ['hamstrings', 'quadriceps'] },
  panturrilha: { primary: ['calves'],      secondary: [] },
  abdomen:     { primary: ['abdominals'],  secondary: [] },
  lombar:      { primary: ['lower back'],  secondary: ['glutes'] },
  trapezio:    { primary: ['traps'],       secondary: ['shoulders'] },
  cardio:      { primary: [],              secondary: [] },
};

function norm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
}

export function musclesFor(ex) {
  if (ex && Array.isArray(ex.primaryMuscles) && ex.primaryMuscles.length) {
    return { primary: ex.primaryMuscles, secondary: ex.secondaryMuscles || [] };
  }
  const token = norm(ex?.group || ex?.muscle_group);
  return GROUP[token] || { primary: [], secondary: [] };
}
