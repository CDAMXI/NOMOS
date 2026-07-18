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
    manage_categories: 'Gestionar categorías', language: 'Idioma',
    export_csv: 'Exportar movimientos (CSV)',
    change_password: 'Cambiar contraseña', current_password: 'Contraseña actual',
    new_password_ph: 'Nueva contraseña (mín. 8 caracteres)', update_password: 'Actualizar contraseña',
    logout: 'Cerrar sesión', password_updated: 'Contraseña actualizada', profile_updated: 'Perfil actualizado',
    sign_in: 'Iniciar sesión', create_account: 'Crear cuenta', enter: 'Entrar', register: 'Registrarse',
    no_account: '¿No tienes cuenta? Regístrate', have_account: '¿Ya tienes cuenta? Inicia sesión',
    username_ph: 'Nombre de usuario', password_ph: 'Contraseña', repeat_password_ph: 'Repite la contraseña',
    fill_user_pass: 'Rellena usuario y contraseña.', passwords_no_match: 'Las contraseñas no coinciden.',
    choose_photo: 'Elegir foto de perfil', theme_toggle: 'Cambiar tema', add: 'Añadir', edit: 'Editar',
    broker_total: 'Total en el broker', free_margin: 'Margen libre', invested: 'Invertido',
    positions: 'Posiciones', no_positions: 'Sin posiciones todavía. Usa Comprar para registrar la primera.',
    buy: 'Comprar', sell: 'Vender', deposit: 'Depositar', withdraw: 'Retirar',
    buy_title: 'Comprar acciones', sell_title: 'Vender {0}',
    symbol_ph: 'Nombre de la acción (p. ej. AAPL)', num_shares: 'Número de acciones',
    price_per_share: 'Precio por acción (€)', sell_price: 'Precio de venta (€)',
    total_cost: 'Coste total', total_proceeds: 'Total de la venta',
    lot_summary: 'Lote: {0} acciones a {1} · compradas el {2}',
    must_be_positive: 'El precio y la cantidad deben ser mayores que cero.',
    insufficient_margin: 'Margen libre insuficiente ({0} disponibles).',
    sell_too_many: 'No puedes vender más de {0} acciones.',
    buy_saved: 'Compra registrada', sell_saved: 'Venta registrada',
    transfer_title: 'Depositar / Retirar', transfer_done: 'Transferencia realizada',
    cash_account_label: 'Cuenta de efectivo', need_cash_account: 'Necesitas una cuenta de efectivo primero.',
    edit_account: '✏️ Editar cuenta',
    tab_viajes: 'Viajes', trips_toggle: 'Gastos de viaje',
    trips_toggle_hint: 'Muestra la pestaña Viajes. Al apagarlo se oculta, pero tus viajes y gastos se conservan.',
    new_trip: 'Nuevo viaje', edit_trip: 'Editar viaje', trip_name_ph: 'Nombre del viaje (p. ej. Japón 2026)',
    destinations_ph: 'Destino(s) (p. ej. Tokio, Kioto)', destinations_label: 'Destinos',
    currencies_label: 'Monedas y tasa a €', currency_code_ph: 'Moneda (p. ej. JPY)', rate_ph: '1 = … €',
    add_currency: '＋ moneda', trip_saved: 'Viaje guardado', trip_deleted: 'Viaje eliminado',
    delete_trip: 'Eliminar viaje', add_trips_first: 'Añade tu primer viaje con el botón +.',
    trip_total: 'Total del viaje', trip_expenses: 'Gastos del viaje', no_trip_expenses: 'Sin gastos todavía. Añade uno con ＋ Gasto.',
    add_trip_expense: '＋ Gasto', new_trip_expense: 'Nuevo gasto', edit_trip_expense: 'Editar gasto',
    by_currency: 'Por moneda', currency_label: 'Moneda', receipt: 'Factura',
    add_receipt: '📷 Adjuntar factura', change_receipt: '📷 Cambiar factura', remove_receipt: 'Quitar factura',
    view_receipt: '🧾 Ver factura', trip_expense_saved: 'Gasto guardado', trip_expense_deleted: 'Gasto eliminado',
    delete_trip_expense: 'Eliminar gasto', need_currency: 'Añade al menos una moneda.',
    trips_enabled_on: 'Gastos de viaje activados', trips_enabled_off: 'Gastos de viaje desactivados',
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
    manage_categories: 'Manage categories', language: 'Language',
    export_csv: 'Export movements (CSV)',
    change_password: 'Change password', current_password: 'Current password',
    new_password_ph: 'New password (min. 8 characters)', update_password: 'Update password',
    logout: 'Log out', password_updated: 'Password updated', profile_updated: 'Profile updated',
    sign_in: 'Sign in', create_account: 'Create account', enter: 'Enter', register: 'Sign up',
    no_account: "Don't have an account? Sign up", have_account: 'Already have an account? Sign in',
    username_ph: 'Username', password_ph: 'Password', repeat_password_ph: 'Repeat password',
    fill_user_pass: 'Fill in username and password.', passwords_no_match: 'Passwords do not match.',
    choose_photo: 'Choose profile photo', theme_toggle: 'Toggle theme', add: 'Add', edit: 'Edit',
    broker_total: 'Broker total', free_margin: 'Free margin', invested: 'Invested',
    positions: 'Positions', no_positions: 'No positions yet. Use Buy to add the first one.',
    buy: 'Buy', sell: 'Sell', deposit: 'Deposit', withdraw: 'Withdraw',
    buy_title: 'Buy shares', sell_title: 'Sell {0}',
    symbol_ph: 'Stock name (e.g. AAPL)', num_shares: 'Number of shares',
    price_per_share: 'Price per share (€)', sell_price: 'Sell price (€)',
    total_cost: 'Total cost', total_proceeds: 'Sale total',
    lot_summary: 'Lot: {0} shares at {1} · bought on {2}',
    must_be_positive: 'Price and quantity must be greater than zero.',
    insufficient_margin: 'Not enough free margin ({0} available).',
    sell_too_many: 'You cannot sell more than {0} shares.',
    buy_saved: 'Purchase recorded', sell_saved: 'Sale recorded',
    transfer_title: 'Deposit / Withdraw', transfer_done: 'Transfer completed',
    cash_account_label: 'Cash account', need_cash_account: 'You need a cash account first.',
    edit_account: '✏️ Edit account',
    tab_viajes: 'Trips', trips_toggle: 'Travel expenses',
    trips_toggle_hint: 'Shows the Trips tab. Turning it off hides it, but your trips and expenses are kept.',
    new_trip: 'New trip', edit_trip: 'Edit trip', trip_name_ph: 'Trip name (e.g. Japan 2026)',
    destinations_ph: 'Destination(s) (e.g. Tokyo, Kyoto)', destinations_label: 'Destinations',
    currencies_label: 'Currencies and € rate', currency_code_ph: 'Currency (e.g. JPY)', rate_ph: '1 = … €',
    add_currency: '＋ currency', trip_saved: 'Trip saved', trip_deleted: 'Trip deleted',
    delete_trip: 'Delete trip', add_trips_first: 'Add your first trip with the + button.',
    trip_total: 'Trip total', trip_expenses: 'Trip expenses', no_trip_expenses: 'No expenses yet. Add one with ＋ Expense.',
    add_trip_expense: '＋ Expense', new_trip_expense: 'New expense', edit_trip_expense: 'Edit expense',
    by_currency: 'By currency', currency_label: 'Currency', receipt: 'Receipt',
    add_receipt: '📷 Attach receipt', change_receipt: '📷 Change receipt', remove_receipt: 'Remove receipt',
    view_receipt: '🧾 View receipt', trip_expense_saved: 'Expense saved', trip_expense_deleted: 'Expense deleted',
    delete_trip_expense: 'Delete expense', need_currency: 'Add at least one currency.',
    trips_enabled_on: 'Travel expenses enabled', trips_enabled_off: 'Travel expenses disabled',
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

function renderLineChart(el, points, { id, color, xFmt, yFmt, tip, height }) {
  if (!points.length) { el.innerHTML = `<p class="tx-sub">${t('no_data')}</p>`; return; }
  const W = 600, H = height || 230, L = 46, R = 10, T = 12, B = 26;
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
  const hover = tip ? `<line class="lc-cross" x1="0" y1="${T}" x2="0" y2="${T + ih}" stroke="${color}" stroke-width="1" stroke-dasharray="4 3" opacity="0"/>
    <circle class="lc-dot" r="4.5" fill="${color}" stroke="var(--card)" stroke-width="2" opacity="0"/>` : '';
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" role="img">
    <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${color}" stop-opacity=".26"/>
      <stop offset="1" stop-color="${color}" stop-opacity="0"/>
    </linearGradient></defs>
    ${axes}
    <path d="${area}" fill="url(#${id})"/>
    <path d="${line}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round"/>
    ${xy.length === 1 ? `<circle cx="${xy[0][0]}" cy="${xy[0][1]}" r="5.5" fill="${color}" stroke="var(--card)" stroke-width="2"/>` : ''}
    ${hover}
  </svg>${tip ? '<div class="lc-tip"></div>' : ''}`;

  if (tip) bindChartHover(el, points, xy, { W, H, L, iw }, tip);
}

// mientras se explora una gráfica se pausa el refresco automático para no borrar el tooltip.
let chartHovering = false;

// Tooltip on hover (ratón) o al arrastrar el dedo en horizontal: resalta el punto más cercano.
function bindChartHover(el, points, xy, { W, H, L, iw }, tip) {
  const svg = el.querySelector('svg');
  const cross = el.querySelector('.lc-cross');
  const dot = el.querySelector('.lc-dot');
  const tipEl = el.querySelector('.lc-tip');
  const step = points.length > 1 ? iw / (points.length - 1) : 0;

  const show = clientX => {
    const rect = svg.getBoundingClientRect();
    if (!rect.width) return;
    const svgX = (clientX - rect.left) / rect.width * W;
    let idx = step ? Math.round((svgX - L) / step) : 0;
    idx = Math.max(0, Math.min(points.length - 1, idx));
    const [px, py] = xy[idx];
    cross.setAttribute('x1', px); cross.setAttribute('x2', px); cross.setAttribute('opacity', '1');
    dot.setAttribute('cx', px); dot.setAttribute('cy', py); dot.setAttribute('opacity', '1');
    tipEl.innerHTML = tip(points[idx], idx, points);
    const left = Math.max(46, Math.min(rect.width - 46, px * rect.width / W));
    const top = py * rect.height / H;
    const below = top < 50; // si el punto está muy arriba, coloca el tooltip debajo para que no se corte
    tipEl.style.left = left + 'px';
    tipEl.style.top = (below ? top + 16 : top - 10) + 'px';
    tipEl.style.transform = below ? 'translate(-50%, 0)' : 'translate(-50%, -100%)';
    tipEl.classList.add('show');
  };
  const hide = () => { chartHovering = false; cross.setAttribute('opacity', '0'); dot.setAttribute('opacity', '0'); tipEl.classList.remove('show'); };

  svg.addEventListener('mousemove', e => { chartHovering = true; show(e.clientX); });
  svg.addEventListener('mouseleave', hide);

  // Táctil: un toque muestra el punto tocado; arrastrar en horizontal lo desliza; en vertical
  // deja desplazar la página. Tras soltar, el tooltip se oculta solo pasado un momento.
  let tsx = 0, tsy = 0, scrubbed = false, movedFar = false, hideTimer = 0;
  const fadeSoon = () => { clearTimeout(hideTimer); hideTimer = setTimeout(hide, 2500); };
  svg.addEventListener('touchstart', e => {
    tsx = e.touches[0].clientX; tsy = e.touches[0].clientY; scrubbed = false; movedFar = false; clearTimeout(hideTimer);
  }, { passive: true });
  svg.addEventListener('touchmove', e => {
    const tx = e.touches[0].clientX, ty = e.touches[0].clientY;
    if (Math.abs(tx - tsx) > 6 || Math.abs(ty - tsy) > 6) movedFar = true;
    if (!scrubbed && Math.abs(ty - tsy) > Math.abs(tx - tsx)) return; // vertical → dejar hacer scroll
    scrubbed = true; chartHovering = true; show(tx); e.preventDefault();
  }, { passive: false });
  svg.addEventListener('touchend', () => {
    if (!movedFar) { chartHovering = true; show(tsx); } // toque simple → muestra el punto tocado
    fadeSoon();
  });
  svg.addEventListener('touchcancel', hide);
}

function renderDonut(el, items) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (!total) { el.innerHTML = ''; return; }
  const r = 52, C = 2 * Math.PI * r;
  // Flat (butt) caps and touching segments render a clean continuous ring instead of rounded pills.
  let off = 0, segs = '';
  for (const it of items) {
    const len = it.value / total * C;
    segs += `<circle r="${r}" cx="70" cy="70" fill="none" stroke="${it.color}" stroke-width="26"
      stroke-dasharray="${len.toFixed(2)} ${C.toFixed(2)}"
      stroke-dashoffset="${(-off).toFixed(2)}"/>`;
    off += len;
  }
  // Decorativo: los datos ya están en la lista de categorías contigua (accesible).
  el.innerHTML = `<svg viewBox="0 0 140 140" style="transform:rotate(-90deg)" aria-hidden="true">${segs}</svg>`;
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

  const cash = accounts.filter(a => a.type === 'Cash');
  // Hero: balance of ONE cash account at a time (switchable); d.balance is the all-accounts total.
  renderHeroBalance(cash, d.balance);

  let summary = `${monthYearLabel(d.monthDate)} · <span class="sum-out">${t('summary_expenses')} ${eur(d.monthTotal)}</span>`;
  if (d.monthIncome > 0) summary += ` · <span class="sum-in">${t('summary_income')} +${eur(d.monthIncome)}</span>`;
  $('gMonthSummary').innerHTML = summary;

  renderLineChart($('gChart'), d.series.map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-gastos',
    height: 300, // más alta que la de Patrimonio para emparejar la columna con "Recientes"
    color: cssVar('--accent'),
    xFmt: iso => { const dt = localDate(iso); return dt.getDate() + ' ' + shortMonth(dt); },
    yFmt: v => nf0(Math.round(v)),
    // La serie es acumulada: el gasto de ese día es la diferencia con el punto anterior.
    tip: (pt, i, pts) => {
      const daily = i === 0 ? pt.y : pt.y - pts[i - 1].y;
      const dt = localDate(pt.x);
      return `<b>${eur(daily)}</b><div class="d">${dt.getDate()} ${shortMonth(dt)}</div>`;
    }
  });

  renderCategoryCard(d, cash);

  recentCache = d.recent;
  $('gRecent').innerHTML = d.recent.map((tx, i) => txRow(tx, i)).join('')
    || `<li class="tx-sub">${t('no_movements_yet')}</li>`;
  bindTxRows($('gRecent'), recentCache);
}

// "Por categoría": una rueda genérica (todas las cuentas) y una por cada cuenta, con selector.
let catAccountSel;   // 'all' o id de cuenta; se mantiene entre refrescos

function renderCategoryCard(d, cash) {
  const box = $('gCatAccounts');
  const ids = cash.map(a => a.id);
  if (catAccountSel !== 'all' && !ids.includes(catAccountSel)) catAccountSel = 'all';

  const paint = () => {
    const byCat = catAccountSel === 'all'
      ? d.byCategory
      : ((d.byAccount || []).find(a => a.accountId === catAccountSel)?.byCategory || []);
    // Sin gastos: la rueda vacía se oculta y el mensaje se centra en la tarjeta.
    $('gDonut').classList.toggle('hidden', !byCat.length);
    $('gCatList').classList.toggle('empty', !byCat.length);
    renderDonut($('gDonut'), byCat.map(c => ({ color: c.category.color, value: c.total })));
    $('gCatList').innerHTML = byCat.map(c => `
      <li><span class="dot" style="background:${c.category.color}"></span>
        ${esc(catName(c.category.name))}<span class="amount">${eur(c.total)}</span></li>`).join('')
      || `<li class="tx-sub">${t('no_expenses_period')}</li>`;
    box.querySelectorAll('[data-catacc]').forEach(ch =>
      ch.classList.toggle('selected', ch.dataset.catacc === String(catAccountSel)));
  };

  // El selector solo aparece con 2+ cuentas de efectivo (con una, la genérica ya es esa cuenta).
  if (cash.length < 2) { box.classList.add('hidden'); box.innerHTML = ''; catAccountSel = 'all'; paint(); return; }
  box.classList.remove('hidden');
  box.innerHTML = `<button class="chip" data-catacc="all">${t('all_accounts')}</button>`
    + cash.map(a => `<button class="chip" data-catacc="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}</button>`).join('');
  box.querySelectorAll('[data-catacc]').forEach(ch =>
    ch.addEventListener('click', () => { catAccountSel = ch.dataset.catacc === 'all' ? 'all' : +ch.dataset.catacc; paint(); }));
  paint();
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
    xFmt: iso => shortMonth(localDate(iso)),
    yFmt: v => v >= 1000 ? nf0(Math.round(v / 1000)) + 'k' : nf0(Math.round(v)),
    tip: pt => `<b>${eur(pt.y)}</b><div class="d">${shortMonth(localDate(pt.x))}</div>`
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

  // Las cuentas de inversión abren la hoja del broker (posiciones, compra/venta); el resto,
  // la edición clásica de saldo.
  document.querySelectorAll('#nwSections li[data-acc]').forEach(li =>
    li.addEventListener('click', () => {
      const acc = accountsCache.find(x => x.id === +li.dataset.acc);
      if (acc?.type === 'Investment') openBrokerSheet(acc.id).catch(e => toast(e.message));
      else openAccountEditSheet(+li.dataset.acc);
    }));
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

// --- Importe: input numérico nativo (abre el teclado numérico del móvil) ---
let amountSeed = '';   // valor inicial del input; se fija con setAmount antes de abrir la hoja

function amountBlock(label) {
  return `<div class="amount-block">
    <p class="amount-label">${label}</p>
    <div class="amount-display">
      <input id="amountInput" class="amount-input" type="text" inputmode="decimal" enterkeyhint="done"
        autocomplete="off" placeholder="0" aria-label="${label}"
        value="${esc(amountSeed)}" style="width:${Math.max(amountSeed.length, 1)}ch">
      <span class="cur">€</span>
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

// Importe del input principal, redondeado a 2 decimales.
const amountValue = () => {
  const el = $('amountInput');
  const n = parseDecimal((el ? el.value : amountSeed) || '');
  return Math.round(n * 100) / 100;
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

// --- Nuevo movimiento / editar movimiento (gasto o ingreso) ---
async function openTxSheet(existing = null, draft = null) {
  await ensureCategoriesFresh();
  const cashAccounts = (await getJSON('/api/accounts')).filter(a => a.type === 'Cash');
  const isEdit = !!existing;
  // draft, cuando existe, gana sobre los valores originales: así, al volver de crear una
  // categoría en medio de una edición, se recupera lo que el usuario ya había tecleado.
  let kind = existing ? existing.kind : (draft?.kind || 'expense');
  let selectedCat = draft?.categoryId ?? existing?.category?.id ?? categories[0]?.id;
  // Edits keep exactly the account the movement already had (including "none", so a
  // previously-unassigned movement is never silently reattached on save); only brand-new
  // movements default to the first cash account so the user rarely has to pick one.
  let selectedAccount = draft && 'accountId' in draft
    ? draft.accountId
    : (existing ? (existing.accountId ?? null) : (cashAccounts[0]?.id ?? null));
  setAmount(draft && 'amount' in draft ? draft.amount : (existing ? existing.amount : 0));
  const startDesc = draft && 'description' in draft ? draft.description : (existing ? existing.description : '');

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
          <button class="chip chip-add" id="addCatChip">${t('add_category_chip')}</button></div>
        ${(cashAccounts.length >= 1 || !isEdit) ? `<p class="tx-sub cat-hint">${t('account_label')}</p>
        <div class="chips" id="accChips">${cashAccounts.map(a =>
          `<button class="chip" data-acc="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}</button>`).join('')}
          ${isEdit ? '' : `<button class="chip chip-add" id="addAccChip">${t('add_account_chip')}</button>`}</div>` : ''}
        <input id="descField" class="text-field" placeholder="${t('description_optional')}" maxlength="120" value="${esc(startDesc)}">
        <input id="dateField" class="text-field" type="date" value="${(draft && draft.date) ? draft.date : (existing ? existing.date : todayISO())}">
        ${isEdit ? `<button id="deleteTx" class="danger-btn">${t(kind === 'income' ? 'delete_income' : 'delete_expense')}</button>` : ''}`;
      bindAmount(body, true);

      const paintChips = () => {
        $('catChips').classList.toggle('hidden', kind === 'income');
        paintChipGroup(body, 'cat', ch => +ch.dataset.cat === selectedCat, catChipStyle);
      };
      onChipPick(body, 'cat', v => { selectedCat = +v; paintChips(); refreshSaveState(); });

      const addChip = $('addCatChip');
      if (addChip) addChip.addEventListener('click', () => {
        const carry = { kind, amount: amountValue(), description: $('descField').value, date: $('dateField').value, accountId: selectedAccount };
        // Se pasa `existing`: si estabas editando, vuelves al MISMO gasto en edición con la nueva
        // categoría ya seleccionada; si era nuevo, sigue siendo nuevo.
        openCategoryEditSheet(null, saved => openTxSheet(existing, { ...carry, categoryId: saved?.id }).catch(e => toast(e.message)));
      });

      const paintAccChips = () => paintChipGroup(body, 'acc', ch => +ch.dataset.acc === selectedAccount);
      onChipPick(body, 'acc', v => { selectedAccount = +v; paintAccChips(); });
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
      body.innerHTML = `<div class="settings-group cat-manage">${sorted.map(c => `
        <button class="settings-row" data-cat="${c.id}">
          <span class="tx-icon" style="background:${tint(c.color, .16)}">${c.icon}</span>
          <span class="settings-label">${esc(catName(c.name))}</span>
          <span class="acc-chevron">›</span>
        </button>`).join('')}
        <button class="settings-row cat-add-row" id="addCat">
          <span class="tx-icon cat-add-tile">＋</span>
          <span class="settings-label">${t('add_category').replace(/^＋\s*/, '')}</span>
        </button></div>`;
      body.querySelectorAll('button[data-cat]').forEach(b =>
        b.addEventListener('click', () => {
          const c = categories.find(x => x.id === +b.dataset.cat);
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
        <input id="nameField" class="text-field" placeholder="${t('account_name_ph')}" maxlength="80" autofocus>`;
      bindAmount(body, false);
      if (!opts.cashOnly) {
        const paint = () => paintChipGroup(body, 'type', ch => ch.dataset.type === selectedType);
        onChipPick(body, 'type', v => { selectedType = v; paint(); });
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
        <button id="deleteAcc" class="pill pill-danger centered">${t('delete_account')}</button>`;
      bindAmount(body, false);
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

// ---------- Broker (cuenta de inversión) ----------
// Total = margen libre + coste de las posiciones (valoradas a precio de compra). Comprar resta
// del margen; vender ingresa en el margen a precio de venta. Cada compra es un lote independiente
// y se vende tocándolo en la lista.
async function openBrokerSheet(accountId) {
  const b = await getJSON(`/api/brokers/${accountId}`);
  const back = () => openBrokerSheet(accountId).catch(e => toast(e.message));

  openSheet({
    title: b.name,
    build(body) {
      body.innerHTML = `
        <div class="broker-hero">
          <p class="amount-label">${t('broker_total')}</p>
          <div class="big-figure">${eur(b.total)}</div>
          <p class="broker-sub">${t('free_margin')}: <b>${eur(b.margin)}</b> · ${t('invested')}: <b>${eur(b.invested)}</b></p>
        </div>
        <div class="kind-toggle">
          <button id="buyBtn" class="pill active">🛒 ${t('buy')}</button>
          <button id="transferBtn" class="pill">🔁 ${t('deposit')} / ${t('withdraw')}</button>
        </div>
        <p class="muted-label">${t('positions')}</p>
        <ul class="sheet-list tx-list">${b.holdings.map((h, i) => `
          <li class="clickable" data-h="${i}" title="${t('sell')}">
            <span class="tx-icon" style="background:${tint('#0a84ff', .14)}">📈</span>
            <span class="tx-main">
              <span class="tx-title">${esc(h.symbol)}</span>
              <div class="tx-sub">${nfShares(h.shares)} × ${eur(h.buyPrice)} · ${dMed(h.buyDate)}</div>
            </span>
            <span class="tx-amount">${eur(h.cost)}</span>
            <span class="acc-chevron">›</span>
          </li>`).join('') || `<li class="tx-sub">${t('no_positions')}</li>`}
        </ul>
        <div class="divider"></div>
        <button id="editBrokerBtn" class="pill pill-hover centered">${t('edit_account')}</button>`;

      $('buyBtn').addEventListener('click', () => openBuySheet(b, back));
      $('transferBtn').addEventListener('click', () => openBrokerTransferSheet(b, back).catch(e => toast(e.message)));
      $('editBrokerBtn').addEventListener('click', () => openBrokerEditSheet(b, back));
      body.querySelectorAll('li[data-h]').forEach(li =>
        li.addEventListener('click', () => openSellSheet(b, b.holdings[+li.dataset.h], back)));
    }
  });
}

// --- Comprar: nombre, precio y cantidad; el coste no puede superar el margen libre ---
function openBuySheet(b, back) {
  openSheet({
    title: t('buy_title'),
    canSave: () => {
      const sh = decValue($('sharesField')), pr = decValue($('priceField'));
      return !!$('symField')?.value.trim() && sh > 0 && pr > 0 && Math.round(sh * pr * 100) / 100 <= b.margin;
    },
    build(body) {
      body.innerHTML = `
        <input id="symField" class="text-field" placeholder="${t('symbol_ph')}" maxlength="40" autofocus>
        <input id="sharesField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('num_shares')}">
        <input id="priceField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('price_per_share')}">
        <div class="calc-line"><span>${t('total_cost')}</span><b id="buyCost">—</b></div>
        <div class="calc-line"><span>${t('free_margin')}</span><b>${eur(b.margin)}</b></div>
        <p class="field-hint" id="buyHint"></p>`;

      const paint = () => {
        const sh = decValue($('sharesField')), pr = decValue($('priceField'));
        const cost = Math.round(sh * pr * 100) / 100;
        $('buyCost').textContent = sh > 0 && pr > 0 ? eur(cost) : '—';
        $('buyHint').textContent =
          sh < 0 || pr < 0 ? t('must_be_positive')
          : cost > b.margin ? t('insufficient_margin', eur(b.margin))
          : '';
        refreshSaveState();
      };
      ['symField', 'sharesField', 'priceField'].forEach(id => $(id).addEventListener('input', paint));
    },
    async onSave() {
      await sendJSON(`/api/brokers/${b.accountId}/buy`, 'POST', {
        symbol: $('symField').value,
        shares: decValue($('sharesField')),
        price: decValue($('priceField'))
      });
      toast(t('buy_saved'));
    },
    afterSave: back
  });
}

// --- Vender un lote: cantidad ≤ acciones del lote y precio > 0; si no, se indica y se bloquea ---
function openSellSheet(b, h, back) {
  openSheet({
    title: t('sell_title', h.symbol),
    canSave: () => {
      const sh = decValue($('sharesField')), pr = decValue($('priceField'));
      return sh > 0 && sh <= h.shares && pr > 0;
    },
    build(body) {
      body.innerHTML = `
        <p class="tx-sub cat-hint">${t('lot_summary', nfShares(h.shares), eur(h.buyPrice), dMed(h.buyDate))}</p>
        <input id="sharesField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('num_shares')}" autofocus>
        <input id="priceField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('sell_price')}">
        <div class="calc-line"><span>${t('total_proceeds')}</span><b id="sellTotal">—</b></div>
        <p class="field-hint" id="sellHint"></p>`;

      const paint = () => {
        const sh = decValue($('sharesField')), pr = decValue($('priceField'));
        $('sellTotal').textContent = sh > 0 && pr > 0 ? eur(Math.round(sh * pr * 100) / 100) : '—';
        $('sellHint').textContent =
          sh < 0 || pr < 0 ? t('must_be_positive')
          : sh > h.shares ? t('sell_too_many', nfShares(h.shares))
          : '';
        refreshSaveState();
      };
      ['sharesField', 'priceField'].forEach(id => $(id).addEventListener('input', paint));
    },
    async onSave() {
      await sendJSON(`/api/brokers/${b.accountId}/sell`, 'POST', {
        holdingId: h.id,
        shares: decValue($('sharesField')),
        price: decValue($('priceField'))
      });
      toast(t('sell_saved'));
    },
    afterSave: back
  });
}

// --- Depositar/retirar: mueve dinero entre una cuenta de efectivo y el margen libre ---
async function openBrokerTransferSheet(b, back) {
  const cash = (await getJSON('/api/accounts')).filter(a => a.type === 'Cash');
  if (!cash.length) { toast(t('need_cash_account')); return; }
  let direction = 'deposit';
  let cashSel = cash[0].id;
  setAmount(0);

  openSheet({
    title: t('transfer_title'),
    canSave: () => amountValue() > 0,
    build(body) {
      body.innerHTML = `
        <div class="kind-toggle">
          <button class="pill" data-dir="deposit">⬇️ ${t('deposit')}</button>
          <button class="pill" data-dir="withdraw">⬆️ ${t('withdraw')}</button>
        </div>
        ${amountBlock(t('amount'))}
        <p class="tx-sub cat-hint">${t('cash_account_label')}</p>
        <div class="chips">${cash.map(a =>
          `<button class="chip" data-acc="${a.id}">${TYPE_ICON.Cash} ${esc(a.name)}</button>`).join('')}</div>
        <div class="calc-line"><span>${t('free_margin')}</span><b>${eur(b.margin)}</b></div>`;
      bindAmount(body, true);

      const paintDir = () => body.querySelectorAll('[data-dir]').forEach(p =>
        p.classList.toggle('active', p.dataset.dir === direction));
      body.querySelectorAll('[data-dir]').forEach(p =>
        p.addEventListener('click', () => { direction = p.dataset.dir; paintDir(); }));
      paintDir();

      const paintAcc = () => paintChipGroup(body, 'acc', ch => +ch.dataset.acc === cashSel);
      onChipPick(body, 'acc', v => { cashSel = +v; paintAcc(); });
      paintAcc();
    },
    async onSave() {
      await sendJSON(`/api/brokers/${b.accountId}/transfer`, 'POST', {
        cashAccountId: cashSel,
        amount: amountValue(),
        direction
      });
      toast(t('transfer_done'));
    },
    afterSave: back
  });
}

// --- Editar la cuenta broker: renombrar, fijar el margen libre a mano o eliminarla ---
function openBrokerEditSheet(b, back) {
  setAmount(b.margin);

  openSheet({
    title: b.name,
    canSave: () => $('nameField')?.value.trim().length > 0,
    build(body) {
      body.innerHTML = amountBlock(t('free_margin')) + `
        <input id="nameField" class="text-field" maxlength="80" value="${esc(b.name)}">
        <button id="deleteAcc" class="pill pill-danger centered">${t('delete_account')}</button>`;
      bindAmount(body, false);
      $('nameField').addEventListener('input', refreshSaveState);
      $('deleteAcc').addEventListener('click', async () => {
        if (!confirm(t('confirm_delete', b.name))) return;
        try {
          await sendJSON(`/api/accounts/${b.accountId}`, 'DELETE');
          closeSheet();
          await refreshCurrent();
          toast(t('account_deleted'));
        } catch (e) { toast(e.message); }
      });
    },
    async onSave() {
      // Para una cuenta de inversión, el valor introducido es el margen libre (los movimientos
      // no se asignan a brokers, así que el baseline coincide con el margen).
      await sendJSON(`/api/accounts/${b.accountId}`, 'PUT', {
        name: $('nameField').value,
        balance: amountValue()
      });
      toast(t('balance_updated'));
    },
    afterSave: back
  });
}

// ---------- Vista Viajes (gastos de viaje multi-moneda; registro aparte) ----------
let tripsCache = [];

async function loadViajes() {
  const trips = await getJSON('/api/trips');
  tripsCache = trips;
  $('tripsList').innerHTML = trips.length
    ? `<ul class="acc-list">${trips.map(tripRow).join('')}</ul>`
    : `<p class="tx-sub">${t('add_trips_first')}</p>`;
  document.querySelectorAll('#tripsList li[data-trip]').forEach(li =>
    li.addEventListener('click', () => openTripDetailSheet(+li.dataset.trip).catch(e => toast(e.message))));
}

function tripRow(tr) {
  const sub = [tr.destinations, tr.currencies.join(' · ')].filter(Boolean).join(' — ');
  return `<li data-trip="${tr.id}" class="clickable">
    <span class="tx-icon" style="background:${tint('#0a84ff', .14)}">✈️</span>
    <span class="tx-main">
      <span class="tx-title">${esc(tr.name)}</span>
      <div class="tx-sub">${esc(sub || '—')}</div>
    </span>
    <span class="tx-amount">${eur(tr.totalEur)}</span>
    <span class="acc-chevron">›</span>
  </li>`;
}

// --- Crear / editar un viaje: nombre, destinos y monedas con su tasa a € ---
function openTripSheet(existing = null) {
  const isEdit = !!existing;
  // Filas de moneda: {code, rate} como texto (locale). Nueva → una fila vacía.
  let rows = isEdit
    ? existing.currencies.map(c => ({ code: c.code, rate: (Number.isInteger(c.rateToEur) ? String(c.rateToEur) : String(c.rateToEur)).replace('.', decSep()) }))
    : [{ code: '', rate: '' }];

  const readRows = () => [...document.querySelectorAll('#curRows .cur-row')].map(r => ({
    code: r.querySelector('[data-c=code]').value.trim(),
    rate: r.querySelector('[data-c=rate]').value.trim()
  }));

  openSheet({
    title: t(isEdit ? 'edit_trip' : 'new_trip'),
    canSave: () => {
      const name = $('tripName')?.value.trim();
      const rs = readRows();
      return !!name && rs.length > 0 && rs.every(r => r.code && decValue({ value: r.rate }) > 0);
    },
    build(body) {
      const rowHtml = r => `<div class="cur-row">
        <input class="text-field cur-code" data-c="code" placeholder="${t('currency_code_ph')}" maxlength="8" value="${esc(r.code)}">
        <input class="text-field cur-rate" data-c="rate" inputmode="decimal" placeholder="${t('rate_ph')}" value="${esc(r.rate)}">
        <button class="cur-del" data-c="del" title="${t('remove_receipt')}">✕</button>
      </div>`;
      body.innerHTML = `
        <input id="tripName" class="text-field" placeholder="${t('trip_name_ph')}" maxlength="80" value="${isEdit ? esc(existing.name) : ''}" autofocus>
        <input id="tripDest" class="text-field" placeholder="${t('destinations_ph')}" maxlength="200" value="${isEdit ? esc(existing.destinations) : ''}">
        <p class="tx-sub cat-hint">${t('currencies_label')}</p>
        <div id="curRows">${rows.map(rowHtml).join('')}</div>
        <button id="addCur" class="inline-btn">${t('add_currency')}</button>
        ${isEdit ? `<button id="deleteTrip" class="pill pill-danger centered">${t('delete_trip')}</button>` : ''}`;

      const wire = () => {
        body.querySelectorAll('.cur-row [data-c]').forEach(el => el.addEventListener('input', refreshSaveState));
        body.querySelectorAll('.cur-del').forEach(btn => btn.addEventListener('click', () => {
          const kept = readRows();
          const i = [...body.querySelectorAll('.cur-row')].indexOf(btn.closest('.cur-row'));
          kept.splice(i, 1);
          rows = kept.length ? kept : [{ code: '', rate: '' }];
          $('curRows').innerHTML = rows.map(rowHtml).join('');
          wire(); refreshSaveState();
        }));
      };
      wire();

      $('tripName').addEventListener('input', refreshSaveState);
      $('addCur').addEventListener('click', () => {
        rows = [...readRows(), { code: '', rate: '' }];
        $('curRows').innerHTML = rows.map(rowHtml).join('');
        wire(); refreshSaveState();
      });

      if (isEdit) $('deleteTrip').addEventListener('click', async () => {
        if (!confirm(t('confirm_delete', existing.name))) return;
        try {
          await sendJSON(`/api/trips/${existing.id}`, 'DELETE');
          closeSheet();
          await refreshCurrent();
          toast(t('trip_deleted'));
        } catch (e) { toast(e.message); }
      });
    },
    async onSave() {
      const payload = {
        name: $('tripName').value,
        destinations: $('tripDest').value,
        currencies: readRows().map(r => ({ code: r.code, rateToEur: decValue({ value: r.rate }) }))
      };
      if (isEdit) await sendJSON(`/api/trips/${existing.id}`, 'PUT', payload);
      else await sendJSON('/api/trips', 'POST', payload);
      toast(t('trip_saved'));
    }
  });
}

// --- Detalle del viaje: total, resumen por moneda y categoría, y lista de gastos ---
async function openTripDetailSheet(id) {
  const trip = await getJSON(`/api/trips/${id}`);
  const back = () => openTripDetailSheet(id).catch(e => toast(e.message));
  const s = trip.summary;

  openSheet({
    title: trip.name,
    build(body) {
      const byCur = s.byCurrency.filter(c => c.total > 0);
      body.innerHTML = `
        <div class="broker-hero">
          <p class="amount-label">${t('trip_total')}</p>
          <div class="big-figure">${eur(s.totalEur)}</div>
          ${trip.destinations ? `<p class="broker-sub">${esc(trip.destinations)}</p>` : ''}
        </div>
        <div class="kind-toggle">
          <button id="addTripExp" class="pill active">${t('add_trip_expense')}</button>
          <button id="editTripBtn" class="pill pill-hover">✏️ ${t('edit_trip')}</button>
        </div>
        ${byCur.length ? `<p class="muted-label">${t('by_currency')}</p>
        <ul class="cat-list trip-cur-list">${byCur.map(c => `
          <li><span>${esc(c.code)} <span class="tx-sub">(${nfShares(c.total)})</span></span>
            <span class="amount">${eur(c.totalEur)}</span></li>`).join('')}</ul>` : ''}
        ${s.byCategory.length ? `<div class="cat-wrap trip-donut-wrap">
          <div id="tripDonut" class="donut"></div>
          <ul class="cat-list">${s.byCategory.map(c => `
            <li><span class="dot" style="background:${c.category.color}"></span>
              ${esc(catName(c.category.name))}<span class="amount">${eur(c.total)}</span></li>`).join('')}</ul>
        </div>` : ''}
        <p class="muted-label">${t('trip_expenses')}</p>
        <ul class="sheet-list tx-list">${trip.expenses.map((e, i) => tripExpRow(e, i)).join('')
          || `<li class="tx-sub">${t('no_trip_expenses')}</li>`}</ul>`;

      if (s.byCategory.length)
        renderDonut($('tripDonut'), s.byCategory.map(c => ({ color: c.category.color, value: c.total })));

      $('addTripExp').addEventListener('click', () => openTripExpenseSheet(trip, null, back));
      $('editTripBtn').addEventListener('click', () => openTripSheet(trip));
      body.querySelectorAll('li[data-texp]').forEach(li =>
        li.addEventListener('click', () => openTripExpenseSheet(trip, trip.expenses[+li.dataset.texp], back)));
    }
  });
}

function tripExpRow(e, index) {
  const icon = e.category ? e.category.icon : '🧾';
  const bg = tint(e.category ? e.category.color : '#8e8e93', .16);
  let sub = (e.category ? catName(e.category.name) : '') + (e.category ? ' · ' : '') + dMed(e.date);
  if (e.hasReceipt) sub += ' · 🧾';
  return `<li class="clickable" data-texp="${index}" title="${t('edit')}">
    <span class="tx-icon" style="background:${bg}">${icon}</span>
    <span class="tx-main">
      <span class="tx-title">${esc(e.description)}</span>
      <div class="tx-sub">${esc(sub)}</div>
    </span>
    <span class="tx-amount">${nfShares(e.amount)} ${esc(e.currencyCode)}</span>
  </li>`;
}

// --- Crear / editar un gasto del viaje: importe, moneda, categoría, descripción, fecha, factura ---
async function openTripExpenseSheet(trip, existing = null, back = null) {
  await ensureCategoriesFresh();
  const isEdit = !!existing;
  let currency = existing ? existing.currencyCode : (trip.currencies[0]?.code || '');
  let selectedCat = existing?.category?.id ?? categories[0]?.id ?? null;
  // Factura: undefined = sin cambios; null = quitar; string = nueva imagen.
  let receipt = undefined;
  let existingReceiptLoaded = false;
  setAmount(existing ? existing.amount : 0);

  openSheet({
    title: t(isEdit ? 'edit_trip_expense' : 'new_trip_expense'),
    canSave: () => amountValue() > 0 && !!currency,
    build(body) {
      body.innerHTML = `
        ${amountBlock(t('amount'))}
        <p class="tx-sub cat-hint">${t('currency_label')}</p>
        <div class="chips" id="curChips">${trip.currencies.map(c =>
          `<button class="chip" data-cur="${esc(c.code)}">${esc(c.code)}</button>`).join('')}</div>
        <p class="tx-sub cat-hint">${t('category_breakdown')}</p>
        <div class="chips" id="expCatChips">${[...categories].sort((a, b) => catName(a.name).localeCompare(catName(b.name), localeCode())).map(c =>
          `<button class="chip" data-cat="${c.id}">${c.icon} ${esc(catName(c.name))}</button>`).join('')}</div>
        <input id="descField" class="text-field" placeholder="${t('description_optional')}" maxlength="120" value="${existing ? esc(existing.description) : ''}">
        <input id="dateField" class="text-field" type="date" value="${existing ? existing.date : todayISO()}">
        <div class="receipt-box" id="receiptBox"></div>
        <input id="receiptInput" type="file" accept="image/*" hidden>
        ${isEdit ? `<button id="deleteTripExp" class="pill pill-danger centered">${t('delete_trip_expense')}</button>` : ''}`;
      bindAmount(body, true);

      const paintCur = () => paintChipGroup(body, 'cur', ch => ch.dataset.cur === currency);
      onChipPick(body, 'cur', v => { currency = v; paintCur(); refreshSaveState(); });
      paintCur();

      const paintCat = () => paintChipGroup(body, 'cat', ch => +ch.dataset.cat === selectedCat, catChipStyle);
      onChipPick(body, 'cat', v => { selectedCat = selectedCat === +v ? null : +v; paintCat(); });
      paintCat();

      // Zona de factura: preview + botones adjuntar/cambiar/quitar/ver.
      const paintReceipt = async () => {
        const boxEl = $('receiptBox');
        let imgSrc = null;
        if (typeof receipt === 'string') imgSrc = receipt;
        else if (receipt === undefined && isEdit && existing.hasReceipt) {
          if (!existingReceiptLoaded) { // carga perezosa de la imagen guardada
            try { imgSrc = await getJSON(`/api/trips/${trip.id}/expenses/${existing.id}/receipt`); existingReceiptLoaded = imgSrc; }
            catch { imgSrc = null; }
          } else imgSrc = existingReceiptLoaded;
        }
        boxEl.innerHTML = imgSrc
          ? `<img class="receipt-preview" src="${esc(imgSrc)}" alt="${t('receipt')}">
             <div class="receipt-actions"><button id="changeReceipt" class="inline-btn">${t('change_receipt')}</button>
             <button id="removeReceipt" class="inline-btn danger-link">${t('remove_receipt')}</button></div>`
          : `<button id="addReceipt" class="inline-btn">${t('add_receipt')}</button>`;
        const add = $('addReceipt') || $('changeReceipt');
        if (add) add.addEventListener('click', () => $('receiptInput').click());
        if ($('removeReceipt')) $('removeReceipt').addEventListener('click', () => { receipt = null; existingReceiptLoaded = false; paintReceipt(); });
      };
      $('receiptInput').addEventListener('change', async ev => {
        const file = ev.target.files[0];
        if (!file) return;
        try { receipt = await resizeImage(file, 1100); existingReceiptLoaded = false; paintReceipt(); }
        catch { toast(t('photo_error')); }
      });
      paintReceipt();

      if (isEdit) $('deleteTripExp').addEventListener('click', async () => {
        if (!confirm(t('confirm_delete', existing.description))) return;
        try {
          await sendJSON(`/api/trips/${trip.id}/expenses/${existing.id}`, 'DELETE');
          closeSheet();
          await refreshCurrent();
          toast(t('trip_expense_deleted'));
        } catch (e) { toast(e.message); }
      });
    },
    async onSave() {
      const payload = {
        amount: amountValue(),
        currencyCode: currency,
        categoryId: selectedCat,
        description: $('descField').value,
        date: $('dateField').value || todayISO()
      };
      // receipt: undefined = no tocar; null = quitar ("" al servidor); string = nueva.
      if (receipt === null) payload.receiptDataUrl = '';
      else if (typeof receipt === 'string') payload.receiptDataUrl = receipt;
      if (isEdit) await sendJSON(`/api/trips/${trip.id}/expenses/${existing.id}`, 'PUT', payload);
      else await sendJSON(`/api/trips/${trip.id}/expenses`, 'POST', payload);
      toast(t('trip_expense_saved'));
    },
    afterSave: back
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
        <div class="profile-header">
          <label class="avatar-pick filled prof-avatar" for="profPhotoInput" id="profAvatar" title="${t('change_photo')}">${avatarHtml(me)}</label>
          <input id="profPhotoInput" type="file" accept="image/*" hidden>
          <label class="link photo-link" for="profPhotoInput">${t('change_photo')}</label>
          <input id="profUsername" class="profile-name" maxlength="30" value="${esc(me.username)}" aria-label="${t('username')}">
        </div>

        <div class="settings-group">
          <button class="settings-row" id="manageCatsBtn">
            <span class="tx-icon" style="background:${tint('#0a84ff', .14)}">🏷️</span>
            <span class="settings-label">${t('manage_categories')}</span>
            <span class="acc-chevron">›</span>
          </button>
          <button class="settings-row" id="exportCsvBtn">
            <span class="tx-icon" style="background:${tint('#34c759', .16)}">⬇️</span>
            <span class="settings-label">${t('export_csv')}</span>
            <span class="acc-chevron">›</span>
          </button>
        </div>

        <div class="settings-group">
          <label class="settings-row switch-row">
            <span class="tx-icon" style="background:${tint('#0a84ff', .14)}">✈️</span>
            <span class="settings-label">
              <span class="settings-title">${t('trips_toggle')}</span>
              <span class="tx-sub">${t('trips_toggle_hint')}</span>
            </span>
            <span class="switch"><input type="checkbox" id="tripsToggle" ${me.tripsEnabled ? 'checked' : ''}><span class="switch-slider"></span></span>
          </label>
        </div>

        <p class="section-title">${t('change_password')}</p>
        <div class="settings-group password-group">
          <input id="profCurPass" class="text-field" type="password" placeholder="${t('current_password')}" maxlength="128" autocomplete="current-password">
          <input id="profNewPass" class="text-field" type="password" placeholder="${t('new_password_ph')}" maxlength="128" autocomplete="new-password">
        </div>
        <button id="changePassBtn" class="pill pill-hover centered">${t('update_password')}</button>

        <button id="logoutBtn" class="pill pill-danger centered prof-logout">${t('logout')}</button>`;

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

      $('exportCsvBtn').addEventListener('click', async () => {
        try {
          const res = await fetch('/api/transactions/export');
          if (!res.ok) throw new Error(await parseError(res));
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'pluto-movimientos.csv';
          document.body.appendChild(a); a.click(); a.remove();
          URL.revokeObjectURL(url);
        } catch (e) { toast(e.message); }
      });

      // Activar/desactivar "Gastos de viaje" se aplica al momento (los datos no se borran).
      $('tripsToggle').addEventListener('change', async e => {
        const on = e.target.checked;
        // El guardado y la actualización de la pestaña van por separado: un fallo al pintar la
        // pestaña (p. ej. index.html cacheado sin ella) NO debe revertir un guardado correcto.
        try {
          me = await sendJSON('/api/auth/profile', 'PUT', { tripsEnabled: on });
        } catch (err) {
          e.target.checked = !on;
          toast(err.message);
          return;
        }
        applyTripsTab();
        toast(t(on ? 'trips_enabled_on' : 'trips_enabled_off'));
      });

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
  applyTripsTab();
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
  const load = currentView === 'gastos' ? loadGastos
    : currentView === 'patrimonio' ? loadPatrimonio
    : loadViajes;
  return load().catch(e => toast(e.message));
}

document.querySelectorAll('.tab').forEach(tab =>
  tab.addEventListener('click', () => {
    currentView = tab.dataset.view;
    document.querySelectorAll('.tab').forEach(t2 => {
      const active = t2 === tab;
      t2.classList.toggle('active', active);
      t2.setAttribute('aria-current', active ? 'page' : 'false');
    });
    $('view-gastos').classList.toggle('hidden', currentView !== 'gastos');
    $('view-patrimonio').classList.toggle('hidden', currentView !== 'patrimonio');
    $('view-viajes').classList.toggle('hidden', currentView !== 'viajes');
    refreshCurrent();
  }));

// La pestaña Viajes solo existe si el usuario la activó en el perfil. Al apagarla, si estabas
// en esa vista, vuelve a Gastos (los datos siguen en el servidor, solo se ocultan).
function applyTripsTab() {
  // Tolerante a un index.html cacheado antiguo: si la pestaña aún no existe en el DOM, no rompas.
  const tab = $('tabViajes');
  if (tab) tab.classList.toggle('hidden', !me?.tripsEnabled);
  if (!me?.tripsEnabled && currentView === 'viajes')
    document.querySelector('.tab[data-view="gastos"]')?.click();
}

document.querySelectorAll('.pill[data-days]').forEach(pill =>
  pill.addEventListener('click', () => {
    days = +pill.dataset.days;
    document.querySelectorAll('.pill[data-days]').forEach(p => p.classList.toggle('active', p === pill));
    if (me) loadGastos().catch(e => toast(e.message));
  }));

$('fab').addEventListener('click', () => {
  if (currentView === 'gastos') openTxSheet().catch(e => toast(e.message));
  else if (currentView === 'patrimonio') openAccountSheet();
  else openTripSheet();
});

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
window.addEventListener('focus', () => { if (!sheetCtx && me && !chartHovering) refreshCurrent(); });
setInterval(() => { if (!sheetCtx && me && !chartHovering) refreshCurrent(); }, 20000);

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

// PWA: service worker network-first — recoge despliegues al instante y abre offline con lo último.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
