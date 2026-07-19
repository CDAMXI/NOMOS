// PLUTO front-end · formato — $, cifras, fechas, esc, tint, i18n estático
'use strict';


// ---------- Helpers ----------
const $ = id => document.getElementById(id);
const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

let _nf2, _nf0, _cur, _curShort;
function buildFormatters() {
  const l = localeCode();
  _nf2 = new Intl.NumberFormat(l, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
  _nf0 = new Intl.NumberFormat(l, { useGrouping: true });
  _cur = new Intl.NumberFormat(l, { style: 'currency', currency: 'EUR', minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: true });
  _curShort = new Intl.NumberFormat(l, { style: 'currency', currency: 'EUR', minimumFractionDigits: 0, maximumFractionDigits: 0, useGrouping: true });
}
buildFormatters();

const decSep = () => (lang === 'en' ? '.' : ',');
// Separador de miles = espacio, SOLO para mostrar cifras (los inputs no usan esto). Espacio
// duro (U+00A0) para que la cifra no se parta de línea. Ej.: 1 234 567,89 €.
const grpSpace = parts => parts.map(p => p.type === 'group' ? ' ' : p.value).join('');
const eur = v => grpSpace(_cur.formatToParts(v));
const nf0 = v => grpSpace(_nf0.formatToParts(v));
const eurShort = v => Math.abs(v) >= 10000
  ? (lang === 'en' ? '€' + nf0(Math.round(v / 1000)) + 'k' : nf0(Math.round(v / 1000)) + ' mil €')
  : (Number.isInteger(v) ? grpSpace(_curShort.formatToParts(v)) : eur(v));
const pct1 = v => Math.abs(v).toLocaleString(localeCode(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
// Número de acciones: hasta 6 decimales (permite fracciones), miles con espacio.
const nfShares = v => grpSpace(new Intl.NumberFormat(localeCode(), { maximumFractionDigits: 6, useGrouping: true }).formatToParts(v));

// Fecha en DD/MM/YYYY (misma en ambos idiomas, por preferencia). Formateada desde la
// cadena ISO sin new Date para evitar desfases de zona horaria.
const dMed = iso => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
// Interpreta la fecha ISO como medianoche LOCAL (evita el desfase de zona con new Date(iso), que la trata como UTC).
const localDate = iso => new Date(String(iso).slice(0, 10) + 'T00:00:00');
const shortMonth = dt => cap(new Intl.DateTimeFormat(localeCode(), { month: 'short' }).format(dt).replace('.', ''));
const monthYearLabel = iso => cap(new Intl.DateTimeFormat(localeCode(), { month: 'long', year: 'numeric' }).format(new Date(String(iso).slice(0, 10) + 'T00:00:00')));

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

