// PLUTO front-end · perfil
'use strict';


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
          a.rel = 'noopener';
          document.body.appendChild(a); a.click();
          // Revocar tarde y quitar el enlace después: revocar de inmediato cancela la descarga
          // en algunos navegadores (y en la PWA instalada).
          setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
          toast(t('export_done'));
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
