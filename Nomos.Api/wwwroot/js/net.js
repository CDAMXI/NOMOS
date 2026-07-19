// PLUTO front-end · red — getJSON/sendJSON, parseError, toast
'use strict';


// ---------- Red ----------
async function parseError(res) {
  let msg = await res.text();
  try { msg = JSON.parse(msg); } catch { /* plain text */ }
  return typeof msg === 'string' && msg ? msg : t('error_generic');
}

async function getJSON(url) {
  const res = await fetch(url);
  if (res.status === 401) { showAuth(); throw new Error(t('login_required')); }
  if (!res.ok) throw new Error(await parseError(res));
  return res.json();
}

async function sendJSON(url, method, body) {
  const res = await fetch(url, {
    method,
    headers: body !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined
  });
  if (!res.ok) {
    const msg = await parseError(res);
    if (res.status === 401 && !url.includes('/auth/login')) showAuth();
    throw new Error(msg);
  }
  return res.status === 204 ? null : res.json();
}

let toastTimer;
function toast(msg) {
  const el = $('toast');
  el.textContent = msg;
  el.classList.remove('hidden');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.add('hidden'), 2600);
}
