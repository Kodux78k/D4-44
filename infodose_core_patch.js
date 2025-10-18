/*
 * Infodose Core Patch
 *
 * This script augments Hub UNO by loading archetype metadata from
 * `infodose_core_v1.json`. It updates the archetype selector with the
 * labels defined in the JSON, recalculates overlay colours based on
 * each archetype's primary colour and alpha, and stores default voice
 * preferences into LocalStorage for use by the speech synthesis layer.
 * The patch is designed to run after the main dual_infodose_script has
 * been loaded; it overrides global mappings without modifying the
 * original code directly.
 */

// Immediately invoked function to patch the Hub UNO archetype metadata.
(function(){
  // Convert a HEX colour (3 or 6 characters) into an rgba() string.
  function hexToRgba(hex, alpha) {
    let c = String(hex || '').replace('#', '').trim();
    if (!/^[0-9a-fA-F]{3,6}$/.test(c)) return `rgba(255,255,255,${alpha})`;
    if (c.length === 3) c = c.split('').map(ch => ch + ch).join('');
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }

  // Embedded core metadata (inlined from infodose_core_v1.json)
  const INFO_CORE = {
    "id": "infodose.core.v1",
    "name": "Infodose — Espaço da Mente (12 arquétipos)",
    "version": "1.0.0",
    "type": "orb-pack",
    "archetypes": [
      { "id": "atlas", "label": "Atlas", "colorA": "#ff52e5", "colorB": "#00c5e5", "voice": "Daniel", "icon": "builtin:atlas", "orbOverlay": { "alpha": 0.22, "blend": "multiply" } },
      { "id": "nova", "label": "Nova", "colorA": "#ff78ff", "colorB": "#78fff6", "voice": "Joana", "icon": "builtin:nova", "orbOverlay": { "alpha": 0.22, "blend": "screen" } },
      { "id": "vitalis", "label": "Vitalis", "colorA": "#8cfbff", "colorB": "#74ffbf", "voice": "Eddy", "icon": "builtin:vitalis" },
      { "id": "pulse", "label": "Pulse", "colorA": "#ff4d6d", "colorB": "#ffb38a", "voice": "FrenchMale", "icon": "builtin:pulse" },
      { "id": "artemis", "label": "Artemis", "colorA": "#ffd866", "colorB": "#ff6b6b", "voice": "ItalianMale", "icon": "builtin:artemis" },
      { "id": "serena", "label": "Serena", "colorA": "#7ad7f0", "colorB": "#a4f0d1", "voice": "Rishi", "icon": "builtin:serena" },
      { "id": "kaos", "label": "Kaos", "colorA": "#ff845e", "colorB": "#ffc15e", "voice": "Reed", "icon": "builtin:kaos" },
      { "id": "genus", "label": "Genus", "colorA": "#a48cf2", "colorB": "#6ef3ff", "voice": "Grandpa", "icon": "builtin:genus" },
      { "id": "lumine", "label": "Lumine", "colorA": "#b1ffea", "colorB": "#a48cf2", "voice": "Flo", "icon": "builtin:lumine" },
      { "id": "rhea", "label": "Rhea", "colorA": "#ff9ad5", "colorB": "#7ad7f0", "voice": "Luciana", "icon": "builtin:rhea" },
      { "id": "solus", "label": "Solus", "colorA": "#ffe58a", "colorB": "#b1ffea", "voice": "Moira", "icon": "builtin:solus" },
      { "id": "aion", "label": "Aion", "colorA": "#a0b1ff", "colorB": "#ff9ad5", "voice": "Shelley", "icon": "builtin:aion" }
    ],
    "spaceOfMind": {
      "grid": true,
      "bpm": 72,
      "shaders": ["blue1", "nebula"],
      "sliders": { "particles": 0.6, "bloom": 0.35, "ripple": 0.4 }
    }
  };

  function applyCore(core) {
    if (!core || !Array.isArray(core.archetypes)) return;
    // Update archetype selector options
    const sel = document.getElementById('arch-select');
    if (sel) {
      const current = sel.value;
      sel.innerHTML = '';
      core.archetypes.forEach((arch) => {
        const opt = document.createElement('option');
        opt.value = `./archetypes/${arch.id}.html`;
        opt.textContent = arch.label || arch.id;
        sel.appendChild(opt);
      });
      // Restore previous selection if it exists
      if (current) {
        const match = Array.from(sel.options).find(o => o.value === current);
        if (match) sel.value = current;
      }
    }
    // Rebuild overlay mapping based on core
    const overlays = {};
    core.archetypes.forEach((arch) => {
      const alpha = arch.orbOverlay && typeof arch.orbOverlay.alpha === 'number' ? arch.orbOverlay.alpha : 0.22;
      overlays[arch.id] = hexToRgba(arch.colorA, alpha);
    });
    overlays.default = 'rgba(255,255,255,0.0)';
    // Replace global mapping if present
    window.ARCH_OVERLAYS_PATCHED = overlays;
    // Store voice preferences keyed by capitalised archetype names
    const voicesMap = {};
    core.archetypes.forEach((arch) => {
      const key = arch.id.charAt(0).toUpperCase() + arch.id.slice(1).toLowerCase();
      voicesMap[key] = arch.voice;
    });
    try {
      localStorage.setItem('infodose:voices', JSON.stringify(voicesMap));
    } catch(e) {}
    // Immediately apply overlay for the current selection
    if (typeof window.applyArchOverlay === 'function' && sel) {
      const base = (sel.value || '').replace(/\.html$/i, '');
      window.applyArchOverlay(base);
    }
  }

  document.addEventListener('DOMContentLoaded', () => applyCore(INFO_CORE));
})();