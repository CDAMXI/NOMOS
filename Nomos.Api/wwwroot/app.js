'use strict';

// ---------- Idioma (fijo en español; el selector se retiró) ----------
let lang = 'es';
const localeCode = () => (lang === 'en' ? 'en-GB' : 'es-ES');

const I18N = {
  es: {
    error_generic: 'Ha ocurrido un error', login_required: 'Inicia sesión para continuar',
    no_data: 'Sin datos todavía.', photo_error: 'No se pudo leer la imagen',
    loading: 'Cargando…', waking_server: 'Despertando el servidor… puede tardar hasta 1 minuto la primera vez.',
    balance_label: 'Saldo disponible', adjust: 'Ajustar', evolution: 'Evolución',
    category_breakdown: 'Por categoría', recent: 'Recientes', see_all: 'Ver todo',
    summary_expenses: 'Gastos', summary_income: 'Ingresos', income_word: 'Ingreso',
    no_expenses_period: 'Sin gastos en este periodo.',
    no_movements_yet: 'Aún no hay movimientos. Añade uno con el botón +.',
    net_worth: 'Patrimonio neto', assets: 'Activos', liabilities: 'Pasivos',
    annual_evolution: 'Evolución anual', this_year: 'este año', no_history_year: 'sin histórico este año',
    add_first_account: 'Añade tu primera cuenta con el botón +.',
    section_cash: 'Cuentas y efectivo', section_investment: 'Inversiones',
    section_other: 'Otros activos', section_liability: 'Pasivos',
    available_balance_row: 'Saldo disponible', from_expenses: 'De la pestaña Gastos', updated_prefix: 'Act.',
    tab_gastos: 'Gastos', tab_patrimonio: 'Patrimonio',
    cancel: 'Cancelar', save: 'Guardar', amount: 'Monto',
    new_expense: 'Nuevo gasto', edit_expense: 'Editar gasto', new_income: 'Nuevo ingreso', edit_income: 'Editar ingreso',
    kind_expense: '💸 Gasto', kind_income: '💶 Ingreso', add_category_chip: '＋ categoría',
    description_optional: 'Descripción (opcional)', delete_expense: 'Eliminar gasto', delete_income: 'Eliminar ingreso',
    confirm_delete: '¿Eliminar "{0}"?', expense_saved: 'Gasto guardado', income_saved: 'Ingreso guardado',
    movement_updated: 'Movimiento actualizado', expense_deleted: 'Gasto eliminado', income_deleted: 'Ingreso eliminado',
    all_movements: 'Todos los movimientos', no_movements: 'Aún no hay movimientos.',
    adjust_balance: 'Ajustar saldo', how_much_now: '¿Cuánto dinero tienes ahora?',
    balance_hint: 'A partir de aquí, el saldo baja con cada gasto y sube con cada ingreso.',
    balance_updated: 'Saldo actualizado',
    categories: 'Categorías', add_category: '＋ Añadir categoría', new_category: 'Nueva categoría', edit_category: 'Editar categoría',
    icon_auto_hint: 'El icono se elige solo según el nombre', category_name_ph: 'Nombre (p. ej. Gasolina, Gimnasio…)',
    color: 'Color', delete_category: 'Eliminar categoría', confirm_delete_category: '¿Eliminar la categoría "{0}"?',
    category_deleted: 'Categoría eliminada', category_created: 'Categoría creada', category_updated: 'Categoría actualizada',
    new_account: 'Nueva cuenta', current_balance: 'Saldo actual', account_name_ph: 'Nombre (p. ej. BBVA Cuenta Corriente)',
    account_created: 'Cuenta creada', delete_account: 'Eliminar cuenta', account_deleted: 'Cuenta eliminada',
    account_label: 'Cuenta', add_account_chip: '＋ cuenta', all_accounts: 'Todas',
    profile: 'Perfil', change_photo: 'Cambiar foto', username: 'Nombre de usuario',
    manage_categories: '🏷️ Gestionar categorías', language: 'Idioma',
    change_password: 'Cambiar contraseña', current_password: 'Contraseña actual',
    new_password_ph: 'Nueva contraseña (mín. 6 caracteres)', update_password: 'Actualizar contraseña',
    logout: 'Cerrar sesión', password_updated: 'Contraseña actualizada', profile_updated: 'Perfil actualizado',
    sign_in: 'Iniciar sesión', create_account: 'Crear cuenta', enter: 'Entrar', register: 'Registrarse',
    no_account: '¿No tienes cuenta? Regístrate', have_account: '¿Ya tienes cuenta? Inicia sesión',
    username_ph: 'Nombre de usuario', password_ph: 'Contraseña', repeat_password_ph: 'Repite la contraseña',
    fill_user_pass: 'Rellena usuario y contraseña.', passwords_no_match: 'Las contraseñas no coinciden.',
    choose_photo: 'Elegir foto de perfil', theme_toggle: 'Cambiar tema', add: 'Añadir', edit: 'Editar',
    thousands: 'mil'
  },
  en: {
    error_generic: 'Something went wrong', login_required: 'Please sign in to continue',
    no_data: 'No data yet.', photo_error: 'Could not read the image',
    loading: 'Loading…', waking_server: 'Waking the server… this can take up to a minute the first time.',
    balance_label: 'Available balance', adjust: 'Adjust', evolution: 'Trend',
    category_breakdown: 'By category', recent: 'Recent', see_all: 'See all',
    summary_expenses: 'Spent', summary_income: 'Income', income_word: 'Income',
    no_expenses_period: 'No expenses in this period.',
    no_movements_yet: 'No movements yet. Add one with the + button.',
    net_worth: 'Net worth', assets: 'Assets', liabilities: 'Liabilities',
    annual_evolution: 'Yearly trend', this_year: 'this year', no_history_year: 'no history this year',
    add_first_account: 'Add your first account with the + button.',
    section_cash: 'Cash & accounts', section_investment: 'Investments',
    section_other: 'Other assets', section_liability: 'Liabilities',
    available_balance_row: 'Available balance', from_expenses: 'From the Expenses tab', updated_prefix: 'Upd.',
    tab_gastos: 'Expenses', tab_patrimonio: 'Wealth',
    cancel: 'Cancel', save: 'Save', amount: 'Amount',
    new_expense: 'New expense', edit_expense: 'Edit expense', new_income: 'New income', edit_income: 'Edit income',
    kind_expense: '💸 Expense', kind_income: '💶 Income', add_category_chip: '＋ category',
    description_optional: 'Description (optional)', delete_expense: 'Delete expense', delete_income: 'Delete income',
    confirm_delete: 'Delete "{0}"?', expense_saved: 'Expense saved', income_saved: 'Income saved',
    movement_updated: 'Movement updated', expense_deleted: 'Expense deleted', income_deleted: 'Income deleted',
    all_movements: 'All movements', no_movements: 'No movements yet.',
    adjust_balance: 'Adjust balance', how_much_now: 'How much money do you have now?',
    balance_hint: 'From now on, the balance drops with each expense and rises with each income.',
    balance_updated: 'Balance updated',
    categories: 'Categories', add_category: '＋ Add category', new_category: 'New category', edit_category: 'Edit category',
    icon_auto_hint: 'The icon is picked automatically from the name', category_name_ph: 'Name (e.g. Fuel, Gym…)',
    color: 'Color', delete_category: 'Delete category', confirm_delete_category: 'Delete the category "{0}"?',
    category_deleted: 'Category deleted', category_created: 'Category created', category_updated: 'Category updated',
    new_account: 'New account', current_balance: 'Current balance', account_name_ph: 'Name (e.g. Checking account)',
    account_created: 'Account created', delete_account: 'Delete account', account_deleted: 'Account deleted',
    account_label: 'Account', add_account_chip: '＋ account', all_accounts: 'All',
    profile: 'Profile', change_photo: 'Change photo', username: 'Username',
    manage_categories: '🏷️ Manage categories', language: 'Language',
    change_password: 'Change password', current_password: 'Current password',
    new_password_ph: 'New password (min. 6 characters)', update_password: 'Update password',
    logout: 'Log out', password_updated: 'Password updated', profile_updated: 'Profile updated',
    sign_in: 'Sign in', create_account: 'Create account', enter: 'Enter', register: 'Sign up',
    no_account: "Don't have an account? Sign up", have_account: 'Already have an account? Sign in',
    username_ph: 'Username', password_ph: 'Password', repeat_password_ph: 'Repeat password',
    fill_user_pass: 'Fill in username and password.', passwords_no_match: 'Passwords do not match.',
    choose_photo: 'Choose profile photo', theme_toggle: 'Toggle theme', add: 'Add', edit: 'Edit',
    thousands: 'k'
  }
};

const t = (k, ...a) => {
  let s = (I18N[lang] && I18N[lang][k]) ?? I18N.es[k] ?? k;
  a.forEach((v, i) => { s = s.replace(`{${i}}`, v); });
  return s;
};

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
const eur = v => _cur.format(v);
const eurShort = v => Math.abs(v) >= 10000
  ? (lang === 'en' ? '€' + _nf0.format(Math.round(v / 1000)) + 'k' : _nf0.format(Math.round(v / 1000)) + ' mil €')
  : (Number.isInteger(v) ? _curShort.format(v) : _cur.format(v));
const pct1 = v => Math.abs(v).toLocaleString(localeCode(), { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';

// Fecha en DD/MM/YYYY (misma en ambos idiomas, por preferencia). Formateada desde la
// cadena ISO sin new Date para evitar desfases de zona horaria.
const dMed = iso => {
  const [y, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}/${y}`;
};
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

// ---------- Icono automático de categoría (espejo de Nomos.Application/Common/CategoryIcon.cs) ----------
const ICON_FALLBACK = '🏷️';
const ICON_RULES = [
  ['🍽️', ['restaurante', 'restaurant', 'cena', 'bar', 'tapas', 'menu']],
  ['🛒', ['mercadona', 'carrefour', 'lidl', 'aldi', 'dia', 'super', 'compra', 'alimentacion', 'grocery']],
  ['☕', ['cafe', 'cafeteria', 'starbucks', 'coffee']],
  ['🍔', ['burger', 'hamburguesa', 'pizza', 'kebab', 'mcdonald', 'telepizza', 'comida rapida', 'fast food']],
  ['🎰', ['expendedora', 'vending', 'maquina expendedora']],
  ['🍱', ['comida', 'almuerzo', 'desayuno', 'food', 'lunch', 'dinner']],
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
  ['📦', ['otros', 'otro', 'other', 'varios', 'misc', 'miscelanea']],
];

const stripAccents = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
function categoryIcon(name) {
  const n = stripAccents((name || '').toLowerCase().trim());
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
  const entry = TERM_MAP.get(stripAccents((name || '').toLowerCase().trim()));
  return entry ? (lang === 'en' ? entry.en : entry.es) : name;
}

// ---------- Red ----------
async function parseError(res) {
  let msg = await res.text();
  try { msg = JSON.parse(msg); } catch { /* plain text */ }
  return typeof msg === 'string' && msg ? msg : t('error_generic');
}

async function getJSON(url) {
  const res = await fetch(url);
  if (res.status === 401) { showAuth(); throw new Error(t('login_required')); }
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function sendJSON(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const msg = await parseError(res);
    if (res.status === 401 && !url.includes('/auth/login')) showAuth();
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}

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

function renderLineChart(el, points, { id, color, xFmt, yFmt }) {
  if (!points.length) { el.innerHTML = `<p class="tx-sub">${t('no_data')}</p>`; return; }
  const W = 600, H = 230, L = 46, R = 10, T = 12, B = 26;
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
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".26"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${axes}
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
  </svg>`;
}

function renderDonut(el, items) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) { el.innerHTML = ''; return; }
  const r = 52, C = 2 * Math.PI * r;
  let off = 0, segs = '';
  for (const it of items) {
    const len = it.value / total * C;
    segs += `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${it.color}" stroke-width="28"
      stroke-dasharray="${Math.max(len - 3, .8).toFixed(1)} ${C.toFixed(1)}"
      stroke-dashoffset="${(-off).toFixed(1)}" stroke-linecap="round"/>`;
    off += len;
  }
  el.innerHTML = `<svg viewBox="0 0 140 140" style="transform:rotate(-90deg)">${segs}</svg>`;
}

// ---------- Estado ----------
let me = null;             // usuario autenticado {id, username, photoDataUrl}
let currentView = 'gastos';
let days = 30;
let categories = [];
let recentCache = [];
let accountsCache = [];
let heroAccountSel;        // qué saldo muestra el hero de Gastos: id de cuenta, 'all', o undefined (→ 1.ª cuenta)

async function ensureCategoriesFresh() {
  categories = await getJSON('/api/categories');
  return categories;
}

// ---------- Avatares ----------
function avatarHtml(user) {
  return user.photoDataUrl
    ? `<img src="${esc(user.photoDataUrl)}" alt="">`
    : `<span class="avatar-initial">${esc(user.username.charAt(0).toUpperCase())}</span>`;
}

function renderTopAvatar() {
  const btn = $('profileBtn');
  btn.innerHTML = avatarHtml(me);
  btn.classList.remove('hidden');
}

/** Recorta al centro y reduce la imagen a un cuadrado pequeño en data URL. */
function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const s = Math.min(img.width, img.height);
        canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', .85));
      } catch (e) { reject(e); }
      finally { URL.revokeObjectURL(img.src); }
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error(t('photo_error'))); };
    img.src = URL.createObjectURL(file);
  });
}

// ---------- Vista Gastos ----------
async function loadGastos() {
  const [d, accounts] = await Promise.all([
    getJSON(`/api/expenses/dashboard?days=${days}`),
    getJSON('/api/accounts')
  ]);

  // Hero: balance of ONE cash account at a time (switchable); d.balance is the all-accounts total.
  renderHeroBalance(accounts.filter(a => a.type === 'Cash'), d.balance);

  let summary = `${monthYearLabel(d.monthDate)} · <span class="sum-out">${t('summary_expenses')} ${eur(d.monthTotal)}</span>`;
  if (d.monthIncome > 0) summary += ` · <span class="sum-in">${t('summary_income')} +${eur(d.monthIncome)}</span>`;
  $('gMonthSummary').innerHTML = summary;

  renderLineChart($('gChart'), d.series.map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-gastos',
    color: cssVar('--accent'),
    xFmt: iso => { const dt = new Date(iso); return dt.getDate() + ' ' + shortMonth(dt); },
    yFmt: v => _nf0.format(Math.round(v))
  });

  renderDonut($('gDonut'), d.byCategory.map(c => ({ color: c.category.color, value: c.total })));
  $('gCatList').innerHTML = d.byCategory.map(c => `
    <li><span class="dot" style="background:${c.category.color}"></span>
      ${esc(catName(c.category.name))}<span class="amount">${eur(c.total)}</span></li>`).join('')
    || `<li class="tx-sub">${t('no_expenses_period')}</li>`;

  recentCache = d.recent;
  $('gRecent').innerHTML = d.recent.map((tx, i) => txRow(tx, i)).join('')
    || `<li class="tx-sub">${t('no_movements_yet')}</li>`;
  bindTxRows($('gRecent'), recentCache);
}

// Hero balance: shows the live balance of one cash account at a time, with a chip switcher.
// 'all' shows the total across cash accounts. The selection survives auto-refresh.
function renderHeroBalance(cash, total) {
  const box = $('gBalanceAccounts');
  const ids = cash.map(a => a.id);
  // Default to (or repair to) the first account; keep a valid prior choice or 'all'.
  if (heroAccountSel !== 'all' && !ids.includes(heroAccountSel)) heroAccountSel = ids[0] ?? 'all';

  const paint = () => {
    const bal = heroAccountSel === 'all'
      ? total
      : (cash.find(a => a.id === heroAccountSel)?.balance ?? total);
    const el = $('gBalance');
    el.textContent = eur(bal);
    el.classList.toggle('red', bal < 0);
    box.querySelectorAll('[data-bal]').forEach(ch =>
      ch.classList.toggle('selected', ch.dataset.bal === String(heroAccountSel)));
  };

  // Only offer the switcher when there is more than one cash account.
  if (cash.length < 2) {
    box.classList.add('hidden');
    box.innerHTML = '';
    paint();
    return;
  }
  box.classList.remove('hidden');
  box.innerHTML = cash.map(a =>
    `<button class="chip" data-bal="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}</button>`).join('')
    + `<button class="chip" data-bal="all">${t('all_accounts')}</button>`;
  box.querySelectorAll('[data-bal]').forEach(ch =>
    ch.addEventListener('click', () => {
      heroAccountSel = ch.dataset.bal === 'all' ? 'all' : +ch.dataset.bal;
      paint();
    }));
  paint();
}

function txRow(tx, index) {
  const isIncome = tx.kind === 'income';
  const icon = isIncome ? '💶' : tx.category.icon;
  const bg = isIncome ? tint('#34c759', .16) : tint(tx.category.color, .16);
  let sub = (isIncome ? t('income_word') : catName(tx.category.name)) + ' · ' + dMed(tx.date);
  if (tx.accountName) sub += ' · ' + tx.accountName;
  const amount = isIncome
    ? `<span class="tx-amount green">+${eur(tx.amount)}</span>`
    : `<span class="tx-amount">−${eur(tx.amount)}</span>`;
  return `<li class="clickable" data-i="${index}" data-i18n-title="edit" title="${t('edit')}">
    <span class="tx-icon" style="background:${bg}">${icon}</span>
    <span class="tx-main">
      <span class="tx-title">${esc(tx.description)}</span>
      <div class="tx-sub">${esc(sub)}</div>
    </span>
    ${amount}
  </li>`;
}

function bindTxRows(listEl, cache) {
  listEl.querySelectorAll('li[data-i]').forEach(li =>
    li.addEventListener('click', () => openTxSheet(cache[+li.dataset.i])));
}

// ---------- Vista Patrimonio ----------
const TYPE_ICON = { Cash: '🏦', Investment: '📈', Other: '📦', Liability: '💳' };
const TYPE_KEY = { Cash: 'section_cash', Investment: 'section_investment', Other: 'section_other', Liability: 'section_liability' };

async function loadPatrimonio() {
  const d = await getJSON('/api/networth');
  accountsCache = d.accounts;

  $('nwTotal').textContent = eur(d.net);
  const deltaEl = $('nwDelta');
  deltaEl.classList.add('invert');
  if (d.yearDeltaPct === null || d.yearDeltaPct === undefined) {
    deltaEl.innerHTML = `<span class="tx-sub">${t('no_history_year')}</span>`;
  } else {
    const up = d.yearDeltaPct >= 0;
    deltaEl.innerHTML = `<span class="${up ? 'up' : 'down'}">${up ? '▲' : '▼'} ${pct1(d.yearDeltaPct)}</span> ${t('this_year')}`;
  }

  $('nwAssets').textContent = eurShort(d.assets);
  $('nwLiab').textContent = eurShort(d.liabilities);

  renderLineChart($('nwChart'), d.series.map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-nw',
    color: cssVar('--green'),
    xFmt: iso => shortMonth(new Date(iso)),
    yFmt: v => v >= 1000 ? _nf0.format(Math.round(v / 1000)) + 'k' : _nf0.format(Math.round(v))
  });

  // Cada cuenta de efectivo/banco muestra su saldo vivo (base + ingresos − gastos asignados).
  const cashAccs = d.accounts.filter(a => a.type === 'Cash');
  let html = cashAccs.length
    ? `<p class="section-title">${t('section_cash')}</p><ul class="acc-list">${cashAccs.map(accRow).join('')}</ul>`
    : '';
  ['Investment', 'Other', 'Liability'].forEach(type => {
    const accs = d.accounts.filter(a => a.type === type);
    if (accs.length) html += `<p class="section-title">${t(TYPE_KEY[type])}</p><ul class="acc-list">${accs.map(accRow).join('')}</ul>`;
  });
  $('nwSections').innerHTML = html || `<p class="tx-sub">${t('add_first_account')}</p>`;

  document.querySelectorAll('#nwSections li[data-acc]').forEach(li =>
    li.addEventListener('click', () => openAccountEditSheet(+li.dataset.acc)));
}

function accRow(a) {
  const isLiab = a.type === 'Liability';
  return `<li data-acc="${a.id}" class="clickable">
    <span class="tx-icon" style="background:${tint(isLiab ? '#e8332a' : '#34c759', .14)}">${TYPE_ICON[a.type]}</span>
    <span class="tx-main">
      <span class="tx-title">${esc(a.name)}</span>
      <div class="tx-sub">${t('updated_prefix')} ${dMed(a.updatedAt)}</div>
    </span>
    <span class="tx-amount ${isLiab ? 'red' : ''}">${eurShort(a.balance)}</span>
    <span class="acc-chevron">›</span>
  </li>`;
}

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

$('sheetCancel').addEventListener('click', closeSheet);
sheetSave.addEventListener('click', async () => {
  if (sheetSave.disabled || !sheetCtx?.onSave) return;
  const ctx = sheetCtx;
  sheetSave.disabled = true; // evita doble envío mientras la petición está en curso
  try {
    await ctx.onSave();
    closeSheet();
    await refreshCurrent();
    ctx.afterSave?.();
  } catch (e) {
    toast(e.message);
    refreshSaveState();
  }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape' && sheetCtx) closeSheet(); });

// --- Teclado numérico compartido ---
let amountStr = '';

function amountBlock(label) {
  return `<div class="amount-block">
    <p class="amount-label">${label}</p>
    <p class="amount-display"><span id="amountText">0</span><span class="cur">€</span></p>
  </div>`;
}

function keypadHtml() {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '.', '0', 'back'];
  return `<div class="keypad">${keys.map(k =>
    `<button class="key${k === 'back' ? ' alt' : ''}" data-key="${k}">${k === 'back' ? '⌫' : k}</button>`
  ).join('')}</div>`;
}

function bindKeypad(container) {
  container.querySelectorAll('[data-key]').forEach(btn =>
    btn.addEventListener('click', () => pressKey(btn.dataset.key)));
}

function paintAmount() {
  const el = $('amountText');
  if (!el) return;
  const [i, dPart] = amountStr.split('.');
  el.textContent = dPart === undefined ? _nf0.format(Number(i || 0)) : _nf0.format(Number(i || 0)) + decSep() + dPart;
}

function pressKey(k) {
  if (k === 'back') amountStr = amountStr.slice(0, -1);
  else if (k === '.') { if (!amountStr.includes('.')) amountStr = amountStr ? amountStr + '.' : '0.'; }
  else {
    const [ints, decs] = amountStr.split('.');
    if (decs !== undefined && decs.length >= 2) return;
    if (decs === undefined && ints && ints.length >= 7) return;
    amountStr = amountStr === '0' ? k : amountStr + k;
  }
  paintAmount();
  refreshSaveState();
}

const amountValue = () => Math.round((parseFloat(amountStr) || 0) * 100) / 100;

function setAmount(v) {
  amountStr = v ? (Number.isInteger(v) ? String(v) : v.toFixed(2)) : '';
}

// --- Nuevo movimiento / editar movimiento (gasto o ingreso) ---
async function openTxSheet(existing = null, draft = null) {
  await ensureCategoriesFresh();
  const cashAccounts = (await getJSON('/api/accounts')).filter(a => a.type === 'Cash');
  const isEdit = !!existing;
  let kind = existing ? existing.kind : (draft?.kind || 'expense');
  let selectedCat = existing?.category?.id ?? draft?.categoryId ?? categories[0]?.id;
  // Edits keep exactly the account the movement already had (including "none", so a
  // previously-unassigned movement is never silently reattached on save); only brand-new
  // movements default to the first cash account so the user rarely has to pick one.
  let selectedAccount = existing
    ? (existing.accountId ?? null)
    : (draft?.accountId ?? cashAccounts[0]?.id ?? null);
  setAmount(existing ? existing.amount : (draft?.amount || 0));
  const startDesc = existing ? existing.description : (draft?.description || '');

  const titleFor = () => t(isEdit
    ? (kind === 'income' ? 'edit_income' : 'edit_expense')
    : (kind === 'income' ? 'new_income' : 'new_expense'));

  openSheet({
    title: titleFor(),
    canSave: () => amountValue() > 0 && (kind === 'income' || selectedCat),
    build(body) {
      body.innerHTML = `
        ${isEdit ? '' : `<div class="kind-toggle">
          <button class="pill" data-kind="expense">${t('kind_expense')}</button>
          <button class="pill" data-kind="income">${t('kind_income')}</button>
        </div>`}
        ${amountBlock(t('amount'))}
        <div class="chips" id="catChips">${[...categories].sort((a, b) => catName(a.name).localeCompare(catName(b.name), localeCode())).map(c =>
          `<button class="chip" data-cat="${c.id}">${c.icon} ${esc(catName(c.name))}</button>`).join('')}
          ${isEdit ? '' : `<button class="chip chip-add" id="addCatChip">${t('add_category_chip')}</button>`}</div>
        ${(cashAccounts.length >= 1 || !isEdit) ? `<p class="tx-sub cat-hint">${t('account_label')}</p>
        <div class="chips" id="accChips">${cashAccounts.map(a =>
          `<button class="chip" data-acc="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}</button>`).join('')}
          ${isEdit ? '' : `<button class="chip chip-add" id="addAccChip">${t('add_account_chip')}</button>`}</div>` : ''}
        <input id="descField" class="text-field" placeholder="${t('description_optional')}" maxlength="120" value="${esc(startDesc)}">
        <input id="dateField" class="text-field" type="date" value="${existing ? existing.date : (draft?.date || todayISO())}">
        ${keypadHtml()}
        ${isEdit ? `<button id="deleteTx" class="danger-btn">${t(kind === 'income' ? 'delete_income' : 'delete_expense')}</button>` : ''}`;
      paintAmount();
      bindKeypad(body);

      const paintChips = () => {
        $('catChips').classList.toggle('hidden', kind === 'income');
        body.querySelectorAll('.chip[data-cat]').forEach(ch => {
          const cat = categories.find(c => c.id === +ch.dataset.cat);
          const sel = cat.id === selectedCat;
          ch.classList.toggle('selected', sel);
          ch.style.background = sel ? tint(cat.color, .18) : '';
          ch.style.color = sel ? cat.color : '';
        });
      };
      body.querySelectorAll('.chip[data-cat]').forEach(ch =>
        ch.addEventListener('click', () => { selectedCat = +ch.dataset.cat; paintChips(); refreshSaveState(); }));

      const addChip = $('addCatChip');
      if (addChip) addChip.addEventListener('click', () => {
        const carry = { kind, amount: amountValue(), description: $('descField').value, date: $('dateField').value, accountId: selectedAccount };
        openCategoryEditSheet(null, saved => openTxSheet(null, { ...carry, categoryId: saved?.id }).catch(e => toast(e.message)));
      });

      const paintAccChips = () => body.querySelectorAll('.chip[data-acc]').forEach(ch => {
        const sel = +ch.dataset.acc === selectedAccount;
        ch.classList.toggle('selected', sel);
        ch.style.background = sel ? 'var(--accent-soft)' : '';
        ch.style.color = sel ? 'var(--accent)' : '';
      });
      body.querySelectorAll('.chip[data-acc]').forEach(ch =>
        ch.addEventListener('click', () => { selectedAccount = +ch.dataset.acc; paintAccChips(); }));
      paintAccChips();

      const addAccChip = $('addAccChip');
      if (addAccChip) addAccChip.addEventListener('click', () => {
        const carry = { kind, amount: amountValue(), description: $('descField').value, date: $('dateField').value, categoryId: selectedCat };
        openAccountSheet(saved => openTxSheet(null, { ...carry, accountId: saved?.id }).catch(e => toast(e.message)), { cashOnly: true });
      });

      const paintKind = () => {
        sheetTitle.textContent = titleFor();
        body.querySelectorAll('[data-kind]').forEach(p => p.classList.toggle('active', p.dataset.kind === kind));
        const del = $('deleteTx');
        if (del) del.textContent = t(kind === 'income' ? 'delete_income' : 'delete_expense');
        paintChips();
      };
      body.querySelectorAll('[data-kind]').forEach(p =>
        p.addEventListener('click', () => { kind = p.dataset.kind; paintKind(); refreshSaveState(); }));
      paintKind();

      if (isEdit) {
        $('deleteTx').addEventListener('click', async () => {
          if (!confirm(t('confirm_delete', existing.description))) return;
          try {
            await sendJSON(`/api/${kind === 'income' ? 'incomes' : 'expenses'}/${existing.id}`, 'DELETE');
            closeSheet();
            await refreshCurrent();
            toast(t(kind === 'income' ? 'income_deleted' : 'expense_deleted'));
          } catch (e) { toast(e.message); }
        });
      }
    },
    async onSave() {
      const date = $('dateField').value || todayISO();
      const description = $('descField').value;
      if (kind === 'income') {
        const payload = { amount: amountValue(), description, date, accountId: selectedAccount };
        if (isEdit) await sendJSON(`/api/incomes/${existing.id}`, 'PUT', payload);
        else await sendJSON('/api/incomes', 'POST', payload);
      } else {
        const payload = { amount: amountValue(), categoryId: selectedCat, description, date, accountId: selectedAccount };
        if (isEdit) await sendJSON(`/api/expenses/${existing.id}`, 'PUT', payload);
        else await sendJSON('/api/expenses', 'POST', payload);
      }
      toast(t(isEdit ? 'movement_updated' : (kind === 'income' ? 'income_saved' : 'expense_saved')));
    }
  });
}

// --- Ver todo (lista completa de movimientos) ---
async function openAllTxSheet() {
  const items = await getJSON('/api/transactions');
  openSheet({
    title: t('all_movements'),
    build(body) {
      body.innerHTML = `<ul class="sheet-list tx-list">${items.map((tx, i) => txRow(tx, i)).join('')
        || `<li class="tx-sub">${t('no_movements')}</li>`}</ul>`;
      bindTxRows(body, items);
    }
  });
}

// --- Gestión de categorías ---
async function openCategoriesSheet() {
  await ensureCategoriesFresh();
  openSheet({
    title: t('categories'),
    build(body) {
      const sorted = [...categories].sort((a, b) => catName(a.name).localeCompare(catName(b.name), localeCode()));
      body.innerHTML = `<ul class="sheet-list cat-manage">${sorted.map(c => `
        <li class="clickable" data-cat="${c.id}">
          <span class="tx-icon" style="background:${tint(c.color, .16)}">${c.icon}</span>
          <span class="tx-main"><span class="tx-title">${esc(catName(c.name))}</span></span>
          <span class="acc-chevron">›</span>
        </li>`).join('')}</ul>
        <button id="addCat" class="inline-btn">${t('add_category')}</button>`;
      body.querySelectorAll('li[data-cat]').forEach(li =>
        li.addEventListener('click', () => {
          const c = categories.find(x => x.id === +li.dataset.cat);
          openCategoryEditSheet(c, () => openCategoriesSheet());
        }));
      $('addCat').addEventListener('click', () => openCategoryEditSheet(null, () => openCategoriesSheet()));
    }
  });
}

// --- Crear / editar una categoría (icono automático según el nombre) ---
function openCategoryEditSheet(cat = null, onDone = null) {
  const isEdit = !!cat;
  let saved = null;

  openSheet({
    title: t(isEdit ? 'edit_category' : 'new_category'),
    canSave: () => $('catName')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = `
        <div class="cat-editor">
          <div class="cat-icon-preview" id="catIconPreview">${cat ? cat.icon : ICON_FALLBACK}</div>
          <p class="tx-sub cat-hint">${t('icon_auto_hint')}</p>
          <input id="catName" class="text-field" placeholder="${t('category_name_ph')}" maxlength="40" value="${cat ? esc(catName(cat.name)) : ''}">
        </div>
        ${isEdit ? `<button id="deleteCat" class="danger-btn">${t('delete_category')}</button>` : ''}`;

      const nameEl = $('catName'), preview = $('catIconPreview');
      const paintIcon = () => { preview.textContent = categoryIcon(nameEl.value); };
      nameEl.addEventListener('input', () => { paintIcon(); refreshSaveState(); });
      if (!isEdit) paintIcon();

      if (isEdit) {
        $('deleteCat').addEventListener('click', async () => {
          if (!confirm(t('confirm_delete_category', catName(cat.name)))) return;
          try {
            await sendJSON(`/api/categories/${cat.id}`, 'DELETE');
            await ensureCategoriesFresh();
            closeSheet();
            await refreshCurrent();
            toast(t('category_deleted'));
            onDone?.(null);
          } catch (e) { toast(e.message); }
        });
      }
    },
    async onSave() {
      const payload = { name: $('catName').value };
      saved = isEdit
        ? await sendJSON(`/api/categories/${cat.id}`, 'PUT', payload)
        : await sendJSON('/api/categories', 'POST', payload);
      await ensureCategoriesFresh();
      toast(t(isEdit ? 'category_updated' : 'category_created'));
    },
    afterSave() { onDone?.(saved); }
  });
}

// --- Nueva cuenta / activo ---
// onDone(saved) se llama tras crear (para volver al movimiento). opts.cashOnly = alta rápida
// de una cuenta de efectivo/banco (sin selector de tipo), p. ej. desde el chip "＋ cuenta".
function openAccountSheet(onDone = null, opts = {}) {
  setAmount(0);
  let selectedType = 'Cash';
  let saved = null;

  openSheet({
    title: t('new_account'),
    canSave: () => $('nameField')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = amountBlock(t('current_balance')) + `
        ${opts.cashOnly ? '' : `<div class="chips">${Object.keys(TYPE_ICON).map(type =>
          `<button class="chip" data-type="${type}">${TYPE_ICON[type]} ${t(TYPE_KEY[type])}</button>`).join('')}</div>`}
        <input id="nameField" class="text-field" placeholder="${t('account_name_ph')}" maxlength="80" autofocus>
        ${keypadHtml()}`;
      paintAmount();
      bindKeypad(body);
      if (!opts.cashOnly) {
        const paint = () => body.querySelectorAll('.chip[data-type]').forEach(ch => {
          const sel = ch.dataset.type === selectedType;
          ch.classList.toggle('selected', sel);
          ch.style.background = sel ? 'var(--accent-soft)' : '';
          ch.style.color = sel ? 'var(--accent)' : '';
        });
        body.querySelectorAll('.chip[data-type]').forEach(ch =>
          ch.addEventListener('click', () => { selectedType = ch.dataset.type; paint(); }));
        paint();
      }
      $('nameField').addEventListener('input', refreshSaveState);
    },
    async onSave() {
      saved = await sendJSON('/api/accounts', 'POST', {
        name: $('nameField').value,
        type: selectedType,
        balance: amountValue()
      });
      toast(t('account_created'));
    },
    afterSave() { onDone?.(saved); }
  });
}

// --- Editar cuenta (actualizar saldo / eliminar) ---
function openAccountEditSheet(id) {
  const acc = accountsCache.find(a => a.id === id);
  if (!acc) return;
  setAmount(acc.balance);

  openSheet({
    title: acc.name,
    canSave: () => $('nameField')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = amountBlock(t('current_balance')) + `
        <input id="nameField" class="text-field" maxlength="80" value="${esc(acc.name)}">
        ${keypadHtml()}
        <button id="deleteAcc" class="danger-btn">${t('delete_account')}</button>`;
      paintAmount();
      bindKeypad(body);
      $('nameField').addEventListener('input', refreshSaveState);
      $('deleteAcc').addEventListener('click', async () => {
        if (!confirm(t('confirm_delete', acc.name))) return;
        try {
          await sendJSON(`/api/accounts/${acc.id}`, 'DELETE');
          closeSheet();
          await refreshCurrent();
          toast(t('account_deleted'));
        } catch (e) { toast(e.message); }
      });
    },
    async onSave() {
      await sendJSON(`/api/accounts/${acc.id}`, 'PUT', {
        name: $('nameField').value,
        balance: amountValue()
      });
      toast(t('balance_updated'));
    }
  });
}

// --- Perfil ---
function openProfileSheet() {
  let newPhoto = null; // solo se envía si el usuario elige una nueva

  openSheet({
    title: t('profile'),
    canSave: () => $('profUsername')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = `
        <div class="profile-photo-wrap">
          <label class="avatar-pick filled" for="profPhotoInput" id="profAvatar" title="${t('change_photo')}">${avatarHtml(me)}</label>
          <input id="profPhotoInput" type="file" accept="image/*" hidden>
          <label class="link" for="profPhotoInput">${t('change_photo')}</label>
        </div>
        <p class="muted-label">${t('username')}</p>
        <input id="profUsername" class="text-field" maxlength="30" value="${esc(me.username)}">
        <div class="divider"></div>
        <button id="manageCatsBtn" class="inline-btn">${t('manage_categories')}</button>
        <div class="divider"></div>
        <p class="muted-label">${t('change_password')}</p>
        <input id="profCurPass" class="text-field" type="password" placeholder="${t('current_password')}" maxlength="128" autocomplete="current-password">
        <input id="profNewPass" class="text-field" type="password" placeholder="${t('new_password_ph')}" maxlength="128" autocomplete="new-password">
        <button id="changePassBtn" class="inline-btn">${t('update_password')}</button>
        <div class="divider"></div>
        <button id="logoutBtn" class="danger-btn">${t('logout')}</button>`;

      $('profUsername').addEventListener('input', refreshSaveState);

      $('profPhotoInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          newPhoto = await resizeImage(file);
          $('profAvatar').innerHTML = `<img src="${newPhoto}" alt="">`;
        } catch { toast(t('photo_error')); }
      });

      $('manageCatsBtn').addEventListener('click', () => openCategoriesSheet());

      $('changePassBtn').addEventListener('click', async () => {
        try {
          await sendJSON('/api/auth/password', 'PUT', {
            currentPassword: $('profCurPass').value,
            newPassword: $('profNewPass').value
          });
          $('profCurPass').value = '';
          $('profNewPass').value = '';
          toast(t('password_updated'));
        } catch (e) { toast(e.message); }
      });

      $('logoutBtn').addEventListener('click', async () => {
        try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* sin conexión */ }
        closeSheet();
        showAuth();
      });
    },
    async onSave() {
      me = await sendJSON('/api/auth/profile', 'PUT', {
        username: $('profUsername').value,
        photoDataUrl: newPhoto
      });
      renderTopAvatar();
      toast(t('profile_updated'));
    }
  });
}

// ---------- Autenticación ----------
const authScreen = $('authScreen');
let authMode = 'login';
let authPhoto = null;

function setAuthMode(mode) {
  authMode = mode;
  const isRegister = mode === 'register';
  $('authTitle').textContent = t(isRegister ? 'create_account' : 'sign_in');
  $('authSubmit').textContent = t(isRegister ? 'register' : 'enter');
  $('authToggle').textContent = t(isRegister ? 'have_account' : 'no_account');
  $('authPass2').classList.toggle('hidden', !isRegister);
  $('authPhotoPick').classList.toggle('hidden', !isRegister);
  $('authPass').autocomplete = isRegister ? 'new-password' : 'current-password';
  $('authError').textContent = '';
}

function showAuth() {
  me = null;
  if (sheetCtx) closeSheet();
  $('profileBtn').classList.add('hidden');
  $('fab').classList.add('hidden');
  authPhoto = null;
  $('authPhotoPick').classList.remove('filled');
  $('authPhotoPick').textContent = '📷';
  $('authUser').value = '';
  $('authPass').value = '';
  $('authPass2').value = '';
  setAuthMode('login');
  authScreen.classList.remove('hidden');
}

function enterApp() {
  authScreen.classList.add('hidden');
  renderTopAvatar();
  $('fab').classList.remove('hidden');
  refreshCurrent();
}

$('authToggle').addEventListener('click', () => setAuthMode(authMode === 'login' ? 'register' : 'login'));

$('authPhotoInput').addEventListener('change', async e => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    authPhoto = await resizeImage(file);
    const pick = $('authPhotoPick');
    pick.classList.add('filled');
    pick.innerHTML = `<img src="${authPhoto}" alt="">`;
  } catch { $('authError').textContent = t('photo_error'); }
});

async function submitAuth() {
  const username = $('authUser').value.trim();
  const password = $('authPass').value;
  const errorEl = $('authError');
  errorEl.textContent = '';

  if (!username || !password) { errorEl.textContent = t('fill_user_pass'); return; }
  if (authMode === 'register' && password !== $('authPass2').value) {
    errorEl.textContent = t('passwords_no_match');
    return;
  }

  const btn = $('authSubmit');
  btn.disabled = true;
  try {
    me = authMode === 'register'
      ? await sendJSON('/api/auth/register', 'POST', { username, password, photoDataUrl: authPhoto })
      : await sendJSON('/api/auth/login', 'POST', { username, password });
    enterApp();
  } catch (e) {
    errorEl.textContent = e.message;
  } finally {
    btn.disabled = false;
  }
}

$('authSubmit').addEventListener('click', submitAuth);
['authUser', 'authPass', 'authPass2'].forEach(id =>
  $(id).addEventListener('keydown', e => { if (e.key === 'Enter') submitAuth(); }));

// ---------- Navegación / tema / sincronización ----------
function refreshCurrent() {
  if (!me) return Promise.resolve();
  return (currentView === 'gastos' ? loadGastos() : loadPatrimonio()).catch(e => toast(e.message));
}

document.querySelectorAll('.tab').forEach(tab =>
  tab.addEventListener('click', () => {
    currentView = tab.dataset.view;
    document.querySelectorAll('.tab').forEach(t2 => t2.classList.toggle('active', t2 === tab));
    $('view-gastos').classList.toggle('hidden', currentView !== 'gastos');
    $('view-patrimonio').classList.toggle('hidden', currentView !== 'patrimonio');
    refreshCurrent();
  }));

document.querySelectorAll('.pill[data-days]').forEach(pill =>
  pill.addEventListener('click', () => {
    days = +pill.dataset.days;
    document.querySelectorAll('.pill[data-days]').forEach(p => p.classList.toggle('active', p === pill));
    if (me) loadGastos().catch(e => toast(e.message));
  }));

$('fab').addEventListener('click', () =>
  currentView === 'gastos' ? openTxSheet().catch(e => toast(e.message)) : openAccountSheet());

$('verTodoBtn').addEventListener('click', () => openAllTxSheet().catch(e => toast(e.message)));
$('profileBtn').addEventListener('click', openProfileSheet);

const themeBtn = $('themeBtn');
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  themeBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  localStorage.setItem('nomos-theme', theme);
}
themeBtn.addEventListener('click', () => {
  applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark');
  refreshCurrent(); // los gráficos SVG toman los colores del tema
});
applyTheme(localStorage.getItem('nomos-theme') || 'light');
applyStaticI18n();

// Los datos viven en la base de datos: refresca al volver a la pestaña y cada 20 s.
window.addEventListener('focus', () => { if (!sheetCtx && me) refreshCurrent(); });
setInterval(() => { if (!sheetCtx && me) refreshCurrent(); }, 20000);

// ---------- Arranque ----------
// El plan gratuito de Render "duerme" el servidor tras un rato; la primera petición puede
// tardar ~30-60 s en despertarlo. Reintentamos y mostramos un aviso para que no parezca colgado.
(async function boot() {
  const slow = setTimeout(() => { const m = $('bootMsg'); if (m) m.textContent = t('waking_server'); }, 5000);
  let responded = false, user = null;
  for (let i = 0; i < 3 && !responded; i++) {
    try {
      const res = await fetch('/api/auth/me');
      responded = true;                 // hubo respuesta HTTP → dejamos de reintentar
      if (res.ok) user = await res.json();
    } catch {
      await new Promise(r => setTimeout(r, 3000)); // 502/red mientras despierta → reintento
    }
  }
  clearTimeout(slow);
  if (user) { me = user; enterApp(); } else { showAuth(); }
  $('bootLoader')?.classList.add('hidden');
})();
