import { auth, db } from './firebase.js';
import { collection, getDocs, getDoc, addDoc, updateDoc, doc, query, where } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

(function(){
  'use strict';
  if(!document.body || document.getElementById('publicSubmissionsButton')) return;

  const style=document.createElement('style');
  style.textContent=`
    #publicSubmissionsButton{position:fixed;right:22px;bottom:22px;z-index:1200;border:0;border-radius:12px;background:linear-gradient(135deg,#667eea,#764ba2);color:#fff;padding:12px 16px;font:700 13px Montserrat,sans-serif;box-shadow:0 10px 28px rgba(30,20,70,.25);cursor:pointer}
    #publicSubmissionsButton span{display:inline-flex;min-width:20px;height:20px;padding:0 6px;align-items:center;justify-content:center;margin-left:6px;border-radius:20px;background:#fff;color:#764ba2;font-size:11px}
    #publicSubmissionsOverlay{display:none;position:fixed;inset:0;background:rgba(8,8,20,.62);z-index:1300;padding:24px;overflow:auto}
    #publicSubmissionsOverlay.open{display:block}
    .ps-panel{max-width:1100px;margin:0 auto;background:#fff;color:#1a1a2e;border-radius:18px;box-shadow:0 30px 80px rgba(0,0,0,.35);overflow:hidden}
    .ps-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:18px 22px;border-bottom:1px solid #ecebf7;position:sticky;top:0;background:#fff;z-index:2}.ps-head h2{margin:0;font:800 19px Sora,Montserrat,sans-serif}.ps-head p{margin:4px 0 0;color:#6b7280;font-size:12px}.ps-close{border:0;background:#f4f3fa;border-radius:9px;width:36px;height:36px;cursor:pointer;font-size:18px}
    .ps-body{padding:20px}.ps-loading,.ps-empty{padding:35px;text-align:center;color:#6b7280}.ps-card{border:1px solid #e7e5f0;border-radius:14px;margin-bottom:14px;overflow:hidden;background:#fff}.ps-top{display:flex;gap:16px;padding:16px}.ps-thumb{width:150px;height:115px;flex:0 0 150px;display:grid;grid-template-columns:1fr 1fr;gap:4px;background:#f3f4f6;border-radius:10px;overflow:hidden}.ps-thumb img,.ps-thumb video{width:100%;height:100%;object-fit:cover}.ps-info{flex:1;min-width:0}.ps-info h3{margin:0 0 5px;font:800 16px Sora,Montserrat,sans-serif}.ps-price{font-size:18px;font-weight:800;color:#059669}.ps-meta{display:flex;flex-wrap:wrap;gap:7px;margin-top:8px}.ps-chip{background:#f5f6ff;border:1px solid #ecebf7;border-radius:20px;padding:4px 8px;font-size:10.5px;color:#5f6170}.ps-desc{font-size:12px;color:#5f6170;margin:9px 0 0;line-height:1.5}.ps-contact{margin-top:10px;padding:10px;border-radius:9px;background:#fff7ed;border:1px solid #fed7aa;color:#7c2d12;font-size:12px}.ps-actions{display:flex;gap:8px;padding:12px 16px;border-top:1px solid #ecebf7;background:#fbfaff}.ps-actions button{border:0;border-radius:8px;padding:9px 13px;font:700 12px Montserrat;cursor:pointer}.ps-approve{background:#16a765;color:#fff}.ps-reject{background:#ffecec;color:#c24141}.ps-error{padding:12px;background:#ffecec;color:#991b1b;border-radius:9px;margin-bottom:14px;font-size:12px}
    @media(max-width:650px){#publicSubmissionsButton{right:12px;bottom:12px}.ps-top{flex-direction:column}.ps-thumb{width:100%;height:180px;flex-basis:auto}.ps-actions{position:sticky;bottom:0}.ps-actions button{flex:1}.ps-body{padding:12px}#publicSubmissionsOverlay{padding:10px}}
  `;
  document.head.appendChild(style);

  const button=document.createElement('button');button.id='publicSubmissionsButton';button.innerHTML='👥 Visitor Posts <span id="publicSubmissionsCount">0</span>';document.body.appendChild(button);
  const overlay=document.createElement('div');overlay.id='publicSubmissionsOverlay';overlay.innerHTML=`<div class="ps-panel"><div class="ps-head"><div><h2>Visitor Product Submissions</h2><p>Review public seller listings before they appear on Akeem Store.</p></div><button class="ps-close" aria-label="Close">×</button></div><div class="ps-body"><div id="publicSubmissionsMessage"></div><div id="publicSubmissionsList"></div></div></div>`;document.body.appendChild(overlay);

  const list=document.getElementById('publicSubmissionsList'),msg=document.getElementById('publicSubmissionsMessage'),count=document.getElementById('publicSubmissionsCount'),close=overlay.querySelector('.ps-close');
  button.onclick=()=>{overlay.classList.add('open');load()};close.onclick=()=>overlay.classList.remove('open');overlay.addEventListener('click',e=>{if(e.target===overlay)overlay.classList.remove('open')});
  const esc=s=>String(s??'').replace(/[&<>\"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#39;'}[c]));
  const money=v=>{const n=Number(String(v??'').replace(/[^0-9.]/g,''));return n?`₦${n.toLocaleString('en-NG')}`:esc(v||'Price not specified')};
  const isVideo=u=>/\.mp4|video\/upload|\.webm|\.mov/i.test(u||'');

  async function load(){
    list.innerHTML='<div class="ps-loading">Loading visitor submissions...</div>';msg.innerHTML='';
    try{
      if(!auth.currentUser){msg.innerHTML='<div class="ps-error">You must be logged in as the store admin to review submissions.</div>';list.innerHTML='';count.textContent='0';return}
      const snap=await getDocs(query(collection(db,'pendingProductSubmissions'),where('status','==','pending')));
      const rows=[];snap.forEach(d=>rows.push({id:d.id,...d.data()}));rows.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0));count.textContent=String(rows.length);
      if(!rows.length){list.innerHTML='<div class="ps-empty">No pending visitor posts. New public submissions will appear here.</div>';return}
      list.innerHTML=rows.map(render).join('');list.querySelectorAll('[data-approve]').forEach(b=>b.onclick=()=>approve(b.dataset.approve));list.querySelectorAll('[data-reject]').forEach(b=>b.onclick=()=>reject(b.dataset.reject));
    }catch(e){console.error(e);count.textContent='?';msg.innerHTML=`<div class="ps-error">Could not load submissions: ${esc(e.message)}</div>`;list.innerHTML=''}
  }

  function render(p){
    const media=(p.imageUrls||[]).slice(0,4).map(u=>isVideo(u)?`<video src="${esc(u)}" muted controls></video>`:`<img src="${esc(u)}" alt="">`).join('');
    const c=p.sellerContact||{};const contacts=[c.phone,c.email,c.other].filter(Boolean).map(esc).join(' • ')||'No contact supplied';
    return `<article class="ps-card"><div class="ps-top"><div class="ps-thumb">${media||'<div style="grid-column:1/-1;display:grid;place-items:center;color:#98a2b3">No media</div>'}</div><div class="ps-info"><h3>${esc(p.name||'Untitled product')}</h3><div class="ps-price">${money(p.price)}</div><div class="ps-meta"><span class="ps-chip">${esc(p.category||'Uncategorized')}</span>${p.brand?`<span class="ps-chip">${esc(p.brand)}</span>`:''}${p.location?`<span class="ps-chip">📍 ${esc(p.location)}</span>`:''}${p.condition?`<span class="ps-chip">${esc(p.condition)}</span>`:''}</div><p class="ps-desc">${esc(p.description||'No description')}</p><div class="ps-contact"><strong>Seller contact:</strong> ${contacts}</div></div></div><div class="ps-actions"><button class="ps-approve" data-approve="${esc(p.id)}">✓ Approve & Publish</button><button class="ps-reject" data-reject="${esc(p.id)}">Reject</button></div></article>`;
  }

  async function approve(id){
    if(!confirm('Approve this visitor listing and publish it to the public store?'))return;
    try{
      const snap=await getDoc(doc(db,'pendingProductSubmissions',id));if(!snap.exists())throw new Error('Submission not found');
      const p={id:snap.id,...snap.data()};
      const c=p.sellerContact||{};const contactLine=[c.phone,c.email,c.other].filter(Boolean).join(' • ');
      const originalDescription=p.description||'';
      const publicDescription=contactLine ? `${originalDescription}\n\nSeller contact: ${contactLine}` : originalDescription;
      const product={name:p.name||'',price:p.price||'',description:publicDescription,shortDescription:p.shortDescription||'',category:p.category||'',brand:p.brand||'',location:p.location||'',condition:p.condition||'',imageUrls:Array.isArray(p.imageUrls)?p.imageUrls:[],sellerContact:p.sellerContact||{},source:'public-seller',status:'published',featured:false,bestSeller:false,trending:false,newArrival:true,sold:false,createdAt:p.createdAt||Date.now(),updatedAt:Date.now(),approvedAt:Date.now(),approvedBy:auth.currentUser?.email||auth.currentUser?.uid||'admin'};
      await addDoc(collection(db,'products'),product);
      await updateDoc(doc(db,'pendingProductSubmissions',id),{status:'approved',reviewStatus:'approved',approvedAt:Date.now(),approvedBy:auth.currentUser?.email||auth.currentUser?.uid||'admin',published:true});
      await load();
    }catch(e){console.error(e);msg.innerHTML=`<div class="ps-error">Approval failed: ${esc(e.message)}</div>`}
  }

  async function reject(id){
    const reason=prompt('Optional reason for rejecting this listing:','');if(reason===null)return;
    try{await updateDoc(doc(db,'pendingProductSubmissions',id),{status:'rejected',reviewStatus:'rejected',rejectionReason:reason.trim(),rejectedAt:Date.now(),rejectedBy:auth.currentUser?.email||auth.currentUser?.uid||'admin'});await load();}
    catch(e){console.error(e);msg.innerHTML=`<div class="ps-error">Rejection failed: ${esc(e.message)}</div>`}
  }
})();
