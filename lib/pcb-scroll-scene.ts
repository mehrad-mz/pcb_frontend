// @ts-nocheck
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

const TRACE_Y = 0.09;
const TRACE_SURFACE_Y = TRACE_Y + 0.022;
const TRACE_W = 0.16;
const TRACE_W_THIN = 0.09;
const TRACE_FILLET_RADIUS = 0.45;
const TRACE_FILLET_ARC_SEGMENTS = 8;

function buildManhattanPath(nodes, y) {
  const pts = [];
  for (let i = 0; i < nodes.length; i++) {
    const curr = nodes[i];
    if (i === 0) {
      pts.push(new THREE.Vector3(curr.x, y, curr.z));
      continue;
    }
    const prev = nodes[i - 1];
    if (Math.abs(prev.x - curr.x) > 0.001) {
      pts.push(new THREE.Vector3(curr.x, y, prev.z));
    }
    if (Math.abs(prev.z - curr.z) > 0.001) {
      pts.push(new THREE.Vector3(curr.x, y, curr.z));
    }
  }
  return pts;
}

/** Round 90° Manhattan corners with circular fillets. */
function filletPolyline(points, radius, segmentsPerArc = TRACE_FILLET_ARC_SEGMENTS) {
  if (points.length < 3) {
    return points.map((p) => p.clone());
  }

  const out = [points[0].clone()];

  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const corner = points[i];
    const next = points[i + 1];

    const vIn = new THREE.Vector3().subVectors(corner, prev);
    const vOut = new THREE.Vector3().subVectors(next, corner);
    const lenIn = vIn.length();
    const lenOut = vOut.length();

    if (lenIn < 1e-4 || lenOut < 1e-4) {
      out.push(corner.clone());
      continue;
    }

    vIn.divideScalar(lenIn);
    vOut.divideScalar(lenOut);

    if (Math.abs(vIn.dot(vOut)) > 0.05) {
      out.push(corner.clone());
      continue;
    }

    const r = Math.min(radius, lenIn * 0.45, lenOut * 0.45);
    if (r < 0.02) {
      out.push(corner.clone());
      continue;
    }

    const entry = new THREE.Vector3().copy(corner).addScaledVector(vIn, -r);
    const exit = new THREE.Vector3().copy(corner).addScaledVector(vOut, r);
    const center = new THREE.Vector3()
      .copy(corner)
      .addScaledVector(vIn, -r)
      .addScaledVector(vOut, r);

    out.push(entry);

    const startAngle = Math.atan2(entry.z - center.z, entry.x - center.x);
    const endAngle = Math.atan2(exit.z - center.z, exit.x - center.x);
    let sweep = endAngle - startAngle;
    const cross = vIn.x * vOut.z - vIn.z * vOut.x;
    if (cross > 0 && sweep < 0) sweep += Math.PI * 2;
    if (cross < 0 && sweep > 0) sweep -= Math.PI * 2;

    for (let s = 1; s <= segmentsPerArc; s++) {
      const ang = startAngle + sweep * (s / segmentsPerArc);
      out.push(
        new THREE.Vector3(
          center.x + Math.cos(ang) * r,
          corner.y,
          center.z + Math.sin(ang) * r,
        ),
      );
    }
  }

  out.push(points[points.length - 1].clone());
  return out;
}

function buildFilletedManhattanPath(nodes, y, radius = TRACE_FILLET_RADIUS) {
  return filletPolyline(buildManhattanPath(nodes, y), radius);
}

const mainCircuitNodes = [
  { x: -8.2, z: -5.8 },
  { x: -8.2, z: -2.0 },
  { x: -4.0, z: -2.0 },
  { x: -4.0, z: 0.2 },
  { x: -1.0, z: 0.2 },
  { x: -1.0, z: 1.8 },
  { x: 3.5, z: 1.8 },
  { x: 3.5, z: 4.8 },
  { x: 8.2, z: 4.8 },
  { x: 8.2, z: 6.2 },
];

function buildPolylineSamples(points, samplesPerUnit) {
  const samples = [];
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    const segLen = a.distanceTo(b);
    const steps = Math.max(2, Math.ceil(segLen * samplesPerUnit));
    for (let s = 0; s < steps; s++) {
      if (i > 0 && s === 0) continue;
      const t = s / steps;
      samples.push(new THREE.Vector3().lerpVectors(a, b, t));
    }
  }
  samples.push(points[points.length - 1].clone());
  return samples;
}

function getPolylinePoint(samples, t) {
  if (samples.length < 2) return samples[0]?.clone() || new THREE.Vector3();
  const clamped = THREE.MathUtils.clamp(t, 0, 1);
  let total = 0;
  const segLens = [];
  for (let i = 0; i < samples.length - 1; i++) {
    const len = samples[i].distanceTo(samples[i + 1]);
    segLens.push(len);
    total += len;
  }
  let dist = clamped * total;
  for (let i = 0; i < segLens.length; i++) {
    if (dist <= segLens[i]) {
      const localT = segLens[i] > 0 ? dist / segLens[i] : 0;
      return new THREE.Vector3().lerpVectors(samples[i], samples[i + 1], localT);
    }
    dist -= segLens[i];
  }
  return samples[samples.length - 1].clone();
}

function getCanvasViewport(canvas) {
  const w = Math.round(canvas.clientWidth);
  const h = Math.round(canvas.clientHeight);
  return {
    width: Math.max(1, w),
    height: Math.max(1, h),
  };
}

const LOW_POWER_MAX_PIXELS = 480_000;

function getPixelRatio(isMobile, lowPowerMode, width, height) {
  if (!lowPowerMode) {
    return Math.min(window.devicePixelRatio || 1, isMobile ? 1.25 : 1.5);
  }
  const cssPixels = Math.max(1, width) * Math.max(1, height);
  return Math.min(1, Math.sqrt(LOW_POWER_MAX_PIXELS / cssPixels));
}

/**
 * Full PCB scroll scene from pcb_mvt-main-2, adapted for the dark landing page.
 */
export function createPcbScrollScene(canvas, options = {}) {
  const {
    prefersReducedMotion = false,
    isMobile = false,
    lowPowerMode = false,
    theme = 'dark',
  } = options;

  const isDark = theme === 'dark';
  const bgColor = isDark ? 0x172b26 : 0xc8d4dc;
  const { width: initialWidth, height: initialHeight } = getCanvasViewport(canvas);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !lowPowerMode && !isMobile,
    alpha: isDark,
    powerPreference: lowPowerMode ? 'low-power' : 'default',
  });
  renderer.setPixelRatio(getPixelRatio(isMobile, lowPowerMode, initialWidth, initialHeight));
  renderer.setSize(initialWidth, initialHeight, false);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = isDark ? 1.15 : 1.05;
  if (!isDark) {
    renderer.setClearColor(bgColor, 1);
  }

  const scene = new THREE.Scene();
  if (isDark) {
    scene.background = new THREE.Color(bgColor);
    if (!lowPowerMode) {
      scene.fog = new THREE.Fog(bgColor, 28, 52);
    }
  } else if (!lowPowerMode) {
    scene.fog = new THREE.Fog(bgColor, 18, 42);
  }

  const camera = new THREE.PerspectiveCamera(
    isMobile ? 42 : 38,
    initialWidth / initialHeight,
    0.1,
    100
  );
  scene.add(camera);

  scene.add(new THREE.AmbientLight(0xffffff, isDark ? 0.78 : 0.85));

  const keyLight = new THREE.DirectionalLight(0xffffff, isDark ? 1.55 : 1.1);
  keyLight.position.set(8, 14, 6);
  scene.add(keyLight);

  const fillLight = new THREE.DirectionalLight(isDark ? 0xb0ffde : 0xdce8f0, isDark ? 0.55 : 0.55);
  fillLight.position.set(-6, 8, -4);
  scene.add(fillLight);

  const boardLight = new THREE.PointLight(0x00d67e, isDark ? 0.35 : 0.2, 28, 2);
  boardLight.position.set(0, 6, 0);
  scene.add(boardLight);

  const boardGroup = new THREE.Group();
  boardGroup.rotation.y = -0.25;
  if (isMobile) {
    boardGroup.position.set(0.5, 0, 0.5);
    boardGroup.scale.setScalar(0.92);
  }
  scene.add(boardGroup);

  const branchCircuitA = buildFilletedManhattanPath([
    { x: -4.0, z: -2.0 },
    { x: -4.0, z: -4.5 },
    { x: -3.5, z: -4.5 },
    { x: -3.5, z: -5.5 },
  ], TRACE_Y);

  const branchCircuitB = buildFilletedManhattanPath([
    { x: 1.2, z: 1.8 },
    { x: 3.0, z: 1.8 },
    { x: 3.0, z: 0.5 },
    { x: 5.0, z: 0.5 },
  ], TRACE_Y);

  const branchCircuitC = buildFilletedManhattanPath([
    { x: 3.5, z: 4.8 },
    { x: 3.5, z: 6.5 },
    { x: 1.0, z: 6.5 },
  ], TRACE_Y);

  const mainCircuitPath = buildFilletedManhattanPath(mainCircuitNodes, TRACE_Y);

  function createPcbTexture() {
    const size = 1024;
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    const ctx = c.getContext('2d');

    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#2d7a52');
    grad.addColorStop(0.5, '#358f5e');
    grad.addColorStop(1, '#266b45');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = 'rgba(255,255,255,0.06)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= size; i += 32) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, size);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(size, i);
      ctx.stroke();
    }

    function drawTexPath(points, w) {
      if (points.length < 2) return;

      ctx.strokeStyle = 'rgba(220, 160, 70, 0.82)';
      ctx.lineWidth = w;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();

      const toCanvas = (p) => ({
        x: ((p.x + 11) / 22) * size,
        y: ((p.z + 8) / 16) * size,
      });

      const start = toCanvas(points[0]);
      ctx.moveTo(start.x, start.y);
      for (let i = 1; i < points.length; i++) {
        const pt = toCanvas(points[i]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.stroke();
    }

    function drawPad(x, z, r) {
      const px = ((x + 11) / 22) * size;
      const py = ((z + 8) / 16) * size;
      ctx.fillStyle = 'rgba(220, 160, 70, 0.9)';
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function drawFootprint(x, z, label) {
      const cx = ((x + 11) / 22) * size;
      const cy = ((z + 8) / 16) * size;
      const w = size * 0.04;
      const h = size * 0.035;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.fillRect(cx - w / 2, cy - h / 2, w, h);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.font = '600 18px sans-serif';
      ctx.fillText(label, cx - w * 0.22, cy + 6);
    }

    drawTexPath(mainCircuitPath, 6);
    drawTexPath(branchCircuitA, 4);
    drawTexPath(branchCircuitB, 4);
    drawTexPath(branchCircuitC, 4);

    [
      [-8.2, -5.8], [-5.2, -2.8], [-1.0, 0.8], [3.5, 3.8], [8.2, 6.2],
    ].forEach(([x, z]) => drawPad(x, z, 5));

    drawFootprint(-1.0, 0.8, 'U1');
    drawFootprint(3.5, 3.8, 'U2');

    ctx.strokeStyle = 'rgba(255,255,255,0.2)';
    ctx.lineWidth = 3;
    ctx.strokeRect(size * 0.04, size * 0.06, size * 0.92, size * 0.88);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 8;
    return tex;
  }

  const board = new THREE.Mesh(
    new THREE.BoxGeometry(22, 0.35, 16),
    new THREE.MeshStandardMaterial({
      color: 0x358f5e,
      map: createPcbTexture(),
      roughness: 0.48,
      metalness: 0.08,
    })
  );
  board.position.y = -0.18;
  boardGroup.add(board);

  const boardEdge = new THREE.Mesh(
    new THREE.BoxGeometry(22.08, 0.12, 16.08),
    new THREE.MeshStandardMaterial({ color: 0x1e5c3f, roughness: 0.75 })
  );
  boardEdge.position.y = -0.42;
  boardGroup.add(boardEdge);

  const copperMat = new THREE.MeshStandardMaterial({
    color: 0xd4943a,
    roughness: 0.22,
    metalness: 0.92,
  });

  const copperDimMat = new THREE.MeshStandardMaterial({
    color: 0xa86a28,
    roughness: 0.32,
    metalness: 0.78,
  });

  function addTraceSegment(ax, az, bx, bz, width, mat) {
    const material = mat || copperMat;
    const dx = bx - ax;
    const dz = bz - az;
    const len = Math.sqrt(dx * dx + dz * dz);
    if (len < 0.001) return;

    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(
        Math.abs(dx) > Math.abs(dz) ? len : width,
        0.045,
        Math.abs(dz) >= Math.abs(dx) ? len : width
      ),
      material
    );
    mesh.position.set((ax + bx) / 2, TRACE_Y - 0.01, (az + bz) / 2);
    boardGroup.add(mesh);

    const pad = new THREE.Mesh(
      new THREE.CylinderGeometry(width * 0.55, width * 0.55, 0.05, 10),
      material
    );
    pad.position.set(bx, TRACE_Y - 0.01, bz);
    boardGroup.add(pad);
  }

  function drawCircuitTraces(points, width, mat) {
    for (let i = 0; i < points.length - 1; i++) {
      addTraceSegment(points[i].x, points[i].z, points[i + 1].x, points[i + 1].z, width, mat);
    }
  }

  drawCircuitTraces(mainCircuitPath, TRACE_W, copperMat);
  drawCircuitTraces(branchCircuitA, TRACE_W_THIN, copperDimMat);
  drawCircuitTraces(branchCircuitB, TRACE_W_THIN, copperDimMat);
  drawCircuitTraces(branchCircuitC, TRACE_W_THIN, copperDimMat);

  function addChip(w, h, d, x, z, label) {
    const g = new THREE.Group();
    const body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      new THREE.MeshStandardMaterial({
        color: 0x3a4a48,
        roughness: 0.55,
        metalness: 0.2,
        emissive: 0x000000,
        emissiveIntensity: 0,
      })
    );
    body.position.y = h / 2 + 0.02;
    g.add(body);

    const pinMat = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.3, metalness: 0.9 });
    const pinCount = Math.floor(w * 2);
    for (let i = 0; i < pinCount; i++) {
      const px = -w / 2 + (i + 0.5) * (w / pinCount);
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.08, 0.18), pinMat);
      pin.position.set(px, 0.06, d / 2 + 0.05);
      g.add(pin);
      const pin2 = pin.clone();
      pin2.position.z = -d / 2 - 0.05;
      g.add(pin2);
    }

    g.position.set(x, 0, z);
    g.userData.label = label;
    boardGroup.add(g);
    return g;
  }

  function addCap(x, z) {
    const cap = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.35, 16),
      new THREE.MeshStandardMaterial({ color: 0x4a5558, roughness: 0.5, metalness: 0.15 })
    );
    cap.position.set(x, 0.22, z);
    boardGroup.add(cap);
    return cap;
  }

  function addResistor(x, z) {
    const r = new THREE.Mesh(
      new THREE.BoxGeometry(0.55, 0.18, 0.22),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, roughness: 0.55 })
    );
    r.position.set(x, 0.14, z);
    boardGroup.add(r);
    return r;
  }

  function addConnector(x, z) {
    const g = new THREE.Group();
    const base = new THREE.Mesh(
      new THREE.BoxGeometry(1.4, 0.25, 0.8),
      new THREE.MeshStandardMaterial({
        color: 0x3a4a48,
        roughness: 0.45,
        metalness: 0.35,
        emissive: 0x000000,
        emissiveIntensity: 0,
      })
    );
    base.position.y = 0.16;
    g.add(base);
    for (let i = 0; i < 8; i++) {
      const pad = new THREE.Mesh(
        new THREE.BoxGeometry(0.1, 0.06, 0.1),
        new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.25, metalness: 0.95 })
      );
      pad.position.set(-0.525 + i * 0.15, 0.32, 0);
      g.add(pad);
    }
    g.position.set(x, 0, z);
    boardGroup.add(g);
    return g;
  }

  const milestone0 = addConnector(-8.2, -5.8);
  addCap(-7.0, -4.0);
  addResistor(-5.5, -2.5);
  const milestone1 = addChip(1.6, 0.35, 1.2, -1.0, 0.8, 'DFM');
  addCap(-0.5, 2.2);
  addResistor(2.0, 3.0);
  const milestone2 = addChip(2.8, 0.55, 2.8, 3.5, 3.8, 'Fabrication');
  addCap(4.8, 5.2);
  addResistor(5.5, 4.5);
  addCap(6.8, 6.0);
  const milestone3 = addConnector(8.2, 6.2);

  const milestoneGroups = [milestone0, milestone1, milestone2, milestone3];

  const viaMat = new THREE.MeshStandardMaterial({ color: 0xd4943a, roughness: 0.25, metalness: 0.9 });
  const viaCount = lowPowerMode ? 8 : 40;
  for (let i = 0; i < viaCount; i++) {
    const via = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.06, 8), viaMat);
    via.position.set(
      THREE.MathUtils.randFloatSpread(18),
      0.04,
      THREE.MathUtils.randFloatSpread(13)
    );
    boardGroup.add(via);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.08, 0.012, 8, 16),
      viaMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.copy(via.position);
    ring.position.y = 0.045;
    boardGroup.add(ring);
  }

  const circuitSamples = buildPolylineSamples(mainCircuitPath, 14);
  const PATH_SEGMENTS = circuitSamples.length - 1;
  const pathPositions = new Float32Array(circuitSamples.length * 3);
  circuitSamples.forEach((p, i) => {
    pathPositions[i * 3] = p.x;
    pathPositions[i * 3 + 1] = TRACE_SURFACE_Y;
    pathPositions[i * 3 + 2] = p.z;
  });

  const pathGeometry = new THREE.BufferGeometry();
  pathGeometry.setAttribute('position', new THREE.BufferAttribute(pathPositions, 3));
  pathGeometry.setDrawRange(0, 2);

  const glowCore = new THREE.Line(
    pathGeometry,
    new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
  );
  boardGroup.add(glowCore);

  const glowOuterGeom = pathGeometry.clone();
  const glowOuter = new THREE.Line(
    glowOuterGeom,
    new THREE.LineBasicMaterial({
      color: isDark ? 0x00d67e : 0xff6b35,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
    })
  );
  boardGroup.add(glowOuter);

  const glowWideGeom = pathGeometry.clone();
  const glowWide = new THREE.Line(
    glowWideGeom,
    new THREE.LineBasicMaterial({
      color: 0x348e75,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending,
    })
  );
  boardGroup.add(glowWide);

  const pulse = new THREE.Mesh(
    new THREE.SphereGeometry(0.09, 16, 16),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 1 })
  );
  boardGroup.add(pulse);

  pulse.add(
    new THREE.Mesh(
      new THREE.SphereGeometry(0.17, 16, 16),
      new THREE.MeshBasicMaterial({
        color: isDark ? 0x00d67e : 0xff6b35,
        transparent: true,
        opacity: 0.5,
        blending: THREE.AdditiveBlending,
      })
    )
  );

  let composer = null;
  let bloom = null;
  const useComposer = !prefersReducedMotion && !isMobile && !lowPowerMode;

  if (useComposer) {
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(
      new THREE.Vector2(initialWidth, initialHeight),
      0.45,
      0.3,
      0.18
    );
    composer.addPass(bloom);
  }

  const gl = renderer.getContext();
  canvas.addEventListener("webglcontextlost", (event) => {
    event.preventDefault();
  });

  const CAM_OFFSET = new THREE.Vector3(
    isMobile ? 2.6 : 3.2,
    isMobile ? 4.8 : 5.5,
    isMobile ? 3.2 : 3.8
  );
  const pulseWorld = new THREE.Vector3();
  const camGoal = new THREE.Vector3();
  const lookGoal = new THREE.Vector3();
  const lookSmooth = new THREE.Vector3();
  let cameraReady = false;
  let activeMilestone = -1;

  const smoothScroll = { target: 0, current: 0 };
  const scrollLerp = lowPowerMode ? 0.14 : 0.07;

  function setPathProgress(t) {
    const clamped = THREE.MathUtils.clamp(t, 0, 1);
    const count = Math.max(2, Math.floor(clamped * PATH_SEGMENTS) + 1);
    pathGeometry.setDrawRange(0, count);
    glowOuterGeom.setDrawRange(0, count);
    glowWideGeom.setDrawRange(0, count);

    const point = getPolylinePoint(circuitSamples, clamped);
    pulse.position.set(point.x, TRACE_SURFACE_Y, point.z);

    const scale = 1 + Math.sin(performance.now() * 0.008) * 0.1;
    pulse.scale.setScalar(scale);
  }

  function updateCameraFollowPulse() {
    pulse.getWorldPosition(pulseWorld);

    camGoal.set(
      pulseWorld.x + CAM_OFFSET.x,
      pulseWorld.y + CAM_OFFSET.y,
      pulseWorld.z + CAM_OFFSET.z
    );
    lookGoal.copy(pulseWorld);
    lookGoal.y += 0.02;

    if (!cameraReady) {
      camera.position.copy(camGoal);
      lookSmooth.copy(lookGoal);
      cameraReady = true;
    } else {
      camera.position.lerp(camGoal, 0.1);
      lookSmooth.lerp(lookGoal, 0.12);
    }

    camera.lookAt(lookSmooth);
  }

  function highlightMilestone(index) {
    if (index === activeMilestone) return;
    activeMilestone = index;
    milestoneGroups.forEach((group, i) => {
      const body = group?.children?.[0];
      if (body?.material?.emissive) {
        body.material.emissive.setHex(i === index ? 0x00d67e : 0x000000);
        body.material.emissiveIntensity = i === index ? 0.45 : 0;
      }
    });
  }

  function setScrollTarget(t) {
    smoothScroll.target = THREE.MathUtils.clamp(t, 0, 1);
    if (prefersReducedMotion) {
      smoothScroll.current = smoothScroll.target;
      tick();
      if (composer) composer.render();
      else renderer.render(scene, camera);
    }
  }

  function isScrollAnimating() {
    return Math.abs(smoothScroll.target - smoothScroll.current) > 0.001;
  }

  function tick() {
    smoothScroll.current += (smoothScroll.target - smoothScroll.current) * scrollLerp;
    if (Math.abs(smoothScroll.target - smoothScroll.current) < 0.0005) {
      smoothScroll.current = smoothScroll.target;
    }
    setPathProgress(smoothScroll.current);
    updateCameraFollowPulse();
    if (bloom) {
      bloom.strength = 0.4 + smoothScroll.current * 0.25;
    }
  }

  function render() {
    tick();
    if (composer) composer.render();
    else renderer.render(scene, camera);
  }

  function advanceScroll() {
    tick();
  }

  function resize() {
    const { width, height } = getCanvasViewport(canvas);
    if (width < 2 || height < 2) return;

    camera.aspect = width / height;
    camera.fov = isMobile ? 42 : 38;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(getPixelRatio(isMobile, lowPowerMode, width, height));
    renderer.setSize(width, height, false);
    if (composer) composer.setSize(width, height);
    if (bloom) bloom.resolution.set(width, height);
  }

  setPathProgress(0);
  updateCameraFollowPulse();
  highlightMilestone(0);
  resize();

  return {
    render,
    advanceScroll,
    resize,
    setScrollTarget,
    highlightMilestone,
    setPathProgress,
    updateCameraFollowPulse,
    isScrollAnimating,
    dispose: () => {
      renderer.dispose();
      pathGeometry.dispose();
      glowOuterGeom.dispose();
      glowWideGeom.dispose();
    },
  };
}
