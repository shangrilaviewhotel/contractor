/*
 * Main marketplace category filter.
 * Additive only: it does not write to Firebase or change product data.
 * It works against the cards rendered by the existing index.html renderer,
 * so old and newly-added Firebase products are covered automatically.
 */
(function(){
  'use strict';
  if(window.__akeemMainCategoryFilterLoaded)return;
  window.__akeemMainCategoryFilterLoaded=true;

  const CATEGORIES=[
    {id:'all',label:'All Products',icon:'🛍️',keys:[]},
    {id:'cars',label:'Cars & Vehicles',icon:'🚗',keys:['car','cars','vehicle','vehicles','automobile','auto','suv','sedan','coupe','saloon','wagon','jeep','pickup','pick-up','truck','trucks','bus','buses','van','vans','motorcycle','motorbike','bike','toyota','lexus','mercedes','benz','bmw','honda','nissan','ford','kia','hyundai','volkswagen','volvo','land cruiser','range rover','prado']},
    {id:'tractors',label:'Tractors',icon:'🚜',keys:['tractor','tractors','farm tractor','agricultural tractor','agriculture','agricultural','farm equipment','farm machinery','harvester','combine harvester','plough','plow','cultivator','sprayer','seeder','tiller']},
    {id:'houses',label:'Houses & Apartments',icon:'🏠',keys:['house','houses','home','homes','apartment','apartments','flat','flats','duplex','bungalow','mansion','villa','building','buildings','estate','real estate','property','properties','office','shop','commercial property']},
    {id:'land',label:'Land & Plots',icon:'🌍',keys:['land','plot','plots','parcel','acre','acres','hectare','hectares','farmland','land for sale','land for rent']},
    {id:'hotels',label:'Hotels & Accommodation',icon:'🏨',keys:['hotel','hotels','guest house','guesthouse','resort','lodge','lodging','accommodation','shortlet','short-let','serviced apartment','hotel room','room']},
    {id:'generators',label:'Generators & Power',icon:'⚡',keys:['generator','generators','gen set','genset','power generator','inverter','solar','battery','transformer','alternator','power equipment']},
    {id:'ships',label:'Ships & Marine',icon:'🚢',keys:['ship','ships','boat','boats','barge','barges','vessel','vessels','marine','yacht','ferry','tanker','cargo ship','scrap ship','scrap vessel']},
    {id:'heavy',label:'Heavy Equipment',icon:'🏗️',keys:['heavy equipment','heavy machinery','excavator','excavators','bulldozer','bulldozers','loader','loaders','crane','cranes','grader','rollers','roller','forklift','construction equipment','construction machinery','caterpillar','cat machine']},
    {id:'other',label:'Other Products',icon:'📦',keys:[]}
  ];

  const norm=s=>String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/[^a-z0-9\s&-]/g,' ').replace(/\s+/g,' ').trim();
  const has=(hay,key)=>norm(hay).includes(norm(key));

  function getCardText(card){return norm(card.innerText||card.textContent||'');}

  function classify(card){
    const text=getCardText(card);
    // The old "Order" value is a UI/action value, not a useful marketplace category.
    // When it is present, classification is driven by the product's name/description text.
    for(const category of CATEGORIES.slice(1,-1)){
      if(category.keys.some(key=>has(text,key)))return category.id;
    }
    return 'other';
  }

  let selected='all';
  let ready=false;

  function getControls(){
    return {
      list:document.getElementById('categoryList'),
      products:document.getElementById('products'),
      search:document.getElementById('searchBox'),
      clear:document.getElementById('clearFilters'),
      results:document.getElementById('resultsCount')
    };
  }

  function renderButtons(){
    const {list}=getControls();
    if(!list)return;
    if(list.dataset.akeemMainCategories==='1')return;
    list.dataset.akeemMainCategories='1';
    list.innerHTML='';
    CATEGORIES.forEach(category=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='category-btn'+(category.id==='all'?' active':'');
      button.dataset.marketCategory=category.id;
      button.innerHTML=`${category.icon} ${category.label}`;
      button.setAttribute('aria-pressed',category.id==='all'?'true':'false');
      button.addEventListener('click',()=>select(category.id));
      list.appendChild(button);
    });
    ready=true;
  }

  function updateButtons(){
    document.querySelectorAll('#categoryList .category-btn[data-market-category]').forEach(button=>{
      const active=button.dataset.marketCategory===selected;
      button.classList.toggle('active',active);
      button.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function cardMatches(card){
    if(selected==='all')return true;
    if(selected==='other')return classify(card)==='other';
    return classify(card)===selected;
  }

  function apply(){
    const {products,results}=getControls();
    if(!products)return;
    const cards=[...products.querySelectorAll(':scope > .product')];
    if(!cards.length)return;
    let visible=0;
    cards.forEach(card=>{
      const show=cardMatches(card);
      card.hidden=!show;
      card.setAttribute('aria-hidden',show?'false':'true');
      if(show)visible++;
    });
    updateButtons();
    if(results){
      const label=CATEGORIES.find(c=>c.id===selected)?.label||'All Products';
      const search=getControls().search?.value?.trim();
      results.textContent=`Showing ${visible} product${visible===1?'':'s'}${search?' matching your search':''} • ${label}`;
    }
  }

  function select(id){
    selected=id;
    apply();
    const {products}=getControls();
    if(products)products.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function reset(){selected='all';apply();}

  function init(){
    const controls=getControls();
    if(!controls.list||!controls.products)return false;
    renderButtons();
    apply();
    if(!controls.products.dataset.akeemCategoryObserver){
      controls.products.dataset.akeemCategoryObserver='1';
      new MutationObserver(()=>{
        // Existing Firebase renderer may replace the cards after search/sort.
        // Re-apply the selected marketplace category to the newly-rendered cards.
        if(selected!=='all')apply();
      }).observe(controls.products,{childList:true,subtree:false});
    }
    if(controls.clear&&!controls.clear.dataset.akeemCategoryReset){
      controls.clear.dataset.akeemCategoryReset='1';
      controls.clear.addEventListener('click',()=>setTimeout(reset,0));
    }
    if(controls.search&&!controls.search.dataset.akeemCategorySearch){
      controls.search.dataset.akeemCategorySearch='1';
      controls.search.addEventListener('input',()=>setTimeout(()=>{if(selected!=='all')apply()},40));
    }
    return true;
  }

  const style=document.createElement('style');
  style.textContent=`
    #categoryList{scrollbar-width:thin;scroll-behavior:smooth}
    #categoryList .category-btn{display:inline-flex;align-items:center;gap:6px}
    #products > .product[hidden]{display:none!important}
    .category-btn[data-market-category="tractors"]{border-color:rgba(16,185,129,.55)}
  `;
  document.head.appendChild(style);

  const start=()=>{
    if(init())return;
    setTimeout(start,250);
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
