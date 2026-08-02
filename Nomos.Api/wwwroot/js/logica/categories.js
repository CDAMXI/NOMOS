// PLUTO front-end · categorías — icono automático y traducción de nombres
'use strict';

// ---------- Glifos de trazo (24×24, al estilo SF Symbols) ----------
// El emoji sigue siendo lo que guarda la BD (espejo de CategoryIcon.cs); aquí se traduce a un
// glifo monocromo. Todos son SOLO trazo: heredan el color y el grosor del contenedor.
const GLYPHS = {
  food: '<path d="M5.6 2.6v4.6c0 1.7 1.3 3.1 2.9 3.1s2.9-1.4 2.9-3.1V2.6M8.5 2.6v4.3M8.5 10.3v11.1"/>'
      + '<path d="M16.2 2.6v18.8"/><path d="M16.2 2.6c2.7 2.3 2.7 7.4 0 9.8"/>',
  cup: '<path d="M4.5 8h11v6a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5z"/><path d="M15.5 9.5h2a2.5 2.5 0 0 1 0 5h-2"/><path d="M7 3v2M11 3v2"/>',
  cart: '<circle cx="9.5" cy="19.5" r="1.5"/><circle cx="17.5" cy="19.5" r="1.5"/><path d="M2.5 4h2.2l2.6 11h11l2.2-8H6"/>',
  car: '<path d="M3.5 15.5l1.4-5.2A2 2 0 0 1 6.8 8.8h10.4a2 2 0 0 1 1.9 1.5l1.4 5.2v3.2h-2.6v-1.7H6.1v1.7H3.5z"/><circle cx="7.4" cy="15" r="1.1"/><circle cx="16.6" cy="15" r="1.1"/>',
  bus: '<rect x="4.5" y="3.5" width="15" height="13.5" rx="2.5"/><path d="M4.5 11h15"/><circle cx="8.5" cy="14.2" r="1"/><circle cx="15.5" cy="14.2" r="1"/><path d="M7.5 17v2.5M16.5 17v2.5"/>',
  plane: '<path d="M12 2.5c1 0 1.6 1.1 1.6 2.4v4.4l7.4 4.3v2.1l-7.4-2.2v4.3l2.3 1.8v1.7L12 20.2l-3.9.9v-1.7l2.3-1.8v-4.3L3 15.7v-2.1l7.4-4.3V4.9c0-1.3.6-2.4 1.6-2.4z"/>',
  home: '<path d="M3 10.8L12 3.5l9 7.3"/><path d="M5.6 9.2V20.5h12.8V9.2"/><path d="M10 20.5v-5.6h4v5.6"/>',
  bolt: '<path d="M13.5 2.5L5 13.2h5.4l-.9 8.3L18 10.8h-5.4z"/>',
  drop: '<path d="M12 3.2c2.8 3.4 5.6 6.6 5.6 9.8a5.6 5.6 0 1 1-11.2 0c0-3.2 2.8-6.4 5.6-9.8z"/>',
  flame: '<path d="M12 2.8c3 4 5 6.2 5 9.2a5 5 0 0 1-10 0c0-2 1-3.2 2.2-4.2.4 1.6 1.4 2.2 2 2.2 0-2.2-1.2-4.2.8-7.2z"/>',
  wifi: '<path d="M2.6 8.8a14 14 0 0 1 18.8 0"/><path d="M6.2 12.4a9 9 0 0 1 11.6 0"/><path d="M9.6 15.9a4.2 4.2 0 0 1 4.8 0"/><circle cx="12" cy="19.4" r="1.1"/>',
  phone: '<rect x="6.8" y="2.5" width="10.4" height="19" rx="2.6"/><path d="M10.4 18.6h3.2"/>',
  heart: '<path d="M12 20.4C8.6 18 4.8 14.8 4.8 11.1a3.9 3.9 0 0 1 7.2-2.1 3.9 3.9 0 0 1 7.2 2.1c0 3.7-3.8 6.9-7.2 9.3z"/>',
  cross: '<circle cx="12" cy="12" r="8.4"/><path d="M12 8.2v7.6M8.2 12h7.6"/>',
  dumbbell: '<path d="M3 9.2v5.6M6.2 6.8v10.4M17.8 6.8v10.4M21 9.2v5.6M6.2 12h11.6"/>',
  film: '<rect x="3" y="4" width="18" height="16" rx="2.4"/><path d="M8 4v16M16 4v16M3 12h18"/>',
  music: '<path d="M9.2 17.6V6l10-2.2v11.6"/><ellipse cx="6.7" cy="17.9" rx="2.5" ry="2.2"/><ellipse cx="16.7" cy="15.6" rx="2.5" ry="2.2"/>',
  game: '<rect x="2.6" y="7" width="18.8" height="10" rx="4.4"/><path d="M7.4 10.4v3.2M5.8 12h3.2"/><circle cx="16.2" cy="11" r="1"/><circle cx="18.4" cy="13.4" r="1"/>',
  book: '<path d="M4 4.2h6.4a1.6 1.6 0 0 1 1.6 1.6V20a1.9 1.9 0 0 0-1.6-.9H4z"/><path d="M20 4.2h-6.4A1.6 1.6 0 0 0 12 5.8V20a1.9 1.9 0 0 1 1.6-.9H20z"/>',
  shirt: '<path d="M8.4 3.2L12 5.1l3.6-1.9 4.4 3-2.6 3.2v11.4H6.6V9.4L4 6.2z"/>',
  laptop: '<rect x="4.2" y="5" width="15.6" height="10.2" rx="1.8"/><path d="M2.4 18.4h19.2"/>',
  gift: '<path d="M3.4 8.4h17.2v3.8H3.4z"/><path d="M5.2 12.2v8.4h13.6v-8.4M12 8.4v12.2"/><path d="M12 8.4S9.6 3.6 7.6 4.9 12 8.4 12 8.4zM12 8.4s2.4-4.8 4.4-3.5S12 8.4 12 8.4z"/>',
  paw: '<ellipse cx="7.2" cy="9.4" rx="2" ry="2.4"/><ellipse cx="12" cy="7.4" rx="2" ry="2.4"/><ellipse cx="16.8" cy="9.4" rx="2" ry="2.4"/><path d="M12 12.2c-2.9 0-4.8 2-4.8 4.3S9.1 21 12 21s4.8-2.2 4.8-4.5-1.9-4.3-4.8-4.3z"/>',
  scissors: '<circle cx="6.4" cy="18" r="2.6"/><circle cx="17.6" cy="18" r="2.6"/><path d="M8.2 16.1L18 3.4M15.8 16.1L6 3.4"/>',
  receipt: '<path d="M6 3h12v18l-3-1.8-3 1.8-3-1.8L6 21z"/><path d="M9 8.4h6M9 12.4h6"/>',
  wrench: '<path d="M19.6 5.2a4.6 4.6 0 0 1-6.2 6.2L6 18.8 5.2 18l7.4-7.4a4.6 4.6 0 0 1 6.2-6.2l-2.8 2.8 2 2z"/>',
  warning: '<path d="M12 3.8l9 16.4H3z"/><path d="M12 10v4.2M12 17.2h.01"/>',
  box: '<path d="M3 8l9-5 9 5v8l-9 5-9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
  tag: '<path d="M3.2 12.4V3.6h8.8l9 9-8.8 8.8z"/><circle cx="7.4" cy="7.6" r="1.4"/>',
  bank: '<path d="M3 9.4L12 4l9 5.4"/><path d="M5.6 9.8v8.6M9.8 9.8v8.6M14.2 9.8v8.6M18.4 9.8v8.6M3.2 20.6h17.6"/>',
  card: '<rect x="2.6" y="5" width="18.8" height="14" rx="2.6"/><path d="M2.6 9.8h18.8"/>',
  chart: '<path d="M4 4.2v15.6h16"/><path d="M7.4 15.4l3.6-4.2 3 2.6 4.6-6"/>',
  cash: '<rect x="2.6" y="6" width="18.8" height="12" rx="2.2"/><circle cx="12" cy="12" r="2.6"/>',
  doc: '<path d="M6.2 3h7.4l4.2 4.2V21H6.2z"/><path d="M13.6 3v4.2h4.2"/><path d="M9 12.4h6M9 16.4h6"/>',
  moon: '<path d="M20.2 14.4A8.6 8.6 0 0 1 9.6 3.8a8.6 8.6 0 1 0 10.6 10.6z"/>',
  exit: '<path d="M14 3.8H6.2v16.4H14"/><path d="M10.8 12h9.4M17 8.6l3.4 3.4L17 15.4"/>',
  camera: '<rect x="2.8" y="7" width="18.4" height="12.2" rx="2.6"/><circle cx="12" cy="13.1" r="3.4"/><path d="M8.4 7l1.5-2.2h4.2L15.6 7"/>',
  swap: '<path d="M3.6 8.4h14.8M15.4 5.2l3.2 3.2-3.2 3.2"/><path d="M20.4 15.6H5.6M8.6 12.4l-3.2 3.2 3.2 3.2"/>',
  pencil: '<path d="M4 20l1.1-4.1L16.7 4.3a2 2 0 0 1 2.9 2.9L8 18.9z"/>',
  plus: '<path d="M12 5.2v13.6M5.2 12h13.6"/>',
};

// Emoji guardado en la BD -> glifo. Lo que no esté aquí cae en la etiqueta genérica.
const EMOJI_GLYPH = {
  '🍽️': 'food', '🍱': 'food', '🍔': 'food', '☕': 'cup', '🍺': 'cup',
  '🛒': 'cart', '🎰': 'cash', '💶': 'cash', '💰': 'cash', '🏦': 'bank',
  '⛽': 'car', '🚗': 'car', '🚕': 'car', '🚇': 'bus', '🚌': 'bus', '🚆': 'bus', '✈️': 'plane',
  '🏠': 'home', '🏡': 'home', '💡': 'bolt', '💧': 'drop', '🔥': 'flame', '📶': 'wifi', '📱': 'phone',
  '💊': 'cross', '🏥': 'cross', '❤️': 'heart', '🏋️': 'dumbbell',
  '🎬': 'film', '🎵': 'music', '🕺': 'music', '🎮': 'game', '📚': 'book',
  '👕': 'shirt', '💻': 'laptop', '🎁': 'gift', '🐶': 'paw', '💄': 'scissors', '✂️': 'scissors',
  '🧾': 'receipt', '🛠️': 'wrench', '⚠️': 'warning', '📦': 'box', '🏷️': 'tag',
  '📈': 'chart', '💳': 'card', '📄': 'doc', '🌙': 'moon', '🚪': 'exit', '📷': 'camera',
  '💱': 'swap', '🔁': 'swap', '✏️': 'pencil', '＋': 'plus',
};

/** SVG del glifo que corresponde a un emoji (o a un nombre de glifo directo). */
function glyphSvg(key) {
  return `<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true">${GLYPHS[EMOJI_GLYPH[key] || key] || GLYPHS.tag}</svg>`;
}

// Azulejo de icono al estilo Ajustes de iOS: cuadrado de color sólido con el glifo en blanco.
// Sin color propio (cuentas, broker, perfil) el azulejo va en el acento: el glifo es blanco,
// así que un azulejo sin fondo lo dejaría invisible.
const iconTile = (glyph, color) =>
  `<span class="tx-icon" style="background:${color || 'var(--accent)'}">${glyphSvg(glyph)}</span>`;

// ---------- Marcas de cuenta (entidad concreta o divisa) ----------
// Glifo de TEXTO: el símbolo de la divisa del usuario o una marca denominativa. Va RELLENO y no a
// trazo, así que lleva fill/stroke propios: el `.glyph` del CSS pinta a trazo y se hereda. Hereda
// en cambio la tipografía de la página, para que la marca no desentone con el resto.
const textGlyph = (text, { size = 15, ink = '#fff', track = 0 } = {}) =>
  `<svg class="glyph" viewBox="0 0 24 24" aria-hidden="true"><text x="12" y="12"
    text-anchor="middle" dominant-baseline="central" fill="${ink}" stroke="none"
    font-size="${size}" font-weight="700" letter-spacing="${track}">${text}</text></svg>`;

// Logotipo que no se puede dibujar con un glifo de trazo: se sirve su imagen, y el color de marca
// lo pone el azulejo. Asi las esquinas transparentes del logo se rellenan y el icono conserva el
// MISMO radio que los demas. Decorativo (alt vacio): el nombre de la cuenta va justo al lado.
const imgMark = src => `<img class="mark-img" src="${src}" alt="" width="40" height="40">`;

// El símbolo de la divisa del usuario, al tamaño que quepa: uno de un carácter va grande; un
// código de tres letras (CHF, PEN, VES) tiene que encoger.
const CUR_GLYPH_SIZE = { 1: 16, 2: 11.5, 3: 8.5 };
const currencyGlyph = () => textGlyph(curGlyph, { size: CUR_GLYPH_SIZE[curGlyph.length] || 8 });

// Cuentas que reconocemos por el NOMBRE (mismo patrón que ICON_RULES). El azulejo lleva el color
// de la entidad; el efectivo, el acento de la app y el símbolo de la divisa que tenga configurada.
const ACCOUNT_MARKS = [
  [['bbva'], { tile: '#1c5ba3', mark: () => imgMark('img/bbva.webp') }],
  [['bac'], { tile: '#e5022c', mark: () => imgMark('img/bac.webp') }],
  [['wise'], { tile: '#9ee56f', mark: () => imgMark('img/wise.webp') }],
  [['efectivo', 'metalico', 'cash', 'monedero', 'billetera', 'wallet'], { mark: currencyGlyph }],
];

// Glifo por defecto de cada tipo de cuenta, cuando no reconocemos la entidad.
const ACCOUNT_TYPE_GLYPH = { Cash: '🏦', Investment: '📈', Other: '📦', Liability: '💳' };

/** Azulejo de una cuenta: su marca si la reconocemos por el nombre; si no, el glifo de su tipo. */
function accountTile(account) {
  const name = normKey(account.name);
  const found = ACCOUNT_MARKS.find(([keys]) => keys.some(k => name.includes(k)));
  if (!found) return iconTile(ACCOUNT_TYPE_GLYPH[account.type]);
  const [, m] = found;
  return `<span class="tx-icon" style="background:${m.tile || 'var(--accent)'}">${m.mark()}</span>`;
}

// ---------- Icono automático de categoría (espejo de Nomos.Application/Common/CategoryIcon.cs) ----------
const ICON_FALLBACK = '🏷️';
const ICON_RULES = [
  ['🍽️', ['restaurante', 'restaurant', 'cena', 'bar', 'tapas', 'menu']],
  ['🛒', ['mercadona', 'carrefour', 'lidl', 'aldi', 'dia', 'super', 'compra', 'alimentacion', 'grocery']],
  ['☕', ['cafe', 'cafeteria', 'starbucks', 'coffee']],
  ['🍔', ['burger', 'hamburguesa', 'pizza', 'kebab', 'mcdonald', 'telepizza', 'comida rapida', 'fast food']],
  ['🎰', ['expendedora', 'vending', 'maquina expendedora']],
  ['🍱', ['comida', 'almuerzo', 'desayuno', 'food', 'lunch', 'dinner']],
  // Antes de 🚗: «sacar» contiene «car» y la regla del coche se lo llevaría.
  ['💶', ['efectivo', 'sacar dinero', 'cajero', 'retirada', 'reintegro', 'atm', 'cash', 'withdrawal']],
  ['⛽', ['gasolina', 'combustible', 'diesel', 'repsol', 'cepsa', 'gasolinera', 'fuel', 'gas station', 'petrol']],
  ['🚇', ['metro', 'subway']],
  ['🚌', ['bus', 'autobus', 'abono', 'emt']],
  ['🚆', ['tren', 'renfe', 'ave', 'train']],
  ['🚕', ['taxi', 'uber', 'cabify', 'bolt']],
  ['✈️', ['vuelo', 'avion', 'viaje', 'vacaciones', 'hotel', 'airbnb', 'booking', 'flight', 'travel', 'holiday']],
  ['🚗', ['coche', 'auto', 'parking', 'peaje', 'itv', 'taller', 'transporte', 'car', 'transport']],
  ['🏠', ['alquiler', 'hipoteca', 'casa', 'vivienda', 'piso', 'comunidad', 'renta', 'rent', 'mortgage', 'home', 'housing']],
  ['💡', ['luz', 'electricidad', 'endesa', 'iberdrola', 'electricity', 'power']],
  ['💧', ['agua', 'canal', 'water']],
  ['🔥', ['calefaccion', 'naturgy', 'heating', 'butano', 'gas natural']],
  ['📶', ['internet', 'fibra', 'wifi', 'movil', 'telefono', 'movistar', 'vodafone', 'orange', 'yoigo', 'phone', 'mobile']],
  ['💊', ['farmacia', 'medicina', 'medicamento', 'pharmacy', 'medicine']],
  ['🏥', ['medico', 'hospital', 'dentista', 'clinica', 'doctor', 'dentist']],
  ['🏋️', ['gimnasio', 'gym', 'fitness', 'padel', 'deporte', 'crossfit', 'sport']],
  ['🎬', ['cine', 'netflix', 'hbo', 'disney', 'teatro', 'pelicula', 'cinema', 'movie']],
  ['🎵', ['spotify', 'musica', 'concierto', 'apple music', 'music', 'concert']],
  ['🎮', ['juego', 'videojuego', 'gaming', 'steam', 'playstation', 'xbox', 'nintendo', 'ocio', 'game', 'leisure']],
  ['🕺', ['baile', 'bailar', 'danza', 'dance', 'salsa', 'bachata', 'zumba', 'discoteca']],
  ['📚', ['libro', 'libreria', 'curso', 'universidad', 'upv', 'matricula', 'educacion', 'estudios', 'formacion', 'book', 'course', 'university', 'education']],
  ['👕', ['ropa', 'moda', 'zara', 'camiseta', 'zapatos', 'calzado', 'vestir', 'clothes', 'fashion']],
  ['💻', ['ordenador', 'portatil', 'pc', 'software', 'tecnologia', 'gadget', 'laptop', 'tech']],
  ['📱', ['iphone', 'smartphone', 'android']],
  ['🎁', ['regalo', 'cumpleanos', 'navidad', 'gift', 'birthday', 'christmas']],
  ['🐶', ['mascota', 'perro', 'gato', 'veterinario', 'pienso', 'pet', 'dog', 'cat', 'vet']],
  ['💄', ['belleza', 'peluqueria', 'cosmetica', 'maquillaje', 'beauty', 'makeup']],
  ['💰', ['ahorro', 'inversion', 'nomina', 'sueldo', 'salario', 'savings', 'salary', 'investment']],
  ['🏦', ['banco', 'comision', 'hucha', 'bank']],
  ['🍺', ['cerveza', 'alcohol', 'copas', 'bebida', 'beer', 'drink']],
  ['🧾', ['impuesto', 'hacienda', 'irpf', 'iva', 'multa', 'tax', 'fine']],
  ['❤️', ['salud', 'health']],
  ['🛠️', ['reparacion', 'herramienta', 'ferreteria', 'hogar', 'repair', 'tools']],
  ['✂️', ['barberia', 'corte', 'barber', 'haircut']],
  ['⚠️', ['error', 'mistake']],
  ['📦', ['otros', 'otro', 'other', 'varios', 'misc', 'miscelanea']],
];

// ---------- Paletas temáticas (espejo de Palettes.cs; el front solo necesita `income`) ----------
// El tinte del icono de ingreso sigue la paleta del usuario; el «+importe» conserva el verde
// de DATO (esa semántica no pertenece a la paleta).
const PALETTES = {
  prisma: { income: '#34c759' }, // el verde de dato de la app ES su color de ingreso
};
const incomeColor = () => PALETTES[me?.palette]?.income || '#34c759';

const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const normKey = s => stripAccents((s || '').toLowerCase().trim());
function categoryIcon(name) {
  const n = normKey(name);
  if (!n) return ICON_FALLBACK;
  for (const [emoji, keywords] of ICON_RULES)
    for (const k of keywords)
      if (n.includes(k)) return emoji;
  return ICON_FALLBACK;
}

// El nombre de la categoría se muestra tal cual lo escribió el usuario (la tabla de
// traducción ES/EN se retiró con el selector de idioma; vive en el historial de git).
