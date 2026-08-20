/*
 * Akeem Store — stable public category controller.
 * Presentation/filter layer only; never writes to Firebase.
 *
 * IMPORTANT:
 * This controller is deliberately tolerant of legacy product records where
 * the category field was saved as "Order", "Other", "Product", etc. It uses
 * the product's visible category + name + description to place old listings
 * into the correct marketplace section without changing the Firebase record.
 */
(function(){
  'use strict';
  if(window.__akeemMainCategoryFilterLoaded)return;
  window.__akeemMainCategoryFilterLoaded=true;

  const CATEGORIES=[
    {id:'all',label:'All Products',icon:'🛍️',keys:[]},
    {id:'cars',label:'Cars & Vehicles',icon:'🚗',keys:['car','cars','vehicle','vehicles','automobile','automobiles','auto','motor car','suv','sedan','saloon','wagon','coupe','convertible','jeep','pickup','pick up','pick-up','truck','trucks','bus','buses','van','vans','motorcycle','motorcycles','motorbike','motorbikes','bike','bikes','toyota','lexus','mercedes','benz','bmw','honda','nissan','ford','kia','hyundai','volkswagen','volvo','land cruiser','range rover','prado','camry','corolla','hilux','rav4','highlander','gx','rx','glk','gle','g wagon']},
    {id:'tractors',label:'Tractors',icon:'🚜',keys:['tractor','tractors','farm tractor','agricultural tractor','agriculture','agricultural','farm equipment','farm machinery','farm machine','harvester','combine harvester','plough','plow','cultivator','sprayer','seeder','tiller','disc harrow','john deere','massey ferguson','new holland','kubota','case ih','case international','farm implement']},
    {id:'houses',label:'Houses & Apartments',icon:'🏠',keys:['house','houses','home','homes','apartment','apartments','flat','flats','duplex','bungalow','mansion','villa','building','buildings','estate','real estate','property','properties','office','shop','store','commercial property','residential property','room and parlour','room & parlour','self contain','self-contained','terrace','terraced','detached','semi detached','semi-detached']},
    {id:'land',label:'Land & Plots',icon:'🌍',keys:['land','plot','plots','parcel','acre','acres','hectare','hectares','farmland','farm land','land for sale','land for rent','dry land','fenced land','property land','grazing land','industrial land','residential land','commercial land']},
    {id:'hotels',label:'Hotels & Accommodation',icon:'🏨',keys:['hotel','hotels','guest house','guesthouse','resort','lodge','lodging','accommodation','shortlet','short-let','serviced apartment','hotel room','hospitality','motel','inn']},
    {id:'generators',label:'Generators & Power',icon:'⚡',keys:['generator','generators','gen set','genset','gen-set','power generator','inverter','solar','solar panel','solar panels','battery','batteries','transformer','alternator','power equipment','power system','electricity','ups','industrial generator','diesel generator','petrol generator','power plant']},
    {id:'ships',label:'Ships & Marine',icon:'🚢',keys:['ship','ships','boat','boats','barge','barges','vessel','vessels','marine','yacht','ferry','tanker','cargo ship','scrap ship','scrap vessel','marine equipment','speed boat','speedboat','watercraft','catamaran','canoe']},
    {id:'heavy',label:'Heavy Equipment',icon:'🏗️',keys:['heavy equipment','heavy machinery','excavator','excavators','bulldozer','bulldozers','loader','loaders','crane','cranes','grader','graders','rollers','roller','forklift','construction equipment','construction machinery','caterpillar','cat machine','backhoe','compactor','wheel loader','dozer','drilling rig','rig','industrial machine','industrial equipment','road equipment']},
    {id:'other',label:'Other Products',icon:'📦',keys:[]}
  ];

  const GENERIC=new Set(['','order','orders','product','products','item','items','other','others','general','default','uncategorized','uncategorised','category','categories','unknown','n/a','na','none']);

  const norm=s=>String(s??'')
    .toLowerCase()
    .replace(/[–—]/g,'-')
    .replace(/&/g,' and ')
    .replace(/[^a-z0-9\s-]/g,' ')
    .replace(/\s+/g,' ')
    .trim();

  function categoryById(id){return CATEGORIES.find(c=>c.id===id)||CATEGORIES[CATEGORIES.length-1]}

  function matchesCategory(value,category){
    const v=norm(value);
    if(!v || GENERIC.has(v))return false;
    if(v===norm(category.label))return true;
    return category.keys.some(key=>{
      const k=norm(key);
      return v===k || v.includes(k) || k.includes(v);
    });
  }

  function classifyText(text,explicit='',data=''){
    const explicitValue=norm(explicit);
    const dataValue=norm(data);

    // Prefer an actual non-generic category saved by the existing system.
    if(explicitValue&&!GENERIC.has(explicitValue)){
      for(const category of CATEGORIES.slice(1,-1))if(matchesCategory(explicitValue,category))return category.id;
    }
    if(dataValue&&!GENERIC.has(dataValue)){
      for(const category of CATEGORIES.slice(1,-1))if(matchesCategory(dataValue,category))return category.id;
    }

    // Legacy products sometimes have category="Order". In that case use
    // the complete product card text so old listings still get a section.
    const hay=norm(text);
    if(hay){
      for(const category of CATEGORIES.slice(1,-1)){
        if(category.keys.some(key=>{
          const k=norm(key);
          return hay.includes(k);
        }))return category.id;
      }
    }
    return 'other';
  }

  function categoryText(card){
    const label=card.querySelector('.category-label');
    const explicit=label?.textContent||'';
    const dataCategory=card.dataset.marketCategory||card.dataset.category||card.getAttribute('data-category')||'';
    const title=card.querySelector('.title')?.textContent||'';
    const desc=card.querySelector('.desc')?.textContent||'';
    const full=`${dataCategory} ${explicit} ${title} ${desc} ${card.innerText||card.textContent||''}`;
    return {explicit:norm(explicit),data:norm(dataCategory),full};
  }

  function repairLegacyCategoryLabel(card,categoryId,info){
    const label=card.querySelector('.category-label');
    card.dataset.marketCategory=categoryId;
    card.dataset.akeemCategoryReady='1';
    if(!label)return;
    if(GENERIC.has(info.explicit))label.textContent=categoryById(categoryId).label;
  }

  let selected='all';
  let categoryObserver=null;
  let productObserver=null;
  let renderingCategories=false;
  let applying=false;
  let retryTimer=null;

  function controls(){return {
    list:document.getElementById('categoryList'),
    products:document.getElementById('products'),
    clear:document.getElementById('clearFilters'),
    results:document.getElementById('resultsCount')
  }}

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
      button.dataset.category=category.id;
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
      const match=selected==='all'||inferred===selected;
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
  }

  function select(id){
    selected=CATEGORIES.some(c=>c.id===id)?id:'all';
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
      productObserver=new MutationObserver(()=>{
        if(!applying)requestAnimationFrame(applyFilter);
      });
      productObserver.observe(products,{childList:true,subtree:false});
    }
    const clear=controls().clear;
    if(clear&&!clear.dataset.akeemMainReset){
      clear.dataset.akeemMainReset='1';
      clear.addEventListener('click',()=>setTimeout(()=>{
        selected='all';
        renderButtons();
        applyFilter();
      },0));
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
    #categoryList .category-btn{display:flex;align-items:center;justify-content:center;gap:4px}
    #categoryList:not(.akeem-category-ready){visibility:hidden;min-height:48px}
    #products>.product[hidden]{display:none!important}
  `;
  document.head.appendChild(style);

  function start(){
    if(init())return;
    clearTimeout(retryTimer);
    retryTimer=setTimeout(start,150);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});
  else start();
})();
