// Biblioteca COMPLETA de exercícios (free-exercise-db / yuhonas — domínio público).
// Carregada em tempo de execução de um CDN estável (jsDelivr, com fallback raw.github).
// Mapeia ~873 exercícios para o MESMO formato usado pelo app (id, name, group,
// equipment, level, images[2], instructions[]), reaproveitando os grupos PT do app.
//
// Estratégia: os 90 curados (exerciseLibrary.js) continuam sendo a base garantida
// (com vídeos + tradução PT). Esta função ENRIQUECE o seletor com a base inteira.
// Se o CDN falhar, o app segue funcionando só com os 90.

const JSON_SOURCES = [
  'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/dist/exercises.json',
  'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json',
];

// Mesma base de imagens já usada pelos 90 curados (consistência visual).
const IMG_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';

// músculo primário (free-exercise-db) -> chave de grupo do app (GROUPS)
const MUSCLE_TO_GROUP = {
  chest: 'peito',
  lats: 'costas',
  'middle back': 'costas',
  'lower back': 'lombar',
  traps: 'trapezio',
  neck: 'trapezio',
  shoulders: 'ombros',
  biceps: 'biceps',
  triceps: 'triceps',
  forearms: 'antebraco',
  quadriceps: 'pernas',
  abductors: 'pernas',
  adductors: 'pernas',
  hamstrings: 'posterior',
  glutes: 'gluteos',
  calves: 'panturrilha',
  abdominals: 'abdomen',
};

function groupFor(raw) {
  if (raw.category === 'cardio') return 'cardio';
  const m = (raw.primaryMuscles && raw.primaryMuscles[0] || '').toLowerCase();
  return MUSCLE_TO_GROUP[m] || 'abdomen';
}

function mapExercise(raw) {
  return {
    id: raw.id || (raw.name || '').replace(/\s+/g, '_'),
    name: raw.name || '',
    group: groupFor(raw),
    equipment: raw.equipment || 'body only',
    level: raw.level || 'beginner',
    images: Array.isArray(raw.images) ? raw.images.map((p) => IMG_BASE + p) : [],
    instructions: Array.isArray(raw.instructions) ? raw.instructions : [],
    primaryMuscles: Array.isArray(raw.primaryMuscles) ? raw.primaryMuscles : [],
    secondaryMuscles: Array.isArray(raw.secondaryMuscles) ? raw.secondaryMuscles : [],
  };
}

let _cache = null; // promise memoizada

export function loadFullExercises() {
  if (_cache) return _cache;
  _cache = (async () => {
    for (const url of JSON_SOURCES) {
      try {
        const res = await fetch(url, { mode: 'cors' });
        if (!res.ok) continue;
        const data = await res.json();
        if (Array.isArray(data) && data.length) {
          return data
            .map(mapExercise)
            .filter((e) => e.name && e.images.length); // só com imagem (qualidade visual)
        }
      } catch {
        /* tenta a próxima fonte */
      }
    }
    return []; // falhou -> app usa só os 90 curados
  })();
  return _cache;
}
