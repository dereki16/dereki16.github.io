// ============================================================
// hero-window.js — makes the hero's floating "code" panel a real
// little window: draggable from anywhere on it (not just the
// titlebar), with working macOS-style traffic-light buttons (red =
// close, yellow = minimize, green = maximize), and a code display
// that shows the *actual* handler code for whatever you just did to
// it (drag it → drag.js with the real onPointerMove handler, etc.).
//
// When idle, it no longer shows unrelated site snippets — it rotates
// through the mountain's own live settings (sun, ambient, face
// color, wireframe glow), reading straight from
// window.heroTerrainAPI.state so the numbers on screen are always
// the real current values, not placeholders. Each snippet ends with
// `regenerate_mesh: true;`, and the terrain actually reshapes right
// as that line finishes typing.
//
// A "$ enable_ui" button at the bottom swaps the whole thing into a
// live control panel — the same knobs, but as real sliders/color
// pickers instead of typed text, wired directly to
// window.heroTerrainAPI. Clicking it also enlarges the window, same
// as the green dot.
// ============================================================

(function () {
  const panel = document.getElementById('heroCodeWindow');
  const titlebar = document.getElementById('heroTitlebar');
  const bodyEl = document.querySelector('.hero-code-body');
  const codeEl = document.getElementById('heroCode');
  const fileEl = document.getElementById('heroCodeFile');
  const restoreBtn = document.getElementById('heroRestoreBtn');
  if (!panel || !titlebar || !bodyEl || !codeEl || !fileEl) return;

  const closeBtn = titlebar.querySelector('.win-close');
  const minBtn = titlebar.querySelector('.win-min');
  const maxBtn = titlebar.querySelector('.win-max');

  const api = window.heroTerrainAPI || null;

  // -------------------------------------------------------------
  // Typewriter engine — one shared typer so idle snippets and
  // action snippets never fight over the panel. Action snippets
  // interrupt whatever's typing, play once, then idle resumes.
  // -------------------------------------------------------------
  let typeTimer = null;
  let resumeTimer = null;

  function stopTyping() {
    clearInterval(typeTimer);
    clearTimeout(resumeTimer);
  }

  function typeSnippet(file, code, { onTypeComplete, onDone, holdMs = 2400 } = {}) {
    stopTyping();
    fileEl.textContent = file;
    codeEl.textContent = '';
    let i = 0;
    typeTimer = setInterval(() => {
      codeEl.textContent = code.slice(0, i);
      i++;
      if (i > code.length) {
        clearInterval(typeTimer);
        if (onTypeComplete) onTypeComplete();
        if (onDone) resumeTimer = setTimeout(onDone, holdMs);
      }
    }, 22);
  }

  // -------------------------------------------------------------
  // Idle loop — rotates through the mountain's own live state. Each
  // snippet reads window.heroTerrainAPI.state fresh every time it's
  // built, so if you've adjusted anything (via Enable UI, or it's
  // simply mid-transition), the panel shows what's actually true
  // right now. Every snippet ends with regenerate_mesh: true — and
  // the terrain really does reshape the instant that line lands.
  // -------------------------------------------------------------
  function round(v, d = 2) {
    const f = Math.pow(10, d);
    return Math.round(v * f) / f;
  }

  // How long each look eases in/out over — long enough to read as a
  // transition, short enough it doesn't feel sluggish against the
  // ~3.2s hold that follows it.
  const TWEEN_MS = 900;

  const idleSnippetBuilders = api ? [
    () => {
      // Alternates a bright warm overhead sun with a dim, low, cool
      // one — sunIntensity/elevation/color all swing together so the
      // difference is unmistakable.
      const cycle = Math.floor(idleIndex / idleSnippetBuilders.length);
      const variant = cycle % 2 === 0
        ? { sunIntensity: 3.4, sunElevation: 66, sunColor: '#fff2cf' }
        : { sunIntensity: 0.35, sunElevation: 6, sunColor: '#7fa8ff' };
      return {
        file: 'sun.js',
        code: `sun.color = '${variant.sunColor}';\nsun.intensity = ${variant.sunIntensity};\nsun.elevation = ${variant.sunElevation}; // deg\nregenerate_mesh: true;`,
        look: variant,
        holdMs: 3200,
      };
    },
    () => {
      // Same idea for ambient fill — swings between a lifted, visibly
      // blue-tinted fill and near-zero (shadowed facets going flat
      // black) so the change is obvious rather than a faint nudge.
      const cycle = Math.floor(idleIndex / idleSnippetBuilders.length);
      const variant = cycle % 2 === 0
        ? { ambientIntensity: 1.5, ambientColor: '#3a5fa8' }
        : { ambientIntensity: 0, ambientColor: '#0b1220' };
      return {
        file: 'ambient.js',
        code: `ambient.color = '${variant.ambientColor}';\nambient.intensity = ${variant.ambientIntensity};\n// fills in shadowed facets so they\n// don't drop to pure black\nregenerate_mesh: true;`,
        look: variant,
        holdMs: 3200,
      };
    },
    () => {
      const s = api.state;
      // Alternates green/red across full rotations of the idle loop —
      // the face-color "look" swings noticeably further from default
      // than a subtle nudge would, so it plainly reads as a change.
      const cycle = Math.floor(idleIndex / idleSnippetBuilders.length);
      const altColor = cycle % 2 === 0 ? '#47ff7e' /* rgb(71,255,126) */ : '#ff475a';
      return {
        file: 'faces.js',
        code: `face.near = '${altColor}';\nface.far = '${s.farFaceColor}';\nface.opacity = ${round(s.faceOpacity)};\n// gradient by depth, per vertex\nregenerate_mesh: true;`,
        look: { nearFaceColor: altColor },
        holdMs: 3200,
      };
    },
    () => {
      const s = api.state;
      return {
        file: 'wireframe.js',
        code: `edge.near = '${s.nearEdgeColor}';\nedge.far = '${s.farEdgeColor}';\nedge.opacity = 0.15;\nregenerate_mesh: true;`,
        look: { edgeOpacity: 0.15 },
        holdMs: 3200,
      };
    },
    () => {
      // Peaks flare to full brightness boost with a white highlight,
      // then ease back to the subtle default.
      return {
        file: 'peaks.js',
        code: `peak.boost = 1;\npeak.highlight = '#ffffff';\n// concentrated at the tallest ridges\nregenerate_mesh: true;`,
        look: { peakBoost: 1, peakHighlightColor: '#ffffff' },
        holdMs: 3200,
      };
    },
    () => {
      return {
        file: 'terrain.js',
        code: `ridge.amplitude = 0.75;\nmesh.density = 0.6;\n// flatter, sparser pass — then back\n// to the usual shape next file\nregenerate_mesh: true;`,
        look: { ridgeAmp: 0.75, meshDetail: 0.6 },
        holdMs: 3200,
      };
    },
  ] : [
    () => ({
      file: 'sun.js',
      code: `sun.color = '#cfe3ff';\nsun.intensity = 1.35;\nsun.elevation = 42; // deg\nregenerate_mesh: true;`,
    }),
    () => ({
      file: 'faces.js',
      code: `far.face.color = '#1b2c4d';\nnear.face.color = '#274a7d';\nregenerate_mesh: true;`,
    }),
  ];

  let idleIndex = 0;
  let idleActive = true;
  let activeLookKeys = null;

  function playIdle() {
    if (!idleActive) return;
    const snippet = idleSnippetBuilders[idleIndex % idleSnippetBuilders.length]();
    typeSnippet(snippet.file, snippet.code, {
      holdMs: snippet.holdMs,
      onTypeComplete: () => {
        if (window.reshapeTerrain) window.reshapeTerrain();
        if (snippet.look && api) {
          api.setLook(snippet.look, TWEEN_MS);
          activeLookKeys = Object.keys(snippet.look);
        }
      },
      onDone: () => {
        if (activeLookKeys && api) {
          api.resetLook(activeLookKeys, TWEEN_MS); // eases back to default before the next file, so looks never mix
          activeLookKeys = null;
        }
        idleIndex++;
        playIdle();
      },
    });
  }

  // -------------------------------------------------------------
  // Action snippets — the real code behind each window control,
  // shown the moment that control actually fires. Skipped while the
  // live UI panel is open (see enableUi below) since the code area
  // isn't on screen then.
  // -------------------------------------------------------------
  const actionSnippets = {
    drag: {
      file: 'drag.js',
      code: `function onPointerMove(e) {\n  dx = clamp(e.clientX - startX);\n  dy = clamp(e.clientY - startY);\n  panel.style.transform =\n    \`translate(\${dx}px, \${dy}px)\`;\n}`,
    },
    minimize: {
      file: 'minimize.js',
      code: `minBtn.addEventListener('click', () => {\n  panel.classList.toggle('is-minimized');\n});`,
    },
    maximize: {
      file: 'maximize.js',
      code: `maxBtn.addEventListener('click', () => {\n  panel.classList.toggle('is-maximized');\n});`,
    },
    close: {
      file: 'close.js',
      code: `closeBtn.addEventListener('click', () => {\n  panel.classList.add('is-closed');\n  restoreBtn.hidden = false;\n});`,
    },
    restore: {
      file: 'restore.js',
      code: `restoreBtn.addEventListener('click', () => {\n  panel.classList.remove('is-closed');\n  restoreBtn.hidden = true;\n});`,
    },
  };

  function playAction(key, holdMs = 2600) {
    if (uiModeActive) return; // code area isn't visible right now
    idleActive = false;
    const snippet = actionSnippets[key];
    typeSnippet(snippet.file, snippet.code, {
      holdMs,
      onDone: () => {
        idleActive = true;
        playIdle();
      },
    });
  }

  // -------------------------------------------------------------
  // Dragging — pointer events cover mouse + touch/pen in one API.
  // Draggable from anywhere on the panel (body included), not just
  // the titlebar. The panel keeps its normal document-flow slot;
  // dragging just offsets it visually via transform, so nothing
  // reflows.
  // -------------------------------------------------------------
  let dragging = false;
  let startX = 0, startY = 0, originX = 0, originY = 0;
  let hasDraggedThisSession = false;

  function currentOffset() {
    const t = panel.style.transform;
    const m = /translate\(([-\d.]+)px,\s*([-\d.]+)px\)/.exec(t || '');
    return m ? { x: parseFloat(m[1]), y: parseFloat(m[2]) } : { x: 0, y: 0 };
  }

  function clampOffset(x, y) {
    const hero = document.getElementById('home');
    if (!hero) return { x, y };
    const heroRect = hero.getBoundingClientRect();
    const panelRect = panel.getBoundingClientRect();
    // Generous bounds — keep at least a corner of the titlebar on screen.
    const minX = heroRect.left - panelRect.left + x - panelRect.width * 0.7;
    const maxX = heroRect.right - panelRect.left + x + panelRect.width * 0.2;
    const minY = heroRect.top - panelRect.top + y - panelRect.height * 0.5;
    const maxY = heroRect.bottom - panelRect.top + y - panelRect.height * 0.3;
    return {
      x: Math.min(Math.max(x, minX), maxX),
      y: Math.min(Math.max(y, minY), maxY),
    };
  }

  panel.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.win-dot')) return; // buttons handle their own clicks
    if (e.target.closest('.hero-code-ui') || e.target.closest('.hero-code-footer')) return; // let controls receive clicks
    if (panel.classList.contains('is-closed')) return;
    dragging = true;
    panel.setPointerCapture(e.pointerId);
    panel.classList.add('is-dragging');
    startX = e.clientX;
    startY = e.clientY;
    const origin = currentOffset();
    originX = origin.x;
    originY = origin.y;
  });

  panel.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    const { x, y } = clampOffset(originX + (e.clientX - startX), originY + (e.clientY - startY));
    panel.style.transform = `translate(${x}px, ${y}px)`;
    if (!hasDraggedThisSession) {
      hasDraggedThisSession = true;
      playAction('drag');
    }
  });

  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    panel.classList.remove('is-dragging');
    try { panel.releasePointerCapture(e.pointerId); } catch (err) { /* no-op */ }
  }
  panel.addEventListener('pointerup', endDrag);
  panel.addEventListener('pointercancel', endDrag);

  // -------------------------------------------------------------
  // Traffic-light buttons
  // -------------------------------------------------------------
  function onDotActivate(el, handler) {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      handler();
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        e.stopPropagation();
        handler();
      }
    });
  }

  if (closeBtn) {
    onDotActivate(closeBtn, () => {
      panel.classList.add('is-closed');
      if (restoreBtn) restoreBtn.hidden = false;
      playAction('close');
    });
  }

  if (minBtn) {
    onDotActivate(minBtn, () => {
      panel.classList.remove('is-maximized');
      panel.classList.toggle('is-minimized');
      playAction('minimize');
    });
  }

  if (maxBtn) {
    onDotActivate(maxBtn, () => {
      panel.classList.remove('is-minimized');
      panel.classList.toggle('is-maximized');
      playAction('maximize');
    });
  }

  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      panel.classList.remove('is-closed');
      restoreBtn.hidden = true;
      playAction('restore');
    });
  }

  // -------------------------------------------------------------
  // "$ enable_ui" — swaps the typewriter for real sliders wired to
  // window.heroTerrainAPI. Only built if the 3D scene actually
  // initialized (WebGL can fail; no API, no panel to show).
  // -------------------------------------------------------------
  let uiModeActive = false;

  function buildUiPanel(container) {
    function heading(text) {
      const h = document.createElement('h5');
      h.textContent = text;
      container.appendChild(h);
    }
    function slider(labelText, min, max, step, value, onChange) {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'range';
      input.min = min; input.max = max; input.step = step; input.value = value;
      const val = document.createElement('span');
      val.className = 'val';
      val.textContent = value;
      input.addEventListener('input', () => {
        val.textContent = input.value;
        onChange(parseFloat(input.value));
      });
      label.appendChild(span);
      label.appendChild(input);
      label.appendChild(val);
      container.appendChild(label);
    }
    function color(labelText, value, onChange) {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'color';
      input.value = value;
      input.addEventListener('input', () => onChange(input.value));
      label.appendChild(span);
      label.appendChild(input);
      container.appendChild(label);
    }
    function toggle(labelText, checked, onChange) {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = labelText;
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = checked;
      input.addEventListener('change', () => onChange(input.checked));
      label.appendChild(span);
      label.appendChild(input);
      container.appendChild(label);
    }
    function button(text, onClick) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = text;
      btn.addEventListener('click', onClick);
      container.appendChild(btn);
    }
    function select(labelText, options, value, onChange) {
      const label = document.createElement('label');
      const span = document.createElement('span');
      span.textContent = labelText;
      const input = document.createElement('select');
      options.forEach(opt => {
        const o = document.createElement('option');
        o.value = opt.value;
        o.textContent = opt.label;
        if (opt.value === value) o.selected = true;
        input.appendChild(o);
      });
      input.addEventListener('change', () => onChange(input.value));
      label.appendChild(span);
      label.appendChild(input);
      container.appendChild(label);
      return input;
    }
    function divider() {
      const hr = document.createElement('div');
      hr.className = 'hero-code-ui-divider';
      container.appendChild(hr);
    }

    const s = api.state;

    heading('Idle mesh behavior');
    toggle('Setting 2 — reshape mesh each regenerate', s.autoRegenerate, v => api.setAutoRegenerate(v));

    heading('Sun');
    color('Color', s.sunColor, v => api.setSunColor(v));
    slider('Intensity', 0, 3, 0.05, s.sunIntensity, v => api.setSunIntensity(v));
    slider('Elevation °', 0, 90, 1, s.sunElevation, v => api.setSunElevation(v));

    heading('Ambient');
    slider('Intensity', 0, 2, 0.05, s.ambientIntensity, v => api.setAmbientIntensity(v));

    heading('Face color');
    color('Near', s.nearFaceColor, v => api.setNearFaceColor(v));
    color('Far', s.farFaceColor, v => api.setFarFaceColor(v));
    slider('Opacity', 0, 1, 0.05, s.faceOpacity, v => api.setFaceOpacity(v));

    heading('Wireframe glow');
    color('Near color', s.nearEdgeColor, v => api.setNearEdgeColor(v));
    color('Far color', s.farEdgeColor, v => api.setFarEdgeColor(v));
    slider('Opacity', 0, 1, 0.05, s.edgeOpacity, v => api.setEdgeOpacity(v));

    heading('Peak concentration');
    slider('Brightness boost', 0, 1, 0.05, s.peakBoost, v => api.setPeakBoost(v));

    heading('Terrain');
    slider('Ridge amplitude', 0.2, 2.5, 0.05, s.ridgeAmp, v => api.setRidgeAmp(v));
    slider('Mesh density', 0.4, 2.2, 0.1, s.meshDetail, v => api.setMeshDetail(v));

    button('regenerate_mesh()', () => api.regenerate());

    // -----------------------------------------------------------
    // Advanced settings — site-wide theme + accent colors, backed
    // by theme.js (window.siteTheme). Kept separate from the terrain
    // controls above: this changes CSS custom properties used across
    // the whole site, not just the hero mesh, and persists across
    // pages via localStorage (see theme.js for exactly what/why).
    // -----------------------------------------------------------
    if (window.siteTheme) {
      divider();
      heading('ADVANCED SETTINGS');

      const t = window.siteTheme.getState();

      // Kept as a live reference so picking a color can flip this
      // dropdown to "Custom" in place, without rebuilding the panel.
      const themeSelectEl = select('Theme', [
        { value: 'midnight', label: 'Midnight (default)' },
        { value: 'dusk', label: 'Dusk' },
        { value: 'paper', label: 'Paper (light)' },
        { value: 'sakura', label: 'Sakura' },
        { value: 'aurora', label: 'Aurora' },
        { value: 'plum', label: 'Plum' },
        { value: 'ember', label: 'Ember' },
        { value: 'accessible', label: 'Accessible (high contrast)' },
        { value: 'custom', label: 'Custom' },
      ], t.theme, v => {
        window.siteTheme.setTheme(v);
        container.innerHTML = '';
        buildUiPanel(container); // preset swap changes bg/font/subfont — reflect it in the pickers
      });

      // Background/Font/Subfont are always visible — no need to select
      // "Custom" first. Touching any of them switches the Theme
      // dropdown to Custom automatically. bg-alt/bg-raised and the
      // faint text/border colors derive from these (see theme.js).
      color('Background', t.custom.bg, v => {
        window.siteTheme.setCustomColor('bg', v);
        if (themeSelectEl) themeSelectEl.value = 'custom';
      });
      color('Font', t.custom.fg, v => {
        window.siteTheme.setCustomColor('fg', v);
        if (themeSelectEl) themeSelectEl.value = 'custom';
      });
      color('Subfont', t.custom.fgDim, v => {
        window.siteTheme.setCustomColor('fgDim', v);
        if (themeSelectEl) themeSelectEl.value = 'custom';
      });

      color('Accent', t.accent, v => window.siteTheme.setAccent(v));
      color('Accent 2', t.accent2, v => window.siteTheme.setAccent2(v));

      button('reset appearance', () => {
        window.siteTheme.reset();
        container.innerHTML = '';
        buildUiPanel(container); // rebuild so inputs reflect the reset values
      });
    }
  }

  if (api) {
    const uiEl = document.createElement('div');
    uiEl.className = 'hero-code-ui';
    uiEl.id = 'heroCodeUi';
    uiEl.hidden = true;
    buildUiPanel(uiEl);
    bodyEl.insertAdjacentElement('afterend', uiEl);

    const footerEl = document.createElement('div');
    footerEl.className = 'hero-code-footer';
    const toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.id = 'heroUiToggle';
    toggleBtn.className = 'hero-code-footer-btn mono';
    toggleBtn.textContent = '$ enable_ui';
    footerEl.appendChild(toggleBtn);
    uiEl.insertAdjacentElement('afterend', footerEl);

    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      uiModeActive = !uiModeActive;
      panel.classList.remove('is-minimized');

      if (uiModeActive) {
        stopTyping();
        idleActive = false;
        bodyEl.style.display = 'none';
        uiEl.hidden = false;
        panel.classList.add('is-maximized');
        toggleBtn.textContent = '$ disable_ui';
      } else {
        bodyEl.style.display = '';
        uiEl.hidden = true;
        panel.classList.remove('is-maximized');
        toggleBtn.textContent = '$ enable_ui';
        idleActive = true;
        playIdle();
      }
    });
  }

  // Kick off the idle rotation.
  playIdle();
})();