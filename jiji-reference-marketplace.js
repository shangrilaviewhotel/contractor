/* Akeem Store — Jiji-inspired marketplace presentation layer.
 * Visual/layout enhancement only. It reuses the existing search, category,
 * product, Firebase and WhatsApp functionality; it does not create product data.
 */
(function(){
  'use strict';
  if(window.__akeemJijiReferenceLoaded)return;
  const path=window.location.pathname;
  if(!(path.endsWith('/index.html')||path==='/'||path.endsWith('/Contractor-')))return;
  window.__akeemJijiReferenceLoaded=true;

  const css=`
    :root{--jiji-green:#00a86b;--jiji-green-dark:#008f5b;--jiji-orange:#f59e0b;--jiji-ink:#17202a;--jiji-muted:#667085}
    body{background:#f4f6f8!important;color:#17202a!important;background-attachment:scroll!important}
    body:before,body:after,.floating-figures{opacity:0!important;display:none!important}
    nav{position:sticky!important;height:74px!important;background:#fff!important;color:#17202a!important;border-bottom:1px solid #e5e7eb!important;box-shadow:0 2px 12px rgba(16,24,40,.08)!important;padding:0 clamp(14px,4vw,52px)!important;backdrop-filter:none!important;-webkit-backdrop-filter:none!important}
    .nav-title{font-family:'Playfair Display',serif!important;font-size:clamp(21px,2.5vw,28px)!important;background:linear-gradient(135deg,#008f5b,#00a86b)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important;white-space:nowrap}
    .hamburger{width:44px!important;height:44px!important;border-radius:10px!important;background:#008f5b!important;box-shadow:none!important}.hamburger span{margin:3px 0!important}
    .jiji-nav-search{display:flex;align-items:center;flex:1;max-width:620px;margin:0 clamp(12px,3vw,36px);height:46px;border:1px solid #d9dee5;border-radius:9px;background:#f8fafb;overflow:hidden;box-shadow:inset 0 1px 2px rgba(16,24,40,.03)}
    .jiji-nav-search input{flex:1;min-width:0;border:0;outline:0;background:transparent;padding:0 15px;color:#17202a;font:500 14px 'Rubik',sans-serif}.jiji-nav-search button{height:100%;border:0;background:#00a86b;color:#fff;padding:0 22px;font-weight:800;cursor:pointer}.jiji-nav-search button:hover{background:#008f5b}
    .jiji-sell{display:inline-flex;align-items:center;justify-content:center;min-height:44px;padding:0 17px;border-radius:8px;background:#f59e0b;color:#17202a;text-decoration:none;font-size:12px;font-weight:900;margin-left:10px;white-space:nowrap}.jiji-sell:hover{background:#fbbf24;transform:translateY(-1px)}
    .mobile-menu{top:74px!important;background:#fff!important;color:#17202a!important;border-left:1px solid #e5e7eb!important;box-shadow:-10px 0 30px rgba(16,24,40,.12)!important}.menu-item{color:#17202a!important;border-color:#e5e7eb!important;background:#fff!important}.menu-item:hover{color:#fff!important;background:#008f5b!important}
    .page-header{padding:52px 18px 28px!important;text-align:left!important;max-width:1240px!important;margin:auto!important}.page-header h1{font-family:'Playfair Display',serif!important;font-size:clamp(34px,5vw,54px)!important;line-height:1.04!important;color:#17202a!important;background:none!important;-webkit-text-fill-color:initial!important}.page-header p{color:#667085!important;font-size:14px!important;margin:9px 0 0!important}
    .jiji-hero{max-width:1240px;margin:0 auto 26px;padding:0 18px}.jiji-hero-card{background:linear-gradient(115deg,#063b2c 0%,#006b4a 58%,#00a86b 100%);border-radius:18px;padding:28px clamp(18px,4vw,42px);color:#fff;box-shadow:0 14px 34px rgba(0,95,66,.18);position:relative;overflow:hidden}.jiji-hero-card:after{content:'🚗   🚜   🏠   🌍   🚢';position:absolute;right:-10px;bottom:-15px;font-size:64px;opacity:.12;white-space:nowrap;transform:rotate(-5deg)}.jiji-hero-eyebrow{text-transform:uppercase;letter-spacing:1.6px;font-size:10px;font-weight:900;opacity:.8}.jiji-hero-title{font-family:'Playfair Display',serif;font-size:clamp(25px,4vw,40px);margin:4px 0 7px;line-height:1.1}.jiji-hero-sub{font-size:13px;opacity:.82;max-width:670px}.jiji-hero-search{position:relative;z-index:2;display:flex;margin-top:20px;background:#fff;border-radius:10px;overflow:hidden;max-width:760px;box-shadow:0 8px 25px rgba(0,0,0,.18)}.jiji-hero-search input{flex:1;min-width:0;border:0;outline:0;padding:15px;color:#17202a;font:500 14px 'Rubik',sans-serif}.jiji-hero-search button{border:0;background:#f59e0b;color:#17202a;font-weight:900;padding:0 22px;cursor:pointer}.jiji-hero-search button:hover{background:#fbbf24}
    .activity-feed-section{max-width:1240px!important}.activity-feed{background:#fff!important;color:#17202a!important;border:1px solid #e5e7eb!important;box-shadow:0 4px 14px rgba(16,24,40,.05)!important}.activity-header{color:#008f5b!important}.activity-item{background:#f8fafb!important;border-left-color:#00a86b!important}
    .stats-bar{max-width:1240px!important}.stat-card{background:#fff!important;color:#17202a!important;border:1px solid #e5e7eb!important;box-shadow:0 4px 14px rgba(16,24,40,.05)!important}.stat-value{color:#008f5b!important}.stat-label{color:#667085!important}
    .store-controls{max-width:1240px!important;padding:0 18px!important}.search-sort-row{background:#fff!important;border:1px solid #e5e7eb!important;border-radius:10px!important;padding:9px!important;box-shadow:0 4px 16px rgba(16,24,40,.06)!important}.search-box,.sort-select{border:1px solid #d9dee5!important;background:#fff!important;color:#17202a!important;min-height:48px!important;border-radius:8px!important}.search-box:focus{border-color:#00a86b!important;box-shadow:0 0 0 3px rgba(0,168,107,.1)!important}
    .category-wrap{margin-top:18px!important;background:#fff;border:1px solid #e5e7eb;border-radius:14px;padding:17px;box-shadow:0 4px 16px rgba(16,24,40,.05)}.category-wrap:before{content:'Browse by category';display:block;color:#17202a;font-size:17px;font-weight:900;margin:0 0 13px}.category-list{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr));gap:10px!important;overflow:visible!important;padding:0!important}.category-btn{border:1px solid #e2e8f0!important;background:#f8fafb!important;color:#344054!important;border-radius:10px!important;padding:13px 12px!important;min-height:58px!important;white-space:normal!important;text-align:center!important;box-shadow:none!important;transform:none!important}.category-btn:hover,.category-btn.active{background:#e8f8f1!important;color:#007a4d!important;border-color:#00a86b!important;box-shadow:0 4px 12px rgba(0,168,107,.1)!important;transform:translateY(-2px)!important}.filter-row{color:#667085!important}.results-count{color:#667085!important}.clear-btn{color:#b42318!important;background:#fff1f0!important;border-color:#fecdca!important}
    #products{max-width:1280px!important;margin:0 auto!important;display:grid!important;grid-template-columns:repeat(auto-fill,minmax(245px,1fr))!important;align-items:stretch!important;padding:24px 18px 90px!important;gap:18px!important}.product{width:auto!important;min-width:0!important;min-height:0!important;border:1px solid #e4e7ec!important;border-radius:12px!important;background:#fff!important;color:#17202a!important;box-shadow:0 5px 18px rgba(16,24,40,.08)!important;transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease!important}.product:hover{transform:translateY(-5px)!important;box-shadow:0 14px 28px rgba(16,24,40,.14)!important;border-color:#b7e8d4!important}.image-container{height:205px!important;background:#eef2f5!important}.product-img{transition:transform .35s ease!important}.product:hover .product-img{transform:scale(1.035)!important}.product-info{padding:14px!important}.title{font-size:15px!important;color:#17202a!important;line-height:1.35!important}.price{font-size:19px!important;color:#008f5b!important}.category-label{background:#e8f8f1!important;color:#007a4d!important}.desc{font-size:11.5px!important;color:#667085!important}.order-btn{border-radius:8px!important;min-height:40px!important;background:#00a86b!important;box-shadow:none!important}.order-btn:hover{background:#008f5b!important}.product-badge{box-shadow:none!important}
    .as-marketplace{max-width:1280px!important}.as-section{margin:28px 0 36px!important}.as-section-title{font-family:'Playfair Display',serif!important;color:#17202a!important}.as-section-kicker{color:#008f5b!important}.as-section-sub{color:#667085!important}.as-view-all{background:#fff!important;color:#344054!important;border-color:#d9dee5!important}.as-view-all:hover{background:#00a86b!important;color:#fff!important}.as-rail{padding-bottom:10px!important}.as-rail .product{min-height:0!important}
    .as-toolbar{color:#667085!important}.as-fav-filter{color:#344054!important;background:#fff!important;border-color:#d9dee5!important}.as-fav-filter.active{color:#fff!important}
    .contact-popup{right:20px!important;bottom:20px!important}.contact-btn{width:54px!important;height:54px!important;border:2px solid #fff!important}
    @media(max-width:1000px){.category-list{grid-template-columns:repeat(3,minmax(0,1fr))!important}.jiji-nav-search{max-width:none}.jiji-sell{display:none}}
    @media(max-width:700px){nav{height:68px!important}.jiji-nav-search{display:none}.page-header{padding:38px 14px 22px!important}.jiji-hero{padding:0 14px}.jiji-hero-card{padding:22px 18px}.jiji-hero-search{margin-top:16px}.jiji-hero-search button{padding:0 15px}.category-list{grid-template-columns:repeat(2,minmax(0,1fr))!important}.category-wrap{padding:13px}.category-btn{min-height:54px;font-size:11px!important}#products{grid-template-columns:repeat(2,minmax(0,1fr))!important;gap:12px!important;padding-left:12px!important;padding-right:12px!important}.image-container{height:150px!important}.title{font-size:13px!important}.price{font-size:16px!important}.product-info{padding:11px!important}.as-rail{grid-auto-columns:minmax(210px,78vw)!important}}
    @media(max-width:390px){.category-list{grid-template-columns:1fr 1fr!important}#products{grid-template-columns:1fr 1fr!important}.image-container{height:135px!important}.jiji-hero-title{font-size:24px}.jiji-hero-sub{font-size:12px}}
    @media(prefers-reduced-motion:reduce){.product,.category-btn,.jiji-sell{transition:none!important}}
  `;

  function injectStyle(){
    if(document.getElementById('akeem-jiji-reference-style'))return;
    const style=document.createElement('style');
    style.id='akeem-jiji-reference-style';
    style.textContent=css;
    document.head.appendChild(style);
  }

  function wireSearch(input){
    const search=document.getElementById('searchBox');
    if(!search||!input)return;
    input.value=search.value;
    input.addEventListener('input',()=>{
      search.value=input.value;
      search.dispatchEvent(new Event('input',{bubbles:true}));
    });
    input.addEventListener('keydown',e=>{
      if(e.key==='Enter'){
        search.value=input.value;
        search.dispatchEvent(new Event('input',{bubbles:true}));
        search.focus();
      }
    });
  }

  function addNavigation(){
    const nav=document.querySelector('nav');
    const hamburger=document.getElementById('hamburger');
    if(!nav||!hamburger||document.querySelector('.jiji-nav-search'))return;
    const wrap=document.createElement('div');
    wrap.className='jiji-nav-search';
    wrap.innerHTML='<span aria-hidden="true" style="padding-left:14px;font-size:15px">🔍</span><input type="search" aria-label="Search marketplace" placeholder="What are you looking for?" autocomplete="off"><button type="button">Search</button>';
    nav.insertBefore(wrap,hamburger);
    wireSearch(wrap.querySelector('input'));
    const sell=document.createElement('a');
    sell.className='jiji-sell';sell.href='login.html';sell.textContent='SELL';sell.setAttribute('aria-label','Sell a product');
    nav.insertBefore(sell,hamburger);
    wrap.querySelector('button').addEventListener('click',()=>{
      const input=wrap.querySelector('input');
      const search=document.getElementById('searchBox');
      if(search){search.value=input.value;search.dispatchEvent(new Event('input',{bubbles:true}));search.scrollIntoView({behavior:'smooth',block:'center'})}
    });
  }

  function addHero(){
    if(document.querySelector('.jiji-hero'))return;
    const header=document.querySelector('.page-header');
    const controls=document.querySelector('.store-controls');
    if(!header||!controls)return;
    const hero=document.createElement('section');
    hero.className='jiji-hero';
    hero.innerHTML='<div class="jiji-hero-card"><div class="jiji-hero-eyebrow">Akeem Store Marketplace</div><div class="jiji-hero-title">Find what you need. Sell what you have.</div><div class="jiji-hero-sub">Browse cars, tractors, land, houses, hotels, generators, marine assets and heavy equipment from your existing Akeem Store catalogue.</div><div class="jiji-hero-search"><input type="search" aria-label="Search Akeem Store" placeholder="Search cars, tractors, land, houses, generators..." autocomplete="off"><button type="button">Search</button></div></div></section>';
    header.after(hero);
    wireSearch(hero.querySelector('input'));
    hero.querySelector('button').addEventListener('click',()=>{
      const input=hero.querySelector('input');
      const search=document.getElementById('searchBox');
      if(search){search.value=input.value;search.dispatchEvent(new Event('input',{bubbles:true}));controls.scrollIntoView({behavior:'smooth',block:'start'})}
    });
  }

  function decorateCategories(){
    const list=document.getElementById('categoryList');
    if(!list)return;
    list.querySelectorAll('.category-btn').forEach(button=>{
      const text=button.textContent.trim();
      if(button.dataset.jijiDecorated)return;
      button.dataset.jijiDecorated='1';
      const icon=text.match(/^[^A-Za-z0-9]+/)?.[0]||'🛍️';
      const label=text.replace(/^[^A-Za-z0-9]+/,'').trim();
      button.innerHTML='<span style="display:block;font-size:24px;line-height:1.1;margin-bottom:5px">'+icon+'</span><span>'+label+'</span>';
    });
  }

  function start(){
    injectStyle();addNavigation();addHero();decorateCategories();
    const list=document.getElementById('categoryList');
    if(list&&!list.dataset.jijiObserver){
      list.dataset.jijiObserver='1';
      new MutationObserver(()=>decorateCategories()).observe(list,{childList:true});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
  setTimeout(start,500);
  setTimeout(start,1500);
})();
