// Arte premium do KIVO por exercício (ilustrações próprias — personagens Kai/Nova).
// O app consulta este mapa PRIMEIRO; se não houver arte, usa a animação/imagem atual.
//
// Como preencher (quando as ilustrações estiverem prontas e hospedadas em CDN):
//   chave  = nome do exercício (em inglês da base OU em português), será normalizado.
//   valor  = [url_inicio, url_fim]  -> 2 frames (vira animação em loop, igual hoje)
//            ou [url_unica]         -> 1 ilustração
//
// Exemplo (descomente e troque pela URL real):
// const ART = {
//   'barbell bench press - medium grip': [
//     'https://cdn.SEU-DOMINIO/kivo/peito/barra/supino_inicio.png',
//     'https://cdn.SEU-DOMINIO/kivo/peito/barra/supino_fim.png',
//   ],
//   'agachamento livre com barra': ['https://cdn.SEU-DOMINIO/kivo/pernas/barra/agachamento.png'],
// };

const ART = {
  // adicione as artes aqui conforme produzir (nome do exercício: [urls])
};

function norm(s) {
  return (s || '').toString().toLowerCase().normalize('NFD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, ' ').trim();
}

const INDEX = {};
for (const [k, v] of Object.entries(ART)) INDEX[norm(k)] = v;

// Retorna [url1, url2?] da arte KIVO do exercício, ou null se ainda não houver.
export function artFor(name) {
  const q = norm(name);
  if (!q) return null;
  return INDEX[q] || null;
}
