// Shot 13 (58.3-63.0): people-nodes connect, then fly into a geodesic dome ("build something you didn't think you could").
// Shot 15 (72.75-78.0): nodes ring the speaker; spokes and pulses carry ideas back and forth.
import { C, PALETTE, newScene, addLights, makeGrid, lineSegs, dotTexture, mulberry, eInOut, eOut, mix, lin, frac, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, nodes, edges, spokes, pulses, grid, dummy;
const V = [], E = [], scatter = [], ring = [], pseed = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 14, 44);
  addLights(THREE, scene);
  cam = newCam(THREE, 40);
  grid = makeGrid(THREE, 30, 1, 5);
  scene.add(grid);
  // geodesic topology: unique vertices + unique edges of an icosphere
  const g = new THREE.IcosahedronGeometry(1, 1), p = g.attributes.position, key = new Map(), idx = [];
  for (let i = 0; i < p.count; i++) {
    const k = [p.getX(i), p.getY(i), p.getZ(i)].map((v) => v.toFixed(3)).join(",");
    if (!key.has(k)) { key.set(k, V.length); V.push([p.getX(i), p.getY(i), p.getZ(i)]); }
    idx.push(key.get(k));
  }
  const seen = new Set();
  for (let f = 0; f < idx.length; f += 3) for (const [a, b] of [[0, 1], [1, 2], [2, 0]]) {
    const i = Math.min(idx[f + a], idx[f + b]), j = Math.max(idx[f + a], idx[f + b]);
    if (!seen.has(i + "-" + j)) { seen.add(i + "-" + j); E.push([i, j]); }
  }
  const rnd = mulberry(58);
  V.forEach((_, i) => {
    scatter.push([(rnd() - 0.5) * 14, 0.4 + rnd() * 3.6, (rnd() - 0.5) * 8]);
    const th = i * 2.39996, rr = 3.3 + rnd() * 2.6;
    ring.push([Math.cos(th) * rr * 1.25, Math.sin(th) * rr * 0.78, (rnd() - 0.5) * 3]);
    pseed.push(rnd());
  });
  nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 24, 16), new THREE.MeshStandardMaterial({ roughness: 0.4 }), V.length);
  V.forEach((_, i) => nodes.setColorAt(i, new THREE.Color(PALETTE[i % 4])));
  scene.add(nodes);
  edges = lineSegs(THREE, new Array(E.length * 6).fill(0), C.ink, 0.7);
  spokes = lineSegs(THREE, new Array(V.length * 6).fill(0), C.ink, 0.28);
  scene.add(edges, spokes);
  const pg = new THREE.BufferGeometry();
  pg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(V.length * 2 * 3), 3));
  pulses = new THREE.Points(pg, new THREE.PointsMaterial({ color: C.pink, size: 0.3, map: dotTexture(THREE, 64, 0.4), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(pulses);
  dummy = new THREE.Object3D();
}

export function render(t) {
  const late = t > 66;
  const pos = [];
  grid.visible = !late;
  V.forEach((v, i) => {
    let x, y, z, s;
    if (!late) {
      const k = eInOut(60.55 + pseed[i] * 0.5, 61.45 + pseed[i] * 0.5, t);
      const sc = scatter[i], bob = Math.sin(t * 1.4 + i) * 0.12 * (1 - k);
      const dome = [v[0] * 3.3, v[1] * 3.3 + 3.6, v[2] * 3.3];
      x = mix(sc[0], dome[0], k); y = mix(sc[1] + bob, dome[1], k); z = mix(sc[2], dome[2], k);
      s = eOut(58.3 + pseed[i] * 0.7, 58.6 + pseed[i] * 0.7, t);
    } else {
      const r = ring[i];
      const sway = 0.15 * Math.sin(t * 0.9 + i);
      x = r[0] + sway; y = r[1] + sway * 0.6; z = r[2];
      s = eOut(72.75 + pseed[i] * 0.4, 73.05 + pseed[i] * 0.4, t);
      if (i % 9 === 3) s *= 1 + 0.7 * eOut(75.96, 76.3, t) * (1 - lin(77.0, 77.4, t));
    }
    pos.push([x, y, z]);
    dummy.position.set(x, y, z); dummy.scale.setScalar(Math.max(0.001, s)); dummy.updateMatrix();
    nodes.setMatrixAt(i, dummy.matrix);
  });
  nodes.instanceMatrix.needsUpdate = true;
  const ep = edges.geometry.attributes.position;
  const drawn = late ? lin(73.2, 73.9, t) : lin(59.25, 60.1, t);
  E.forEach(([a, b], k) => {
    const A = pos[a], B = pos[b];
    let show = k / E.length < drawn;
    if (late) { const dx = A[0] - B[0], dy = A[1] - B[1], dz = A[2] - B[2]; show = show && dx * dx + dy * dy + dz * dz < 9; }
    ep.setXYZ(k * 2, ...A); ep.setXYZ(k * 2 + 1, ...(show ? B : A));
  });
  ep.needsUpdate = true;
  // spokes from the speaker (origin) to every node, only in shot 15
  const sp = spokes.geometry.attributes.position, pp = pulses.geometry.attributes.position;
  spokes.visible = late; pulses.visible = late ? t > 74.9 : t > 59.6 && t < 60.6;
  const sd = lin(73.4, 74.1, t);
  pos.forEach((P, i) => {
    const on = i / V.length < sd;
    sp.setXYZ(i * 2, 0, 0, 0); sp.setXYZ(i * 2 + 1, ...(on ? P : [0, 0, 0]));
    if (late) {
      const u = frac(pseed[i] + t * 0.55), w = frac(pseed[i] * 3.1 - t * 0.45);
      pp.setXYZ(i * 2, P[0] * u, P[1] * u, P[2] * u);
      pp.setXYZ(i * 2 + 1, P[0] * w, P[1] * w, P[2] * w);
    } else {
      const [a, b] = E[i % E.length], u = frac(pseed[i] + t * 0.8);
      const A = pos[a], B = pos[b];
      pp.setXYZ(i * 2, mix(A[0], B[0], u), mix(A[1], B[1], u), mix(A[2], B[2], u));
      pp.setXYZ(i * 2 + 1, A[0], A[1], A[2]);
    }
  });
  sp.needsUpdate = true; pp.needsUpdate = true;
  if (!late) {
    const k = eInOut(60.5, 62.0, t);
    const ang = -0.3 + (t - 58.3) * 0.12;
    const d = mix(12.5, 14.5, k);
    camLook(cam, Math.sin(ang) * d, mix(5.5, 4.5, k), Math.cos(ang) * d, 0, mix(1.8, 3.4, k), 0);
  } else {
    camLook(cam, Math.sin((t - 72.75) * 0.04) * 1.5, 0.4, 13.5, 0, 0, 0);
  }
  R.render(scene, cam);
}
