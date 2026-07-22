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

// Estilo del chip de categoría seleccionado: tinte y color propios de la categoría.
const catChipStyle = ch => {
  const c = categories.find(x => x.id === +ch.dataset.cat);
  return { bg: tint(c.color, .18), color: c.color };
};

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

// Cerrar la hoja: si fue abierta desde otra (ctx.back), vuelve a la anterior; si no, cierra del todo.
function dismissSheet() {
  const back = sheetCtx?.back;
  if (back) back(); else closeSheet();
}

$('sheetCancel').addEventListener('click', dismissSheet);
sheetSave.addEventListener('click', async () => {
  if (sheetSave.disabled || !sheetCtx?.onSave) return;
  const ctx = sheetCtx;
  sheetSave.disabled = true; // evita doble envío mientras la petición está en curso
  try {
    await ctx.onSave();
    closeSheet();
    await refreshCurrent();
    // Tras guardar: afterSave (reabre la anterior con el resultado) o, si no, back (vuelve a la anterior).
    if (ctx.afterSave) ctx.afterSave();
    else if (ctx.back) ctx.back();
  } catch (e) {
    toast(e.message);
    refreshSaveState();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetCtx) dismissSheet(); });

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
const cashChip = (a, attr) => `<button class="chip" data-${attr}="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}</button>`;
const catChip = c => `<button class="chip" data-cat="${c.id}">${c.icon} ${esc(catName(c.name))}</button>`;

// Marca activo el boton cuyo data-<attr> coincide con `val`, dentro de `scope`.
const paintActive = (scope, attr, val) => scope.querySelectorAll(`[data-${attr}]`).forEach(p =>
  p.classList.toggle('active', p.dataset[attr] === val));

// Enlaza un boton de borrado: confirmar -> DELETE -> cerrar hoja -> refrescar -> toast.
function bindDelete(btnId, { name, url, doneToast }) {
  $(btnId).addEventListener('click', async () => {
    if (!confirm(t('confirm_delete', name))) return;
    try {
      await sendJSON(url, 'DELETE');
      closeSheet();
      await refreshCurrent();
      toast(t(doneToast));
    } catch (e) { toast(e.message); }
  });
}
