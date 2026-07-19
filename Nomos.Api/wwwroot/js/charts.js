// PLUTO front-end · gráficos SVG — líneas y donut
'use strict';


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

function renderLineChart(el, points, { id, color, xFmt, yFmt, tip, height }) {
  if (!points.length) { el.innerHTML = `<p class="tx-sub">${t('no_data')}</p>`; return; }
  const W = 600, H = height || 230, L = 46, R = 10, T = 12, B = 26;
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
  const hover = tip ? `<line class="lc-cross" x1="0" y1="${T}" x2="0" y2="${T + ih}" stroke="${color}" stroke-width="1" stroke-dasharray="4 3" opacity="0"/>
    <circle class="lc-dot" r="4.5" fill="${color}" stroke="var(--card)" stroke-width="2" opacity="0"/>` : '';
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".26"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${axes}
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    ${xy.length === 1 ? `<circle cx="${xy[0][0]}" cy="${xy[0][1]}" r="5.5" fill="${color}" stroke="var(--card)" stroke-width="2"/>` : ''}
    ${hover}
  </svg>${tip ? '<div class="lc-tip"></div>' : ''}`;

  if (tip) bindChartHover(el, points, xy, { W, H, L, iw }, tip);
}

// mientras se explora una gráfica se pausa el refresco automático para no borrar el tooltip.
let chartHovering = false;

// Tooltip on hover (ratón) o al arrastrar el dedo en horizontal: resalta el punto más cercano.
function bindChartHover(el, points, xy, { W, H, L, iw }, tip) {
  const svg = el.querySelector('svg');
  const cross = el.querySelector('.lc-cross');
  const dot = el.querySelector('.lc-dot');
  const tipEl = el.querySelector('.lc-tip');
  const step = points.length > 1 ? iw / (points.length - 1) : 0;

  const show = clientX => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const svgX = (clientX - rect.left) / rect.width * W;
    let idx = step ? Math.round((svgX - L) / step) : 0;
    idx = Math.max(0, Math.min(points.length - 1, idx));
    const [px, py] = xy[idx];
    cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('opacity', '1');
    dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('opacity', '1');
    tipEl.innerHTML = tip(points[idx], idx, points);
    const left = Math.max(46, Math.min(rect.width - 46, px * rect.width / W));
    const top = py * rect.height / H;
    const below = top < 50; // si el punto está muy arriba, coloca el tooltip debajo para que no se corte
    tipEl.style.left = left + 'px';
    tipEl.style.top = (below ? top + 16 : top - 10) + 'px';
    tipEl.style.transform = below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';
    tipEl.classList.add('show');
  };
  const hide = () => { chartHovering = false; cross.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0'); tipEl.classList.remove('show'); };

  svg.addEventListener('mousemove', e => { chartHovering = true; show(e.clientX); });
  svg.addEventListener('mouseleave', hide);

  // Táctil: un toque muestra el punto tocado; arrastrar en horizontal lo desliza; en vertical
  // deja desplazar la página. Tras soltar, el tooltip se oculta solo pasado un momento.
  let tsx = 0, tsy = 0, scrubbed = false, movedFar = false, hideTimer = 0;
  const fadeSoon = () => { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 2500); };
  svg.addEventListener('touchstart', e => {
    tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; scrubbed = false; movedFar = false; clearTimeout(hideTimer);
  }, { passive: true });
  svg.addEventListener('touchmove', e => {
    const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
    if (Math.abs(tx - tsx) > 6 || Math.abs(ty - tsy) > 6) movedFar = true;
    if (!scrubbed && Math.abs(ty - tsy) > Math.abs(tx - tsx)) return; // vertical → dejar hacer scroll
    scrubbed = true; chartHovering = true; show(tx); e.preventDefault();
  }, { passive: false });
  svg.addEventListener('touchend', () => {
    if (!movedFar) { chartHovering = true; show(tsx); } // toque simple → muestra el punto tocado
    fadeSoon();
  });
  svg.addEventListener('touchcancel', hide);
}

function renderDonut(el, items) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) { el.innerHTML = ''; return; }
  const r = 52, C = 2 * Math.PI * r;
  // Flat (butt) caps and touching segments render a clean continuous ring instead of rounded pills.
  let off = 0, segs = '';
  for (const it of items) {
    const len = it.value / total * C;
    segs += `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${it.color}" stroke-width="26"
      stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}"
      stroke-dashoffset="${(-off).toFixed(2)}"/>`;
    off += len;
  }
  // Decorativo: los datos ya están en la lista de categorías contigua (accesible).
  el.innerHTML = `<svg viewBox="0 0 140 140" style="transform:rotate(-90deg)" aria-hidden="true">${segs}</svg>`;
}
