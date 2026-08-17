// ============================================================
// hero-terrain.js — low-poly wireframe terrain for the hero.
//
// v3: lit low-poly mountains. Faces are now flat-shaded and actually
// lit by a directional "sun" + soft ambient fill, so orientation
// toward the light reads as brighter facets and orientation away
// reads darker — the effect from the reference image. A glowing
// wireframe (additive blend) sits on top of the same geometry for the
// crisp triangulated edges, and a scatter of small bright points sits
// at the mesh vertices + in the sky for the "dust/stars" texture.
//
// - Orthographic camera by default (flatter, more graphic/2D read).
//   Perspective still available as a toggle for comparison.
// - flatShading on the face material does the lighting work per-facet
//   via screen-space derivatives — no per-vertex normal bookkeeping
//   needed even as the terrain deforms.
// - Idle motion and the code-triggered reshape are OFF by default.
//   A "Regenerate" button in the control panel gives a one-off static
//   change instead.
// - Every tunable value lives in `state` and is exposed via
//   window.heroTerrainAPI so js/hero-controls.js can drive it live from
//   an on-page panel, instead of guessing values blind.
// ============================================================

(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  } catch (e) {
    return; // WebGL unavailable — leave the canvas empty, no hard error
  }

  const rootStyle = getComputedStyle(document.documentElement);
  const bgColor = rootStyle.getPropertyValue('--bg').trim() || '#10131c';

  const state = {
    cameraType: 'orthographic', // 'orthographic' | 'perspective'
    camY: 80,
    camZ: 150,
    fov: 45,
    orthoSize: 51,
    ridgeAmp: 2.3,
    ridgeFreq: 0.35,

    // How far apart the far/near layers sit on the Z axis — bigger gap
    // reads as more separated depth planes instead of one blurred mass.
    layerGap: 60,

    // Extra headroom above center in the ortho frustum so tall peaks
    // don't get clipped by the top edge when zoomed in. 1 = symmetric
    // top/bottom; higher = more room above, less wasted below.
    topHeadroom: 1.35,

    // Lighting — this is what gives faces the "hit by sun" variation.
    sunColor: '#cfe3ff',
    sunIntensity: 1.35,
    sunAzimuth: 55,   // degrees, 0 = from +z, 90 = from +x
    sunElevation: 42, // degrees above horizon
    ambientColor: '#16233f',
    ambientIntensity: 0.9,

    // Face materials (flat-shaded, lit)
    farFaceColor: '#1b2c4d',
    nearFaceColor: '#274a7d',
    farFaceOpacity: 0.92,
    nearFaceOpacity: 0.95,

    // Glowing wireframe overlay
    farEdgeColor: '#3d5f92',
    nearEdgeColor: '#7fd4ff',
    farEdgeOpacity: 0.5,
    nearEdgeOpacity: 0.85,

    // Vertex/sky sparkle
    sparkleColor: '#bcd9ff',
    sparkleOpacity: 0.8,

    idleMotion: false,
  };

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(bgColor).getHex(), 90, 190);

  const perspCamera = new THREE.PerspectiveCamera(state.fov, 1, 0.1, 1000);
  const orthoCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 1000);

  function activeCamera() {
    return state.cameraType === 'perspective' ? perspCamera : orthoCamera;
  }

  function positionCameras() {
    [perspCamera, orthoCamera].forEach(cam => {
      cam.position.set(0, state.camY, state.camZ);
      cam.lookAt(0, 0, 0);
    });
  }

  function setSize() {
    // clientWidth/Height can legitimately be 0 for a frame (before
    // layout settles, or mid-transition while a slider is dragged in
    // the control panel) — bail rather than falling back to a stale
    // guessed size, which was the root cause of the framing only ever
    // looking right by accident. The ResizeObserver below re-fires
    // setSize() the moment real dimensions are available.
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    const aspect = w / h;

    renderer.setSize(w, h, false);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));

    perspCamera.aspect = aspect;
    perspCamera.updateProjectionMatrix();

    const s = state.orthoSize;
    orthoCamera.left = -s * aspect;
    orthoCamera.right = s * aspect;
    // Asymmetric vertical frustum: more room above center than below,
    // so tall peaks stay in frame instead of getting clipped at the
    // top edge as you zoom in (lower orthoSize).
    orthoCamera.top = s * state.topHeadroom;
    orthoCamera.bottom = -s * (2 - state.topHeadroom);
    orthoCamera.updateProjectionMatrix();
  }

  // -------------------------------------------------------------
  // Lighting — directional "sun" (positioned via azimuth/elevation)
  // plus a dim ambient fill so unlit facets stay a readable dark
  // blue instead of going flat black.
  // -------------------------------------------------------------
  const sunLight = new THREE.DirectionalLight(new THREE.Color(state.sunColor), state.sunIntensity);
  const ambientLight = new THREE.AmbientLight(new THREE.Color(state.ambientColor), state.ambientIntensity);
  scene.add(sunLight, ambientLight);

  function positionSun() {
    const az = THREE.MathUtils.degToRad(state.sunAzimuth);
    const el = THREE.MathUtils.degToRad(state.sunElevation);
    const r = 200;
    sunLight.position.set(
      r * Math.cos(el) * Math.sin(az),
      r * Math.sin(el),
      r * Math.cos(el) * Math.cos(az)
    );
  }

  // Ridged pseudo-noise: abs(sin/cos) folds smooth waves into ridges;
  // raising to a power sharpens them into more angular peaks.
  function ridgeHeight(x, z, seed) {
    const f = state.ridgeFreq;
    const amp = state.ridgeAmp;
    const a = Math.pow(Math.abs(Math.sin(x * 0.05 * f + seed)), 1.6) * 16;
    const b = Math.pow(Math.abs(Math.cos(z * 0.07 * f + seed * 1.7)), 1.6) * 13;
    const c = Math.pow(Math.abs(Math.sin((x + z) * 0.035 * f + seed * 0.6)), 1.4) * 18;
    const d = Math.sin(x * 0.18 * f - z * 0.14 * f + seed * 2.1) * 4;
    return (a + b + c + d - 20) * amp;
  }

  // Diagonal envelope: constrains peak height by left-to-right position
  // so the terrain reads small on the left, tall on the right, rather
  // than uniform height across the whole width. `floor` keeps the left
  // edge from being perfectly flat.
  function envelopeFactor(x, halfWidth) {
    const t = (x + halfWidth) / (2 * halfWidth);
    const floor = 0.12;
    return floor + (1 - floor) * Math.max(0, Math.min(1, t));
  }

  function makeLayer({ width, depth, segX, segZ, faceColor, faceOpacity, edgeColor, edgeOpacity, z, seedBase }) {
    const geo = new THREE.PlaneGeometry(width, depth, segX, segZ);
    const posAttr = geo.attributes.position;
    const count = posAttr.count;
    const base = new Float32Array(count * 2);
    const current = new Float32Array(count);
    const target = new Float32Array(count);
    const halfWidth = width / 2;

    // Solid, flat-shaded, lit face material. flatShading derives the
    // per-facet normal from screen-space derivatives, so it stays
    // correct as we move vertices around without recomputing normals.
    const faceMaterial = new THREE.MeshLambertMaterial({
      color: new THREE.Color(faceColor),
      flatShading: true,
      transparent: true,
      opacity: faceOpacity,
      fog: true,
      polygonOffset: true,
      polygonOffsetFactor: 1,
      polygonOffsetUnits: 1,
    });

    // Glowing wireframe overlay, same geometry, additive blend so
    // overlapping edges brighten instead of flattening out.
    const edgeMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(edgeColor),
      wireframe: true,
      transparent: true,
      opacity: edgeOpacity,
      fog: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    const faceMesh = new THREE.Mesh(geo, faceMaterial);
    const edgeMesh = new THREE.Mesh(geo, edgeMaterial);

    // Sparkle points at every vertex — same geometry's position
    // attribute, so it rides along with every deformation for free.
    const sparkleMaterial = new THREE.PointsMaterial({
      color: new THREE.Color(state.sparkleColor),
      size: 1.6,
      sizeAttenuation: true,
      transparent: true,
      opacity: state.sparkleOpacity * 0.5,
      fog: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const sparkle = new THREE.Points(geo, sparkleMaterial);

    const group = new THREE.Group();
    group.add(faceMesh, edgeMesh, sparkle);
    group.rotation.x = -Math.PI / 2;
    group.position.z = z;

    const layer = {
      group, geo, posAttr, base, current, target, count, seed: seedBase, halfWidth,
      faceMaterial, edgeMaterial, sparkleMaterial,
    };

    function recompute() {
      for (let i = 0; i < count; i++) {
        const x = posAttr.getX(i);
        const y = posAttr.getY(i);
        layer.base[i * 2] = x;
        layer.base[i * 2 + 1] = y;
        const h = ridgeHeight(x, y, layer.seed) * envelopeFactor(x, halfWidth);
        layer.current[i] = h;
        layer.target[i] = h;
        posAttr.setZ(i, h);
      }
      posAttr.needsUpdate = true;
    }

    layer.recompute = recompute;
    recompute();
    return layer;
  }

  // Near layer's Z is the anchor; far layer sits state.layerGap behind
  // it (see applyLayerGap below) so the two read as distinct depth
  // planes instead of overlapping into one blurred mass.
  const NEAR_Z = 10;

  // Plane footprints are generous on purpose — comfortably larger than
  // any reasonable canvas/zoom combination — so the terrain always
  // overflows past the frustum edges rather than leaving a visible gap
  // at the corners when the canvas box is resized via the control panel.
  const layers = [
    makeLayer({
      width: 420, depth: 300, segX: 18, segZ: 13, z: NEAR_Z - state.layerGap, seedBase: 4.2,
      faceColor: state.farFaceColor, faceOpacity: state.farFaceOpacity,
      edgeColor: state.farEdgeColor, edgeOpacity: state.farEdgeOpacity,
    }),
    makeLayer({
      width: 320, depth: 240, segX: 22, segZ: 16, z: NEAR_Z, seedBase: 1.1,
      faceColor: state.nearFaceColor, faceOpacity: state.nearFaceOpacity,
      edgeColor: state.nearEdgeColor, edgeOpacity: state.nearEdgeOpacity,
    }),
  ];

  function applyLayerGap() {
    layers[1].group.position.z = NEAR_Z;
    layers[0].group.position.z = NEAR_Z - state.layerGap;
  }

  const terrainGroup = new THREE.Group();
  layers.forEach(layer => terrainGroup.add(layer.group));
  scene.add(terrainGroup);

  // -------------------------------------------------------------
  // Sky sparkle — a static scatter of small bright points above/around
  // the terrain, matching the star-dust in the reference art.
  // -------------------------------------------------------------
  const STAR_COUNT = 90;
  const starGeo = new THREE.BufferGeometry();
  const starPositions = new Float32Array(STAR_COUNT * 3);
  for (let i = 0; i < STAR_COUNT; i++) {
    starPositions[i * 3] = (Math.random() - 0.35) * 320;
    starPositions[i * 3 + 1] = 20 + Math.random() * 70;
    starPositions[i * 3 + 2] = -90 + Math.random() * 140;
  }
  starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  const starMaterial = new THREE.PointsMaterial({
    color: new THREE.Color(state.sparkleColor),
    size: 1.3,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.75,
    fog: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const stars = new THREE.Points(starGeo, starMaterial);
  scene.add(stars);

  const clock = new THREE.Clock();
  let reshapeBoost = 0;

  function regenerate(bigJump) {
    layers.forEach(layer => {
      const newSeed = bigJump ? layer.seed + 35 + Math.random() * 45 : layer.seed;
      layer.seed = newSeed;
      for (let i = 0; i < layer.count; i++) {
        const x = layer.base[i * 2];
        const y = layer.base[i * 2 + 1];
        const h = ridgeHeight(x, y, newSeed) * envelopeFactor(x, layer.halfWidth);
        layer.target[i] = h;
        if (!state.idleMotion) {
          // No animation loop running — apply instantly.
          layer.current[i] = h;
          layer.posAttr.setZ(i, h);
        }
      }
      if (!state.idleMotion) layer.posAttr.needsUpdate = true;
    });
    if (state.idleMotion) reshapeBoost = 1;
  }

  window.reshapeTerrain = function () {
    regenerate(true);
  };

  function animate() {
    requestAnimationFrame(animate);

    if (state.idleMotion) {
      const t = clock.getElapsedTime();
      layers.forEach(layer => {
        const ease = 0.025 + reshapeBoost * 0.05;
        for (let i = 0; i < layer.count; i++) {
          layer.current[i] += (layer.target[i] - layer.current[i]) * ease;
          const x = layer.base[i * 2];
          const wobble = Math.sin(t * 0.6 + x * 0.08) * 0.6;
          layer.posAttr.setZ(i, layer.current[i] + wobble);
        }
        layer.posAttr.needsUpdate = true;
      });
      reshapeBoost *= 0.96;
    }

    // Gentle sky-sparkle twinkle — cheap, always on.
    const tw = clock.getElapsedTime();
    starMaterial.opacity = 0.55 + Math.sin(tw * 1.3) * 0.2;

    renderer.render(scene, activeCamera());
  }

  // -------------------------------------------------------------
  // Public API for the control panel (js/hero-controls.js)
  // -------------------------------------------------------------
  window.heroTerrainAPI = {
    state,
    setCameraType(type) { state.cameraType = type; },
    setCamY(v) { state.camY = v; positionCameras(); },
    setCamZ(v) { state.camZ = v; positionCameras(); },
    setOrthoSize(v) { state.orthoSize = v; setSize(); },
    setFov(v) { state.fov = v; perspCamera.fov = v; perspCamera.updateProjectionMatrix(); },
    setRidgeAmp(v) { state.ridgeAmp = v; layers.forEach(l => l.recompute()); },
    setRidgeFreq(v) { state.ridgeFreq = v; layers.forEach(l => l.recompute()); },
    setLayerGap(v) { state.layerGap = v; applyLayerGap(); },
    setTopHeadroom(v) { state.topHeadroom = v; setSize(); },

    setSunColor(hex) { state.sunColor = hex; sunLight.color.set(hex); },
    setSunIntensity(v) { state.sunIntensity = v; sunLight.intensity = v; },
    setSunAzimuth(v) { state.sunAzimuth = v; positionSun(); },
    setSunElevation(v) { state.sunElevation = v; positionSun(); },
    setAmbientColor(hex) { state.ambientColor = hex; ambientLight.color.set(hex); },
    setAmbientIntensity(v) { state.ambientIntensity = v; ambientLight.intensity = v; },

    setFarFaceColor(hex) { state.farFaceColor = hex; layers[0].faceMaterial.color.set(hex); },
    setNearFaceColor(hex) { state.nearFaceColor = hex; layers[1].faceMaterial.color.set(hex); },
    setFarFaceOpacity(v) { state.farFaceOpacity = v; layers[0].faceMaterial.opacity = v; },
    setNearFaceOpacity(v) { state.nearFaceOpacity = v; layers[1].faceMaterial.opacity = v; },

    setFarEdgeColor(hex) { state.farEdgeColor = hex; layers[0].edgeMaterial.color.set(hex); },
    setNearEdgeColor(hex) { state.nearEdgeColor = hex; layers[1].edgeMaterial.color.set(hex); },
    setFarEdgeOpacity(v) { state.farEdgeOpacity = v; layers[0].edgeMaterial.opacity = v; },
    setNearEdgeOpacity(v) { state.nearEdgeOpacity = v; layers[1].edgeMaterial.opacity = v; },

    setIdleMotion(on) { state.idleMotion = on; },
    regenerate() { regenerate(true); },
  };

  positionCameras();
  positionSun();
  setSize();
  animate();

  // The control panel resizes the canvas by changing CSS width/height
  // directly (no window resize event fires for that). A ResizeObserver
  // catches every real box-size change — window resizes, slider
  // changes, layout shifts — so the camera's aspect/frustum never goes
  // stale relative to what's actually on screen.
  if (typeof ResizeObserver !== 'undefined') {
    const ro = new ResizeObserver(() => setSize());
    ro.observe(canvas);
  } else {
    window.addEventListener('resize', setSize);
  }
})();