// Shot 11 (43.4-54.1): the flash becomes a sun; blueprint orbits + force vectors while AI writes the code; a Keplerian disc fills in on "ideas".
import { C, newScene, addLights, makeScan, makeSheet, placeSheet, latLong, lineSegs, dotTexture, mulberry, eInOut, eOut, mix, ramp, lin, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, scan, sheet, sun, sunWire, rings, ringCount, disc, glow, flashCol, ground;
const ND = 1500, disk = [], probes = [], arrows = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 18, 60);
  ground = new THREE.Color(C.ground); flashCol = new THREE.Color(0xffe6ea);
  const Lt = addLights(THREE, scene); Lt.key.intensity = 1.2;
  scene.add(new THREE.PointLight(0xffd9a0, 40, 0, 1.4));
  cam = newCam(THREE, 40);
  cam.setViewOffset(1920, 1080, -250, 0, 1920, 1080); // subject sits right of the code panel
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 4, "y");
  scene.add(sheet);
  sun = new THREE.Mesh(new THREE.SphereGeometry(0.9, 40, 24), new THREE.MeshBasicMaterial({ color: 0xffb347, clippingPlanes: scan.solid }));
  sunWire = new THREE.LineSegments(latLong(THREE, 0.92, 8, 12, 40), new THREE.LineBasicMaterial({ color: C.orange, clippingPlanes: scan.wire }));
  glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(THREE, 128, 0.05), color: C.orange, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(4.5);
  scene.add(sun, sunWire, glow);
  const o = [];
  [1.6, 2.2, 2.8, 3.5, 4.2, 4.9, 5.6].forEach((r) => { for (let k = 0; k < 96; k++) { const a0 = (k / 96) * Math.PI * 2, a1 = ((k + 1) / 96) * Math.PI * 2; o.push(Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r); } });
  rings = lineSegs(THREE, o, C.ink, 0.45); ringCount = o.length / 3;
  scene.add(rings);
  // probe bodies + force arrows (the "how it works" layer)
  [[1.6, 0.4], [2.2, 2.0], [2.8, 3.9], [3.5, 5.1], [4.2, 1.2], [4.9, 2.9], [5.6, 4.5]].forEach(([r, a]) => {
    const m = new THREE.LineSegments(latLong(THREE, 0.14, 4, 6, 16), new THREE.LineBasicMaterial({ color: C.ink }));
    scene.add(m); probes.push([m, r, a]);
    const ar = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, C.orange, 0.2, 0.12);
    scene.add(ar); arrows.push(ar);
  });
  // disc
  const rnd = mulberry(4242), col = new Float32Array(ND * 3);
  const cA = new THREE.Color(C.orange), cB = new THREE.Color(C.pink), cC = new THREE.Color(C.purple);
  for (let i = 0; i < ND; i++) {
    const r = 1.35 + Math.sqrt(rnd()) * 4.6;
    disk.push([r, rnd() * Math.PI * 2, (rnd() - 0.5) * 0.18]);
    const k = (r - 1.35) / 4.6;
    const c = k < 0.5 ? cA.clone().lerp(cB, k * 2) : cB.clone().lerp(cC, (k - 0.5) * 2);
    col.set([c.r, c.g, c.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(ND * 3), 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  disc = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.09, map: dotTexture(THREE, 64, 0.45), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(disc);
}

export function render(t) {
  // flash from the previous shot decays into the night
  const f = 1 - eOut(43.4, 43.85, t);
  scene.background = ground.clone().lerp(flashCol, f);
  scene.fog.color.copy(scene.background);
  rings.geometry.setDrawRange(0, Math.floor((ringCount / 2) * lin(43.6, 44.8, t)) * 2);
  const h = mix(-1, 1, eInOut(48.7, 49.2, t));
  scan.set(h);
  placeSheet(sheet, h, h > -0.98 && h < 0.98);
  sun.rotation.y = sunWire.rotation.y = t * 0.3;
  glow.material.opacity = 0.15 + 0.55 * lin(48.7, 49.3, t);
  // blueprint probes drift slowly (the sim being designed), arrows point at the sun, |F| ~ 1/r^2
  const showBp = t < 49.4;
  probes.forEach(([m, r, a0], i) => {
    const a = a0 + (t - 43.4) * 0.35 * Math.pow(r / 1.6, -1.5);
    const x = Math.cos(a) * r, z = Math.sin(a) * r;
    m.position.set(x, 0, z); m.visible = showBp && t > 44.2 + i * 0.12;
    const ar = arrows[i];
    ar.visible = showBp && t > 45.2 + i * 0.15;
    ar.position.set(x, 0, z);
    ar.setDirection(new THREE.Vector3(-x, 0, -z).normalize());
    ar.setLength(0.45 + 2.2 / (r * r) * 1.4 * eOut(45.2 + i * 0.15, 45.6 + i * 0.15, t), 0.2, 0.12);
  });
  const p = disc.geometry.attributes.position;
  const reach = mix(1.2, 6.2, eOut(48.8, 50.0, t));
  const travel = ramp(48.8, 49.6, t);
  for (let i = 0; i < ND; i++) {
    const [r, a0, y] = disk[i];
    if (r > reach) { p.setXYZ(i, 0, 0, 0); continue; }
    const a = a0 + travel * 1.4 * Math.pow(r / 1.6, -1.5);
    p.setXYZ(i, Math.cos(a) * r, y, Math.sin(a) * r);
  }
  p.needsUpdate = true;
  const ang = 0.3 + (t - 43.4) * 0.05;
  const d = mix(13.5, 11, eInOut(50.8, 53.5, t));
  camLook(cam, Math.sin(ang) * d, d * 0.62, Math.cos(ang) * d, 0, -0.3, 0);
  R.render(scene, cam);
}
