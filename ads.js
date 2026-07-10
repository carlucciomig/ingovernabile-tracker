/* ============================================================
   RENDER SPAZI PUBBLICITARI — non serve modificare questo file,
   tutti i parametri sono in ads-config.js
   ============================================================ */
(function(){
  function renderAdSlot(containerId, cfg, sizeLabel){
    const el = document.getElementById(containerId);
    if(!el) return;

    if(cfg && cfg.imageUrl){
      el.innerHTML =
        '<div class="ad-label">Pubblicità</div>' +
        '<a class="ad-link" href="' + (cfg.link || '#') + '" target="_blank" rel="noopener sponsored">' +
        '<img src="' + cfg.imageUrl + '" alt="' + (cfg.alt || 'Sponsor') + '" loading="lazy">' +
        '</a>';
      el.classList.add('filled');
      el.style.display = "";
    } else if(typeof DEBUG_ADS !== "undefined" && DEBUG_ADS){
      el.innerHTML =
        '<div class="ad-placeholder">Spazio ' + sizeLabel + '<br><small>configura in ads-config.js</small></div>';
      el.style.display = "";
    } else {
      el.style.display = "none";
    }
  }

  document.addEventListener('DOMContentLoaded', function(){
    if(typeof ADS === "undefined") return;
    renderAdSlot('adBannerSlot', ADS.banner, '728×90');
    renderAdSlot('adSquareSlot', ADS.square, '300×250');
  });
})();
