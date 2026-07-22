// PLUTO front-end · formato — $, cifras, fechas, esc, tint, i18n estático
'use strict';


// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

// Divisa principal del usuario (solo display). Se fija desde me.currency tras el login.
let currency = 'EUR';
let curSymbol = '€';
let _nf0, _cur, _curShort, _nfShares, _pct;
function buildFormatters() {
  const l = localeCode();
  _nf0 = new Intl.NumberFormat(l, { useGrouping: true });
  _cur = new Intl.NumberFormat(l, { style: 'currency', currency, minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
  _curShort = new Intl.NumberFormat(l, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true });
  _nfShares = new Intl.NumberFormat(l, { maximumFractionDigits: 6, useGrouping: true });
  _pct = new Intl.NumberFormat(l, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  curSymbol = (_cur.formatToParts(0).find(p => p.type === 'currency') || {}).value || currency;
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

const decSep = () => (lang === 'en' ? '.' : ',');
// Separador de miles = espacio, SOLO para mostrar cifras (los inputs no usan esto). Espacio
// duro (U+00A0) para que la cifra no se parta de línea. Ej.: 1 234 567,89 €.
const grpSpace = parts => parts.map(p => p.type === 'group' ? ' ' : p.value).join('');
const grouped = (nf, v) => grpSpace(nf.formatToParts(v));
const eur = v => grouped(_cur, v);
const nf0 = v => grouped(_nf0, v);
const eurShort = v => Math.abs(v) >= 10000
  ? (lang === 'en' ? curSymbol + nf0(Math.round(v / 1000)) + 'k' : nf0(Math.round(v / 1000)) + ' mil ' + curSymbol)
  : (Number.isInteger(v) ? grouped(_curShort, v) : eur(v));
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
const cssVar = name => getComputedStyle(document.documentElement).getPropertyValue(name).trim();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

function tint(hex, alpha) {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

// Aplica las traducciones a los textos estáticos del HTML.
function applyStaticI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => { el.textContent = t(el.dataset.i18n); });
  document.querySelectorAll('[data-i18n-ph]').forEach(el => { el.placeholder = t(el.dataset.i18nPh); });
  document.querySelectorAll('[data-i18n-title]').forEach(el => { el.title = t(el.dataset.i18nTitle); });
  document.documentElement.lang = lang;
}

function setLang(l) {
  lang = l;
  localStorage.setItem('nomos-lang', l);
  buildFormatters();
  applyStaticI18n();
  if (me) refreshCurrent();
}

