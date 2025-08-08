/* Pro Background Switcher — app.js
   Features:
   - Solid / Gradient / Image / Animated Gradient
   - Save / Load favorites (localStorage)
   - Export / Import JSON
   - Randomize, keyboard shortcuts, accessibility contrast check
   - Uses tinycolor2 & chroma.js via CDN
*/

(function(){
  'use strict';

  // Elements
  const modeEl = document.getElementById('mode');
  const colorAEl = document.getElementById('colorA');
  const colorBEl = document.getElementById('colorB');
  const angleEl = document.getElementById('angle');
  const gtypeEl = document.getElementById('gtype');
  const animSpeedEl = document.getElementById('animSpeed');
  const bgImageUrl = document.getElementById('bgImageUrl');
  const applyBtn = document.getElementById('applyBtn');
  const randomBtn = document.getElementById('randomBtn');
  const saveBtn = document.getElementById('saveBtn');
  const preview = document.getElementById('preview');
  const presetList = document.getElementById('presetList');
  const exportData = document.getElementById('exportData');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');
  const highContrastToggle = document.getElementById('highContrastToggle');
  const labelColorB = document.getElementById('label-colorB');
  const labelAngle = document.getElementById('label-angle');
  const labelType = document.getElementById('label-type');
  const labelSpeed = document.getElementById('label-speed');
  const presetKey = 'pbs_presets_v1';
  const favKey = 'pbs_favs_v1';

  // Utilities
  const uid = (n=6)=>Math.random().toString(36).slice(2,2+n);
  const clamp = (v,a,b)=>Math.max(a,Math.min(b,v));

  // Default presets (hand-crafted)
  const builtInPresets = [
    {name:'Dawn', mode:'gradient', colors:['#FF8A00','#E52E71'], angle:20, type:'linear'},
    {name:'Oceanic', mode:'gradient', colors:['#1e3c72','#2a5298'], angle:135, type:'linear'},
    {name:'Aurora', mode:'animated', colors:['#00F5A0','#00BBFF','#7B2FF7'], angle:60, type:'conic'},
    {name:'Paper', mode:'solid', colors:['#f5f7fa']},
    {name:'Slate', mode:'solid', colors:['#0f1724']},
  ];

  // Load saved favorites
  function loadJSON(key, fallback){ try{ const s=localStorage.getItem(key); return s?JSON.parse(s):fallback }catch(e){return fallback} }

  function saveJSON(key,obj){ try{ localStorage.setItem(key, JSON.stringify(obj)) }catch(e){ console.warn('save err',e) } }

  // Contrast checker (WCAG)
  function contrastText(bgColor){
    try{
      const tc = tinycolor(bgColor);
      const whiteContrast = tinycolor.readability(tc, '#ffffff');
      const blackContrast = tinycolor.readability(tc, '#000000');
      return {best: whiteContrast>blackContrast? '#ffffff':'#000000', white: whiteContrast, black: blackContrast};
    }catch(e){
      return {best:'#000000', white:21, black:21};
    }
  }

  // Render functions
  function renderPreview(config){
    // Clear any animation
    preview.style.transition = 'background 600ms ease';

    if(config.mode === 'solid'){
      preview.style.backgroundImage = '';
      preview.style.background = config.colors[0];
      preview.style.backgroundSize = 'cover';
    }else if(config.mode === 'image'){
      preview.style.background = '';
      const url = config.image || '';
      preview.style.backgroundImage = url? `url("${url}")` : '';
      preview.style.backgroundSize = 'cover';
      preview.style.backgroundPosition = 'center center';
      preview.style.backgroundRepeat = 'no-repeat';
    }else if(config.mode === 'gradient'){
      const type = config.type || 'linear';
      const angle = config.angle || 0;
      const stops = config.colors.join(', ');
      if(type === 'linear'){
        preview.style.background = `linear-gradient(${angle}deg, ${stops})`;
      }else if(type === 'radial'){
        preview.style.background = `radial-gradient(circle, ${stops})`;
      }else if(type === 'conic'){
        preview.style.background = `conic-gradient(from ${angle}deg, ${stops})`;
      }
      preview.style.backgroundSize = 'cover';
    }else if(config.mode === 'animated'){
      // Create animated CSS gradient using anime.js to shift hue.
      // We'll generate a linear gradient and animate via background-position and filter.
      const gtype = config.type || 'linear';
      const base = config.colors.join(', ');
      preview.style.background = gtype === 'linear' ? `linear-gradient(${config.angle}deg, ${base})` : `conic-gradient(from ${config.angle}deg, ${base})`;
      preview.style.backgroundSize = '200% 200%';
      // Use anime to animate backgroundPosition
      if(window._pbsAnimation) window._pbsAnimation.pause();
      window._pbsAnimation = anime({
        targets: preview,
        backgroundPosition: ['0% 50%','100% 50%'],
        easing: 'linear',
        duration: (11 - clamp(config.animSpeed||4,1,10)) * 2000,
        direction: 'alternate',
        loop: true
      });
    }

    // Update contrast info
    const primary = config.colors && config.colors[0] ? config.colors[0] : '#ffffff';
    const contrast = contrastText(primary);
    const info = `Primary: ${primary} — pick ${contrast.best} for text (white:${Math.round(contrast.white*10)/10}, black:${Math.round(contrast.black*10)/10})`;
    document.getElementById('contrastInfo').textContent = info;
  }

  // Build config from UI
  function buildConfigFromUI(){
    const mode = modeEl.value;
    const config = {id: uid(), mode};
    config.colors = [colorAEl.value];
    if(mode === 'gradient' || mode === 'animated'){
      config.colors.push(colorBEl.value);
      // include any extra colours if specified in animated (we keep only two for the UI)
      config.angle = Number(angleEl.value) || 0;
      config.type = gtypeEl.value;
      if(mode === 'animated') config.animSpeed = Number(animSpeedEl.value) || 4;
    }
    if(mode === 'image'){
      config.image = bgImageUrl.value || '';
    }
    return config;
  }

  // Apply config and persist current
  function applyFromUI(){
    const cfg = buildConfigFromUI();
    window._pbsCurrent = cfg;
    renderPreview(cfg);
    // persist as last-used
    saveJSON('pbs_last', cfg);
  }

  // Random generator
  function randomColor(){
    // use chroma to create pleasant random colors
    const c1 = chroma.random().saturate(1.2).brighten(0.4).hex();
    const c2 = chroma(c1).set('hsl.h', '+60').hex();
    return [c1, c2];
  }
  function randomize(){
    const [a,b] = randomColor();
    colorAEl.value = a;
    colorBEl.value = b;
    angleEl.value = Math.floor(Math.random()*360);
    gtypeEl.value = ['linear','radial','conic'][Math.floor(Math.random()*3)];
    modeEl.value = ['gradient','solid','animated'][Math.floor(Math.random()*3)];
    if(modeEl.value==='solid') labelColorB.classList.add('hidden'); else labelColorB.classList.remove('hidden');
    applyFromUI();
  }

  // Presets UI
  function renderPresets(){
    presetList.innerHTML = '';
    const saved = loadJSON(presetKey, []);
    const merged = [...builtInPresets, ...saved];
    merged.forEach(p=>{
      const btn = document.createElement('button');
      btn.className = 'preset-item';
      btn.textContent = p.name;
      btn.type = 'button';
      btn.onclick = ()=> {
        // apply preset
        if(p.mode) modeEl.value = p.mode;
        colorAEl.value = p.colors[0] || '#ffffff';
        colorBEl.value = p.colors[1] || colorAEl.value;
        angleEl.value = p.angle || 0;
        gtypeEl.value = p.type || 'linear';
        if(modeEl.value==='solid') labelColorB.classList.add('hidden'); else labelColorB.classList.remove('hidden');
        if(p.image) bgImageUrl.value = p.image;
        applyFromUI();
      };
      presetList.appendChild(btn);
    });
  }

  // Favorites
  function saveFavorite(){
    const favs = loadJSON(favKey, []);
    const cfg = window._pbsCurrent || buildConfigFromUI();
    cfg.name = prompt('Name this favorite', cfg.name || 'My Favorite') || ('fav-' + uid(4));
    favs.unshift(cfg);
    saveJSON(favKey, favs.slice(0,50)); // keep top 50
    alert('Saved favorite: ' + cfg.name);
  }

  // Export / Import
  function exportFavorites(){
    const favs = loadJSON(favKey, []);
    const last = loadJSON('pbs_last', null);
    const payload = {exportedAt: new Date().toISOString(), last, favs};
    exportData.value = JSON.stringify(payload, null, 2);
  }

  function importFromTextarea(){
    try{
      const v = JSON.parse(exportData.value);
      if(v && v.favs) saveJSON(favKey, v.favs);
      if(v && v.last) saveJSON('pbs_last', v.last);
      renderPresets();
      alert('Imported successfully.');
    }catch(e){
      alert('Invalid JSON: ' + e.message);
    }
  }

  function importFromFile(file){
    const r = new FileReader();
    r.onload = e=>{
      try{
        const v = JSON.parse(e.target.result);
        if(v && v.favs) saveJSON(favKey, v.favs);
        if(v && v.last) saveJSON('pbs_last', v.last);
        renderPresets();
        alert('Imported file successfully.');
      }catch(err){
        alert('Import error: ' + err.message);
      }
    };
    r.readAsText(file);
  }

  // Keyboard shortcuts
  function attachShortcuts(){
    window.addEventListener('keydown', (ev)=>{
      const mod = ev.ctrlKey || ev.metaKey;
      if(mod && ev.key.toLowerCase()==='r'){ ev.preventDefault(); randomize(); }
      if(mod && ev.key.toLowerCase()==='s'){ ev.preventDefault(); saveFavorite(); }
      if(mod && ev.key.toLowerCase()==='e'){ ev.preventDefault(); exportFavorites(); }
    });
  }

  // UI helpers
  modeEl.addEventListener('change', ()=>{
    const m = modeEl.value;
    labelColorB.classList.toggle('hidden', m === 'solid' || m === 'image');
    labelAngle.classList.toggle('hidden', m === 'solid' || m === 'image');
    labelType.classList.toggle('hidden', m === 'solid' || m === 'image');
    labelSpeed.classList.toggle('hidden', m !== 'animated');
  });

  applyBtn.addEventListener('click', ()=> applyFromUI());
  randomBtn.addEventListener('click', ()=> randomize());
  saveBtn.addEventListener('click', ()=> saveFavorite());
  exportBtn.addEventListener('click', ()=> exportFavorites());
  importBtn.addEventListener('click', ()=> {
    if(exportData.value.trim()) return importFromTextarea();
    importFile.click();
  });
  importFile.addEventListener('change', (e)=> importFromFile(e.target.files[0]));

  highContrastToggle.addEventListener('change', (e)=>{
    if(e.target.checked){
      preview.style.filter = 'contrast(140%) saturate(120%)';
    }else preview.style.filter = '';
  });

  // Load last
  function init(){
    renderPresets();
    attachShortcuts();
    const last = loadJSON('pbs_last', null);
    if(last){
      // apply last
      if(last.mode) modeEl.value = last.mode;
      colorAEl.value = last.colors && last.colors[0] ? last.colors[0] : '#ffffff';
      colorBEl.value = last.colors && last.colors[1] ? last.colors[1] : colorAEl.value;
      angleEl.value = last.angle || 0;
      gtypeEl.value = last.type || 'linear';
      bgImageUrl.value = last.image || '';
      labelColorB.classList.toggle('hidden', last.mode === 'solid' || last.mode === 'image');
      renderPreview(last);
      window._pbsCurrent = last;
    }else{
      // first run
      randomize();
    }
  }

  // Defensive: log uncaught errors
  window.addEventListener('error', (evt)=> {
    console.error('Runtime error', evt.error || evt.message);
  });

  // Initialize
  init();

  // expose a compact API for power users (console)
  window.PBS = {
    apply(cfg){ window._pbsCurrent = cfg; renderPreview(cfg); saveJSON('pbs_last', cfg); },
    random: randomize,
    saveFav: saveFavorite,
    listFavs(){ return loadJSON(favKey,[]) },
    export(){ exportFavorites(); return exportData.value }
  };

})();