// Fallback de mídia: acha as imagens (animação) de um exercício pelo NOME,
// mesmo quando o treino foi digitado à mão (sem imagem salva no banco).
// Casa por nome em inglês (biblioteca) ou em português (tradução).
import { EXERCISES } from './exerciseLibrary.js';
import { exerciseDisplayName } from './exerciseI18n.js';

function norm(s) {
  return (s || '')
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '') // remove acentos
    .replace(/[^a-z0-9 ]/g, ' ')     // remove pontuação
    .replace(/\s+/g, ' ')
    .trim();
}

// Pré-monta as chaves (EN + PT) de cada exercício com imagem, do mais
// específico (nome mais longo) ao mais genérico — para casar bem prefixos.
const ENTRIES = EXERCISES
  .filter((e) => Array.isArray(e.images) && e.images.length)
  .map((e) => ({
    images: e.images,
    keys: Array.from(new Set([norm(e.name), norm(exerciseDisplayName(e.name))])).filter(Boolean),
  }));

export function imagesForName(name) {
  const q = norm(name);
  if (!q) return [];

  // 1) match exato
  for (const e of ENTRIES) if (e.keys.includes(q)) return e.images;

  // 2) o nome da biblioteca começa com o que foi digitado
  //    (ex.: "agachamento livre" -> "agachamento livre com barra")
  //    prefere a chave mais curta (mais genérica)
  let best = null;
  for (const e of ENTRIES) {
    for (const k of e.keys) {
      if (k.startsWith(q) || q.startsWith(k)) {
        if (!best || k.length < best.len) best = { images: e.images, len: k.length };
      }
    }
  }
  if (best) return best.images;

  // 3) contém (qualquer direção)
  for (const e of ENTRIES) if (e.keys.some((k) => k.includes(q) || q.includes(k))) return e.images;

  return [];
}
