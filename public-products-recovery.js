/* Akeem Store — public product recovery layer.
   Keeps the existing storefront intact and only takes over when the normal
   public product renderer leaves #products empty. */
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
    const candidates = [p.imageUrls, p.images, p.imageURL, p.imageUrl, p.image];
    for (const value of candidates) {
      if (Array.isArray(value)) return value.filter(Boolean).map(String);
      if (typeof value === 'string' && value.trim()) return [value.trim()];
    }
    return [];
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
            : `<img src="${esc(first)}" class="product-img" alt="${esc(p.name || 'Product')}" loading="lazy">`)
          )
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
        if (image) image.src = images[0] || 'https://via.placeholder.com/600x400?text=No+Image';
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

  async function load() {
    const container = document.getElementById('products');
    if (!container || container.querySelector('.product')) return;

    try {
      const [{ initializeApp }, { getAuth, signInAnonymously }, firestore] = await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${FIREBASE_VERSION}/firebase-firestore.js`)
      ]);

      const app = initializeApp(config, 'publicProductsRecovery');
      const auth = getAuth(app);
      const { collection, getDocs } = firestore;
      let snap;

      try {
        snap = await getDocs(collection(app ? firestore.getFirestore(app) : null, 'products'));
      } catch (firstError) {
        if (firstError?.code !== 'permission-denied') throw firstError;
        await signInAnonymously(auth);
        snap = await getDocs(collection(firestore.getFirestore(app), 'products'));
      }

      const products = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (products.length) render(products);
    } catch (error) {
      console.warn('Public product recovery unavailable:', error);
    }
  }

  function schedule() {
    [1500, 3000, 5000].forEach(ms => setTimeout(() => {
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
