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

  async function loadInfodoseCore() {
    try {
      const res = await fetch('infodose_core_v1.json');
      if (!res.ok) throw new Error(res.statusText);
      const core = await res.json();
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
      // Rebuild overlay mapping based on JSON
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
    } catch (err) {
      console.error('[InfodoseCorePatch] Failed to load core', err);
    }
  }

  document.addEventListener('DOMContentLoaded', loadInfodoseCore);
})();