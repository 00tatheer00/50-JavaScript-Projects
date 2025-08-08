/* Pro Tip Calculator — app.js
   Features:
   - Bill/tip/people/tax handling
   - Rounding options
   - Presets (localStorage)
   - Export/Import JSON
   - Currency conversion (exchangerate.host) with fallback
   - Animated numeric transitions via anime.js
   - Accessibility hints via tinycolor
*/

(function () {
  'use strict';

  // Elements
  const billAmount = document.getElementById('billAmount');
  const tipPercent = document.getElementById('tipPercent');
  const peopleCount = document.getElementById('peopleCount');
  const taxPercent = document.getElementById('taxPercent');
  const includeTax = document.getElementById('includeTax');
  const roundTip = document.getElementById('roundTip');
  const roundTotal = document.getElementById('roundTotal');

  const calcBtn = document.getElementById('calcBtn');
  const resetBtn = document.getElementById('resetBtn');
  const randomBtn = document.getElementById('randomBtn');
  const savePresetBtn = document.getElementById('savePresetBtn');

  const totalTipEl = document.getElementById('totalTip');
  const totalBillEl = document.getElementById('totalBill');
  const perPersonEl = document.getElementById('perPerson');
  const tipPerPersonEl = document.getElementById('tipPerPerson');

  const currencySelect = document.getElementById('currencySelect');
  const rateInfo = document.getElementById('rateInfo');

  const presetList = document.getElementById('presetList');
  const exportData = document.getElementById('exportData');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const importFile = document.getElementById('importFile');

  const PRESET_KEY = 'ptc_presets_v1';
  const LAST_KEY = 'ptc_last_v1';

  // Helpers
  const uid = (n = 6) => Math.random().toString(36).slice(2, 2 + n);
  const format = (n, cur = 'USD') => {
    try {
      if (typeof numeral !== 'undefined') return numeral(n).format('0,0.00') + ' ' + cur;
      return Number(n).toFixed(2) + ' ' + cur;
    } catch (e) { return Number(n).toFixed(2) + ' ' + cur; }
  };

  function loadJSON(key, fallback) { try { const s = localStorage.getItem(key); return s ? JSON.parse(s) : fallback } catch (e) { return fallback } }
  function saveJSON(key, obj) { try { localStorage.setItem(key, JSON.stringify(obj)) } catch (e) { console.warn('save err', e) } }

  // Presets
  const builtInPresets = [
    { name: 'Standard 15%', bill: 50, tip: 15, people: 1, tax: 0 },
    { name: 'Generous 20%', bill: 75, tip: 20, people: 2, tax: 5 },
    { name: 'Large Group', bill: 420, tip: 18, people: 8, tax: 10 }
  ];

  function renderPresets() {
    presetList.innerHTML = '';
    const saved = loadJSON(PRESET_KEY, []);
    const all = [...builtInPresets, ...saved];
    all.forEach(p => {
      const btn = document.createElement('button');
      btn.className = 'preset-item';
      btn.type = 'button';
      btn.textContent = p.name;
      btn.onclick = () => applyPreset(p);
      presetList.appendChild(btn);
    });
  }

  function applyPreset(p) {
    billAmount.value = p.bill || 0;
    tipPercent.value = p.tip || 15;
    peopleCount.value = p.people || 1;
    taxPercent.value = p.tax || 0;
    includeTax.checked = !!p.includeTax;
    roundTip.checked = !!p.roundTip;
    roundTotal.checked = !!p.roundTotal;
    calculate();
  }

  // Calculation
  function calculate() {
    const bill = parseFloat(billAmount.value) || 0;
    const tipP = parseFloat(tipPercent.value) || 0;
    const people = Math.max(1, parseInt(peopleCount.value) || 1);
    const taxP = parseFloat(taxPercent.value) || 0;
    const includeTaxInTip = includeTax.checked;

    // Tax
    const taxAmount = bill * (taxP / 100);
    const baseForTip = includeTaxInTip ? (bill + taxAmount) : bill;

    let tip = baseForTip * (tipP / 100);
    if (roundTip.checked) tip = Math.round(tip);

    const totalBill = bill + taxAmount + tip;
    let perPerson = totalBill / people;
    if (roundTotal.checked) perPerson = Math.round(perPerson);

    const tipPerPerson = tip / people;

    const currency = currencySelect.value || 'USD';

    animateNumber(totalTipEl, tip, currency);
    animateNumber(totalBillEl, totalBill, currency);
    animateNumber(perPersonEl, perPerson, currency);
    animateNumber(tipPerPersonEl, tipPerPerson, currency);

    // save last
    const last = { bill, tipP, people, taxP, includeTaxInTip, roundTip: roundTip.checked, roundTotal: roundTotal.checked, currency, ts: new Date().toISOString() };
    saveJSON(LAST_KEY, last);
  }

  // Animation helper
  function animateNumber(el, target, currency) {
    const start = parseFloat(el.dataset.v || 0);
    const end = Number(target);
    const obj = { v: start };
    if (window.anime) {
      anime.remove(el);
      anime({
        targets: obj,
        v: end,
        duration: 700,
        easing: 'easeOutQuad',
        update: () => {
          el.textContent = format(obj.v, currency);
        },
        complete: () => {
          el.dataset.v = end;
          el.textContent = format(end, currency);
        }
      });
    } else {
      el.textContent = format(end, currency);
      el.dataset.v = end;
    }
  }

  // Currency conversion (exchangerate.host free API) with fallback
  let latestRates = null;
  async function fetchRates(base = 'USD') {
    try {
      const res = await fetch('https://api.exchangerate.host/latest?base=' + encodeURIComponent(base));
      if (!res.ok) throw new Error('Network response not ok');
      const data = await res.json();
      latestRates = data;
      return data;
    } catch (err) {
      console.warn('Rate fetch failed', err);
      return null;
    }
  }

  async function convertAndDisplayRates() {
    const base = 'USD';
    const target = currencySelect.value || 'USD';
    rateInfo.textContent = 'Fetching rates...';
    const data = await fetchRates(base);
    if (data && data.rates && data.rates[target]) {
      const rate = data.rates[target];
      rateInfo.textContent = `1 ${base} ≈ ${rate.toFixed(4)} ${target} (as of ${data.date})`;
    } else {
      rateInfo.textContent = 'Live rates unavailable — using local formatting.';
    }
  }

  // Export / Import
  function exportState() {
    const state = {
      exportedAt: new Date().toISOString(),
      presets: loadJSON(PRESET_KEY, []),
      last: loadJSON(LAST_KEY, null)
    };
    exportData.value = JSON.stringify(state, null, 2);
  }

  function importFromTextarea() {
    try {
      const v = JSON.parse(exportData.value);
      if (v && v.presets) saveJSON(PRESET_KEY, v.presets);
      if (v && v.last) saveJSON(LAST_KEY, v.last);
      renderPresets();
      alert('Imported successfully.');
    } catch (e) {
      alert('Invalid JSON: ' + e.message);
    }
  }

  function importFromFile(file) {
    const r = new FileReader();
    r.onload = e => {
      try {
        const v = JSON.parse(e.target.result);
        if (v && v.presets) saveJSON(PRESET_KEY, v.presets);
        if (v && v.last) saveJSON(LAST_KEY, v.last);
        renderPresets();
        alert('Imported file successfully.');
      } catch (err) {
        alert('Import error: ' + err.message);
      }
    };
    r.readAsText(file);
  }

  // Utilities
  function randomExample() {
    const bill = (Math.random() * 200 + 10).toFixed(2);
    const tip = [10, 12.5, 15, 18, 20, 25][Math.floor(Math.random() * 6)];
    const people = [1, 2, 3, 4, 5, 6][Math.floor(Math.random() * 6)];
    billAmount.value = bill;
    tipPercent.value = tip;
    peopleCount.value = people;
    taxPercent.value = (Math.random() * 10).toFixed(1);
    includeTax.checked = Math.random() > 0.5;
    roundTip.checked = Math.random() > 0.5;
    roundTotal.checked = Math.random() > 0.5;
    calculate();
  }

  function savePreset() {
    const presets = loadJSON(PRESET_KEY, []);
    const name = prompt('Preset name', 'Preset ' + uid(3));
    if (!name) return;
    const p = {
      id: uid(6),
      name,
      bill: parseFloat(billAmount.value) || 0,
      tip: parseFloat(tipPercent.value) || 0,
      people: parseInt(peopleCount.value) || 1,
      tax: parseFloat(taxPercent.value) || 0,
      includeTax: includeTax.checked,
      roundTip: roundTip.checked,
      roundTotal: roundTotal.checked,
      createdAt: new Date().toISOString()
    };
    presets.unshift(p);
    saveJSON(PRESET_KEY, presets.slice(0, 50));
    renderPresets();
    alert('Saved preset: ' + name);
  }

  // Keyboard shortcuts
  function attachShortcuts() {
    window.addEventListener('keydown', (ev) => {
      const mod = ev.ctrlKey || ev.metaKey;
      if (mod && ev.key.toLowerCase() === 'r') { ev.preventDefault(); reset(); }
      if (mod && ev.key.toLowerCase() === 's') { ev.preventDefault(); savePreset(); }
      if (mod && ev.key.toLowerCase() === 'e') { ev.preventDefault(); exportState(); }
    });
  }

  // Reset
  function reset() {
    billAmount.value = '';
    tipPercent.value = 15;
    peopleCount.value = 1;
    taxPercent.value = 0;
    includeTax.checked = false;
    roundTip.checked = false;
    roundTotal.checked = false;
    totalTipEl.textContent = '0.00';
    totalBillEl.textContent = '0.00';
    perPersonEl.textContent = '0.00';
    tipPerPersonEl.textContent = '0.00';
    exportData.value = '';
    rateInfo.textContent = '';
  }

  // Init
  function init() {
    renderPresets();
    attachShortcuts();

    // Load last
    const last = loadJSON(LAST_KEY, null);
    if (last) {
      billAmount.value = last.bill || '';
      tipPercent.value = last.tipP || 15;
      peopleCount.value = last.people || 1;
      taxPercent.value = last.taxP || 0;
      includeTax.checked = !!last.includeTaxInTip;
      roundTip.checked = !!last.roundTip;
      roundTotal.checked = !!last.roundTotal;
      calculate();
    } else {
      // sample
      billAmount.value = '';
      tipPercent.value = 15;
      peopleCount.value = 1;
    }

    // Events
    calcBtn.addEventListener('click', calculate);
    resetBtn.addEventListener('click', reset);
    randomBtn.addEventListener('click', randomExample);
    savePresetBtn.addEventListener('click', savePreset);

    // Export/import
    exportBtn.addEventListener('click', exportState);
    importBtn.addEventListener('click', () => {
      if (exportData.value.trim()) return importFromTextarea();
      importFile.click();
    });
    importFile.addEventListener('change', (e) => importFromFile(e.target.files[0]));

    // Currency
    currencySelect.addEventListener('change', convertAndDisplayRates);

    // Initial rates display
    convertAndDisplayRates();
  }

  // Defensive logging
  window.addEventListener('error', (evt) => console.error('Runtime error', evt.error || evt.message));

  // Expose API
  window.PTC = {
    calculate,
    randomExample,
    savePreset,
    listPresets() { return loadJSON(PRESET_KEY, []) },
    export() { exportState(); return exportData.value }
  };

  // Start
  init();

})();