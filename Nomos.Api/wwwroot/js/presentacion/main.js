// PLUTO front-end · navegación, tema, sincronización y arranque
'use strict';


// ---------- Navegación / tema / sincronización ----------
// Primera pintura de cada vista: spinner mientras llega la red; fallo = estado de error
// PERSISTENTE con Reintentar (un toast se esfuma y dejaba la vista en blanco sin salida).
// Con datos ya pintados, un fallo de refresco solo avisa (y nunca en bucle estando offline).
const viewLoaded = {};
function refreshCurrent() {
  if (!me) return Promise.resolve();
  const view = currentView;
  const load = view === 'gastos' ? loadGastos : loadPatrimonio;
  const loader = $('viewLoader');
  if (!viewLoaded[view]) {
    loader.classList.remove('hidden');
    loader.innerHTML = '<span class="boot-spinner"></span>';
  }
  return load().then(() => {
    viewLoaded[view] = true;
    if (view === currentView) loader.classList.add('hidden');
  }).catch(e => {
    if (viewLoaded[view]) { toast(e.message); return; }
    loader.classList.remove('hidden');
    loader.innerHTML = `<p class="tx-sub">${esc(e.message)}</p>
      <button id="retryBtn" class="pill pill-action">${t('retry')}</button>`;
    $('retryBtn').addEventListener('click', refreshCurrent);
  });
}

// El «+» cambia de acción según la pestaña: su etiqueta accesible debe decirlo.
function updateFabTitle() {
  const label = t(currentView === 'gastos' ? 'add_movement' : 'add_account_fab');
  const fab = $('fab');
  fab.title = label;
  fab.setAttribute('aria-label', label);
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
    updateFabTitle();
    refreshCurrent();
  }));

document.querySelectorAll('.pill[data-days]').forEach(pill =>
  pill.addEventListener('click', () => {
    days = +pill.dataset.days;
    paintActive(document, 'days', pill.dataset.days);
    if (me) loadGastos().catch(e => toast(e.message));
  }));

// Pills de la gráfica de Patrimonio (tolerante a un index.html cacheado sin ellas).
document.querySelectorAll('.pill[data-nw]').forEach(pill =>
  pill.addEventListener('click', () => {
    nwRange = pill.dataset.nw === 'year' ? 'year' : +pill.dataset.nw;
    paintActive(document, 'nw', pill.dataset.nw);
    if (me) loadPatrimonio().catch(e => toast(e.message));
  }));

$('fab').addEventListener('click', () => {
  if (currentView === 'gastos') openTxSheet().catch(sheetFail);
  else openAccountSheet();
});

$('verTodoBtn').addEventListener('click', () => openAllTxSheet().catch(sheetFail));
$('profileBtn').addEventListener('click', openProfileSheet);

// El tema se cambia desde el interruptor del Perfil; aquí solo se aplica y persiste.
// Los gráficos usan var(--accent)/var(--line) en el propio SVG: repintan por CSS al instante.
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('nomos-theme', theme);
}
applyTheme(localStorage.getItem('nomos-theme') || 'light');
updateFabTitle();

// Los datos viven en la base de datos: refresca al volver a la pestaña y cada 20 s.
// Sin red no se intenta: evita el bucle de toasts de error cada 20 s estando offline.
const AUTO_REFRESH_MS = 20000;
const canAutoRefresh = () => !sheetCtx && me && !chartHovering && navigator.onLine;
window.addEventListener('focus', () => { if (canAutoRefresh()) refreshCurrent(); });
setInterval(() => { if (canAutoRefresh()) refreshCurrent(); }, AUTO_REFRESH_MS);

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
  // Offline con sesión desconocida: mejor decirlo y esperar a la red que enseñar el login.
  if (!responded && !navigator.onLine) {
    const m = $('bootMsg');
    if (m) m.textContent = t('offline_msg');
    window.addEventListener('online', () => location.reload(), { once: true });
    return;
  }
  if (user) { me = user; enterApp(); } else { showAuth(); }
  $('bootLoader')?.classList.add('hidden');
})();

// PWA: service worker network-first — recoge despliegues al instante y abre offline con lo último.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
