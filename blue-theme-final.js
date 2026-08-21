/* Akeem Store FINAL BLUE BRAND LAYER
 * Presentation only. No product/Firebase data is changed. */
(function(){
  'use strict';
  const BLUE='#2563eb', BLUE_DARK='#1d4ed8', BLUE_LIGHT='#3b82f6', PALE='#dbeafe', PALE2='#eff6ff';

  function replaceGreenText(css){
    if(!css) return css;
    return css
      .replace(/#00a86b/gi,BLUE).replace(/#008f5b/gi,BLUE_DARK).replace(/#007a4d/gi,BLUE_DARK)
      .replace(/#006b4a/gi,'#1646a0').replace(/#063b2c/gi,'#0b2454').replace(/#005f42/gi,'#123b86')
      .replace(/#059669/gi,BLUE).replace(/#10B981/gi,BLUE_LIGHT).replace(/#047857/gi,BLUE_DARK)
      .replace(/#F0FDF4/gi,PALE2).replace(/#064E3B/gi,'#1e3a8a').replace(/#A7F3D0/gi,'#93c5fd')
      .replace(/rgba\(0,168,107,/gi,'rgba(37,99,235,').replace(/rgba\(0,143,91,/gi,'rgba(29,78,216,')
      .replace(/rgba\(5,150,105,/gi,'rgba(37,99,235,').replace(/rgba\(16,185,129,/gi,'rgba(59,130,246,')
      .replace(/rgba\(0,95,66,/gi,'rgba(18,59,134,').replace(/#e8f8f1/gi,PALE).replace(/#b7e8d4/gi,'#93c5fd');
  }

  function rewriteStyleTags(){
    document.querySelectorAll('style').forEach(style=>{
      if(style.id==='akeem-final-blue-overrides') return;
      const before=style.textContent||''; const after=replaceGreenText(before);
      if(after!==before) style.textContent=after;
      style.dataset.akeemFinalBlue='1';
    });
  }

  function installStyleInterceptor(){
    if(window.__akeemBlueStyleInterceptor) return;
    window.__akeemBlueStyleInterceptor=true;
    const originalAppendChild=Node.prototype.appendChild;
    Node.prototype.appendChild=function(node){
      if(node && node.tagName==='STYLE' && node.id!=='akeem-final-blue-overrides'){
        try{node.textContent=replaceGreenText(node.textContent||'')}catch(_){ }
      }
      return originalAppendChild.call(this,node);
    };
  }

  function addFinalOverrides(){
    if(document.getElementById('akeem-final-blue-overrides')) return;
    const s=document.createElement('style'); s.id='akeem-final-blue-overrides';
    s.textContent=`
      :root{--primary:${BLUE}!important;--primary-light:${BLUE_LIGHT}!important;--primary-dark:${BLUE_DARK}!important;--success:${BLUE_LIGHT}!important;--light:${PALE2}!important;--card-fg:#1e3a8a!important;--border:#93c5fd!important;--jiji-green:${BLUE}!important;--jiji-green-dark:${BLUE_DARK}!important}
      nav{border-bottom-color:rgba(37,99,235,.3)!important}
      .nav-title,.page-header h1{background:linear-gradient(135deg,${BLUE},#ea580c)!important;-webkit-background-clip:text!important;-webkit-text-fill-color:transparent!important}
      .hamburger{background:${BLUE}!important;box-shadow:0 5px 20px rgba(37,99,235,.28)!important}.mobile-menu{border-left-color:${BLUE}!important}.menu-item:hover{background:${BLUE}!important;color:#fff!important}
      .jiji-nav-search button,.order-btn{background:${BLUE}!important;color:#fff!important;border-color:${BLUE}!important}.jiji-nav-search button:hover,.order-btn:hover{background:${BLUE_DARK}!important}
      .jiji-sell{background:${BLUE}!important;color:#fff!important}.jiji-sell:hover{background:${BLUE_DARK}!important}
      .jiji-hero-card{background:linear-gradient(115deg,#0b2454 0%,#1646a0 58%,${BLUE} 100%)!important;box-shadow:0 14px 34px rgba(37,99,235,.18)!important}.jiji-hero-search button{background:${BLUE}!important;color:#fff!important}.jiji-hero-search button:hover{background:${BLUE_DARK}!important}
      .activity-header,.stat-value,.as-section-kicker,.as-section-title,.as-price,.as-category,.as-accent,.price{color:${BLUE}!important}.activity-item{border-left-color:${BLUE}!important}
      .search-box:focus,.sort-select:focus{border-color:${BLUE}!important;box-shadow:0 0 0 3px rgba(37,99,235,.12)!important}.search-box,.sort-select{border-color:rgba(37,99,235,.38)!important}
      .category-btn:hover,.category-btn.active{background:${BLUE}!important;color:#fff!important;border-color:${BLUE}!important;box-shadow:0 4px 12px rgba(37,99,235,.16)!important}.category-label{background:${PALE}!important;color:${BLUE_DARK}!important}
      .as-btn-primary,.as-chip.active,.as-filter.active,.as-fav-filter.active{background:${BLUE}!important;border-color:${BLUE}!important;color:#fff!important}.as-view-all:hover{background:${BLUE}!important;color:#fff!important}
      .product:hover{border-color:${BLUE}!important;box-shadow:0 16px 40px rgba(37,99,235,.18)!important}.product{border-color:rgba(37,99,235,.18)!important}
      .bg-emerald-50{background:${PALE2}!important}.bg-emerald-100{background:${PALE}!important}.bg-emerald-500,.bg-emerald-600,.bg-emerald-700{background:${BLUE}!important}
      .text-emerald-500,.text-emerald-600,.text-emerald-700,.text-emerald-800{color:${BLUE}!important}.border-emerald-200,.border-emerald-300,.border-emerald-400,.border-emerald-500,.border-emerald-600{border-color:#93c5fd!important}
    `;
    document.head.appendChild(s);
  }

  function forceInlineStyles(){
    document.querySelectorAll('[style]').forEach(el=>{const before=el.getAttribute('style')||'';const after=replaceGreenText(before);if(after!==before)el.setAttribute('style',after)});
  }

  function forceSellerLink(){
    document.querySelectorAll('.jiji-sell').forEach(el=>{el.href='sell.html';el.removeAttribute('target')});
  }

  function run(){
    installStyleInterceptor();rewriteStyleTags();addFinalOverrides();forceInlineStyles();forceSellerLink();
    document.documentElement.classList.add('akeem-blue-final');
    if(document.body){document.body.classList.add('akeem-blue-final');document.body.style.visibility='visible';document.body.style.opacity='1'}
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  [0,30,80,150,300,600,1200,2000].forEach(ms=>setTimeout(run,ms));
  const observer=new MutationObserver(()=>{forceSellerLink();forceInlineStyles()});
  observer.observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['style','href']});
  setTimeout(()=>observer.disconnect(),8000);
})();
