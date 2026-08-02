// PLUTO front-end · formato — $, cifras, fechas, esc, tint, i18n estático
'use strict';


// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Divisa principal del usuario (solo display). Se fija desde me.currency tras el login.
let currency = 'EUR';
let curSymbol = '€';
// Simbolo ESTRECHO, el que cabe en un azulejo de icono: en es-ES, USD normal es «US$» y GBP es
// «GBP»; en estrecho son «$» y «£». Tres divisas (CHF, PEN, VES) no tienen simbolo y se quedan
// en su codigo de tres letras, que el azulejo encoge para que quepa.
let curGlyph = '€';
let _nf0, _cur, _curShort, _short2, _nfShares, _pct;
function buildFormatters() {
  const l = localeCode();
  _nf0 = new Intl.NumberFormat(l, { useGrouping: true });
  // Sin fijar decimales: los decide la divisa. JPY, CLP, PYG y COP no tienen centimos, y
  // forzar dos escribia «1234,00 JPY».
  _cur = new Intl.NumberFormat(l, { style: 'currency', currency, useGrouping: true });
  _curShort = new Intl.NumberFormat(l, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true });
  // Mantisa de K/M/B: dos decimales como máximo y sin ceros de relleno (18, no 18,00).
  _short2 = new Intl.NumberFormat(l, { maximumFractionDigits: 2, useGrouping: false });
  _nfShares = new Intl.NumberFormat(l, { maximumFractionDigits: 6, useGrouping: true });
  _pct = new Intl.NumberFormat(l, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  curSymbol = (_cur.formatToParts(0).find(p => p.type === 'currency') || {}).value || currency;
  curGlyph = narrowSymbol(l) || curSymbol;
}

// Simbolo estrecho de la divisa actual, o null si el navegador no admite narrowSymbol.
function narrowSymbol(l) {
  try {
    const nf = new Intl.NumberFormat(l, { style: 'currency', currency, currencyDisplay: 'narrowSymbol' });
    return (nf.formatToParts(0).find(p => p.type === 'currency') || {}).value;
  } catch {
    return null;
  }
}
buildFormatters();

// Fija la divisa desde el usuario y reconstruye los formateadores. Llamar tras cargar/cambiar `me`.
function applyUserCurrency() {
  currency = (me && me.currency) || 'EUR';
  buildFormatters();
}

// Divisas soportadas: [código ISO, nombre]. Espejo de SupportedCurrencies en AuthService.cs.
const CURRENCIES = [
  ['EUR', 'Euro'], ['USD', 'Dólar estadounidense'], ['GBP', 'Libra esterlina'],
  ['CHF', 'Franco suizo'], ['JPY', 'Yen japonés'], ['CNY', 'Yuan chino'],
  ['CAD', 'Dólar canadiense'], ['AUD', 'Dólar australiano'], ['MXN', 'Peso mexicano'],
  ['COP', 'Peso colombiano'], ['ARS', 'Peso argentino'], ['CLP', 'Peso chileno'],
  ['PEN', 'Sol peruano'], ['BRL', 'Real brasileño'], ['UYU', 'Peso uruguayo'],
  ['BOB', 'Boliviano'], ['VES', 'Bolívar venezolano'], ['PYG', 'Guaraní'],
  ['GTQ', 'Quetzal'], ['DOP', 'Peso dominicano'],
];

const decSep = () => ',';
// Separador de miles = espacio, SOLO para mostrar cifras (los inputs no usan esto). Espacio
// duro (U+00A0) para que la cifra no se parta de línea. Ej.: 1 234 567,89 €.
const grpSpace = parts => parts.map(p => p.type === 'group' ? ' ' : p.value).join('');
const grouped = (nf, v) => grpSpace(nf.formatToParts(v));
const eur = v => grouped(_cur, v);
const nf0 = v => grouped(_nf0, v);
// Sufijos técnicos, de mayor a menor: se usa la primera unidad que quepa.
const SHORT_UNITS = [[1e9, 'B'], [1e6, 'M'], [1e3, 'K']];
// A partir de este porcentaje de la unidad, el redondeo a dos decimales ya daría «1000K»: se
// sube de unidad para no enseñar cuatro cifras (999 999 € es 1M €, no 1000K €).
const SHORT_ROUND_UP = 0.999995;

// Cifra compacta de las listas (Patrimonio, chips, centro de la rueda): desde el millar, K/M/B
// con dos decimales como mucho (2,95K) y sin ellos cuando la cifra es redonda (18K). Dos y no
// uno porque en Inversiones y en las cuentas se leen saldos de cuatro cifras, donde un solo
// decimal se come decenas de euros (2 950 € no puede enseñarse como 3K €). Por debajo del millar,
// la cifra tal cual. El símbolo va SIEMPRE al final, tras un espacio duro para que no se separe
// de la cifra al saltar de línea.
const eurShort = v => {
  const abs = Math.abs(v);
  if (abs < 1000) return Number.isInteger(v) ? grouped(_curShort, v) : eur(v);
  return compactUnit(v) + ' ' + curSymbol;
};

// Mantisa ya redondeada + su sufijo, para una cifra de 1000 en adelante.
function compactUnit(v) {
  const [min, suffix] = SHORT_UNITS.find(([m]) => Math.abs(v) >= m * SHORT_ROUND_UP);
  return _short2.format(Math.round(v / min * 100) / 100) + suffix;
}

// La MISMA abreviatura, sin divisa: para ejes y etiquetas donde el simbolo seria ruido. Que la
// lista diga «13K €» y el eje de al lado «15k» son dos compactos conviviendo en una pantalla.
const numShort = v => Math.abs(v) < 1000 ? nf0(Math.round(v)) : compactUnit(v);

const pct1 = v => _pct.format(Math.abs(v)) + '%';
// Número de acciones: hasta 6 decimales (permite fracciones), miles con espacio.
const nfShares = v => grouped(_nfShares, v);

// Fecha en DD/MM/YYYY (misma en ambos idiomas, por preferencia). Formateada desde la
// cadena ISO sin new Date para evitar desfases de zona horaria.
const dMed = iso => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
// Interpreta la fecha ISO como medianoche LOCAL (evita el desfase de zona con new Date(iso), que la trata como UTC).
const localDate = iso => new Date(String(iso).slice(0, 10) + 'T00:00:00');
const shortMonth = dt => cap(new Intl.DateTimeFormat(localeCode(), { month: 'short' }).format(dt).replace('.', ''));
const monthYearLabel = iso => cap(new Intl.DateTimeFormat(localeCode(), { month: 'long', year: 'numeric' }).format(localDate(iso)));

const todayISO = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tint(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// Versión legible COMO TEXTO de un color de categoría sobre su propio tinte (fondo del chip:
// tint(color, .18) compuesto sobre la tarjeta del tema). Ajusta SOLO la luminancia, escalando
// hacia negro (tema claro) o blanco (oscuro) hasta alcanzar el contraste AA de 4.5:1 real
// (fórmula WCAG de luminancia relativa; el clamp anterior por luminancia simple se quedaba
// en 2.8-3.9:1 en media paleta).
const _lin = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
const _relLum = (r, g, b) => 0.2126 * _lin(r) + 0.7152 * _lin(g) + 0.0722 * _lin(b);
const _contrast = (l1, l2) => (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);

function readableColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const dark = document.documentElement.dataset.theme === 'dark';
  const card = dark ? [26, 26, 32] : [255, 255, 255]; // --card de cada tema
  const A = 0.18; // alpha de tint() en los chips
  const bgLum = _relLum(...[r, g, b].map((c, i) => c * A + card[i] * (1 - A)));
  for (let i = 0; i < 24 && _contrast(_relLum(r, g, b), bgLum) < 4.5; i++) {
    if (dark) { r += (255 - r) * 0.12; g += (255 - g) * 0.12; b += (255 - b) * 0.12; }
    else { r *= 0.88; g *= 0.88; b *= 0.88; }
  }
  return `rgb(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)})`;
}


