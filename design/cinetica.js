/*
 * CINÉTICA NOTURNA — gerador do sistema visual Life Team
 * 16 peças: diagramas de força sobre campo negro, amarelo elétrico único,
 * linhas prata de trajetória, kit técnico de medição em todas as peças.
 */
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const OUT = 'D:/Claude/Projeto LifeTeam/repo/assets';
const PREVIEW = 'C:/Users/icaro/AppData/Local/Temp/claude/D--Claude-Skills-superpowers-main/d35b64e5-9ecb-41b6-91a9-dede1f5e149d/scratchpad/preview/assets';

const K = '#0C0C0C';      // negro-carvão
const K2 = '#161616';     // carvão elevado
const Y = '#FFE600';      // amarelo elétrico
const S = '#9A9A9A';      // prata-fumaça
const S2 = '#4A4A4A';     // prata profundo (linhas de fundo)

// ---------- kit compartilhado ----------
function defs(w, h) {
  return `
  <defs>
    <radialGradient id="stage" cx="62%" cy="42%" r="85%">
      <stop offset="0%" stop-color="#1C1C1A"/>
      <stop offset="55%" stop-color="${K2}"/>
      <stop offset="100%" stop-color="${K}"/>
    </radialGradient>
    <linearGradient id="floor" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </linearGradient>
    <filter id="grain">
      <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="2" seed="7"/>
      <feColorMatrix type="matrix" values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.05 0"/>
      <feComposite operator="over" in2="SourceGraphic"/>
    </filter>
    <filter id="glow" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="${Math.round(w * 0.012)}" result="b"/>
      <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>`;
}

function base(w, h) {
  return `<rect width="${w}" height="${h}" fill="url(#stage)"/>
  <rect width="${w}" height="${h}" fill="transparent" filter="url(#grain)"/>`;
}

// réguas de medição nas bordas — instrumento, não enfeite
function ticks(w, h, m) {
  let t = '';
  const n = 24, len = m * 0.32;
  for (let i = 1; i < n; i++) {
    const x = m + (w - 2 * m) * (i / n);
    const big = i % 6 === 0;
    t += `<line x1="${x}" y1="${h - m}" x2="${x}" y2="${h - m + (big ? len * 1.7 : len)}" stroke="${big ? S : S2}" stroke-width="${w * 0.0009}"/>`;
  }
  for (let i = 1; i < 14; i++) {
    const y = m + (h - 2 * m) * (i / 14);
    const big = i % 7 === 0;
    t += `<line x1="${m - (big ? len * 1.7 : len)}" y1="${y}" x2="${m}" y2="${y}" stroke="${big ? S : S2}" stroke-width="${w * 0.0009}"/>`;
  }
  return t;
}

// cantoneiras de registro
function corners(w, h, m) {
  const l = m * 0.9, sw = w * 0.0013;
  const c = (x, y, dx, dy) =>
    `<path d="M ${x + dx * l} ${y} L ${x} ${y} L ${x} ${y + dy * l}" fill="none" stroke="${S}" stroke-width="${sw}"/>`;
  return c(m, m, 1, 1) + c(w - m, m, -1, 1) + c(m, h - m, 1, -1) + c(w - m, h - m, -1, -1);
}

// etiqueta técnica carimbada
function label(x, y, size, text, anchor = 'start', color = S) {
  return `<text x="${x}" y="${y}" font-family="Arial" font-size="${size}" fill="${color}" letter-spacing="${size * 0.42}" text-anchor="${anchor}">${text}</text>`;
}

function frame(w, h, fig, name) {
  const m = Math.round(w * 0.045);
  const fs1 = Math.round(w * 0.0128);
  return `
  ${ticks(w, h, m)}
  ${corners(w, h, m)}
  ${label(m, h - m - fs1 * 0.9, fs1, fig, 'start', S)}
  ${label(w - m, m + fs1 * 1.6, fs1, name, 'end', Y)}
  <rect x="${w - m - fs1 * 0.62}" y="${m + fs1 * 2.6}" width="${fs1 * 0.62}" height="${fs1 * 0.62}" fill="${Y}"/>`;
}

// fileiras de repetição — treino como acumulação
function reps(x, y, cols, rows, gap, r, fill, op = 0.8) {
  let s = `<g opacity="${op}">`;
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++)
      s += `<circle cx="${x + j * gap}" cy="${y + i * gap}" r="${r}" fill="${fill}"/>`;
  return s + '</g>';
}

function arc(cx, cy, r, a0, a1, stroke, sw, dash = '', op = 1) {
  const p0 = [cx + r * Math.cos(a0), cy + r * Math.sin(a0)];
  const p1 = [cx + r * Math.cos(a1), cy + r * Math.sin(a1)];
  const large = Math.abs(a1 - a0) > Math.PI ? 1 : 0;
  return `<path d="M ${p0[0]} ${p0[1]} A ${r} ${r} 0 ${large} 1 ${p1[0]} ${p1[1]}" fill="none" stroke="${stroke}" stroke-width="${sw}" ${dash ? `stroke-dasharray="${dash}"` : ''} opacity="${op}" stroke-linecap="round"/>`;
}

// ---------- composições ----------

// HERO GERAL — a máquina do treino: disco solar de ferro subindo, piso em perspectiva
function heroGeral(w, h) {
  const cx = w * 0.68, cy = h * 0.44, R = h * 0.30;
  let floor = '';
  for (let i = 0; i < 11; i++) {
    const t = i / 10;
    const y = h * 0.62 + (h * 0.38) * t * t;
    floor += `<line x1="0" y1="${y}" x2="${w}" y2="${y}" stroke="${S2}" stroke-width="${1.6 + t * 2.4}" opacity="${0.4 + t * 0.35}"/>`;
  }
  for (let i = -6; i <= 10; i++) {
    const xTop = cx + i * w * 0.055;
    const xBot = cx + i * w * 0.16;
    floor += `<line x1="${xTop}" y1="${h * 0.62}" x2="${xBot}" y2="${h}" stroke="${S2}" stroke-width="2" opacity="0.45"/>`;
  }
  return `
  ${floor}
  ${arc(cx, cy, R * 1.45, -0.2, 1.35, S, w * 0.0016, `${w * 0.002} ${w * 0.012}`, 0.9)}
  ${arc(cx, cy, R * 1.72, 2.3, 3.6, S2, w * 0.0016, '', 0.8)}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${Y}" filter="url(#glow)"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.66}" fill="none" stroke="${K}" stroke-width="${w * 0.0022}" opacity="0.5"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.33}" fill="none" stroke="${K}" stroke-width="${w * 0.0022}" opacity="0.5"/>
  <circle cx="${cx - R * 0.30}" cy="${cy - R * 0.34}" r="${R * 0.42}" fill="#FFFFFF" opacity="0.10"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.045}" fill="${K}"/>
  <line x1="${cx - R * 1.9}" y1="${cy}" x2="${cx + R * 1.9}" y2="${cy}" stroke="${K}" stroke-width="${h * 0.016}" opacity="0.9"/>
  <line x1="${cx - R * 1.9}" y1="${cy}" x2="${cx + R * 1.9}" y2="${cy}" stroke="${S}" stroke-width="${h * 0.004}"/>
  <rect x="${cx - R * 1.98}" y="${cy - h * 0.028}" width="${R * 0.16}" height="${h * 0.056}" fill="${S}"/>
  <rect x="${cx + R * 1.82}" y="${cy - h * 0.028}" width="${R * 0.16}" height="${h * 0.056}" fill="${S}"/>
  ${reps(w * 0.075, h * 0.14, 6, 3, w * 0.017, w * 0.0022, S, 0.6)}
  <rect width="${w}" height="${h}" fill="url(#floor)"/>`;
}

// HERO LUTAS — oito vetores (a arte das oito armas), disco de impacto
function heroLutas(w, h) {
  const cx = w * 0.70, cy = h * 0.46, R = h * 0.26;
  let rays = '';
  for (let i = 0; i < 8; i++) {
    const a = (Math.PI * 2 * i) / 8 - Math.PI / 8;
    const r0 = R * 1.18, r1 = R * (1.75 + (i % 2) * 0.35);
    rays += `<line x1="${cx + r0 * Math.cos(a)}" y1="${cy + r0 * Math.sin(a)}" x2="${cx + r1 * Math.cos(a)}" y2="${cy + r1 * Math.sin(a)}" stroke="${i % 4 === 0 ? Y : S}" stroke-width="${w * (i % 4 === 0 ? 0.0042 : 0.0018)}" stroke-linecap="round"/>`;
    const at = a + 0.05;
    rays += `<circle cx="${cx + r1 * 1.06 * Math.cos(at)}" cy="${cy + r1 * 1.06 * Math.sin(at)}" r="${w * 0.0022}" fill="${S}"/>`;
  }
  return `
  ${arc(cx, cy, R * 2.35, 2.6, 4.1, S2, w * 0.0015, '', 0.9)}
  ${arc(cx, cy, R * 2.1, -0.6, 0.8, S, w * 0.0015, `${w * 0.002} ${w * 0.01}`)}
  ${rays}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${S}" stroke-width="${w * 0.0018}"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.72}" fill="${Y}" filter="url(#glow)"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.30}" fill="${K}" opacity="0.18"/>
  <path d="M ${cx - R * 2.5} ${cy + R * 1.9} L ${cx - R * 0.4} ${cy + R * 0.42}" stroke="${Y}" stroke-width="${w * 0.005}" stroke-linecap="round"/>
  <circle cx="${cx - R * 2.5}" cy="${cy + R * 1.9}" r="${w * 0.006}" fill="${Y}"/>
  ${reps(w * 0.075, h * 0.16, 4, 5, w * 0.016, w * 0.002, S, 0.55)}
  <rect width="${w}" height="${h}" fill="url(#floor)"/>`;
}

// HERO BEM-ESTAR — respiração em arcos, esfera em equilíbrio
function heroBemestar(w, h) {
  const cx = w * 0.70, cy = h * 0.58, R = h * 0.21;
  let breath = '';
  for (let i = 1; i <= 5; i++) {
    breath += arc(cx, cy - R, R * (0.9 + i * 0.42), Math.PI * 1.12, Math.PI * 1.88, i === 3 ? Y : S, w * (i === 3 ? 0.0032 : 0.0014), i % 2 ? '' : `${w * 0.003} ${w * 0.011}`, 1 - i * 0.12);
  }
  const beamY = cy + R * 0.98;
  return `
  ${breath}
  <line x1="${w * 0.30}" y1="${beamY}" x2="${w * 0.97}" y2="${beamY}" stroke="${S}" stroke-width="${w * 0.0022}"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${Y}" filter="url(#glow)"/>
  <circle cx="${cx - R * 0.28}" cy="${cy - R * 0.30}" r="${R * 0.5}" fill="#FFFFFF" opacity="0.10"/>
  <circle cx="${cx}" cy="${beamY}" r="${w * 0.004}" fill="${K}" stroke="${S}" stroke-width="${w * 0.0012}"/>
  ${arc(cx, cy, R * 1.28, -0.5, 0.62, S, w * 0.0015, `${w * 0.0024} ${w * 0.009}`)}
  ${reps(w * 0.075, h * 0.15, 5, 4, w * 0.016, w * 0.002, S, 0.5)}
  <rect width="${w}" height="${h}" fill="url(#floor)"/>`;
}

// MUAY THAI — diagrama de golpe: arco de canela, alvo, ângulo medido
function modMuaythai(w, h) {
  const cx = w * 0.60, cy = h * 0.52, R = h * 0.30;
  const a0 = Math.PI * 0.78, a1 = Math.PI * 1.62;
  return `
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${S2}" stroke-width="${w * 0.0018}"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.62}" fill="none" stroke="${S}" stroke-width="${w * 0.0018}"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.24}" fill="${Y}" filter="url(#glow)"/>
  ${arc(cx, cy, R * 1.34, a0, a1, Y, w * 0.006)}
  <path d="M ${cx + R * 1.34 * Math.cos(a1)} ${cy + R * 1.34 * Math.sin(a1)} l ${w * 0.028} ${-w * 0.004} l ${-w * 0.018} ${w * 0.024} z" fill="${Y}"/>
  ${arc(cx, cy, R * 1.6, a0 + 0.12, a1 - 0.12, S, w * 0.0014, `${w * 0.0022} ${w * 0.01}`)}
  <line x1="${cx}" y1="${cy}" x2="${cx + R * 1.34 * Math.cos(a0)}" y2="${cy + R * 1.34 * Math.sin(a0)}" stroke="${S}" stroke-width="${w * 0.0014}"/>
  <line x1="${cx}" y1="${cy}" x2="${cx + R * 1.34 * Math.cos(a1)}" y2="${cy + R * 1.34 * Math.sin(a1)}" stroke="${S}" stroke-width="${w * 0.0014}"/>
  ${reps(w * 0.08, h * 0.70, 8, 2, w * 0.02, w * 0.0026, S, 0.6)}
  ${label(w * 0.08, h * 0.24, w * 0.015, 'ÂNGULO DE IMPACTO — 151°', 'start', S)}`;
}

// JIU-JITSU — a arte suave: dois elos entrelaçados, alavanca
function modJiujitsu(w, h) {
  const cx = w * 0.56, cy = h * 0.50, R = h * 0.24;
  const off = R * 0.92;
  return `
  <circle cx="${cx - off / 2}" cy="${cy}" r="${R}" fill="none" stroke="${Y}" stroke-width="${w * 0.0085}" filter="url(#glow)"/>
  <circle cx="${cx + off / 2}" cy="${cy}" r="${R}" fill="none" stroke="${S}" stroke-width="${w * 0.0042}"/>
  ${arc(cx - off / 2, cy, R, -0.7, 0.7, Y, w * 0.0085)}
  <line x1="${w * 0.12}" y1="${h * 0.82}" x2="${w * 0.92}" y2="${h * 0.82}" stroke="${S}" stroke-width="${w * 0.002}"/>
  <polygon points="${cx + off / 2},${h * 0.82 - w * 0.017} ${cx + off / 2 - w * 0.017},${h * 0.82} ${cx + off / 2 + w * 0.017},${h * 0.82}" fill="${S}"/>
  ${arc(cx, cy, R * 1.75, 3.4, 4.6, S2, w * 0.0015, `${w * 0.0025} ${w * 0.011}`)}
  ${reps(w * 0.08, h * 0.70, 8, 2, w * 0.02, w * 0.0026, S, 0.6)}
  ${label(w * 0.08, h * 0.24, w * 0.015, 'FORÇA MÍNIMA — EFEITO MÁXIMO', 'start', S)}`;
}

// FUNCIONAL — kettlebell em órbita de swing
function modFuncional(w, h) {
  const px = w * 0.58, py = h * 0.20;             // pivô (quadril)
  const L = h * 0.52;
  const aRest = Math.PI * 0.62, aTop = Math.PI * 0.30;
  const bx = px + L * Math.cos(aRest), by = py + L * Math.sin(aRest);
  const R = h * 0.115;
  return `
  ${arc(px, py, L, aTop, Math.PI * 0.78, S, w * 0.0016, `${w * 0.0025} ${w * 0.01}`)}
  <path d="M ${px + L * Math.cos(aTop)} ${py + L * Math.sin(aTop)} l ${w * 0.005} ${-w * 0.026} l ${w * 0.02} ${w * 0.016} z" fill="${S}"/>
  <line x1="${px}" y1="${py}" x2="${bx}" y2="${by}" stroke="${S}" stroke-width="${w * 0.0018}"/>
  <circle cx="${px}" cy="${py}" r="${w * 0.005}" fill="${S}"/>
  ${arc(bx, by - R * 1.28, R * 0.62, Math.PI * 0.9, Math.PI * 2.1, Y, w * 0.0105)}
  <circle cx="${bx}" cy="${by}" r="${R}" fill="${Y}" filter="url(#glow)"/>
  <circle cx="${bx - R * 0.3}" cy="${by - R * 0.32}" r="${R * 0.4}" fill="#FFFFFF" opacity="0.12"/>
  ${reps(w * 0.08, h * 0.68, 3, 4, w * 0.021, w * 0.0028, S, 0.6)}
  ${label(w * 0.08, h * 0.22, w * 0.015, 'SWING — POTÊNCIA DE QUADRIL', 'start', S)}`;
}

// TATAME — grade isométrica de placas encaixadas, uma placa acesa
function estTatame(w, h) {
  const tw = w * 0.13, th = tw * 0.5;
  let tiles = '';
  const ox = w * 0.50, oy = h * 0.30;
  for (let r = 0; r < 6; r++) {
    for (let c = -4; c < 5; c++) {
      const x = ox + (c - r) * tw * 0.52;
      const y = oy + (c + r) * th * 0.55;
      if (y > h * 1.05 || x < -tw || x > w + tw) continue;
      const hot = r === 2 && c === 1;
      tiles += `<path d="M ${x} ${y} l ${tw / 2} ${th / 2} l ${-tw / 2} ${th / 2} l ${-tw / 2} ${-th / 2} z"
        fill="${hot ? Y : (r + c) % 2 ? '#1E1E1E' : '#242424'}" stroke="${hot ? Y : '#0A0A0A'}" stroke-width="${w * 0.0016}" ${hot ? 'filter="url(#glow)"' : ''}/>`;
    }
  }
  return `
  ${tiles}
  ${arc(ox + tw * 0.0, oy + th * 2.4, tw * 1.5, Math.PI * 1.15, Math.PI * 1.85, S, w * 0.0016, `${w * 0.0024} ${w * 0.01}`)}
  ${label(w * 0.08, h * 0.16, w * 0.015, 'SEÇÃO A — ÁREA DE QUEDA', 'start', S)}`;
}

// FUNCIONAL (estrutura) — ondas de corda naval ancoradas
function estFuncional(w, h) {
  const y0 = h * 0.52, ax = w * 0.87;
  let ropes = '';
  for (let k = 0; k < 2; k++) {
    const amp = h * (0.10 - k * 0.025), ph = k * Math.PI * 0.9, dy = k * h * 0.16 - h * 0.07;
    let d = `M ${w * 0.06} ${y0 + dy}`;
    for (let x = 0.06; x <= 0.82; x += 0.02) {
      const t = (x - 0.06) / 0.76;
      const yy = y0 + dy + Math.sin(t * Math.PI * 3.4 + ph) * amp * (1 - t * 0.55);
      d += ` L ${w * x} ${yy}`;
    }
    d += ` L ${ax} ${y0 + (k - 0.5) * h * 0.035}`;
    ropes += `<path d="${d}" fill="none" stroke="${k === 0 ? Y : S}" stroke-width="${w * (k === 0 ? 0.009 : 0.0045)}" stroke-linecap="round" ${k === 0 ? 'filter="url(#glow)"' : ''}/>`;
  }
  return `
  ${ropes}
  <circle cx="${ax}" cy="${y0}" r="${w * 0.016}" fill="${K2}" stroke="${S}" stroke-width="${w * 0.002}"/>
  <circle cx="${ax}" cy="${y0}" r="${w * 0.005}" fill="${S}"/>
  ${reps(w * 0.08, h * 0.76, 9, 2, w * 0.02, w * 0.0026, S, 0.6)}
  ${label(w * 0.08, h * 0.18, w * 0.015, 'ONDA — 34 CICLOS / MIN', 'start', S)}`;
}

// PILATES — esfera grande, coluna em curva S de vértebras
function estPilates(w, h) {
  const cx = w * 0.60, cy = h * 0.55, R = h * 0.26;
  let spine = '';
  const n = 12;
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = w * 0.16 + Math.sin(t * Math.PI * 1.6) * w * 0.055;
    const y = h * 0.18 + t * h * 0.62;
    spine += `<circle cx="${x}" cy="${y}" r="${w * 0.0075 - t * w * 0.003}" fill="${i === 4 ? Y : S}" opacity="${0.95 - t * 0.35}"/>`;
  }
  return `
  ${spine}
  ${arc(cx, cy, R * 1.35, Math.PI * 0.95, Math.PI * 1.75, S, w * 0.0016, `${w * 0.0025} ${w * 0.01}`)}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${Y}" filter="url(#glow)"/>
  <circle cx="${cx - R * 0.30}" cy="${cy - R * 0.32}" r="${R * 0.45}" fill="#FFFFFF" opacity="0.11"/>
  <line x1="${cx - R * 1.5}" y1="${cy + R}" x2="${cx + R * 1.6}" y2="${cy + R}" stroke="${S}" stroke-width="${w * 0.002}"/>
  ${label(w * 0.08, h * 0.14, w * 0.015, 'ALINHAMENTO AXIAL', 'start', S)}`;
}

// MUSCULAÇÃO — vista frontal da barra: anilhas concêntricas, serrilha medida
function estMusculacao(w, h) {
  const cx = w * 0.55, cy = h * 0.50;
  const rings = [0.34, 0.27, 0.205, 0.135];
  let plates = '';
  rings.forEach((rr, i) => {
    plates += `<circle cx="${cx}" cy="${cy}" r="${h * rr}" fill="none" stroke="${i === 1 ? Y : S}" stroke-width="${w * (i === 1 ? 0.008 : 0.0028)}" ${i === 1 ? 'filter="url(#glow)"' : ''} opacity="${i === 3 ? 0.7 : 1}"/>`;
  });
  let knurl = '';
  for (let i = 0; i < 28; i++) {
    const a = (Math.PI * 2 * i) / 28;
    const r0 = h * 0.36, r1 = h * 0.385;
    knurl += `<line x1="${cx + r0 * Math.cos(a)}" y1="${cy + r0 * Math.sin(a)}" x2="${cx + r1 * Math.cos(a)}" y2="${cy + r1 * Math.sin(a)}" stroke="${S2}" stroke-width="${w * 0.0016}"/>`;
  }
  return `
  ${knurl}
  ${plates}
  <circle cx="${cx}" cy="${cy}" r="${h * 0.045}" fill="${Y}"/>
  <circle cx="${cx}" cy="${cy}" r="${h * 0.012}" fill="${K}"/>
  ${reps(w * 0.08, h * 0.72, 3, 3, w * 0.021, w * 0.0028, S, 0.6)}
  ${label(w * 0.08, h * 0.16, w * 0.015, 'CARGA — Ø 45 CM', 'start', S)}`;
}

// BLOG — variações menores, mesma língua
function blogMuaythai(w, h) {
  const cx = w * 0.62, cy = h * 0.5, R = h * 0.28;
  return `
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="${S}" stroke-width="${w * 0.002}"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.55}" fill="none" stroke="${S2}" stroke-width="${w * 0.002}"/>
  <circle cx="${cx}" cy="${cy}" r="${R * 0.2}" fill="${Y}" filter="url(#glow)"/>
  <line x1="${w * 0.08}" y1="${h * 0.86}" x2="${cx - R * 0.18}" y2="${cy + R * 0.14}" stroke="${Y}" stroke-width="${w * 0.007}" stroke-linecap="round"/>
  <circle cx="${w * 0.08}" cy="${h * 0.86}" r="${w * 0.008}" fill="${Y}"/>
  ${arc(cx, cy, R * 1.3, -1.1, 0.4, S, w * 0.0018, `${w * 0.003} ${w * 0.012}`)}
  ${label(w * 0.08, h * 0.18, w * 0.017, 'PRIMEIRO GOLPE', 'start', S)}`;
}

function blogJiujitsu(w, h) {
  const cx = w * 0.58, cy = h * 0.52, R = h * 0.24;
  return `
  <circle cx="${cx - R * 0.5}" cy="${cy}" r="${R}" fill="none" stroke="${Y}" stroke-width="${w * 0.009}" filter="url(#glow)"/>
  <circle cx="${cx + R * 0.5}" cy="${cy}" r="${R}" fill="none" stroke="${S}" stroke-width="${w * 0.0045}"/>
  ${arc(cx - R * 0.5, cy, R, -0.65, 0.65, Y, w * 0.009)}
  <line x1="${w * 0.1}" y1="${h * 0.84}" x2="${w * 0.92}" y2="${h * 0.84}" stroke="${S}" stroke-width="${w * 0.0022}"/>
  ${label(w * 0.08, h * 0.18, w * 0.017, 'A ARTE SUAVE', 'start', S)}`;
}

function blogPilates(w, h) {
  const cx = w * 0.6, cy = h * 0.5, R = h * 0.22;
  let br = '';
  for (let i = 1; i <= 4; i++)
    br += arc(cx, cy, R * (1 + i * 0.28), Math.PI * 1.1, Math.PI * 1.9, i === 2 ? Y : S, w * (i === 2 ? 0.0035 : 0.0016), i % 2 ? `${w * 0.003} ${w * 0.011}` : '', 1 - i * 0.14);
  return `
  ${br}
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="${Y}" filter="url(#glow)"/>
  <circle cx="${cx - R * 0.3}" cy="${cy - R * 0.3}" r="${R * 0.42}" fill="#FFFFFF" opacity="0.12"/>
  ${label(w * 0.08, h * 0.18, w * 0.017, 'RESPIRAR — SUSTENTAR', 'start', S)}`;
}

function blogFuncional(w, h) {
  let grid = '';
  const cols = 10, rows = 4, gx = w * 0.062, gy = h * 0.14;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++) {
      const done = r * cols + c < 27;
      const hot = r * cols + c === 26;
      grid += `<rect x="${w * 0.1 + c * gx}" y="${h * 0.28 + r * gy}" width="${gx * 0.52}" height="${gy * 0.42}" rx="${w * 0.004}"
        fill="${hot ? Y : done ? '#2C2C2C' : 'none'}" stroke="${done ? 'none' : S2}" stroke-width="${w * 0.0016}" ${hot ? 'filter="url(#glow)"' : ''}/>`;
    }
  return `${grid}
  ${label(w * 0.1, h * 0.18, w * 0.017, 'SÉRIE 27 / 40 — VARIAR ESTÍMULO', 'start', S)}`;
}

function blogJump(w, h) {
  const y0 = h * 0.78;
  let traj = '';
  const hops = [[0.10, 0.30, 0.34], [0.34, 0.52, 0.46], [0.52, 0.80, 0.62]];
  hops.forEach(([x0, x1, hh], i) => {
    traj += `<path d="M ${w * x0} ${y0} Q ${w * (x0 + x1) / 2} ${y0 - h * hh} ${w * x1} ${y0}"
      fill="none" stroke="${i === 2 ? Y : S}" stroke-width="${w * (i === 2 ? 0.006 : 0.0022)}"
      ${i === 2 ? 'filter="url(#glow)"' : `stroke-dasharray="${w * 0.004} ${w * 0.01}"`}/>`;
  });
  return `
  <line x1="${w * 0.06}" y1="${y0}" x2="${w * 0.94}" y2="${y0}" stroke="${S}" stroke-width="${w * 0.0025}"/>
  <ellipse cx="${w * 0.80}" cy="${y0}" rx="${w * 0.085}" ry="${h * 0.028}" fill="none" stroke="${Y}" stroke-width="${w * 0.005}"/>
  ${traj}
  <circle cx="${w * 0.80}" cy="${y0 - h * 0.62}" r="${w * 0.012}" fill="${Y}" filter="url(#glow)"/>
  ${label(w * 0.08, h * 0.18, w * 0.017, 'REBOTE — BAIXO IMPACTO', 'start', S)}`;
}

function blogMobilidade(w, h) {
  const cx = w * 0.30, cy = h * 0.74, R = h * 0.46;
  let fan = '';
  const n = 7;
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (Math.PI / 2) * (i / n) - Math.PI * 0.05;
    const hot = i === 5;
    fan += `<line x1="${cx}" y1="${cy}" x2="${cx + R * Math.cos(a)}" y2="${cy + R * Math.sin(a)}" stroke="${hot ? Y : S2}" stroke-width="${w * (hot ? 0.005 : 0.0018)}" ${hot ? 'filter="url(#glow)"' : ''}/>`;
    fan += `<circle cx="${cx + R * 1.05 * Math.cos(a)}" cy="${cy + R * 1.05 * Math.sin(a)}" r="${w * 0.0035}" fill="${hot ? Y : S}"/>`;
  }
  return `
  ${arc(cx, cy, R * 0.72, -Math.PI / 2 - Math.PI * 0.05, -Math.PI * 0.05, S, w * 0.002)}
  ${arc(cx, cy, R * 0.86, -Math.PI / 2 - Math.PI * 0.05, -Math.PI * 0.05, S2, w * 0.0016, `${w * 0.0024} ${w * 0.009}`)}
  ${fan}
  <circle cx="${cx}" cy="${cy}" r="${w * 0.009}" fill="${S}"/>
  ${label(w * 0.62, h * 0.24, w * 0.017, 'AMPLITUDE — 90°', 'start', S)}`;
}

// ---------- montagem ----------
const pieces = [
  { out: 'hero-geral',      w: 1920, h: 1080, fig: 'LT — ESTUDO 01', name: 'LIFE TEAM',    art: heroGeral },
  { out: 'hero-lutas',      w: 1920, h: 1080, fig: 'LT — ESTUDO 02', name: 'OITO ARMAS',   art: heroLutas },
  { out: 'hero-bemestar',   w: 1920, h: 1080, fig: 'LT — ESTUDO 03', name: 'EQUILÍBRIO',   art: heroBemestar },
  { out: 'mod-muaythai',    w: 1000, h: 625,  fig: 'FIG. 01',        name: 'MUAY THAI',    art: modMuaythai },
  { out: 'mod-jiujitsu',    w: 1000, h: 625,  fig: 'FIG. 02',        name: 'JIU-JITSU',    art: modJiujitsu },
  { out: 'mod-funcional',   w: 1000, h: 625,  fig: 'FIG. 03',        name: 'FUNCIONAL',    art: modFuncional },
  { out: 'est-tatame',      w: 1000, h: 750,  fig: 'SEÇÃO A',        name: 'TATAME',       art: estTatame },
  { out: 'est-funcional',   w: 1000, h: 750,  fig: 'SEÇÃO B',        name: 'FUNCIONAL',    art: estFuncional },
  { out: 'est-pilates',     w: 1000, h: 750,  fig: 'SEÇÃO C',        name: 'PILATES',      art: estPilates },
  { out: 'est-musculacao',  w: 1000, h: 750,  fig: 'SEÇÃO D',        name: 'MUSCULAÇÃO',   art: estMusculacao },
  { out: 'blog-muaythai',   w: 900,  h: 506,  fig: 'NOTA 01',        name: 'MUAY THAI',    art: blogMuaythai },
  { out: 'blog-jiujitsu',   w: 900,  h: 506,  fig: 'NOTA 02',        name: 'JIU-JITSU',    art: blogJiujitsu },
  { out: 'blog-pilates',    w: 900,  h: 506,  fig: 'NOTA 03',        name: 'PILATES',      art: blogPilates },
  { out: 'blog-funcional',  w: 900,  h: 506,  fig: 'NOTA 04',        name: 'FUNCIONAL',    art: blogFuncional },
  { out: 'blog-jump',       w: 900,  h: 506,  fig: 'NOTA 05',        name: 'JUMP',         art: blogJump },
  { out: 'blog-mobilidade', w: 900,  h: 506,  fig: 'NOTA 06',        name: 'MOBILIDADE',   art: blogMobilidade }
];

async function build() {
  for (const p of pieces) {
    const W = p.w * 2, H = p.h * 2; // render 2x, downscale for crispness
    const svg = `<svg width="${W}" height="${H}" viewBox="0 0 ${W}" xmlns="http://www.w3.org/2000/svg">
      ${defs(W, H)}
      ${base(W, H)}
      ${p.art(W, H)}
      ${frame(W, H, p.fig, p.name)}
    </svg>`.replace(`viewBox="0 0 ${W}"`, `viewBox="0 0 ${W} ${H}"`);
    const buf = await sharp(Buffer.from(svg))
      .resize(p.w, p.h, { kernel: 'lanczos3' })
      .webp({ quality: 84 })
      .toBuffer();
    fs.writeFileSync(path.join(OUT, p.out + '.webp'), buf);
    fs.writeFileSync(path.join(PREVIEW, p.out + '.webp'), buf);
    console.log(p.out.padEnd(16), p.w + 'x' + p.h, (buf.length / 1024).toFixed(0) + 'KB');
  }
  console.log('\nCinética Noturna — 16 peças renderizadas.');
}
build().catch(e => { console.error(e); process.exit(1); });
