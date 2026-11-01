/* ===== WORKFLOW VISUALIZER (self-contained; exposes window.WF) ===== */
(() => {
/* ===== STATE ===== */
const STEPS = [
  { label: 'Read .capx',  color: '#4fc3f7', pill: 'Read',    desc: 'Reading the .capx archive' },
  { label: 'Project',     color: '#7c8cff', pill: 'Project', desc: 'Locating the .caproj file and parsing its XML' },
  { label: 'Addons',      color: '#b388ff', pill: 'Addons',  desc: 'Mapping plugins, behaviors and effects (WebStorage → LocalStorage)' },
  { label: 'Objects',     color: '#ff6ec7', pill: 'Objects', desc: 'Building object types and families' },
  { label: 'Images',      color: '#ffb74d', pill: 'Images',  desc: 'Reading PNG textures and animation frames' },
  { label: 'Layouts',     color: '#ffd54f', pill: 'Layouts', desc: 'Converting layers and instances' },
  { label: 'Events',      color: '#69f0ae', pill: 'Events',  desc: 'Translating event sheets, conditions and actions' },
  { label: 'Build .c3p',  color: '#40e0d0', pill: 'Package', desc: 'Writing project files and zipping the .c3p' }
];
const PALETTE = STEPS.map(s => s.color);
const SPEED = 480, MIN_DWELL = 300, MOBILE_BELOW = 620, R = 22, TAU = Math.PI * 2;
const STAT_DEFS = [['size', 'Archive'], ['files', 'Files'], ['addons', 'Addons'], ['objects', 'Objects'], ['images', 'Images'],
  ['layouts', 'Layouts'], ['sheets', 'Sheets'], ['warn', 'Warnings'], ['time', 'Time']];
const S = { run: 0, running: false, finished: false, failed: false, mobile: false, ready: false, W: 1000, H: 420, dpr: 1,
  nodes: [], segs: [], ns: [], from: 0, t: 0, target: 0, moving: false, arrive: null, trail: [], parts: [],
  done: 0, warn: 0, activeSince: 0, startTime: 0, raf: 0, last: 0 };

/* ===== DOM REFS ===== */
const $ = id => document.getElementById(id);
const panel = $('wf'), stage = $('wfStage'), cv = $('wfCanvas'), ctx = cv.getContext('2d');
const pillsEl = $('wfPills'), fillEl = $('wfFill'), pctEl = $('wfPct'), badgeEl = $('wfBadge'), fileEl = $('wfFile');
const dlEl = $('wfDl'), capT = $('wfCapT'), capL = $('wfCapL'), toastsEl = $('wfToasts'), statsEl = $('wfStats');
const pills = [], statEls = {};

/* ===== UTILS ===== */
const sleep = ms => new Promise(r => setTimeout(r, ms));
const rand = (a, b) => a + Math.random() * (b - a);
const fmtSize = b => b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
const dwell = () => sleep(Math.max(0, MIN_DWELL - (performance.now() - S.activeSince)));
function rr(c, x, y, w, h, r) {            /* rounded rect with fallback */
  c.beginPath();
  if (c.roundRect) { c.roundRect(x, y, w, h, r); return; }
  r = Math.min(r, w / 2, h / 2);
  c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath();
}
function setStat(k, v) { if (statEls[k] && v !== undefined) statEls[k].textContent = typeof v === 'number' ? v.toLocaleString() : v; }
function setPill(i, cls) { pills[i].className = 'wf-pill' + (cls ? ' ' + cls : ''); }
function setBadge(txt, cls) { badgeEl.textContent = txt; badgeEl.className = 'wf-badge' + (cls ? ' ' + cls : ''); }
function setProgress(n) { const p = n / STEPS.length; fillEl.style.width = (p * 100) + '%'; pctEl.textContent = Math.round(p * 100) + '%'; }
function toast(msg, color) {
  const d = document.createElement('div'); d.className = 'wf-toast'; d.style.setProperty('--c', color || '#4fc3f7'); d.textContent = msg;
  toastsEl.append(d); while (toastsEl.children.length > 4) toastsEl.firstChild.remove();
  setTimeout(() => { d.classList.add('out'); setTimeout(() => d.remove(), 320); }, 3200);
}

/* ===== LAYOUT (desktop zig-zag 1000x420, mobile vertical zig-zag 400x700) ===== */
function layout() {
  S.mobile = (stage.clientWidth || 1000) < MOBILE_BELOW; S.ready = true;
  panel.classList.toggle('mob', S.mobile);
  S.W = S.mobile ? 400 : 1000; S.H = S.mobile ? 700 : 420;
  S.dpr = Math.min(window.devicePixelRatio || 1, 2);
  cv.width = Math.round(S.W * S.dpr); cv.height = Math.round(S.H * S.dpr);
  const n = STEPS.length;
  S.nodes = STEPS.map((_, i) => S.mobile
    ? { x: i % 2 ? 240 : 160, y: 54 + i * ((S.H - 108) / (n - 1)) }
    : { x: 70 + i * (860 / (n - 1)), y: [255, 125, 285, 120, 290, 130, 275, 185][i] });
  S.segs = [];
  for (let i = 0; i < n - 1; i++) {
    const a = S.nodes[i], b = S.nodes[i + 1];
    const c1 = S.mobile ? { x: a.x, y: a.y + (b.y - a.y) * .55 } : { x: a.x + (b.x - a.x) * .55, y: a.y };
    const c2 = S.mobile ? { x: b.x, y: b.y - (b.y - a.y) * .55 } : { x: b.x - (b.x - a.x) * .55, y: b.y };
    const pts = [], cum = [0]; let len = 0;
    for (let k = 0; k <= 48; k++) {
      const t = k / 48, u = 1 - t;
      const p = { x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
                  y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y };
      if (k) { len += Math.hypot(p.x - pts[k - 1].x, p.y - pts[k - 1].y); cum.push(len); }
      pts.push(p);
    }
    S.segs.push({ a, b, c1, c2, pts, cum, len });
  }
}
function segPos(i, t) {
  const s = S.segs[i], d = Math.max(0, Math.min(1, t)) * s.len; let k = 1;
  while (k < s.cum.length - 1 && s.cum[k] < d) k++;
  const c0 = s.cum[k - 1], c1 = s.cum[k], f = c1 > c0 ? (d - c0) / (c1 - c0) : 0, p = s.pts[k - 1], q = s.pts[k];
  return { x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f };
}
const packetPos = () => S.from >= S.segs.length ? S.nodes[S.nodes.length - 1] : segPos(S.from, S.t);

/* ===== CANVAS RENDER LOOP ===== */
function draw() {
  if (!S.nodes.length) return;
  const c = ctx, W = S.W, H = S.H, tm = performance.now() / 1000, n0 = S.nodes[0];
  const sc = (cv.clientWidth || W) / W, fs = Math.max(11, Math.min(S.mobile ? 14 : 17, 12.5 / sc));
  c.setTransform(S.dpr, 0, 0, S.dpr, 0, 0); c.clearRect(0, 0, W, H);
  c.lineCap = 'round'; c.lineJoin = 'round';
  const trace = () => { c.beginPath(); c.moveTo(n0.x, n0.y); S.segs.forEach(s => c.bezierCurveTo(s.c1.x, s.c1.y, s.c2.x, s.c2.y, s.b.x, s.b.y)); };
  trace(); c.lineWidth = 28; c.strokeStyle = 'rgba(80,140,220,0.12)'; c.stroke();
  trace(); c.lineWidth = 4;  c.strokeStyle = 'rgba(80,140,220,0.25)'; c.stroke();
  if (S.from > 0 || S.t > 0) {                           /* energized part of the circuit */
    c.save(); c.beginPath(); c.moveTo(n0.x, n0.y);
    for (let i = 0; i < Math.min(S.from, S.segs.length); i++) S.segs[i].pts.forEach(p => c.lineTo(p.x, p.y));
    if (S.from < S.segs.length && S.t > 0) {
      const s = S.segs[S.from], d = S.t * s.len;
      for (let k = 1; k < s.pts.length && s.cum[k] <= d; k++) c.lineTo(s.pts[k].x, s.pts[k].y);
      const p = segPos(S.from, S.t); c.lineTo(p.x, p.y);
    }
    c.lineWidth = 4; c.strokeStyle = S.failed ? 'rgba(255,82,82,.7)' : 'rgba(79,195,247,.75)';
    c.shadowColor = '#4fc3f7'; c.shadowBlur = 14; c.stroke(); c.restore();
  }
  S.trail.forEach(t => { c.globalAlpha = Math.max(0, t.life) * .55; c.fillStyle = '#4fc3f7'; c.beginPath(); c.arc(t.x, t.y, 3.2 * t.life, 0, TAU); c.fill(); });
  c.globalAlpha = 1;

  S.nodes.forEach((n, i) => {                             /* nodes + labels */
    const st = S.ns[i], col = STEPS[i].color; c.save();
    if (st === 1) {
      const pulse = Math.sin(tm * 5);
      c.beginPath(); c.arc(n.x, n.y, R + 7 + pulse * 4, 0, TAU); c.globalAlpha = .35 + .25 * pulse;
      c.lineWidth = 3; c.strokeStyle = col; c.shadowColor = col; c.shadowBlur = 20; c.stroke(); c.globalAlpha = 1;
    }
    c.beginPath(); c.arc(n.x, n.y, R, 0, TAU);
    if (st === 0) {
      c.fillStyle = '#1b2330'; c.fill(); c.lineWidth = 3; c.strokeStyle = col; c.globalAlpha = .8; c.stroke(); c.globalAlpha = .7;
      c.fillStyle = col; c.beginPath(); c.arc(n.x, n.y, 4, 0, TAU); c.fill();
    } else {
      c.fillStyle = st === 3 ? '#ff5252' : col; c.shadowColor = st === 3 ? '#ff5252' : col; c.shadowBlur = st === 1 ? 24 : 10; c.fill();
      c.shadowBlur = 0; c.globalAlpha = 1; c.strokeStyle = '#05080c'; c.lineWidth = 4;
      if (st === 1) { c.lineWidth = 3.5; c.strokeStyle = 'rgba(11,14,20,.85)'; c.beginPath(); c.arc(n.x, n.y, 11, tm * 6, tm * 6 + Math.PI * 1.5); c.stroke(); }
      else if (st === 2) { c.beginPath(); c.moveTo(n.x - 9, n.y + 1); c.lineTo(n.x - 3, n.y + 7); c.lineTo(n.x + 9, n.y - 6); c.stroke(); }
      else { c.beginPath(); c.moveTo(n.x - 7, n.y - 7); c.lineTo(n.x + 7, n.y + 7); c.moveTo(n.x + 7, n.y - 7); c.lineTo(n.x - 7, n.y + 7); c.stroke(); }
    }
    c.restore();
    c.save(); c.font = (st === 1 ? '700 ' : '500 ') + fs + 'px system-ui,"Segoe UI",sans-serif';
    const lbl = STEPS[i].label, pw = c.measureText(lbl).width + 16, ph = fs + 8; let lx, ly;
    if (!S.mobile) { lx = n.x - pw / 2; ly = n.y + R + 10; }
    else if (i % 2 === 0) { lx = n.x - R - 10 - pw; ly = n.y - ph / 2; }
    else { lx = n.x + R + 10; ly = n.y - ph / 2; }
    rr(c, lx, ly, pw, ph, ph / 2); c.fillStyle = 'rgba(11,14,20,.78)'; c.fill();
    c.lineWidth = 1; c.strokeStyle = st === 1 ? col : 'rgba(46,58,75,.9)'; c.stroke();
    c.fillStyle = st === 0 ? '#6a8aa8' : st === 1 ? '#e9f1f7' : '#c6e0ff'; c.textAlign = 'center'; c.textBaseline = 'middle';
    c.fillText(lbl, lx + pw / 2, ly + ph / 2 + .5); c.restore();
  });

  S.parts.forEach(p => { c.globalAlpha = Math.max(0, p.life); c.fillStyle = p.color; c.beginPath(); c.arc(p.x, p.y, Math.max(.1, p.size * p.life), 0, TAU); c.fill(); });
  c.globalAlpha = 1;
  if (S.moving || (S.running && S.from === 0 && S.ns[0] === 0)) {   /* glowing packet orb */
    const p = packetPos(); c.save();
    c.shadowColor = '#4fc3f7'; c.shadowBlur = 30; c.fillStyle = '#4fc3f7'; c.beginPath(); c.arc(p.x, p.y, 6, 0, TAU); c.fill();
    c.shadowBlur = 0; c.fillStyle = '#e9f8ff'; c.beginPath(); c.arc(p.x, p.y, 2.5, 0, TAU); c.fill(); c.restore();
  }
}
const busy = () => !panel.hidden && (S.running || S.parts.length || S.trail.length);
function frame(ts) {
  S.raf = 0; const dt = Math.min(.05, (ts - (S.last || ts)) / 1000); S.last = ts;
  update(dt); draw();
  if (S.running) setStat('time', ((performance.now() - S.startTime) / 1000).toFixed(1) + 's');
  if (busy()) S.raf = requestAnimationFrame(frame); else S.last = 0;
}
function ensureLoop() { if (!S.raf && !panel.hidden) { S.last = 0; S.raf = requestAnimationFrame(frame); } }

/* ===== ANIMATION LOGIC ===== */
function burst(x, y, n, color) {
  for (let i = 0; i < n; i++) { const a = rand(0, TAU), sp = rand(1.2, 5.5);
    S.parts.push({ x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp, size: rand(2, 5), life: 1, color: color || PALETTE[(Math.random() * PALETTE.length) | 0] }); }
}
function update(dt) {
  const f = dt * 60;
  if (S.moving && S.from < S.segs.length) {
    S.t += SPEED * dt / S.segs[S.from].len;
    const p = packetPos(); S.trail.push({ x: p.x, y: p.y, life: 1 });
    if (Math.random() < .7) S.parts.push({ x: p.x, y: p.y, vx: rand(-1, 1), vy: rand(-1, 1), size: rand(1.5, 3.5), life: 1, color: PALETTE[(Math.random() * PALETTE.length) | 0] });
    if (S.t >= 1) { S.from++; S.t = 0; onNodeReached(S.from); }
  }
  S.trail.forEach(t => t.life -= .06 * f); S.trail = S.trail.filter(t => t.life > 0);
  S.parts.forEach(p => { p.x += p.vx * f; p.y += p.vy * f; p.life -= .018 * f; }); S.parts = S.parts.filter(p => p.life > 0);
}
function onNodeReached(i) {
  const n = S.nodes[i]; burst(n.x, n.y, 6, STEPS[i].color);
  if (i >= S.target) { S.moving = false; const r = S.arrive; S.arrive = null; if (r) r(); }
}
function travelTo(i) {
  return new Promise(res => {
    if (S.from >= i) return res();
    if (document.hidden) { S.from = i; S.t = 0; return res(); }   /* rAF is paused in background tabs */
    S.target = i; S.moving = true; S.arrive = res; ensureLoop();
  });
}
function setActive(i) {
  S.ns[i] = 1; setPill(i, 'active'); S.activeSince = performance.now();
  capT.textContent = (i + 1) + '/' + STEPS.length + ' · ' + STEPS[i].desc; capL.textContent = ''; ensureLoop();
}
function markDone(i) {
  S.ns[i] = 2; setPill(i, 'done'); S.done = Math.max(S.done, i + 1); setProgress(S.done);
  const n = S.nodes[i]; burst(n.x, n.y, 20, STEPS[i].color); ensureLoop();
}

/* ===== START / RESET ===== */
function clear() {
  S.run++; S.running = S.finished = S.failed = S.moving = false; S.arrive = null;
  S.from = S.t = S.target = S.done = S.warn = 0; S.trail = []; S.parts = []; S.ns = STEPS.map(() => 0);
  pills.forEach((_, i) => setPill(i, '')); setProgress(0);
  STAT_DEFS.forEach(([k]) => setStat(k, k === 'warn' ? '0' : k === 'time' ? '0.0s' : '—'));
  fileEl.textContent = '—'; dlEl.hidden = true; setBadge('READY', ''); capT.textContent = ''; capL.textContent = '';
}
async function begin(file) {
  clear(); panel.hidden = false; layout();
  S.running = true; S.startTime = S.activeSince = performance.now(); const id = S.run;
  fileEl.textContent = file.name; setStat('size', fmtSize(file.size)); setBadge('RUNNING', 'run');
  capT.textContent = '1/' + STEPS.length + ' · ' + STEPS[0].desc;
  toast('Loaded ' + file.name + ' (' + fmtSize(file.size) + ')', '#4fc3f7');
  setTimeout(() => { if (S.run === id) toast('Conversion started', '#2ecc71'); }, 250);
  if (panel.scrollIntoView) panel.scrollIntoView({ behavior: 'smooth', block: 'center' });
  ensureLoop(); await sleep(500);
  if (S.run === id && S.running) setActive(0);
}
async function step(i, info) {                 /* called by the converter when stage i begins */
  const id = S.run; if (!S.running) return;
  if (info) for (const k in info) setStat(k, info[k]);
  await dwell(); if (S.run !== id || !S.running) return;
  markDone(i - 1); setPill(i, 'active');
  await travelTo(i); if (S.run !== id || !S.running) return;
  setActive(i);
}
async function done(r, href, name) {
  const id = S.run; if (!S.running) return;
  if (r && r.stats) { const map = { 'Object types': 'objects', 'Event sheets': 'sheets', 'Layouts': 'layouts', 'Warnings': 'warn' }; r.stats.forEach(([v, l]) => map[l] && setStat(map[l], Number(v))); }
  await dwell(); if (S.run !== id) return;
  markDone(STEPS.length - 1); S.running = false; S.finished = true;
  setStat('time', ((performance.now() - S.startTime) / 1000).toFixed(1) + 's');
  const n = S.nodes[STEPS.length - 1]; burst(n.x, n.y, 60);
  dlEl.href = href; dlEl.download = name; dlEl.hidden = false;
  setBadge('DONE', 'ok'); capT.textContent = 'Done · your .c3p is ready to download'; capL.textContent = '';
  toast('Conversion complete', '#2ecc71'); ensureLoop();
}
function fail(msg) {
  if (!S.running) return;
  S.running = false; S.failed = true; S.moving = false; const r = S.arrive; S.arrive = null; if (r) r();
  let i = S.ns.indexOf(1); if (i < 0) i = Math.min(S.from, STEPS.length - 1);
  S.ns[i] = 3; setPill(i, 'error'); setBadge('ERROR', 'err');
  capT.textContent = 'Failed at step ' + (i + 1) + ' · ' + STEPS[i].label; capL.textContent = msg;
  setStat('time', ((performance.now() - S.startTime) / 1000).toFixed(1) + 's');
  toast(msg, '#ff5252'); ensureLoop();
}
function reset() { clear(); panel.hidden = true; }
function log(lvl, msg) {                       /* fed by the converter's log() */
  try {
    if (!S.running) return;
    capL.textContent = msg;
    if (lvl === 'warn') { S.warn++; setStat('warn', S.warn); if (S.warn === 1) toast('Some items need manual review', '#ffb74d'); }
    if (/WebStorage plugin replaced/i.test(msg)) {
      toast('WebStorage → LocalStorage mapping applied', '#ffb74d');
      const n = S.nodes[2]; if (n) burst(n.x, n.y, 24, '#ffb74d'); ensureLoop();
    } else if (/Added LocalStorage object type/i.test(msg)) toast('LocalStorage object type added', '#ffb74d');
  } catch (e) { /* visuals must never break the conversion */ }
}

/* ===== EVENT LISTENERS ===== */
document.addEventListener('visibilitychange', () => {
  if (document.hidden && S.moving) { S.from = S.target; S.t = 0; S.moving = false; const r = S.arrive; S.arrive = null; if (r) r(); }
});
if (typeof ResizeObserver !== 'undefined') {
  new ResizeObserver(() => { if (panel.hidden) return; if ((stage.clientWidth < MOBILE_BELOW) !== S.mobile || !S.ready) layout(); draw(); }).observe(stage);
} else window.addEventListener('resize', () => { if (!panel.hidden) { layout(); draw(); } });

/* ===== INIT ===== */
STEPS.forEach(s => { const p = document.createElement('span'); p.style.setProperty('--c', s.color); p.innerHTML = '<i></i>'; p.append(s.pill); pillsEl.append(p); pills.push(p); });
STAT_DEFS.forEach(([k, l]) => { const d = document.createElement('div'); d.className = 'wf-stat' + (k === 'warn' ? ' warn' : ''); d.innerHTML = '<span></span><b></b>'; d.firstChild.textContent = l; statEls[k] = d.lastChild; statsEl.append(d); });
clear();
window.WF = { begin, step, done, fail, reset, log };
})();