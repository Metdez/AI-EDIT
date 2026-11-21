// Shared helpers for every scene. Everything here is pure: no clocks, no Math.random().
export const C = {
  ground: 0x0a1022, grid: 0x1b2b52, gridMajor: 0x2c4580, ink: 0x9cc2ff,
  pink: 0xec8796, orange: 0xf6b04a, purple: 0x8f7fd6, navy: 0x111827, bone: 0xede6da, white: 0xffffff,
};
export const PALETTE = [C.pink, C.orange, C.purple, C.bone];

export function mulberry(a) {
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const clamp01 = (x) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lin = (a, b, x) => clamp01((x - a) / (b - a));
export const sstep = (a, b, x) => { const t = lin(a, b, x); return t * t * (3 - 2 * t); };
export const eOut = (a, b, x) => 1 - Math.pow(1 - lin(a, b, x), 3);
export const eIn = (a, b, x) => Math.pow(lin(a, b, x), 3);
export const eInOut = (a, b, x) => { const t = lin(a, b, x); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
export const mix = (a, b, t) => a + (b - a) * t;
export const frac = (x) => x - Math.floor(x);
// integral of a 0->1 linear speed ramp between t0 and t1: lets things accelerate while staying a pure function of t
export const ramp = (t0, t1, t) => (t <= t0 ? 0 : t < t1 ? (t - t0) * (t - t0) / (2 * (t1 - t0)) : (t1 - t0) / 2 + (t - t1));

export function newScene(THREE, fogNear = 14, fogFar = 42) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(C.ground);
  scene.fog = new THREE.Fog(C.ground, fogNear, fogFar);
  return scene;
}

export function addLights(THREE, scene) {
  const key = new THREE.DirectionalLight(0xfff1e0, 2.4); key.position.set(-6, 9, 6);
  const rim = new THREE.DirectionalLight(0x8fb8ff, 1.0); rim.position.set(4, 3, -8);
  const hemi = new THREE.HemisphereLight(0x9fb4ff, 0x0a1022, 0.55);
  scene.add(key, rim, hemi);
  return { key, rim, hemi };
}

function segs(THREE, arr, color, opacity, clip) {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(arr, 3));
  const mat = new THREE.LineBasicMaterial({ color, transparent: true, opacity, depthWrite: false, clippingPlanes: clip || null });
  return new THREE.LineSegments(geo, mat);
}
export const lineSegs = segs;

// XZ grid; minor + major lines
export function makeGrid(THREE, half = 30, step = 1, majorEvery = 5, clip) {
  const minor = [], major = [];
  for (let k = -half; k <= half; k += step) {
    const arr = Math.round(k / step) % majorEvery === 0 ? major : minor;
    arr.push(-half, 0, k, half, 0, k, k, 0, -half, k, 0, half);
  }
  const g = new THREE.Group();
  g.add(segs(THREE, minor, C.grid, 1, clip), segs(THREE, major, C.gridMajor, 1, clip));
  return g;
}

// Scan: world-space clip planes. solid keeps n.p <= h, wire keeps n.p >= h.
export function makeScan(THREE, axis = "y") {
  const n = axis === "y" ? new THREE.Vector3(0, 1, 0) : axis === "x" ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
  const solid = new THREE.Plane(n.clone().negate(), 0);
  const wire = new THREE.Plane(n.clone(), 0);
  return { solid: [solid], wire: [wire], set(h) { solid.constant = h; wire.constant = -h; } };
}

// The pink scan sheet that shows where the fill front is.
export function makeSheet(THREE, size = 12, axis = "y") {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size),
    new THREE.MeshBasicMaterial({ color: C.pink, transparent: true, opacity: 0.08, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
  const s = size / 2;
  const edge = segs(THREE, [-s, -s, 0, s, -s, 0, s, -s, 0, s, s, 0, s, s, 0, -s, s, 0, -s, s, 0, -s, -s, 0], C.pink, 0.9);
  edge.material.fog = false;
  g.add(m, edge);
  if (axis === "y") g.rotation.x = -Math.PI / 2;
  if (axis === "x") g.rotation.y = Math.PI / 2;
  g.userData.axis = axis;
  return g;
}
export function placeSheet(sheet, h, visible) {
  sheet.visible = visible;
  const a = sheet.userData.axis;
  if (a === "y") sheet.position.y = h; else if (a === "x") sheet.position.x = h; else sheet.position.z = h;
}

// Blueprint pair: a shaded solid (clipped below the scan) + its ink edges (clipped above it).
export function bp(THREE, geo, color, scan, o = {}) {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color, roughness: o.rough ?? 0.5, metalness: o.metal ?? 0.05, flatShading: o.flat ?? false,
    clippingPlanes: scan ? scan.solid : null, side: THREE.DoubleSide, emissive: o.emissive ?? 0x000000, emissiveIntensity: o.ei ?? 1,
    vertexColors: !!o.vertexColors,
  });
  const mesh = new THREE.Mesh(geo, mat);
  const eg = o.edges || new THREE.EdgesGeometry(geo, o.angle ?? 20);
  const lines = new THREE.LineSegments(eg, new THREE.LineBasicMaterial({ color: o.wire ?? C.ink, transparent: true, opacity: 0.95, clippingPlanes: scan ? scan.wire : null }));
  g.add(mesh, lines);
  g.userData = { mesh, lines, count: eg.attributes.position.count };
  return g;
}
// draw-on: show fraction f of the ink segments
export function drawOn(obj, f) {
  const n = obj.userData.count;
  obj.userData.lines.geometry.setDrawRange(0, Math.floor((n / 2) * clamp01(f)) * 2);
}

// Latitude/longitude wire sphere (reads as a drafted sphere, unlike triangle edges)
export function latLong(THREE, r = 1, nLat = 8, nLon = 12, seg = 48) {
  const a = [];
  for (let i = 1; i < nLat; i++) {
    const phi = (i / nLat) * Math.PI, y = r * Math.cos(phi), rr = r * Math.sin(phi);
    for (let k = 0; k < seg; k++) {
      const t0 = (k / seg) * Math.PI * 2, t1 = ((k + 1) / seg) * Math.PI * 2;
      a.push(rr * Math.cos(t0), y, rr * Math.sin(t0), rr * Math.cos(t1), y, rr * Math.sin(t1));
    }
  }
  for (let j = 0; j < nLon; j++) {
    const th = (j / nLon) * Math.PI * 2;
    for (let k = 0; k < seg; k++) {
      const p0 = (k / seg) * Math.PI, p1 = ((k + 1) / seg) * Math.PI;
      a.push(r * Math.sin(p0) * Math.cos(th), r * Math.cos(p0), r * Math.sin(p0) * Math.sin(th),
        r * Math.sin(p1) * Math.cos(th), r * Math.cos(p1), r * Math.sin(p1) * Math.sin(th));
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.Float32BufferAttribute(a, 3));
  return geo;
}

// soft round sprite texture for points / glows
export function dotTexture(THREE, size = 64, hard = 0.35) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const x = c.getContext("2d");
  const g = x.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
  g.addColorStop(0, "rgba(255,255,255,1)"); g.addColorStop(hard, "rgba(255,255,255,0.85)"); g.addColorStop(1, "rgba(255,255,255,0)");
  x.fillStyle = g; x.fillRect(0, 0, size, size);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function camLook(cam, x, y, z, tx = 0, ty = 0, tz = 0) { cam.position.set(x, y, z); cam.lookAt(tx, ty, tz); }
export function newCam(THREE, fov = 40) { return new THREE.PerspectiveCamera(fov, 16 / 9, 0.1, 400); }
