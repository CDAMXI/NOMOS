// PLUTO front-end · autenticación
'use strict';


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
