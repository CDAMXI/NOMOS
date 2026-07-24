// PLUTO front-end · hojas: movimientos, categorías, cuentas y broker
'use strict';


// Categorías ordenadas por uso reciente (recentCache), luego alfabético. Las más usadas primero
// para tocar menos al añadir un gasto. Solo presentación: no toca lógica de negocio ni el modelo.
// Orden alfabetico de categorias por su nombre traducido (segun el idioma activo).
const byCatName = (a, b) => catName(a.name).localeCompare(catName(b.name), localeCode());

// Lee cantidad y precio de las hojas comprar/vender (sin redondear; conserva signo).
const readSharesPrice = () => ({ sh: decValue($('sharesField')), pr: decValue($('priceField')) });

function categoriesByUse() {
  const freq = new Map();
  for (const tx of recentCache)
    if (tx.kind !== 'income' && tx.category) freq.set(tx.category.id, (freq.get(tx.category.id) || 0) + 1);
  return [...categories].sort((a, b) =>
    (freq.get(b.id) || 0) - (freq.get(a.id) || 0)
    || byCatName(a, b));
}

// --- Nuevo movimiento / editar movimiento (gasto o ingreso) ---
async function openTxSheet(existing = null, draft = null, back = null) {
  await ensureCategoriesFresh();
  const cashAccounts = (await getJSON('/api/accounts')).filter(a => a.type === 'Cash');
  const isEdit = !!existing;
  // draft, cuando existe, gana sobre los valores originales: así, al volver de crear una
  // categoría en medio de una edición, se recupera lo que el usuario ya había tecleado.
  let kind = existing ? existing.kind : (draft?.kind || 'expense');
  let selectedCat = draft?.categoryId ?? existing?.category?.id ?? categoriesByUse()[0]?.id;
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
    back, // si se abrió desde "Ver todo", Cancelar/Guardar vuelven allí
    build(body) {
      body.innerHTML = `
        ${isEdit ? '' : `<div class="kind-toggle">
          <button class="pill" data-kind="expense">${t('kind_expense')}</button>
          <button class="pill" data-kind="income">${t('kind_income')}</button>
        </div>
        <button id="scanBtn" class="link centered scan-btn">${t('scan_receipt')}</button>
        <input id="scanInput" type="file" accept="image/*" hidden>`}
        ${amountBlock(t('amount'))}
        <div class="chips" id="catChips"></div>
        ${(cashAccounts.length >= 1 || !isEdit) ? `<p class="tx-sub cat-hint">${t('account_label')}</p>
        <div class="chips" id="accChips">${cashAccounts.map(a => cashChip(a, 'acc')).join('')}
          ${isEdit ? '' : `<button class="chip chip-add" id="addAccChip">${t('add_account_chip')}</button>`}</div>` : ''}
        <input id="descField" class="text-field" placeholder="${t('description_optional')}" maxlength="120" value="${esc(startDesc)}">
        <input id="dateField" class="text-field" type="date" value="${(draft && draft.date) ? draft.date : (existing ? existing.date : todayISO())}">
        ${isEdit ? `<button id="deleteTx" class="danger-btn">${t(kind === 'income' ? 'delete_income' : 'delete_expense')}</button>` : ''}`;
      bindAmount(body, true);

      // Escanear factura: la IA pre-rellena; el usuario revisa y guarda (nunca autoguardado).
      const scanBtn = $('scanBtn');
      if (scanBtn) {
        scanBtn.addEventListener('click', () => $('scanInput').click());
        $('scanInput').addEventListener('change', async ev => {
          const file = ev.target.files[0];
          if (!file) return;
          ev.target.value = ''; // permite volver a escanear el mismo fichero
          scanBtn.disabled = true;
          scanBtn.textContent = t('scanning');
          try {
            const photo = await resizeImage(file, 1100);
            const r = await sendJSON('/api/expenses/scan', 'POST', { photoDataUrl: photo });
            if (r.amount != null) {
              const amountEl = $('amountInput');
              amountEl.value = String(r.amount).replace('.', decSep());
              // El ancho del input y el estado de Guardar se recalculan en el evento 'input';
              // al rellenar por código hay que dispararlo a mano o el importe se ve recortado.
              amountEl.dispatchEvent(new Event('input'));
            }
            if (r.date) $('dateField').value = r.date;
            if (r.description) $('descField').value = r.description;
            if (r.categoryId != null) selectedCat = r.categoryId;
            renderCatChips(); // re-render: la categoría elegida se muestra aunque no esté en el top
            refreshSaveState();
            toast(t(r.confidence > 0 ? 'scan_done' : 'scan_failed'));
          } catch (e) { toast(e.message); }
          scanBtn.disabled = false;
          scanBtn.textContent = t('scan_receipt');
        });
      }

      const paintChips = () => {
        $('catChips').classList.toggle('hidden', kind === 'income');
        $('scanBtn')?.classList.toggle('hidden', kind === 'income'); // escanear = solo gastos
        paintChipGroup(body, 'cat', ch => +ch.dataset.cat === selectedCat, catChipStyle);
      };

      const addCategory = () => {
        const carry = { kind, amount: amountValue(), description: $('descField').value, date: $('dateField').value, accountId: selectedAccount };
        // Se pasa `existing`: si estabas editando, vuelves al MISMO gasto en edición con la nueva
        // categoría ya seleccionada; si era nuevo, sigue siendo nuevo.
        openCategoryEditSheet(null, saved => openTxSheet(existing, { ...carry, categoryId: saved?.id }).catch(e => toast(e.message)));
      };

      // Revelado progresivo: las 6 más usadas + «⋯ N más» expande el resto. La seleccionada se
      // muestra siempre aunque no esté en el top (p. ej. la elige el escáner o venía del draft).
      const CAT_PREVIEW = 6;
      let catsExpanded = false;
      const renderCatChips = () => {
        const all = categoriesByUse();
        let shown = catsExpanded ? all : all.slice(0, CAT_PREVIEW);
        if (selectedCat && !shown.some(c => c.id === selectedCat)) {
          const sel = all.find(c => c.id === selectedCat);
          if (sel) shown = [...shown, sel];
        }
        const hiddenCount = all.length - shown.length;
        $('catChips').innerHTML = shown.map(catChip).join('')
          + (hiddenCount > 0 ? `<button class="chip" id="moreCatsChip">⋯ ${hiddenCount} ${t('more_chip')}</button>` : '')
          + `<button class="chip chip-add" id="addCatChip">${t('add_category_chip')}</button>`;
        onChipPick($('catChips'), 'cat', v => { selectedCat = +v; paintChips(); refreshSaveState(); });
        $('moreCatsChip')?.addEventListener('click', () => { catsExpanded = true; renderCatChips(); });
        $('addCatChip').addEventListener('click', addCategory);
        paintChips();
      };
      renderCatChips();

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
        paintActive(body, 'kind', kind);
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
      bindTxRows(body, items, () => openAllTxSheet()); // editar un movimiento vuelve a "Ver todo"
    }
  });
}

// --- Gestión de categorías ---
async function openCategoriesSheet() {
  await ensureCategoriesFresh();
  openSheet({
    title: t('categories'),
    back: () => openProfileSheet(), // se llega desde el Perfil
    build(body) {
      const sorted = [...categories].sort(byCatName);
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
    back: onDone ? () => onDone() : undefined, // vuelve a la hoja de origen (lista o gasto)
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
    back: onDone ? () => onDone() : undefined, // vuelve al movimiento si se llegó desde el chip "＋ cuenta"
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
      bindDelete('deleteAcc', { name: acc.name, url: `/api/accounts/${acc.id}`, doneToast: 'account_deleted' });
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
            <span class="tx-icon" style="background:${tint('#1b3a8e', .14)}">📈</span>
            <span class="tx-main">
              <span class="tx-title">${esc(h.symbol)}</span>
              <div class="tx-sub">${nfShares(h.shares)} × ${eur(h.buyPrice)} · ${dMed(h.buyDate)}</div>
            </span>
            <span class="tx-amount">${eur(h.cost)}</span>
            <span class="acc-chevron">›</span>
          </li>`).join('') || `<li class="tx-sub">${t('no_positions')}</li>`}
        </ul>
        <div class="divider"></div>
        <button id="editBrokerBtn" class="pill pill-action centered">${t('edit_account')}</button>`;

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
      const { sh, pr } = readSharesPrice();
      return !!$('symField')?.value.trim() && sh > 0 && pr > 0 && round2(sh * pr) <= b.margin;
    },
    build(body) {
      body.innerHTML = `
        <input id="symField" class="text-field" placeholder="${t('symbol_ph')}" maxlength="40" autofocus>
        <input id="sharesField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('num_shares')}">
        <input id="priceField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('price_per_share', curSymbol)}">
        <div class="calc-line"><span>${t('total_cost')}</span><b id="buyCost">—</b></div>
        <div class="calc-line"><span>${t('free_margin')}</span><b>${eur(b.margin)}</b></div>
        <p class="field-hint" id="buyHint"></p>`;

      const paint = () => {
        const { sh, pr } = readSharesPrice();
        const cost = round2(sh * pr);
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
    back, afterSave: back
  });
}

// --- Vender un lote: cantidad ≤ acciones del lote y precio > 0; si no, se indica y se bloquea ---
function openSellSheet(b, h, back) {
  openSheet({
    title: t('sell_title', h.symbol),
    canSave: () => {
      const { sh, pr } = readSharesPrice();
      return sh > 0 && sh <= h.shares && pr > 0;
    },
    build(body) {
      body.innerHTML = `
        <p class="tx-sub cat-hint">${t('lot_summary', nfShares(h.shares), eur(h.buyPrice), dMed(h.buyDate))}</p>
        <input id="sharesField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('num_shares')}" autofocus>
        <input id="priceField" class="text-field" inputmode="decimal" autocomplete="off" placeholder="${t('sell_price', curSymbol)}">
        <div class="calc-line"><span>${t('total_proceeds')}</span><b id="sellTotal">—</b></div>
        <p class="field-hint" id="sellHint"></p>`;

      const paint = () => {
        const { sh, pr } = readSharesPrice();
        $('sellTotal').textContent = sh > 0 && pr > 0 ? eur(round2(sh * pr)) : '—';
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
    back, afterSave: back
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
        <div class="chips">${cash.map(a => cashChip(a, 'acc')).join('')}</div>
        <div class="calc-line"><span>${t('free_margin')}</span><b>${eur(b.margin)}</b></div>`;
      bindAmount(body, true);

      const paintDir = () => paintActive(body, 'dir', direction);
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
    back, afterSave: back
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
      bindDelete('deleteAcc', { name: b.name, url: `/api/accounts/${b.accountId}`, doneToast: 'account_deleted' });
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
    back, afterSave: back
  });
}
