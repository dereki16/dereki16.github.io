// ============================================================
// hero-controls.js — TEMPORARY on-page panel for tuning the hero
// terrain live, instead of guessing values blind across many
// round-trips. Wires into window.heroTerrainAPI (see hero-terrain.js)
// for the 3D scene, and directly adjusts #heroCanvas's own CSS for
// box position/size and the mask fade.
//
// Once the values are dialed in, note the final numbers, bake them
// into hero-terrain.js's `state` defaults and .hero-canvas in
// style.css, then delete this file and its <script> tag in index.html.
// ============================================================

(function () {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const panel = document.createElement('div');
  panel.id = 'heroControls';
  document.body.appendChild(panel);

  function addHeading(text) {
    const h = document.createElement('h4');
    h.textContent = text;
    panel.appendChild(h);
  }

  function addSlider(labelText, min, max, step, value, onChange) {
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
    panel.appendChild(label);
    return input;
  }

  function addColor(labelText, value, onChange) {
    const label = document.createElement('label');
    const span = document.createElement('span');
    span.textContent = labelText;
    const input = document.createElement('input');
    input.type = 'color';
    input.value = value;
    input.addEventListener('input', () => onChange(input.value));
    label.appendChild(span);
    label.appendChild(input);
    panel.appendChild(label);
  }

  function addButton(text, onClick) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = text;
    btn.addEventListener('click', onClick);
    panel.appendChild(btn);
    return btn;
  }

  // -------------------------------------------------------------
  // Box position/size — directly on #heroCanvas's own style
  // -------------------------------------------------------------
  addHeading('Box Position');
  addSlider('Bottom %', 0, 40, 1, 0, v => canvas.style.bottom = v + '%');
  addSlider('Right %', 0, 40, 1, 0, v => canvas.style.right = v + '%');
  // Width/height can now go well past 100% so the box itself can push
  // out past its column into the full-bleed .hero section behind it —
  // 100% was capping how far the mesh could reach toward the screen's
  // bottom-right corner. The canvas has a live ResizeObserver now (see
  // hero-terrain.js), so the 3D framing tracks these live, correctly,
  // instead of only updating on a window resize.
  addSlider('Width %', 20, 220, 1, 100, v => canvas.style.width = v + '%');
  addSlider('Height %', 20, 220, 1, 51, v => canvas.style.height = v + '%');

  addHeading('Fade (optional — off by default now that the diagonal envelope handles the small-left/tall-right shape)');
  const angleInput = addSlider('Angle (deg)', 0, 180, 1, 0, v => {
    const stop = stopInput.value;
    canvas.style.maskImage = `linear-gradient(${v}deg, transparent 0%, black ${stop}%)`;
    canvas.style.webkitMaskImage = `linear-gradient(${v}deg, transparent 0%, black ${stop}%)`;
  });
  const stopInput = addSlider('Fade Stop %', 10, 100, 1, 57, v => {
    const angle = angleInput.value;
    canvas.style.maskImage = `linear-gradient(${angle}deg, transparent 0%, black ${v}%)`;
    canvas.style.webkitMaskImage = `linear-gradient(${angle}deg, transparent 0%, black ${v}%)`;
  });
  addSlider('Overall Opacity', 0, 1, 0.05, 1, v => canvas.style.opacity = v);

  // -------------------------------------------------------------
  // Camera / Terrain / Lighting / Materials
  // -------------------------------------------------------------
  function whenReady(fn) {
    if (window.heroTerrainAPI) fn(window.heroTerrainAPI);
    else setTimeout(() => whenReady(fn), 100);
  }

  whenReady(api => {
    addHeading('Camera');
    const camRow = document.createElement('div');
    camRow.className = 'row2';
    const orthoBtn = document.createElement('button');
    orthoBtn.textContent = 'Orthographic';
    const perspBtn = document.createElement('button');
    perspBtn.textContent = 'Perspective';
    orthoBtn.addEventListener('click', () => api.setCameraType('orthographic'));
    perspBtn.addEventListener('click', () => api.setCameraType('perspective'));
    camRow.appendChild(orthoBtn);
    camRow.appendChild(perspBtn);
    panel.appendChild(camRow);

    addSlider('Camera Height', 0, 80, 1, api.state.camY, v => api.setCamY(v));
    addSlider('Camera Distance', 20, 150, 1, api.state.camZ, v => api.setCamZ(v));
    addSlider('Ortho Zoom', 10, 100, 1, api.state.orthoSize, v => api.setOrthoSize(v));
    addSlider('Top headroom', 1, 2, 0.05, api.state.topHeadroom, v => api.setTopHeadroom(v));
    addSlider('Perspective FOV', 20, 90, 1, api.state.fov, v => api.setFov(v));

    addHeading('Terrain Shape');
    addSlider('Ridge Amplitude', 0.2, 2.5, 0.05, api.state.ridgeAmp, v => api.setRidgeAmp(v));
    addSlider('Ridge Frequency', 0.3, 2.5, 0.05, api.state.ridgeFreq, v => api.setRidgeFreq(v));
    addSlider('Layer separation (Z)', 10, 140, 1, api.state.layerGap, v => api.setLayerGap(v));
    addButton('Regenerate Shape', () => api.regenerate());

    addHeading('Sun (lights the faces — this is the "hit by sun" effect)');
    addColor('Sun color', api.state.sunColor, v => api.setSunColor(v));
    addSlider('Sun intensity', 0, 3, 0.05, api.state.sunIntensity, v => api.setSunIntensity(v));
    addSlider('Sun azimuth °', 0, 360, 1, api.state.sunAzimuth, v => api.setSunAzimuth(v));
    addSlider('Sun elevation °', 0, 90, 1, api.state.sunElevation, v => api.setSunElevation(v));

    addHeading('Ambient fill (keeps shadowed faces from going black)');
    addColor('Ambient color', api.state.ambientColor, v => api.setAmbientColor(v));
    addSlider('Ambient intensity', 0, 2, 0.05, api.state.ambientIntensity, v => api.setAmbientIntensity(v));

    addHeading('Face color — far layer');
    addColor('Far face', api.state.farFaceColor, v => api.setFarFaceColor(v));
    addSlider('Far face opacity', 0, 1, 0.05, api.state.farFaceOpacity, v => api.setFarFaceOpacity(v));

    addHeading('Face color — near layer');
    addColor('Near face', api.state.nearFaceColor, v => api.setNearFaceColor(v));
    addSlider('Near face opacity', 0, 1, 0.05, api.state.nearFaceOpacity, v => api.setNearFaceOpacity(v));

    addHeading('Wireframe glow — far layer');
    addColor('Far edge', api.state.farEdgeColor, v => api.setFarEdgeColor(v));
    addSlider('Far edge opacity', 0, 1, 0.05, api.state.farEdgeOpacity, v => api.setFarEdgeOpacity(v));

    addHeading('Wireframe glow — near layer');
    addColor('Near edge', api.state.nearEdgeColor, v => api.setNearEdgeColor(v));
    addSlider('Near edge opacity', 0, 1, 0.05, api.state.nearEdgeOpacity, v => api.setNearEdgeOpacity(v));

    addHeading('Motion');
    const motionBtn = addButton('Idle motion: OFF', () => {
      api.setIdleMotion(!api.state.idleMotion);
      motionBtn.textContent = 'Idle motion: ' + (api.state.idleMotion ? 'ON' : 'OFF');
    });
  });
})();