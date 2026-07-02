// Mapa de músculos ativados (SVG frente + costas). Sem IA, consistente.
// Props: primary=[], secondary=[] (chaves em inglês da base), height opcional.
import { createElement } from 'react';

const BASE = '#2a313b';   // silhueta
const MUS = '#39414f';    // músculo em repouso
const STROKE = '#454e5d';

// silhueta base (comum às duas vistas)
const SIL = [
  ['circle', { cx: 100, cy: 36, r: 24 }],
  ['rect', { x: 88, y: 56, width: 24, height: 16, rx: 7 }],
  ['rect', { x: 72, y: 82, width: 56, height: 118, rx: 22 }],
  ['rect', { x: 80, y: 150, width: 40, height: 90, rx: 16 }],
  ['rect', { x: 44, y: 96, width: 20, height: 70, rx: 10 }], ['rect', { x: 136, y: 96, width: 20, height: 70, rx: 10 }],
  ['rect', { x: 40, y: 160, width: 18, height: 70, rx: 9 }], ['rect', { x: 142, y: 160, width: 18, height: 70, rx: 9 }],
  ['rect', { x: 74, y: 238, width: 24, height: 150, rx: 12 }], ['rect', { x: 102, y: 238, width: 24, height: 150, rx: 12 }],
  ['rect', { x: 76, y: 368, width: 20, height: 120, rx: 10 }], ['rect', { x: 104, y: 368, width: 20, height: 120, rx: 10 }],
];

// [tag, muscle, attrs]
const FRONT = [
  ['path', 'traps', { d: 'M100 60 L80 92 L100 84 Z' }], ['path', 'traps', { d: 'M100 60 L120 92 L100 84 Z' }],
  ['ellipse', 'shoulders', { cx: 70, cy: 98, rx: 20, ry: 16 }], ['ellipse', 'shoulders', { cx: 130, cy: 98, rx: 20, ry: 16 }],
  ['path', 'chest', { d: 'M99 108 Q70 108 68 132 Q84 146 99 138 Z' }], ['path', 'chest', { d: 'M101 108 Q130 108 132 132 Q116 146 101 138 Z' }],
  ['ellipse', 'biceps', { cx: 55, cy: 140, rx: 11, ry: 25 }], ['ellipse', 'biceps', { cx: 145, cy: 140, rx: 11, ry: 25 }],
  ['ellipse', 'forearms', { cx: 49, cy: 196, rx: 10, ry: 30 }], ['ellipse', 'forearms', { cx: 151, cy: 196, rx: 10, ry: 30 }],
  ['rect', 'abdominals', { x: 86, y: 146, width: 28, height: 74, rx: 9 }],
  ['ellipse', 'abductors', { cx: 74, cy: 236, rx: 9, ry: 15 }], ['ellipse', 'abductors', { cx: 126, cy: 236, rx: 9, ry: 15 }],
  ['ellipse', 'adductors', { cx: 92, cy: 270, rx: 8, ry: 28 }], ['ellipse', 'adductors', { cx: 108, cy: 270, rx: 8, ry: 28 }],
  ['ellipse', 'quadriceps', { cx: 84, cy: 290, rx: 17, ry: 52 }], ['ellipse', 'quadriceps', { cx: 116, cy: 290, rx: 17, ry: 52 }],
  ['ellipse', 'calves', { cx: 85, cy: 418, rx: 12, ry: 40 }], ['ellipse', 'calves', { cx: 115, cy: 418, rx: 12, ry: 40 }],
  ['ellipse', 'neck', { cx: 100, cy: 66, rx: 9, ry: 8 }],
];

const BACK = [
  ['path', 'traps', { d: 'M78 92 Q100 70 122 92 Q100 128 78 92 Z' }],
  ['ellipse', 'shoulders', { cx: 70, cy: 100, rx: 19, ry: 15 }], ['ellipse', 'shoulders', { cx: 130, cy: 100, rx: 19, ry: 15 }],
  ['ellipse', 'triceps', { cx: 55, cy: 142, rx: 11, ry: 26 }], ['ellipse', 'triceps', { cx: 145, cy: 142, rx: 11, ry: 26 }],
  ['ellipse', 'forearms', { cx: 49, cy: 197, rx: 10, ry: 30 }], ['ellipse', 'forearms', { cx: 151, cy: 197, rx: 10, ry: 30 }],
  ['path', 'lats', { d: 'M99 120 Q74 126 78 170 Q90 178 99 150 Z' }], ['path', 'lats', { d: 'M101 120 Q126 126 122 170 Q110 178 101 150 Z' }],
  ['rect', 'middle back', { x: 90, y: 118, width: 20, height: 40, rx: 7 }],
  ['rect', 'lower back', { x: 88, y: 176, width: 24, height: 34, rx: 8 }],
  ['ellipse', 'glutes', { cx: 88, cy: 246, rx: 17, ry: 20 }], ['ellipse', 'glutes', { cx: 112, cy: 246, rx: 17, ry: 20 }],
  ['ellipse', 'hamstrings', { cx: 84, cy: 312, rx: 17, ry: 50 }], ['ellipse', 'hamstrings', { cx: 116, cy: 312, rx: 17, ry: 50 }],
  ['ellipse', 'calves', { cx: 85, cy: 420, rx: 13, ry: 42 }], ['ellipse', 'calves', { cx: 115, cy: 420, rx: 13, ry: 42 }],
  ['ellipse', 'neck', { cx: 100, cy: 66, rx: 9, ry: 8 }],
];

function figure(list, primSet, secSet, key) {
  const kids = [];
  SIL.forEach((s, i) => kids.push(createElement(s[0], { key: 'b' + i, ...s[1], fill: BASE })));
  list.forEach((s, i) => {
    const [tag, m, attrs] = s;
    const p = primSet.has(m), sec = !p && secSet.has(m);
    kids.push(createElement(tag, {
      key: 'm' + i, ...attrs,
      fill: p ? 'url(#kmRed)' : sec ? 'url(#kmOrange)' : MUS,
      filter: p ? 'url(#kmGlowR)' : sec ? 'url(#kmGlowO)' : undefined,
      stroke: STROKE, strokeWidth: 0.6,
      style: { transition: 'fill .35s ease, filter .35s ease' },
    }));
  });
  return createElement('svg', { key, viewBox: '0 0 200 520', style: { height: '100%', width: 'auto' } }, kids);
}

export default function MuscleMap({ primary = [], secondary = [], height = 200 }) {
  const primSet = new Set(primary.map((x) => String(x).toLowerCase()));
  const secSet = new Set(secondary.map((x) => String(x).toLowerCase()));
  const lbl = { fontSize: 10, letterSpacing: 1.5, color: '#8b93a1', textTransform: 'uppercase', marginTop: 2 };
  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', alignItems: 'flex-start' }}>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true">
        <defs>
          <radialGradient id="kmRed" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ff6b6b" /><stop offset="55%" stopColor="#f01f1f" /><stop offset="100%" stopColor="#a60000" />
          </radialGradient>
          <radialGradient id="kmOrange" cx="50%" cy="40%" r="65%">
            <stop offset="0%" stopColor="#ffc07a" /><stop offset="55%" stopColor="#ff8a1e" /><stop offset="100%" stopColor="#d55e00" />
          </radialGradient>
          <filter id="kmGlowR" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ff2d2d" floodOpacity="0.9" /></filter>
          <filter id="kmGlowO" x="-40%" y="-40%" width="180%" height="180%"><feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#ff6a1a" floodOpacity="0.85" /></filter>
        </defs>
      </svg>
      <div style={{ textAlign: 'center', height }}>
        {figure(FRONT, primSet, secSet, 'front')}
        <div style={lbl}>Frente</div>
      </div>
      <div style={{ textAlign: 'center', height }}>
        {figure(BACK, primSet, secSet, 'back')}
        <div style={lbl}>Costas</div>
      </div>
    </div>
  );
}
