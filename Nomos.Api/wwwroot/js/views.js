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
