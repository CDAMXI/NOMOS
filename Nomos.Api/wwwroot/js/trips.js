// PLUTO front-end · vista Viajes
'use strict';


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
    <span class="tx-icon" style="background:${tint('#1b3a8e', .14)}">✈️</span>
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
        <input class="text-field cur-rate" data-c="rate" inputmode="decimal" placeholder="${t('rate_ph', curSymbol)}" value="${esc(r.rate)}">
        <button class="cur-del" data-c="del" title="${t('remove_receipt')}">✕</button>
      </div>`;
      body.innerHTML = `
        <input id="tripName" class="text-field" placeholder="${t('trip_name_ph')}" maxlength="80" value="${isEdit ? esc(existing.name) : ''}" autofocus>
        <input id="tripDest" class="text-field" placeholder="${t('destinations_ph')}" maxlength="200" value="${isEdit ? esc(existing.destinations) : ''}">
        <p class="tx-sub cat-hint">${t('currencies_label', curSymbol)}</p>
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
    back, afterSave: back
  });
}
