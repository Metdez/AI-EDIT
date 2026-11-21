// Shots 9-10 (36.75-43.4): 0 -> 1,000 particles burst and swirl, morph cube -> sphere -> torus, collapse into a flash.
import { C, PALETTE, newScene, lineSegs, dotTexture, mulberry, eInOut, eOut, eIn, mix, lin, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, pts, box, flash, grp;
const N = 1000;
const seed = [], cube = [], sph = [], tor = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 20, 60);
  cam = newCam(THREE, 40);
  const rnd = mulberry(1000);
  const col = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    seed.push([0.35 + rnd() * 0.6, 0.3 + rnd() * 0.6, 0.35 + rnd() * 0.6, rnd() * 6.28, rnd() * 6.28, rnd() * 6.28, 2.2 + rnd() * 2.6]);
    // cube surface
    const f = Math.floor(rnd() * 6), u = rnd() * 2 - 1, v = rnd() * 2 - 1, s = 2.3;
    const c = [[s, u * s, v * s], [-s, u * s, v * s], [u * s, s, v * s], [u * s, -s, v * s], [u * s, v * s, s], [u * s, v * s, -s]][f];
    cube.push(c);
    // fibonacci sphere
    const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = i * 2.399963;
    sph.push([Math.cos(th) * rr * 2.8, y * 2.8, Math.sin(th) * rr * 2.8]);
    // torus
    const a = rnd() * Math.PI * 2, b = rnd() * Math.PI * 2;
    tor.push([(2.4 + 0.9 * Math.cos(b)) * Math.cos(a), 0.9 * Math.sin(b), (2.4 + 0.9 * Math.cos(b)) * Math.sin(a)]);
    const cc = new THREE.Color(PALETTE[i % 4]); col.set([cc.r, cc.g, cc.b], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(N * 3), 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  pts = new THREE.Points(g, new THREE.PointsMaterial({ size: 0.22, map: dotTexture(THREE, 64, 0.45), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  grp = new THREE.Group(); grp.add(pts); scene.add(grp);
  // blueprint bounding volume with ticks
  const s = 3.6, e = [];
  const V = [[-s, -s, -s], [s, -s, -s], [s, s, -s], [-s, s, -s], [-s, -s, s], [s, -s, s], [s, s, s], [-s, s, s]];
  [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]].forEach(([a, b]) => e.push(...V[a], ...V[b]));
  for (let k = -3; k <= 3; k++) e.push(k * 1.2, -s, s, k * 1.2, -s - 0.2, s, -s, k * 1.2, s, -s - 0.2, k * 1.2, s);
  box = lineSegs(THREE, e, C.ink, 0.8);
  scene.add(box);
  flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(THREE, 128, 0.3), color: 0xffe6ea, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, fog: false }));
  scene.add(flash);
}

export function render(t) {
  const p = pts.geometry.attributes.position;
  const w1 = eInOut(39.75, 40.35, t), w2 = eInOut(40.6, 41.15, t), w3 = eInOut(41.4, 41.95, t), wc = eIn(42.45, 43.05, t);
  for (let i = 0; i < N; i++) {
    const s = seed[i];
    const born = eOut(36.9 + (i / N) * 1.0, 36.9 + (i / N) * 1.0 + 0.55, t);
    let x = Math.sin(s[0] * t * 1.6 + s[3]) * s[6], y = Math.sin(s[1] * t * 1.6 + s[4]) * s[6] * 0.7, z = Math.sin(s[2] * t * 1.6 + s[5]) * s[6];
    x *= born; y *= born; z *= born;
    x = mix(x, cube[i][0], w1); y = mix(y, cube[i][1], w1); z = mix(z, cube[i][2], w1);
    x = mix(x, sph[i][0], w2); y = mix(y, sph[i][1], w2); z = mix(z, sph[i][2], w2);
    x = mix(x, tor[i][0], w3); y = mix(y, tor[i][1], w3); z = mix(z, tor[i][2], w3);
    const k = 1 - wc;
    p.setXYZ(i, x * k, y * k, z * k);
  }
  p.needsUpdate = true;
  pts.geometry.setDrawRange(0, Math.floor(N * lin(36.9, 37.9, t)) + (t > 36.9 ? 1 : 0));
  grp.rotation.set(0.25 * Math.sin(t * 0.3), t * 0.35, 0);
  box.material.opacity = 0.8 * (1 - lin(37.8, 38.4, t));
  box.visible = t < 38.4;
  box.rotation.y = t * 0.12;
  const fs = eIn(42.85, 43.4, t);
  flash.visible = t > 42.85;
  flash.scale.setScalar(0.3 + fs * 70);
  flash.material.opacity = Math.min(1, 0.4 + fs);
  const ang = 0.2 + (t - 36.75) * 0.07;
  const d = mix(14, 12, eInOut(39.2, 40.5, t));
  camLook(cam, Math.sin(ang) * d, 2.5, Math.cos(ang) * d, 0, 0, 0);
  R.render(scene, cam);
}
