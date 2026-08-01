// PLUTO front-end · hoja modal — infraestructura, chips y monto
'use strict';


// ---------- Chips de selección (patrón común de todas las hojas) ----------
// Pinta un grupo de chips de selección única: marca `.selected` y aplica el color del elegido.
// `attr` = sufijo del data-atributo ('acc', 'cat', 'cur', 'type'); `isSel(chip)` decide el activo;
// `styleSel(chip)` da {bg,color} del activo (por defecto, el estilo "acento" azul).
function paintChipGroup(scope, attr, isSel, styleSel) {
  scope.querySelectorAll(`.chip[data-${attr}]`).forEach(ch => {
    const sel = isSel(ch);
    ch.classList.toggle('selected', sel);
    ch.setAttribute('aria-pressed', sel ? 'true' : 'false'); // estado para lectores de pantalla
    const s = !sel ? { bg: '', color: '' }
      : styleSel ? styleSel(ch)
      : { bg: 'var(--accent-soft)', color: 'var(--accent)' };
    ch.style.background = s.bg;
    ch.style.color = s.color;
  });
}

// Enlaza el click de cada chip del grupo, pasando el valor de su data-atributo.
function onChipPick(scope, attr, handler) {
  scope.querySelectorAll(`.chip[data-${attr}]`).forEach(ch =>
    ch.addEventListener('click', () => handler(ch.dataset[attr], ch)));
}

// Estilo del chip de categoría seleccionado: tinte de la categoría y su color ajustado a
// luminancia legible (el color exacto lo elige el usuario y puede no contrastar como texto).
const catChipStyle = ch => {
  const c = categories.find(x => x.id === +ch.dataset.cat);
  return { bg: tint(c.color, .18), color: readableColor(c.color) };
};

// ---------- Hoja modal ----------
const sheet = $('sheet'), sheetBody = $('sheetBody'), sheetTitle = $('sheetTitle'),
  sheetSave = $('sheetSave'), sheetError = $('sheetError');
let sheetCtx = null;
let sheetOpener = null;     // elemento con foco antes de abrir la hoja (se restaura al cerrar)
let sheetInHistory = false; // hay una entrada de historial viva para la hoja (gesto/botón Atrás)
let ignorePop = false;      // history.back() programático: su popstate no debe volver a cerrar

// ---------- Movimiento de la hoja: muelle interrumpible + arrastre 1:1 ----------
// Un muelle en vez de una transición CSS porque puede AGARRARSE a media animación: arranca
// siempre del valor vivo en pantalla y hereda la velocidad del dedo, así no hay costura entre
// el gesto y la animación. Sin dependencias: ~30 líneas sobre requestAnimationFrame.
const sheetPanel = sheet.querySelector('.sheet-panel');
const mobileSheet = () => !window.matchMedia('(min-width: 821px)').matches;
const noMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let sheetAnim = null;    // muelle en curso (cancelable e interrogable)
let sheetY = 0;          // desplazamiento vivo del panel en px (0 = presentada)
let sheetReleaseV = 0;   // velocidad del dedo al soltar, para el muelle de salida

function setSheetY(y) {
  sheetY = y;
  const h = sheetPanel.offsetHeight || 1;
  sheetPanel.style.transform = y ? `translate3d(0, ${y.toFixed(1)}px, 0)` : '';
  // Progreso 1 = presentada, 0 = fuera. El scrim y el retroceso de la vista de detrás lo
  // siguen 1:1: al arrastrar hacia abajo, el fondo vuelve hacia el usuario.
  document.body.style.setProperty('--sheet-p', Math.max(0, 1 - y / h).toFixed(3));
}

// Muelle con la parametrización de Apple: respuesta (s) y amortiguación (1 = sin rebote).
function springSheet(to, v0 = 0, { response = 0.4, damping = 1 } = {}, onEnd) {
  sheetAnim?.cancel();
  if (noMotion()) { setSheetY(to); onEnd?.(); return; }
  const w = 2 * Math.PI / response;
  let x = sheetY, v = v0, last = performance.now(), raf = 0;
  const step = now => {
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    v += (-w * w * (x - to) - 2 * damping * w * v) * dt;
    x += v * dt;
    if (Math.abs(x - to) < 0.5 && Math.abs(v) < 24) { setSheetY(to); sheetAnim = null; onEnd?.(); return; }
    setSheetY(x);
    raf = requestAnimationFrame(step);
  };
  raf = requestAnimationFrame(step);
  sheetAnim = { cancel: () => cancelAnimationFrame(raf), get v() { return v; } };
}

function hideSheetNow() {
  sheet.classList.add('hidden');
  document.body.classList.remove('sheet-open');
  sheetAnim?.cancel(); sheetAnim = null;
  setSheetY(0);
  document.body.style.setProperty('--sheet-p', '0');
}

function openSheet(ctx) {
  if (!sheetCtx && !sheetOpener) sheetOpener = document.activeElement;
  const wasVisible = !sheet.classList.contains('hidden');
  sheetCtx = ctx;
  sheetTitle.textContent = ctx.title;
  sheetError.textContent = '';
  sheetSave.style.visibility = ctx.onSave ? 'visible' : 'hidden';
  sheetBody.innerHTML = '';
  ctx.build(sheetBody);
  refreshSaveState();
  sheet.classList.remove('hidden');
  document.body.classList.add('sheet-open'); // la vista de detrás retrocede (profundidad iOS)
  if (mobileSheet()) {
    // Si estaba saliendo, el muelle de entrada arranca de donde esté AHORA y con su velocidad:
    // agarrar una hoja a medio cerrar la trae de vuelta sin salto.
    const v0 = sheetAnim ? sheetAnim.v : 0;
    const from = wasVisible ? sheetY : sheetPanel.offsetHeight;
    if (from !== 0 || sheetAnim) { setSheetY(from); springSheet(0, v0, { response: 0.4, damping: 1 }); }
  } else {
    setSheetY(0);
    document.body.style.setProperty('--sheet-p', '1');
  }
  // El foco entra al diálogo al abrirse (lo anuncia el lector y el primer Tab ya está dentro);
  // las hojas con importe lo re-enfocan después a su input (bindAmount).
  sheetPanel.focus();
  // Gesto/botón Atrás del móvil: UNA entrada de historial mientras haya hoja abierta (las
  // encadenadas la comparten); Atrás cierra la hoja en vez de salir de la PWA.
  if (!sheetInHistory) { history.pushState({ plutoSheet: true }, ''); sheetInHistory = true; }
}

// keepHistory=true cuando otra hoja se reabre justo después (guardar/borrar en flujos
// encadenados): la entrada de historial y el foco pendiente se conservan para la siguiente.
function closeSheet(keepHistory = false) {
  sheetCtx = null;
  if (keepHistory) { hideSheetNow(); return; } // otra hoja entra ya mismo: sin animación
  // Consumir la entrada SOLO si de verdad estamos en ella (si un diálogo nativo la
  // desincronizó, un back() a ciegas sacaría al usuario de la app).
  if (sheetInHistory) {
    sheetInHistory = false;
    if (history.state && history.state.plutoSheet) { ignorePop = true; history.back(); }
  }
  if (sheetOpener && sheetOpener.focus) { try { sheetOpener.focus(); } catch (_) { /* elemento ya no existe */ } }
  sheetOpener = null;
  // La salida es solo visual: el estado lógico ya está cerrado, así que una hoja nueva puede
  // abrirse encima en cualquier momento (openSheet cancela este muelle y re-presenta).
  if (mobileSheet() && !sheet.classList.contains('hidden')) {
    springSheet(sheetPanel.offsetHeight, Math.max(sheetReleaseV, 0), { response: 0.35, damping: 1 }, hideSheetNow);
  } else {
    hideSheetNow();
  }
}

// ---------- Gesto: arrastrar el asa/barra para descartar ----------
// El asa deja de ser decorativa: la hoja sigue al dedo 1:1, resiste con goma hacia arriba y al
// soltar PROYECTA el impulso (deceleración iOS) para decidir si se va o vuelve.
const projectMomentum = v => (v / 1000) * 0.998 / (1 - 0.998); // ≈ v·0.499
const rubberband = (over, dim, c = 0.55) => (over * dim * c) / (dim + c * Math.abs(over));
let sheetDrag = null;

sheetPanel.addEventListener('pointerdown', e => {
  if (!mobileSheet() || (e.pointerType === 'mouse' && e.button !== 0)) return;
  // Solo desde el asa o la barra (en el cuerpo, arrastrar = desplazar el contenido).
  if (!e.target.closest('.sheet-grabber, .sheet-bar')) return;
  if (e.target.closest('button, input, select, textarea, a')) return;
  sheetAnim?.cancel(); sheetAnim = null; // se puede agarrar a media animación
  sheetDrag = { id: e.pointerId, startY: e.clientY, y0: sheetY, hist: [[performance.now(), e.clientY]] };
  sheetPanel.setPointerCapture(e.pointerId);
  sheetPanel.style.willChange = 'transform';
});

sheetPanel.addEventListener('pointermove', e => {
  if (!sheetDrag || e.pointerId !== sheetDrag.id) return;
  const raw = sheetDrag.y0 + (e.clientY - sheetDrag.startY);
  const h = sheetPanel.offsetHeight || 1;
  setSheetY(raw >= 0 ? raw : -rubberband(-raw, h)); // hacia arriba: resistencia progresiva
  sheetDrag.hist.push([performance.now(), e.clientY]);
  if (sheetDrag.hist.length > 5) sheetDrag.hist.shift();
});

function endSheetDrag(e) {
  if (!sheetDrag || e.pointerId !== sheetDrag.id) return;
  // Velocidad INSTANTÁNEA reciente (~30 ms), no el promedio de toda la ventana: si el dedo
  // cambió de dirección dentro del historial, el promedio daría una velocidad falsa y la hoja
  // saldría disparada en contra del gesto.
  const { hist } = sheetDrag;
  const last = hist[hist.length - 1];
  let ref = hist[0];
  for (let i = hist.length - 2; i >= 0; i--) { ref = hist[i]; if (last[0] - hist[i][0] >= 30) break; }
  const dt = (last[0] - ref[0]) / 1000;
  const v = dt > 0.008 ? (last[1] - ref[1]) / dt : 0; // px/s del dedo al soltar
  sheetDrag = null;
  sheetPanel.style.willChange = '';
  const h = sheetPanel.offsetHeight || 1;
  if (sheetY + projectMomentum(v) > h * 0.35) {
    // Se va: el muelle continúa a la velocidad del dedo (closeSheet la recoge).
    sheetReleaseV = v;
    dismissSheet();
    sheetReleaseV = 0;
  } else {
    // Vuelve a su sitio con un punto de rebote, porque el gesto traía impulso.
    springSheet(0, v, { response: 0.4, damping: 0.8 });
  }
}
sheetPanel.addEventListener('pointerup', endSheetDrag);
sheetPanel.addEventListener('pointercancel', endSheetDrag);

// refreshSaveState corre en cada input de la hoja: además de recalcular Guardar, retira el
// error persistente en cuanto el usuario corrige algo.
function refreshSaveState() {
  sheetError.textContent = '';
  sheetSave.disabled = !(sheetCtx && sheetCtx.canSave && sheetCtx.canSave());
}

// Cerrar la hoja: si fue abierta desde otra (ctx.back), vuelve a la anterior; si no, cierra del todo.
function dismissSheet() {
  const back = sheetCtx?.back;
  if (back) back(); else closeSheet();
}

// Abre la hoja con un spinner mientras llegan los datos de red: el toque tiene respuesta
// inmediata aunque la red vaya lenta. El llamante guarda sheetCtx y comprueba que no haya
// cambiado tras el await (si el usuario canceló durante la carga, no se reabre).
function sheetLoading(title, back) {
  openSheet({ title, back, build(body) { body.innerHTML = '<div class="sheet-loading"><span class="boot-spinner"></span></div>'; } });
}

// Fallo del fetch inicial de una hoja: cierra el esqueleto (si sigue abierto) y avisa.
function sheetFail(e) {
  if (sheetCtx) closeSheet();
  toast(e.message);
}

$('sheetCancel').addEventListener('click', dismissSheet);
// En escritorio la hoja es un diálogo centrado: el click en el fondo atenuado también cierra.
sheet.addEventListener('click', e => { if (e.target === sheet) dismissSheet(); });
sheetSave.addEventListener('click', async () => {
  if (sheetSave.disabled || !sheetCtx?.onSave) return;
  const ctx = sheetCtx;
  sheetSave.disabled = true; // evita doble envío mientras la petición está en curso
  const saveLabel = sheetSave.textContent;
  sheetSave.textContent = t('saving'); // estado ocupado visible (red lenta / Render dormido)
  try {
    await ctx.onSave();
    closeSheet(!!(ctx.afterSave || ctx.back)); // si se reabre otra hoja, conserva el historial
    await refreshCurrent();
    // Tras guardar: afterSave (reabre la anterior con el resultado) o, si no, back (vuelve a la anterior).
    if (ctx.afterSave) ctx.afterSave();
    else if (ctx.back) ctx.back();
  } catch (e) {
    // El error queda a la vista dentro de la hoja (un toast desaparece antes de leerse).
    refreshSaveState();
    sheetError.textContent = e.message;
  } finally {
    sheetSave.textContent = saveLabel;
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetCtx) dismissSheet(); });

// Filas-boton de las listas (Recientes, cuentas, lotes): Enter/Espacio equivalen al toque.
document.addEventListener('keydown', e => {
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches?.('li.clickable[role="button"]')) {
    e.preventDefault();
    e.target.click();
  }
});

// Atrás del navegador/móvil: cierra (o retrocede) la hoja. Si la hoja anterior se reabre,
// openSheet vuelve a crear la entrada consumida. Dos guardas contra «Atrás fantasma»:
// (1) si tras el pop seguimos EN la entrada de la hoja, el pop no fue nuestro (diálogos
// nativos de fecha/teclado manipulan el historial en algunos Android) → ignorar;
// (2) si hay un campo de la hoja con foco (teclado abierto), el Atrás iba dirigido al
// teclado: se cierra el teclado y se repone la entrada, no se cierra la hoja.
window.addEventListener('popstate', () => {
  if (ignorePop) { ignorePop = false; return; }
  if (history.state && history.state.plutoSheet) return; // pop espurio: la entrada sigue viva
  const focused = document.activeElement;
  if (sheetCtx && sheet.contains(focused) && /^(INPUT|SELECT|TEXTAREA)$/.test(focused.tagName)) {
    focused.blur();
    history.pushState({ plutoSheet: true }, '');
    sheetInHistory = true;
    return;
  }
  sheetInHistory = false;
  if (sheetCtx) dismissSheet();
});

// Trampa de foco del diálogo (aria-modal real): Tab circula solo dentro de la hoja.
document.addEventListener('keydown', e => {
  if (e.key !== 'Tab' || !sheetCtx) return;
  const els = [...sheet.querySelectorAll('button, input, select, textarea, [tabindex]:not([tabindex="-1"])')]
    .filter(el => !el.disabled && el.offsetParent !== null);
  if (!els.length) return;
  const first = els[0], last = els[els.length - 1];
  if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
  else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
});

// --- Importe: input numérico nativo (abre el teclado numérico del móvil) ---
let amountSeed = '';   // valor inicial del input; se fija con setAmount antes de abrir la hoja

function amountBlock(label) {
  return `<div class="amount-block">
    <p class="amount-label">${label}</p>
    <div class="amount-display">
      <input id="amountInput" class="amount-input" type="text" inputmode="decimal" enterkeyhint="done"
        autocomplete="off" placeholder="0" aria-label="${label}"
        value="${esc(amountSeed)}" style="width:${Math.max(amountSeed.length, 1)}ch">
      <span class="cur">${curSymbol}</span>
    </div>
  </div>`;
}

// Ajusta el ancho al contenido, mantiene el botón Guardar y (si focus) abre el teclado nativo.
function bindAmount(container, focus) {
  const el = (container || document).querySelector('#amountInput');
  if (!el) return;
  const resize = () => { el.style.width = Math.max(el.value.length, 1) + 'ch'; };
  resize();
  el.addEventListener('input', () => { resize(); refreshSaveState(); });
  // El ✓ / Intro del teclado numérico cierra el teclado (un input de texto no lo hace solo).
  el.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); el.blur(); } });
  if (focus) {
    // The sheet is still hidden while build() runs; focus once it becomes visible.
    setTimeout(() => {
      el.focus();
      const end = el.value.length;
      try { el.setSelectionRange(end, end); } catch (_) {}
    }, 0);
  }
}

// Al teclear, tanto la coma como el punto valen como separador decimal: el ÚLTIMO que
// aparezca es el decimal y los anteriores se descartan como miles. Conserva el signo.
// "12,5" = "12.5" = 12.5 · "1.234,56" = "1,234.56" = 1234.56. Al mostrar, siempre coma.
const parseDecimal = raw => {
  raw = (raw || '').trim();
  const neg = raw.startsWith('-');
  const d = raw.replace(/[^0-9.,]/g, '');
  const iSep = Math.max(d.lastIndexOf('.'), d.lastIndexOf(','));
  const norm = iSep < 0 ? d : d.slice(0, iSep).replace(/[.,]/g, '') + '.' + d.slice(iSep + 1);
  const n = parseFloat(norm) || 0;
  return neg ? -n : n;
};

// Redondeo a 2 decimales (centimos).
const round2 = n => Math.round(n * 100) / 100;

// Importe del input principal, redondeado a 2 decimales.
const amountValue = () => {
  const el = $('amountInput');
  const n = parseDecimal((el ? el.value : amountSeed) || '');
  return round2(n);
};

function setAmount(v) {
  if (!v) { amountSeed = ''; return; }
  amountSeed = (Number.isInteger(v) ? String(v) : v.toFixed(2)).replace('.', decSep());
}

// Como amountValue pero para cualquier input decimal (precio, nº de acciones…), sin
// redondear (las acciones admiten hasta 6 decimales). Conserva el signo para que la
// validación pueda rechazar negativos explícitamente.
function decValue(el) {
  return parseDecimal((el && el.value) || '');
}

// Markup de chip reutilizado en varias hojas/vistas (cuenta de efectivo y categoria).
// Si el nombre esta repetido entre las cuentas dadas, se anade el saldo: dos cuentas
// homonimas producian chips gemelos indistinguibles.
const cashChip = (a, attr, all) => {
  const dup = all && all.filter(x => x.name === a.name).length > 1;
  return `<button class="chip" data-${attr}="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}${dup ? ` · ${eurShort(a.balance)}` : ''}</button>`;
};
const catChip = c => `<button class="chip" data-cat="${c.id}">${c.icon} ${esc(catName(c.name))}</button>`;

// Marca activo el boton cuyo data-<attr> coincide con `val`, dentro de `scope`.
const paintActive = (scope, attr, val) => scope.querySelectorAll(`[data-${attr}]`).forEach(p => {
  const active = p.dataset[attr] === val;
  p.classList.toggle('active', active);
  p.setAttribute('aria-pressed', active ? 'true' : 'false');
});

// Confirmación en dos toques SIN diálogo nativo (mantiene la piel de la app): el primer
// toque «arma» el botón (texto de aviso y estilo intenso); el segundo, dentro de 4 s,
// ejecuta. Pasado el plazo sin confirmar, el botón vuelve a su estado normal.
function armDelete(btn, label, onConfirm) {
  let armed = false, timer = 0;
  const disarm = () => { armed = false; btn.classList.remove('armed'); btn.textContent = label; };
  btn.addEventListener('click', () => {
    if (!armed) {
      armed = true;
      btn.classList.add('armed');
      btn.textContent = t('tap_confirm');
      clearTimeout(timer);
      timer = setTimeout(disarm, 4000);
      return;
    }
    clearTimeout(timer);
    disarm();
    onConfirm();
  });
}

// Enlaza un boton de borrado: armar -> confirmar -> DELETE -> cerrar hoja -> refrescar -> toast.
function bindDelete(btnId, { url, doneToast }) {
  const btn = $(btnId);
  armDelete(btn, btn.textContent, async () => {
    try {
      await sendJSON(url, 'DELETE');
      closeSheet();
      await refreshCurrent();
      toast(t(doneToast));
    } catch (e) {
      refreshSaveState();
      sheetError.textContent = e.message;
    }
  });
}
