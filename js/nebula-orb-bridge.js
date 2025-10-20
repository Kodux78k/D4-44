// Nebula ORB Bridge — integra o dashboard (planet:tick / infodose:pico) ao ORB do Hub
(function(){
  function clamp(v, a, b){ return Math.max(a, Math.min(b, v)); }
  function applyEnergyCSS(k){
    const r = document.documentElement;
    r.style.setProperty('--energy', k.toFixed(2));
    // Filter sutil em elementos conhecidos: #particles, .arch-circle overlay, #ARCHORB se existir
    const el = document.getElementById('particles');
    if(el){ el.style.filter = `saturate(${1 + k*0.35}) brightness(${0.95 + k*0.15})`; }
  }

  document.addEventListener('planet:tick', ({detail})=>{
    const e = clamp(detail?.energy ?? 0.3, 0, 1);
    applyEnergyCSS(e);
    // Se o ORB WebGL expõe API, use:
    if(window.__orbGL__ && typeof window.__orbGL__.setActive === 'function'){
      window.__orbGL__.setActive(e > 0.12); // liga/desliga brilho interno
    }
  });

  document.addEventListener('infodose:pico', ({detail})=>{
    // Pulso visual do ORB principal ao detectar pico simbólico
    if(window.__orbGL__ && typeof window.__orbGL__.pulse === 'function'){
      try{ window.__orbGL__.pulse(); }catch(e){}
    }
    // Opcional: realçar barra/topo por poucos ms
    const mast = document.querySelector('header.mast');
    if(mast){
      mast.style.transition='filter 1.2s ease';
      mast.style.filter='saturate(1.2) brightness(1.06)';
      setTimeout(()=>{ mast.style.filter='none'; }, 1200);
    }
  });
})();