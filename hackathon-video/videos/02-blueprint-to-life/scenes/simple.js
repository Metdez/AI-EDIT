// Shot 12 (54.1-58.3): one cube, edge by edge, then filled.
// Shot 14 (63.0-72.75): knots pile into a tangle, collapse to one sphere, a cursor drags it.
import { C, newScene, addLights, makeGrid, makeScan, makeSheet, placeSheet, bp, drawOn, latLong, lineSegs, eInOut, eOut, eIn, mix, lin, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, scan, sheet, cube, dims, knots, sphere, sWire, sWireCount, ripple, ui, uiCam, cursor;
const KN = [[2, 3], [3, 4], [2, 5], [3, 5], [4, 3], [5, 2], [3, 7], [2, 7], [5, 3], [4, 5], [3, 8]];
const KC = [C.ink, C.pink, C.orange, C.purple];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 10, 34);
  addLights(THREE, scene);
  cam = newCam(THREE, 40);
  scene.add(makeGrid(THREE, 30, 1, 5));
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 4, "y");
  scene.add(sheet);
  cube = bp(THREE, new THREE.BoxGeometry(1.8, 1.8, 1.8), C.pink, scan, { rough: 0.4 });
  scene.add(cube);
  // dimension lines with end ticks on three edges
  const s = 0.9, o = 0.35, d = [];
  d.push(-s, -s - o, s + o, s, -s - o, s + o, -s, -s - o - 0.12, s + o, -s, -s - o + 0.12, s + o, s, -s - o - 0.12, s + o, s, -s - o + 0.12, s + o);
  d.push(s + o, -s, s + o, s + o, s, s + o, s + o - 0.12, -s, s + o, s + o + 0.12, -s, s + o, s + o - 0.12, s, s + o, s + o + 0.12, s, s + o);
  d.push(s + o, -s - o, -s, s + o, -s - o, s, s + o, -s - o - 0.12, -s, s + o, -s - o + 0.12, -s, s + o, -s - o - 0.12, s, s + o, -s - o + 0.12, s);
  dims = lineSegs(THREE, d, C.orange, 1);
  cube.add(dims);

  knots = new THREE.Group();
  KN.forEach(([p, q], i) => {
    const pts = [];
    const r = 1.5 + (i % 4) * 0.22;
    for (let k = 0; k <= 400; k++) {
      const u = (k / 400) * Math.PI * 2 * 1;
      const cu = Math.cos(q * u), rr = r * (0.55 + 0.35 * cu);
      pts.push(rr * Math.cos(p * u), r * 0.35 * Math.sin(q * u), rr * Math.sin(p * u));
    }
    const segs = [];
    for (let k = 0; k < 400; k++) segs.push(...pts.slice(k * 3, k * 3 + 3), ...pts.slice(k * 3 + 3, k * 3 + 6));
    const l = lineSegs(THREE, segs, KC[i % 4], 0.9);
    l.userData.n = 800;
    l.rotation.set(i * 0.7, i * 1.3, i * 0.4);
    knots.add(l);
  });
  knots.position.y = 1.6;
  scene.add(knots);

  sphere = new THREE.Mesh(new THREE.SphereGeometry(1.0, 48, 32), new THREE.MeshStandardMaterial({ color: C.orange, roughness: 0.35, clippingPlanes: scan.solid }));
  const lg = latLong(THREE, 1.01, 8, 12, 40); sWireCount = lg.attributes.position.count;
  sWire = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.ink, clippingPlanes: scan.wire }));
  scene.add(sphere, sWire);
  const rp = [];
  for (let k = 0; k < 64; k++) { const a0 = (k / 64) * Math.PI * 2, a1 = ((k + 1) / 64) * Math.PI * 2; rp.push(Math.cos(a0), 0.01, Math.sin(a0), Math.cos(a1), 0.01, Math.sin(a1)); }
  ripple = [0, 1, 2].map(() => { const l = lineSegs(THREE, rp, C.pink, 1); scene.add(l); return l; });

  // screen-space cursor overlay
  ui = new THREE.Scene();
  uiCam = new THREE.OrthographicCamera(0, 1920, 1080, 0, -1, 1);
  const sh = new THREE.Shape();
  [[0, 0], [0, -46], [11, -35], [19, -54], [27, -50], [19, -32], [34, -32]].forEach(([x, y], i) => (i ? sh.lineTo(x, y) : sh.moveTo(x, y)));
  sh.closePath();
  cursor = new THREE.Group();
  const fill = new THREE.Mesh(new THREE.ShapeGeometry(sh), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  const out = new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(sh.getPoints().map((p) => new THREE.Vector3(p.x, p.y, 0))), new THREE.LineBasicMaterial({ color: 0x0a1022 }));
  cursor.add(fill, out); cursor.scale.setScalar(1.6);
  ui.add(cursor);
}

function toScreen(v3) { const v = v3.clone().project(cam); return [(v.x * 0.5 + 0.5) * 1920, (v.y * 0.5 + 0.5) * 1080]; }

export function render(t) {
  const late = t > 60;
  cube.visible = !late; knots.visible = late; sphere.visible = sWire.visible = late;
  ripple.forEach((r) => (r.visible = false));
  cursor.visible = false;
  if (!late) {
    drawOn(cube, lin(54.25, 55.1, t));
    dims.visible = t > 55.0;
    dims.scale.setScalar(Math.max(0.001, eOut(55.0, 55.35, t)));
    const h = mix(0.3, 2.5, eInOut(55.75, 56.3, t));
    scan.set(h); placeSheet(sheet, h, h > 0.32 && h < 2.48);
    cube.position.set(0, 1.4, 0);
    cube.rotation.set(0.0, -0.6 + (t - 54.1) * 0.12 + eInOut(55.8, 56.9, t) * Math.PI * 0.5, 0);
    const ang = 0.15 + (t - 54.1) * 0.03;
    camLook(cam, Math.sin(ang) * 7.4 + 0.0, 3.3, Math.cos(ang) * 7.4, 0, 1.3, 0);
    R.render(scene, cam);
    return;
  }
  // tangle grows: one knot every ~0.55 s
  knots.children.forEach((l, i) => {
    const f = lin(63.1 + i * 0.55, 63.7 + i * 0.55, t);
    l.geometry.setDrawRange(0, Math.floor(400 * f) * 2);
    l.rotation.y = i * 1.3 + t * (0.2 + 0.05 * i) * (i % 2 ? -1 : 1);
  });
  knots.rotation.y = t * 0.15;
  const col = eIn(69.75, 70.3, t);
  knots.scale.setScalar(Math.max(0.001, (1 + 0.15 * lin(63, 69.6, t)) * (1 - col)));
  // simple sphere
  const born = t > 70.25;
  sphere.visible = sWire.visible = born;
  sWire.geometry.setDrawRange(0, Math.floor((sWireCount / 2) * lin(70.3, 70.6, t)) * 2);
  // drag: sphere follows the cursor from x=0 to x=-1.7, then springs to rest
  const drag = eInOut(71.65, 72.2, t);
  const vel = (t > 71.65 && t < 72.2) ? Math.sin(Math.PI * lin(71.65, 72.2, t)) : 0;
  const tr = Math.max(0, t - 72.2);
  const wob = Math.exp(-tr * 5) * Math.sin(tr * 22) * 0.12 * (t > 72.2 ? 1 : 0);
  const sx = mix(0, -1.7, drag);
  sphere.position.set(sx, 1.3, 0);
  sphere.scale.set(1 + 0.16 * vel - wob, 1 - 0.12 * vel + wob, 1 + 0.05 * vel);
  sWire.position.copy(sphere.position); sWire.scale.copy(sphere.scale);
  sphere.rotation.y = sWire.rotation.y = t * 0.4 - drag * 1.6;
  const h = mix(0.2, 2.5, eInOut(70.55, 70.95, t));
  scan.set(h); placeSheet(sheet, h, h > 0.22 && h < 2.48);
  sheet.position.x = sx;
  ripple.forEach((r, i) => {
    const a = lin(71.6 + i * 0.18, 72.6 + i * 0.18, t);
    r.visible = a > 0 && a < 1;
    r.position.set(sx, 0, 0);
    r.scale.setScalar(1.1 + a * 2.8);
    r.material.opacity = 1 - a;
  });
  const ang = -0.1 + (t - 63) * 0.04;
  camLook(cam, Math.sin(ang) * 7.6, 2.9, Math.cos(ang) * 7.6, 0, 1.45, 0);
  R.render(scene, cam);
  // cursor overlay
  if (t > 71.15 && t < 72.75) {
    const [px, py] = toScreen(new THREE.Vector3(sx + 0.25, 1.45, 0.6));
    const k = eOut(71.15, 71.6, t);
    const x = mix(1350, px, k), y = mix(260, py, k);
    cursor.visible = true;
    cursor.position.set(x, y, 0);
    cursor.scale.setScalar(t > 71.6 && t < 72.25 ? 1.45 : 1.6);
    const auto = R.autoClear; R.autoClear = false; R.clearDepth();
    R.render(ui, uiCam);
    R.autoClear = auto;
  }
}
