/* Akeem Store — admin data recovery layer.
   Keeps the existing dashboard intact but prevents optional Firestore
   collections (categories/brands/logs/settings) from making the entire
   dashboard appear empty when only products are readable.
*/
import { auth, db } from './firebase.js';
import { collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

(function(){
  'use strict';
  if(window.__akeemAdminDataRecovery)return;
  window.__akeemAdminDataRecovery=true;

  const $=id=>document.getElementById(id);
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const price=v=>{const n=Number(String(v??'').replace(/[^0-9.]/g,''));return n?`₦${n.toLocaleString('en-NG')}`:'—'};
  const isVideo=u=>/\.mp4|\.webm|\.mov|\/video\/upload\//i.test(u||'');

  async function loadProducts(){
    const snap=await getDocs(collection(db,'products'));
    const products=[];snap.forEach(d=>products.push({id:d.id,...d.data()}));
    products.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));
    return products;
  }

  function renderProducts(products){
    const list=$('list');
    if(!list)return;
    if(!products.length){
      list.innerHTML='<div class="empty-state"><h3>No products found</h3><p>The products collection is reachable, but it currently contains no listings.</p></div>';
    }else{
      list.innerHTML=products.map(p=>{
        const u=(p.imageUrls||[])[0];
        return `<div class="product-row">
          <div class="p-thumb-wrap">${u?(isVideo(u)?`<video src="${esc(u)}" class="p-thumb" muted></video>`:`<img src="${esc(u)}" class="p-thumb" alt="${esc(p.name||'Product')}">`):'<div class="p-thumb" style="display:grid;place-items:center;color:#98a2b3;font-size:9px">No image</div>'}</div>
          <div class="p-info"><div class="p-name">${esc(p.name||'Untitled product')}</div><div class="p-meta"><span>${esc(p.sku||'—')}</span>${p.category?`<span>· ${esc(p.category)}</span>`:''}${p.brand?`<span>· ${esc(p.brand)}</span>`:''}</div><div class="p-badges"><span class="badge badge-published">${esc(p.status||'published')}</span></div></div>
          <div class="p-price"><span class="cur">${price(p.price)}</span></div>
          <div class="p-stock"><b>${Number(p.stockQuantity??1)}</b>in stock</div>
        </div>`;
      }).join('');
    }
    if($('navProductCount'))$('navProductCount').textContent=String(products.length);
    const all=$('cnt-all');if(all)all.textContent=String(products.length);
  }

  function renderBasicStats(products){
    const grid=$('statGrid');if(!grid)return;
    const published=products.filter(p=>!p.sold&&(p.status||'published')==='published').length;
    const sold=products.filter(p=>p.sold).length;
    const categories=new Set(products.map(p=>p.category).filter(Boolean)).size;
    grid.innerHTML=[['Total Products',products.length],['Published',published],['Sold',sold],['Categories Used',categories]].map(x=>`<div class="card stat-card"><div class="stat-num">${x[1]}</div><div class="stat-label">${x[0]}</div></div>`).join('');
  }

  async function renderVisitorSummary(){
    try{
      if(!auth.currentUser)return;
      const snap=await getDocs(query(collection(db,'pendingProductSubmissions'),where('status','==','pending')));
      const count=snap.size;
      let btn=$('publicSubmissionsButton');
      if(btn){const badge=btn.querySelector('span');if(badge)badge.textContent=String(count);return;}
      // admin-public-submissions.js normally creates the full review UI; this
      // fallback only gives the owner a visible pending count if that module
      // failed to initialize.
      btn=document.createElement('div');btn.id='adminRecoveryPending';
      btn.style.cssText='position:fixed;right:22px;bottom:22px;z-index:1200;padding:12px 15px;border-radius:12px;background:#764ba2;color:#fff;font:700 13px Montserrat,sans-serif;box-shadow:0 10px 28px rgba(30,20,70,.25)';
      btn.textContent=`Visitor submissions pending: ${count}`;document.body.appendChild(btn);
    }catch(e){console.warn('Visitor submission recovery unavailable:',e.message)}
  }

  async function recover(){
    // Let the normal dashboard win when it successfully populated products.
    const list=$('list');
    const looksEmpty=!list||!list.querySelector('.product-row');
    if(!looksEmpty){await renderVisitorSummary();return}
    try{
      if(!auth.currentUser){console.warn('Admin recovery: no authenticated user.');return}
      const products=await loadProducts();
      renderProducts(products);renderBasicStats(products);await renderVisitorSummary();
    }catch(e){
      console.error('Admin data recovery failed:',e);
      const listEl=$('list');
      if(listEl)listEl.innerHTML=`<div class="empty-state"><h3>Unable to load products</h3><p>${esc(e.message)}</p><p style="margin-top:8px;font-size:11px">Check that the admin account is authenticated and Firestore allows this account to read the products collection.</p></div>`;
    }
  }

  function start(){setTimeout(recover,6000);setTimeout(recover,12000)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
