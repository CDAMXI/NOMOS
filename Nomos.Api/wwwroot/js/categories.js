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

// ---------- Traducción de nombres de categorías comunes (en pantalla, según el idioma) ----------
// Los nombres se guardan tal cual el usuario los escribe; aquí solo se muestran en el idioma
// activo si coinciden con un término conocido. Los nombres personalizados se muestran igual.
const CAT_TERMS = [
  ['Comida', 'Food'], ['Restaurante', 'Restaurant'], ['Restaurantes', 'Restaurants'], ['Café', 'Coffee'],
  ['Supermercado', 'Groceries'], ['Compra', 'Shopping'], ['Compras', 'Shopping'], ['Bebida', 'Drinks'], ['Bebidas', 'Drinks'],
  ['Cerveza', 'Beer'], ['Transporte', 'Transport'], ['Gasolina', 'Fuel'], ['Coche', 'Car'], ['Tren', 'Train'],
  ['Autobús', 'Bus'], ['Taxi', 'Taxi'], ['Metro', 'Metro'], ['Parking', 'Parking'], ['Vuelo', 'Flight'], ['Vuelos', 'Flights'],
  ['Ocio', 'Leisure'], ['Cine', 'Cinema'], ['Música', 'Music'], ['Juegos', 'Games'], ['Videojuegos', 'Video games'],
  ['Baile', 'Dance'], ['Fiesta', 'Party'], ['Concierto', 'Concert'], ['Deporte', 'Sport'], ['Deportes', 'Sports'],
  ['Gimnasio', 'Gym'], ['Vivienda', 'Housing'], ['Alquiler', 'Rent'], ['Hipoteca', 'Mortgage'], ['Hogar', 'Home'],
  ['Luz', 'Electricity'], ['Agua', 'Water'], ['Gas', 'Gas'], ['Internet', 'Internet'], ['Teléfono', 'Phone'],
  ['Móvil', 'Mobile'], ['Salud', 'Health'], ['Farmacia', 'Pharmacy'], ['Médico', 'Doctor'], ['Dentista', 'Dentist'],
  ['Seguro', 'Insurance'], ['Seguros', 'Insurance'], ['Ropa', 'Clothes'], ['Zapatos', 'Shoes'], ['Moda', 'Fashion'],
  ['Belleza', 'Beauty'], ['Peluquería', 'Hairdresser'], ['Barbería', 'Barber'], ['Educación', 'Education'],
  ['Universidad', 'University'], ['Estudios', 'Studies'], ['Libros', 'Books'], ['Libro', 'Book'], ['Cursos', 'Courses'],
  ['Tecnología', 'Technology'], ['Regalos', 'Gifts'], ['Regalo', 'Gift'], ['Mascota', 'Pet'], ['Mascotas', 'Pets'],
  ['Viaje', 'Travel'], ['Viajes', 'Travel'], ['Vacaciones', 'Holidays'], ['Hotel', 'Hotel'], ['Impuestos', 'Taxes'],
  ['Impuesto', 'Tax'], ['Multa', 'Fine'], ['Multas', 'Fines'], ['Ahorro', 'Savings'], ['Ahorros', 'Savings'],
  ['Inversión', 'Investment'], ['Inversiones', 'Investments'], ['Nómina', 'Salary'], ['Sueldo', 'Salary'],
  ['Salario', 'Salary'], ['Trabajo', 'Work'], ['Suscripciones', 'Subscriptions'], ['Suscripción', 'Subscription'],
  ['Propina', 'Tip'], ['Donación', 'Donation'], ['Tabaco', 'Tobacco'], ['Reparaciones', 'Repairs'],
  ['Máquina expendedora', 'Vending machine'], ['Otros', 'Other'], ['Otro', 'Other'], ['Varios', 'Miscellaneous'],
];
const TERM_MAP = new Map();
for (const [es, en] of CAT_TERMS) {
  const entry = { es, en };
  TERM_MAP.set(stripAccents(es.toLowerCase()), entry);
  TERM_MAP.set(stripAccents(en.toLowerCase()), entry);
}
/** Muestra el nombre de una categoría en el idioma activo si es un término conocido. */
function catName(name) {
  const entry = TERM_MAP.get(normKey(name));
  return entry ? (lang === 'en' ? entry.en : entry.es) : name;
}
