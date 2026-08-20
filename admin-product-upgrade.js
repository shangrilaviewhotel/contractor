/* Akeem Store admin Add New Product UI upgrade. */
(function(){
  'use strict';
  if(window.__akeemAdminProductUpgrade)return;
  window.__akeemAdminProductUpgrade=true;

  const MARKET_CATEGORIES=[
    ['Cars & Vehicles','🚗'],['Tractors','🚜'],['Houses & Apartments','🏠'],['Land & Plots','🌍'],
    ['Hotels & Accommodation','🏨'],['Generators & Power','⚡'],['Ships & Marine','🚢'],['Heavy Equipment','🏗️'],['Other Products','📦']
  ];
  const GENERIC_VALUES=new Set(['order','orders','product','products','item','items','general','default','uncategorized','uncategorised','category','categories','other']);
  const $=id=>document.getElementById(id);

  function addCanonicalCategories(){
    const select=$('category'),edit=$('e_category');
    if(!select)return false;
    const append=target=>{
      if(!target)return;
      const existing=new Set([...target.options].map(o=>String(o.value||'').trim().toLowerCase()));
      MARKET_CATEGORIES.forEach(([name,icon])=>{
        if(existing.has(name.toLowerCase()))return;
        const option=document.createElement('option');option.value=name;option.textContent=`${icon} ${name}`;target.appendChild(option);existing.add(name.toLowerCase());
      });
    };
    append(select);append(edit);return true;
  }

  function inferCategory(name,description){
    const text=String(`${name||''} ${description||''}`).toLowerCase();
    const groups=[
      ['Cars & Vehicles',['car','cars','vehicle','toyota','lexus','mercedes','benz','bmw','honda','nissan','ford','kia','hyundai','volkswagen','volvo','camry','corolla','hilux','suv','truck','bus','van','motorcycle','motorbike']],
      ['Tractors',['tractor','farm tractor','agricultural','farm equipment','farm machinery','harvester','plough','plow','cultivator','sprayer','seeder','tiller','john deere','massey ferguson','new holland','kubota','case ih']],
      ['Houses & Apartments',['house','home','apartment','flat','duplex','bungalow','mansion','villa','building','estate','property','office','shop','commercial property','terrace','detached']],
      ['Land & Plots',['land','plot','plots','parcel','acre','hectare','farmland','dry land','fenced land']],
      ['Hotels & Accommodation',['hotel','guest house','guesthouse','resort','lodge','accommodation','shortlet','short-let','serviced apartment','motel','inn']],
      ['Generators & Power',['generator','genset','gen set','inverter','solar','battery','transformer','alternator','power system','power equipment','ups']],
      ['Ships & Marine',['ship','boat','barge','vessel','marine','yacht','ferry','tanker','scrap vessel','scrap ship','speedboat','watercraft','canoe']],
      ['Heavy Equipment',['excavator','bulldozer','loader','crane','grader','forklift','backhoe','compactor','caterpillar','heavy equipment','heavy machinery','construction machinery','industrial equipment','road equipment']]
    ];
    for(const [category,keys] of groups)if(keys.some(k=>text.includes(k)))return category;
    return '';
  }

  function repairGenericSelection(){
    const category=$('category');if(!category)return;
    const value=String(category.value||'').trim().toLowerCase();
    if(!GENERIC_VALUES.has(value))return;
    const inferred=inferCategory($('name')?.value,$('desc')?.value);
    if(inferred){addCanonicalCategories();category.value=inferred;category.dispatchEvent(new Event('change',{bubbles:true}));}
  }

  function upgradeForm(){
    const panel=$('addProductPanel'),category=$('category');if(!panel||!category)return false;
    addCanonicalCategories();

    if(!$('akeemProductCategoryHint')){
      const hint=document.createElement('div');hint.id='akeemProductCategoryHint';hint.className='akeem-category-hint';
      hint.innerHTML='<span class="akeem-hint-icon">✓</span><span><strong>Marketplace category</strong><br><small>Choose the closest category. This controls where the listing appears on the public store.</small></span>';
      category.parentElement.appendChild(hint);
    }

    if(!$('akeemCategoryQuickPick')){
      const quick=document.createElement('div');quick.id='akeemCategoryQuickPick';quick.className='akeem-category-picks';
      quick.innerHTML='<div class="akeem-picks-label">Quick category</div><div class="akeem-picks-grid"></div>';
      const grid=quick.querySelector('.akeem-picks-grid');
      MARKET_CATEGORIES.forEach(([name,icon])=>{
        const b=document.createElement('button');b.type='button';b.className='akeem-category-pick';b.innerHTML=`<span>${icon}</span><span>${name}</span>`;
        b.addEventListener('click',()=>{addCanonicalCategories();category.value=name;category.dispatchEvent(new Event('change',{bubbles:true}));grid.querySelectorAll('.akeem-category-pick').forEach(x=>x.classList.remove('active'));b.classList.add('active');});grid.appendChild(b);
      });
      category.parentElement.appendChild(quick);
    }

    const sync=()=>{const value=String(category.value||'').toLowerCase();document.querySelectorAll('#akeemCategoryQuickPick .akeem-category-pick').forEach(b=>{const label=b.textContent.trim().toLowerCase();b.classList.toggle('active',label===value||label.replace(/^\S+\s*/,'')===value);});};
    if(!category.dataset.akeemUpgradeChange){
      category.dataset.akeemUpgradeChange='1';
      category.addEventListener('change',()=>{addCanonicalCategories();sync()});
    }
    if(!category.dataset.akeemCategoryObserver){category.dataset.akeemCategoryObserver='1';new MutationObserver(()=>{addCanonicalCategories();sync()}).observe(category,{childList:true});}

    // Capture phase runs before admindashboard.html's existing onclick handler,
    // so a legacy generic category is repaired before Firestore receives it.
    const submit=$('uploadBtn');
    if(submit&&!submit.dataset.akeemCategorySubmit){submit.dataset.akeemCategorySubmit='1';submit.addEventListener('click',repairGenericSelection,{capture:true});}

    sync();return true;
  }

  const style=document.createElement('style');style.textContent=`
    #addProductPanel .form-section-title{position:relative;display:flex;align-items:center;gap:10px;margin-top:24px;margin-bottom:8px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted)}
    #addProductPanel .form-section-title::after{content:"";height:1px;flex:1;background:var(--border)}
    #akeemProductCategoryHint{display:flex;align-items:flex-start;gap:9px;margin-top:6px;padding:10px 12px;border:1px solid rgba(102,126,234,.18);background:var(--accent-grad-soft);border-radius:10px;color:var(--text-muted);font-size:11px;line-height:1.45}
    #akeemProductCategoryHint strong{color:var(--text);font-size:11.5px}.akeem-hint-icon{width:20px;height:20px;border-radius:50%;background:var(--success-bg);color:var(--success);display:inline-flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0}
    #akeemCategoryQuickPick{margin-top:10px}.akeem-picks-label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;color:var(--text-faint);margin-bottom:7px}.akeem-picks-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
    .akeem-category-pick{display:flex;align-items:center;gap:7px;text-align:left;padding:8px 9px;background:var(--surface-2);border:1px solid var(--border);color:var(--text-muted);font-size:10.5px;border-radius:9px;min-width:0}.akeem-category-pick span:first-child{font-size:16px;line-height:1}.akeem-category-pick span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.akeem-category-pick:hover{border-color:var(--accent1);color:var(--text);transform:translateY(-1px)}.akeem-category-pick.active{border-color:var(--accent1);background:var(--accent-grad-soft);color:var(--accent2);box-shadow:0 0 0 1px rgba(102,126,234,.1)}
    @media(max-width:700px){.akeem-picks-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:430px){.akeem-picks-grid{grid-template-columns:1fr}}
  `;document.head.appendChild(style);

  function start(){if(upgradeForm())return;setTimeout(start,200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
