/* Akeem Store admin Add New Product UI upgrade.
 * Additive only: no Firebase writes, schema changes, or replacement of the existing CRUD handler.
 * The existing #category field remains the authoritative value saved by admindashboard.html.
 */
(function(){
  'use strict';
  if(window.__akeemAdminProductUpgrade)return;
  window.__akeemAdminProductUpgrade=true;

  const MARKET_CATEGORIES=[
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

  const $=id=>document.getElementById(id);

  function addCanonicalCategories(){
    const select=$('category');
    const edit=$('e_category');
    if(!select)return;

    // Keep categories already configured in Firebase, then append the marketplace
    // categories only when they are missing. This avoids deleting administrator-created categories.
    const existing=[...select.options].map(o=>String(o.value).trim().toLowerCase());
    MARKET_CATEGORIES.forEach(([name,icon])=>{
      if(!existing.includes(name.toLowerCase())){
        const opt=document.createElement('option');
        opt.value=name;
        opt.textContent=`${icon} ${name}`;
        select.appendChild(opt);
      }
    });
    if(edit){
      const editExisting=[...edit.options].map(o=>String(o.value).trim().toLowerCase());
      MARKET_CATEGORIES.forEach(([name,icon])=>{
        if(!editExisting.includes(name.toLowerCase())){
          const opt=document.createElement('option');
          opt.value=name;
          opt.textContent=`${icon} ${name}`;
          edit.appendChild(opt);
        }
      });
    }
  }

  function upgradeForm(){
    const panel=$('addProductPanel');
    const category=$('category');
    if(!panel||!category)return false;

    addCanonicalCategories();

    if(!$('akeemProductCategoryHint')){
      const hint=document.createElement('div');
      hint.id='akeemProductCategoryHint';
      hint.className='akeem-category-hint';
      hint.innerHTML='<span class="akeem-hint-icon">✓</span><span><strong>Marketplace category</strong><br><small>Choose the closest category. This is saved with the product and automatically controls where the listing appears on the public store.</small></span>';
      category.parentElement.appendChild(hint);
    }

    if(!$('akeemCategoryQuickPick')){
      const quick=document.createElement('div');
      quick.id='akeemCategoryQuickPick';
      quick.className='akeem-category-picks';
      quick.innerHTML='<div class="akeem-picks-label">Quick category</div><div class="akeem-picks-grid"></div>';
      const grid=quick.querySelector('.akeem-picks-grid');
      MARKET_CATEGORIES.forEach(([name,icon])=>{
        const b=document.createElement('button');
        b.type='button';
        b.className='akeem-category-pick';
        b.innerHTML=`<span>${icon}</span><span>${name}</span>`;
        b.addEventListener('click',()=>{
          addCanonicalCategories();
          category.value=name;
          category.dispatchEvent(new Event('change',{bubbles:true}));
          grid.querySelectorAll('.akeem-category-pick').forEach(x=>x.classList.remove('active'));
          b.classList.add('active');
        });
        grid.appendChild(b);
      });
      category.parentElement.appendChild(quick);
    }

    const sync=()=>{
      const value=String(category.value||'').toLowerCase();
      document.querySelectorAll('#akeemCategoryQuickPick .akeem-category-pick').forEach(b=>{
        const label=b.textContent.trim().toLowerCase();
        b.classList.toggle('active',label===value || label.replace(/^\S+\s*/,'')===value);
      });
    };
    if(!category.dataset.akeemUpgradeChange){
      category.dataset.akeemUpgradeChange='1';
      category.addEventListener('change',sync);
    }
    sync();
    return true;
  }

  const style=document.createElement('style');
  style.textContent=`
    #addProductPanel .form-section-title{position:relative;display:flex;align-items:center;gap:10px;margin-top:24px;margin-bottom:8px;font-size:12px;font-weight:800;letter-spacing:.08em;text-transform:uppercase;color:var(--text-muted)}
    #addProductPanel .form-section-title:first-child{margin-top:0}
    #addProductPanel .form-section-title::after{content:"";height:1px;flex:1;background:var(--border)}
    #akeemProductCategoryHint{display:flex;align-items:flex-start;gap:9px;margin-top:6px;padding:10px 12px;border:1px solid rgba(102,126,234,.18);background:var(--accent-grad-soft);border-radius:10px;color:var(--text-muted);font-size:11px;line-height:1.45}
    #akeemProductCategoryHint strong{color:var(--text);font-size:11.5px}
    #akeemProductCategoryHint small{font-size:10.5px}
    .akeem-hint-icon{width:20px;height:20px;border-radius:50%;background:var(--success-bg);color:var(--success);display:inline-flex;align-items:center;justify-content:center;font-weight:800;flex-shrink:0}
    #akeemCategoryQuickPick{margin-top:10px}
    .akeem-picks-label{font-size:10px;text-transform:uppercase;letter-spacing:.06em;font-weight:700;color:var(--text-faint);margin-bottom:7px}
    .akeem-picks-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}
    .akeem-category-pick{display:flex;align-items:center;gap:7px;text-align:left;padding:8px 9px;background:var(--surface-2);border:1px solid var(--border);color:var(--text-muted);font-size:10.5px;border-radius:9px;min-width:0}
    .akeem-category-pick span:first-child{font-size:16px;line-height:1}
    .akeem-category-pick span:last-child{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
    .akeem-category-pick:hover{border-color:var(--accent1);color:var(--text);transform:translateY(-1px)}
    .akeem-category-pick.active{border-color:var(--accent1);background:var(--accent-grad-soft);color:var(--accent2);box-shadow:0 0 0 1px rgba(102,126,234,.1)}
    @media(max-width:700px){.akeem-picks-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    @media(max-width:430px){.akeem-picks-grid{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  function start(){
    if(upgradeForm())return;
    setTimeout(start,200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
