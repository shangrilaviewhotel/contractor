/* Akeem Store blue theme boot layer.
 * Loaded before the Jiji presentation layer so the browser never needs to
 * paint the old green marketplace palette first. It only changes colors. */
(function(){
  'use strict';
  if(document.getElementById('akeem-blue-boot')) return;
  const style=document.createElement('style');
  style.id='akeem-blue-boot';
  style.textContent=`
    :root{
      --primary:#2563eb!important;
      --primary-light:#3b82f6!important;
      --primary-dark:#1d4ed8!important;
      --success:#3b82f6!important;
      --light:#eff6ff!important;
      --card-fg:#1e3a8a!important;
      --border:#93c5fd!important;
      --jiji-green:#2563eb!important;
      --jiji-green-dark:#1d4ed8!important;
    }
    body:before{background:radial-gradient(circle at 20% 50%,rgba(37,99,235,.12),transparent 50%),radial-gradient(circle at 80% 80%,rgba(234,88,12,.1),transparent 50%),radial-gradient(circle at 40% 20%,rgba(59,130,246,.08),transparent 50%)!important}
    body:after{background-image:linear-gradient(0deg,transparent 24%,rgba(37,99,235,.03) 25%,rgba(37,99,235,.03) 26%,transparent 27%,transparent 74%,rgba(37,99,235,.03) 75%,rgba(37,99,235,.03) 76%,transparent 77%),linear-gradient(90deg,transparent 24%,rgba(37,99,235,.03) 25%,rgba(37,99,235,.03) 26%,transparent 27%,transparent 74%,rgba(37,99,235,.03) 75%,rgba(37,99,235,.03) 76%,transparent 77%)!important}
    nav{border-bottom-color:rgba(37,99,235,.3)!important}
    .nav-title{background:linear-gradient(135deg,#2563eb,#ea580c)!important}
    .hamburger{background:linear-gradient(135deg,#2563eb,#ea580c)!important;box-shadow:0 5px 20px rgba(37,99,235,.3)!important}
    .mobile-menu{border-left-color:#2563eb!important}
    .menu-item{border-color:rgba(37,99,235,.3)!important}
    .menu-item:hover{background:linear-gradient(135deg,#2563eb,#ea580c)!important}
    .page-header h1{background:linear-gradient(135deg,#2563eb,#ea580c)!important}
    .activity-feed{border-color:rgba(37,99,235,.4)!important;background:linear-gradient(135deg,rgba(37,99,235,.15),rgba(234,88,12,.1))!important}
    .activity-header,.stat-value{color:#2563eb!important}
    .stats-bar .stat-card{border-color:rgba(37,99,235,.3)!important;background:linear-gradient(135deg,rgba(37,99,235,.1),rgba(234,88,12,.05))!important}
    .search-box,.sort-select{border-color:rgba(37,99,235,.5)!important}
    .search-box:focus{border-color:#2563eb!important;box-shadow:0 5px 20px rgba(37,99,235,.25)!important}
    .category-btn{border-color:rgba(37,99,235,.35)!important}
    .category-btn:hover,.category-btn.active{background:linear-gradient(135deg,#2563eb,#ea580c)!important}
    .product{border-color:rgba(37,99,235,.2)!important;background:linear-gradient(135deg,rgba(255,255,255,.98),rgba(239,246,255,.95))!important}
    .product:hover{box-shadow:0 16px 40px rgba(37,99,235,.2)!important;border-color:#2563eb!important}
    .as-section-kicker,.as-section-title,.as-price,.as-category,.as-accent{color:#2563eb!important}
    .as-chip.active,.as-filter.active,.as-btn-primary{background:#2563eb!important;border-color:#2563eb!important}
    .as-card:hover{border-color:rgba(37,99,235,.45)!important}
    .bg-emerald-50{background-color:#eff6ff!important}.bg-emerald-100{background-color:#dbeafe!important}.bg-emerald-500,.bg-emerald-600,.bg-emerald-700{background-color:#2563eb!important}
    .text-emerald-500,.text-emerald-600,.text-emerald-700,.text-emerald-800{color:#2563eb!important}
    .border-emerald-200,.border-emerald-300,.border-emerald-400,.border-emerald-500,.border-emerald-600{border-color:#93c5fd!important}
    /* Jiji presentation layer */
    .jiji-nav-search button{background:#2563eb!important}.jiji-nav-search button:hover{background:#1d4ed8!important}
    .jiji-sell{background:#f59e0b!important}
    .menu-item:hover{background:#2563eb!important}
    .jiji-hero-card{background:linear-gradient(115deg,#0b2454 0%,#1646a0 58%,#2563eb 100%)!important;box-shadow:0 14px 34px rgba(37,99,235,.18)!important}
    .activity-item{border-left-color:#f59e0b!important}
    .activity-header{color:#2563eb!important}.stat-value{color:#2563eb!important}
    .search-box:focus{border-color:#2563eb!important}
    .category-btn:hover,.category-btn.active{background:#2563eb!important;color:#fff!important;border-color:#2563eb!important;box-shadow:0 4px 12px rgba(37,99,235,.1)!important}
    .product:hover{border-color:#2563eb!important}
    .price{color:#2563eb!important}.category-label{background:#dbeafe!important;color:#1d4ed8!important}.order-btn{background:#2563eb!important}.order-btn:hover{background:#1d4ed8!important}
    .as-view-all:hover{background:#2563eb!important}.as-fav-filter.active{background:#2563eb!important;color:#fff!important}
  `;
  document.head.appendChild(style);
})();
