// One pool of voxels; every shot is a formation of it. render(t) is a pure function of t.
import { hash, clamp, ease, lerp, rng } from "./lib.js";
import { shots as intro } from "./intro.js";
import { shots as theme } from "./theme.js";
import { shots as examples } from "./examples.js";
import { shots as middle } from "./middle.js";
import { shots as outro } from "./outro.js";

const N = 4000;
let THREE, renderer, scene, cam, mesh, grid, stars, SH;
const A = {}, B = {};
const lin = new Map();
let toLin;

export function init(T, r) {
  THREE = T; renderer = r;
  const col = new THREE.Color();
  toLin = (hex) => { let v = lin.get(hex); if (!v) { col.setHex(hex); v = [col.r, col.g, col.b]; lin.set(hex, v); } return v; };
  scene = new THREE.Scene();
  cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 600);
  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-0.6, 1, 0.8); scene.add(key);
  scene.add(new THREE.AmbientLight(0xbfc6ff, 1.25));
  mesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshLambertMaterial(), N);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(new Float32Array(N * 3), 3);
  mesh.frustumCulled = false; scene.add(mesh);
  grid = new THREE.GridHelper(240, 80, 0x8f7fd6, 0x3a3570); grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid);
  // far starfield, seeded
  const R = rng(99), sp = new Float32Array(1500 * 3);
  for (let i = 0; i < 1500; i++) { const u = R() * 2 - 1, a = R() * 6.283, s = Math.sqrt(1 - u * u);
    sp[i * 3] = 300 * s * Math.cos(a); sp[i * 3 + 1] = 300 * u; sp[i * 3 + 2] = 300 * s * Math.sin(a); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: 0xc9c3ff, size: 2, sizeAttenuation: false }));
  scene.add(stars);
  SH = [...intro, ...theme, ...examples, ...middle, ...outro].sort((a, b) => a.t0 - b.t0)
    .map((s) => ({ md: 0.75, arc: 2.5, stars: true, ...s, f: s.make() }));
}

function evalShot(s, i, t, o) {
  const f = s.f, k = i < f.count ? i : i % f.count;
  o.sx = o.sy = o.sz = 0.9; o.ry = 0; o.c = 0xffffff;
  f.fn(k, t, o);
  if (i >= f.count) o.sx = o.sy = o.sz = 0;
}

export function render(t) {
  let k = 0; while (k + 1 < SH.length && SH[k + 1].t0 <= t) k++;
  const cur = SH[k], prev = SH[k - 1], local = t - cur.t0, md = cur.md;
  const morph = prev && md > 0 && local < md;
  const m = mesh.instanceMatrix.array, ca = mesh.instanceColor.array;
  for (let i = 0; i < N; i++) {
    evalShot(cur, i, t, A);
    let x = A.x, y = A.y, z = A.z, sx = A.sx, sy = A.sy, sz = A.sz, ry = A.ry, c = toLin(A.c);
    if (morph) {
      evalShot(prev, i, t, B);
      const d = hash(i, 7) * md * 0.45, p = ease(clamp((local - d) / (md * 0.55)));
      const cb = toLin(B.c), arc = Math.sin(Math.PI * p) * cur.arc * (0.4 + hash(i, 3));
      x = lerp(B.x, x, p); y = lerp(B.y, y, p) + arc; z = lerp(B.z, z, p);
      sx = lerp(B.sx, sx, p); sy = lerp(B.sy, sy, p); sz = lerp(B.sz, sz, p); ry = lerp(B.ry, ry, p);
      c = [lerp(cb[0], c[0], p), lerp(cb[1], c[1], p), lerp(cb[2], c[2], p)];
    }
    const cs = Math.cos(ry), sn = Math.sin(ry), j = i * 16;
    m[j] = cs * sx; m[j + 1] = 0; m[j + 2] = -sn * sx; m[j + 3] = 0;
    m[j + 4] = 0; m[j + 5] = sy; m[j + 6] = 0; m[j + 7] = 0;
    m[j + 8] = sn * sz; m[j + 9] = 0; m[j + 10] = cs * sz; m[j + 11] = 0;
    m[j + 12] = x; m[j + 13] = y; m[j + 14] = z; m[j + 15] = 1;
    ca[i * 3] = c[0]; ca[i * 3 + 1] = c[1]; ca[i * 3 + 2] = c[2];
  }
  mesh.instanceMatrix.needsUpdate = true; mesh.instanceColor.needsUpdate = true;
  // camera blends with the morph
  let cv = cur.cam(t);
  if (morph) { const pv = prev.cam(t), p = ease(clamp(local / md)); cv = cv.map((v, q) => lerp(pv[q], v, p)); }
  cam.position.set(cv[0], cv[1], cv[2]); cam.lookAt(cv[3], cv[4], cv[5]);
  const fov = cur.fov ?? 50; if (cam.fov !== fov) { cam.fov = fov; cam.updateProjectionMatrix(); }
  const bg = typeof cur.bg === "function" ? cur.bg(t) : (cur.bg ?? 0x111827);
  scene.background = new THREE.Color(bg);
  grid.visible = cur.floor !== undefined; if (grid.visible) grid.position.y = cur.floor - 0.5;
  stars.visible = cur.stars; stars.rotation.y = t * 0.01;
  renderer.render(scene, cam);
}
