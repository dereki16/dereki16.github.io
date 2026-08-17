// ============================================================
// hero-window.js — makes the hero's floating "code" panel a real
// little window: draggable by its titlebar, with working macOS-style
// traffic-light buttons (red = close, yellow = minimize, green =
// maximize), and a code display that shows the *actual* handler code
// for whatever you just did to it. Drag it and the panel switches to
// drag.js and shows the real onPointerMove handler below; click the
// yellow dot and it flips to minimize.js and shows the real toggle
// code that just ran. When nothing's happening, it idles through a
// few real snippets from elsewhere on the site (nav.js / about.js /
// contact.js), same as before — and still nudges the terrain to
// reshape each time an idle snippet finishes (window.reshapeTerrain,
// see js/hero-terrain.js).
// ============================================================

(function () {
  const panel = document.getElementById('heroCodeWindow');
  const titlebar = document.getElementById('heroTitlebar');
  const codeEl = document.getElementById('heroCode');
  const fileEl = document.getElementById('heroCodeFile');
  const caretEl = document.querySelector('.hero-code-caret');
  const restoreBtn = document.getElementById('heroRestoreBtn');
  if (!panel || !titlebar || !codeEl || !fileEl) return;

  const closeBtn = titlebar.querySelector('.win-close');
  const minBtn = titlebar.querySelector('.win-min');
  const maxBtn = titlebar.querySelector('.win-max');

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

  function typeSnippet(file, code, { onDone, holdMs = 2200 } = {}) {
    stopTyping();
    fileEl.textContent = file;
    codeEl.textContent = '';
    let i = 0;
    typeTimer = setInterval(() => {
      codeEl.textContent = code.slice(0, i);
      i++;
      if (i > code.length) {
        clearInterval(typeTimer);
        if (onDone) resumeTimer = setTimeout(onDone, holdMs);
      }
    }, 22);
  }

  // -------------------------------------------------------------
  // Idle loop — the ambient rotation through real site snippets.
  // -------------------------------------------------------------
  const idleSnippets = [
    { file: 'nav.js', code: `document.querySelectorAll('.nav-link')\n  .forEach(link => {\n    link.addEventListener('click', closeDropdown);\n});` },
    { file: 'about.js', code: `const developer = {\n  name: "Derek Iniguez",\n  builds: ["web", "apps", "games"]\n};` },
    { file: 'contact.js', code: `input.addEventListener('input', () => {\n  this.classList.toggle('has-content',\n    this.value.length > 0);\n});` },
  ];
  let idleIndex = 0;
  let idleActive = true;

  function playIdle() {
    if (!idleActive) return;
    const snippet = idleSnippets[idleIndex % idleSnippets.length];
    typeSnippet(snippet.file, snippet.code, {
      onDone: () => {
        if (window.reshapeTerrain) window.reshapeTerrain();
        idleIndex++;
        playIdle();
      },
    });
  }

  // -------------------------------------------------------------
  // Action snippets — the real code behind each window control,
  // shown the moment that control actually fires.
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
  // The panel keeps its normal document-flow slot; dragging just
  // offsets it visually via transform, so nothing reflows.
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

  // Draggable from the titlebar *or* the body — not just the top bar.
  // The whole panel is the drag surface; only the traffic-light dots
  // opt out (handled by the closest('.win-dot') check below).
  panel.addEventListener('pointerdown', (e) => {
    if (e.target.closest('.win-dot')) return; // buttons handle their own clicks
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

  // Kick off the idle rotation.
  playIdle();
})();