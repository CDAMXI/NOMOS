'use strict';

// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);
const nf2 = new Intl.NumberFormat('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const nf0 = new Intl.NumberFormat('es-ES');

const eur = v => nf2.format(v) + ' €';
const eurShort = v => Math.abs(v) >= 10000
  ? nf0.format(Math.round(v / 1000)) + ' mil €'
  : (Number.isInteger(v) ? nf0.format(v) : nf2.format(v)) + ' €';
const pct1 = v => Math.abs(v).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

// Fecha en DD/MM/YYYY. Se formatea desde la cadena ISO (sin new Date) para evitar
// desfases de zona horaria en fechas sin hora.
const dMed = iso => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tint(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// ---------- Icono automático de categoría (espejo de Nomos.Application/Common/CategoryIcon.cs) ----------
const ICON_FALLBACK = '🏷️';
const ICON_RULES = [
  ['🍽️', ['restaurante', 'restaurant', 'cena', 'bar', 'tapas', 'menu']],
  ['🛒', ['mercadona', 'carrefour', 'lidl', 'aldi', 'dia', 'super', 'compra', 'alimentacion']],
  ['☕', ['cafe', 'cafeteria', 'starbucks']],
  ['🍔', ['burger', 'hamburguesa', 'pizza', 'kebab', 'mcdonald', 'telepizza', 'comida rapida']],
  ['🍱', ['comida', 'almuerzo', 'desayuno', 'food']],
  ['⛽', ['gasolina', 'combustible', 'diesel', 'repsol', 'cepsa', 'gasolinera']],
  ['🚇', ['metro']],
  ['🚌', ['bus', 'autobus', 'abono', 'emt']],
  ['🚆', ['tren', 'renfe', 'ave']],
  ['🚕', ['taxi', 'uber', 'cabify', 'bolt']],
  ['✈️', ['vuelo', 'avion', 'viaje', 'vacaciones', 'hotel', 'airbnb', 'booking']],
  ['🚗', ['coche', 'auto', 'parking', 'peaje', 'itv', 'taller', 'transporte']],
  ['🏠', ['alquiler', 'hipoteca', 'casa', 'vivienda', 'piso', 'comunidad', 'renta']],
  ['💡', ['luz', 'electricidad', 'endesa', 'iberdrola']],
  ['💧', ['agua', 'canal']],
  ['🔥', ['gas', 'calefaccion', 'naturgy']],
  ['📶', ['internet', 'fibra', 'wifi', 'movil', 'telefono', 'movistar', 'vodafone', 'orange', 'yoigo']],
  ['💊', ['farmacia', 'medicina', 'medicamento']],
  ['🏥', ['medico', 'hospital', 'dentista', 'clinica']],
  ['🏋️', ['gimnasio', 'gym', 'fitness', 'padel', 'deporte', 'crossfit']],
  ['🎬', ['cine', 'netflix', 'hbo', 'disney', 'teatro', 'pelicula']],
  ['🎵', ['spotify', 'musica', 'concierto', 'apple music']],
  ['🎮', ['juego', 'videojuego', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo', 'ocio']],
  ['📚', ['libro', 'libreria', 'curso', 'universidad', 'upv', 'matricula', 'educacion', 'estudios', 'formacion']],
  ['👕', ['ropa', 'moda', 'zara', 'camiseta', 'zapatos', 'calzado', 'vestir']],
  ['💻', ['ordenador', 'portatil', 'pc', 'software', 'tecnologia', 'gadget']],
  ['📱', ['iphone', 'smartphone', 'android']],
  ['🎁', ['regalo', 'cumpleanos', 'navidad']],
  ['🐶', ['mascota', 'perro', 'gato', 'veterinario', 'pienso']],
  ['💄', ['belleza', 'peluqueria', 'cosmetica', 'maquillaje']],
  ['💰', ['ahorro', 'inversion', 'nomina', 'sueldo', 'salario']],
  ['🏦', ['banco', 'comision', 'hucha']],
  ['🍺', ['cerveza', 'alcohol', 'copas', 'bebida']],
  ['🧾', ['impuesto', 'hacienda', 'irpf', 'iva', 'multa']],
  ['❤️', ['salud']],
  ['🛠️', ['reparacion', 'herramienta', 'ferreteria', 'hogar']],
  ['✂️', ['barberia', 'corte']],
];
const CAT_PALETTE = ['#1e7ce8', '#34c759', '#f5a623', '#8e5be8', '#ff3b30', '#00b8a3', '#ff8a3d', '#e254a0', '#5a6b7b', '#c0392b'];

const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
function categoryIcon(name) {
  const n = stripAccents((name || '').toLowerCase().trim());
  if (!n) return ICON_FALLBACK;
  for (const [emoji, keywords] of ICON_RULES)
    for (const k of keywords)
      if (n.includes(k)) return emoji;
  return ICON_FALLBACK;
}

// ---------- Red ----------
async function parseError(res) {
  let msg = await res.text();
  try { msg = JSON.parse(msg); } catch { /* plain text */ }
  return typeof msg === 'string' && msg ? msg : 'Ha ocurrido un error';
}

async function getJSON(url) {
  const res = await fetch(url);
  if (res.status === 401) { showAuth(); throw new Error('Inicia sesión para continuar'); }
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function sendJSON(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const msg = await parseError(res);
    if (res.status === 401 && !url.includes('/auth/login')) showAuth();
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

// ---------- Gráficos SVG ----------
function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(Math.max(v, 1))));
  const n = v / p;
  const m = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 4 ? 4 : n <= 5 ? 5 : n <= 6 ? 6 : n <= 8 ? 8 : 10;
  return m * p;
}

function smoothPath(pts) {
  if (pts.length < 3) return 'M ' + pts.map(p => p.join(' ')).join(' L ');
  let d = `M ${pts[0][0]} ${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    const c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6;
    const c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6;
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2[0]} ${p2[1]}`;
  }
  return d;
}

function renderLineChart(el, points, { id, color, xFmt, yFmt }) {
  if (!points.length) { el.innerHTML = '<p class="tx-sub">Sin datos todavía.</p>'; return; }
  const W = 600, H = 230, L = 46, R = 10, T = 12, B = 26;
  const iw = W - L - R, ih = H - T - B;
  const ymax = niceMax(Math.max(...points.map(p => p.y)));
  const xy = points.map((p, i) => [
    +(L + (points.length === 1 ? iw / 2 : i * iw / (points.length - 1))).toFixed(1),
    +(T + ih - p.y / ymax * ih).toFixed(1)
  ]);

  let axes = '';
  for (let i = 0; i <= 4; i++) {
    const y = +(T + ih - i * ih / 4).toFixed(1);
    axes += `<line x1="${L}" y1="${y}" x2="${W - R}" y2="${y}" stroke="var(--line)" stroke-width="1"/>`;
    axes += `<text x="${L - 7}" y="${y + 4}" text-anchor="end" font-size="11" fill="var(--muted)">${yFmt(ymax * i / 4)}</text>`;
  }
  const nLabels = Math.min(6, points.length);
  for (let i = 0; i < nLabels; i++) {
    const idx = Math.round(i * (points.length - 1) / Math.max(nLabels - 1, 1));
    axes += `<text x="${xy[idx][0]}" y="${H - 6}" text-anchor="middle" font-size="11" fill="var(--muted)">${xFmt(points[idx].x)}</text>`;
  }

  const line = smoothPath(xy);
  const area = `${line} L ${xy[xy.length - 1][0]} ${T + ih} L ${xy[0][0]} ${T + ih} Z`;
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".26"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${axes}
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function renderDonut(el, items) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) { el.innerHTML = ''; return; }
  const r = 52, C = 2 * Math.PI * r;
  let off = 0, segs = '';
  for (const it of items) {
    const len = it.value / total * C;
    segs += `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${it.color}" stroke-width="28"
      stroke-dasharray="${Math.max(len - 3, .8).toFixed(1)} ${C.toFixed(1)}"
      stroke-dashoffset="${(-off).toFixed(1)}" stroke-linecap="round"/>`;
    off += len;
  }
  el.innerHTML = `<svg viewBox="0 0 140 140" style="transform:rotate(-90deg)">${segs}</svg>`;
}

// ---------- Estado ----------
let me = null;             // usuario autenticado {id, username, photoDataUrl}
let currentView = 'gastos';
let days = 30;
let categories = [];
let recentCache = [];      // TransactionDto[] mostrados en Recientes
let accountsCache = [];
let lastBalance = 0;       // último saldo disponible recibido (para prefijar "Ajustar saldo")

async function ensureCategoriesFresh() {
  categories = await getJSON('/api/categories');
  return categories;
}

// ---------- Avatares ----------
function avatarHtml(user) {
  return user.photoDataUrl
    ? `<img src="${esc(user.photoDataUrl)}" alt="">`
    : `<span class="avatar-initial">${esc(user.username.charAt(0).toUpperCase())}</span>`;
}

function renderTopAvatar() {
  const btn = $('profileBtn');
  btn.innerHTML = avatarHtml(me);
  btn.classList.remove('hidden');
}

/** Recorta al centro y reduce la imagen a un cuadrado pequeño en data URL. */
function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const s = Math.min(img.width, img.height);
        canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', .85));
      } catch (e) { reject(e); }
      finally { URL.revokeObjectURL(img.src); }
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error('No se pudo leer la imagen')); };
    img.src = URL.createObjectURL(file);
  });
}

// ---------- Vista Gastos ----------
async function loadGastos() {
  const d = await getJSON(`/api/expenses/dashboard?days=${days}`);

  // Hero: running available balance (baseline + incomes − expenses).
  lastBalance = d.balance;
  const balanceEl = $('gBalance');
  balanceEl.textContent = eur(d.balance);
  balanceEl.classList.toggle('red', d.balance < 0);

  let summary = `${d.monthLabel} · <span class="sum-out">Gastos ${eur(d.monthTotal)}</span>`;
  if (d.monthIncome > 0) summary += ` · <span class="sum-in">Ingresos +${eur(d.monthIncome)}</span>`;
  $('gMonthSummary').innerHTML = summary;

  renderLineChart($('gChart'), d.series.map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-gastos',
    color: cssVar('--accent'),
    xFmt: iso => { const dt = new Date(iso); return dt.getDate() + ' ' + cap(MESES[dt.getMonth()]); },
    yFmt: v => nf0.format(Math.round(v))
  });

  renderDonut($('gDonut'), d.byCategory.map(c => ({ color: c.category.color, value: c.total })));
  $('gCatList').innerHTML = d.byCategory.map(c => `
    <li><span class="dot" style="background:${c.category.color}"></span>
      ${esc(c.category.name)}<span class="amount">${eur(c.total)}</span></li>`).join('')
    || '<li class="tx-sub">Sin gastos en este periodo.</li>';

  recentCache = d.recent;
  $('gRecent').innerHTML = d.recent.map((t, i) => txRow(t, i)).join('')
    || '<li class="tx-sub">Aún no hay movimientos. Añade uno con el botón +.</li>';
  bindTxRows($('gRecent'), recentCache);
}

function txRow(t, index) {
  const isIncome = t.kind === 'income';
  const icon = isIncome ? '💶' : t.category.icon;
  const bg = isIncome ? tint('#34c759', .16) : tint(t.category.color, .16);
  const sub = (isIncome ? 'Ingreso' : t.category.name) + ' · ' + dMed(t.date);
  const amount = isIncome
    ? `<span class="tx-amount green">+${eur(t.amount)}</span>`
    : `<span class="tx-amount">−${eur(t.amount)}</span>`;
  return `<li class="clickable" data-i="${index}" title="Editar">
    <span class="tx-icon" style="background:${bg}">${icon}</span>
    <span class="tx-main">
      <span class="tx-title">${esc(t.description)}</span>
      <div class="tx-sub">${esc(sub)}</div>
    </span>
    ${amount}
  </li>`;
}

function bindTxRows(listEl, cache) {
  listEl.querySelectorAll('li[data-i]').forEach(li =>
    li.addEventListener('click', () => openTxSheet(cache[+li.dataset.i])));
}

// ---------- Vista Patrimonio ----------
const TYPE_META = {
  Cash: { section: 'Cuentas y efectivo', icon: '🏦' },
  Investment: { section: 'Inversiones', icon: '📈' },
  Other: { section: 'Otros activos', icon: '📦' },
  Liability: { section: 'Pasivos', icon: '💳' }
};

async function loadPatrimonio() {
  const d = await getJSON('/api/networth');
  accountsCache = d.accounts;

  $('nwTotal').textContent = eur(d.net);
  const deltaEl = $('nwDelta');
  deltaEl.classList.add('invert');
  if (d.yearDeltaPct === null || d.yearDeltaPct === undefined) {
    deltaEl.innerHTML = '<span class="tx-sub">sin histórico este año</span>';
  } else {
    const up = d.yearDeltaPct >= 0;
    deltaEl.innerHTML = `<span class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${pct1(d.yearDeltaPct)}</span> este año`;
  }

  $('nwAssets').textContent = eurShort(d.assets);
  $('nwLiab').textContent = eurShort(d.liabilities);

  renderLineChart($('nwChart'), d.series.map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-nw',
    color: cssVar('--green'),
    xFmt: iso => cap(MESES[new Date(iso).getMonth()]),
    yFmt: v => v >= 1000 ? nf0.format(Math.round(v / 1000)) + 'k' : nf0.format(Math.round(v))
  });

  const sections = ['Cash', 'Investment', 'Other', 'Liability']
    .map(type => {
      const accs = d.accounts.filter(a => a.type === type);
      if (!accs.length) return '';
      return `<p class="section-title">${TYPE_META[type].section}</p>
        <ul class="acc-list">${accs.map(accRow).join('')}</ul>`;
    }).join('');
  $('nwSections').innerHTML = sections || '<p class="tx-sub">Añade tu primera cuenta con el botón +.</p>';

  document.querySelectorAll('#nwSections li[data-acc]').forEach(li =>
    li.addEventListener('click', () => openAccountEditSheet(+li.dataset.acc)));
}

function accRow(a) {
  const isLiab = a.type === 'Liability';
  return `<li data-acc="${a.id}" class="clickable">
    <span class="tx-icon" style="background:${tint(isLiab ? '#e8332a' : '#34c759', .14)}">${TYPE_META[a.type].icon}</span>
    <span class="tx-main">
      <span class="tx-title">${esc(a.name)}</span>
      <div class="tx-sub">Act. ${dMed(a.updatedAt)}</div>
    </span>
    <span class="tx-amount ${isLiab ? 'red' : ''}">${eurShort(a.balance)}</span>
    <span class="acc-chevron">›</span>
  </li>`;
}

// ---------- Hoja modal ----------
const sheet = $('sheet'), sheetBody = $('sheetBody'), sheetTitle = $('sheetTitle'), sheetSave = $('sheetSave');
let sheetCtx = null;

function openSheet(ctx) {
  sheetCtx = ctx;
  sheetTitle.textContent = ctx.title;
  sheetSave.style.visibility = ctx.onSave ? 'visible' : 'hidden';
  sheetBody.innerHTML = '';
  ctx.build(sheetBody);
  refreshSaveState();
  sheet.classList.remove('hidden');
}

function closeSheet() { sheet.classList.add('hidden'); sheetCtx = null; }

function refreshSaveState() {
  sheetSave.disabled = !(sheetCtx && sheetCtx.canSave && sheetCtx.canSave());
}

$('sheetCancel').addEventListener('click', closeSheet);
sheetSave.addEventListener('click', async () => {
  if (sheetSave.disabled || !sheetCtx?.onSave) return;
  const ctx = sheetCtx;
  sheetSave.disabled = true; // evita doble envío mientras la petición está en curso
  try {
    await ctx.onSave();
    closeSheet();
    await refreshCurrent();
    ctx.afterSave?.();
  } catch (e) {
    toast(e.message);
    refreshSaveState();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetCtx) closeSheet(); });

// --- Teclado numérico compartido ---
let amountStr = '';

function amountBlock(label) {
  return `<div class="amount-block">
    <p class="amount-label">${label}</p>
    <p class="amount-display"><span id="amountText">0</span><span class="cur">€</span></p>
  </div>`;
}

function keypadHtml() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];
  return `<div class="keypad">${keys.map(k =>
    `<button class="key${k === 'back' ? ' alt' : ''}" data-key="${k}">${k === 'back' ? '⌫' : k}</button>`
  ).join('')}</div>`;
}

function bindKeypad(container) {
  container.querySelectorAll('[data-key]').forEach(btn =>
    btn.addEventListener('click', () => pressKey(btn.dataset.key)));
}

function paintAmount() {
  const el = $('amountText');
  if (!el) return;
  const [i, dPart] = amountStr.split('.');
  el.textContent = dPart === undefined ? nf0.format(Number(i || 0)) : nf0.format(Number(i || 0)) + ',' + dPart;
}

function pressKey(k) {
  if (k === 'back') amountStr = amountStr.slice(0, -1);
  else if (k === '.') { if (!amountStr.includes('.')) amountStr = amountStr ? amountStr + '.' : '0.'; }
  else {
    const [ints, decs] = amountStr.split('.');
    if (decs !== undefined && decs.length >= 2) return;
    if (decs === undefined && ints && ints.length >= 7) return;
    amountStr = amountStr === '0' ? k : amountStr + k;
  }
  paintAmount();
  refreshSaveState();
}

const amountValue = () => Math.round((parseFloat(amountStr) || 0) * 100) / 100;

function setAmount(v) {
  amountStr = v ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : '';
}

// --- Nuevo movimiento / editar movimiento (gasto o ingreso) ---
async function openTxSheet(existing = null, draft = null) {
  await ensureCategoriesFresh();
  const isEdit = !!existing;
  let kind = existing ? existing.kind : (draft?.kind || 'expense');
  let selectedCat = existing?.category?.id ?? draft?.categoryId ?? categories[0]?.id;
  setAmount(existing ? existing.amount : (draft?.amount || 0));
  const startDesc = existing ? existing.description : (draft?.description || '');

  const titleFor = () => (isEdit ? 'Editar ' : 'Nuevo ') + (kind === 'income' ? 'ingreso' : 'gasto');

  openSheet({
    title: titleFor(),
    canSave: () => amountValue() > 0 && (kind === 'income' || selectedCat),
    build(body) {
      body.innerHTML = `
        ${isEdit ? '' : `<div class="kind-toggle">
          <button class="pill" data-kind="expense">💸 Gasto</button>
          <button class="pill" data-kind="income">💶 Ingreso</button>
        </div>`}
        ${amountBlock('Monto')}
        <div class="chips" id="catChips">${categories.map(c =>
          `<button class="chip" data-cat="${c.id}">${c.icon} ${esc(c.name)}</button>`).join('')}
          ${isEdit ? '' : '<button class="chip chip-add" id="addCatChip">＋ categoría</button>'}</div>
        <input id="descField" class="text-field" placeholder="Descripción (opcional)" maxlength="120" value="${esc(startDesc)}">
        <input id="dateField" class="text-field" type="date" value="${existing ? existing.date : (draft?.date || todayISO())}">
        ${keypadHtml()}
        ${isEdit ? `<button id="deleteTx" class="danger-btn">Eliminar ${kind === 'income' ? 'ingreso' : 'gasto'}</button>` : ''}`;
      paintAmount();
      bindKeypad(body);

      const paintChips = () => {
        $('catChips').classList.toggle('hidden', kind === 'income');
        body.querySelectorAll('.chip[data-cat]').forEach(ch => {
          const cat = categories.find(c => c.id === +ch.dataset.cat);
          const sel = cat.id === selectedCat;
          ch.classList.toggle('selected', sel);
          ch.style.background = sel ? tint(cat.color, .18) : '';
          ch.style.color = sel ? cat.color : '';
        });
      };
      body.querySelectorAll('.chip[data-cat]').forEach(ch =>
        ch.addEventListener('click', () => { selectedCat = +ch.dataset.cat; paintChips(); refreshSaveState(); }));

      const addChip = $('addCatChip');
      if (addChip) addChip.addEventListener('click', () => {
        const carry = { kind, amount: amountValue(), description: $('descField').value, date: $('dateField').value };
        openCategoryEditSheet(null, saved => openTxSheet(null, { ...carry, categoryId: saved?.id }));
      });

      const paintKind = () => {
        sheetTitle.textContent = titleFor();
        body.querySelectorAll('[data-kind]').forEach(p => p.classList.toggle('active', p.dataset.kind === kind));
        paintChips();
      };
      body.querySelectorAll('[data-kind]').forEach(p =>
        p.addEventListener('click', () => { kind = p.dataset.kind; paintKind(); refreshSaveState(); }));
      paintKind();

      if (isEdit) {
        $('deleteTx').addEventListener('click', async () => {
          if (!confirm(`¿Eliminar "${existing.description}"?`)) return;
          try {
            await sendJSON(`/api/${kind === 'income' ? 'incomes' : 'expenses'}/${existing.id}`, 'DELETE');
            closeSheet();
            await refreshCurrent();
            toast(kind === 'income' ? 'Ingreso eliminado' : 'Gasto eliminado');
          } catch (e) { toast(e.message); }
        });
      }
    },
    async onSave() {
      const date = $('dateField').value || todayISO();
      const description = $('descField').value;
      if (kind === 'income') {
        const payload = { amount: amountValue(), description, date };
        if (isEdit) await sendJSON(`/api/incomes/${existing.id}`, 'PUT', payload);
        else await sendJSON('/api/incomes', 'POST', payload);
      } else {
        const payload = { amount: amountValue(), categoryId: selectedCat, description, date };
        if (isEdit) await sendJSON(`/api/expenses/${existing.id}`, 'PUT', payload);
        else await sendJSON('/api/expenses', 'POST', payload);
      }
      toast(isEdit ? 'Movimiento actualizado' : (kind === 'income' ? 'Ingreso guardado' : 'Gasto guardado'));
    }
  });
}

// --- Ver todo (lista completa de movimientos) ---
async function openAllTxSheet() {
  const items = await getJSON('/api/transactions');
  openSheet({
    title: 'Todos los movimientos',
    build(body) {
      body.innerHTML = `<ul class="sheet-list tx-list">${items.map((t, i) => txRow(t, i)).join('')
        || '<li class="tx-sub">Aún no hay movimientos.</li>'}</ul>`;
      bindTxRows(body, items);
    }
  });
}

// --- Ajustar saldo disponible ---
function openBalanceSheet() {
  setAmount(lastBalance > 0 ? lastBalance : 0);
  openSheet({
    title: 'Ajustar saldo',
    canSave: () => true,
    build(body) {
      body.innerHTML = amountBlock('¿Cuánto dinero tienes ahora?') +
        '<p class="tx-sub cat-hint">A partir de aquí, el saldo baja con cada gasto y sube con cada ingreso.</p>' +
        keypadHtml();
      paintAmount();
      bindKeypad(body);
    },
    async onSave() {
      await sendJSON('/api/balance', 'PUT', { amount: amountValue() });
      toast('Saldo actualizado');
    }
  });
}

// --- Gestión de categorías ---
async function openCategoriesSheet() {
  await ensureCategoriesFresh();
  openSheet({
    title: 'Categorías',
    build(body) {
      body.innerHTML = `<ul class="sheet-list cat-manage">${categories.map(c => `
        <li class="clickable" data-cat="${c.id}">
          <span class="tx-icon" style="background:${tint(c.color, .16)}">${c.icon}</span>
          <span class="tx-main"><span class="tx-title">${esc(c.name)}</span></span>
          <span class="acc-chevron">›</span>
        </li>`).join('')}</ul>
        <button id="addCat" class="inline-btn">＋ Añadir categoría</button>`;
      body.querySelectorAll('li[data-cat]').forEach(li =>
        li.addEventListener('click', () => {
          const c = categories.find(x => x.id === +li.dataset.cat);
          openCategoryEditSheet(c, () => openCategoriesSheet());
        }));
      $('addCat').addEventListener('click', () => openCategoryEditSheet(null, () => openCategoriesSheet()));
    }
  });
}

// --- Crear / editar una categoría (icono automático según el nombre) ---
function openCategoryEditSheet(cat = null, onDone = null) {
  const isEdit = !!cat;
  let color = cat?.color || CAT_PALETTE[0];
  let saved = null;

  openSheet({
    title: isEdit ? 'Editar categoría' : 'Nueva categoría',
    canSave: () => $('catName')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = `
        <div class="cat-editor">
          <div class="cat-icon-preview" id="catIconPreview">${cat ? cat.icon : ICON_FALLBACK}</div>
          <p class="tx-sub cat-hint">El icono se elige solo según el nombre</p>
          <input id="catName" class="text-field" placeholder="Nombre (p. ej. Gasolina, Gimnasio…)" maxlength="40" value="${cat ? esc(cat.name) : ''}">
          <p class="muted-label">Color</p>
          <div class="swatches" id="catSwatches">${CAT_PALETTE.map(c =>
            `<button class="swatch" data-color="${c}" style="background:${c}"></button>`).join('')}</div>
        </div>
        ${isEdit ? '<button id="deleteCat" class="danger-btn">Eliminar categoría</button>' : ''}`;

      const nameEl = $('catName'), preview = $('catIconPreview');
      const paintIcon = () => { preview.textContent = categoryIcon(nameEl.value); };
      nameEl.addEventListener('input', () => { paintIcon(); refreshSaveState(); });
      if (!isEdit) paintIcon();

      const paintSwatches = () => body.querySelectorAll('.swatch').forEach(s =>
        s.classList.toggle('sel', s.dataset.color === color));
      body.querySelectorAll('.swatch').forEach(s =>
        s.addEventListener('click', () => { color = s.dataset.color; paintSwatches(); }));
      paintSwatches();

      if (isEdit) {
        $('deleteCat').addEventListener('click', async () => {
          if (!confirm(`¿Eliminar la categoría "${cat.name}"?`)) return;
          try {
            await sendJSON(`/api/categories/${cat.id}`, 'DELETE');
            await ensureCategoriesFresh();
            closeSheet();
            await refreshCurrent();
            toast('Categoría eliminada');
            onDone?.(null);
          } catch (e) { toast(e.message); }
        });
      }
    },
    async onSave() {
      const payload = { name: $('catName').value, color };
      saved = isEdit
        ? await sendJSON(`/api/categories/${cat.id}`, 'PUT', payload)
        : await sendJSON('/api/categories', 'POST', payload);
      await ensureCategoriesFresh();
      toast(isEdit ? 'Categoría actualizada' : 'Categoría creada');
    },
    afterSave() { onDone?.(saved); }
  });
}

// --- Nueva cuenta / activo ---
function openAccountSheet() {
  setAmount(0);
  let selectedType = 'Cash';
  const types = Object.entries(TYPE_META);

  openSheet({
    title: 'Nueva cuenta',
    canSave: () => $('nameField')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = amountBlock('Saldo actual') + `
        <div class="chips">${types.map(([t, m]) =>
          `<button class="chip" data-type="${t}">${m.icon} ${m.section}</button>`).join('')}</div>
        <input id="nameField" class="text-field" placeholder="Nombre (p. ej. BBVA Cuenta Corriente)" maxlength="80">
        ${keypadHtml()}`;
      paintAmount();
      bindKeypad(body);
      const paint = () => body.querySelectorAll('.chip').forEach(ch => {
        const sel = ch.dataset.type === selectedType;
        ch.classList.toggle('selected', sel);
        ch.style.background = sel ? 'var(--accent-soft)' : '';
        ch.style.color = sel ? 'var(--accent)' : '';
      });
      body.querySelectorAll('.chip').forEach(ch =>
        ch.addEventListener('click', () => { selectedType = ch.dataset.type; paint(); }));
      $('nameField').addEventListener('input', refreshSaveState);
      paint();
    },
    async onSave() {
      await sendJSON('/api/accounts', 'POST', {
        name: $('nameField').value,
        type: selectedType,
        balance: amountValue()
      });
      toast('Cuenta creada');
    }
  });
}

// --- Editar cuenta (actualizar saldo / eliminar) ---
function openAccountEditSheet(id) {
  const acc = accountsCache.find(a => a.id === id);
  if (!acc) return;
  setAmount(acc.balance);

  openSheet({
    title: acc.name,
    canSave: () => $('nameField')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = amountBlock('Saldo actual') + `
        <input id="nameField" class="text-field" maxlength="80" value="${esc(acc.name)}">
        ${keypadHtml()}
        <button id="deleteAcc" class="danger-btn">Eliminar cuenta</button>`;
      paintAmount();
      bindKeypad(body);
      $('nameField').addEventListener('input', refreshSaveState);
      $('deleteAcc').addEventListener('click', async () => {
        if (!confirm(`¿Eliminar "${acc.name}"?`)) return;
        try {
          await sendJSON(`/api/accounts/${acc.id}`, 'DELETE');
          closeSheet();
          await refreshCurrent();
          toast('Cuenta eliminada');
        } catch (e) { toast(e.message); }
      });
    },
    async onSave() {
      await sendJSON(`/api/accounts/${acc.id}`, 'PUT', {
        name: $('nameField').value,
        balance: amountValue()
      });
      toast('Saldo actualizado');
    }
  });
}

// --- Perfil ---
function openProfileSheet() {
  let newPhoto = null; // solo se envía si el usuario elige una nueva

  openSheet({
    title: 'Perfil',
    canSave: () => $('profUsername')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = `
        <div class="profile-photo-wrap">
          <label class="avatar-pick filled" for="profPhotoInput" id="profAvatar" title="Cambiar foto">${avatarHtml(me)}</label>
          <input id="profPhotoInput" type="file" accept="image/*" hidden>
          <label class="link" for="profPhotoInput">Cambiar foto</label>
        </div>
        <p class="muted-label">Nombre de usuario</p>
        <input id="profUsername" class="text-field" maxlength="30" value="${esc(me.username)}">
        <div class="divider"></div>
        <button id="manageCatsBtn" class="inline-btn">🏷️ Gestionar categorías</button>
        <div class="divider"></div>
        <p class="muted-label">Cambiar contraseña</p>
        <input id="profCurPass" class="text-field" type="password" placeholder="Contraseña actual" maxlength="128" autocomplete="current-password">
        <input id="profNewPass" class="text-field" type="password" placeholder="Nueva contraseña (mín. 6 caracteres)" maxlength="128" autocomplete="new-password">
        <button id="changePassBtn" class="inline-btn">Actualizar contraseña</button>
        <div class="divider"></div>
        <button id="logoutBtn" class="danger-btn">Cerrar sesión</button>`;

      $('profUsername').addEventListener('input', refreshSaveState);

      $('profPhotoInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          newPhoto = await resizeImage(file);
          $('profAvatar').innerHTML = `<img src="${newPhoto}" alt="">`;
        } catch { toast('No se pudo leer la imagen'); }
      });

      $('manageCatsBtn').addEventListener('click', () => openCategoriesSheet());

      $('changePassBtn').addEventListener('click', async () => {
        try {
          await sendJSON('/api/auth/password', 'PUT', {
            currentPassword: $('profCurPass').value,
            newPassword: $('profNewPass').value
          });
          $('profCurPass').value = '';
          $('profNewPass').value = '';
          toast('Contraseña actualizada');
        } catch (e) { toast(e.message); }
      });

      $('logoutBtn').addEventListener('click', async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* sin conexión */ }
        closeSheet();
        showAuth();
      });
    },
    async onSave() {
      me = await sendJSON('/api/auth/profile', 'PUT', {
        username: $('profUsername').value,
        photoDataUrl: newPhoto
      });
      renderTopAvatar();
      toast('Perfil actualizado');
    }
  });
}

// ---------- Autenticación ----------
const authScreen = $('authScreen');
let authMode = 'login';
let authPhoto = null;

function setAuthMode(mode) {
  authMode = mode;
  const isRegister = mode === 'register';
  $('authTitle').textContent = isRegister ? 'Crear cuenta' : 'Iniciar sesión';
  $('authSubmit').textContent = isRegister ? 'Registrarse' : 'Entrar';
  $('authToggle').textContent = isRegister ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate';
  $('authPass2').classList.toggle('hidden', !isRegister);
  $('authPhotoPick').classList.toggle('hidden', !isRegister);
  $('authPass').autocomplete = isRegister ? 'new-password' : 'current-password';
  $('authError').textContent = '';
}

function showAuth() {
  me = null;
  if (sheetCtx) closeSheet();
  $('profileBtn').classList.add('hidden');
  $('fab').classList.add('hidden');
  authPhoto = null;
  $('authPhotoPick').classList.remove('filled');
  $('authPhotoPick').textContent = '📷';
  $('authUser').value = '';
  $('authPass').value = '';
  $('authPass2').value = '';
  setAuthMode('login');
  authScreen.classList.remove('hidden');
}

function enterApp() {
  authScreen.classList.add('hidden');
  renderTopAvatar();
  $('fab').classList.remove('hidden');
  refreshCurrent();
}

$('authToggle').addEventListener('click', () => setAuthMode(authMode === 'login' ? 'register' : 'login'));

$('authPhotoInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    authPhoto = await resizeImage(file);
    const pick = $('authPhotoPick');
    pick.classList.add('filled');
    pick.innerHTML = `<img src="${authPhoto}" alt="">`;
  } catch { $('authError').textContent = 'No se pudo leer la imagen'; }
});

async function submitAuth() {
  const username = $('authUser').value.trim();
  const password = $('authPass').value;
  const errorEl = $('authError');
  errorEl.textContent = '';

  if (!username || !password) { errorEl.textContent = 'Rellena usuario y contraseña.'; return; }
  if (authMode === 'register' && password !== $('authPass2').value) {
    errorEl.textContent = 'Las contraseñas no coinciden.';
    return;
  }

  const btn = $('authSubmit');
  btn.disabled = true;
  try {
    me = authMode === 'register'
      ? await sendJSON('/api/auth/register', 'POST', { username, password, photoDataUrl: authPhoto })
      : await sendJSON('/api/auth/login', 'POST', { username, password });
    enterApp();
  } catch (e) {
    errorEl.textContent = e.message;
  } finally {
    btn.disabled = false;
  }
}

$('authSubmit').addEventListener('click', submitAuth);
['authUser', 'authPass', 'authPass2'].forEach(id =>
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); }));

// ---------- Navegación / tema / sincronización ----------
function refreshCurrent() {
  if (!me) return Promise.resolve();
  return (currentView === 'gastos' ? loadGastos() : loadPatrimonio()).catch(e => toast(e.message));
}

document.querySelectorAll('.tab').forEach(tab =>
  tab.addEventListener('click', () => {
    currentView = tab.dataset.view;
    document.querySelectorAll('.tab').forEach(t => t.classList.toggle('active', t === tab));
    $('view-gastos').classList.toggle('hidden', currentView !== 'gastos');
    $('view-patrimonio').classList.toggle('hidden', currentView !== 'patrimonio');
    refreshCurrent();
  }));

document.querySelectorAll('.pill[data-days]').forEach(pill =>
  pill.addEventListener('click', () => {
    days = +pill.dataset.days;
    document.querySelectorAll('.pill[data-days]').forEach(p => p.classList.toggle('active', p === pill));
    if (me) loadGastos().catch(e => toast(e.message));
  }));

$('fab').addEventListener('click', () =>
  currentView === 'gastos' ? openTxSheet().catch(e => toast(e.message)) : openAccountSheet());

$('verTodoBtn').addEventListener('click', () => openAllTxSheet().catch(e => toast(e.message)));
$('adjustBalanceBtn').addEventListener('click', openBalanceSheet);
$('profileBtn').addEventListener('click', openProfileSheet);

const themeBtn = $('themeBtn');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('nomos-theme', theme);
}
themeBtn.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  refreshCurrent(); // los gráficos SVG toman los colores del tema
});
applyTheme(localStorage.getItem('nomos-theme') || 'light');

// Los datos viven en la base de datos: refresca al volver a la pestaña y cada 20 s.
window.addEventListener('focus', () => { if (!sheetCtx && me) refreshCurrent(); });
setInterval(() => { if (!sheetCtx && me) refreshCurrent(); }, 20000);

// ---------- Arranque ----------
(async function boot() {
  try {
    const res = await fetch('/api/auth/me');
    if (!res.ok) throw new Error();
    me = await res.json();
    enterApp();
  } catch {
    showAuth();
  }
})();
