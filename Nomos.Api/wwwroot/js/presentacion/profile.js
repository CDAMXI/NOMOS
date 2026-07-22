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

        <p class="section-title">${t('section_general')}</p>
        <div class="settings-group">
          <button class="settings-row" id="manageCatsBtn">
            <span class="tx-icon" style="background:${tint('#1b3a8e', .14)}">🏷️</span>
            <span class="settings-label">${t('manage_categories')}</span>
            <span class="acc-chevron">›</span>
          </button>
          <button class="settings-row" id="exportCsvBtn">
            <span class="tx-icon" style="background:${tint('#1b3a8e', .14)}">⬇️</span>
            <span class="settings-label">${t('export_csv')}</span>
            <span class="acc-chevron">›</span>
          </button>
          <label class="settings-row" for="currencySel">
            <span class="tx-icon" style="background:${tint('#1b3a8e', .14)}">💱</span>
            <span class="settings-label">${t('currency_label_setting')}</span>
            <select id="currencySel" class="settings-select">${CURRENCIES.map(c =>
              `<option value="${c[0]}"${c[0] === me.currency ? ' selected' : ''}>${c[0]} — ${esc(c[1])}</option>`).join('')}</select>
          </label>
        </div>

        <p class="section-title">${t('change_password')}</p>
        <div class="settings-group password-group">
          <input id="profCurPass" class="text-field" type="password" placeholder="${t('current_password')}" maxlength="128" autocomplete="current-password">
          <input id="profNewPass" class="text-field" type="password" placeholder="${t('new_password_ph')}" maxlength="128" autocomplete="new-password">
        </div>
        <button id="changePassBtn" class="pill pill-action centered">${t('update_password')}</button>

        <button id="logoutBtn" class="pill pill-action centered prof-logout">${t('logout')}</button>
        <button id="deleteUserBtn" class="pill pill-danger centered prof-logout">${t('delete_user_account')}</button>`;

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

      $('currencySel').addEventListener('change', async e => {
        const prev = me.currency, code = e.target.value;
        try { me = await sendJSON('/api/auth/profile', 'PUT', { currency: code }); }
        catch (err) { e.target.value = prev; toast(err.message); return; }
        applyUserCurrency();
        refreshCurrent();
        toast(t('currency_updated'));
      });

      $('exportCsvBtn').addEventListener('click', async () => {
        try {
          const res = await fetch('/api/transactions/export');
          if (!res.ok) throw new Error(await parseError(res));
          const blob = await res.blob();
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url; a.download = 'pluto-movimientos.xlsx';
          a.rel = 'noopener';
          document.body.appendChild(a); a.click();
          // Revocar tarde y quitar el enlace después: revocar de inmediato cancela la descarga
          // en algunos navegadores (y en la PWA instalada).
          setTimeout(() => { a.remove(); URL.revokeObjectURL(url); }, 4000);
          toast(t('export_done'));
        } catch (e) { toast(e.message); }
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

      // Borrado de la cuenta: doble confirmación (aviso + contraseña); el servidor la verifica.
      $('deleteUserBtn').addEventListener('click', async () => {
        if (!confirm(t('confirm_delete_user'))) return;
        const pw = prompt(t('delete_user_pw'));
        if (pw === null) return;
        try {
          await sendJSON('/api/auth/account/delete', 'POST', { password: pw });
          closeSheet();
          showAuth();
          toast(t('user_deleted'));
        } catch (e) { toast(e.message); }
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
