// ============================================================
// hero-terrain.js — low-poly wireframe terrain for the hero.
//
// v5: the ridgeline used to come from summed noise waves, which gave
// a random, uncontrolled silhouette with no real notion of "a
// mountain." It's now built from a small number of discrete peak
// bumps (+ smaller side hills) placed along X, closer to how the
// reference art actually reads: a handful of distinct summits, not
// procedural chaos. A "convergence" pass then pulls nearby vertices
// horizontally toward their nearest peak center, so faces bunch up
// and narrow near summits the way hand-placed low-poly mountains do,
// instead of a uniform grid.
//
// Depth is still one continuous mesh with a per-vertex color
// gradient (near tint -> far tint) plus a peak-height brightness
// boost, lit by a real directional "sun" + ambient fill. Sparkle
// points get an *additional* depth-based dimming on top of the color
// gradient (their own separate color attribute) so distant points
// visually drop out sooner, per request.
//
// Mesh resolution (vertex/face count) is now adjustable — changing it
// rebuilds the geometry from scratch, since Three.js can't resize a
// BufferGeometry's segment count in place.
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
    camZ: 500,
    fov: 41,
    orthoSize: 130,
    ridgeAmp: 2.5,
    ridgeFreq: 0.65,

    // Extra headroom above center in the ortho frustum so tall peaks
    // don't get clipped by the top edge when zoomed in. 1 = symmetric
    // top/bottom; higher = more room above, less wasted below.
    topHeadroom: 1.7,

    // Lighting — the sun azimuth/elevation pair below IS the
    // "where's the light coming from" control. Ambient is kept modest
    // relative to sun intensity so direction actually reads instead
    // of getting washed into flat, even brightness.
    sunColor: '#cfe3ff',
    sunIntensity: 2.4,
    sunAzimuth: 31,   // degrees, 0 = from +z, 90 = from +x
    sunElevation: 17, // degrees above horizon
    ambientColor: '#16233f',
    ambientIntensity: 0,

    // Depth color gradient — every vertex is tinted somewhere between
    // these two, based on how far back (into the screen) it sits.
    nearFaceColor: '#007bff',
    farFaceColor: '#000714',
    faceOpacity: 1,

    nearEdgeColor: '#7fd4ff',
    farEdgeColor: '#3a5686',
    edgeOpacity: 0.75,

    // How much brighter the tallest peaks get on top of the depth
    // gradient — kept modest by default so the sun's direction (not
    // just height) is what reads as "lit vs. shadowed."
    peakBoost: 0.6,
    peakHighlightColor: '#eaf5ff',

    sparkleOpacity: 0.85,
    // How much extra the sparkle points dim with distance, on top of
    // the normal depth color gradient — higher = far points drop out
    // sooner instead of lingering faintly forever.
    depthFade: 1,

    // Mesh resolution — scales vertex/face count. 1 = default density.
    meshDetail: 1.8,

    // Discrete peak system, replacing pure noise as the primary shape.
    peakCount: 24, // main summits
    sideCount: 4,  // smaller hills tucked between/around them
    // How strongly nearby faces get pulled horizontally toward their
    // nearest peak center — 0 = uniform grid, higher = faces visibly
    // bunch up and narrow near summits.
    convergence: 0.35,

    // Staircase steepness along each mountain's slope — a plain cone
    // (1 step) has one continuous straight slope. Higher step counts
    // break that into repeating steep-rise/flat-plateau bands as you
    // go up, which is what actually reads as "faceted mountain" and
    // not "smooth straight triangle."
    terraceSteps: 7,
    terraceSharpness: 0.5, // lower = more abrupt steep-then-flat per band

    // Global multipliers applied on top of every mountain's own
    // height/width below — the quick, coarse "make them all bigger /
    // fatter" controls.
    peakHeightScale: 2.15,
    peakWidthScale: 2.3,

    // Explicit per-mountain size, indexed 0..peakCount-1 (index 0 is
    // always the bottom-right anchor mountain). Overrides the old
    // "randomize everything" approach for main peaks specifically, so
    // a mountain you've sized stays that size across regenerates —
    // only its exact position/jitter reshuffles. Side hills stay
    // procedurally randomized (scaled by the two sliders above).
    peakHeights: [105, 105, 105, 105, 100, 105, 110, 120],
    peakWidths: [46, 42, 44, 42, 42, 44, 46, 46],

    idleMotion: true,
    // When off, the periodic idle-driven reshape (window.reshapeTerrain,
    // called from js/hero-window.js each time a code snippet finishes
    // typing) does nothing — mountains stay put until you hit
    // "Regenerate Shape" yourself.
    autoRegenerate: true,
  };

  // Snapshot of the baked-in defaults, captured once right after state
  // is built. Used by setLook/resetLook below (see the API) so the
  // hero code panel's momentary "look" variants — a deliberate swing
  // like a red/green face tint or a flatter mesh — can be reverted to
  // an exact known baseline instead of hand-duplicated numbers that
  // could drift out of sync with the state object above.
  const DEFAULT_STATE = JSON.parse(JSON.stringify(state));

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(new THREE.Color(bgColor).getHex(), 90, 190);

  // Fog distance is measured from the camera, not from world origin.
  // Scaling near/far as a flat multiple of camZ (the old approach)
  // still meant the *entire* terrain crept toward full fog as camZ
  // grew, since both the near and far edges of the terrain moved
  // proportionally further from the camera too — so lighting still
  // read as "dimmer the further back you pull the camera."
  //
  // Fixed instead: near/far are anchored to the terrain's own fixed
  // world-space depth (DEPTH, a constant, not something that scales
  // with camera position) offset by camZ. That guarantees the near
  // side of the terrain — whatever camZ is — sits inside fog.near and
  // stays fully lit, and the far side never quite reaches fog.far, so
  // some light always reaches every mountain regardless of zoom.
  function updateFog() {
    const halfDepth = DEPTH / 2;
    scene.fog.near = Math.max(5, state.camZ - halfDepth * 0.7);
    scene.fog.far = state.camZ + halfDepth * 1.6;
  }

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
    // guessed size. The ResizeObserver below re-fires setSize() the
    // moment real dimensions are available.
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
  // Lighting — directional "sun" (positioned via azimuth/elevation —
  // this IS the light-direction control) plus a dim ambient fill so
  // unlit facets stay a readable dark blue instead of going flat
  // black.
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

  // -------------------------------------------------------------
  // Shape — a small number of discrete peak bumps (+ smaller side
  // hills) instead of continuous noise, so "how many mountains" is an
  // actual, controllable number.
  // -------------------------------------------------------------

  // Deterministic 0..1 pseudo-random from a number, so the same seed
  // always produces the same peak layout (needed for regenerate() to
  // give a genuinely new-looking layout each time, and for idle
  // motion to not fight itself).
  function hashRandom(n) {
    const v = Math.sin(n * 12.9898) * 43758.5453;
    return v - Math.floor(v);
  }

  // Real-world span the peak layout is distributed across. The plane
  // itself (WIDTH, below) is made considerably wider than this so it
  // overflows the frame with no visible seam — the peaks themselves
  // live within this narrower, fully-visible window. Widened to give
  // a much larger peak count real room to spread out with the
  // minimum-spacing rule still satisfied.
  const PEAK_SPAN = 460;
  // Same idea for the diagonal small-left/tall-right taper: it
  // deliberately ignores the plane's full physical width and tapers
  // over this fixed span instead, so the low end is actually visible
  // on screen (see the long comment further down for why).
  const ENVELOPE_SPAN = 340;
  // Depth (Y axis) color gradient uses this fixed span too, decoupled
  // from the plane's physical DEPTH — DEPTH itself can be made larger
  // for near-camera coverage without diluting the color contrast.
  const DEPTH_COLOR_SPAN = 320;
  // How many mountains get their own explicit height/width slider in
  // the control panel — beyond this, peak count can still go much
  // higher, just procedurally sized (see extraSize below).
  const MAX_EXPLICIT_PEAKS = 8;

  // Each explicit mountain (#2-#8; #1/the anchor has its own fixed
  // corner below) gets its own designated region instead of roaming
  // the whole field — this is what keeps "mountain #4" recognizably
  // in roughly the same place across regenerates, and stops wide
  // mountains from drifting into each other and merging. Spread
  // across near/mid/far and left/right so they read as a real range
  // rather than a cluster.
  const MOUNTAIN_ZONES = [
    { xMin: 0, xMax: 115, zMin: -53, zMax: 53 },       // #2
    { xMin: -115, xMax: 0, zMin: -160, zMax: -53 },    // #3
    { xMin: -230, xMax: -115, zMin: -53, zMax: 53 },   // #4
    { xMin: 115, xMax: 230, zMin: 53, zMax: 160 },     // #5
    { xMin: -115, xMax: 0, zMin: 53, zMax: 160 },      // #6
    { xMin: -230, xMax: -115, zMin: -160, zMax: -53 }, // #7
    { xMin: 0, xMax: 115, zMin: 53, zMax: 160 },       // #8
  ];
  // Everything past the explicit mountains lives back here — a much
  // deeper band that was previously just empty space between the
  // "normal" placement range and the physical edge of the plane.
  const BACKGROUND_Z_MIN = 160;
  const BACKGROUND_Z_MAX = 330;
  // Background mountains skew right (positive X) rather than spreading
  // evenly — the left side already reads full from the explicit zones,
  // the right side had more empty sky.
  const BACKGROUND_X_MIN = -PEAK_SPAN * 0.42;
  const BACKGROUND_X_MAX = PEAK_SPAN * 0.78;
  const BACKGROUND_X_BIAS = 0.55; // <1 skews sampling toward BACKGROUND_X_MAX

  function buildPeakCenters(seed) {
    const centers = [];
    const mainCount = Math.max(1, Math.round(state.peakCount));
    const sideCount = Math.max(0, Math.round(state.sideCount));
    const minSpacing = 42; // keep peaks from stacking on top of each other,
                            // so there's visible gap/depth between them

    function placeIn(xMin, xMax, zMin, zMax, rngBase, centerBias, xBiasPow) {
      // A handful of random (x, z) candidates within the given bounds,
      // picking the first that's far enough from every peak placed so
      // far — falls back to the last attempt if it never finds a
      // clean spot, rather than looping forever. centerBias < 1
      // shrinks the sampled area toward the middle of the bounds, so
      // a mountain doesn't spawn right at its zone's edge next to a
      // neighboring one. xBiasPow < 1 skews candidates toward xMax
      // (>1 would skew toward xMin) instead of sampling evenly.
      const cxCenter = (xMin + xMax) / 2, czCenter = (zMin + zMax) / 2;
      const cxSpan = (xMax - xMin) * centerBias, czSpan = (zMax - zMin) * centerBias;
      const biasPow = xBiasPow || 1;
      for (let attempt = 0; attempt < 14; attempt++) {
        let rx = hashRandom(rngBase + attempt * 3.37);
        if (biasPow !== 1) rx = Math.pow(rx, biasPow);
        const rz = hashRandom(rngBase + attempt * 5.71 + 11);
        const cx = cxCenter + (rx - 0.5) * cxSpan;
        const cz = czCenter + (rz - 0.5) * czSpan;
        let ok = true;
        for (const p of centers) {
          const dx = cx - p.cx, dz = cz - p.cz;
          if (Math.sqrt(dx * dx + dz * dz) < minSpacing) { ok = false; break; }
        }
        if (ok || attempt === 13) return { cx, cz };
      }
    }

    // Depth scales a peak down (height + width) the farther back it
    // sits — real fake-perspective, on top of the color/fog dimming
    // that already handles "this is far away."
    function finalize(p) {
      const depthT = Math.max(0, Math.min(1, (p.cz + DEPTH_COLOR_SPAN / 2) / DEPTH_COLOR_SPAN));
      const depthScale = 1 - 0.55 * depthT;
      p.effHeight = p.height * depthScale;
      p.effWidth = Math.max(10, p.width * depthScale);
      return p;
    }

    // Explicit per-mountain size (state.peakHeights/peakWidths, set via
    // their own sliders) drives the first MAX_EXPLICIT_PEAKS mountains
    // now, instead of random jitter — a mountain you've sized stays
    // that size across regenerates. Small +/-8% jitter keeps two
    // regenerates from looking identical without meaningfully changing
    // the scale you set.
    function mainSize(i, seedOffset) {
      const baseH = state.peakHeights[i] != null ? state.peakHeights[i] : 90;
      const baseW = state.peakWidths[i] != null ? state.peakWidths[i] : 38;
      const jH = 0.92 + hashRandom(seed * 3.1 + i * 7.7 + seedOffset) * 0.16;
      const jW = 0.92 + hashRandom(seed * 5.3 + i * 2.9 + 1.7 + seedOffset) * 0.16;
      return {
        height: baseH * jH * state.peakHeightScale,
        width: baseW * jW * state.peakWidthScale,
      };
    }

    // Beyond the explicitly-slider-controlled mountains: "a lot more"
    // fills out the deep background procedurally (medium-sized, more
    // varied than side hills) rather than needing dozens more sliders.
    function extraSize(i, seedOffset) {
      const jH = hashRandom(seed * 13.7 + i * 4.3 + seedOffset);
      const jW = hashRandom(seed * 17.1 + i * 2.1 + seedOffset + 5);
      return {
        height: (35 + jH * 55) * state.peakHeightScale,
        width: (20 + jW * 22) * state.peakWidthScale,
      };
    }

    // Anchor peak (mountain #1): always roughly bottom-right (large x,
    // near side of depth), position jittered per-seed so it's never in
    // the exact same spot twice — but its size comes from the slider.
    {
      const jx = hashRandom(seed * 2.2 + 0.4);
      const jz = hashRandom(seed * 4.4 + 0.9);
      const cx = PEAK_SPAN * 0.28 + jx * PEAK_SPAN * 0.2;
      const cz = -DEPTH_COLOR_SPAN * 0.4 + jz * DEPTH_COLOR_SPAN * 0.25;
      const size = mainSize(0, 0);
      centers.push(finalize({ cx, cz, height: size.height, width: size.width, main: true }));
    }

    // Mountains #2-#8: each confined to its own zone above, so they
    // stay roughly in place across regenerates and don't drift into
    // each other. Anything past #8 goes to the deep background band
    // instead — this is also what fills the previously-empty space
    // further back on the Z axis.
    for (let i = 1; i < mainCount; i++) {
      let spot;
      if (i < MAX_EXPLICIT_PEAKS) {
        const zone = MOUNTAIN_ZONES[i - 1];
        spot = placeIn(zone.xMin, zone.xMax, zone.zMin, zone.zMax, seed * 11 + i * 17.3, 0.62);
      } else {
        spot = placeIn(BACKGROUND_X_MIN, BACKGROUND_X_MAX, BACKGROUND_Z_MIN, BACKGROUND_Z_MAX, seed * 29 + i * 19.7 + 400, 0.94, BACKGROUND_X_BIAS);
      }
      const size = i < MAX_EXPLICIT_PEAKS ? mainSize(i, 0) : extraSize(i, 0);
      centers.push(finalize({ cx: spot.cx, cz: spot.cz, height: size.height, width: size.width, main: true }));
    }

    // Side hills — smaller, scattered even more freely, same
    // minimum-spacing rule so they leave visible gaps for depth.
    // Stay procedurally randomized, but track the two global scale
    // sliders so they grow/shrink along with the main mountains
    // instead of looking disconnected once those get much bigger.
    for (let j = 0; j < sideCount; j++) {
      const jH = hashRandom(seed * 6.6 + j * 3.3 + 80);
      const jW = hashRandom(seed * 8.8 + j * 1.1 + 90);
      const spot = placeIn(-PEAK_SPAN / 2, PEAK_SPAN / 2, -DEPTH_COLOR_SPAN / 2, DEPTH_COLOR_SPAN / 2, seed * 23 + j * 13.1 + 200, 1);
      const height = (8 + jH * 8) * state.peakHeightScale * 0.5;
      const width = (12 + jW * 9) * state.peakWidthScale;
      centers.push(finalize({ cx: spot.cx, cz: spot.cz, height, width, main: false }));
    }

    return centers;
  }

  // Pulls a raw X coordinate horizontally toward its nearest peak
  // center (found via true 2D distance, since peaks now have real
  // depth) — the "convergence" effect. Falloff radius is tied to the
  // nearest peak's own footprint (not a fixed constant), so pull
  // stays confined within roughly that mountain's own area instead of
  // bleeding into a neighboring mountain's faces when two peaks sit
  // close together.
  function warpTowardPeaks(rawX, rawY, peakCenters, strength) {
    if (strength <= 0 || !peakCenters.length) return rawX;
    let nearest = peakCenters[0];
    let minDist = Infinity;
    for (const p of peakCenters) {
      const dx = rawX - p.cx, dz = rawY - p.cz;
      const d = Math.sqrt(dx * dx + dz * dz);
      if (d < minDist) { minDist = d; nearest = p; }
    }
    const radius = nearest.effWidth * 0.55;
    const falloff = Math.exp(-(minDist * minDist) / (2 * radius * radius));
    return rawX + (nearest.cx - rawX) * strength * falloff;
  }

  // Subtle secondary texture on top of the peak bumps, so surfaces
  // aren't perfectly smooth cones — kept deliberately minor (see the
  // 0.3 weight below) so the discrete peaks stay the dominant shape.
  function detailNoise(x, z, seed) {
    const f = state.ridgeFreq;
    const a = Math.pow(Math.abs(Math.sin(x * 0.05 * f + seed)), 1.6) * 16;
    const b = Math.pow(Math.abs(Math.cos(z * 0.07 * f + seed * 1.7)), 1.6) * 13;
    const c = Math.pow(Math.abs(Math.sin((x + z) * 0.035 * f + seed * 0.6)), 1.4) * 18;
    const d = Math.sin(x * 0.18 * f - z * 0.14 * f + seed * 2.1) * 4;
    return a + b + c + d - 20;
  }

  // Diagonal envelope: constrains height by left-to-right position so
  // the terrain reads small on the left, tall on the right. `floor`
  // keeps the left edge from being perfectly flat. Tapers over a
  // fixed span rather than the plane's full physical width — see the
  // note on ENVELOPE_SPAN above.
  function envelopeFactor(x) {
    const t = (x + ENVELOPE_SPAN / 2) / ENVELOPE_SPAN;
    const floor = 0.12;
    return floor + (1 - floor) * Math.max(0, Math.min(1, t));
  }

  // Reshapes a plain 0..1 ramp into a staircase of `steps` steep-rise/
  // flat-plateau bands instead of one continuous slope — this is the
  // literal "steep incline, then flat, repeating going up" effect.
  // sharpness < 1 makes each band rise quickly near its start and
  // level off toward its end (steep-then-flat); lower = more abrupt.
  function terraceEase(t, steps, sharpness) {
    if (steps <= 1) return t;
    const clamped = Math.min(0.999999, Math.max(0, t));
    const scaled = clamped * steps;
    const idx = Math.floor(scaled);
    const frac = scaled - idx;
    const eased = Math.pow(frac, sharpness);
    return (idx + eased) / steps;
  }

  function terrainHeight(x, y, seed, peakCenters) {
    let h = 0;
    for (const p of peakCenters) {
      // True 2D distance (x AND z) — this is what makes a peak a real
      // localized 3D bump instead of a ridge running the full depth
      // of the plane.
      const dx = x - p.cx, dz = y - p.cz;
      const dist = Math.sqrt(dx * dx + dz * dz);
      const rawT = Math.max(0, 1 - dist / p.effWidth); // 0 at base, 1 at peak
      const t = terraceEase(rawT, state.terraceSteps, state.terraceSharpness);
      h += t * p.effHeight;
    }
    h += detailNoise(x, y, seed) * 0.3;
    return h * envelopeFactor(x) * state.ridgeAmp * 0.5;
  }

  function approxMaxHeight() {
    const tallest = Math.max(...state.peakHeights.slice(0, Math.max(1, Math.round(state.peakCount))));
    return tallest * state.peakHeightScale * state.ridgeAmp * 0.5;
  }

  // -------------------------------------------------------------
  // Geometry — rebuilt from scratch whenever mesh resolution changes,
  // since Three.js can't resize a BufferGeometry's segment count in
  // place.
  // -------------------------------------------------------------
  const WIDTH = 820;
  // Deliberately deep — extra room on the near-camera side, and extra
  // margin now that peak width can scale up to 3x. A flatter camera
  // angle (or a wide mountain near the placement span's edge) needs
  // more terrain between the visible peaks and the literal edge of
  // the plane, or that edge shows as a hard cutoff / hole where a
  // mountain's own footprint runs past the mesh's actual boundary.
  const DEPTH = 760;
  const BASE_SEG_X = 30;
  const BASE_SEG_Z = 18;

  let geo, posAttr, vertCount, colorAttr;
  let sparkleGeo, sparkleColorAttr;
  let gridX, gridY, target, current;
  let seed = 4.2;

  const faceMaterial = new THREE.MeshLambertMaterial({
    vertexColors: true,
    flatShading: true,
    transparent: true,
    opacity: state.faceOpacity,
    fog: true,
    polygonOffset: true,
    polygonOffsetFactor: 1,
    polygonOffsetUnits: 1,
  });
  const edgeMaterial = new THREE.MeshBasicMaterial({
    vertexColors: true,
    wireframe: true,
    transparent: true,
    opacity: state.edgeOpacity,
    fog: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const sparkleMaterial = new THREE.PointsMaterial({
    vertexColors: true,
    size: 1.8,
    sizeAttenuation: true,
    transparent: true,
    opacity: state.sparkleOpacity * 0.7,
    fog: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const faceMesh = new THREE.Mesh();
  const edgeMesh = new THREE.Mesh();
  let sparkle = new THREE.Points();
  sparkle.material = sparkleMaterial;
  faceMesh.material = faceMaterial;
  edgeMesh.material = edgeMaterial;

  const terrainGroup = new THREE.Group();
  terrainGroup.add(faceMesh, edgeMesh, sparkle);
  terrainGroup.rotation.x = -Math.PI / 2;
  scene.add(terrainGroup);

  const _near = new THREE.Color();
  const _far = new THREE.Color();
  const _highlight = new THREE.Color();
  const _c = new THREE.Color();

  function colorForVertex(y, h) {
    _near.set(state.nearFaceColor);
    _far.set(state.farFaceColor);
    _highlight.set(state.peakHighlightColor);
    const depthT = Math.max(0, Math.min(1, (y + DEPTH_COLOR_SPAN / 2) / DEPTH_COLOR_SPAN));
    _c.copy(_far).lerp(_near, 1 - depthT); // smaller y (nearer camera) -> near color
    const peakT = Math.max(0, Math.min(1, h / approxMaxHeight())) * state.peakBoost;
    _c.lerp(_highlight, peakT);
    return _c;
  }

  function recolor() {
    for (let i = 0; i < vertCount; i++) {
      const y = gridY[i];
      const h = target[i];
      const c = colorForVertex(y, h);
      colorAttr.setXYZ(i, c.r, c.g, c.b);
      const depthT = Math.max(0, Math.min(1, (y + DEPTH_COLOR_SPAN / 2) / DEPTH_COLOR_SPAN));
      const fade = 1 - state.depthFade * depthT;
      sparkleColorAttr.setXYZ(i, c.r * fade, c.g * fade, c.b * fade);
    }
    colorAttr.needsUpdate = true;
    sparkleColorAttr.needsUpdate = true;
  }

  // Recomputes shape (peak layout, convergence warp, heights) without
  // touching mesh resolution. Applies instantly — used for the
  // initial build and for any shape-parameter tweak that isn't a
  // seed jump (those go through regenerate(), which can ease in via
  // idle motion instead of snapping).
  function recompute() {
    const peakCenters = buildPeakCenters(seed);
    for (let i = 0; i < vertCount; i++) {
      const rawX = gridX[i];
      const rawY = gridY[i];
      const wx = warpTowardPeaks(rawX, rawY, peakCenters, state.convergence);
      const h = terrainHeight(wx, rawY, seed, peakCenters);
      target[i] = h;
      current[i] = h;
      posAttr.setX(i, wx);
      posAttr.setY(i, rawY);
      posAttr.setZ(i, h);
    }
    posAttr.needsUpdate = true;
    recolor();
  }

  function rebuildGeometry() {
    const segX = Math.max(4, Math.round(BASE_SEG_X * state.meshDetail));
    const segZ = Math.max(3, Math.round(BASE_SEG_Z * state.meshDetail));

    if (geo) geo.dispose();
    if (sparkleGeo) sparkleGeo.dispose();

    geo = new THREE.PlaneGeometry(WIDTH, DEPTH, segX, segZ);
    posAttr = geo.attributes.position;
    vertCount = posAttr.count;

    gridX = new Float32Array(vertCount);
    gridY = new Float32Array(vertCount);
    for (let i = 0; i < vertCount; i++) {
      gridX[i] = posAttr.getX(i);
      gridY[i] = posAttr.getY(i);
    }
    target = new Float32Array(vertCount);
    current = new Float32Array(vertCount);

    colorAttr = new THREE.BufferAttribute(new Float32Array(vertCount * 3), 3);
    geo.setAttribute('color', colorAttr);

    sparkleGeo = new THREE.BufferGeometry();
    sparkleGeo.setAttribute('position', posAttr); // shared reference — moves for free
    sparkleColorAttr = new THREE.BufferAttribute(new Float32Array(vertCount * 3), 3);
    sparkleGeo.setAttribute('color', sparkleColorAttr);

    faceMesh.geometry = geo;
    edgeMesh.geometry = geo;
    sparkle.geometry = sparkleGeo;

    recompute();
  }

  rebuildGeometry();

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
    color: new THREE.Color(state.nearEdgeColor),
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
    if (bigJump) seed += 35 + Math.random() * 45;
    const peakCenters = buildPeakCenters(seed);
    for (let i = 0; i < vertCount; i++) {
      const rawX = gridX[i];
      const rawY = gridY[i];
      const wx = warpTowardPeaks(rawX, rawY, peakCenters, state.convergence);
      const h = terrainHeight(wx, rawY, seed, peakCenters);
      target[i] = h;
      posAttr.setX(i, wx); // horizontal shift snaps immediately
      if (!state.idleMotion) {
        current[i] = h;
        posAttr.setZ(i, h);
      }
    }
    posAttr.needsUpdate = true;
    recolor();
    if (state.idleMotion) reshapeBoost = 1;
  }

  window.reshapeTerrain = function () {
    // Setting 1 (default, autoRegenerate off): the idle code panel
    // still cycles through its "looks" (colors/opacity/ridge amp),
    // but the mountains themselves — positions, widths, how many of
    // them there are — stay exactly as placed.
    if (!state.autoRegenerate) return; // manual "Regenerate Shape" still works — see regenerate() in the API below

    // Setting 2: also re-roll the mountain count and let the usual
    // per-mountain jitter (in buildPeakCenters/mainSize above) reshuffle
    // positions and widths on top of that — a full reshape each time,
    // the way it worked before positions were pinned to fixed zones.
    state.peakCount = Math.round(14 + hashRandom(seed * 13.7 + 91) * 18); // ~14-32 main peaks
    state.sideCount = Math.round(hashRandom(seed * 9.3 + 47) * 6);        // 0-6 side hills
    regenerate(true);
  };

  function animate() {
    requestAnimationFrame(animate);

    updateTweens();

    if (state.idleMotion) {
      const t = clock.getElapsedTime();
      const ease = 0.025 + reshapeBoost * 0.05;
      for (let i = 0; i < vertCount; i++) {
        current[i] += (target[i] - current[i]) * ease;
        const x = gridX[i];
        const wobble = Math.sin(t * 0.6 + x * 0.08) * 0.6;
        posAttr.setZ(i, current[i] + wobble);
      }
      posAttr.needsUpdate = true;
      reshapeBoost *= 0.96;
    }

    // Gentle sky-sparkle twinkle — cheap, always on.
    const tw = clock.getElapsedTime();
    starMaterial.opacity = 0.55 + Math.sin(tw * 1.3) * 0.2;

    renderer.render(scene, activeCamera());
  }

  // -------------------------------------------------------------
  // Public API for the hero code panel (js/hero-window.js) and, while
  // it's on, the "$ enable_ui" panel inside it.
  // -------------------------------------------------------------
  const api = {
    state,
    setCameraType(type) { state.cameraType = type; },
    setCamY(v) { state.camY = v; positionCameras(); },
    setCamZ(v) { state.camZ = v; positionCameras(); updateFog(); },
    setOrthoSize(v) { state.orthoSize = v; setSize(); },
    setFov(v) { state.fov = v; perspCamera.fov = v; perspCamera.updateProjectionMatrix(); },
    setTopHeadroom(v) { state.topHeadroom = v; setSize(); },
    setRidgeAmp(v) { state.ridgeAmp = v; recompute(); },
    setRidgeFreq(v) { state.ridgeFreq = v; recompute(); },

    setPeakCount(v) { state.peakCount = v; recompute(); },
    setSideCount(v) { state.sideCount = v; recompute(); },
    setConvergence(v) { state.convergence = v; recompute(); },
    setTerraceSteps(v) { state.terraceSteps = v; recompute(); },
    setTerraceSharpness(v) { state.terraceSharpness = v; recompute(); },
    setMeshDetail(v) { state.meshDetail = v; rebuildGeometry(); },
    setPeakHeightScale(v) { state.peakHeightScale = v; recompute(); },
    setPeakWidthScale(v) { state.peakWidthScale = v; recompute(); },
    setPeakHeight(index, v) { state.peakHeights[index] = v; recompute(); },
    setPeakWidth(index, v) { state.peakWidths[index] = v; recompute(); },

    setSunColor(hex) { state.sunColor = hex; sunLight.color.set(hex); },
    setSunIntensity(v) { state.sunIntensity = v; sunLight.intensity = v; },
    setSunAzimuth(v) { state.sunAzimuth = v; positionSun(); },
    setSunElevation(v) { state.sunElevation = v; positionSun(); },
    setAmbientColor(hex) { state.ambientColor = hex; ambientLight.color.set(hex); },
    setAmbientIntensity(v) { state.ambientIntensity = v; ambientLight.intensity = v; },

    setNearFaceColor(hex) { state.nearFaceColor = hex; recolor(); },
    setFarFaceColor(hex) { state.farFaceColor = hex; recolor(); },
    setFaceOpacity(v) { state.faceOpacity = v; faceMaterial.opacity = v; },

    setNearEdgeColor(hex) { state.nearEdgeColor = hex; recolor(); starMaterial.color.set(hex); },
    setFarEdgeColor(hex) { state.farEdgeColor = hex; recolor(); },
    setEdgeOpacity(v) { state.edgeOpacity = v; edgeMaterial.opacity = v; },

    setPeakBoost(v) { state.peakBoost = v; recolor(); },
    setDepthFade(v) { state.depthFade = v; recolor(); },

    setIdleMotion(on) { state.idleMotion = on; },
    setAutoRegenerate(on) { state.autoRegenerate = on; },
    regenerate() { regenerate(true); },

    // Applies a temporary partial override, e.g. { ridgeAmp: 0.75,
    // nearFaceColor: '#47ff7e' } — used by the hero code panel
    // (js/hero-window.js) to give its idle rotation more variability:
    // a deliberate, momentary swing away from the defaults so a
    // change plainly reads as one. With durationMs > 0, each value
    // eases smoothly from its current value to the target over that
    // many ms (see startTween below) instead of snapping instantly.
    // meshDetail is the one exception — it drives a full geometry
    // rebuild, not a continuous shader/material value, so it can't be
    // tweened frame-by-frame without rebuilding dozens of times a
    // second; it always applies instantly regardless of durationMs.
    setLook(overrides, durationMs = 0) {
      if (!overrides) return;
      Object.keys(overrides).forEach(key => {
        startTween(key, overrides[key], durationMs);
      });
    },
    // Reverts specific keys (or, with no argument, everything) back to
    // the exact baked-in defaults captured at load — called right
    // before the next code snippet starts typing, so one snippet's
    // look never bleeds into the next. Same durationMs behavior as
    // setLook.
    resetLook(keys, durationMs = 0) {
      const restore = {};
      (keys || Object.keys(DEFAULT_STATE)).forEach(key => {
        if (key in DEFAULT_STATE) restore[key] = DEFAULT_STATE[key];
      });
      this.setLook(restore, durationMs);
    },
  };
  window.heroTerrainAPI = api;

  // -------------------------------------------------------------
  // Tween engine for setLook/resetLook — plain numbers lerp linearly;
  // '#rrggbb' color strings lerp through THREE.Color (proper RGB
  // blend, not a naive string interpolation). Runs off performance.now()
  // so it's independent of the terrain's own idle-motion clock.
  // -------------------------------------------------------------
  let activeTweens = [];
  const _tweenFrom = new THREE.Color();
  const _tweenTo = new THREE.Color();

  function applySetter(key, value) {
    const setterName = 'set' + key.charAt(0).toUpperCase() + key.slice(1);
    if (typeof api[setterName] === 'function') api[setterName](value);
  }

  function startTween(key, toValue, durationMs) {
    // meshDetail rebuilds the whole mesh on every call — always instant.
    if (key === 'meshDetail' || !durationMs || durationMs <= 0) {
      applySetter(key, toValue);
      return;
    }
    const fromValue = state[key];
    if (fromValue === undefined) return;
    activeTweens = activeTweens.filter(t => t.key !== key); // supersede any in-flight tween on this key
    activeTweens.push({
      key,
      from: fromValue,
      to: toValue,
      isColor: typeof fromValue === 'string' && fromValue.charAt(0) === '#',
      duration: durationMs,
      startTime: performance.now(),
    });
  }

  function updateTweens() {
    if (!activeTweens.length) return;
    const now = performance.now();
    activeTweens = activeTweens.filter(t => {
      const raw = Math.min(1, (now - t.startTime) / t.duration);
      const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2; // easeInOutQuad
      if (t.isColor) {
        _tweenFrom.set(t.from);
        _tweenTo.set(t.to);
        _tweenFrom.lerp(_tweenTo, eased);
        applySetter(t.key, '#' + _tweenFrom.getHexString());
      } else {
        applySetter(t.key, t.from + (t.to - t.from) * eased);
      }
      return raw < 1;
    });
  }

  positionCameras();
  updateFog();
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