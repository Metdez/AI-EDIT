// Shot 7 (33.35-35.15): drafted storm cells fill in, slanted rain, a lightning strike at 34.35.
import { C, newScene, addLights, makeGrid, makeScan, makeSheet, placeSheet, bp, lineSegs, mulberry, eInOut, mix, frac, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, scan, sheet, rain, bolt, L, bg;
const DROPS = 2600;
const drops = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 10, 34);
  bg = scene.background;
  L = addLights(THREE, scene);
  cam = newCam(THREE, 44);
  scene.add(makeGrid(THREE, 30, 1, 5));
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 16, "y");
  scene.add(sheet);
  const rnd = mulberry(77);
  const cells = [[-3.2, 4.6, -1.5], [0.6, 5.1, -2.5], [3.8, 4.5, -1.0], [-0.8, 4.4, 0.8]];
  cells.forEach((c, ci) => {
    for (let k = 0; k < 8; k++) {
      const r = 0.7 + rnd() * 0.9;
      const o = bp(THREE, new THREE.IcosahedronGeometry(r, 1), k % 3 ? 0x6b7397 : 0x8a90b0, scan, { flat: true, rough: 0.9 });
      o.position.set(c[0] + (rnd() - 0.5) * 3.0, c[1] + (rnd() - 0.3) * 0.9, c[2] + (rnd() - 0.5) * 1.8);
      o.rotation.set(rnd() * 3, rnd() * 3, 0);
      o.userData.lines.material.opacity = 0.75;
      scene.add(o);
    }
  });
  for (let i = 0; i < DROPS; i++) drops.push([(rnd() - 0.5) * 18, (rnd() - 0.5) * 12 - 1, rnd(), 0.8 + rnd() * 0.4]);
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(DROPS * 6), 3));
  rain = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: 0xbcd4ff, transparent: true, opacity: 0.55 }));
  scene.add(rain);
  // jagged bolt from a seeded midpoint walk
  const b = []; let x = 0.6, y = 4.0, z = -0.8;
  const rb = mulberry(9);
  for (let k = 0; k < 16; k++) {
    const nx = x + (rb() - 0.45) * 0.7, ny = y - 0.27, nz = z + (rb() - 0.5) * 0.2;
    b.push(x, y, z, nx, ny, nz);
    if (k === 6 || k === 10) b.push(nx, ny, nz, nx + 0.9 * (rb() - 0.3), ny - 0.7, nz); // branches
    x = nx; y = ny; z = nz;
  }
  bolt = lineSegs(THREE, b, 0xffffff, 1);
  bolt.material.fog = false;
  scene.add(bolt);
}

export function render(t) {
  const h = mix(3.0, 6.6, eInOut(33.5, 34.0, t));
  scan.set(h);
  placeSheet(sheet, h, h > 3.05 && h < 6.5);
  const p = rain.geometry.attributes.position;
  const n = Math.floor(DROPS * Math.min(1, Math.max(0, (t - 33.85) / 0.3)));
  for (let i = 0; i < DROPS; i++) {
    const d = drops[i];
    const y = 4.2 - frac(d[2] + t * 1.9 * d[3]) * 4.6;
    const x = d[0] + (4.2 - y) * 0.42;
    p.setXYZ(i * 2, x, y, d[1]);
    p.setXYZ(i * 2 + 1, x - 0.16, y + 0.38, d[1]);
  }
  p.needsUpdate = true;
  rain.geometry.setDrawRange(0, n * 2);
  const flash = (t > 34.32 && t < 34.42) || (t > 34.5 && t < 34.56);
  bolt.visible = flash;
  L.hemi.intensity = flash ? 2.6 : 0.55;
  scene.background = flash ? new THREE.Color(0x2b3f74) : bg;
  const ang = -0.25 + (t - 33.35) * 0.12;
  camLook(cam, Math.sin(ang) * 9.5, 1.0, Math.cos(ang) * 9.5, 0, 3.0, 0);
  R.render(scene, cam);
}
