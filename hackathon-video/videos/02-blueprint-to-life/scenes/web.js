// Shot 4 (16.0-23.4): a drafted globe fills in on "3D", satellites start orbiting on "simulations".
import { C, newScene, addLights, makeGrid, makeScan, makeSheet, placeSheet, latLong, eOut, eInOut, lin, mix, newCam, camLook, ramp } from "./common.js";

let THREE, R, scene, cam, scan, sheet, globe, wire, wireCount, ring, sats = [], back;

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 10, 40);
  addLights(THREE, scene);
  cam = newCam(THREE, 38);
  back = makeGrid(THREE, 30, 1, 5);
  back.rotation.x = Math.PI / 2; back.position.z = -9;
  scene.add(back);
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 5.2, "y");
  scene.add(sheet);

  // low-poly planet: per-face colour (land/sea) from a seeded field
  const geo = new THREE.IcosahedronGeometry(1.98, 3);
  const pos = geo.attributes.position, cols = [];
  const sea = new THREE.Color(0x2b2f6e), landA = new THREE.Color(C.purple), landB = new THREE.Color(C.pink), landC = new THREE.Color(C.orange);
  for (let f = 0; f < pos.count; f += 3) {
    let x = 0, y = 0, z = 0;
    for (let k = 0; k < 3; k++) { x += pos.getX(f + k); y += pos.getY(f + k); z += pos.getZ(f + k); }
    x /= 3; y /= 3; z /= 3;
    const n = Math.sin(x * 2.3 + 1.1) * Math.sin(y * 2.9 - 0.4) + Math.cos(z * 2.1 + x * 0.8) * 0.6;
    const c = n > 0.25 ? (y > 0.9 ? landC : y < -0.6 ? landA : landB) : sea;
    for (let k = 0; k < 3; k++) cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute("color", new THREE.Float32BufferAttribute(cols, 3));
  globe = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, flatShading: true, roughness: 0.6, clippingPlanes: scan.solid, side: THREE.DoubleSide }));
  const lg = latLong(THREE, 2.0, 10, 16, 64);
  wireCount = lg.attributes.position.count;
  wire = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.9, clippingPlanes: scan.wire }));
  scene.add(globe, wire);

  // orbit ring + satellites
  const rp = [];
  for (let k = 0; k < 128; k++) { const a0 = (k / 128) * Math.PI * 2, a1 = ((k + 1) / 128) * Math.PI * 2; rp.push(Math.cos(a0) * 3.1, 0, Math.sin(a0) * 3.1, Math.cos(a1) * 3.1, 0, Math.sin(a1) * 3.1); }
  const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.Float32BufferAttribute(rp, 3));
  ring = new THREE.Group();
  ring.add(new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: C.ink, transparent: true, opacity: 0.6 })));
  for (let i = 0; i < 5; i++) {
    const s = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.22, 0.22), new THREE.MeshStandardMaterial({ color: i % 2 ? C.orange : C.pink, emissive: i % 2 ? C.orange : C.pink, emissiveIntensity: 0.5 }));
    ring.add(s); sats.push(s);
  }
  ring.rotation.set(0.38, 0, -0.22);
  scene.add(ring);
}

export function render(t) {
  const n = Math.floor((wireCount / 2) * lin(16.0, 17.5, t)) * 2;
  wire.geometry.setDrawRange(0, n);
  const h = mix(-2.2, 2.2, eInOut(18.1, 18.9, t));
  scan.set(h);
  placeSheet(sheet, h, h > -2.1 && h < 2.1);
  globe.rotation.y = wire.rotation.y = t * 0.25;
  // satellites: still until "simulations" (18.6), then accelerate
  const travel = ramp(18.6, 19.4, t) * 1.3;
  ring.scale.setScalar(Math.max(0.001, eOut(17.0, 17.8, t)));
  sats.forEach((s, i) => { const a = (i / 5) * Math.PI * 2 + travel; s.position.set(Math.cos(a) * 3.1, 0, Math.sin(a) * 3.1); s.rotation.set(t, t * 1.3, 0); });
  // close on the globe, then pull back so it sits inside the browser frame (19.6)
  const back2 = eInOut(19.4, 20.3, t);
  const ang = -0.3 + (t - 16) * 0.05;
  const d = mix(mix(8.2, 12.5, back2), 3.2, eInOut(22.95, 23.45, t));
  camLook(cam, Math.sin(ang) * d, mix(1.6, 2.4, back2), Math.cos(ang) * d, 0, 0, 0);
  R.render(scene, cam);
}
