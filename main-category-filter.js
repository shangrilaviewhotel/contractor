/* Stable Akeem Store main category filter.
 * Presentation/filter layer only. It never writes to Firebase.
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
    {id:'hotels',label:'Hotels & Accommodation',icon:'🏨',keys:['hotel','hotels','guest house','guesthouse','resort','lodge','lodging','accommodation','shortlet','short-let','serviced apartment','hotel room']},
    {id:'generators',label:'Generators & Power',icon:'⚡',keys:['generator','generators','gen set','genset','power generator','inverter','solar','battery','transformer','alternator','power equipment']},
    {id:'ships',label:'Ships & Marine',icon:'🚢',keys:['ship','ships','boat','boats','barge','barges','vessel','vessels','marine','yacht','ferry','tanker','cargo ship','scrap ship','scrap vessel']},
    {id:'heavy',label:'Heavy Equipment',icon:'🏗️',keys:['heavy equipment','heavy machinery','excavator','excavators','bulldozer','bulldozers','loader','loaders','crane','cranes','grader','rollers','roller','forklift','construction equipment','construction machinery','caterpillar','cat machine']},
    {id:'other',label:'Other Products',icon:'📦',keys:[]}
  ];

  const norm=s=>String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/[^a-z0-9\s&-]/g,' ').replace(/\s+/g,' ').trim();
  const classifyText=text=>{
    const hay=norm(text);
    for(const category of CATEGORIES.slice(1,-1)){
      if(category.keys.some(key=>hay.includes(norm(key))))return category.id;
    }
    return 'other';
  };

  let selected='all';
  let categoryObserver=null;
  let productObserver=null;
  let renderingCategories=false;

  function controls(){return {
    list:document.getElementById('categoryList'),
    products:document.getElementById('products'),
    clear:document.getElementById('clearFilters'),
    results:document.getElementById('resultsCount')
  };}

  function categoryBarIsOurs(list){
    const buttons=[...list.querySelectorAll('.category-btn')];
    return buttons.length===CATEGORIES.length && buttons.every(button=>button.dataset.marketCategory);
  }

  function renderButtons(){
    const {list}=controls();
    if(!list)return false;
    if(categoryBarIsOurs(list)){
      updateButtons();
      list.classList.add('akeem-category-ready');
      return true;
    }

    renderingCategories=true;
    list.innerHTML='';
    CATEGORIES.forEach(category=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='category-btn'+(category.id===selected?' active':'');
      button.dataset.marketCategory=category.id;
      button.setAttribute('aria-pressed',category.id===selected?'true':'false');
      button.innerHTML=`${category.icon} ${category.label}`;
      button.addEventListener('click',()=>select(category.id));
      list.appendChild(button);
    });
    list.classList.add('akeem-category-ready');
    renderingCategories=false;
    return true;
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
    return classifyText(card.innerText||card.textContent||'')===selected;
  }

  function applyFilter(){
    const {products,results}=controls();
    if(!products)return;
    const cards=[...products.querySelectorAll(':scope > .product')];
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
      results.textContent=`Showing ${visible} product${visible===1?'':'s'} • ${label}`;
    }
  }

  function select(id){
    selected=id;
    updateButtons();
    applyFilter();
    const {products}=controls();
    if(products)products.scrollIntoView({behavior:'smooth',block:'start'});
  }

  function installObservers(){
    const {list,products}=controls();
    if(!list||!products)return false;

    if(!categoryObserver){
      categoryObserver=new MutationObserver(()=>{
        if(renderingCategories)return;
        // The original Firebase buildCategories() may replace the bar after async loading.
        // Only rebuild when the DOM is actually the old category bar.
        if(!categoryBarIsOurs(list))renderButtons();
      });
      categoryObserver.observe(list,{childList:true});
    }

    if(!productObserver){
      productObserver=new MutationObserver(()=>{
        if(selected!=='all')setTimeout(applyFilter,0);
      });
      productObserver.observe(products,{childList:true});
    }

    const clear=controls().clear;
    if(clear&&!clear.dataset.akeemMainReset){
      clear.dataset.akeemMainReset='1';
      clear.addEventListener('click',()=>setTimeout(()=>{selected='all';renderButtons();applyFilter()},0));
    }
    return true;
  }

  function init(){
    const c=controls();
    if(!c.list||!c.products)return false;
    renderButtons();
    installObservers();
    applyFilter();
    return true;
  }

  const style=document.createElement('style');
  style.textContent=`
    #categoryList{scrollbar-width:thin;scroll-behavior:smooth}
    #categoryList .category-btn{display:inline-flex;align-items:center;gap:6px}
    #categoryList:not(.akeem-category-ready){visibility:hidden;min-height:48px}
    #products > .product[hidden]{display:none!important}
    .category-btn[data-market-category="tractors"]{border-color:rgba(16,185,129,.55)}
  `;
  document.head.appendChild(style);

  function start(){
    if(init())return;
    setTimeout(start,150);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();