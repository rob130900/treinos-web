// Icones SVG minimalistas (stroke), herdam currentColor
const base = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' };

export const IcoHome = (p) => (<svg {...base} {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></svg>);
export const IcoDumbbell = (p) => (<svg {...base} {...p}><path d="M6.5 6.5l11 11" /><path d="M21 21l-1-1" /><path d="M3 3l1 1" /><rect x="2" y="8" width="4" height="8" rx="1" transform="rotate(-45 4 12)" /><rect x="18" y="8" width="4" height="8" rx="1" transform="rotate(-45 20 12)" /></svg>);
export const IcoHistory = (p) => (<svg {...base} {...p}><path d="M3 12a9 9 0 1 0 3-6.7L3 8" /><path d="M3 3v5h5" /><path d="M12 8v4l3 2" /></svg>);
export const IcoChart = (p) => (<svg {...base} {...p}><path d="M3 3v18h18" /><path d="M7 14l3-4 3 3 4-6" /></svg>);
export const IcoPlay = (p) => (<svg {...base} {...p} fill="currentColor" stroke="none"><path d="M7 5v14l12-7z" /></svg>);
export const IcoCheck = (p) => (<svg {...base} {...p}><path d="M20 6L9 17l-5-5" /></svg>);
export const IcoNext = (p) => (<svg {...base} {...p}><path d="M5 12h14" /><path d="M13 6l6 6-6 6" /></svg>);
export const IcoPrev = (p) => (<svg {...base} {...p}><path d="M19 12H5" /><path d="M11 6l-6 6 6 6" /></svg>);
export const IcoClose = (p) => (<svg {...base} {...p}><path d="M18 6L6 18" /><path d="M6 6l12 12" /></svg>);
export const IcoFlame = (p) => (<svg {...base} {...p} fill="currentColor" stroke="none"><path d="M12 2c1 3-1 4-2 6-1 2 0 4 2 4 1 0 2-1 2-2 1 1 2 3 2 5a6 6 0 1 1-12 0c0-3 2-5 3-7 0 2 1 3 2 3 1-3-1-5 1-9z" /></svg>);
export const IcoLogout = (p) => (<svg {...base} {...p}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></svg>);
export const IcoClock = (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>);
export const IcoChat = (p) => (<svg {...base} {...p}><path d="M21 11.5a8.38 8.38 0 0 1-8.5 8.5 8.5 8.5 0 0 1-3.8-.9L3 21l1.9-5.7A8.5 8.5 0 1 1 21 11.5z" /></svg>);
export const IcoBell = (p) => (<svg {...base} {...p}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.7 21a2 2 0 0 1-3.4 0" /></svg>);
export const IcoSend = (p) => (<svg {...base} {...p}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></svg>);
