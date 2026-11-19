/* Adds Product Automation to the existing Akeem Store admin sidebar. */
(function(){
 'use strict';
 if(!/admindashboard\.html$/i.test(location.pathname))return;
 const nav=document.querySelector('.sidebar-nav');
 if(!nav||document.getElementById('akeemProductAutomationNav'))return;
 const label=document.createElement('div');label.className='nav-section-label';label.textContent='Marketing';
 const link=document.createElement('a');link.id='akeemProductAutomationNav';link.className='nav-item';link.href='./product-automation.html';
 link.textContent='✦ Product Automation';
 nav.append(label,link);
})();