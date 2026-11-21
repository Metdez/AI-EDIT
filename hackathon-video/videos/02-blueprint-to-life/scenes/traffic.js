// Shot 6 (30.4-33.35): blueprint city plan -> buildings fill in -> 260 cars with light trails accelerate.
import { C, newScene, addLights, makeScan, makeSheet, placeSheet, lineSegs, mulberry, eInOut, mix, ramp, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, scan, sheet, cars, trails, dummy;
const N = 260, HALF = 13, L = 26, STEP = 2.4;
const carData = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 18, 60);
  addLights(THREE, scene);
  cam = newCam(THREE, 40);
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 28, "y");
  scene.add(sheet);
  const rnd = mulberry(1630);

  // streets plan (ink) + road surface
  const plan = [];
  const streets = [];
  for (let s = -12; s <= 12.01; s += STEP) streets.push(+s.toFixed(2));
  streets.forEach((s) => { plan.push(-HALF, 0.01, s, HALF, 0.01, s, s, 0.01, -HALF, s, 0.01, HALF); });
  scene.add(lineSegs(THREE, plan, C.ink, 0.35));
  const road = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, 2 * HALF), new THREE.MeshStandardMaterial({ color: 0x141a30, roughness: 0.95, clippingPlanes: scan.solid }));
  road.rotation.x = -Math.PI / 2; road.position.y = -0.01;
  scene.add(road);
  // Charles River strip along +z
  const river = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, 4.6), new THREE.MeshStandardMaterial({ color: 0x24427e, roughness: 0.3, metalness: 0.1, clippingPlanes: scan.solid }));
  river.rotation.x = -Math.PI / 2; river.position.set(0, 0.0, 10.7);
  scene.add(river);

  // buildings
  const boxes = [];
  for (let i = 0; i < streets.length - 1; i++) for (let j = 0; j < streets.length - 1; j++) {
    const cx = (streets[i] + streets[i + 1]) / 2, cz = (streets[j] + streets[j + 1]) / 2;
    if (cz > 8.2) continue; // river
    for (let a = -1; a <= 1; a += 2) for (let b = -1; b <= 1; b += 2) {
      const d2 = cx * cx + (cz + 1) * (cz + 1);
      const h = 0.3 + rnd() * 1.1 + 3.4 * Math.exp(-d2 / 30) * (0.6 + rnd() * 0.8);
      boxes.push([cx + a * 0.47, cz + b * 0.47, 0.78, h]);
    }
  }
  const geo = new THREE.BoxGeometry(1, 1, 1); geo.translate(0, 0.5, 0);
  const inst = new THREE.InstancedMesh(geo, new THREE.MeshStandardMaterial({ roughness: 0.7, clippingPlanes: scan.solid }), boxes.length);
  const m = new THREE.Matrix4(), col = new THREE.Color();
  const tones = [0x2a3462, 0x313c70, 0x252d55, 0x3a3f6e];
  const edges = [];
  boxes.forEach((b, k) => {
    m.makeScale(b[2], b[3], b[2]); m.setPosition(b[0], 0, b[1]);
    inst.setMatrixAt(k, m);
    col.set(b[3] > 3 ? (k % 3 ? C.purple : C.pink) : tones[k % 4]); inst.setColorAt(k, col);
    const x0 = b[0] - b[2] / 2, x1 = b[0] + b[2] / 2, z0 = b[1] - b[2] / 2, z1 = b[1] + b[2] / 2, y = b[3];
    const c = [[x0, z0], [x1, z0], [x1, z1], [x0, z1]];
    for (let q = 0; q < 4; q++) {
      const [ax, az] = c[q], [bx, bz] = c[(q + 1) % 4];
      edges.push(ax, 0, az, bx, 0, bz, ax, y, az, bx, y, bz, ax, 0, az, ax, y, az);
    }
  });
  scene.add(inst);
  const e = lineSegs(THREE, edges, C.ink, 0.8, scan.wire);
  scene.add(e);

  // cars
  for (let k = 0; k < N; k++) {
    const axis = k % 2, dir = rnd() < 0.5 ? -1 : 1;
    let street = streets[Math.floor(rnd() * streets.length)];
    if (axis === 0 && street > 8) street = streets[Math.floor(rnd() * 8)];
    carData.push({ axis, dir, street, lane: dir * 0.22, speed: 1.6 + rnd() * 2.2, phase: rnd() * L });
  }
  cars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.34, 0.1, 0.16), new THREE.MeshBasicMaterial(), N);
  carData.forEach((c, k) => cars.setColorAt(k, new THREE.Color(k % 3 ? C.orange : C.pink)));
  scene.add(cars);
  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 6), 3));
  const tc = new Float32Array(N * 6);
  carData.forEach((c, k) => { const cc = new THREE.Color(k % 3 ? C.orange : C.pink); tc.set([cc.r, cc.g, cc.b, 0.04, 0.06, 0.13], k * 6); });
  tg.setAttribute("color", new THREE.Float32BufferAttribute(tc, 3));
  trails = new THREE.LineSegments(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.95 }));
  scene.add(trails);
  dummy = new THREE.Object3D();
}

const wrap = (v) => ((((v + HALF) % L) + L) % L) - HALF;

export function render(t) {
  const h = mix(-0.2, 6.5, eInOut(31.45, 32.2, t));
  scan.set(h);
  placeSheet(sheet, h, h > -0.1 && h < 6.4);
  const go = ramp(31.9, 32.7, t);
  const sp = Math.min(1, Math.max(0, (t - 31.9) / 0.8));
  const vis = t > 31.5;
  const tp = trails.geometry.attributes.position;
  carData.forEach((c, k) => {
    const s = wrap(c.phase + c.dir * c.speed * go);
    const tail = s - c.dir * (0.15 + 0.9 * sp * c.speed / 3);
    let x, z, tx, tz;
    if (c.axis === 0) { x = s; z = c.street + c.lane; tx = tail; tz = z; dummy.rotation.y = 0; }
    else { z = s; x = c.street + c.lane; tz = tail; tx = x; dummy.rotation.y = Math.PI / 2; }
    dummy.position.set(x, 0.07, z);
    dummy.scale.setScalar(vis ? 1 : 0.0001);
    dummy.updateMatrix(); cars.setMatrixAt(k, dummy.matrix);
    const jump = Math.abs(tail - s) > 2; // wrapped: hide the trail for that frame
    tp.setXYZ(k * 2, x, 0.07, z);
    tp.setXYZ(k * 2 + 1, jump ? x : tx, 0.07, jump ? z : tz);
  });
  cars.instanceMatrix.needsUpdate = true; tp.needsUpdate = true;
  trails.visible = vis;
  // top-down plan view, then swoop to a 3/4 street-level angle
  const k = eInOut(31.3, 32.9, t);
  const ang = 0.5 + (t - 30.4) * 0.08;
  const rad = mix(0.6, 15, k), ht = mix(27, 9.5, k);
  camLook(cam, Math.sin(ang) * rad, ht, Math.cos(ang) * rad, 0, 0, mix(0, 1, k));
  R.render(scene, cam);
}
