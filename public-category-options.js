/* Akeem Store — public seller category compatibility layer. */
(function(){
  'use strict';
  if(window.__akeemPublicCategoryOptions)return;
  window.__akeemPublicCategoryOptions=true;

  const CATEGORIES=[
    ['Cars & Vehicles','🚗'],
    ['Tractors','🚜'],
    ['Houses & Apartments','🏠'],
    ['Land & Plots','🌍'],
    ['Hotels & Accommodation','🏨'],
    ['Generators & Power','⚡'],
    ['Ships & Marine','🚢'],
    ['Heavy Equipment','🏗️'],
    ['Other Products','📦']
  ];

  let repairing=false;
  function addCanonicalOptions(){
    const select=document.getElementById('category');
    if(!select)return false;
    const existing=new Set([...select.options].map(o=>String(o.value||'').trim().toLowerCase()));
    repairing=true;
    CATEGORIES.forEach(([name,icon])=>{
      if(existing.has(name.toLowerCase()))return;
      const option=document.createElement('option');
      option.value=name;
      option.textContent=`${icon} ${name}`;
      select.appendChild(option);
    });
    repairing=false;
    return true;
  }

  function start(){
    if(!addCanonicalOptions()){setTimeout(start,100);return;}
    const select=document.getElementById('category');
    if(select&&!select.dataset.akeemCategoryObserver){
      select.dataset.akeemCategoryObserver='1';
      new MutationObserver(()=>{if(!repairing)addCanonicalOptions()}).observe(select,{childList:true});
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
