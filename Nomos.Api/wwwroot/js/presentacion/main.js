// PLUTO front-end · navegación, tema, sincronización y arranque
'use strict';


// ---------- Navegación / tema / sincronización ----------
function refreshCurrent() {
  if (!me) return Promise.resolve();
  const load = currentView === 'gastos' ? loadGastos : loadPatrimonio;
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
    refreshCurrent();
  }));

document.querySelectorAll('.pill[data-days]').forEach(pill =>
  pill.addEventListener('click', () => {
    days = +pill.dataset.days;
    document.querySelectorAll('.pill[data-days]').forEach(p => p.classList.toggle('active', p === pill));
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
  if (currentView === 'gastos') openTxSheet().catch(e => toast(e.message));
  else openAccountSheet();
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
const AUTO_REFRESH_MS = 20000;
const canAutoRefresh = () => !sheetCtx && me && !chartHovering;
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
  if (user) { me = user; enterApp(); } else { showAuth(); }
  $('bootLoader')?.classList.add('hidden');
})();

// PWA: service worker network-first — recoge despliegues al instante y abre offline con lo último.
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('/sw.js').catch(() => {}));
}
