/* Akeem Store — visitor seller upload stability fix.
   Keeps the existing sell.html workflow intact while preventing browser-native
   file-input validation from fighting the custom media queue.
*/
(function(){
  'use strict';
  if(window.__akeemPublicSellerUploadFix)return;
  window.__akeemPublicSellerUploadFix=true;

  function install(){
    const form=document.getElementById('sellForm');
    if(!form){setTimeout(install,100);return;}

    // sell.html keeps selected media in its own JS queue and clears the native
    // file input after every selection. Native `required` validation therefore
    // sees an empty input even though the custom queue contains the files.
    // Disable only browser-native form validation; sell.html performs its own
    // media/contact/category checks before upload.
    form.noValidate=true;
    form.setAttribute('novalidate','novalidate');

    const media=document.getElementById('media');
    if(media){
      media.removeAttribute('required');
      media.setAttribute('aria-required','true');
    }

    // Protect against any later script re-adding required to the media input.
    if(media&&!media.dataset.akeemValidationObserver){
      media.dataset.akeemValidationObserver='1';
      new MutationObserver(()=>{
        if(media.hasAttribute('required'))media.removeAttribute('required');
        media.setAttribute('aria-required','true');
      }).observe(media,{attributes:true,attributeFilter:['required']});
    }
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
