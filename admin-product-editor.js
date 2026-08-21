/* Akeem Store — additive admin product editor.
   Uses the existing products collection and existing Firebase auth/db.
   Backward compatible: only fields explicitly changed by the admin are updated. */
(async function(){
  'use strict';
  if(!/admindashboard\.html$/i.test(location.pathname)) return;
  if(window.__akeemProductEditorLoaded) return;
  window.__akeemProductEditorLoaded=true;

  const {auth,db}=await import('./firebase.js');
  const {collection,getDocs,doc,updateDoc,serverTimestamp}=await import('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js');

  const ADMIN_UID='oNTRbdjXWAcklCBY5I1arXISOct2';
  const CATEGORIES=['Cars & Vehicles','Tractors','Houses & Apartments','Land & Plots','Hotels & Accommodation','Generators & Power','Ships & Marine','Heavy Equipment','Other Products'];

  const css=document.createElement('style');
  css.textContent=`
    #akeemEditorLauncher{position:fixed;right:24px;bottom:24px;z-index:1200;background:linear-gradient(135deg,#536985,#71839E);color:#fff;border:0;border-radius:12px;padding:12px 16px;font:700 13px Montserrat,sans-serif;box-shadow:0 10px 28px rgba(20,30,50,.2);cursor:pointer}
    #akeemEditorLauncher:hover{transform:translateY(-2px)}
    #akeemEditorOverlay{position:fixed;inset:0;background:rgba(8,12,20,.62);z-index:1199;display:none;align-items:center;justify-content:center;padding:20px}
    #akeemEditorOverlay.open{display:flex}
    #akeemEditorModal{width:min(980px,100%);max-height:92vh;overflow:auto;background:var(--surface,#fff);color:var(--text,#1a1a2e);border-radius:18px;box-shadow:0 25px 80px rgba(0,0,0,.3);padding:22px}
    .akeem-editor-head{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-bottom:16px}.akeem-editor-head h2{margin:0;font:800 20px Sora,sans-serif}.akeem-editor-close{width:36px;height:36px;border:1px solid var(--border,#ddd);border-radius:9px;background:transparent;cursor:pointer;font-size:20px}
    .akeem-editor-search{margin-bottom:14px}.akeem-editor-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px}.akeem-editor-card{border:1px solid var(--border,#e5e7eb);border-radius:13px;padding:12px;background:var(--surface-2,#fafafa)}
    .akeem-editor-card h3{margin:0 0 5px;font:700 14px Sora,sans-serif}.akeem-editor-meta{font-size:11px;color:var(--text-muted,#6b7280);line-height:1.6}.akeem-editor-status{display:inline-block;padding:3px 8px;border-radius:20px;font-size:10px;font-weight:800;text-transform:uppercase;margin:5px 0}.akeem-status-available{background:#e8f8f0;color:#168052}.akeem-status-reserved{background:#fef6e6;color:#a66a00}.akeem-status-sold{background:#ffecec;color:#c43d3d}
    .akeem-editor-card button{margin-top:9px;background:linear-gradient(135deg,#536985,#71839E);color:#fff;border:0;border-radius:8px;padding:8px 11px;font-weight:700;cursor:pointer}.akeem-editor-empty{text-align:center;padding:35px;color:var(--text-muted,#6b7280)}
    #akeemEditForm{display:none}.akeem-edit-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.akeem-edit-fields .full{grid-column:1/-1}.akeem-edit-fields label{font-size:11px;font-weight:700;color:var(--text-muted,#6b7280);display:block}.akeem-edit-fields input,.akeem-edit-fields textarea,.akeem-edit-fields select{width:100%;box-sizing:border-box;margin:5px 0;padding:10px;border:1px solid var(--border,#ddd);border-radius:8px;background:var(--surface,#fff);color:inherit}.akeem-edit-fields textarea{min-height:100px;resize:vertical}.akeem-edit-actions{display:flex;justify-content:flex-end;gap:9px;margin-top:16px}.akeem-edit-actions button{padding:10px 15px;border-radius:9px;border:0;font-weight:700;cursor:pointer}.akeem-cancel{background:#eee;color:#333}.akeem-save{background:linear-gradient(135deg,#536985,#71839E);color:#fff}.akeem-save:disabled{opacity:.6}.akeem-editor-notice{padding:10px 12px;border-radius:9px;background:#f2f5f8;margin-bottom:12px;font-size:12px;color:#536985;display:none}
    @media(max-width:650px){#akeemEditorLauncher{right:14px;bottom:14px}.akeem-edit-fields{grid-template-columns:1fr}.akeem-edit-fields .full{grid-column:auto}}
  `;
  document.head.appendChild(css);

  const el=document.createElement('div');
  el.innerHTML=`
    <button id="akeemEditorLauncher" type="button">✎ Edit Products</button>
    <div id="akeemEditorOverlay" role="dialog" aria-modal="true" aria-label="Edit products">
      <div id="akeemEditorModal">
        <div class="akeem-editor-head"><h2>Edit Products</h2><button class="akeem-editor-close" id="akeemEditorClose" type="button" aria-label="Close">×</button></div>
        <div id="akeemEditorNotice" class="akeem-editor-notice"></div>
        <div id="akeemEditorList">
          <input id="akeemEditorSearch" class="akeem-editor-search" placeholder="Search products by name, category or location…" />
          <div id="akeemEditorGrid" class="akeem-editor-grid"><div class="akeem-editor-empty">Loading products…</div></div>
        </div>
        <form id="akeemEditForm">
          <div class="akeem-editor-head"><h2 id="akeemEditTitle">Edit Product</h2><button class="akeem-editor-close" id="akeemBackToList" type="button" aria-label="Back">←</button></div>
          <div class="akeem-edit-fields">
            <div><label>Product name</label><input id="akeemEditName"></div>
            <div><label>Price</label><input id="akeemEditPrice" inputmode="decimal"></div>
            <div><label>Category</label><select id="akeemEditCategory"></select></div>
            <div><label>Status</label><select id="akeemEditStatus"><option value="available">Available</option><option value="reserved">Reserved</option><option value="sold">Sold</option></select></div>
            <div><label>Location</label><input id="akeemEditLocation"></div>
            <div><label>Condition</label><input id="akeemEditCondition"></div>
            <div class="full"><label>Description</label><textarea id="akeemEditDescription"></textarea></div>
          </div>
          <div class="akeem-editor-notice" id="akeemEditNotice"></div>
          <div class="akeem-edit-actions"><button class="akeem-cancel" id="akeemCancelEdit" type="button">Cancel</button><button class="akeem-save" id="akeemSaveEdit" type="submit">Save Changes</button></div>
        </form>
      </div>
    </div>`;
  document.body.appendChild(el);

  const $=id=>document.getElementById(id);
  const overlay=$('akeemEditorOverlay');
  let products=[];let editing=null;
  CATEGORIES.forEach(c=>{const o=document.createElement('option');o.value=c;o.textContent=c;$('akeemEditCategory').appendChild(o)});

  function showNotice(message,error=false){const n=$('akeemEditorNotice');n.textContent=message;n.style.display='block';n.style.background=error?'#ffecec':'#f2f5f8';n.style.color=error?'#b43b3b':'#536985';}
  function hideNotice(){ $('akeemEditorNotice').style.display='none'; }
  function statusValue(p){
    if(p.sold===true)return 'sold';
    const raw=String(p.status||p.availability||p.conditionStatus||'available').toLowerCase();
    return raw.includes('sold')?'sold':raw.includes('reserv')?'reserved':'available';
  }
  function productName(p){return p.name||p.title||p.productName||'Untitled product'}
  function render(){
    const q=String($('akeemEditorSearch').value||'').toLowerCase().trim();
    const list=products.filter(p=>`${productName(p)} ${p.category||''} ${p.location||''}`.toLowerCase().includes(q));
    $('akeemEditorGrid').innerHTML=list.length?list.map(p=>{
      const st=statusValue(p);return `<article class="akeem-editor-card"><h3>${escapeHtml(productName(p))}</h3><div class="akeem-editor-meta">${escapeHtml(p.category||'Uncategorized')} · ${escapeHtml(p.location||'No location')}<br>${escapeHtml(formatPrice(p.price))}</div><span class="akeem-editor-status akeem-status-${st}">${st}</span><br><button type="button" data-edit-id="${escapeAttr(p.id)}">Edit product</button></article>`;
    }).join(''):'<div class="akeem-editor-empty">No products found.</div>';
  }
  function escapeHtml(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]||c));}
  function escapeAttr(v){return escapeHtml(v)}
  function formatPrice(v){if(v===undefined||v===null||v==='')return 'Price not set';const n=Number(String(v).replace(/[^0-9.-]/g,''));return Number.isFinite(n)?`₦${n.toLocaleString('en-NG')}`:String(v)}

  async function load(){
    try{
      const snap=await getDocs(collection(db,'products'));
      products=snap.docs.map(d=>({id:d.id,...d.data()}));render();
    }catch(e){console.error(e);$('akeemEditorGrid').innerHTML=`<div class="akeem-editor-empty">Could not load products. ${escapeHtml(e.message||'Firestore error')}</div>`;}
  }
  function open(){overlay.classList.add('open');$('akeemEditorList').style.display='block';$('akeemEditForm').style.display='none';hideNotice();load();}
  function close(){overlay.classList.remove('open');editing=null}
  function openEdit(id){
    editing=products.find(p=>p.id===id);if(!editing)return;
    $('akeemEditorList').style.display='none';$('akeemEditForm').style.display='block';$('akeemEditTitle').textContent=`Edit: ${productName(editing)}`;
    $('akeemEditName').value=productName(editing);$('akeemEditPrice').value=editing.price??'';$('akeemEditCategory').value=editing.category||'';$('akeemEditStatus').value=statusValue(editing);$('akeemEditLocation').value=editing.location||'';$('akeemEditCondition').value=editing.condition||'';$('akeemEditDescription').value=editing.description||'';$('akeemEditNotice').style.display='none';
  }
  function back(){editing=null;$('akeemEditForm').style.display='none';$('akeemEditorList').style.display='block';render()}

  $('akeemEditorLauncher').addEventListener('click',async()=>{
    const user=auth.currentUser;
    if(!user){showNotice('Please sign in to the admin account first.',true);overlay.classList.add('open');return}
    if(user.uid!==ADMIN_UID){showNotice('This editor is restricted to the Akeem Store administrator.',true);overlay.classList.add('open');return}
    open();
  });
  $('akeemEditorClose').addEventListener('click',close);$('akeemCancelEdit').addEventListener('click',back);$('akeemBackToList').addEventListener('click',back);overlay.addEventListener('click',e=>{if(e.target===overlay)close});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&overlay.classList.contains('open'))close()});$('akeemEditorSearch').addEventListener('input',render);
  $('akeemEditorGrid').addEventListener('click',e=>{const b=e.target.closest('[data-edit-id]');if(b)openEdit(b.dataset.editId)});

  $('akeemEditForm').addEventListener('submit',async e=>{
    e.preventDefault();if(!editing)return;
    const user=auth.currentUser;if(!user||user.uid!==ADMIN_UID)return;
    const save=$('akeemSaveEdit');save.disabled=true;save.textContent='Saving…';
    try{
      const old=editing;const name=$('akeemEditName').value.trim();const category=$('akeemEditCategory').value;const status=$('akeemEditStatus').value;
      const updates={name,category,status,availability:status,location:$('akeemEditLocation').value.trim(),condition:$('akeemEditCondition').value.trim(),description:$('akeemEditDescription').value.trim(),sold:status==='sold',updatedAt:serverTimestamp()};
      const price=$('akeemEditPrice').value.trim();if(price!=='')updates.price=Number(price.replace(/[^0-9.-]/g,''));
      await updateDoc(doc(db,'products',old.id),updates);
      Object.assign(old,updates,{price:updates.price??old.price});
      showNotice(status==='sold'?'Product saved and marked SOLD.':'Product updated successfully.');
      setTimeout(()=>back(),700);
    }catch(err){console.error(err);$('akeemEditNotice').textContent=`Could not save: ${err.message||'Firestore error'}`;$('akeemEditNotice').style.display='block';$('akeemEditNotice').style.background='#ffecec';$('akeemEditNotice').style.color='#b43b3b';}
    finally{save.disabled=false;save.textContent='Save Changes'}
  });
})();
