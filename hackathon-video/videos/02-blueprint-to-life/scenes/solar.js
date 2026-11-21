// Shot 8 (35.15-36.75): orbit lines draft, planets fill and start orbiting.
import { C, newScene, addLights, makeScan, makeSheet, placeSheet, latLong, lineSegs, dotTexture, mulberry, eInOut, eOut, mix, ramp, lin, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, scan, sheet, orbits, orbitCount;
const P = [ // radius, size, colour, phase
  [1.9, 0.13, C.bone, 0.3], [2.6, 0.2, C.orange, 2.1], [3.4, 0.22, 0x6f9bff, 4.0],
  [4.3, 0.17, C.pink, 1.2], [5.7, 0.52, C.orange, 3.3], [7.1, 0.42, C.bone, 5.2],
];
const planets = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 30, 90);
  const Lt = addLights(THREE, scene);
  Lt.key.intensity = 0.6;
  const sunLight = new THREE.PointLight(0xffd9a0, 60, 0, 1.4);
  scene.add(sunLight);
  cam = newCam(THREE, 40);
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 16, "y");
  scene.add(sheet);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(0.85, 40, 24), new THREE.MeshBasicMaterial({ color: 0xffb347 }));
  const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(THREE, 128, 0.05), color: C.orange, transparent: true, opacity: 0.7, blending: THREE.AdditiveBlending, depthWrite: false }));
  glow.scale.setScalar(4.2);
  scene.add(sun, glow);
  const o = [];
  P.forEach(([r]) => { for (let k = 0; k < 96; k++) { const a0 = (k / 96) * Math.PI * 2, a1 = ((k + 1) / 96) * Math.PI * 2; o.push(Math.cos(a0) * r, 0, Math.sin(a0) * r, Math.cos(a1) * r, 0, Math.sin(a1) * r); } });
  orbits = lineSegs(THREE, o, C.ink, 0.55);
  orbitCount = o.length / 3;
  scene.add(orbits);
  P.forEach(([r, s, c], i) => {
    const g = new THREE.Group();
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 32, 20), new THREE.MeshStandardMaterial({ color: c, roughness: 0.7, clippingPlanes: scan.solid }));
    const w = new THREE.LineSegments(latLong(THREE, s * 1.01, 5, 8, 24), new THREE.LineBasicMaterial({ color: C.ink, clippingPlanes: scan.wire }));
    g.add(m, w);
    if (i === 5) {
      const ring = new THREE.Mesh(new THREE.RingGeometry(s * 1.4, s * 2.2, 48), new THREE.MeshStandardMaterial({ color: C.bone, side: THREE.DoubleSide, transparent: true, opacity: 0.8, clippingPlanes: scan.solid }));
      ring.rotation.x = -Math.PI / 2 + 0.4; g.add(ring);
    }
    scene.add(g); planets.push(g);
  });
  // star field on a far shell
  const rnd = mulberry(3), sp = [];
  for (let i = 0; i < 1400; i++) { const u = rnd() * 2 - 1, th = rnd() * Math.PI * 2, rr = 70; sp.push(rr * Math.sqrt(1 - u * u) * Math.cos(th), rr * u, rr * Math.sqrt(1 - u * u) * Math.sin(th)); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
  scene.add(new THREE.Points(sg, new THREE.PointsMaterial({ color: 0x9cc2ff, size: 1.6, sizeAttenuation: false, transparent: true, opacity: 0.6, fog: false })));
}

export function render(t) {
  orbits.geometry.setDrawRange(0, Math.floor((orbitCount / 2) * lin(35.1, 35.55, t)) * 2);
  const h = mix(-0.7, 0.7, eInOut(35.45, 35.9, t));
  scan.set(h);
  placeSheet(sheet, h, h > -0.68 && h < 0.68);
  const travel = ramp(35.55, 36.1, t);
  planets.forEach((g, i) => {
    const [r, , , ph] = P[i];
    const a = ph + travel * 3.2 * Math.pow(r / 1.9, -1.5);
    g.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
    g.rotation.y = t * 1.5;
    g.scale.setScalar(Math.max(0.001, eOut(35.15 + i * 0.04, 35.45 + i * 0.04, t)));
  });
  const ang = 0.4 + (t - 35.15) * 0.18;
  const d = mix(15.5, 12.5, eInOut(35.15, 36.75, t));
  camLook(cam, Math.sin(ang) * d, d * 0.55, Math.cos(ang) * d, 0, -0.4, 0);
  R.render(scene, cam);
}
