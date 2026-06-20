import { getExerciseI18n, i18nLabels, detectLang } from './exerciseI18n.js';

const LANG = detectLang();

// Exibe o exercício no padrão: Execução / Dicas / Erros comuns,
// no idioma do usuário. Fallback: instruções originais (inglês).
export default function ExerciseInfo({ name, instructions, max }) {
  const t = getExerciseI18n(name, LANG);
  const L = i18nLabels(LANG);

  const exec = t?.exec
    || (instructions ? instructions.split('\n').map((s) => s.trim()).filter(Boolean) : []);
  const execShown = max ? exec.slice(0, max) : exec;

  if (execShown.length === 0 && !t) return null;

  return (
    <div className="ex-info">
      {execShown.length > 0 && (
        <div className="ex-block">
          <div className="ex-block-title">{L.exec}</div>
          <ol className="instr">{execShown.map((s, i) => <li key={i}>{s}</li>)}</ol>
        </div>
      )}
      {t?.tips?.length > 0 && (
        <div className="ex-block">
          <div className="ex-block-title">{L.tips}</div>
          <ul className="bullets">{t.tips.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
      {t?.errors?.length > 0 && (
        <div className="ex-block">
          <div className="ex-block-title err">{L.errors}</div>
          <ul className="bullets err">{t.errors.map((s, i) => <li key={i}>{s}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
