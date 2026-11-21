// Type Storm: one swarm of points morphs through every shot. render(t) is a pure function of t.
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";

export const N = 22000;
const W = 1920, H = 1080, TAU = Math.PI * 2;
const D = 5.4 / Math.tan((15 * Math.PI) / 180); // 1 world unit = 100 px on z = 0
const wx = (px) => (px - 960) / 100, wy = (py) => (540 - py) / 100;
const hash = (i, k = 0) => {
  let x = Math.imul(i + 1, 374761393) ^ Math.imul(k + 7, 668265263);
  x = Math.imul(x ^ (x >>> 13), 1274126177); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
};
const c01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v);
const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const eout = (p) => 1 - Math.pow(1 - p, 3);
const sph = (i, k) => { const a = hash(i, k) * TAU, z = hash(i, k + 1) * 2 - 1, r = Math.sqrt(1 - z * z); return [r * Math.cos(a), z, r * Math.sin(a)]; };

let WHITE, PINK, GRAY, DIM, MID;
export const slots = {};

// ---------- shapes: a shape is parts [[weight, part]] + optional transform; part(j, n, t, tl, o, i) writes point i
function put(o, i, x, y, z, c, s = 1) {
  const k = i * 3; o.P[k] = x; o.P[k + 1] = y; o.P[k + 2] = z;
  o.C[k] = c[0]; o.C[k + 1] = c[1]; o.C[k + 2] = c[2]; o.S[i] = s;
}
function shape(parts, xf) {
  const tot = parts.reduce((a, p) => a + p[0], 0); const ranges = []; let s = 0;
  parts.forEach(([w, fn], k) => { const e = k === parts.length - 1 ? N : Math.round(s + (w / tot) * N); ranges.push([s, e, fn]); s = e; });
  return (t, tl, o) => {
    for (const [a, b, fn] of ranges) { const n = b - a; for (let i = a; i < b; i++) fn(i - a, n, t, tl, o, i); }
    if (xf) { const f = xf(t, tl); transform(o, f, ranges[0][0], N); }
  };
}
function transform(o, { ry = 0, rx = 0, rz = 0, sc = 1, cx = 0, cy = 0, cz = 0 }, a, b) {
  const cyy = Math.cos(ry), syy = Math.sin(ry), cxx = Math.cos(rx), sxx = Math.sin(rx), czz = Math.cos(rz), szz = Math.sin(rz);
  for (let i = a; i < b; i++) {
    const k = i * 3; let x = o.P[k], y = o.P[k + 1], z = o.P[k + 2];
    let x1 = x * cyy + z * syy, z1 = -x * syy + z * cyy; // Y
    let y1 = y * cxx - z1 * sxx, z2 = y * sxx + z1 * cxx; // X
    let x2 = x1 * czz - y1 * szz, y2 = x1 * szz + y1 * czz; // Z
    o.P[k] = x2 * sc + cx; o.P[k + 1] = y2 * sc + cy; o.P[k + 2] = z2 * sc + cz;
  }
}

// ---------- 2D canvas sampling (type and icons)
let cv, ctx;
function sample(draw, step = 2) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = "#fff"; ctx.strokeStyle = "#fff"; ctx.lineCap = "round"; ctx.lineJoin = "round";
  draw(ctx);
  const d = ctx.getImageData(0, 0, W, H).data, pts = [];
  for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (d[(y * W + x) * 4 + 3] > 127) pts.push(x, y);
  if (!pts.length) throw new Error("empty sample");
  return pts;
}
function perm(n, seed) { const p = new Uint32Array(n); for (let i = 0; i < n; i++) p[i] = i; for (let i = n - 1; i > 0; i--) { const j = Math.floor(hash(i, seed) * (i + 1)); const t = p[i]; p[i] = p[j]; p[j] = t; } return p; }
let seedCounter = 100;
function sampled(pts, col, { depth = 0.14, s = 1 } = {}) {
  const cnt = pts.length / 2, pm = perm(cnt, seedCounter++);
  return (j, n, t, tl, o, i) => {
    const k = pm[j % cnt];
    put(o, i, wx(pts[2 * k] + (hash(i, 1) - 0.5) * 2), wy(pts[2 * k + 1] + (hash(i, 2) - 0.5) * 2), (hash(i, 3) - 0.5) * depth, col, s);
  };
}
const AF = '"Archivo Black"';
function fitText(str, { cx = 960, cy = 500, maxW = 1250, maxH = 330, font = AF, hole = -1 } = {}) {
  ctx.font = `100px ${font}`; const capR = ctx.measureText("H").actualBoundingBoxAscent / 100;
  let fs = maxH / capR; ctx.font = `${fs}px ${font}`; let w = ctx.measureText(str).width;
  if (w > maxW) { fs *= maxW / w; ctx.font = `${fs}px ${font}`; w = ctx.measureText(str).width; }
  const capH = capR * fs, base = cy + capH / 2, x0 = cx - w / 2;
  return { fs, w, capH, base, x0, font, str, hole };
}
function textPts(str, opt = {}) {
  const L = fitText(str, opt); let slot = null;
  const pts = sample((g) => {
    g.font = `${L.fs}px ${L.font}`; g.textAlign = "left"; g.textBaseline = "alphabetic";
    if (L.hole < 0) g.fillText(str, L.x0, L.base);
    else {
      const pre = str.slice(0, L.hole), ch = str[L.hole], post = str.slice(L.hole + 1);
      const xa = L.x0 + g.measureText(pre).width, xb = L.x0 + g.measureText(pre + ch).width;
      g.fillText(pre, L.x0, L.base); g.fillText(post, xb, L.base);
      const m = g.measureText(ch); // the O's own ink box
      const ix0 = xa - m.actualBoundingBoxLeft, ix1 = xa + m.actualBoundingBoxRight;
      slot = { x: (ix0 + ix1) / 2, y: L.base - (m.actualBoundingBoxAscent - m.actualBoundingBoxDescent) / 2, d: Math.max(ix1 - ix0, m.actualBoundingBoxAscent + m.actualBoundingBoxDescent) * 0.98 };
    }
  });
  return { pts, slot, L };
}
const text = (str, col, opt = {}, depth = 0.14) => shape([[1, sampled(textPts(str, opt).pts, col, { depth })]]);

// ---------- dynamic parts
const ringPart = (cxp, cyp, rx, ry, col, speed = 0.5, thick = 0.05) => (j, n, t, tl, o, i) => {
  const a = hash(i, 11) * TAU + t * speed * (0.6 + 0.8 * hash(i, 12));
  const out = hash(i, 13) < 0.18 ? 1 + hash(i, 14) * 0.35 : 1 + (hash(i, 15) - 0.5) * thick;
  const c = hash(i, 16) < 0.12 ? PINK : col;
  put(o, i, wx(cxp) + (Math.cos(a) * rx * out) / 100, wy(cyp) + (Math.sin(a) * ry * out) / 100, (hash(i, 17) - 0.5) * 0.6, c, out > 1.06 ? 0.7 : 1);
};
const cubeEdge = (i, k) => { // point on the edges of a unit cube centred at 0
  const e = Math.floor(hash(i, k) * 12), u = hash(i, k + 1) - 0.5, ax = Math.floor(e / 4), sa = (e & 1) ? 0.5 : -0.5, sb = (e & 2) ? 0.5 : -0.5;
  return ax === 0 ? [u, sa, sb] : ax === 1 ? [sa, u, sb] : [sa, sb, u];
};
function cubeBuildPart(j, n, t, tl, o, i) { // 4x4x4 voxels appear bottom layer first
  const c = i % 64, lx = c % 4, lz = Math.floor(c / 4) % 4, ly = Math.floor(c / 16);
  const s = eout(c01((tl - 0.15 - ly * 0.22 - ((lx + lz * 4) % 16) * 0.012) / 0.25));
  const e = cubeEdge(i, 20), size = 0.78 * s;
  const col = c === 47 || c === 58 ? PINK : WHITE;
  put(o, i, (lx - 1.5) * 0.85 + e[0] * size, (ly - 1.5) * 0.85 + e[1] * size, (lz - 1.5) * 0.85 + e[2] * size, col, s > 0.02 ? 1 : 0);
}
function towerPart(j, n, t, tl, o, i) { // spiral of 14 blocks rising
  const b = i % 14, s = eout(c01((tl - 0.05 - b * 0.1) / 0.2));
  const a = b * 0.75, e = cubeEdge(i, 30), sz = 0.95 * s;
  put(o, i, Math.cos(a) * 1.7 + e[0] * sz, -2.7 + b * 0.45 + e[1] * sz, Math.sin(a) * 1.7 + e[2] * sz, b === 13 ? PINK : WHITE, s > 0.02 ? 1 : 0);
}
function knotPart(j, n, t, tl, o, i) {
  const u = hash(i, 40) * TAU, v = hash(i, 41) * TAU, p = 2, q = 3;
  const f = (uu) => { const r = 2.0 + 0.75 * Math.cos(q * uu); return [r * Math.cos(p * uu), r * Math.sin(p * uu), 0.75 * Math.sin(q * uu)]; };
  const a = f(u), b2 = f(u + 0.01), tx = b2[0] - a[0], ty = b2[1] - a[1], tz = b2[2] - a[2], tlen = Math.hypot(tx, ty, tz);
  const T = [tx / tlen, ty / tlen, tz / tlen]; let Nn = [-T[1], T[0], 0]; const nl = Math.hypot(Nn[0], Nn[1]) || 1; Nn = [Nn[0] / nl, Nn[1] / nl, 0];
  const B = [T[1] * Nn[2] - T[2] * Nn[1], T[2] * Nn[0] - T[0] * Nn[2], T[0] * Nn[1] - T[1] * Nn[0]], r = 0.32;
  put(o, i, a[0] + r * (Math.cos(v) * Nn[0] + Math.sin(v) * B[0]), a[1] + r * (Math.cos(v) * Nn[1] + Math.sin(v) * B[1]), a[2] + r * (Math.cos(v) * Nn[2] + Math.sin(v) * B[2]), hash(i, 42) < 0.1 ? PINK : WHITE);
}

// ---------- city (Boston-ish street grid) — cars are points, buildings are an InstancedMesh
const STREET = 1.5;
function carPart(j, n, t, tl, o, i) {
  const car = Math.floor(i / 4), k = i % 4, vert = hash(car, 50) < 0.55, dir = hash(car, 51) < 0.5 ? 1 : -1;
  const lane = vert ? (Math.floor(hash(car, 52) * 13) - 6) * STREET : (Math.floor(hash(car, 52) * 9) - 4) * STREET;
  const L = vert ? 16 : 23, sp = (1.4 + hash(car, 53) * 1.6) / L;
  const along = ((hash(car, 54) + sp * t) % 1) * L - L / 2 - k * 0.09; // trail sits behind the head
  const pos = dir * along, off = dir * 0.13;
  const x = vert ? lane + off : pos, z = vert ? pos : lane + off;
  put(o, i, x, 0.06, z, dir > 0 ? WHITE : PINK, k === 0 ? 1.7 : 1.3 - k * 0.2);
}

// ---------- weather
const BOLT = []; // jagged polyline, seeded
function rainPart(j, n, t, tl, o, i) {
  if (j < n * 0.08) { // lightning bolt: visible only during flashes
    const f = flash(t), u = j / (n * 0.08), seg = Math.min(BOLT.length - 2, Math.floor(u * (BOLT.length - 1))), lu = u * (BOLT.length - 1) - seg;
    const a = BOLT[seg], b = BOLT[seg + 1];
    put(o, i, a[0] + (b[0] - a[0]) * lu + (hash(i, 60) - 0.5) * 0.05, a[1] + (b[1] - a[1]) * lu, 1, WHITE, f > 0.05 ? 1.3 : 0);
    return;
  }
  const drop = Math.floor(i / 4), k = i % 4, sp = 9 + hash(drop, 61) * 5;
  const y = 6.5 - ((hash(drop, 62) * 13 + sp * t) % 13) + k * 0.13;
  put(o, i, (hash(drop, 63) - 0.5) * 24, y, (hash(drop, 64) - 0.5) * 9 - 1, k === 0 ? WHITE : MID, 0.8 - k * 0.1);
}
export function flash(t) { const g = (c, w) => Math.exp(-(((t - c) / w) ** 2)); return 0.55 * g(34.95, 0.045) + 0.35 * g(35.15, 0.035); }

// ---------- solar system
const ORB = [1.6, 2.4, 3.3, 4.3, 5.5, 6.7], PR = [0.1, 0.17, 0.2, 0.15, 0.42, 0.34];
function solarPart(j, n, t, tl, o, i) {
  const u = j / n;
  if (u < 0.2) { const s = sph(i, 70), r = 0.95 * Math.cbrt(0.3 + 0.7 * hash(i, 72)); put(o, i, s[0] * r, s[1] * r, s[2] * r, WHITE, 1.2); return; }
  const p = i % 6, w = 3.0 / Math.pow(ORB[p], 1.5), ang = hash(p, 73) * TAU + w * t;
  if (u < 0.55) { const a = hash(i, 74) * TAU; put(o, i, Math.cos(a) * ORB[p], 0, Math.sin(a) * ORB[p], GRAY, 0.55); return; }
  if (p === 5 && hash(i, 75) < 0.45) { const a = hash(i, 76) * TAU, r = PR[p] * (1.6 + hash(i, 77) * 0.7); put(o, i, Math.cos(ang) * ORB[p] + Math.cos(a) * r, Math.sin(a) * r * 0.25, Math.sin(ang) * ORB[p] + Math.sin(a) * r, WHITE, 0.7); return; }
  const s = sph(i, 78), r = PR[p] * Math.cbrt(hash(i, 80));
  put(o, i, Math.cos(ang) * ORB[p] + s[0] * r, s[1] * r, Math.sin(ang) * ORB[p] + s[2] * r, p === 2 ? PINK : WHITE, 1);
}

// ---------- a thousand particles (exact count shown == counter)
export const thousandCount = (t) => Math.round(1000 * c01((t - 36.9) / 1.5));
function thousandPart(j, n, t, tl, o, i) {
  if (i >= 1000) { put(o, i, 0, 0, -2, DIM, 0); return; }
  const a = 0.35 + 0.5 * hash(i, 81), b = 0.3 + 0.5 * hash(i, 82), c = 0.4 + 0.5 * hash(i, 83);
  put(o, i, 7.6 * Math.sin(a * t + hash(i, 84) * TAU), 3.9 * Math.sin(b * t + hash(i, 85) * TAU), 3 * Math.sin(c * t + hash(i, 86) * TAU), i % 10 === 0 ? PINK : WHITE, i < thousandCount(t) ? 2.2 : 0);
}

// ---------- misc parts
const burstPart = (j, n, t, tl, o, i) => {
  const s = sph(i, 90), R = 0.6 + 8.5 * hash(i, 94) * hash(i, 93), r = R * (1 - Math.exp(-tl * 2.6));
  put(o, i, s[0] * r, s[1] * r * 0.75, s[2] * r * 0.7, hash(i, 92) < 0.35 ? PINK : WHITE, 1);
};
const ballPart = (j, n, t, tl, o, i) => { const s = sph(i, 95), r = 1.25 * Math.cbrt(0.5 + 0.5 * hash(i, 97)); put(o, i, s[0] * r, s[1] * r, s[2] * r, WHITE); };
const globePart = (cx, cy, R) => (j, n, t, tl, o, i) => {
  const k = j + 0.5, z = 1 - (2 * k) / n, r = Math.sqrt(1 - z * z), phi = k * 2.399963;
  const lat = Math.asin(z), lon = phi + t * 0.6;
  const land = Math.sin(2 * lon + 1.3) * Math.cos(3 * lat) + 0.7 * Math.sin(4 * lon - 0.7 + 2 * lat) + 0.45 * Math.cos(7 * lon + 5 * lat) + 0.25 * Math.sin(13 * lon - 9 * lat) > 0.55 && Math.abs(lat) < 1.25;
  const x = r * Math.cos(phi + t * 0.6), y = z, zz = r * Math.sin(phi + t * 0.6), tilt = 0.4;
  const xr = x * Math.cos(tilt) - y * Math.sin(tilt), yr = x * Math.sin(tilt) + y * Math.cos(tilt);
  put(o, i, cx + xr * R, cy + yr * R, zz * R, land ? WHITE : GRAY, land ? 1 : 0.55);
};
const gearPart = (cx, R, teeth, w, phase, col) => (j, n, t, tl, o, i) => {
  const u = hash(i, 100), a = hash(i, 101) * TAU, rot = w * t + phase;
  let r;
  if (u < 0.62) { const sq = Math.tanh(4 * Math.sin(teeth * (a - rot))); r = R + 0.24 * sq; }
  else if (u < 0.8) r = R * 0.32;
  else { const sp = Math.floor(hash(i, 102) * 5), aa = rot + (sp * TAU) / 5; r = R * (0.32 + 0.6 * hash(i, 103)); put(o, i, cx + Math.cos(aa) * r, Math.sin(aa) * r, 0, col); return; }
  put(o, i, cx + Math.cos(a) * r, Math.sin(a) * r, (hash(i, 104) - 0.5) * 0.15, col);
};
const wavePart = (j, n, t, tl, o, i) => {
  const row = i % 9, u = hash(i, 110);
  const x = -5.0 + u * 10.0, y = -2.15 + row * 0.5 + 0.2 * Math.sin(x * 1.3 + t * 4 + row * 0.7);
  put(o, i, x, y, 0, row % 3 === 1 ? PINK : WHITE, 0.9);
};
const clockHands = (j, n, t, tl, o, i) => {
  const minute = hash(i, 120) < 0.6, a = Math.PI / 2 - (minute ? t * TAU * 0.9 : t * TAU * 0.075), len = minute ? 2.3 : 1.5;
  const u = hash(i, 121) * len, w = (hash(i, 122) - 0.5) * (minute ? 0.12 : 0.2);
  put(o, i, wx(960) + Math.cos(a) * u - Math.sin(a) * w, wy(500) + Math.sin(a) * u + Math.cos(a) * w, 0.1, minute ? PINK : WHITE);
};
const NODES = [];
function netPart(j, n, t, tl, o, i) {
  if (hash(i, 130) < 0.55) { const nd = i % NODES.length, s = sph(i, 131), r = 0.3 * Math.cbrt(hash(i, 133)), p = NODES[nd];
    put(o, i, p[0] + s[0] * r, p[1] + s[1] * r, p[2] + s[2] * r, nd === 0 || nd === 5 ? PINK : WHITE, 1); return; }
  const e = i % (NODES.length * 2), a = NODES[e >> 1], b = NODES[((e >> 1) + 1 + (e & 1) * 3) % NODES.length], u = hash(i, 134);
  put(o, i, a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u, GRAY, 0.55);
}
function tanglePart(j, n, t, tl, o, i) {
  const c = i % 6, s = hash(i, 140) * TAU;
  put(o, i, 4.4 * Math.sin(3 * s + c) + 0.4 * Math.sin(11 * s + c * 3), 2.4 * Math.sin(4 * s + 2 * c) + 0.3 * Math.cos(13 * s), 2 * Math.sin(5 * s + c * 1.7), c === 2 ? PINK : hash(i, 141) < 0.5 ? WHITE : MID, 0.9);
}
const sharePart = (j, n, t, tl, o, i) => {
  const u = hash(i, 150);
  if (u < 0.6) { const left = i % 2 === 0, s = sph(i, 151), r = 1.3 * Math.cbrt(0.4 + 0.6 * hash(i, 153)); put(o, i, (left ? -3.6 : 3.6) + s[0] * r, s[1] * r, s[2] * r, left ? WHITE : PINK); return; }
  const up = i % 2 === 0, f = (hash(i, 154) + t * 0.55) % 1, x = up ? -3.6 + 7.2 * f : 3.6 - 7.2 * f, y = (up ? 1 : -1) * Math.sin(f * Math.PI) * 1.9;
  put(o, i, x + (hash(i, 155) - 0.5) * 0.2, y + (hash(i, 156) - 0.5) * 0.2, (hash(i, 157) - 0.5) * 0.3, up ? WHITE : PINK, 0.8);
};
const galaxyPart = (j, n, t, tl, o, i) => {
  const arm = i % 2, r = 0.4 + 9 * Math.pow(hash(i, 160), 0.8), a = arm * Math.PI + r * 0.55 + t * 0.12 + (hash(i, 161) - 0.5) * 0.7;
  put(o, i, Math.cos(a) * r, (hash(i, 162) - 0.5) * 0.35, Math.sin(a) * r, hash(i, 163) < 0.15 ? PINK : MID, 0.75);
};
const scatterPart = (j, n, t, tl, o, i) => { const s = sph(i, 170), r = 9 + 10 * hash(i, 172); put(o, i, s[0] * r, s[1] * r * 0.7, s[2] * r - 4, MID, 0.7); };
const crowdPart = (j, n, t, tl, o, i) => {
  const rows = [16, 18, 20, 22, 24, 26, 28]; let h = i % 154, r = 0; while (h >= rows[r]) { h -= rows[r]; r++; }
  const x = (h - (rows[r] - 1) / 2) * 0.82 + (r % 2) * 0.2, y = -2.55 + r * 0.72 + 0.05 * Math.abs(Math.sin(t * 7 + h * 1.7 + r)), z = -r * 1.25;
  const col = hash(h, 180 + r) < 0.07 ? PINK : WHITE, u = hash(i, 181);
  if (u < 0.55) { const s = sph(i, 182), rr = 0.2 * Math.cbrt(hash(i, 184)); put(o, i, x + s[0] * rr, y + s[1] * rr, z + s[2] * rr, col); }
  else { const a = Math.PI * hash(i, 185); put(o, i, x + Math.cos(a) * 0.32, y - 0.5 + Math.sin(a) * 0.26, z, col, 0.8); }
};

// ---------- shots
const CAM = {
  front: () => ({ p: [0, 0, D], l: [0, 0, 0] }),
  orbit: (t, tl) => { const a = -0.55 + 1.1 * ease(c01(tl / 1.7)); return { p: [Math.sin(a) * D, 1.2, Math.cos(a) * D], l: [0, 0, 0] }; },
  city: (t, tl) => { const a = 0.32 - tl * 0.09; return { p: [Math.sin(a) * 12, 14, Math.cos(a) * 12], l: [0, -0.8, 0] }; },
};
export const SHOTS = [
  [-9, "scatter"], [0.0, "yo"], [0.7, "everyone"], [2.55, "welcome"], [3.25, "hackathon"], [5.0, "crowd"], [6.05, "shoutout"],
  [7.05, "sundaiRing"], [8.0, "together"], [9.3, "today"], [10.55, "cubeBuild"], [12.05, "experiment"], [13.0, "bulb"], [14.8, "fun"],
  [16.2, "theme"], [17.85, "threeD", "orbit"], [19.5, "browserWave"], [20.9, "threejs"], [22.05, "ai"], [23.3, "ball"], [24.5, "think"],
  [26.2, "globe"], [27.0, "gears"], [28.6, "browserGlobe"], [30.4, "simulate"], [31.7, "traffic"], [32.55, "city", "city"], [33.75, "weather"],
  [34.45, "rain"], [35.4, "solar"], [36.75, "thousand"], [39.05, "burst"], [40.65, "creative"], [41.95, "cool"], [43.1, "code"], [44.7, "clock"],
  [46.85, "physics"], [47.9, "fma"], [48.95, "ideas"], [50.55, "knot"], [52.1, "wirecube"], [54.2, "threeDq"], [55.5, "check"], [57.55, "learn"],
  [58.45, "trynew"], [59.15, "network"], [60.7, "tower"], [63.3, "onething"], [64.45, "bang"], [65.3, "overthink"], [67.3, "tangle"],
  [69.65, "tinycube"], [70.45, "simple"], [71.15, "interactive"], [72.25, "goes"], [73.35, "talk"], [74.85, "share"], [75.85, "question"],
  [76.95, "burst"], [77.95, "experiment2"], [78.8, "progress"], [80.55, "cubeBuild"], [82.1, "built"], [82.95, "learned"], [84.0, "network"],
  [84.75, "friends"], [85.55, "signRing"], [87.3, "thanks"], [88.45, "logoRing"], [90.55, "galaxy"],
];
export const CLICK = { t: 71.76, x: 1110, y: 545 };

let S = {}, THREE_, renderer_, scene, cam, pts, geo, A, B, composer, city, dust;

function buildShapes() {
  const big = { cx: 700, maxW: 880 };
  const yo = textPts("YO", { cx: 960, cy: 540, maxW: 1400, maxH: 400, hole: 1 }); slots.yo = yo.slot;
  const cool = textPts("COOL", { cy: 500, maxH: 290, hole: 2 }); slots.cool = cool.slot;
  const goes = textPts("GOES", { cy: 500, maxH: 290, hole: 1 }); slots.goes = goes.slot;
  const frame = (cy) => sample((g) => {
    const x = 960 - 550, y = cy - 320, w = 1100, h = 640; g.lineWidth = 7; g.beginPath(); g.roundRect(x, y, w, h, 26); g.stroke();
    g.beginPath(); g.moveTo(x, y + 66); g.lineTo(x + w, y + 66); g.stroke();
    for (let k = 0; k < 3; k++) { g.beginPath(); g.arc(x + 40 + k * 34, y + 33, 10, 0, TAU); g.fill(); }
    g.beginPath(); g.roundRect(x + 260, y + 16, 580, 34, 17); g.lineWidth = 4; g.stroke();
  });
  const bulbOutline = sample((g) => {
    g.lineWidth = 12; g.beginPath(); g.arc(960, 410, 190, Math.PI * 0.78, Math.PI * 2.22); g.lineTo(1030, 680); g.lineTo(890, 680); g.closePath(); g.stroke();
    for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(895, 712 + k * 30); g.lineTo(1025, 712 + k * 30); g.stroke(); }
  });
  const filament = sample((g) => { g.lineWidth = 9; g.beginPath(); g.moveTo(905, 620); g.lineTo(915, 440); g.lineTo(945, 500); g.lineTo(960, 430); g.lineTo(975, 500); g.lineTo(1005, 440); g.lineTo(1015, 620); g.stroke(); });
  const face = sample((g) => { g.lineWidth = 12; g.beginPath(); g.arc(960, 500, 270, 0, TAU); g.stroke(); for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; g.lineWidth = k % 3 ? 6 : 12; g.beginPath(); g.moveTo(960 + Math.cos(a) * 225, 500 + Math.sin(a) * 225); g.lineTo(960 + Math.cos(a) * 252, 500 + Math.sin(a) * 252); g.stroke(); } });
  const check = sample((g) => { g.lineWidth = 120; g.beginPath(); g.moveTo(700, 520); g.lineTo(880, 690); g.lineTo(1230, 300); g.stroke(); });
  const barFrame = sample((g) => { g.lineWidth = 7; g.beginPath(); g.roundRect(460, 440, 1000, 120, 60); g.stroke(); });
  const code = sample((g) => {
    const lines = ['import * as THREE from "three";', 'const sim = await ai.write("physics");', "sim.gravity = 9.81;", "sim.spawn(1000);"];
    g.font = `700 54px "JetBrains Mono"`; const w = Math.max(...lines.map((l) => g.measureText(l).width)); const fs = Math.min(54, (54 * 1250) / w);
    g.font = `700 ${fs}px "JetBrains Mono"`; g.textBaseline = "middle"; const x0 = 960 - (w * fs) / 54 / 2;
    lines.forEach((l, k) => g.fillText(l, x0, 500 + (k - 1.5) * fs * 1.55));
  });
  for (let k = 0; k < 9; k++) { const a = (k / 9) * TAU; NODES.push([Math.cos(a) * 4.3 + (hash(k, 190) - 0.5) * 1.2, Math.sin(a * 2) * 1.6 + (hash(k, 191) - 0.5) * 1.4, Math.sin(a) * 2.2]); }
  let bx = 1.5, by = 5.2; BOLT.push([bx, by]); for (let k = 0; k < 9; k++) { bx += (hash(k, 195) - 0.5) * 1.4; by -= 1.05; BOLT.push([bx, by]); }

  const T = (s, col = WHITE, opt = {}, depth) => text(s, col, opt, depth);
  S = {
    scatter: shape([[1, scatterPart]]),
    yo: shape([[1, sampled(yo.pts, WHITE)]]),
    everyone: T("EVERYONE", WHITE, { ...big, cy: 540, maxH: 230 }),
    welcome: T("WELCOME", WHITE, { ...big, cy: 540 }),
    hackathon: T("HACKATHON", PINK, { ...big, cy: 540 }),
    crowd: shape([[1, crowdPart]]),
    shoutout: T("SHOUT OUT"),
    sundaiRing: shape([[1, ringPart(960, 520, 480, 300, WHITE, 0.55, 0.06)]]),
    together: T("TOGETHER"),
    today: T("TODAY"),
    cubeBuild: shape([[1, cubeBuildPart]], (t, tl) => ({ ry: 0.7 + tl * 0.7, rx: 0.42, cy: -0.1 })),
    experiment: T("EXPERIMENT"),
    bulb: shape([[0.78, sampled(bulbOutline, WHITE)], [0.22, sampled(filament, PINK)]]),
    fun: (() => { const base = T("FUN", PINK, { maxH: 380 }); return (t, tl, o) => { base(t, tl, o); for (let i = 0; i < N; i++) o.P[i * 3 + 1] += 0.18 * Math.abs(Math.sin(t * 6 + Math.floor((o.P[i * 3] + 6) / 2.6) * 1.9)); }; })(),
    theme: T("THE THEME"),
    threeD: T("3D", WHITE, { maxH: 420 }, 1.4),
    browserWave: shape([[0.42, sampled(frame(530), WHITE)], [0.58, wavePart]]),
    threejs: T("three.js", WHITE, { maxH: 260 }),
    ai: T("AI", PINK, { maxH: 420 }),
    ball: shape([[1, ballPart]], (t) => ({ ry: t * 0.4 })),
    think: T("THINK"),
    globe: shape([[1, globePart(0, 0.4, 2.7)]]),
    gears: shape([[0.58, gearPart(-1.55, 2.0, 12, 1.1, 0, WHITE)], [0.42, gearPart(1.95, 1.35, 8, -1.1 * 12 / 8, Math.PI / 8, PINK)]], () => ({ cy: 0.35 })),
    browserGlobe: shape([[0.38, sampled(frame(530), WHITE)], [0.62, globePart(0, -0.55, 2.2)]]),
    simulate: T("SIMULATE"),
    traffic: T("TRAFFIC"),
    city: shape([[1, carPart]]),
    weather: T("WEATHER"),
    rain: shape([[1, rainPart]]),
    solar: shape([[1, solarPart]], (t, tl) => ({ rx: 0.5, ry: 0.15 + tl * 0.05, cy: 0.3 })),
    thousand: shape([[1, thousandPart]]),
    burst: shape([[1, burstPart]]),
    creative: T("CREATIVE", PINK),
    cool: shape([[1, sampled(cool.pts, WHITE)]]),
    code: shape([[1, sampled(code, WHITE, { s: 0.85 })]]),
    clock: shape([[0.62, sampled(face, WHITE)], [0.38, clockHands]]),
    physics: T("PHYSICS"),
    fma: T("F = ma", PINK, { maxH: 300 }),
    ideas: T("IDEAS"),
    knot: shape([[1, knotPart]], (t, tl) => ({ ry: tl * 0.9, rx: 0.5 + tl * 0.3, sc: 0.85, cy: 0.35 })),
    wirecube: shape([[1, (j, n, t, tl, o, i) => { const e = cubeEdge(i, 200); put(o, i, e[0] * 3.6, e[1] * 3.6, e[2] * 3.6, hash(i, 202) < 0.08 ? PINK : WHITE); }]], (t, tl) => ({ ry: 0.6 + tl * 0.8, rx: 0.5 + tl * 0.25, cy: 0.4 })),
    threeDq: T("3D?", WHITE, { maxH: 380 }, 1.0),
    check: shape([[1, sampled(check, PINK)]]),
    learn: T("LEARN"),
    trynew: T("TRY NEW THINGS"),
    network: shape([[1, netPart]], (t, tl) => ({ ry: t * 0.5, sc: 1.35, cy: 0.4 })),
    tower: shape([[1, towerPart]], (t, tl) => ({ ry: tl * 0.6, rx: 0.2 })),
    onething: T("ONE THING"),
    bang: T("!", PINK, { maxH: 420 }),
    overthink: (() => { const base = T("OVERTHINK"); return (t, tl, o) => { base(t, tl, o); const amp = 0.015 + 0.3 * c01((tl - 0.6) / 1.2) ** 2; for (let i = 0; i < N; i++) { o.P[i * 3] += amp * Math.sin(t * 23 + hash(i, 210) * TAU); o.P[i * 3 + 1] += amp * Math.sin(t * 19 + hash(i, 211) * TAU); } }; })(),
    tangle: shape([[1, tanglePart]], (t, tl) => ({ ry: t * 0.7, rx: 0.3, cy: 0.35 })),
    tinycube: shape([[1, (j, n, t, tl, o, i) => { const e = cubeEdge(i, 220); put(o, i, e[0] * 1.1, e[1] * 1.1, e[2] * 1.1, WHITE); }]], (t, tl) => ({ ry: 0.6 + tl, rx: 0.5, cy: 0.4 })),
    simple: T("SIMPLE"),
    interactive: (() => { const base = T("INTERACTIVE"); const cxw = wx(CLICK.x), cyw = wy(CLICK.y); return (t, tl, o) => { base(t, tl, o); const tau = t - CLICK.t; if (tau <= 0) return; for (let i = 0; i < N; i++) { const k = i * 3, dx = o.P[k] - cxw, dy = o.P[k + 1] - cyw, d = Math.hypot(dx, dy) + 1e-4, front = tau * 9; if (d > front) continue; const w = Math.sin(3 * d - 26 * tau) * Math.exp(-tau * 1.6) * Math.exp(-d * 0.18) * 0.22; o.P[k] += (dx / d) * w; o.P[k + 1] += (dy / d) * w; o.P[k + 2] += w * 3; const hl = Math.exp(-((d - front + 0.6) ** 2) * 2); o.C[k] += (PINK[0] - o.C[k]) * hl; o.C[k + 1] += (PINK[1] - o.C[k + 1]) * hl; o.C[k + 2] += (PINK[2] - o.C[k + 2]) * hl; } }; })(),
    goes: shape([[1, sampled(goes.pts, WHITE)]]),
    talk: T("TALK"),
    share: shape([[1, sharePart]]),
    question: T("?", WHITE, { maxH: 420 }),
    experiment2: (() => { const base = T("EXPERIMENT"); return (t, tl, o) => { base(t, tl, o); const f = Math.floor(t * 14); for (let i = 0; i < N; i++) { const band = Math.floor((o.P[i * 3 + 1] + 5) * 4); if (hash(band, f) > 0.72) o.P[i * 3] += (hash(band, f + 999) - 0.5) * 0.9; } }; })(),
    progress: shape([[0.35, sampled(barFrame, WHITE)], [0.65, (j, n, t, tl, o, i) => { const u = hash(i, 230), p = ease(c01((t - 79.05) / 1.35)); put(o, i, wx(482 + u * 956 * p), wy(458 + hash(i, 231) * 84), 0, PINK, u * 956 * p > 2 || p > 0.98 ? 1 : 0); }]]),
    built: T("BUILT"),
    learned: T("LEARNED"),
    friends: T("FRIENDS", PINK),
    signRing: shape([[1, ringPart(1460, 540, 300, 300, WHITE, 0.6, 0.08)]]),
    thanks: T("THANKS", WHITE, { cx: 690, maxW: 860, maxH: 260 }),
    logoRing: shape([[1, ringPart(690, 440, 450, 210, WHITE, 0.5, 0.07)]]),
    galaxy: shape([[1, galaxyPart]], (t, tl) => ({ rx: 0.95, rz: 0.25, cy: -0.2 })),
  };
}

function buildCity(THREE) {
  const g = new THREE.Group(), geo2 = new THREE.BoxGeometry(1, 1, 1); geo2.translate(0, 0.5, 0);
  const mesh = new THREE.InstancedMesh(geo2, new THREE.MeshStandardMaterial({ color: 0x1c1c1c, roughness: 0.85, metalness: 0 }), 96 * 2);
  const m = new THREE.Matrix4(); let k = 0;
  for (let ix = 0; ix < 12; ix++) for (let iz = 0; iz < 8; iz++) for (let q = 0; q < 2; q++) {
    const x = (ix - 5.5) * STREET + (q ? 0.28 : -0.28), z = (iz - 3.5) * STREET + (hash(ix * 8 + iz, 240 + q) - 0.5) * 0.5;
    const h = 0.15 + 2.1 * Math.exp(-(x * x + z * z) / 18) * (0.3 + hash(k, 242)) + 0.2 * hash(k, 243);
    m.makeScale(0.5, h, 0.62 + 0.3 * hash(k, 244)); m.setPosition(x, 0, z); mesh.setMatrixAt(k++, m);
  }
  g.add(mesh);
  return g;
}
const rise = (t) => ease(c01((t - 32.65) / 0.7)) * (1 - ease(c01((t - 33.62) / 0.4)));

export async function init(THREE, renderer) {
  THREE_ = THREE; renderer_ = renderer;
  const col = (hex, mul = 1) => { const c = new THREE.Color(hex); return [c.r * mul, c.g * mul, c.b * mul]; };
  WHITE = [0.9, 0.9, 0.9]; PINK = col("#ec8796"); GRAY = [0.07, 0.07, 0.07]; MID = [0.25, 0.25, 0.25]; DIM = [0.03, 0.03, 0.03];
  cv = document.createElement("canvas"); cv.width = W; cv.height = H; ctx = cv.getContext("2d", { willReadFrequently: true });
  buildShapes();

  scene = new THREE.Scene(); scene.background = new THREE.Color(0x050505);
  cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 200);
  const mk = () => ({ P: new Float32Array(N * 3), C: new Float32Array(N * 3), S: new Float32Array(N) });
  A = mk(); B = mk();
  geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("aColor", new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.setAttribute("aScale", new THREE.BufferAttribute(new Float32Array(N), 1));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 100);
  const mat = new THREE.ShaderMaterial({
    uniforms: { uSize: { value: 74 } }, transparent: true, depthWrite: false,
    vertexShader: `attribute vec3 aColor; attribute float aScale; uniform float uSize; varying vec3 vC; varying float vS;
      void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); gl_Position = projectionMatrix * mv;
      gl_PointSize = max(uSize * aScale / max(-mv.z, 0.5), 0.0); vC = aColor; vS = aScale; }`,
    fragmentShader: `varying vec3 vC; varying float vS; void main(){ if (vS < 0.02) discard; float d = length(gl_PointCoord - 0.5);
      float a = smoothstep(0.5, 0.28, d); if (a < 0.02) discard; gl_FragColor = vec4(vC, a); }`,
  });
  pts = new THREE.Points(geo, mat); pts.frustumCulled = false; scene.add(pts);

  // background dust for parallax
  const dn = 2500, dp = new Float32Array(dn * 3), dc = new Float32Array(dn * 3), ds = new Float32Array(dn);
  for (let i = 0; i < dn; i++) { dp[i * 3] = (hash(i, 300) - 0.5) * 90; dp[i * 3 + 1] = (hash(i, 301) - 0.5) * 50; dp[i * 3 + 2] = -10 - hash(i, 302) * 50; const v = 0.05 + 0.1 * hash(i, 303); dc[i * 3] = dc[i * 3 + 1] = dc[i * 3 + 2] = v; ds[i] = 1.2 + hash(i, 304) * 1.5; }
  const dg = new THREE.BufferGeometry(); dg.setAttribute("position", new THREE.BufferAttribute(dp, 3)); dg.setAttribute("aColor", new THREE.BufferAttribute(dc, 3)); dg.setAttribute("aScale", new THREE.BufferAttribute(ds, 1));
  dust = new THREE.Points(dg, mat); dust.frustumCulled = false; scene.add(dust);

  city = buildCity(THREE); scene.add(city);
  const key = new THREE.DirectionalLight(0xffffff, 2.6); key.position.set(-6, 10, 5); scene.add(key, new THREE.AmbientLight(0xffffff, 0.25));

  composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(960, 540), 0.32, 0.3, 0.85));
  composer.addPass(new OutputPass());
  render(0); // compile shaders inside setup
}

const camAt = (shot, t) => (CAM[shot[2] || "front"])(t, t - shot[0]);
export function render(t) {
  let k = 0; while (k + 1 < SHOTS.length && SHOTS[k + 1][0] <= t) k++;
  const cur = SHOTS[k], prev = SHOTS[Math.max(0, k - 1)], tl = t - cur[0];
  S[cur[1]](t, tl, B);
  const pa = geo.attributes.position.array, ca = geo.attributes.aColor.array, sa = geo.attributes.aScale.array;
  if (k > 0 && tl < 0.65) {
    S[prev[1]](t, t - prev[0], A);
    for (let i = 0; i < N; i++) {
      const p = ease(c01((tl - hash(i, 21) * 0.22) / 0.4)), bl = Math.sin(p * Math.PI), q = i * 3;
      const nx = (hash(i, 22) - 0.5) * 1.8, ny = (hash(i, 23) - 0.5) * 1.8, nz = hash(i, 24) * 1.5;
      pa[q] = A.P[q] + (B.P[q] - A.P[q]) * p + bl * nx; pa[q + 1] = A.P[q + 1] + (B.P[q + 1] - A.P[q + 1]) * p + bl * ny; pa[q + 2] = A.P[q + 2] + (B.P[q + 2] - A.P[q + 2]) * p + bl * nz;
      ca[q] = A.C[q] + (B.C[q] - A.C[q]) * p; ca[q + 1] = A.C[q + 1] + (B.C[q + 1] - A.C[q + 1]) * p; ca[q + 2] = A.C[q + 2] + (B.C[q + 2] - A.C[q + 2]) * p;
      sa[i] = A.S[i] + (B.S[i] - A.S[i]) * p;
    }
  } else { pa.set(B.P); ca.set(B.C); sa.set(B.S); }
  geo.attributes.position.needsUpdate = geo.attributes.aColor.needsUpdate = geo.attributes.aScale.needsUpdate = true;

  // camera: blend previous shot's pose into this one's over 0.6 s, always drifting
  const c1 = camAt(cur, t), c0 = k > 0 ? camAt(prev, t) : c1, g = ease(c01(tl / 0.6));
  const L = (a, b) => a.map((v, n) => v + (b[n] - v) * g), p = L(c0.p, c1.p), l = L(c0.l, c1.l);
  cam.position.set(p[0] + 0.35 * Math.sin(t * 0.31), p[1] + 0.2 * Math.sin(t * 0.23), p[2]);
  cam.lookAt(l[0], l[1], l[2]);
  dust.rotation.y = t * 0.004;

  const r = rise(t); city.visible = r > 0.002; city.scale.set(1, Math.max(r, 0.001), 1);
  const f = flash(t); scene.background.setRGB(0.0016 + f * 0.25, 0.0016 + f * 0.25, 0.0016 + f * 0.27);
  composer.render();
}
