// ============================================================
// hero-controls.js — TEMP on-page panel for tuning the hero terrain
// live, instead of guessing values blind across many round-trips.
// Wires into window.heroTerrainAPI (see hero-terrain.js) for the 3D
// scene, and directly adjusts #heroCanvas's own CSS for box
// position/size and the two fade masks.
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
  addSlider('Width %', 20, 220, 1, 105, v => canvas.style.width = v + '%');
  addSlider('Height %', 20, 220, 1, 80, v => canvas.style.height = v + '%');

  // -------------------------------------------------------------
  // Two independent fade masks, composited together (intersect —
  // a pixel only shows where BOTH masks allow it). Mask 1 is the
  // diagonal "recedes into the distance" fade; Mask 2 is a second,
  // independent path — defaults to a straight vertical (0deg) fade,
  // mainly for softening the bottom edge into the next section
  // without needing the diagonal one to do double duty.
  // -------------------------------------------------------------
  addHeading('Fade path 1 (diagonal)');
  let angle1 = 120, stop1 = 100, angle2 = 0, stop2 = 30;
  function applyMask() {
    const g1 = `linear-gradient(${angle1}deg, transparent 0%, black ${stop1}%)`;
    const g2 = `linear-gradient(${angle2}deg, transparent 0%, black ${stop2}%)`;
    canvas.style.maskImage = `${g1}, ${g2}`;
    canvas.style.webkitMaskImage = `${g1}, ${g2}`;
    canvas.style.maskComposite = 'intersect';
    canvas.style.webkitMaskComposite = 'source-in';
  }
  addSlider('Angle (deg)', 0, 180, 1, angle1, v => { angle1 = v; applyMask(); });
  addSlider('Fade Stop %', 10, 100, 1, stop1, v => { stop1 = v; applyMask(); });

  addHeading('Fade path 2 (bottom-edge blend)');
  addSlider('Angle (deg)', 0, 180, 1, angle2, v => { angle2 = v; applyMask(); });
  addSlider('Fade Stop %', 10, 100, 1, stop2, v => { stop2 = v; applyMask(); });
  applyMask();

  addSlider('Overall Opacity', 0, 1, 0.05, 0.85, v => canvas.style.opacity = v);
  canvas.style.opacity = 0.85;

  // -------------------------------------------------------------
  // Camera / Terrain / Lighting / Depth color
  // -------------------------------------------------------------
  function whenReady(fn) {
    if (window.heroTerrainAPI) fn(window.heroTerrainAPI);
    else setTimeout(() => whenReady(fn), 100);
  }

  whenReady(api => {
    addHeading('Camera / View');
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
    addSlider('Camera Distance', 20, 500, 1, api.state.camZ, v => api.setCamZ(v));
    addSlider('Ortho Zoom', 10, 160, 1, api.state.orthoSize, v => api.setOrthoSize(v));
    addSlider('Top headroom', 1, 2, 0.05, api.state.topHeadroom, v => api.setTopHeadroom(v));
    addSlider('Perspective FOV', 20, 90, 1, api.state.fov, v => api.setFov(v));

    addHeading('Terrain Shape');
    const peakCountInput = addSlider('# of peaks', 1, 24, 1, api.state.peakCount, v => {
      api.setPeakCount(v);
      renderMountainSliders();
    });
    addSlider('# of side hills', 0, 4, 1, api.state.sideCount, v => api.setSideCount(v));
    addSlider('Convergence (faces bunch at peaks)', 0, 1, 0.05, api.state.convergence, v => api.setConvergence(v));
    addSlider('Step count (steep→flat bands per slope)', 1, 8, 1, api.state.terraceSteps, v => api.setTerraceSteps(v));
    addSlider('Step sharpness (lower = more abrupt)', 0.15, 1, 0.05, api.state.terraceSharpness, v => api.setTerraceSharpness(v));
    addSlider('Ridge Amplitude', 0.2, 2.5, 0.05, api.state.ridgeAmp, v => api.setRidgeAmp(v));
    addSlider('Ridge Frequency', 0.3, 2.5, 0.05, api.state.ridgeFreq, v => api.setRidgeFreq(v));
    addSlider('Mesh density (verts/faces)', 0.4, 2.2, 0.1, api.state.meshDetail, v => api.setMeshDetail(v));
    addButton('Regenerate Shape', () => api.regenerate());
    const autoRegenBtn = addButton(
      'Auto-regenerate on idle: ' + (api.state.autoRegenerate ? 'ON' : 'OFF'),
      () => {
        api.setAutoRegenerate(!api.state.autoRegenerate);
        autoRegenBtn.textContent = 'Auto-regenerate on idle: ' + (api.state.autoRegenerate ? 'ON' : 'OFF');
      }
    );

    addHeading('Mountain size (all, quick scale)');
    addSlider('Height scale', 0.3, 3, 0.05, api.state.peakHeightScale, v => api.setPeakHeightScale(v));
    addSlider('Width / mass scale', 0.3, 3, 0.05, api.state.peakWidthScale, v => api.setPeakWidthScale(v));

    addHeading('Mountain size (per mountain — #1 is the bottom-right one)');
    const mountainSlidersEl = document.createElement('div');
    panel.appendChild(mountainSlidersEl);
    function renderMountainSliders() {
      mountainSlidersEl.innerHTML = '';
      const totalCount = Math.max(1, Math.round(api.state.peakCount));
      const count = Math.min(totalCount, 8); // MAX_EXPLICIT_PEAKS in hero-terrain.js
      for (let i = 0; i < count; i++) {
        const label = document.createElement('label');
        const span = document.createElement('span');
        span.textContent = `#${i + 1} height`;
        const input = document.createElement('input');
        input.type = 'range';
        input.min = 20; input.max = 260; input.step = 5;
        input.value = api.state.peakHeights[i] != null ? api.state.peakHeights[i] : 90;
        const val = document.createElement('span');
        val.className = 'val';
        val.textContent = input.value;
        input.addEventListener('input', () => {
          val.textContent = input.value;
          api.setPeakHeight(i, parseFloat(input.value));
        });
        label.appendChild(span); label.appendChild(input); label.appendChild(val);
        mountainSlidersEl.appendChild(label);

        const label2 = document.createElement('label');
        const span2 = document.createElement('span');
        span2.textContent = `#${i + 1} width`;
        const input2 = document.createElement('input');
        input2.type = 'range';
        input2.min = 10; input2.max = 100; input2.step = 2;
        input2.value = api.state.peakWidths[i] != null ? api.state.peakWidths[i] : 38;
        const val2 = document.createElement('span');
        val2.className = 'val';
        val2.textContent = input2.value;
        input2.addEventListener('input', () => {
          val2.textContent = input2.value;
          api.setPeakWidth(i, parseFloat(input2.value));
        });
        label2.appendChild(span2); label2.appendChild(input2); label2.appendChild(val2);
        mountainSlidersEl.appendChild(label2);
      }
      if (totalCount > count) {
        const note = document.createElement('p');
        note.style.margin = '8px 0 0';
        note.style.fontSize = '0.68rem';
        note.style.color = 'var(--fg-faint)';
        note.textContent = `+${totalCount - count} more, sized procedurally (auto-varied, no individual slider)`;
        mountainSlidersEl.appendChild(note);
      }
    }
    renderMountainSliders();

    addHeading('Sun (light direction — the "hit by sun" effect)');
    addColor('Sun color', api.state.sunColor, v => api.setSunColor(v));
    addSlider('Sun intensity', 0, 3, 0.05, api.state.sunIntensity, v => api.setSunIntensity(v));
    addSlider('Light azimuth ° (direction)', 0, 360, 1, api.state.sunAzimuth, v => api.setSunAzimuth(v));
    addSlider('Light elevation ° (direction)', 0, 90, 1, api.state.sunElevation, v => api.setSunElevation(v));

    addHeading('Ambient fill (keeps shadowed facets from going black)');
    addColor('Ambient color', api.state.ambientColor, v => api.setAmbientColor(v));
    addSlider('Ambient intensity', 0, 2, 0.05, api.state.ambientIntensity, v => api.setAmbientIntensity(v));

    addHeading('Depth color — one mesh, gradient by distance');
    addColor('Near face color', api.state.nearFaceColor, v => api.setNearFaceColor(v));
    addColor('Far face color', api.state.farFaceColor, v => api.setFarFaceColor(v));
    addSlider('Face opacity', 0, 1, 0.05, api.state.faceOpacity, v => api.setFaceOpacity(v));

    addHeading('Wireframe glow — same depth gradient');
    addColor('Near edge color', api.state.nearEdgeColor, v => api.setNearEdgeColor(v));
    addColor('Far edge color', api.state.farEdgeColor, v => api.setFarEdgeColor(v));
    addSlider('Edge opacity', 0, 1, 0.05, api.state.edgeOpacity, v => api.setEdgeOpacity(v));

    addHeading('Peak concentration');
    addSlider('Peak brightness boost', 0, 1, 0.05, api.state.peakBoost, v => api.setPeakBoost(v));

    addHeading('Sparkle points');
    addSlider('Depth fade (dim/drop out with distance)', 0, 1, 0.05, api.state.depthFade, v => api.setDepthFade(v));

    addHeading('Motion');
    const motionBtn = addButton('Idle motion: ' + (api.state.idleMotion ? 'ON' : 'OFF'), () => {
      api.setIdleMotion(!api.state.idleMotion);
      motionBtn.textContent = 'Idle motion: ' + (api.state.idleMotion ? 'ON' : 'OFF');
    });
  });
})();