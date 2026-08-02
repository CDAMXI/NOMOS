// PLUTO front-end · categorías — icono automático y traducción de nombres
'use strict';

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
const catName = name => name;
