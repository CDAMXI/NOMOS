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
          <label class="settings-row" for="themeSwitch">
            ${iconTile('🌙')}
            <span class="settings-label">${t('dark_mode')}</span>
            <input id="themeSwitch" type="checkbox" class="switch"${document.documentElement.dataset.theme === 'dark' ? ' checked' : ''}>
          </label>
          <button class="settings-row" id="manageCatsBtn">
            ${iconTile('🏷️')}
            <span class="settings-label">${t('manage_categories')}</span>
            <span class="acc-chevron">›</span>
          </button>
          <button class="settings-row" id="exportCsvBtn">
            ${iconTile('📄')}
            <span class="settings-label">${t('export_csv')}</span>
          </button>
          <label class="settings-row" for="currencySel">
            ${iconTile('💱')}
            <span class="settings-label">${t('currency_label_setting')}</span>
            <select id="currencySel" class="settings-select">${CURRENCIES.map(c =>
              `<option value="${c[0]}"${c[0] === me.currency ? ' selected' : ''}>${c[0]} — ${esc(c[1])}</option>`).join('')}</select>
          </label>
        </div>

        <p class="section-title">${t('change_password')}</p>
        <div class="settings-group password-group">
          <input id="profCurPass" class="text-field" type="password" placeholder="${t('current_password')}" maxlength="128" autocomplete="current-password">
          <input id="profNewPass" class="text-field" type="password" placeholder="${t('new_password_ph')}" maxlength="128" autocomplete="new-password">
          <button id="changePassBtn" class="settings-row accent">
            <span class="settings-label">${t('update_password')}</span>
          </button>
        </div>

        <div class="settings-group prof-logout">
          <button id="logoutBtn" class="settings-row accent">
            ${iconTile('🚪')}
            <span class="settings-label">${t('logout')}</span>
          </button>
        </div>
        <button id="deleteUserBtn" class="pill pill-danger centered prof-logout">${t('delete_user_account')}</button>
        <div id="dangerZone" class="danger-zone hidden">
          <p class="danger-text">${t('confirm_delete_user')}</p>
          <input id="deleteUserPass" class="text-field" type="password" placeholder="${t('current_password')}" maxlength="128" autocomplete="current-password">
          <p id="deleteUserErr" class="field-hint"></p>
          <button id="confirmDeleteUser" class="pill pill-danger centered" disabled>${t('confirm_delete_user_btn')}</button>
        </div>`;

      $('profUsername').addEventListener('input', refreshSaveState);

      $('profPhotoInput').addEventListener('change', async e => {
        const file = e.target.files[0];
        if (!file) return;
        try {
          newPhoto = await resizeImage(file);
          $('profAvatar').innerHTML = `<img src="${newPhoto}" alt="">`;
        } catch { toast(t('photo_error')); }
      });

      $('themeSwitch').addEventListener('change', e => applyTheme(e.target.checked ? 'dark' : 'light'));

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

      // Borrado de la cuenta: zona de peligro dentro de la hoja (aviso + contraseña
      // ENMASCARADA), sin confirm()/prompt() nativos. El servidor verifica la contraseña.
      const dangerZone = $('dangerZone'), delPass = $('deleteUserPass'),
        delErr = $('deleteUserErr'), delConfirm = $('confirmDeleteUser');
      $('deleteUserBtn').addEventListener('click', () => {
        const shown = !dangerZone.classList.toggle('hidden');
        if (shown) delPass.focus();
      });
      delPass.addEventListener('input', () => {
        delConfirm.disabled = !delPass.value;
        delErr.textContent = '';
      });
      delConfirm.addEventListener('click', async () => {
        delConfirm.disabled = true;
        try {
          await sendJSON('/api/auth/account/delete', 'POST', { password: delPass.value });
          closeSheet();
          showAuth();
          toast(t('user_deleted'));
        } catch (e) {
          delErr.textContent = e.message; // contraseña incorrecta, etc.: motivo a la vista
          delConfirm.disabled = false;
        }
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
