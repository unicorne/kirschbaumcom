import { useState, useEffect, useRef, useCallback } from "react";

/* ════════════════════════════════════════════
   DESIGN TOKEN SYSTEM — Midnight Terminal
   ════════════════════════════════════════════ */
const T = {
  color: {
    void: '#08090d',
    bg: '#0d1117',
    surface: '#161b22',
    surfaceHover: '#1c2128',
    border: '#21262d',
    borderLight: '#30363d',
    blue: '#58a6ff',
    blueGlow: 'rgba(88,166,255,0.35)',
    blueDim: 'rgba(88,166,255,0.08)',
    cyan: '#39d2c0',
    cyanGlow: 'rgba(57,210,192,0.35)',
    green: '#3fb950',
    greenGlow: 'rgba(63,185,80,0.3)',
    red: '#f85149',
    redGlow: 'rgba(248,81,73,0.4)',
    amber: '#d29922',
    amberGlow: 'rgba(210,153,34,0.3)',
    purple: '#bc8cff',
    purpleGlow: 'rgba(188,140,255,0.3)',
    text: '#e6edf3',
    textSec: '#8b949e',
    textMut: '#484f58',
  },
  mobile: false,
  dprCap: 1,
};

/** Update responsive flags — called once per resize in useCanvas */
function updateTokens() {
  const w = window.innerWidth;
  T.mobile = w < 600;
  T.dprCap = Math.min(window.devicePixelRatio || 1, T.mobile ? 2 : 3);
}
updateTokens();

/* ════════════════════════════════════════════
   ANIMATION SPEC DEFINITIONS
   ════════════════════════════════════════════ */
const SPECS = [
  {
    id: 'anomaly-detection',
    title: 'Anomaly Detection',
    subtitle: 'Real-time sensor stream with ML flagging',
    tags: ['time-series', 'autoencoder', 'manufacturing'],
    palette: ['blue', 'green', 'red'],
    description: 'A scrolling time-series chart monitors sensor data. Normal readings flow as a smooth signal. When anomalous spikes occur, a detection system highlights them with confidence scoring.',
  },
  {
    id: 'neural-propagation',
    title: 'Neural Network',
    subtitle: 'Forward propagation through hidden layers',
    tags: ['deep-learning', 'classification', 'pytorch'],
    palette: ['cyan', 'blue', 'green'],
    description: 'A multi-layer network receives input activations. Signals propagate through weighted connections, with neurons firing as activation thresholds are met.',
  },
  {
    id: 'time-series-forecast',
    title: 'Time Series Forecast',
    subtitle: 'Predictive analytics with confidence intervals',
    tags: ['forecasting', 'arima', 'prophet', 'analytics'],
    palette: ['cyan', 'green', 'blue'],
    description: 'Historical data scrolls as a smooth signal. At the forecast boundary, a dashed prediction line extends with a widening confidence interval — uncertainty grows as the horizon extends.',
  },
  {
    id: 'speech-to-text',
    title: 'Speech to Text',
    subtitle: 'Audio waveform to live transcript',
    tags: ['whisper', 'asr', 'audio', 'transformers'],
    palette: ['cyan', 'green', 'amber'],
    description: 'An audio waveform pulses with varying intensity. Below it, words materialize one by one as the speech recognition model processes the audio stream in real time.',
  },
  {
    id: 'style-rewriting',
    title: 'Style Rewriting',
    subtitle: 'Live text transformation via style commands',
    tags: ['fine-tuning', 'llm', 'style-transfer', 'nlp'],
    palette: ['purple', 'cyan', 'amber', 'red', 'green'],
    description: 'A style command is issued and source text visibly dissolves through character scrambling, then re-materializes as the styled output — typed character by character.',
  },
];

/* ════════════════════════════════════════════
   CANVAS HOOK — Standardized animation loop
   ════════════════════════════════════════════ */
function useCanvas(drawFn, playing) {
  const canvasRef = useRef(null);
  const frameRef = useRef();
  const startRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      updateTokens();
      const rect = canvas.getBoundingClientRect();
      const dpr = T.dprCap;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      canvas._w = rect.width;
      canvas._h = rect.height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const loop = (ts) => {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      ctx.clearRect(0, 0, canvas._w, canvas._h);
      drawFn(ctx, canvas._w, canvas._h, t);
      if (playing) frameRef.current = requestAnimationFrame(loop);
    };
    if (playing) frameRef.current = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(frameRef.current); ro.disconnect(); };
  }, [drawFn, playing]);

  return canvasRef;
}

/* ════════════════════════════════════════════
   SHARED DRAWING HELPERS
   ════════════════════════════════════════════ */
function colorWithAlpha(color, alpha) {
  if (color.startsWith('#')) {
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${alpha})`;
  }
  if (color.startsWith('rgba')) return color.replace(/[\d.]+\)$/, `${alpha})`);
  if (color.startsWith('rgb')) return color.replace('rgb', 'rgba').replace(')', `,${alpha})`);
  return color;
}

/** Scale factor: 1.0 at 600px width, scales proportionally */
function S(w) { return Math.max(0.45, w / 600); }

function drawGrid(ctx, w, h, spacing = 40) {
  if (T.mobile) {
    // Simplified grid on mobile — horizontal lines only, fewer of them
    ctx.strokeStyle = T.color.border;
    ctx.lineWidth = 0.5;
    ctx.globalAlpha = 0.3;
    const sp = spacing * Math.max(0.8, S(w)) * 1.5;
    for (let y = 0; y < h; y += sp) {
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.globalAlpha = 1;
    return;
  }
  ctx.strokeStyle = T.color.border;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.5;
  const sp = spacing * Math.max(0.6, S(w));
  for (let x = 0; x < w; x += sp) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
  }
  for (let y = 0; y < h; y += sp) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
  }
  ctx.globalAlpha = 1;
}

function drawGlow(ctx, x, y, radius, color) {
  if (T.mobile) { radius *= 0.7; } // smaller glow on mobile
  const g = ctx.createRadialGradient(x, y, 0, x, y, radius);
  g.addColorStop(0, color);
  g.addColorStop(1, 'transparent');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
}

function drawLabel(ctx, text, x, y, color, size = 10) {
  const fs = T.mobile ? Math.max(11, size) : size;
  ctx.font = `500 ${fs}px 'IBM Plex Mono', monospace`;
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.fillText(text, x, y);
}

/** Set shadowBlur only on desktop — skipped on mobile for GPU perf */
function applyShadow(ctx, color, blur) {
  if (T.mobile) { ctx.shadowBlur = 0; return; }
  ctx.shadowColor = color;
  ctx.shadowBlur = blur;
}

/* ════════════════════════════════════════════
   ANIMATION 1: ANOMALY DETECTION STREAM
   ════════════════════════════════════════════ */
function drawAnomaly(ctx, w, h, t) {
  drawGrid(ctx, w, h);
  const s = S(w);

  const midY = h * 0.5;
  const amp = h * 0.15;
  const scroll = t * 60;
  const anomalyInterval = 300;
  const step = T.mobile ? 2.5 : 1.5;

  ctx.fillStyle = T.color.blueDim;
  ctx.fillRect(0, midY - amp * 1.1, w, amp * 2.2);

  ctx.beginPath();
  ctx.strokeStyle = T.color.blue;
  ctx.lineWidth = 2 * s;
  applyShadow(ctx, T.color.blueGlow, 8 * s);

  let anomalyXScreen = null;
  let anomalyPeak = 0;

  for (let px = 0; px < w; px += step) {
    const dataX = px + scroll;
    let val = Math.sin(dataX * 0.025) * 0.6
            + Math.sin(dataX * 0.067) * 0.25
            + Math.sin(dataX * 0.13 + 1) * 0.15;

    const phase = ((dataX % anomalyInterval) / anomalyInterval);
    if (phase > 0.82 && phase < 0.92) {
      const p = (phase - 0.82) / 0.1;
      const spike = Math.sin(p * Math.PI) * 2.2;
      val += spike;
      if (spike > anomalyPeak) { anomalyPeak = spike; anomalyXScreen = px; }
    }

    const y = midY - val * amp;
    if (px === 0) ctx.moveTo(px, y); else ctx.lineTo(px, y);
  }
  ctx.stroke();
  ctx.shadowBlur = 0;

  if (anomalyXScreen !== null) {
    const bw = 50 * s;
    const bx = anomalyXScreen - bw / 2;
    const by = midY - amp * 2.5;
    const bh = amp * 3.5;

    ctx.strokeStyle = T.color.red;
    ctx.lineWidth = 1.5 * s;
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.strokeRect(bx, by, bw, bh);
    ctx.setLineDash([]);

    drawGlow(ctx, anomalyXScreen, midY - anomalyPeak * amp, 30 * s, T.color.redGlow);

    const conf = (0.85 + Math.sin(t * 3) * 0.1).toFixed(2);
    const fs = Math.max(8, 10 * s);
    ctx.fillStyle = T.color.surface;
    ctx.globalAlpha = 0.9;
    const badgeW = 92 * s;
    const badgeH = 20 * s;
    const badgeX = anomalyXScreen - badgeW / 2;
    const badgeY = by - 24 * s;
    ctx.beginPath();
    ctx.roundRect(badgeX, badgeY, badgeW, badgeH, 4 * s);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = T.color.red;
    ctx.lineWidth = 1;
    ctx.stroke();
    drawLabel(ctx, `ANOMALY ${conf}`, anomalyXScreen, badgeY + badgeH * 0.7, T.color.red, fs);
  }

  const statusFs = Math.max(7, 9 * s);
  drawLabel(ctx, 'SENSOR STREAM — LIVE', 55 * s + 16, 16 * s, T.color.textMut, statusFs);
  const dot = Math.sin(t * 4) > 0 ? T.color.green : T.color.textMut;
  ctx.beginPath();
  ctx.arc(14 * s, 12 * s, Math.max(3, 3.5 * s), 0, Math.PI * 2);
  ctx.fillStyle = dot;
  ctx.fill();
}

/* ════════════════════════════════════════════
   ANIMATION 2: NEURAL NETWORK PROPAGATION
   ════════════════════════════════════════════ */
const NN_LAYERS_FULL = [3, 5, 6, 5, 2];
const NN_LAYERS_MOBILE = [2, 4, 4, 2];
let nnParticles = [];
let nnLastSpawn = 0;

function drawNeural(ctx, w, h, t) {
  drawGrid(ctx, w, h, 50);
  const s = S(w);
  const layers = T.mobile ? NN_LAYERS_MOBILE : NN_LAYERS_FULL;
  const maxParticles = T.mobile ? 40 : 80;

  const padX = 35 * s + 10;
  const padY = 25 * s + 10;
  const layerSpacing = (w - padX * 2) / (layers.length - 1);

  const nodes = layers.map((count, li) => {
    const x = padX + li * layerSpacing;
    const totalH = h - padY * 2;
    const spacing = totalH / (count + 1);
    return Array.from({ length: count }, (_, ni) => ({ x, y: padY + spacing * (ni + 1), activation: 0 }));
  });

  ctx.lineWidth = 0.6;
  for (let li = 0; li < nodes.length - 1; li++) {
    for (const a of nodes[li]) {
      for (const b of nodes[li + 1]) {
        ctx.strokeStyle = T.color.border;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }

  if (t - nnLastSpawn > (T.mobile ? 0.5 : 0.35)) {
    nnLastSpawn = t;
    nnParticles.push({
      layer: 0, srcIdx: Math.floor(Math.random() * layers[0]),
      tgtIdx: Math.floor(Math.random() * layers[1]),
      progress: 0, speed: 0.8 + Math.random() * 0.6,
    });
  }

  const newParticles = [];
  for (const p of nnParticles) {
    p.progress += p.speed * 0.016;
    if (p.progress >= 1) {
      const tgtNode = nodes[p.layer + 1]?.[p.tgtIdx];
      if (tgtNode) tgtNode.activation = 1;
      if (p.layer + 2 < layers.length) {
        newParticles.push({ layer: p.layer + 1, srcIdx: p.tgtIdx,
          tgtIdx: Math.floor(Math.random() * layers[p.layer + 2]),
          progress: 0, speed: 0.8 + Math.random() * 0.6 });
      }
    } else {
      newParticles.push(p);
      const src = nodes[p.layer]?.[p.srcIdx];
      const tgt = nodes[p.layer + 1]?.[p.tgtIdx];
      if (src && tgt) {
        const px = src.x + (tgt.x - src.x) * p.progress;
        const py = src.y + (tgt.y - src.y) * p.progress;
        const colors = [T.color.cyan, T.color.blue, T.color.green];
        const c = colors[p.layer % colors.length];
        drawGlow(ctx, px, py, 10 * s, colorWithAlpha(c, 0.5));
        ctx.beginPath(); ctx.arc(px, py, Math.max(2, 2.5 * s), 0, Math.PI * 2); ctx.fillStyle = c; ctx.fill();
      }
    }
  }
  nnParticles = newParticles.slice(-maxParticles);

  const nodeR = Math.max(4, 7 * s);
  for (let li = 0; li < nodes.length; li++) {
    for (const n of nodes[li]) {
      n.activation *= 0.95;
      const r = nodeR + n.activation * 4 * s;
      const colors = T.mobile
        ? [T.color.cyan, T.color.blue, T.color.green, T.color.green]
        : [T.color.cyan, T.color.blue, T.color.blue, T.color.green, T.color.green];
      const c = colors[li] || T.color.blue;
      if (n.activation > 0.1) drawGlow(ctx, n.x, n.y, 20 * s, colorWithAlpha(c, n.activation * 0.4));
      ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, Math.PI * 2);
      ctx.fillStyle = T.color.surface; ctx.fill();
      ctx.strokeStyle = c; ctx.lineWidth = 1.5 * s; ctx.stroke();
      if (n.activation > 0.3) {
        ctx.beginPath(); ctx.arc(n.x, n.y, Math.max(1, r - 3 * s), 0, Math.PI * 2);
        ctx.fillStyle = c; ctx.globalAlpha = n.activation * 0.6; ctx.fill(); ctx.globalAlpha = 1;
      }
    }
  }

  const lblFs = Math.max(7, 9 * s);
  const labels = T.mobile
    ? ['In', 'H1', 'H2', 'Out']
    : (w < 300 ? ['In', 'H1', 'H2', 'H3', 'Out'] : ['Input', 'Hidden 1', 'Hidden 2', 'Hidden 3', 'Output']);
  for (let li = 0; li < nodes.length; li++) {
    drawLabel(ctx, labels[li], padX + li * layerSpacing, h - 8 * s, T.color.textMut, lblFs);
  }
}

/* ════════════════════════════════════════════
   ANIMATION 3: TIME SERIES FORECAST
   ════════════════════════════════════════════ */

// Seeded RNG for deterministic data
let _tsRng = 42;
function tsRand() { _tsRng = (_tsRng * 16807 + 0) % 2147483647; return _tsRng / 2147483647; }

// Generate smooth historical + forecast data once
const TS_TOTAL = 120;
const TS_SPLIT = 72;
const _tsRaw = [];
{ let v = 60; _tsRng = 42;
  for (let i = 0; i < TS_TOTAL; i++) {
    const cycle = Math.sin(i * 0.06) * 8 + Math.sin(i * 0.13) * 4;
    v += 0.15 + (tsRand() - 0.48) * 3;
    _tsRaw.push(v + cycle);
  }
}
const TS_DATA = [];
{ const W = 4;
  for (let i = 0; i < _tsRaw.length; i++) {
    let sum = 0, c = 0;
    for (let j = Math.max(0, i - W); j <= Math.min(_tsRaw.length - 1, i + W); j++) { sum += _tsRaw[j]; c++; }
    TS_DATA.push(sum / c);
  }
}
const TS_MIN = Math.min(...TS_DATA) - 30;
const TS_MAX = Math.max(...TS_DATA) + 30;

function tsCiWidth(i) {
  if (i <= TS_SPLIT) return 0;
  const t = (i - TS_SPLIT) / (TS_TOTAL - TS_SPLIT);
  return 4 + t * t * 22;
}

function drawTimeSeries(ctx, w, h, t) {
  drawGrid(ctx, w, h);
  const s = S(w);
  const pad = { top: 22 * s, right: 12 * s, bottom: 28 * s, left: 12 * s };

  const xOf = (i) => pad.left + (i / (TS_TOTAL - 1)) * (w - pad.left - pad.right);
  const yOf = (v) => pad.top + (1 - (v - TS_MIN) / (TS_MAX - TS_MIN)) * (h - pad.top - pad.bottom);

  // Looping reveal: 10s cycle
  const cycleDur = 10;
  const cycleT = (t % cycleDur) / cycleDur;
  const revealIdx = cycleT * (TS_TOTAL - 1);
  const splitX = xOf(TS_SPLIT);

  // Confidence interval fill
  if (revealIdx > TS_SPLIT) {
    const forecastEnd = Math.min(Math.floor(revealIdx), TS_TOTAL - 1);
    ctx.save();
    ctx.beginPath();
    for (let i = TS_SPLIT; i <= forecastEnd; i++) {
      const x = xOf(i), ci = tsCiWidth(i);
      const y = yOf(TS_DATA[i] + ci);
      i === TS_SPLIT ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    for (let i = forecastEnd; i >= TS_SPLIT; i--) {
      ctx.lineTo(xOf(i), yOf(TS_DATA[i] - tsCiWidth(i)));
    }
    ctx.closePath();
    const ciGrad = ctx.createLinearGradient(splitX, 0, xOf(TS_TOTAL - 1), 0);
    ciGrad.addColorStop(0, 'rgba(0,229,204,0.0)');
    ciGrad.addColorStop(0.3, 'rgba(0,229,204,0.06)');
    ciGrad.addColorStop(1, 'rgba(0,229,204,0.1)');
    ctx.fillStyle = ciGrad;
    ctx.fill();
    ctx.restore();
  }

  // "Now" dashed vertical line
  if (revealIdx >= TS_SPLIT) {
    ctx.save();
    ctx.setLineDash([4 * s, 4 * s]);
    ctx.strokeStyle = T.color.border;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(splitX, pad.top);
    ctx.lineTo(splitX, h - pad.bottom);
    ctx.stroke();
    ctx.restore();
    drawLabel(ctx, 'NOW', splitX, h - pad.bottom + 12 * s, T.color.textMut, Math.max(7, 8 * s));
  }

  // Historical line (solid, green-cyan)
  const histEnd = Math.min(Math.floor(revealIdx), TS_SPLIT);
  if (histEnd > 0) {
    ctx.save();
    applyShadow(ctx, T.color.cyanGlow, 10 * s);
    ctx.strokeStyle = T.color.cyan;
    ctx.lineWidth = 2 * s;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    const step = T.mobile ? 2 : 1;
    for (let i = 0; i <= histEnd; i += step) {
      const x = xOf(i), y = yOf(TS_DATA[i]);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Forecast line (dashed, lighter cyan)
  if (revealIdx > TS_SPLIT) {
    const forecastEnd = Math.min(Math.floor(revealIdx), TS_TOTAL - 1);
    ctx.save();
    applyShadow(ctx, T.color.blueGlow, 12 * s);
    const fGrad = ctx.createLinearGradient(splitX, 0, xOf(TS_TOTAL - 1), 0);
    fGrad.addColorStop(0, colorWithAlpha(T.color.blue, 0.9));
    fGrad.addColorStop(0.6, colorWithAlpha(T.color.blue, 0.6));
    fGrad.addColorStop(1, colorWithAlpha(T.color.blue, 0.25));
    ctx.strokeStyle = fGrad;
    ctx.lineWidth = 2 * s;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.setLineDash([6 * s, 3 * s]);
    ctx.beginPath();
    const step = T.mobile ? 2 : 1;
    for (let i = TS_SPLIT; i <= forecastEnd; i += step) {
      const x = xOf(i), y = yOf(TS_DATA[i]);
      i === TS_SPLIT ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  // Drawing tip dot
  if (revealIdx > 0) {
    const tipIdx = Math.min(Math.floor(revealIdx), TS_TOTAL - 1);
    const tx = xOf(tipIdx), ty = yOf(TS_DATA[tipIdx]);
    const isForecast = tipIdx > TS_SPLIT;
    ctx.save();
    ctx.beginPath();
    ctx.arc(tx, ty, Math.max(2.5, 3.5 * s), 0, Math.PI * 2);
    ctx.fillStyle = isForecast ? T.color.blue : T.color.cyan;
    applyShadow(ctx, isForecast ? T.color.blueGlow : T.color.cyanGlow, 14 * s);
    ctx.fill();
    ctx.restore();
  }

  // Forecast label
  if (revealIdx > TS_SPLIT + 5) {
    const lblX = splitX + 20 * s;
    const lblY = pad.top + 10 * s;
    const fs = Math.max(7, 9 * s);
    ctx.font = `500 ${fs}px 'IBM Plex Mono', monospace`;
    ctx.fillStyle = T.color.blue;
    ctx.textAlign = 'left';
    ctx.globalAlpha = Math.min(1, (revealIdx - TS_SPLIT - 5) / 10);
    ctx.fillText('FORECAST', lblX, lblY);
    ctx.globalAlpha = 1;
  }

  // Top-left status
  const statusFs = Math.max(7, 9 * s);
  drawLabel(ctx, 'TIME SERIES — FORECAST', 65 * s + 16, 14 * s, T.color.textMut, statusFs);

  // Bottom axis labels
  const months = T.mobile ? ['Jan', 'Jul', 'Dec'] : ['Jan', 'Mar', 'Jun', 'Sep', 'Dec'];
  const axFs = Math.max(6, 7 * s);
  for (let i = 0; i < months.length; i++) {
    const x = pad.left + (i / (months.length - 1)) * (w - pad.left - pad.right);
    drawLabel(ctx, months[i], x, h - 6 * s, T.color.textMut, axFs);
  }
}

/* ════════════════════════════════════════════
   ANIMATION 4: SPEECH TO TEXT
   ════════════════════════════════════════════ */
const STT_SENTENCES = [
  'Transforming voice into actionable insights',
  'Real-time transcription with deep neural networks',
  'Whisper processes audio in spectral embeddings',
];

function drawSpeechToText(ctx, w, h, t) {
  drawGrid(ctx, w, h);
  const s = S(w);
  const mono = "'IBM Plex Mono', monospace";

  const cycleDur = 8;
  const cycleIdx = Math.floor(t / cycleDur) % STT_SENTENCES.length;
  const cycleT = (t % cycleDur) / cycleDur;
  const sentence = STT_SENTENCES[cycleIdx];
  const words = sentence.split(' ');

  // — WAVEFORM SECTION (top 45%) —
  const waveH = h * 0.42;
  const waveMidY = waveH * 0.5;
  // Intensity ramps up 0→0.2, holds 0.2→0.75, ramps down 0.75→0.85, idle 0.85→1.0
  let intensity;
  if (cycleT < 0.12) intensity = cycleT / 0.12;
  else if (cycleT < 0.72) intensity = 1;
  else if (cycleT < 0.85) intensity = 1 - (cycleT - 0.72) / 0.13;
  else intensity = 0.08;

  const waveConfigs = [
    { freq: 1.2, speed: 0.6, amp: 0.28, color: T.color.cyan, alpha: 0.5, width: 2 },
    { freq: 1.8, speed: 0.85, amp: 0.2, color: T.color.blue, alpha: 0.35, width: 1.5 },
    { freq: 2.5, speed: 1.1, amp: 0.14, color: T.color.cyan, alpha: 0.2, width: 1.2 },
  ];
  const waveStep = T.mobile ? 3 : 2;

  for (const wave of waveConfigs) {
    ctx.beginPath();
    ctx.strokeStyle = colorWithAlpha(wave.color, wave.alpha * intensity);
    ctx.lineWidth = wave.width * s;
    ctx.lineCap = 'round';
    for (let x = 0; x <= w; x += waveStep) {
      const nx = x / w;
      const env = Math.sin(nx * Math.PI);
      const wobble = 1 + 0.15 * Math.sin(t * 0.3 + nx * 4);
      const y = waveMidY + Math.sin(nx * Math.PI * 2 * wave.freq + t * wave.speed)
        * wave.amp * waveH * env * intensity * wobble
        + Math.sin(nx * Math.PI * 5.7 + t * 0.4) * 3 * s * intensity;
      if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  // Center glow on waveform when active
  if (intensity > 0.2) {
    drawGlow(ctx, w / 2, waveMidY, 60 * s * intensity, colorWithAlpha(T.color.cyanGlow, 0.3 * intensity));
  }

  // — DIVIDER —
  const divY = waveH + 6 * s;
  ctx.strokeStyle = T.color.border;
  ctx.lineWidth = 0.5;
  ctx.globalAlpha = 0.5;
  ctx.beginPath(); ctx.moveTo(16 * s, divY); ctx.lineTo(w - 16 * s, divY); ctx.stroke();
  ctx.globalAlpha = 1;

  // — TRANSCRIPT SECTION (bottom) —
  const txtY = divY + 20 * s;
  const txtFs = Math.max(11, 16 * s);
  const wordSpacing = 5 * s;
  // How many words are visible — proportional to cycleT (speech portion 0.12→0.72)
  const speechProgress = Math.max(0, Math.min(1, (cycleT - 0.12) / 0.6));
  const visibleWords = Math.floor(speechProgress * words.length);

  ctx.font = `400 ${txtFs}px ${mono}`;
  ctx.textAlign = 'left';

  // Wrap if needed
  const maxW = w - 32 * s;
  const lines = [];
  let line = [], lineW = 0;
  for (let i = 0; i < words.length; i++) {
    const ww = ctx.measureText(words[i]).width;
    if (lineW + ww + (line.length > 0 ? wordSpacing : 0) > maxW && line.length > 0) {
      lines.push(line);
      line = []; lineW = 0;
    }
    line.push(i);
    lineW += ww + (line.length > 1 ? wordSpacing : 0);
  }
  if (line.length) lines.push(line);

  const lineH = txtFs * 1.6;
  let wordCount = 0;
  for (let li = 0; li < lines.length; li++) {
    const indices = lines[li];
    // Measure line width for centering
    let lw = 0;
    for (let j = 0; j < indices.length; j++) {
      lw += ctx.measureText(words[indices[j]]).width;
      if (j < indices.length - 1) lw += wordSpacing;
    }
    let cx = (w - lw) / 2;
    const ly = txtY + li * lineH;

    for (const idx of indices) {
      const word = words[idx];
      const ww = ctx.measureText(word).width;
      const isVisible = idx < visibleWords;
      const isCurrent = idx === visibleWords - 1;

      if (isVisible) {
        // Fade-in effect for recent word
        const age = visibleWords - idx;
        const fadeIn = Math.min(1, age * 0.5 + 0.5);
        ctx.globalAlpha = fadeIn;
        ctx.fillStyle = isCurrent ? T.color.text : T.color.textSec;
        if (isCurrent && !T.mobile) {
          applyShadow(ctx, T.color.cyanGlow, 6 * s);
        }
        ctx.fillText(word, cx, ly);
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      } else {
        ctx.globalAlpha = 0.15;
        ctx.fillStyle = T.color.textMut;
        ctx.fillText(word, cx, ly);
        ctx.globalAlpha = 1;
      }
      cx += ww + wordSpacing;
      wordCount++;
    }
  }

  // Blinking cursor after last visible word
  if (visibleWords > 0 && cycleT < 0.85) {
    const blink = Math.sin(t * 6) > 0;
    if (blink) {
      // Find position of cursor
      let cursorLine = 0, cursorX = 0;
      let count = 0;
      for (let li = 0; li < lines.length; li++) {
        const indices = lines[li];
        let lw = 0;
        for (let j = 0; j < indices.length; j++) {
          lw += ctx.measureText(words[indices[j]]).width;
          if (j < indices.length - 1) lw += wordSpacing;
        }
        let cx = (w - lw) / 2;
        for (const idx of indices) {
          const ww = ctx.measureText(words[idx]).width;
          if (count === visibleWords - 1) {
            cursorX = cx + ww + 3 * s;
            cursorLine = li;
          }
          cx += ww + wordSpacing;
          count++;
        }
      }
      ctx.fillStyle = T.color.cyan;
      ctx.fillRect(cursorX, txtY + cursorLine * lineH - txtFs * 0.75, 2 * s, txtFs);
    }
  }

  // Status labels
  const statusFs = Math.max(7, 9 * s);
  drawLabel(ctx, 'SPEECH TO TEXT — ASR', 60 * s + 16, 14 * s, T.color.textMut, statusFs);

  // Activity indicator
  const dotR = Math.max(3, 3.5 * s);
  const dotColor = intensity > 0.5 ? T.color.green : (intensity > 0.1 ? T.color.amber : T.color.textMut);
  ctx.beginPath();
  ctx.arc(14 * s, 10 * s, dotR, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();

  // Bottom progress bar
  const barY = h - 14 * s, barX = 16 * s, barW = w - 32 * s;
  ctx.fillStyle = T.color.border;
  ctx.beginPath(); ctx.roundRect(barX, barY, barW, 2.5 * s, 2); ctx.fill();
  ctx.fillStyle = T.color.cyan;
  ctx.beginPath(); ctx.roundRect(barX, barY, barW * speechProgress, 2.5 * s, 2); ctx.fill();
}

/* ════════════════════════════════════════════
   ANIMATION 5: STYLE REWRITING
   ════════════════════════════════════════════ */
const STYLE_REWRITES = [
  { command: '> make it sarcastic', commandColor: 'red',
    source: 'The deployment process took longer than expected.',
    result: 'Oh wow, the deployment was late. Shocking. Nobody saw that coming.' },
  { command: '> shorter', commandColor: 'amber',
    source: 'We implemented a comprehensive monitoring solution to track system performance.',
    result: 'We added monitoring.' },
  { command: '> more technical', commandColor: 'cyan',
    source: 'The AI checks images for problems and marks the bad ones.',
    result: 'A CNN-based classifier runs inference on frames, flagging defects via softmax thresholding.' },
  { command: '> corporate speak', commandColor: 'purple',
    source: 'We need to fix the broken search.',
    result: 'We propose synergizing cross-functional resources to optimize discoverability outcomes.' },
  { command: '> like a pirate', commandColor: 'green',
    source: 'The database migration was completed successfully.',
    result: "Arrr! We hauled the data treasure to new shores, not a row lost to the deep!" },
];
const SCRAMBLE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%&*';

function drawStyleRewrite(ctx, w, h, t) {
  drawGrid(ctx, w, h);
  const s = S(w);
  const cycleDuration = 7;
  const cycleIndex = Math.floor(t / cycleDuration) % STYLE_REWRITES.length;
  const cycleT = (t % cycleDuration) / cycleDuration;
  const rw = STYLE_REWRITES[cycleIndex];

  const margin = Math.max(10, 18 * s);
  const maxTextW = w - margin * 2;
  const mono = "'IBM Plex Mono', monospace";
  const cmdFs = Math.max(9, 13 * s);
  const srcFs = Math.max(8, 11 * s);
  const lineH = Math.max(13, 17 * s);
  const labelFs = Math.max(6, 8 * s);

  function wrapText(text, fontSize) {
    ctx.font = `500 ${fontSize}px ${mono}`;
    const words = text.split(' ');
    const lines = []; let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxTextW) { if (line) lines.push(line); line = word; }
      else line = test;
    }
    if (line) lines.push(line);
    return lines;
  }

  const cmdY = Math.max(24, 32 * s);
  const cmdProgress = Math.min(1, cycleT / 0.12);
  const cmdVisible = Math.floor(cmdProgress * rw.command.length);
  const cmdText = rw.command.slice(0, cmdVisible);
  const cmdColor = T.color[rw.commandColor] || T.color.cyan;

  ctx.fillStyle = T.color.surface; ctx.globalAlpha = 0.7;
  ctx.beginPath(); ctx.roundRect(margin - 5, cmdY - cmdFs, maxTextW + 10, cmdFs * 1.8, 4 * s);
  ctx.fill(); ctx.globalAlpha = 1;

  ctx.font = `600 ${cmdFs}px ${mono}`; ctx.textAlign = 'left'; ctx.fillStyle = cmdColor;
  applyShadow(ctx, T.color[rw.commandColor + 'Glow'] || T.color.cyanGlow, 10 * s);
  ctx.fillText(cmdText, margin, cmdY);
  ctx.shadowBlur = 0;

  if (cmdProgress < 1 || (cycleT < 0.18 && Math.sin(t * 8) > 0)) {
    const cx2 = margin + ctx.measureText(cmdText).width + 2;
    ctx.fillStyle = cmdColor; ctx.fillRect(cx2, cmdY - cmdFs * 0.75, 5 * s, cmdFs);
  }

  const srcY = cmdY + cmdFs * 2.2;
  const srcLines = wrapText(rw.source, srcFs);
  const dissolveP = cycleT < 0.18 ? 0 : Math.min(1, (cycleT - 0.18) / 0.27);

  if (dissolveP < 1) {
    ctx.font = `500 ${srcFs}px ${mono}`; ctx.textAlign = 'left';
    for (let li = 0; li < srcLines.length; li++) {
      const line = srcLines[li], ly = srcY + li * lineH;
      for (let ci = 0; ci < line.length; ci++) {
        const cp = Math.min(1, Math.max(0, dissolveP * 1.5 - (ci / line.length) * 0.5));
        if (line[ci] === ' ') continue;
        let dc = line[ci], al = 1;
        if (cp > 0 && cp < 0.7) { if (Math.random() < (cp / 0.7) * 0.8) dc = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]; }
        else if (cp >= 0.7) { al = Math.max(0, 1 - (cp - 0.7) / 0.3); dc = SCRAMBLE[Math.floor(Math.random() * SCRAMBLE.length)]; }
        ctx.globalAlpha = al; ctx.fillStyle = cp > 0 ? T.color.textMut : T.color.textSec;
        ctx.fillText(dc, margin + ctx.measureText(line.slice(0, ci)).width, ly);
      }
    }
    ctx.globalAlpha = 1;
    ctx.font = `400 ${labelFs}px ${mono}`; ctx.fillStyle = T.color.textMut;
    ctx.fillText('SOURCE', margin, srcY - lineH * 0.7);
  }

  const divY = srcY + srcLines.length * lineH + 8 * s;
  if (cycleT > 0.18) {
    const ap = Math.min(1, (cycleT - 0.18) / 0.15);
    ctx.save(); ctx.translate(w / 2, divY);
    const lw = Math.min(50, w * 0.12) * ap;
    ctx.beginPath(); ctx.moveTo(-lw, 0); ctx.lineTo(lw, 0);
    ctx.strokeStyle = cmdColor; ctx.lineWidth = 1; ctx.globalAlpha = 0.5; ctx.stroke(); ctx.globalAlpha = 1;
    const particleCount = T.mobile ? 3 : 5;
    for (let i = 0; i < particleCount; i++) {
      const dt = ((t * 2 + i * 0.4) % 2) / 2;
      const dx = -lw + dt * lw * 2;
      if (dx >= -lw && dx <= lw) {
        drawGlow(ctx, dx, 0, 5 * s, T.color[rw.commandColor + 'Glow'] || T.color.cyanGlow);
        ctx.beginPath(); ctx.arc(dx, 0, 1.5 * s, 0, Math.PI * 2); ctx.fillStyle = cmdColor; ctx.fill();
      }
    }
    const sl = rw.command.replace('> ', '').toUpperCase();
    ctx.font = `600 ${labelFs}px ${mono}`;
    const slw = ctx.measureText(sl).width;
    ctx.fillStyle = T.color.bg; ctx.fillRect(-slw / 2 - 5, -labelFs * 0.8, slw + 10, labelFs * 1.6);
    ctx.fillStyle = cmdColor; ctx.textAlign = 'center'; ctx.fillText(sl, 0, labelFs * 0.3);
    ctx.restore();
  }

  const resultY = divY + 18 * s;
  const resultLines = wrapText(rw.result, srcFs);
  if (cycleT > 0.45) {
    const tp = Math.min(1, (cycleT - 0.45) / 0.35);
    const vc = Math.floor(tp * rw.result.length);
    ctx.font = `400 ${labelFs}px ${mono}`; ctx.textAlign = 'left';
    ctx.fillStyle = cmdColor; ctx.globalAlpha = 0.7;
    ctx.fillText('RESULT', margin, resultY - lineH * 0.7); ctx.globalAlpha = 1;
    ctx.font = `500 ${srcFs}px ${mono}`;
    let cc = 0;
    for (let li = 0; li < resultLines.length; li++) {
      const line = resultLines[li], ly = resultY + li * lineH;
      for (let ci = 0; ci < line.length; ci++) {
        if (cc >= vc) break;
        const isR = cc > vc - 3;
        ctx.fillStyle = isR ? T.color.text : T.color.textSec;
        if (isR) applyShadow(ctx, cmdColor, 4 * s);
        ctx.fillText(line[ci], margin + ctx.measureText(line.slice(0, ci)).width, ly);
        ctx.shadowBlur = 0; cc++;
      }
      if (cc >= vc) break;
    }
    if (tp < 1 || (cycleT < 0.85 && Math.sin(t * 10) > 0)) {
      let cl = 0, rem = vc;
      for (let li = 0; li < resultLines.length; li++) {
        if (rem <= resultLines[li].length) { cl = li; break; }
        rem -= resultLines[li].length;
      }
      ctx.font = `500 ${srcFs}px ${mono}`;
      const cx2 = margin + ctx.measureText((resultLines[cl] || '').slice(0, rem)).width + 2;
      ctx.fillStyle = cmdColor; ctx.fillRect(cx2, resultY + cl * lineH - srcFs * 0.75, 2 * s, srcFs);
    }
  }

  const stFs = Math.max(6, 7 * s);
  drawLabel(ctx, 'STYLE REWRITER', margin + 40 * s, h - 8 * s, T.color.textMut, stFs);
  const phases = ['CMD', 'DISSOLVE', 'REWRITE', 'DONE'];
  const phIdx = cycleT < 0.12 ? 0 : cycleT < 0.45 ? 1 : cycleT < 0.80 ? 2 : 3;
  const phGap = Math.max(18, 26 * s);
  const phStart = w - phases.length * phGap - margin;
  for (let i = 0; i < phases.length; i++) {
    const dx = phStart + i * phGap;
    ctx.beginPath(); ctx.arc(dx, h - 10 * s, 2.5 * s, 0, Math.PI * 2);
    ctx.fillStyle = i === phIdx ? cmdColor : T.color.border; ctx.fill();
    ctx.font = `400 ${Math.max(5, 6 * s)}px ${mono}`;
    ctx.fillStyle = i === phIdx ? cmdColor : T.color.textMut; ctx.textAlign = 'center';
    ctx.fillText(phases[i], dx, h - 3 * s);
  }
}

/* ════════════════════════════════════════════
   ANIMATION STAGE — Standardized wrapper
   ════════════════════════════════════════════ */
function AnimationStage({ drawFn, spec, isSelected, onSelect }) {
  const [playing, setPlaying] = useState(true);
  const canvasRef = useCanvas(drawFn, playing);

  return (
    <div onClick={onSelect} style={{
      background: T.color.surface,
      border: `1px solid ${isSelected ? T.color.blue : T.color.border}`,
      borderRadius: 12, overflow: 'hidden', cursor: 'pointer',
      transition: 'border-color 0.3s, box-shadow 0.3s',
      boxShadow: isSelected ? `0 0 30px ${T.color.blueDim}` : 'none',
    }}>
      <canvas ref={canvasRef}
        style={{ width: '100%', height: 220, display: 'block', background: T.color.bg }} />
      <div style={{ padding: '12px 14px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
          <h3 style={{
            fontFamily: "'Syne', sans-serif", fontSize: 14, fontWeight: 700,
            color: T.color.text, margin: 0, minWidth: 0,
          }}>{spec.title}</h3>
          <button onClick={(e) => { e.stopPropagation(); setPlaying(!playing); }} style={{
            background: T.color.bg, border: `1px solid ${T.color.border}`, borderRadius: 6,
            color: T.color.textSec, fontFamily: "'IBM Plex Mono', monospace",
            fontSize: 9, padding: '3px 8px', cursor: 'pointer', flexShrink: 0,
          }}>
            {playing ? '⏸' : '▶'}
          </button>
        </div>
        <p style={{
          fontFamily: "'Manrope', sans-serif", fontSize: 11, color: T.color.textSec,
          margin: '4px 0 8px', lineHeight: 1.4,
        }}>{spec.subtitle}</p>
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {spec.tags.map(tag => (
            <span key={tag} style={{
              fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: T.color.textMut,
              background: T.color.bg, border: `1px solid ${T.color.border}`,
              borderRadius: 4, padding: '2px 6px',
            }}>{tag}</span>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════
   SPEC VIEWER
   ════════════════════════════════════════════ */
function SpecViewer({ spec }) {
  return (
    <div style={{
      background: T.color.bg, border: `1px solid ${T.color.border}`, borderRadius: 10,
      padding: '12px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
      color: T.color.textSec, lineHeight: 1.7, whiteSpace: 'pre-wrap',
      overflowX: 'auto', wordBreak: 'break-word',
    }}>
      <div style={{ color: T.color.textMut, marginBottom: 6, fontSize: 8, letterSpacing: '0.1em' }}>
        ANIMATION SPEC — {spec.id.toUpperCase()}
      </div>
      {JSON.stringify(spec, null, 2)}
    </div>
  );
}

/* ════════════════════════════════════════════
   BUILD PROMPT TEMPLATE
   ════════════════════════════════════════════ */
const BUILD_PROMPT = `You are building a canvas animation for a portfolio website.

FRAMEWORK RULES:
1. Your animation is a single function: draw(ctx, width, height, time)
2. Use ONLY these color tokens (via T.color object):
   - blue, cyan, green, red, amber, purple (primary palette)
   - [color]Glow variants: blueGlow, cyanGlow, greenGlow, redGlow, amberGlow, purpleGlow
   - bg, surface, border, borderLight (structural)
   - text, textSec, textMut (typography tiers)
   - void, blueDim (special)
3. Always call drawGrid(ctx, w, h) first for the background grid
4. Use drawGlow(ctx, x, y, radius, color) for radial emphasis
5. Use drawLabel(ctx, text, x, y, color, size) for monospace text
6. Use applyShadow(ctx, color, blur) instead of ctx.shadowBlur directly (auto-skips on mobile)
7. Use colorWithAlpha(color, alpha) to create transparent variants
8. RESPONSIVE: const s = S(w); multiply ALL pixel values by s.
   Use Math.max() to set minimums, e.g. Math.max(8, 12 * s).
9. MOBILE: Check T.mobile to adapt:
   - Reduce particle counts by ~50%
   - Increase step size in loops (fewer points drawn)
   - Skip shadowBlur (use applyShadow helper)
   - Use Math.max() for minimum font sizes (11px+)
   - Increase minimum dot/node sizes by 1.5x
10. Keep animations smooth — use the time parameter, not frame counting
11. Status label top-left, progress indicators bottom
12. Return a spec object AND a draw function

SPEC FORMAT:
{
  id: 'kebab-case-id',
  title: 'Display Title',
  subtitle: 'One line description',
  tags: ['tag1', 'tag2'],
  palette: ['blue', 'cyan'],  // which T.color keys are used
  description: 'What the animation visualizes and how it behaves.'
}

Generate the draw function and spec for: [TOPIC]`;

/* ════════════════════════════════════════════
   MAIN APP
   ════════════════════════════════════════════ */
const DRAW_FNS = [drawAnomaly, drawNeural, drawTimeSeries, drawSpeechToText, drawStyleRewrite];

export default function AnimationFramework() {
  const [selected, setSelected] = useState(0);
  const [showPrompt, setShowPrompt] = useState(false);
  const pad = 'max(12px, 3vw)';

  return (
    <div style={{ background: T.color.void, minHeight: '100vh', color: T.color.text, fontFamily: "'Manrope', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=Manrope:wght@300;400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: ${T.color.void}; }
        ::-webkit-scrollbar-thumb { background: ${T.color.border}; border-radius: 3px; }
      `}</style>

      <div style={{ padding: `max(20px, 3vw) ${pad} max(10px, 1.5vw)`, maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: T.color.blue, letterSpacing: '0.15em', marginBottom: 10 }}>
          ANIMATION FRAMEWORK v1.0
        </div>
        <h1 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 'clamp(22px, 5vw, 32px)', fontWeight: 800,
          lineHeight: 1.1, marginBottom: 10,
          background: `linear-gradient(135deg, ${T.color.text} 0%, ${T.color.textSec} 100%)`,
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>Structured Canvas Animations</h1>
        <p style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: T.color.textSec, lineHeight: 1.6, maxWidth: 600 }}>
          Each animation follows a standardized interface: a draw function, a color palette
          from the token system, and a structured spec. Fully responsive — try resizing.
        </p>
        <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
          {['blue', 'cyan', 'green', 'amber', 'red', 'purple'].map(name => (
            <div key={name} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div style={{
                width: 12, height: 12, borderRadius: 3, background: T.color[name],
                boxShadow: `0 0 8px ${T.color[name + 'Glow'] || 'transparent'}`,
              }} />
              <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: T.color.textMut }}>{name}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: `0 ${pad}`, maxWidth: 900, margin: '0 auto' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(220px, 100%), 1fr))',
          gap: 10, marginBottom: 16,
        }}>
          {SPECS.map((spec, i) => (
            <AnimationStage key={spec.id} spec={spec} drawFn={DRAW_FNS[i]}
              isSelected={selected === i} onSelect={() => setSelected(i)} />
          ))}
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(260px, 100%), 1fr))',
          gap: 10, marginBottom: 16,
        }}>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: T.color.textMut, letterSpacing: '0.1em', marginBottom: 6 }}>SPEC DATA</div>
            <SpecViewer spec={SPECS[selected]} />
          </div>
          <div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 8, color: T.color.textMut, letterSpacing: '0.1em', marginBottom: 6 }}>DESCRIPTION</div>
            <div style={{ background: T.color.bg, border: `1px solid ${T.color.border}`, borderRadius: 10, padding: '12px 14px' }}>
              <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700, color: T.color.text, marginBottom: 6 }}>
                {SPECS[selected].title}
              </h3>
              <p style={{ fontSize: 12, color: T.color.textSec, lineHeight: 1.6, marginBottom: 10 }}>
                {SPECS[selected].description}
              </p>
              <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 9, color: T.color.textMut }}>
                Palette: {SPECS[selected].palette.map(c => (
                  <span key={c} style={{
                    display: 'inline-block', width: 10, height: 10, borderRadius: 2,
                    background: T.color[c], marginLeft: 5, verticalAlign: 'middle',
                  }} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 32 }}>
          <button onClick={() => setShowPrompt(!showPrompt)} style={{
            background: T.color.surface, border: `1px solid ${T.color.border}`, borderRadius: 6,
            color: T.color.textSec, fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
            padding: '6px 12px', cursor: 'pointer', marginBottom: showPrompt ? 10 : 0,
          }}>
            {showPrompt ? '▾' : '▸'} LLM BUILD PROMPT
          </button>
          {showPrompt && (
            <div style={{
              background: T.color.bg, border: `1px solid ${T.color.border}`, borderRadius: 10,
              padding: '12px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 10,
              color: T.color.textSec, lineHeight: 1.7, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
            }}>{BUILD_PROMPT}</div>
          )}
        </div>
      </div>
    </div>
  );
}
