/* Akeem Store — public product recovery layer.
   Reliable fallback for the public storefront when the normal renderer
   leaves #products empty. Uses the same Firebase app/config as the site. */
(function () {
  'use strict';
  if (window.__akeemPublicProductsRecovery) return;
  window.__akeemPublicProductsRecovery = true;

  const FIREBASE_VERSION = '10.12.2';
  const config = {
    apiKey: 'AIzaSyDhwIAmuZrY5Xqo6Ql7LDKxrPiklpG5GTE',
    authDomain: 'shangrila-booking.firebaseapp.com',
    projectId: 'shangrila-booking',
    storageBucket: 'shangrila-booking.firebasestorage.app',
    messagingSenderId: '981170210173',
    appId: '1:981170210173:web:4d74cb3f6109fe1c0a3814',
    measurementId: 'G-ZYB3J8BW72'
  };

  const esc = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;'
  }[c]));

  const normalizeImages = (p) => {
    const values = [p.imageUrls, p.images, p.imageURL, p.imageUrl, p.image, p.photos];
    const result = [];
    const add = value => {
      if (Array.isArray(value)) value.forEach(add);
      else if (value && typeof value === 'object') add(value.url || value.src || value.downloadURL || value.downloadUrl);
      else if (typeof value === 'string' && value.trim()) result.push(value.trim());
    };
    values.forEach(add);
    return [...new Set(result)];
  };

  const money = (v) => {
    const n = Number(String(v ?? '').replace(/[^0-9.-]/g, ''));
    return Number.isFinite(n) && n > 0 ? `₦${n.toLocaleString('en-NG')}` : 'Price on request';
  };

  function render(products) {
    const container = document.getElementById('products');
    if (!container || !products.length) return false;

    container.innerHTML = products.map(p => {
      const id = p.id;
      const images = normalizeImages(p);
      const first = images[0] || '';
      const sold = p.sold === true || String(p.status || '').toLowerCase() === 'sold';
      const media = first
        ? (/\.(mp4|webm|mov)(\?|$)/i.test(first)
            ? `<video src="${esc(first)}" class="product-img" muted controls preload="metadata"></video>`
            : `<img src="${esc(first)}" class="product-img" alt="${esc(p.name || p.title || 'Product')}" loading="lazy" onerror="this.style.display='none'">`)
        : '<div style="height:100%;display:grid;place-items:center;color:#64748b">No image</div>';

      return `<article class="product${sold ? ' sold' : ''}" data-product-id="${esc(id)}">
        <div class="image-container">${media}${images.length > 1 ? `<div class="image-counter">${images.length} images</div>` : ''}</div>
        <div class="product-info">
          <div class="title">${esc(p.name || p.title || 'Unnamed Product')}</div>
          <span class="category-label">${esc(p.category || p.type || 'Other')}</span>
          <div class="price">${money(p.price)}</div>
          <div class="desc">${esc(p.description || p.shortDescription || '')}</div>
          <button class="order-btn" type="button" data-recovery-details="${esc(id)}">👁 View Details</button>
          ${sold
            ? '<button class="order-btn" type="button" disabled style="background:#999;margin-top:6px">Sold Out</button>'
            : `<a href="https://wa.me/2347034447700?text=${encodeURIComponent(`Hello, I'm interested in: ${p.name || 'this product'} - ${money(p.price)}`)}" target="_blank" rel="noopener noreferrer" class="order-btn" style="margin-top:6px">💬 Order Now</a>`}
        </div>
      </article>`;
    }).join('');

    container.querySelectorAll('[data-recovery-details]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = products.find(x => x.id === btn.dataset.recoveryDetails);
        if (!p) return;
        const images = normalizeImages(p);
        const modal = document.getElementById('detailsModal');
        if (!modal) return;
        const image = document.getElementById('detailsImage');
        if (image) image.src = images[0] || '';
        const name = document.getElementById('detailsName');
        if (name) name.textContent = p.name || p.title || 'Product';
        const category = document.getElementById('detailsCategory');
        if (category) category.innerHTML = `<span class="category-label">${esc(p.category || p.type || 'Other')}</span>`;
        const price = document.getElementById('detailsPrice');
        if (price) price.textContent = money(p.price);
        const description = document.getElementById('detailsDescription');
        if (description) description.textContent = p.description || p.shortDescription || 'Contact Akeem Store for more information.';
        const order = document.getElementById('detailsOrder');
        if (order) order.href = `https://wa.me/2347034447700?text=${encodeURIComponent(`Hello, I'm interested in: ${p.name || 'this product'} - ${money(p.price)}`)}`;
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden';
      });
    });

    const count = document.getElementById('resultsCount');
    if (count) count.textContent = `Showing ${products.length} products`;
    const stat = document.getElementById('totalProductsStat');
    if (stat) stat.textContent = products.length;
    return true;
  }

  async function loadProducts() {
    const { db } = await import('./firebase.js?v=20260831-2');
    const firestore = await import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`);
    const snap = await firestore.getDocs(firestore.collection(db, 'products'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  async function load() {
    const container = document.getElementById('products');
    if (!container || container.querySelector('.product')) return;

    try {
      const products = await loadProducts();
      if (products.length) {
        render(products);
        return;
      }
      container.innerHTML = '<div class="no-results"><div class="no-results-icon">📦</div><h3>No products are currently published</h3><p>The storefront can reach the product database, but it returned no listings.</p></div>';
    } catch (error) {
      console.warn('Primary public product load failed:', error);

      // If Firestore rules require a signed-in public session, retry anonymously.
      try {
        const [{ initializeApp, getApps }, { getAuth, signInAnonymously }, firestore] = await Promise.all([
          import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
          import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
          import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`)
        ]);
        const app = getApps().find(a => a.name === 'publicProductsRecovery') || initializeApp(config, 'publicProductsRecovery');
        const auth = getAuth(app);
        await signInAnonymously(auth);
        const db = firestore.getFirestore(app);
        const snap = await firestore.getDocs(firestore.collection(db, 'products'));
        const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        if (products.length) render(products);
        else container.innerHTML = '<div class="no-results"><div class="no-results-icon">📦</div><h3>No products are currently published</h3><p>The storefront can reach the product database, but it returned no listings.</p></div>';
      } catch (retryError) {
        console.error('Public product recovery failed:', retryError);
        const message = document.createElement('div');
        message.className = 'no-results';
        message.innerHTML = '<div class="no-results-icon">⚠️</div><h3>Products could not be loaded</h3><p>Please refresh the page or contact the store.</p>';
        if (container && !container.querySelector('.product')) container.replaceChildren(message);
      }
    }
  }

  function schedule() {
    [500, 1500, 3000, 5000, 8000].forEach(ms => setTimeout(() => {
      const container = document.getElementById('products');
      if (container && !container.querySelector('.product')) load();
    }, ms));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', schedule, { once: true });
  } else {
    schedule();
  }
})();
