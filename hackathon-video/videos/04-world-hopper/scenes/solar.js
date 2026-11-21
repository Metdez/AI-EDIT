// SOLAR: sun + six planets on Kepler-ish orbits (angle = w*t, closed form), orbit lines, a ringed
// giant. From 43-55 s it switches to a "physics" view: offset right, trails, gravity lines, velocity arrows.
import { rng, prog, sstep, eInOut, lerp, stars, glowTexture, cam } from "./util.js";

let THREE, renderer, scene, camera, planets = [], orbits = [], trails = [], grav, arrows = [], halo;
const PL = [ // a, size, base colour, band colour, phase
  [6, 0.45, "#b9a58f", "#7d6b5a", 0.3], [9, 0.75, "#e8c48a", "#b98a4a", 2.1], [12.5, 0.85, "#3f7fd6", "#e8f2ff", 4.0],
  [16.5, 0.6, "#d0603a", "#8a3a22", 1.2], [21, 1.9, "#d8b48a", "#9a6a46", 5.3], [26.5, 1.5, "#e7d29a", "#b39a66", -0.33],
];
const W = PL.map((p) => 5.5 / Math.pow(p[0], 1.5));

function bands(seed, a, b) {
  const r = rng(seed), cv = document.createElement("canvas"); cv.width = 256; cv.height = 128;
  const g = cv.getContext("2d"); g.fillStyle = a; g.fillRect(0, 0, 256, 128);
  for (let i = 0; i < 26; i++) { g.globalAlpha = 0.15 + r() * 0.45; g.fillStyle = r() < 0.5 ? b : a; g.fillRect(0, r() * 128, 256, 2 + r() * 10); }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function init(T, R) {
  THREE = T; renderer = R;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x05060d);
  camera = cam(THREE, 45);
  scene.add(stars(THREE, 6000, 500, 21, 1.8));
  halo = glowTexture(THREE);
  const sun = new THREE.Mesh(new THREE.SphereGeometry(2.6, 64, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 1.9, 0.7), toneMapped: false }));
  scene.add(sun);
  [[9, 0.9, 0xffb050], [18, 0.35, 0xf6b04a], [34, 0.15, 0xec8796]].forEach(([s, o, c]) => {
    const g = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: c, transparent: true, opacity: o, depthWrite: false, blending: THREE.AdditiveBlending }));
    g.scale.set(s, s, 1); scene.add(g);
  });
  scene.add(new THREE.PointLight(0xfff0dd, 4.0, 0, 0));
  scene.add(new THREE.AmbientLight(0x404a70, 0.25));

  PL.forEach(([a, s, c1, c2, ph], i) => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(s, 48, 24), new THREE.MeshStandardMaterial({ map: bands(50 + i, c1, c2), roughness: 0.85 }));
    m.rotation.z = 0.2;
    if (i === 5) { const ring = new THREE.Mesh(new THREE.RingGeometry(s * 1.4, s * 2.4, 96), new THREE.MeshBasicMaterial({ color: 0xd9c08a, side: THREE.DoubleSide, transparent: true, opacity: 0.6 }));
      ring.rotation.x = -Math.PI / 2.4; m.add(ring); }
    scene.add(m); planets.push(m);
    const pts = []; for (let k = 0; k <= 256; k++) { const th = (k / 256) * Math.PI * 2; pts.push(new THREE.Vector3(Math.cos(th) * a, 0, Math.sin(th) * a)); }
    const o = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0x8f7fd6, transparent: true, opacity: 0.28 }));
    scene.add(o); orbits.push(o);
    const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(48 * 3), 3));
    const tr = new THREE.Line(tg, new THREE.LineBasicMaterial({ color: new THREE.Color(0xec8796).multiplyScalar(2), toneMapped: false, transparent: true }));
    scene.add(tr); trails.push(tr);
    const ar = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 3, 0x7fe8ff, 0.7, 0.4); scene.add(ar); arrows.push(ar);
  });
  const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PL.length * 6), 3));
  grav = new THREE.LineSegments(gg, new THREE.LineDashedMaterial({ color: 0xf6b04a, dashSize: 0.6, gapSize: 0.4, transparent: true })); scene.add(grav);
}

const physics = (t) => t >= 43 && t < 55;
function rig(t) {
  if (physics(t)) {
    const a = 0.4 + (t - 43) * 0.025;
    camera.position.set(Math.sin(a) * 40, 34 - (t - 43) * 0.4, Math.cos(a) * 40);
    camera.lookAt(0, -2, 0);
    camera.setViewOffset(1920, 1080, -330, 40, 1920, 1080); // system sits right of centre, code card on the left
  } else {
    camera.clearViewOffset();
    const t0 = t < 60 ? 35.3 : 82.5, k = eInOut(prog(t, t0, t0 + 2.2));
    const a = -0.6 + (t - t0) * 0.22;
    camera.position.set(Math.sin(a) * lerp(64, 34, k), lerp(26, 9, k), Math.cos(a) * lerp(64, 34, k));
    camera.lookAt(0, 0, 0);
  }
}

export function render(t) {
  rig(t);
  const ph = physics(t), trailOn = ph ? sstep(t, 50.8, 51.4) : 0, gOn = ph ? sstep(t, 45.42, 46.2) : 0, vOn = ph ? sstep(t, 47.48, 48.0) : 0;
  const gp = grav.geometry.attributes.position;
  PL.forEach(([a, , , , p0], i) => {
    const th = p0 + W[i] * t, x = Math.cos(th) * a, z = -Math.sin(th) * a;
    planets[i].position.set(x, 0, z); planets[i].rotation.y = t * 0.6;
    orbits[i].material.opacity = ph ? 0.45 : 0.28;
    const tp = trails[i].geometry.attributes.position;
    for (let k = 0; k < 48; k++) { const tt = th - k * 0.022 * (1 + 4 / a); tp.setXYZ(k, Math.cos(tt) * a, 0, -Math.sin(tt) * a); }
    tp.needsUpdate = true; trails[i].visible = trailOn > 0.01; trails[i].material.opacity = trailOn;
    gp.setXYZ(i * 2, 0, 0, 0); gp.setXYZ(i * 2 + 1, x, 0, z);
    const ar = arrows[i]; ar.visible = vOn > 0.01; ar.position.set(x, 0, z);
    ar.setDirection(new THREE.Vector3(-Math.sin(th), 0, -Math.cos(th))); ar.setLength(Math.max(0.01, (1.2 + W[i] * a * 1.6) * vOn), 0.7, 0.4);
  });
  gp.needsUpdate = true; grav.computeLineDistances(); grav.visible = gOn > 0.01; grav.material.opacity = gOn * 0.8;
  renderer.render(scene, camera);
}
