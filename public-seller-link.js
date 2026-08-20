/* Public seller entry-point wiring. Presentation/navigation only. */
(function(){
  'use strict';
  const href='sell.html';

  function wire(){
    // The public SELL entry point must NEVER send visitors to the admin/login page.
    document.querySelectorAll('.jiji-sell').forEach(a=>{
      a.href=href;
      a.removeAttribute('target');
    });

    document.querySelectorAll('a,button').forEach(el=>{
      const label=(el.textContent||'').trim().replace(/\s+/g,' ').toUpperCase();
      if(label==='SELL' || label==='SELL A PRODUCT'){
        if(el.tagName==='A'){
          el.href=href;
          el.removeAttribute('target');
        }else if(!el.dataset.publicSeller){
          el.dataset.publicSeller='1';
          el.addEventListener('click',()=>{ window.location.href=href; });
        }
      }
    });
  }

  if(document.readyState==='loading'){
    document.addEventListener('DOMContentLoaded',wire,{once:true});
  }else{
    wire();
  }

  // The Jiji presentation layer can add its SELL link asynchronously.
  // Keep watching briefly so a later-created link cannot revert to login.html.
  [150,500,1000,1600,2200,3000].forEach(ms=>setTimeout(wire,ms));
  if(document.body){
    const observer=new MutationObserver(wire);
    observer.observe(document.body,{childList:true,subtree:true});
    setTimeout(()=>observer.disconnect(),5000);
  }
})();
