// PLUTO front-end · estado compartido y avatares
'use strict';


// ---------- Estado ----------
let me = null;             // usuario autenticado {id, username, photoDataUrl}
let currentView = 'gastos';
let days = 30;
let nwRange = 30;          // ventana de la gráfica de Patrimonio: 30, 90 o 'year' (snapshots mensuales)
let categories = [];
let recentCache = [];
let accountsCache = [];
let heroAccountSel;        // qué saldo muestra el hero de Gastos: id de cuenta, 'all', o undefined (→ 1.ª cuenta)

async function ensureCategoriesFresh() {
  categories = await getJSON('/api/categories');
  return categories;
}

// ---------- Avatares ----------
function avatarHtml(user) {
  return user.photoDataUrl
    ? `<img src="${esc(user.photoDataUrl)}" alt="">`
    : `<span class="avatar-initial">${esc(user.username.charAt(0).toUpperCase())}</span>`;
}

function renderTopAvatar() {
  const btn = $('profileBtn');
  btn.innerHTML = avatarHtml(me);
  btn.classList.remove('hidden');
}

/** Recorta al centro y reduce la imagen a un cuadrado pequeño en data URL. */
function resizeImage(file, size = 256) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = size;
        const s = Math.min(img.width, img.height);
        canvas.getContext('2d').drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', .85));
      } catch (e) { reject(e); }
      finally { URL.revokeObjectURL(img.src); }
    };
    img.onerror = () => { URL.revokeObjectURL(img.src); reject(new Error(t('photo_error'))); };
    img.src = URL.createObjectURL(file);
  });
}
