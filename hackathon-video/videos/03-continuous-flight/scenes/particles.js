// One shared particle system. It morphs through a list of shapes; position(t) is a pure function of t.
import { rng, clamp, smooth, dotTexture, loadImage } from "./util.js";

export const N = 6000;
const PAL = ["#ffffff", "#EC8796", "#F6B04A", "#8F7FD6", "#ffffff", "#bfc8ff"];

let THREE, points, geo, mat, shapes = {}, schedule = [], seeds, delay;
const tmpA = new Float32Array(3), tmpB = new Float32Array(3);
export const extra = { boston: [0, 0, 0], camPos: [0, 0, 30] }; // world refs set by the scene (pure fn of t)

function lin(THREE_, hex) { const c = new THREE_.Color(hex); return [c.r, c.g, c.b]; }

function makeStatic(fill, colorFn, opts = {}) {
  const base = new Float32Array(N * 3), col = new Float32Array(N * 3), r = rng(opts.seed || 1);
  for (let i = 0; i < N; i++) {
    fill(i, r, tmpA); base.set(tmpA, i * 3);
    col.set(colorFn(i, r), i * 3);
  }
  return { base, col, size: opts.size || 1, rot: opts.rot || null, alpha: opts.alpha || null };
}

function rotate(p, ax, ay) { // rotate x then y
  let [x, y, z] = p; const cx = Math.cos(ax), sx = Math.sin(ax);
  let y2 = y * cx - z * sx, z2 = y * sx + z * cx; y = y2; z = z2;
  const cy = Math.cos(ay), sy = Math.sin(ay);
  const x2 = x * cy + z * sy; z = -x * sy + z * cy; x = x2;
  p[0] = x; p[1] = y; p[2] = z;
}

function evalShape(s, i, t, out) {
  if (s.dyn) { s.dyn(i, t, out); return; }
  out[0] = s.base[i * 3]; out[1] = s.base[i * 3 + 1]; out[2] = s.base[i * 3 + 2];
  if (s.rot) { const [ax, ay] = s.rot(t); rotate(out, ax, ay); }
}

function sampleCanvas(draw, w, h, worldW, r) {
  const c = document.createElement("canvas"); c.width = w; c.height = h;
  const g = c.getContext("2d"); draw(g, w, h);
  const d = g.getImageData(0, 0, w, h).data, pts = [];
  for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (d[(y * w + x) * 4 + 3] > 128) pts.push([x, y, d[(y * w + x) * 4], d[(y * w + x) * 4 + 1], d[(y * w + x) * 4 + 2]]);
  const s = worldW / w;
  return (i, out) => { const p = pts[Math.floor(r() * pts.length)]; out[0] = (p[0] - w / 2 + r() * 2) * s; out[1] = -(p[1] - h / 2 + r() * 2) * s; out[2] = (r() - .5) * 0.25; return p; };
}

export async function init(THREE_) {
  THREE = THREE_;
  const P = PAL.map((h) => lin(THREE, h));
  const r0 = rng(99); seeds = new Float32Array(N); delay = new Float32Array(N);
  for (let i = 0; i < N; i++) { seeds[i] = r0(); delay[i] = r0(); }
  const pal = (i, r) => P[Math.floor(r() * P.length)];
  const white = (i, r) => { const k = 0.75 + r() * 0.25; return [k, k, k * 1.05]; };

  // nebula: loose cloud that slowly turns
  shapes.nebula = makeStatic((i, r, o) => { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), rr = 6 + Math.pow(r(), 0.6) * 16;
    o[0] = rr * Math.sin(v) * Math.cos(u) * 1.5; o[1] = rr * Math.cos(v) * 0.7; o[2] = rr * Math.sin(v) * Math.sin(u) - 4; },
    (i, r) => (r() < 0.7 ? white(i, r) : pal(i, r)), { seed: 2, rot: (t) => [0, t * 0.05], size: 0.9 });

  // Sundai logo, sampled from its own pixels and colours
  const logoImg = await loadImage("assets/sundai-logo.png");
  const rl = rng(5); const ls = sampleCanvas((g) => g.drawImage(logoImg, 0, 0), logoImg.width, logoImg.height, 18, rl);
  { const base = new Float32Array(N * 3), col = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) { const p = ls(i, tmpA); base.set(tmpA, i * 3); const c = new THREE.Color().setRGB(p[2] / 255, p[3] / 255, p[4] / 255, THREE.SRGBColorSpace); col.set([c.r, c.g, c.b], i * 3); }
    shapes.logo = { base, col, size: 0.75 }; }

  // wireframe cube (build)
  const E = [[0,1],[1,3],[3,2],[2,0],[4,5],[5,7],[7,6],[6,4],[0,4],[1,5],[2,6],[3,7]];
  const V = [...Array(8)].map((_, k) => [(k & 1 ? 1 : -1) * 4.5, (k & 2 ? 1 : -1) * 4.5, (k & 4 ? 1 : -1) * 4.5]);
  shapes.cube = makeStatic((i, r, o) => { const [a, b] = E[i % 12], u = r(), j = 0.12;
    for (let d = 0; d < 3; d++) o[d] = V[a][d] + (V[b][d] - V[a][d]) * u + (r() - .5) * j; },
    (i, r) => (r() < 0.8 ? lin(THREE, "#ffffff") : P[1]), { seed: 3, rot: (t) => [0.5 + t * 0.15, t * 0.35], size: 0.8 });

  // torus knot (experiment)
  shapes.knot = makeStatic((i, r, o) => { const u = r() * Math.PI * 2, p = 2, q = 3, R = 4.2, tube = 0.9 * Math.sqrt(r()), a = r() * Math.PI * 2;
    const cx = (R + 1.6 * Math.cos(q * u)) * Math.cos(p * u), cy = (R + 1.6 * Math.cos(q * u)) * Math.sin(p * u), cz = 1.6 * Math.sin(q * u);
    o[0] = cx + tube * Math.cos(a); o[1] = cy + tube * Math.sin(a); o[2] = cz + tube * Math.cos(a + 1.3); },
    (i, r) => (r() < 0.5 ? P[3] : r() < 0.5 ? P[1] : lin(THREE, "#ffffff")), { seed: 4, rot: (t) => [t * 0.4, t * 0.6], size: 0.85 });

  // colour shell (fun)
  shapes.shell = makeStatic((i, r, o) => { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), rr = 8 + r() * 0.6;
    o[0] = rr * Math.sin(v) * Math.cos(u); o[1] = rr * Math.cos(v); o[2] = rr * Math.sin(v) * Math.sin(u); },
    pal, { seed: 6, rot: (t) => [0.3, t * 1.1], size: 1.0 });

  // "3D" letters
  await document.fonts.load('400 300px "Archivo Black"').catch(() => {});
  const r3 = rng(7); const t3 = sampleCanvas((g, w, h) => { g.fillStyle = "#fff"; g.font = '400 300px "Archivo Black", "Arial Black", sans-serif'; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("3D", w / 2, h / 2 + 10); }, 640, 340, 20, r3);
  shapes.text3d = makeStatic((i, r, o) => { t3(i, o); o[2] = (r() - .5) * 1.6; }, (i, r) => (r() < 0.75 ? lin(THREE, "#ffffff") : P[1]), { seed: 8, rot: (t) => [0, Math.sin(t * 0.6) * 0.25], size: 0.75 });

  // browser window outline (on the web)
  shapes.browser = makeStatic((i, r, o) => { const W = 10, H = 6.2, k = i % 10;
    if (k < 6) { const side = Math.floor(r() * 4), u = r() * 2 - 1;
      if (side === 0) { o[0] = u * W; o[1] = H; } else if (side === 1) { o[0] = u * W; o[1] = -H; } else if (side === 2) { o[0] = -W; o[1] = u * H; } else { o[0] = W; o[1] = u * H; } }
    else if (k < 8) { o[0] = (r() * 2 - 1) * W; o[1] = H - 1.4; }
    else { const d = Math.floor(r() * 3), a = r() * Math.PI * 2, rr = Math.sqrt(r()) * 0.3; o[0] = -W + 0.9 + d * 0.9 + Math.cos(a) * rr; o[1] = H - 0.7 + Math.sin(a) * rr; }
    o[0] += (r() - .5) * 0.08; o[1] += (r() - .5) * 0.08; o[2] = (r() - .5) * 0.15; },
    (i, r) => (i % 10 >= 8 ? P[[1, 2, 3][Math.floor(r() * 3)]] : lin(THREE, "#ffffff")), { seed: 9, rot: (t) => [0, Math.sin(t * 0.5) * 0.2], size: 0.75 });

  // three.js-style triangle (Sierpinski)
  shapes.tri = makeStatic((i, r, o) => { const A = [[0, 7.5], [-8.6, -7.4], [8.6, -7.4]]; let x = 0, y = 0;
    for (let k = 0; k < 14; k++) { const v = A[Math.floor(r() * 3)]; x = (x + v[0]) / 2; y = (y + v[1]) / 2; }
    o[0] = x; o[1] = y; o[2] = (r() - .5) * 0.3; },
    (i, r) => (r() < 0.85 ? lin(THREE, "#ffffff") : P[3]), { seed: 10, rot: (t) => [0, Math.sin(t * 0.7) * 0.35], size: 0.7 });

  // orbit rings of the solar system (XZ plane) + sun core; radii match space.js
  const RADII = [6, 8.5, 11.5, 14.5, 19, 24];
  shapes.orbits = makeStatic((i, r, o) => { if (i % 6 === 0) { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), rr = 2.1 * Math.cbrt(r());
      o[0] = rr * Math.sin(v) * Math.cos(u); o[1] = rr * Math.cos(v); o[2] = rr * Math.sin(v) * Math.sin(u); return; }
    const R = RADII[i % 6] + (r() - .5) * 0.35, a = r() * Math.PI * 2; o[0] = R * Math.cos(a); o[1] = (r() - .5) * 0.15; o[2] = R * Math.sin(a); },
    (i, r) => (i % 6 === 0 ? P[2] : r() < 0.6 ? lin(THREE, "#cfd6ff") : P[3]), { seed: 11, rot: (t) => [0, -t * 0.08], size: 0.6 });

  // a thousand particles flying around the camera (only i < 1000 are visible in this shape)
  shapes.fly = { dyn: (i, t, o) => { const s = seeds[i], R = 3 + 20 * ((s * 7.13) % 1), w = (0.5 + 0.9 * ((s * 3.7) % 1)) * (i % 2 ? 1 : -1);
      const a = s * 40 + w * t, y = Math.sin(s * 91 + t * (0.6 + s)) * 6 * ((s * 5.1) % 1);
      o[0] = R * Math.cos(a); o[1] = y; o[2] = R * Math.sin(a); },
    col: makeStatic(() => {}, (i, r) => (r() < 0.55 ? lin(THREE, "#ffffff") : P[1 + Math.floor(r() * 3)]), { seed: 12 }).col, size: 2.2, alpha: (i) => (i < 1000 ? 1 : 0) };

  // spiral galaxy in brand colours (be creative)
  shapes.swirl = { dyn: (i, t, o) => { const s = seeds[i], arm = i % 3, rr = 0.4 + 13 * Math.pow((s * 13.7) % 1, 0.8);
      const a = arm * (Math.PI * 2 / 3) + rr * 0.42 + t * (0.9 / (0.6 + rr * 0.15)) + (((s * 77) % 1) - .5) * 0.5;
      o[0] = rr * Math.cos(a); o[2] = rr * Math.sin(a); o[1] = (((s * 51) % 1) - .5) * (1.6 - rr * 0.08); },
    col: makeStatic(() => {}, (i) => [P[1], P[2], P[3]][i % 3].map((v) => v * 1.1), { seed: 13 }).col, size: 1.0 };

  // collapse point
  shapes.point = makeStatic((i, r, o) => { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), rr = 0.3 * Math.cbrt(r()); o[0] = rr * Math.cos(u) * Math.sin(v); o[1] = rr * Math.cos(v); o[2] = rr * Math.sin(u) * Math.sin(v); },
    () => [1.4, 1.35, 1.3], { seed: 14, size: 0.5, alpha: (i) => (i < 600 ? 0.6 : 0) }); // thousands of overlapping sprites blow the bloom into a square

  // stream source at Boston (world point converted by the scene into particle-local coords)
  shapes.boston = { dyn: (i, t, o) => { const s = seeds[i]; o[0] = extra.boston[0] + (s - .5) * 0.5; o[1] = extra.boston[1] + (((s * 7) % 1) - .5) * 0.5; o[2] = extra.boston[2]; },
    col: shapes.logo.col, size: 0.6, alpha: () => 0 }; // fade in as they leave Boston, no blob at the source

  // [time the morph completes, shape, morph duration]
  schedule = [
    [0, "nebula", 0], [7.05, "logo", 1.7], [11.0, "cube", 1.3], [12.75, "knot", 1.0], [15.3, "shell", 0.9],
    [18.35, "text3d", 1.2], [20.1, "browser", 0.9], [21.55, "tri", 0.9], [24.1, "orbits", 1.5],
    [37.55, "fly", 0.75], [41.0, "swirl", 1.6], [43.08, "point", 0.85],
    [86.9, "boston", 0.01], [88.6, "logo", 1.0],
  ];

  geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("color", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("aSize", new THREE.BufferAttribute(new Float32Array(N), 1));
  geo.setAttribute("aAlpha", new THREE.BufferAttribute(new Float32Array(N), 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e5);
  mat = new THREE.ShaderMaterial({
    uniforms: { uTex: { value: dotTexture(THREE) }, uScale: { value: 1080 / (2 * Math.tan((50 * Math.PI) / 360)) }, uFocus: { value: 28 }, uDof: { value: 0.06 }, uOpacity: { value: 1 }, uBright: { value: 1 }, uPx: { value: 0.11 } },
    vertexShader: `attribute float aSize; attribute float aAlpha; varying vec3 vCol; varying float vA;
      uniform float uScale, uFocus, uDof, uPx;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); float d = -mv.z;
        float coc = abs(d - uFocus) * uDof; float base = aSize * uPx * uScale / max(d, 0.05);
        gl_PointSize = clamp(base + coc * 6.0, 1.0, 90.0); vA = aAlpha / (1.0 + coc * coc * 0.8); vCol = color;
        if (d < 0.2) vA = 0.0; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform sampler2D uTex; uniform float uOpacity, uBright; varying vec3 vCol; varying float vA;
      void main(){ vec4 tx = texture2D(uTex, gl_PointCoord); if (tx.a < 0.04) discard; float a = tx.a * vA * uOpacity; if (a < 0.003) discard; gl_FragColor = vec4(vCol * uBright * a, a); }`,
    vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  points = new THREE.Points(geo, mat); points.frustumCulled = false;
  return points;
}

function shapeAlpha(s, i) { return s.alpha ? s.alpha(i) : 1; }

export function update(t) {
  let k = 0; while (k < schedule.length - 1 && t >= schedule[k + 1][0] - schedule[k + 1][2]) k++;
  const [tEnd, name, dur] = schedule[k];
  const prev = k > 0 ? shapes[schedule[k - 1][1]] : null, cur = shapes[name];
  const pos = geo.attributes.position.array, col = geo.attributes.color.array, sz = geo.attributes.aSize.array, al = geo.attributes.aAlpha.array;
  const t0 = tEnd - dur, morphing = prev && t < tEnd;
  for (let i = 0; i < N; i++) {
    evalShape(cur, i, t, tmpB);
    const cc = cur.col, cs = cur.size, ca = shapeAlpha(cur, i);
    if (morphing) {
      const st = delay[i] * 0.3 * dur, u = smooth((t - t0 - st) / (dur * 0.7));
      evalShape(prev, i, t, tmpA);
      // bow the path outward a little so a morph reads as flight, not a crossfade
      const bow = Math.sin(u * Math.PI) * (1.2 + seeds[i] * 2.5);
      for (let d = 0; d < 3; d++) pos[i * 3 + d] = tmpA[d] + (tmpB[d] - tmpA[d]) * u + bow * (d === 1 ? 0.4 : 1) * Math.sin(seeds[i] * 31 + d * 2.1);
      for (let d = 0; d < 3; d++) col[i * 3 + d] = prev.col[i * 3 + d] + (cc[i * 3 + d] - prev.col[i * 3 + d]) * u;
      sz[i] = prev.size + (cs - prev.size) * u; al[i] = shapeAlpha(prev, i) + (ca - shapeAlpha(prev, i)) * u;
    } else {
      pos[i * 3] = tmpB[0]; pos[i * 3 + 1] = tmpB[1]; pos[i * 3 + 2] = tmpB[2];
      col[i * 3] = cc[i * 3]; col[i * 3 + 1] = cc[i * 3 + 1]; col[i * 3 + 2] = cc[i * 3 + 2];
      sz[i] = cs; al[i] = ca;
    }
    sz[i] *= 0.7 + seeds[i] * 0.6;
  }
  for (const a of ["position", "color", "aSize", "aAlpha"]) geo.attributes[a].needsUpdate = true;
}

export const material = () => mat;
export const object = () => points;
