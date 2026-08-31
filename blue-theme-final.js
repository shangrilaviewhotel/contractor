/* Akeem Store — final visual layer + single public product recovery path. */
(function(){
  'use strict';
  const BLUE='#5B6F8F', BLUE_DARK='#465B79', BLUE_LIGHT='#71839E', PALE='#E7ECF2', PALE2='#F2F5F8';

  function replaceGreenText(css){
    if(!css) return css;
    return css
      .replace(/#00a86b/gi,BLUE).replace(/#008f5b/gi,BLUE_DARK).replace(/#007a4d/gi,BLUE_DARK)
      .replace(/#006b4a/gi,'#344B68').replace(/#063b2c/gi,'#26384F').replace(/#005f42/gi,'#30445F')
      .replace(/#059669/gi,BLUE).replace(/#10B981/gi,BLUE_LIGHT).replace(/#047857/gi,BLUE_DARK)
      .replace(/#F0FDF4/gi,PALE2).replace(/#064E3B/gi,'#344B68').replace(/#A7F3D0/gi,'#B8C3D0')
      .replace(/rgba\(0,168,107,/gi,'rgba(91,111,143,').replace(/rgba\(0,143,91,/gi,'rgba(70,91,121,')
      .replace(/rgba\(5,150,105,/gi,'rgba(91,111,143,').replace(/rgba\(16,185,129,/gi,'rgba(113,131,158,')
      .replace(/rgba\(0,95,66,/gi,'rgba(48,68,95,').replace(/#e8f8f1/gi,PALE).replace(/#b7e8d4/gi,'#B8C3D0');
  }
  function rewriteStyleTags(){
    document.querySelectorAll('style').forEach(style=>{
      if(style.id==='akeem-final-blue-overrides') return;
      const before=style.textContent||'', after=replaceGreenText(before);
      if(after!==before) style.textContent=after;
    });
  }
  function installStyleInterceptor(){
    if(window.__akeemBlueStyleInterceptor) return;
    window.__akeemBlueStyleInterceptor=true;
    const originalAppendChild=Node.prototype.appendChild;
    Node.prototype.appendChild=function(node){
      if(node && node.tagName==='STYLE' && node.id!=='akeem-final-blue-overrides'){
        try{node.textContent=replaceGreenText(node.textContent||'')}catch(_){ }
      }
      return originalAppendChild.call(this,node);
    };
  }
  function addFinalOverrides(){
    if(document.getElementById('akeem-final-blue-overrides')) return;
    const s=document.createElement('style'); s.id='akeem-final-blue-overrides';
    s.textContent=`
      :root{--primary:${BLUE}!important;--primary-light:${BLUE_LIGHT}!important;--primary-dark:${BLUE_DARK}!important;--success:${BLUE_LIGHT}!important;--light:${PALE2}!important;--card-fg:#344B68!important;--border:#B8C3D0!important;--jiji-green:${BLUE}!important;--jiji-green-dark:${BLUE_DARK}!important}
      nav{border-bottom-color:rgba(91,111,143,.24)!important}
      .nav-title,.page-header h1{background:linear-gradient(135deg,#71839E 0%,#5B6F8F 50%,#8797AC 100%)!important;-webkit-background-clip:text!important;background-clip:text!important;-webkit-text-fill-color:transparent!important;color:transparent!important}
      .hamburger{background:linear-gradient(135deg,#536985,#71839E)!important;box-shadow:0 5px 20px rgba(91,111,143,.16)!important}.mobile-menu{border-left-color:${BLUE}!important}.menu-item:hover{background:linear-gradient(135deg,#536985,#71839E)!important;color:#fff!important}
      .jiji-nav-search button,.order-btn{background:linear-gradient(135deg,#536985,#71839E)!important;color:#fff!important;border-color:#536985!important}.jiji-nav-search button:hover,.order-btn:hover{background:${BLUE_DARK}!important}
      .jiji-sell{background:linear-gradient(135deg,#536985,#71839E)!important;color:#fff!important;border-color:#536985!important}.jiji-sell:hover{background:${BLUE_DARK}!important}
      .jiji-hero-card{background:linear-gradient(115deg,#26384F 0%,#465B79 58%,#5B6F8F 100%)!important;box-shadow:0 14px 34px rgba(91,111,143,.12)!important}.jiji-hero-search button{background:linear-gradient(135deg,#536985,#71839E)!important;color:#fff!important}.jiji-hero-search button:hover{background:${BLUE_DARK}!important}
      .activity-header,.stat-value,.as-section-kicker,.as-section-title,.as-price,.as-category,.as-accent,.price{color:${BLUE}!important}.activity-item{border-left-color:${BLUE}!important}
      .search-box:focus,.sort-select:focus{border-color:${BLUE}!important;box-shadow:0 0 0 3px rgba(91,111,143,.09)!important}.search-box,.sort-select{border-color:rgba(91,111,143,.28)!important}
      .category-btn:hover,.category-btn.active{background:linear-gradient(135deg,#536985,#71839E)!important;color:#fff!important;border-color:#536985!important;box-shadow:0 4px 12px rgba(91,111,143,.10)!important}.category-label{background:${PALE}!important;color:${BLUE_DARK}!important}
      .as-btn-primary,.as-chip.active,.as-filter.active,.as-fav-filter.active{background:linear-gradient(135deg,#536985,#71839E)!important;border-color:#536985!important;color:#fff!important}.as-view-all:hover{background:${BLUE}!important;color:#fff!important}
      .product:hover{border-color:${BLUE_LIGHT}!important;box-shadow:0 16px 40px rgba(91,111,143,.10)!important}.product{border-color:rgba(91,111,143,.14)!important}
      .bg-emerald-50{background:${PALE2}!important}.bg-emerald-100{background:${PALE}!important}.bg-emerald-500,.bg-emerald-600,.bg-emerald-700{background:${BLUE}!important}
      .text-emerald-500,.text-emerald-600,.text-emerald-700,.text-emerald-800{color:${BLUE}!important}.border-emerald-200,.border-emerald-300,.border-emerald-400,.border-emerald-500,.border-emerald-600{border-color:#B8C3D0!important}
    `;
    document.head.appendChild(s);
  }
  function forceInlineStyles(){
    document.querySelectorAll('[style]').forEach(el=>{const before=el.getAttribute('style')||'',after=replaceGreenText(before);if(after!==before)el.setAttribute('style',after)});
  }
  function forceSellerLink(){document.querySelectorAll('.jiji-sell').forEach(el=>{el.href='sell.html';el.removeAttribute('target')});}

  async function recoverPublicProducts(){
    const container=document.getElementById('products');
    if(!container || container.querySelector('.product') || window.__akeemPublicProductsLoaded) return;
    window.__akeemPublicProductsLoaded=true;
    const version='10.12.2';
    const config={
      apiKey:'AIzaSyDhwIAmuZrY5Xqo6Ql7LDKxrPiklpG5GTE',
      authDomain:'shangrila-booking.firebaseapp.com',
      projectId:'shangrila-booking',
      storageBucket:'shangrila-booking.firebasestorage.app',
      messagingSenderId:'981170210173',
      appId:'1:981170210173:web:4d74cb3f6109fe1c0a3814',
      measurementId:'G-ZYB3J8BW72'
    };
    try{
      const [{initializeApp},{getAuth,signInAnonymously},{getFirestore,collection,getDocs}]=await Promise.all([
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-app.js`),
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-auth.js`),
        import(`https://www.gstatic.com/firebasejs/${version}/firebase-firestore.js`)
      ]);
      const app=initializeApp(config,`publicStoreRecovery-${Date.now()}`);
      const auth=getAuth(app);
      let db=getFirestore(app);
      let snap;
      try{
        snap=await getDocs(collection(db,'products'));
      }catch(firstError){
        await signInAnonymously(auth);
        snap=await getDocs(collection(db,'products'));
      }
      const products=snap.docs.map(d=>({id:d.id,...d.data()}));
      if(!products.length){
        window.__akeemPublicProductsLoaded=false;
        return;
      }
      const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
      const images=p=>{
        const vals=[p.imageUrls,p.images,p.imageURL,p.imageUrl,p.image,p.photos], out=[];
        const add=v=>{if(Array.isArray(v))v.forEach(add);else if(v&&typeof v==='object')add(v.url||v.src||v.downloadURL||v.downloadUrl);else if(typeof v==='string'&&v.trim())out.push(v.trim())};
        vals.forEach(add);return [...new Set(out)];
      };
      container.innerHTML=products.map(p=>{
        const media=images(p), first=media[0]||'', price=Number(String(p.price??'').replace(/[^0-9.-]/g,''))||0;
        const name=p.name||p.title||p.productName||'Product';
        const category=p.category||p.type||'Other';
        const sold=p.sold===true||String(p.status||'').toLowerCase()==='sold';
        const visual=first
          ? (/\.(mp4|webm|mov)(\?|$)/i.test(first)?`<video src="${esc(first)}" class="product-img" muted controls preload="metadata"></video>`:`<img src="${esc(first)}" class="product-img" alt="${esc(name)}" loading="lazy">`)
          : '<div style="height:100%;display:grid;place-items:center;color:#64748b">No image</div>';
        return `<article class="product${sold?' sold':''}" data-product-id="${esc(p.id)}"><div class="image-container">${visual}</div><div class="product-info"><div class="title">${esc(name)}</div><span class="category-label">${esc(category)}</span><div class="price">₦${price.toLocaleString('en-NG')}</div><div class="desc">${esc(p.description||p.shortDescription||'')}</div>${sold?'<button class="order-btn" type="button" disabled style="background:#999">Sold Out</button>':`<a href="https://wa.me/2347034447700?text=${encodeURIComponent(`Hello, I'm interested in: ${name} - ₦${price.toLocaleString('en-NG')}`)}" target="_blank" rel="noopener noreferrer" class="order-btn">💬 Order Now</a>`}</div></article>`;
      }).join('');
      const count=document.getElementById('resultsCount');if(count)count.textContent=`Showing ${products.length} products`;
      const stat=document.getElementById('totalProductsStat');if(stat)stat.textContent=products.length;
    }catch(error){
      console.error('Public product recovery failed:',error);
      window.__akeemPublicProductsLoaded=false;
    }
  }

  function run(){
    installStyleInterceptor();rewriteStyleTags();addFinalOverrides();forceInlineStyles();forceSellerLink();document.documentElement.classList.add('akeem-blue-final');
    if(document.getElementById('products')) setTimeout(recoverPublicProducts,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  [300,800,1500,3000,5000].forEach(ms=>setTimeout(run,ms));
  const observer=new MutationObserver(()=>{forceSellerLink();forceInlineStyles();});
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','href']});
  setTimeout(()=>observer.disconnect(),8000);
})();
