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

  function addCanonicalOptions(){
    const select=document.getElementById('category');
    if(!select)return false;
    const existing=new Set([...select.options].map(o=>String(o.value||'').trim().toLowerCase()));
    CATEGORIES.forEach(([name,icon])=>{
      if(existing.has(name.toLowerCase()))return;
      const option=document.createElement('option');
      option.value=name;
      option.textContent=`${icon} ${name}`;
      select.appendChild(option);
    });
    return true;
  }

  function start(){
    if(addCanonicalOptions())return;
    setTimeout(start,100);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
