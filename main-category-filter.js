/*
 * Akeem Store — stable public category controller.
 * Presentation/filter layer only; never writes to Firebase.
 */
(function(){
  'use strict';
  if(window.__akeemMainCategoryFilterLoaded)return;
  window.__akeemMainCategoryFilterLoaded=true;

  const CATEGORIES=[
    {id:'all',label:'All Products',icon:'🛍️',keys:[]},
    {id:'cars',label:'Cars & Vehicles',icon:'🚗',keys:['car','cars','vehicle','vehicles','automobile','auto','suv','sedan','saloon','wagon','coupe','jeep','pickup','pick-up','truck','trucks','bus','buses','van','vans','motorcycle','motorbike','bike','toyota','lexus','mercedes','benz','bmw','honda','nissan','ford','kia','hyundai','volkswagen','volvo','land cruiser','range rover','prado']},
    {id:'tractors',label:'Tractors',icon:'🚜',keys:['tractor','tractors','farm tractor','agricultural tractor','agriculture','agricultural','farm equipment','farm machinery','harvester','combine harvester','plough','plow','cultivator','sprayer','seeder','tiller','john deere','massey ferguson','new holland','kubota','case ih']},
    {id:'houses',label:'Houses & Apartments',icon:'🏠',keys:['house','houses','home','homes','apartment','apartments','flat','flats','duplex','bungalow','mansion','villa','building','buildings','estate','real estate','property','properties','office','shop','commercial property']},
    {id:'land',label:'Land & Plots',icon:'🌍',keys:['land','plot','plots','parcel','acre','acres','hectare','hectares','farmland','land for sale','land for rent','dry land','fenced land']},
    {id:'hotels',label:'Hotels & Accommodation',icon:'🏨',keys:['hotel','hotels','guest house','guesthouse','resort','lodge','lodging','accommodation','shortlet','short-let','serviced apartment','hotel room']},
    {id:'generators',label:'Generators & Power',icon:'⚡',keys:['generator','generators','gen set','genset','power generator','inverter','solar','battery','transformer','alternator','power equipment','power system']},
    {id:'ships',label:'Ships & Marine',icon:'🚢',keys:['ship','ships','boat','boats','barge','barges','vessel','vessels','marine','yacht','ferry','tanker','cargo ship','scrap ship','scrap vessel','marine equipment']},
    {id:'heavy',label:'Heavy Equipment',icon:'🏗️',keys:['heavy equipment','heavy machinery','excavator','excavators','bulldozer','bulldozers','loader','loaders','crane','cranes','grader','rollers','roller','forklift','construction equipment','construction machinery','caterpillar','cat machine','backhoe','compactor','industrial machine']},
    {id:'other',label:'Other Products',icon:'📦',keys:[]}
  ];

  const norm=s=>String(s||'').toLowerCase().replace(/[–—]/g,'-').replace(/[^a-z0-9\s&-]/g,' ').replace(/\s+/g,' ').trim();
  const GENERIC_CATEGORY_WORDS=new Set(['order','orders','product','products','item','items','other','others','general','default','uncategorized','uncategorised','category']);

  function categoryText(card){
    const categoryLabel=card.querySelector('.category-label');
    const explicit=categoryLabel ? categoryLabel.textContent : '';
    const dataCategory=card.dataset.marketCategory||card.dataset.category||card.getAttribute('data-category')||'';
    return {explicit:norm(explicit),data:norm(dataCategory),full:norm(`${dataCategory} ${card.innerText||card.textContent||''}`)};
  }

  function classifyText(text,explicit='',data=''){
    const explicitValue=norm(explicit);
    if(explicitValue && !GENERIC_CATEGORY_WORDS.has(explicitValue)){
      for(const category of CATEGORIES.slice(1,-1)){
        if(norm(category.label)===explicitValue || category.keys.some(key=>explicitValue.includes(norm(key))))return category.id;
      }
    }
    const dataValue=norm(data);
    if(dataValue && !GENERIC_CATEGORY_WORDS.has(dataValue)){
      for(const category of CATEGORIES.slice(1,-1)){
        if(norm(category.label)===dataValue || category.keys.some(key=>dataValue.includes(norm(key))))return category.id;
      }
    }
    const hay=norm(text);
    for(const category of CATEGORIES.slice(1,-1)){
      if(category.keys.some(key=>hay.includes(norm(key))))return category.id;
    }
    return 'other';
  }

  function categoryById(id){return CATEGORIES.find(c=>c.id===id)||CATEGORIES[CATEGORIES.length-1]}

  function repairLegacyCategoryLabel(card,categoryId,info){
    const label=card.querySelector('.category-label');
    if(!label)return;
    const generic=GENERIC_CATEGORY_WORDS.has(info.explicit);
    const known=categoryId!=='other' || info.explicit==='other products' || info.explicit==='other';
    if(generic || !info.explicit || (!known && info.explicit!=='other products')){
      label.textContent=categoryById(categoryId).label;
    }
    card.dataset.marketCategory=categoryId;
  }

  let selected='all', categoryObserver=null, productObserver=null, renderingCategories=false, applying=false;

  function controls(){return {list:document.getElementById('categoryList'),products:document.getElementById('products'),clear:document.getElementById('clearFilters'),results:document.getElementById('resultsCount')}}

  function renderButtons(){
    const {list}=controls();
    if(!list)return false;
    renderingCategories=true;
    list.innerHTML='';
    CATEGORIES.forEach(category=>{
      const button=document.createElement('button');
      button.type='button';
      button.className='category-btn'+(category.id===selected?' active':'');
      button.dataset.marketCategory=category.id;
      button.setAttribute('aria-pressed',category.id===selected?'true':'false');
      button.innerHTML=`<span style="display:block;font-size:24px;line-height:1.1;margin-bottom:4px">${category.icon}</span><span>${category.label}</span>`;
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

  function syncMarketplaceSections(){
    const products=controls().products;
    if(!products || products.querySelector('[data-akeem-category-sync]'))return;
    const marker=document.createElement('span');
    marker.dataset.akeemCategorySync='';
    marker.style.display='none';
    products.appendChild(marker);
  }

  function applyFilter(){
    if(applying)return;
    const {products,results}=controls();
    if(!products)return;
    applying=true;
    const cards=[...products.querySelectorAll(':scope > .product')];
    let visible=0;
    cards.forEach(card=>{
      const info=categoryText(card);
      const inferred=classifyText(info.full,info.explicit,info.data);
      repairLegacyCategoryLabel(card,inferred,info);
      const match=selected==='all' || inferred===selected;
      card.style.display=match?'':'none';
      card.hidden=!match;
      card.setAttribute('aria-hidden',match?'false':'true');
      if(match)visible++;
    });
    updateButtons();
    if(results){
      const label=categoryById(selected).label;
      results.textContent=`Showing ${visible} product${visible===1?'':'s'} • ${label}`;
    }
    applying=false;
    syncMarketplaceSections();
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
        if(!list.querySelector('.category-btn[data-market-category]'))renderButtons();
        else updateButtons();
      });
      categoryObserver.observe(list,{childList:true});
    }
    if(!productObserver){
      productObserver=new MutationObserver(()=>{if(!applying)setTimeout(applyFilter,0)});
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
  style.textContent=`#categoryList{scrollbar-width:thin;scroll-behavior:smooth}#categoryList .category-btn{display:flex;align-items:center;justify-content:center;gap:4px}#categoryList:not(.akeem-category-ready){visibility:hidden;min-height:48px}#products > .product[hidden]{display:none!important}`;
  document.head.appendChild(style);

  function start(){if(init())return;setTimeout(start,150)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
