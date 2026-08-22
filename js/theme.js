// ============================================================
// theme.js — site-wide theme + accent color system.
//
// Persisted in localStorage under "siteTheme" so a choice made on
// one page is still there after clicking to another (that's the
// whole point — it's a per-site preference, not a per-page one).
// Nothing here is tied to who you are, sent anywhere, or read by
// anything but this script. Only ONE appearance state is ever kept —
// picking a preset, or hand-picking colors under "Custom", each just
// overwrite whatever was saved before.
//
// Include this <script> tag in <head>, right after style.css, on
// EVERY page. It must run un-deferred, before the body paints: it
// writes straight onto document.documentElement.style, which beats
// the external stylesheet's :root rules regardless of load order —
// so there's no flash of the default theme before it swaps.
//
// Presets (midnight/dusk/paper) are full hand-tuned palettes. Custom
// only asks for 3 colors — Background, Font, Subfont — and derives
// the rest the same way a preset's designer would: bg-alt/bg-raised
// as lighter (or, on a light background, appropriately shaded)
// flavors of Background, and a faint text color as a further-faded
// flavor of Subfont. Borders derive from Font at low opacity.
// ============================================================

(function () {
  const STORAGE_KEY = 'siteTheme';

  // Every preset now carries its own designated `accent`/`accent2` —
  // switching themes reasserts them, same as it reasserts bg/fg. If
  // the person hand-picks a different accent afterward, that pick
  // simply overwrites the designated one (same "last write wins" rule
  // as everything else here) until the next theme switch restores it.
  const THEMES = {
    midnight: { // the site's current default
      bg: '#10131c', bgAlt: '#171b27', bgRaised: '#1d2230',
      fg: '#edeff5', fgDim: '#9aa1b4', fgFaint: '#656d80',
      line: 'rgba(255,255,255,0.09)', lineBright: 'rgba(255,255,255,0.18)',
      accent: '#75eeac', accent2: '#4a9eff',
    },
    dusk: { // warmer/purpler dark alt
      bg: '#181321', bgAlt: '#211a2c', bgRaised: '#281f36',
      fg: '#f2edf7', fgDim: '#a89bbd', fgFaint: '#6f6382',
      line: 'rgba(255,255,255,0.10)', lineBright: 'rgba(255,255,255,0.20)',
      accent: '#ffb454', accent2: '#c792ea',
    },
    paper: { // light mode
      bg: '#e5f2ff', bgAlt: '#d3e6f7', bgRaised: '#ffffff',
      fg: '#1b1c22', fgDim: '#54586a', fgFaint: '#8a8fa3',
      line: 'rgba(0,0,0,0.10)', lineBright: 'rgba(0,0,0,0.20)',
      accent: '#146c43', accent2: '#1d4ed8',
    },
    sakura: { // cherry-blossom dark — vivid pink over warm maroon/wine, closer to the "Rose" reference screenshot than the old near-black version
      bg: '#2a1620', bgAlt: '#331c28', bgRaised: '#3d2230',
      fg: '#fbebf1', fgDim: '#e3aec8', fgFaint: '#a97690',
      line: 'rgba(255,255,255,0.12)', lineBright: 'rgba(255,255,255,0.22)',
      accent: '#ff4f9c', accent2: '#ffb8d9',
    },
    aurora: { // northern-lights dark — vivid green over a deep forest-black, not the blue-black Midnight already uses, so the two actually read as different themes at a glance
      bg: '#081810', bgAlt: '#0d2318', bgRaised: '#12301f',
      fg: '#eafaf0', fgDim: '#9fd9bb', fgFaint: '#5f9478',
      line: 'rgba(255,255,255,0.09)', lineBright: 'rgba(255,255,255,0.18)',
      accent: '#00e69a', accent2: '#5ee1ff',
    },
    plum: { // deep wine/purple dark
      bg: '#180f1a', bgAlt: '#221527', bgRaised: '#2b1b32',
      fg: '#f2e9f5', fgDim: '#b79ac0', fgFaint: '#7a627f',
      line: 'rgba(255,255,255,0.10)', lineBright: 'rgba(255,255,255,0.20)',
      accent: '#c77dff', accent2: '#ff6f91',
    },
    ember: { // banked-fire dark — warm reds/oranges
      bg: '#180d0a', bgAlt: '#221310', bgRaised: '#2b1815',
      fg: '#fbeae3', fgDim: '#d9a68f', fgFaint: '#8f5c49',
      line: 'rgba(255,255,255,0.10)', lineBright: 'rgba(255,255,255,0.20)',
      accent: '#ff7a45', accent2: '#ffcf56',
    },
    accessible: { // max-contrast — pure black/white, AAA-level accents
      bg: '#000000', bgAlt: '#101010', bgRaised: '#1a1a1a',
      fg: '#ffffff', fgDim: '#d0d0d0', fgFaint: '#9a9a9a',
      line: 'rgba(255,255,255,0.35)', lineBright: 'rgba(255,255,255,0.6)',
      accent: '#ffd400', accent2: '#00e5ff',
    },
  };

  const DEFAULT_ACCENT = '#75eeac';
  const DEFAULT_ACCENT2 = '#4a9eff';
  const DEFAULT_CUSTOM = { bg: '#10131c', fg: '#edeff5', fgDim: '#9aa1b4' };

  // ---- color math -------------------------------------------------

  function hexToRgb(hex) {
    const h = hex.replace('#', '');
    const full = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
    const n = parseInt(full, 16);
    return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
  }
  function mix(hex, targetHex, amt) {
    const a = hexToRgb(hex), b = hexToRgb(targetHex);
    const r = Math.round(a.r + (b.r - a.r) * amt);
    const g = Math.round(a.g + (b.g - a.g) * amt);
    const bl = Math.round(a.b + (b.b - a.b) * amt);
    return `rgb(${r}, ${g}, ${bl})`;
  }
  function rgba(hex, alpha) {
    const { r, g, b } = hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  function rgbTuple(hex) {
    const { r, g, b } = hexToRgb(hex);
    return `${r}, ${g}, ${b}`;
  }
  function luminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // "Lighter flavor" of a background: on a dark bg, alt/raised step up
  // toward white. On a light bg (e.g. a hand-picked pale Custom
  // background), alt steps slightly toward black for separation while
  // raised still reads as the brightest, near-white surface.
  function deriveSurfaces(bgHex) {
    if (luminance(bgHex) < 0.5) {
      return { bgAlt: mix(bgHex, '#ffffff', 0.055), bgRaised: mix(bgHex, '#ffffff', 0.10) };
    }
    return { bgAlt: mix(bgHex, '#000000', 0.06), bgRaised: mix(bgHex, '#ffffff', 0.6) };
  }
  // A further-faded flavor of Subfont, blended toward the background.
  function deriveFaint(fgDimHex, bgHex) {
    return mix(fgDimHex, bgHex, 0.4);
  }
  // Borders as a translucent flavor of Font — works on any bg since
  // it's always the opposite end of the contrast scale.
  function deriveLines(fgHex) {
    return { line: rgba(fgHex, 0.09), lineBright: rgba(fgHex, 0.18) };
  }

  // ---- persistence --------------------------------------------------

  function readState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) || {} : {};
    } catch (err) {
      return {}; // storage blocked (private mode, etc.) — just won't persist
    }
  }
  function writeState(state) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch (err) { /* no-op */ }
  }

  const rootStyle = document.documentElement.style;
  let state = readState();

  // ---- applying to the page ------------------------------------------

  function applyPalette(p) {
    rootStyle.setProperty('--bg', p.bg);
    rootStyle.setProperty('--bg-rgb', rgbTuple(p.bg));
    rootStyle.setProperty('--bg-alt', p.bgAlt);
    rootStyle.setProperty('--bg-raised', p.bgRaised);
    rootStyle.setProperty('--fg', p.fg);
    rootStyle.setProperty('--fg-dim', p.fgDim);
    rootStyle.setProperty('--fg-faint', p.fgFaint);
    rootStyle.setProperty('--line', p.line);
    rootStyle.setProperty('--line-bright', p.lineBright);
  }

  function paletteForPreset(name) {
    return THEMES[name];
  }
  function paletteForCustom(c) {
    const surfaces = deriveSurfaces(c.bg);
    const fgFaint = deriveFaint(c.fgDim, c.bg);
    const lines = deriveLines(c.fg);
    return {
      bg: c.bg, bgAlt: surfaces.bgAlt, bgRaised: surfaces.bgRaised,
      fg: c.fg, fgDim: c.fgDim, fgFaint,
      line: lines.line, lineBright: lines.lineBright,
    };
  }

  function currentPalette() {
    if (state.theme === 'custom') return paletteForCustom(state.custom || DEFAULT_CUSTOM);
    return paletteForPreset(state.theme) || paletteForPreset('midnight');
  }

  function applyTheme() {
    applyPalette(currentPalette());
    document.documentElement.setAttribute('data-theme', state.theme || 'midnight');
  }
  function applyAccent(hex) {
    rootStyle.setProperty('--accent', hex);
    rootStyle.setProperty('--accent-rgb', rgbTuple(hex));
    rootStyle.setProperty('--accent-hover', mix(hex, '#ffffff', 0.25));
    rootStyle.setProperty('--accent-soft', rgba(hex, 0.14));
  }
  function applyAccent2(hex) {
    rootStyle.setProperty('--accent-2', hex);
    rootStyle.setProperty('--accent-2-rgb', rgbTuple(hex));
    rootStyle.setProperty('--accent-2-soft', rgba(hex, 0.14));
  }

  // ---- public setters -------------------------------------------------

  function setTheme(name) {
    state.theme = THEMES[name] ? name : (name === 'custom' ? 'custom' : 'midnight');
    if (state.theme === 'custom') {
      if (!state.custom) {
        // First time landing on Custom — seed it from whatever was
        // showing a moment ago, so it starts as an editable copy
        // rather than jumping to unrelated defaults.
        const prevName = readState().theme;
        const prev = paletteForPreset(prevName) || THEMES.midnight;
        state.custom = { bg: prev.bg, fg: prev.fg, fgDim: prev.fgDim };
      }
      // Custom's accent is left as-is — it's a fully hand-built
      // theme, so there's no "designated" accent to reassert.
    } else {
      // Presets carry their own designated accent pairing. Switching
      // to one reasserts it — overwriting any accent picked by hand
      // earlier — same as it reasserts bg/fg.
      const preset = THEMES[state.theme];
      state.accent = preset.accent;
      state.accent2 = preset.accent2;
    }
    writeState(state);
    applyTheme();
    applyAccent(state.accent || DEFAULT_ACCENT);
    applyAccent2(state.accent2 || DEFAULT_ACCENT2);
  }
  // Editing Background/Font/Subfont always switches to (and stays on)
  // Custom — no separate "enable custom" step.
  function setCustomColor(key, hex) {
    if (state.theme !== 'custom') {
      const seed = paletteForPreset(state.theme) || THEMES.midnight;
      state.custom = { bg: seed.bg, fg: seed.fg, fgDim: seed.fgDim };
    }
    state.theme = 'custom';
    state.custom[key] = hex;
    writeState(state);
    applyTheme();
  }
  function setAccent(hex) {
    state.accent = hex;
    writeState(state);
    applyAccent(hex);
  }
  function setAccent2(hex) {
    state.accent2 = hex;
    writeState(state);
    applyAccent2(hex);
  }
  function reset() {
    state = {};
    setTheme('midnight'); // reasserts midnight's designated accent too, and writes/applies everything
  }

  // Apply whatever's saved (or defaults) immediately, before first paint.
  applyTheme();
  applyAccent(state.accent || DEFAULT_ACCENT);
  applyAccent2(state.accent2 || DEFAULT_ACCENT2);

  window.siteTheme = {
    THEMES,
    DEFAULT_ACCENT,
    DEFAULT_ACCENT2,
    getState: () => ({
      theme: state.theme || 'midnight',
      accent: state.accent || DEFAULT_ACCENT,
      accent2: state.accent2 || DEFAULT_ACCENT2,
      custom: state.theme === 'custom'
        ? (state.custom || DEFAULT_CUSTOM)
        : (() => {
            const p = paletteForPreset(state.theme) || THEMES.midnight;
            return { bg: p.bg, fg: p.fg, fgDim: p.fgDim };
          })(),
    }),
    setTheme,
    setCustomColor,
    setAccent,
    setAccent2,
    reset,
  };
})();