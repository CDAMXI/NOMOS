// PLUTO front-end · vistas Gastos y Patrimonio
'use strict';


// ---------- Vista Gastos ----------
async function loadGastos() {
  const [d, accounts] = await Promise.all([
    getJSON(`/api/expenses/dashboard?days=${days}`),
    getJSON('/api/accounts')
  ]);

  const cash = accounts.filter(a => a.type === 'Cash');
  // Hero: balance of ONE cash account at a time (switchable); d.balance is the all-accounts total.
  renderHeroBalance(cash, d.balance);

  // El resumen habla del MES NATURAL (el día 1 muestra solo lo de hoy: el mes arranca);
  // la gráfica y la rueda siguen la ventana de sus pastillas.
  let summary = `${monthYearLabel(todayISO())} · <span class="sum-out">${t('summary_expenses')} ${eur(d.monthTotal)}</span>`;
  if (d.monthIncome > 0) summary += ` · <span class="sum-in">${t('summary_income')} +${eur(d.monthIncome)}</span>`;
  $('gMonthSummary').innerHTML = summary;

  renderLineChart($('gChart'), d.series.map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-gastos',
    height: 300, // más alta que la de Patrimonio para emparejar la columna con "Recientes"
    // var(--accent) directo (los atributos SVG lo resuelven en vivo): cambiar de tema
    // repinta la gráfica por CSS, sin volver a pedir los datos.
    color: 'var(--accent)',
    label: t('evolution'),
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
  renderRecent();
  bindTxRows($('gRecent'), recentCache);
}

// Recientes: 8 de base y, en el layout de dos columnas, se rellena fila a fila hasta igualar la
// altura natural de la columna izquierda (que crece con la rueda de categorías). En móvil
// (apilado, breakpoint de .grid) se queda en 8. Se reajusta en cada carga/auto-refresco.
const RECENT_BASE = 8;
function renderRecent() {
  const ul = $('gRecent');
  ul.innerHTML = recentCache.slice(0, RECENT_BASE).map((tx, i) => txRow(tx, i)).join('')
    || `<li class="tx-sub">${t('no_movements_yet')}</li>`;
  if (recentCache.length <= RECENT_BASE) return;
  if (window.matchMedia('(max-width: 820px)').matches) return; // espejo del breakpoint de .grid

  const catCard = document.querySelector('#view-gastos .col:first-child .card:last-child');
  const recentCard = ul.closest('.card');
  if (!catCard || !recentCard) return;
  const leftBottom = catCard.getBoundingClientRect().bottom;
  // La tarjeta de Recientes también se estira hasta esa línea (CSS), así que el tope de filas se
  // mide sobre la LISTA (una tarjeta estirada siempre coincidiría) más su padding inferior.
  const padBottom = parseFloat(getComputedStyle(recentCard).paddingBottom) || 0;
  if (leftBottom > 0) {
    for (let i = RECENT_BASE; i < recentCache.length; i++) {
      ul.insertAdjacentHTML('beforeend', txRow(recentCache[i], i));
      if (ul.getBoundingClientRect().bottom + padBottom > leftBottom) { ul.lastElementChild.remove(); break; }
    }
  }
}

// ---------- Selector de cuenta (fila de chips) ----------
// Lo comparten el saldo del hero y la tarjeta «Por categoría». Solo aparece con 2+ cuentas de
// efectivo: con una sola, la vista genérica YA es esa cuenta. Devuelve la selección vigente,
// reparándola si apuntaba a una cuenta que ya no existe.
function renderAccountPicker(box, attr, cash, selected, onPick) {
  const sigueExistiendo = selected === 'all' || cash.some(a => a.id === selected);
  if (cash.length < 2) {
    box.classList.add('hidden');
    box.innerHTML = '';
    return 'all';
  }
  box.classList.remove('hidden');
  box.innerHTML = `<button class="chip" data-${attr}="all">${t('all_accounts')}</button>`
    + cash.map(a => cashChip(a, attr, cash)).join('');
  box.querySelectorAll(`[data-${attr}]`).forEach(ch =>
    ch.addEventListener('click', () => onPick(ch.dataset[attr] === 'all' ? 'all' : +ch.dataset[attr])));
  return sigueExistiendo ? selected : 'all';
}

// Marca el chip activo (y lo anuncia a los lectores de pantalla).
function paintAccountPicker(box, attr, selected) {
  box.querySelectorAll(`[data-${attr}]`).forEach(ch => {
    const activo = ch.dataset[attr] === String(selected);
    ch.classList.toggle('selected', activo);
    ch.setAttribute('aria-pressed', activo ? 'true' : 'false');
  });
}

// "Por categoría": una rueda genérica (todas las cuentas) y una por cada cuenta, con selector.
let catAccountSel;   // 'all' o id de cuenta; se mantiene entre refrescos
let donutSel = null; // categoría seleccionada tocando la rueda; se mantiene entre refrescos

function renderCategoryCard(d, cash) {
  const box = $('gCatAccounts');

  const paint = () => {
    const byCat = catAccountSel === 'all'
      ? d.byCategory
      : ((d.byAccount || []).find(a => a.accountId === catAccountSel)?.byCategory || []);
    // Sin gastos: la rueda vacía se oculta y el mensaje se centra en la tarjeta.
    $('gDonut').classList.toggle('hidden', !byCat.length);
    $('gCatList').classList.toggle('empty', !byCat.length);
    renderDonut($('gDonut'),
      byCat.map(c => ({ id: c.category.id, name: catName(c.category.name), color: c.category.color, value: c.total })),
      { selected: donutSel, onSelect: id => { donutSel = id; } });
    $('gCatList').innerHTML = byCat.map(c => `
      <li><span class="dot" style="background:${c.category.color}"></span>
        ${esc(catName(c.category.name))}<span class="amount">${eur(c.total)}</span></li>`).join('')
      || `<li class="tx-sub">${t('no_expenses_period')}</li>`;
    paintAccountPicker(box, 'catacc', catAccountSel);
  };

  catAccountSel = renderAccountPicker(box, 'catacc', cash, catAccountSel,
    sel => { catAccountSel = sel; paint(); });
  paint();
}

// Saldo del hero: el de UNA cuenta de efectivo a la vez, con el selector de chips. 'all' (el
// aterrizaje por defecto) muestra el total; la selección sobrevive al auto-refresco.
function renderHeroBalance(cash, total) {
  const box = $('gBalanceAccounts');

  const paint = () => {
    const bal = heroAccountSel === 'all'
      ? total
      : (cash.find(a => a.id === heroAccountSel)?.balance ?? total);
    const el = $('gBalance');
    el.textContent = eur(bal);
    // Cifras de 7+ dígitos desbordan el hero a --fs-44: se compacta la fuente, no el dato.
    el.style.fontSize = el.textContent.length > 12 ? 'var(--fs-30)' : '';
    el.classList.toggle('red', bal < 0);
    paintAccountPicker(box, 'bal', heroAccountSel);
  };

  heroAccountSel = renderAccountPicker(box, 'bal', cash, heroAccountSel,
    sel => { heroAccountSel = sel; paint(); });
  paint();
}

function txRow(tx, index) {
  const isIncome = tx.kind === 'income';
  const icon = isIncome ? '💶' : tx.category.icon;
  const bg = isIncome ? incomeColor() : tx.category.color; // azulejo de color solido
  let sub = (isIncome ? t('income_word') : catName(tx.category.name)) + ' · ' + dMed(tx.date);
  if (tx.accountName) sub += ' · ' + tx.accountName;
  const amount = isIncome
    ? `<span class="tx-amount green">+${eur(tx.amount)}</span>`
    : `<span class="tx-amount">−${eur(tx.amount)}</span>`;
  // tabindex+role: fila operable por teclado (Enter/Espacio via el listener global de main.js).
  return `<li class="clickable" data-i="${index}" tabindex="0" role="button" title="${t('edit')}">
    ${iconTile(icon, bg)}
    <span class="tx-main">
      <span class="tx-title">${esc(tx.description)}</span>
      <div class="tx-sub">${esc(sub)}</div>
    </span>
    ${amount}
    <span class="acc-chevron">›</span>
  </li>`;
}

function bindTxRows(listEl, cache, back = null) {
  listEl.querySelectorAll('li[data-i]').forEach(li =>
    li.addEventListener('click', () => openTxSheet(cache[+li.dataset.i], null, back)));
}

// ---------- Vista Patrimonio ----------
const TYPE_ICON = { Cash: '🏦', Investment: '📈', Other: '📦', Liability: '💳' };
const TYPE_KEY = { Cash: 'section_cash', Investment: 'section_investment', Other: 'section_other', Liability: 'section_liability' };

async function loadPatrimonio() {
  const d = await getJSON('/api/networth');
  accountsCache = d.accounts;

  const nwEl = $('nwTotal');
  nwEl.textContent = eur(d.net);
  nwEl.style.fontSize = nwEl.textContent.length > 12 ? 'var(--fs-30)' : '';
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

  // 30d/90d: serie diaria reconstruida (endpoint aparte); Año: los snapshots mensuales de d.series.
  const daily = nwRange === 'year' ? null : await getJSON(`/api/networth/series?days=${nwRange}`);
  const dayLabel = iso => { const dt = localDate(iso); return dt.getDate() + ' ' + shortMonth(dt); };
  renderLineChart($('nwChart'), (daily ?? d.series).map(p => ({ x: p.date, y: p.value })), {
    id: 'grad-nw',
    color: 'var(--accent)',
    label: t('evolution'),
    xFmt: daily ? dayLabel : iso => shortMonth(localDate(iso)),
    yFmt: v => v >= 1000 ? nf0(Math.round(v / 1000)) + 'k' : nf0(Math.round(v)),
    tip: pt => `<b>${eur(pt.y)}</b><div class="d">${daily ? dayLabel(pt.x) : shortMonth(localDate(pt.x))}</div>`
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
      if (acc?.type === 'Investment') openBrokerSheet(acc.id).catch(sheetFail);
      else openAccountEditSheet(+li.dataset.acc);
    }));
}

function accRow(a) {
  const isLiab = a.type === 'Liability';
  // Icono en tinte de ACENTO: verde/rojo son colores de dato (la cifra), no decoración.
  return `<li data-acc="${a.id}" class="clickable" tabindex="0" role="button">
    ${iconTile(TYPE_ICON[a.type])}
    <span class="tx-main">
      <span class="tx-title">${esc(a.name)}</span>
      <div class="tx-sub">${t('updated_prefix')} ${dMed(a.updatedAt)}</div>
    </span>
    <span class="tx-amount ${isLiab ? 'red' : ''}">${eurShort(a.balance)}</span>
    <span class="acc-chevron">›</span>
  </li>`;
}
