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

function openSheet(ctx) {
  if (!sheetCtx && !sheetOpener) sheetOpener = document.activeElement;
  sheetCtx = ctx;
  sheetTitle.textContent = ctx.title;
  sheetError.textContent = '';
  sheetSave.style.visibility = ctx.onSave ? 'visible' : 'hidden';
  sheetBody.innerHTML = '';
  ctx.build(sheetBody);
  refreshSaveState();
  sheet.classList.remove('hidden');
  document.body.classList.add('sheet-open'); // la vista de detrás retrocede (profundidad iOS)
  // El foco entra al diálogo al abrirse (lo anuncia el lector y el primer Tab ya está dentro);
  // las hojas con importe lo re-enfocan después a su input (bindAmount).
  sheet.querySelector('.sheet-panel').focus();
  // Gesto/botón Atrás del móvil: UNA entrada de historial mientras haya hoja abierta (las
  // encadenadas la comparten); Atrás cierra la hoja en vez de salir de la PWA.
  if (!sheetInHistory) { history.pushState({ plutoSheet: true }, ''); sheetInHistory = true; }
}

// keepHistory=true cuando otra hoja se reabre justo después (guardar/borrar en flujos
// encadenados): la entrada de historial y el foco pendiente se conservan para la siguiente.
function closeSheet(keepHistory = false) {
  sheet.classList.add('hidden');
  sheetCtx = null;
  if (keepHistory) return; // otra hoja se reabre ya mismo: el fondo sigue retirado
  document.body.classList.remove('sheet-open');
  // Consumir la entrada SOLO si de verdad estamos en ella (si un diálogo nativo la
  // desincronizó, un back() a ciegas sacaría al usuario de la app).
  if (sheetInHistory) {
    sheetInHistory = false;
    if (history.state && history.state.plutoSheet) { ignorePop = true; history.back(); }
  }
  if (sheetOpener && sheetOpener.focus) { try { sheetOpener.focus(); } catch (_) { /* elemento ya no existe */ } }
  sheetOpener = null;
}

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
