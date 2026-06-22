import { useEffect, useRef, useState } from 'react';
import { api } from './api.js';

const FIELDS = [
  ['weight', 'Peso', 'kg'],
  ['body_fat', '% Gordura', '%'],
  ['chest', 'Peito', 'cm'],
  ['waist', 'Cintura', 'cm'],
  ['hip', 'Quadril', 'cm'],
  ['arm', 'Braço', 'cm'],
  ['thigh', 'Coxa', 'cm'],
];

function fmtDate(d) {
  return new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });
}

// Compacta a imagem para base64 leve (máx ~900px, JPEG 0.7)
function fileToDataUrl(file, maxSize = 900, quality = 0.7) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > height && width > maxSize) { height = (height * maxSize) / width; width = maxSize; }
        else if (height > maxSize) { width = (width * maxSize) / height; height = maxSize; }
        const c = document.createElement('canvas');
        c.width = width; c.height = height;
        c.getContext('2d').drawImage(img, 0, 0, width, height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function LineChart({ data, unit }) {
  if (data.length < 2) {
    return <div className="muted" style={{ fontSize: 13, padding: '20px 0', textAlign: 'center' }}>Registre ao menos 2 medições para ver o gráfico.</div>;
  }
  const W = 300, H = 130, pad = 24;
  const ys = data.map((d) => d.y);
  const min = Math.min(...ys), max = Math.max(...ys);
  const range = max - min || 1;
  const px = (i) => pad + (i * (W - pad * 2)) / (data.length - 1);
  const py = (v) => H - pad - ((v - min) / range) * (H - pad * 2);
  const pts = data.map((d, i) => `${px(i)},${py(d.y)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="evo-chart" preserveAspectRatio="none">
      <polyline points={pts} fill="none" stroke="var(--orange)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {data.map((d, i) => <circle key={i} cx={px(i)} cy={py(d.y)} r="3.2" fill="var(--orange)" />)}
      <text x={pad} y="12" fill="var(--muted)" fontSize="9">{max}{unit}</text>
      <text x={pad} y={H - 6} fill="var(--muted)" fontSize="9">{min}{unit}</text>
    </svg>
  );
}

export default function StudentEvolution({ studentId, readOnly }) {
  const [meas, setMeas] = useState(null);
  const [photos, setPhotos] = useState([]);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [metric, setMetric] = useState('weight');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef(null);

  async function load() {
    try {
      const [m, p] = await Promise.all([api.listMeasurements(studentId), api.listPhotos(studentId)]);
      setMeas(m.measurements);
      setPhotos(p.photos);
    } catch (e) { setError(e.message); }
  }
  useEffect(() => { load(); }, [studentId]);

  async function saveMeasurement() {
    setSaving(true);
    try {
      await api.addMeasurement({ ...form, student_id: studentId });
      setForm({}); setShowForm(false);
      await load();
    } catch (e) { setError(e.message); } finally { setSaving(false); }
  }
  async function delMeasurement(id) {
    try { await api.deleteMeasurement(id); await load(); } catch (e) { setError(e.message); }
  }

  async function onPickPhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await fileToDataUrl(file);
      await api.addPhoto({ image_data: dataUrl, label: 'frente', student_id: studentId });
      await load();
    } catch (err) { setError(err.message); } finally { setUploading(false); if (fileRef.current) fileRef.current.value = ''; }
  }
  async function delPhoto(id) {
    try { await api.deletePhoto(id); await load(); } catch (e) { setError(e.message); }
  }

  if (error) return <div className="alert">{error}</div>;
  if (!meas) return <div className="skeleton-hero" />;

  const chartData = meas.filter((m) => m[metric] != null).map((m) => ({ x: m.measured_on, y: Number(m[metric]) }));
  const unit = FIELDS.find((f) => f[0] === metric)?.[2] || '';
  const latest = meas[meas.length - 1];
  const first = meas[0];
  const weightDelta = latest?.weight != null && first?.weight != null && meas.length > 1
    ? (Number(latest.weight) - Number(first.weight)).toFixed(1) : null;

  return (
    <div className="evo">
      <h1 className="page-title">Evolução</h1>

      {/* Resumo */}
      <div className="evo-cards">
        <div className="evo-card">
          <div className="evo-num">{latest?.weight != null ? `${latest.weight}kg` : '—'}</div>
          <div className="evo-lbl">Peso atual</div>
        </div>
        <div className="evo-card">
          <div className="evo-num" style={{ color: weightDelta == null ? 'var(--muted)' : weightDelta <= 0 ? 'var(--green)' : 'var(--orange)' }}>
            {weightDelta == null ? '—' : `${weightDelta > 0 ? '+' : ''}${weightDelta}kg`}
          </div>
          <div className="evo-lbl">Variação total</div>
        </div>
        <div className="evo-card">
          <div className="evo-num">{photos.length}</div>
          <div className="evo-lbl">Fotos</div>
        </div>
      </div>

      {/* Gráfico */}
      <div className="evo-section">
        <div className="spread" style={{ marginBottom: 6 }}>
          <h3 className="evo-h3">Gráfico</h3>
        </div>
        <div className="chips" style={{ marginBottom: 10 }}>
          {FIELDS.map(([k, label]) => (
            <button key={k} className={`chip ${metric === k ? 'active' : ''}`} onClick={() => setMetric(k)}>{label}</button>
          ))}
        </div>
        <LineChart data={chartData} unit={unit} />
      </div>

      {/* Medidas */}
      <div className="evo-section">
        <div className="spread" style={{ marginBottom: 10 }}>
          <h3 className="evo-h3">Medidas</h3>
          {!readOnly && <button className="btn-sm" onClick={() => setShowForm((v) => !v)}>{showForm ? 'Fechar' : '+ Registrar'}</button>}
        </div>

        {showForm && (
          <div className="evo-form">
            <label className="evo-field"><span>Data</span><input type="date" value={form.measured_on || ''} onChange={(e) => setForm({ ...form, measured_on: e.target.value })} /></label>
            <div className="evo-grid">
              {FIELDS.map(([k, label, u]) => (
                <label key={k} className="evo-field"><span>{label} ({u})</span>
                  <input type="number" inputMode="decimal" value={form[k] || ''} onChange={(e) => setForm({ ...form, [k]: e.target.value })} /></label>
              ))}
            </div>
            <button className="btn" disabled={saving} onClick={saveMeasurement}>{saving ? 'Salvando...' : 'Salvar medidas'}</button>
          </div>
        )}

        {meas.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Nenhuma medida registrada ainda.</p>
        ) : (
          <div className="evo-timeline">
            {[...meas].reverse().map((m) => (
              <div className="evo-row" key={m.id}>
                <div className="evo-date">{fmtDate(m.measured_on)}</div>
                <div className="evo-vals">
                  {FIELDS.filter(([k]) => m[k] != null).map(([k, label, u]) => (
                    <span key={k} className="evo-pill">{label}: <b>{m[k]}{u}</b></span>
                  ))}
                  {FIELDS.every(([k]) => m[k] == null) && <span className="muted" style={{ fontSize: 12 }}>sem valores</span>}
                </div>
                {!readOnly && <button className="evo-del" onClick={() => delMeasurement(m.id)}>✕</button>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Fotos antes/depois */}
      <div className="evo-section">
        <div className="spread" style={{ marginBottom: 10 }}>
          <h3 className="evo-h3">Fotos antes / depois</h3>
          {!readOnly && (
            <>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPickPhoto} />
              <button className="btn-sm" disabled={uploading} onClick={() => fileRef.current?.click()}>{uploading ? 'Enviando...' : '+ Foto'}</button>
            </>
          )}
        </div>

        {photos.length >= 2 && (
          <div className="evo-compare">
            <figure><img src={photos[0].image_data} alt="antes" /><figcaption>Antes · {fmtDate(photos[0].taken_on)}</figcaption></figure>
            <figure><img src={photos[photos.length - 1].image_data} alt="depois" /><figcaption>Depois · {fmtDate(photos[photos.length - 1].taken_on)}</figcaption></figure>
          </div>
        )}

        {photos.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>Nenhuma foto ainda. Adicione fotos para acompanhar sua evolução visual.</p>
        ) : (
          <div className="evo-photos">
            {[...photos].reverse().map((p) => (
              <div className="evo-photo" key={p.id}>
                <img src={p.image_data} alt={p.label || 'foto'} loading="lazy" />
                <span className="evo-photo-date">{fmtDate(p.taken_on)}</span>
                {!readOnly && <button className="evo-photo-del" onClick={() => delPhoto(p.id)}>✕</button>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
