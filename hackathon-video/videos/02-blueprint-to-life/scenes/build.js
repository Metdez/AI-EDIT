// Shot 3 (10.6-16.0) and shot 16 (78.0-85.6): wire blocks build a tower, re-stack, fill in.
import { C, newScene, addLights, makeGrid, makeScan, makeSheet, placeSheet, bp, eOut, eInOut, lin, mix, newCam, camLook, lineSegs } from "./common.js";

let THREE, R, scene, cam, scan, sheet, dims, pawns;
const blocks = [];
// [w, h, d, x, y, z] tower layout
const A = [
  [3.0, 0.5, 3.0, 0, 0.25, 0],
  [1.2, 1.2, 1.2, -0.75, 1.1, -0.75],
  [1.2, 0.8, 1.2, 0.75, 0.9, -0.75],
  [1.2, 1.6, 1.2, 0.75, 1.3, 0.75],
  [1.2, 0.6, 1.2, -0.75, 0.8, 0.75],
  [1.0, 1.0, 1.0, -0.75, 2.2, -0.75],
  [0.8, 2.0, 0.8, 0.75, 3.1, 0.75],
  [1.0, 0.5, 1.0, 0.75, 1.55, -0.75],
  [0.7, 0.7, 0.7, -0.75, 1.45, 0.75],
  [0.4, 1.2, 0.4, 0.75, 4.7, 0.75],
  [0.9, 0.9, 0.9, -0.75, 3.15, -0.75],
];
const COLS = [C.bone, C.pink, C.orange, C.purple, C.orange, C.purple, C.pink, C.bone, C.pink, C.orange, C.purple];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 12, 40);
  addLights(THREE, scene);
  cam = newCam(THREE, 40);
  scene.add(makeGrid(THREE, 30, 1, 5));
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 7, "y");
  scene.add(sheet);
  A.forEach((b, i) => {
    const o = bp(THREE, new THREE.BoxGeometry(b[0], b[1], b[2]), COLS[i], scan, { rough: 0.45 });
    scene.add(o); blocks.push(o);
  });
  // dimension lines (orange) for "something learned"
  const d = [];
  const H = 5.3, X = 2.1;
  d.push(X, 0, 1.5, X, H, 1.5, X - 0.2, 0, 1.5, X + 0.2, 0, 1.5, X - 0.2, H, 1.5, X + 0.2, H, 1.5); // height
  d.push(-1.5, 0, 2.1, 1.5, 0, 2.1, -1.5, -0.2, 2.1, -1.5, 0.2, 2.1, 1.5, -0.2, 2.1, 1.5, 0.2, 2.1); // width
  dims = lineSegs(THREE, d, C.orange, 1);
  scene.add(dims);
  // pawns = new friends
  pawns = new THREE.Group();
  for (let i = 0; i < 7; i++) {
    const g = new THREE.Group();
    const m = new THREE.MeshStandardMaterial({ color: [C.pink, C.orange, C.purple, C.bone][i % 4], roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 0.42, 16), m); body.position.y = 0.21;
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 14), m); head.position.y = 0.56;
    g.add(body, head);
    const a = (i / 7) * Math.PI * 2 + 0.3;
    g.position.set(Math.cos(a) * 2.7, 0, Math.sin(a) * 2.7);
    pawns.add(g);
  }
  scene.add(pawns);
}

function spiral(i) {
  if (i === 0) return [0, 0.25, 0, 0];
  const a = i * 0.72;
  return [Math.cos(a) * 1.25, 0.45 + i * 0.42, Math.sin(a) * 1.25, -a];
}

export function render(t) {
  const late = t > 60;
  const t0 = late ? 78.1 : 10.7; // drop-in start
  const gap = late ? 0.2 : 0.11;
  // fill level
  const h = late ? mix(-0.5, 6.2, eInOut(81.7, 82.7, t)) : mix(-0.5, 6.2, eInOut(14.95, 15.75, t));
  scan.set(h);
  placeSheet(sheet, h, h > -0.4 && h < 6.1);

  const spin = late ? 0 : eInOut(15.0, 16.2, t) * Math.PI * 0.5;
  blocks.forEach((o, i) => {
    const b = A[i];
    const drop = eOut(t0 + i * gap, t0 + i * gap + 0.45, t);
    let x = b[3], y = b[4] + (1 - drop) * 7, z = b[5], ry = 0;
    if (!late) {
      const k = eInOut(12.2 + i * 0.05, 13.0 + i * 0.05, t); // "experimenting": re-stack into a spiral
      const s = spiral(i);
      x = mix(x, s[0], k); y = mix(y, s[1], k); z = mix(z, s[2], k); ry = mix(0, s[3], k);
    }
    o.position.set(x, y, z);
    o.rotation.y = ry;
    o.visible = drop > 0.001;
    o.userData.lines.material.opacity = 0.95;
  });
  scene.rotation.y = spin;
  dims.visible = late && t > 83.6;
  dims.scale.set(1, late ? eOut(83.6, 84.1, t) : 1, 1);
  pawns.visible = late && t > 84.8;
  pawns.children.forEach((p, i) => { const s = eOut(84.85 + i * 0.06, 85.15 + i * 0.06, t); p.scale.setScalar(Math.max(0.001, s)); });

  if (late) cam.setViewOffset(1920, 1080, 320, 0, 1920, 1080); else cam.clearViewOffset();
  if (!late) {
    const ang = 0.6 + (t - 10.6) * 0.09;
    camLook(cam, Math.sin(ang) * 10.5, 4.6, Math.cos(ang) * 10.5, 0, 2.0, 0);
  } else {
    const ang = -0.5 + (t - 78) * 0.06;
    const push = eInOut(78, 85.6, t);
    camLook(cam, Math.sin(ang) * mix(12.5, 10.5, push), mix(6.5, 4.2, push), Math.cos(ang) * mix(12.5, 10.5, push), 0, 2.2, 0);
  }
  R.render(scene, cam);
}
