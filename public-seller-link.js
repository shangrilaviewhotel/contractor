/* Public seller entry-point wiring. Presentation/navigation only. */
(function(){
  'use strict';
  const href='sell.html';
  function wire(){
    document.querySelectorAll('.jiji-sell').forEach(a=>{a.href=href;a.removeAttribute('target');});
    document.querySelectorAll('a,button').forEach(el=>{
      const label=(el.textContent||'').trim().toUpperCase();
      if(label==='SELL' || label==='SELL A PRODUCT'){
        if(el.tagName==='A'){el.href=href;el.removeAttribute('target');}
        else if(!el.dataset.publicSeller){el.dataset.publicSeller='1';el.addEventListener('click',()=>location.href=href);}
      }
    });
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire,{once:true});else wire();
  setTimeout(wire,300);setTimeout(wire,1200);
})();
