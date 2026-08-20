/* Akeem Store — visitor seller upload runtime.
   The public seller page has its own media queue. This module takes over
   the submit event so the visitor workflow is independent of browser-native
   file validation and cannot get stuck indefinitely in a Cloudinary request.
*/
import { db } from './firebase.js';
import { collection, addDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

(function(){
  'use strict';
  if(window.__akeemPublicSellerUploadFix)return;
  window.__akeemPublicSellerUploadFix=true;

  const CLOUD_NAME='dpaltarvh';
  const UPLOAD_PRESET='Tobifatai';
  const files=[];
  const $=id=>document.getElementById(id);
  const num=v=>Number(String(v??'').replace(/[^0-9.]/g,''))||0;
  const slugify=s=>String(s||'').toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');

  function show(type,msg){
    const s=$('status');
    if(!s)return;
    s.className='status show '+type;
    s.textContent=msg;
  }

  function setProgress(percent,label){
    const p=$('progress');
    if(p)p.classList.add('show');
    if($('progressFill'))$('progressFill').style.width=Math.max(0,Math.min(100,percent))+'%';
    if($('progressPercent'))$('progressPercent').textContent=Math.round(percent)+'%';
    if($('progressLabel'))$('progressLabel').textContent=label||'Uploading...';
  }

  function rememberSelectedMedia(){
    const input=$('media');
    if(!input||input.dataset.akeemQueueBound)return;
    input.dataset.akeemQueueBound='1';
    input.removeAttribute('required');
    input.setAttribute('aria-required','true');
    input.addEventListener('change',()=>{
      [...(input.files||[])].forEach(file=>files.push(file));
      // The original page also clears the input. Keep doing that because the
      // queue above is now the authoritative source for submission.
      input.value='';
    });
  }

  function installValidation(){
    const form=$('sellForm');
    if(!form){setTimeout(installValidation,100);return;}
    form.noValidate=true;
    form.setAttribute('novalidate','novalidate');
    const media=$('media');
    if(media){media.removeAttribute('required');media.setAttribute('aria-required','true');}
    rememberSelectedMedia();

    // Capture phase runs before sell.html's original submit listener. We stop
    // that listener and use this complete, bounded workflow instead.
    if(form.dataset.akeemSubmitBound)return;
    form.dataset.akeemSubmitBound='1';
    form.addEventListener('submit',handleSubmit,true);
  }

  function uploadFile(file,onProgress){
    const resource=file.type&&file.type.startsWith('video/')?'video':'image';
    return new Promise((resolve,reject)=>{
      const xhr=new XMLHttpRequest();
      let finished=false;
      const timer=setTimeout(()=>{
        if(finished)return;
        finished=true;
        try{xhr.abort()}catch(_){ }
        reject(new Error('Media upload timed out. Please check your connection and try again.'));
      },60000);
      xhr.upload.onprogress=e=>{if(e.lengthComputable&&onProgress)onProgress((e.loaded/e.total)*100)};
      xhr.onload=()=>{
        if(finished)return;
        finished=true;clearTimeout(timer);
        let data={};try{data=JSON.parse(xhr.responseText||'{}')}catch(_){ }
        if(xhr.status>=200&&xhr.status<300&&data.secure_url){resolve(data.secure_url);return}
        reject(new Error(data?.error?.message||`Media upload failed (${xhr.status||'network'})`));
      };
      xhr.onerror=()=>{if(finished)return;finished=true;clearTimeout(timer);reject(new Error('Media upload network error.'))};
      xhr.onabort=()=>{if(finished)return;finished=true;clearTimeout(timer);reject(new Error('Media upload was cancelled.'))};
      const body=new FormData();body.append('file',file);body.append('upload_preset',UPLOAD_PRESET);
      xhr.open('POST',`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/${resource}/upload`);
      xhr.send(body);
    });
  }

  async function handleSubmit(event){
    event.preventDefault();
    event.stopImmediatePropagation();

    const form=$('sellForm');
    const btn=$('submitBtn');
    const name=$('name')?.value.trim()||'';
    const price=$('price')?.value.trim()||'';
    const description=$('description')?.value.trim()||'';
    const category=$('category')?.value||'';
    const phone=$('phone')?.value.trim()||'';
    const email=$('email')?.value.trim()||'';
    const other=$('otherContact')?.value.trim()||'';

    if(!name||!price||!description){show('err','Please complete the product name, price and full description.');return}
    if(!category){show('err','Please select a category.');return}
    if(!phone&&!email&&!other){show('err','Please provide at least one seller contact method.');return}
    if(!files.length){show('err','Please add at least one product image or video.');return}

    btn.disabled=true;btn.textContent='Uploading & submitting...';
    try{
      const urls=[];
      for(let i=0;i<files.length;i++){
        setProgress((i/files.length)*100,`Uploading ${i+1} of ${files.length}...`);
        const url=await uploadFile(files[i],pct=>setProgress(((i+pct/100)/files.length)*100,`Uploading ${i+1} of ${files.length}...`));
        urls.push(url);
      }
      setProgress(100,'Saving your listing...');

      const tags=($('tags')?.value||'').split(',').map(x=>x.trim()).filter(Boolean);
      const now=Date.now();
      const docData={
        name,price,description,
        shortDescription:($('shortDesc')?.value.trim()||description.slice(0,160)),
        sku:`AS-${String(category).replace(/[^a-zA-Z]/g,'').slice(0,3).toUpperCase().padEnd(3,'X')}-${now.toString(36).slice(-5).toUpperCase()}`,
        category,brand:$('brand')?.value.trim()||'',tags,
        location:$('location')?.value.trim()||'',condition:$('condition')?.value||'',
        comparePrice:$('comparePrice')?.value.trim()||'',
        stockQuantity:parseInt($('stockQuantity')?.value,10)||0,
        minStock:parseInt($('minStock')?.value,10)||1,
        seoTitle:$('seoTitle')?.value.trim()||name,
        seoDescription:$('seoDesc')?.value.trim()||description.slice(0,160),
        slug:slugify(name),imageAlt:$('imageAlt')?.value.trim()||name,
        imageUrls:urls,
        sellerContact:{phone,email,other},sellerName:'',source:'public-seller',
        status:'pending',reviewStatus:'pending',published:false,
        featured:false,bestSeller:false,trending:false,newArrival:true,sold:false,
        createdAt:now,updatedAt:now
      };

      await Promise.race([
        addDoc(collection(db,'pendingProductSubmissions'),docData),
        new Promise((_,reject)=>setTimeout(()=>reject(new Error('Saving the submission timed out. Please try again.')),30000))
      ]);

      files.length=0;
      if(form)form.reset();
      if($('preview'))$('preview').innerHTML='';
      if($('progress'))$('progress').classList.remove('show');
      show('ok','Submitted successfully. Your listing has been sent to the store owner for review. It will appear publicly only after approval.');
      window.scrollTo({top:0,behavior:'smooth'});
    }catch(err){
      console.error('Public seller submission failed:',err);
      if($('progress'))$('progress').classList.remove('show');
      const message=String(err?.message||err);
      if(/permission|insufficient/i.test(message)){
        show('err','Firebase blocked the submission. The Firestore rules must allow public CREATE access to pendingProductSubmissions. No public user should be given write access to products.');
      }else{
        show('err','Submission failed: '+message);
      }
    }finally{
      btn.disabled=false;btn.textContent='Upload Product for Admin Review';
    }
  }

  function install(){
    const form=$('sellForm');
    if(!form){setTimeout(install,100);return}
    installValidation();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
