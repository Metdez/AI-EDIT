// Shared helpers for voxel formations. Everything is a pure function of its inputs.
export const C = {
  pink: 0xec8796, orange: 0xf6b04a, purple: 0x8f7fd6, cream: 0xfff4e6, navy: 0x111827,
  sky: 0x6fb7e8, grey: 0x5b6178, white: 0xffffff, red: 0xe5566b, green: 0x7bd88f, brick: 0xb8606a, dark: 0x2a3150,
};

export const rng = (a) => () => { a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
export const hash = (i, s = 0) => { let h = Math.imul(i ^ (s * 0x9e3779b1), 0x85ebca6b); h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, p) => a + (b - a) * p;
export const ease = (p) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2); // cubic in-out
export const easeOut = (p) => 1 - Math.pow(1 - p, 3);
export const mix = (c1, c2, p) => { // hex lerp in sRGB, returns hex
  const r = lerp((c1 >> 16) & 255, (c2 >> 16) & 255, p), g = lerp((c1 >> 8) & 255, (c2 >> 8) & 255, p),
    b = lerp(c1 & 255, c2 & 255, p); return (r << 16) | (g << 8) | b; };
export const grad = (p) => p < 0.5 ? mix(C.pink, C.purple, p * 2) : mix(C.purple, C.orange, (p - 0.5) * 2);

// A point list: [{x,y,z,c}] -> formation with optional spin/bob/offset.
export function still(pts, { spin = 0, yaw0 = 0, ox = 0, oy = 0, oz = 0, bob = 0, t0 = 0, s = 0.9, sy, tilt = 0, sc = 1, sway = 0 } = {}) {
  s *= sc;
  return { count: pts.length, fn(i, t, o) {
    const p = pts[i], a = yaw0 + spin * (t - t0) + sway * Math.sin((t - t0) * 1.3), c = Math.cos(a), sn = Math.sin(a);
    let y = p.y * sc, z = p.z * sc; const px = p.x * sc;
    if (tilt) { const ct = Math.cos(tilt), st = Math.sin(tilt); const y2 = y * ct - z * st; z = y * st + z * ct; y = y2; }
    o.x = ox + c * px + sn * z; o.z = oz - sn * px + c * z; o.y = oy + y + bob * Math.sin((t - t0) * 2 + p.x * 0.2);
    o.ry = tilt ? 0 : a; o.c = p.c; o.sx = o.sy = o.sz = p.s ? p.s * sc : s; if (sy) o.sy = sy;
  } };
}

// Morph through several point sets in one shot: hold `period` s each, blend over the last `trans` s.
export function cycle(sets, t0, period, { trans = 0.28, spin = 0, ox = 0, oy = 0, sc = 1 } = {}) {
  const n = Math.max(...sets.map((s) => s.length)), last = sets.length - 1;
  return { count: n, fn(i, t, o) {
    const lt = Math.max(0, t - t0), k = Math.min(last, Math.floor(lt / period)), f = lt - k * period;
    const a = sets[k], b = sets[Math.min(last, k + 1)], p = k === last ? 0 : ease(clamp((f - (period - trans)) / trans));
    const pa = a[i % a.length], pb = b[i % b.length], ang = spin * lt, cs = Math.cos(ang), sn = Math.sin(ang);
    const x = lerp(pa.x, pb.x, p) * sc, y = lerp(pa.y, pb.y, p) * sc, z = lerp(pa.z, pb.z, p) * sc;
    o.x = ox + cs * x + sn * z; o.z = -sn * x + cs * z; o.y = oy + y; o.ry = ang;
    o.c = p < 0.5 ? pa.c : pb.c;
    const hideA = i >= a.length, hideB = i >= b.length; o.sx = o.sy = o.sz = 0.9 * sc * lerp(hideA ? 0 : 1, hideB ? 0 : 1, p);
  } };
}

// Height of a ball dropped from h0 (above floor) at time lt, gravity g, restitution e. Pure in lt.
export function bounceY(lt, h0, g = 40, e = 0.55) {
  if (lt <= 0) return h0;
  let tf = Math.sqrt((2 * h0) / g); if (lt < tf) return h0 - 0.5 * g * lt * lt;
  let tt = lt - tf, v = Math.sqrt(2 * g * h0) * e;
  for (let k = 0; k < 12; k++) { const T = (2 * v) / g; if (tt < T) return v * tt - 0.5 * g * tt * tt; tt -= T; v *= e; }
  return 0;
}

// Points of a filled voxel ball of radius r on an integer grid.
export function ball(r, colorFn) { const pts = [], R = Math.ceil(r);
  for (let x = -R; x <= R; x++) for (let y = -R; y <= R; y++) for (let z = -R; z <= R; z++)
    if (x * x + y * y + z * z <= r * r) pts.push({ x, y, z, c: colorFn(x, y, z) });
  return pts; }

// ASCII bitmap -> points (rows top->bottom). Map chars to colours; '.' or ' ' empty. depth = extrusion.
export function bitmap(rows, pal, { depth = 1, cx = true, scale = 1 } = {}) {
  const pts = [], h = rows.length, w = Math.max(...rows.map((r) => r.length));
  for (let r = 0; r < h; r++) for (let q = 0; q < rows[r].length; q++) {
    const ch = rows[r][q]; if (ch === "." || ch === " ") continue;
    for (let d = 0; d < depth; d++) pts.push({ x: (q - (cx ? (w - 1) / 2 : 0)) * scale, y: ((h - 1) / 2 - r) * scale,
      z: (d - (depth - 1) / 2) * scale, c: pal[ch] ?? C.white });
  }
  return pts;
}

// 5x7 voxel font (only the glyphs this film spells).
const FONT = {
  H: ["#...#", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  A: [".###.", "#...#", "#...#", "#####", "#...#", "#...#", "#...#"],
  C: [".###.", "#...#", "#....", "#....", "#....", "#...#", ".###."],
  K: ["#...#", "#..#.", "#.#..", "##...", "#.#..", "#..#.", "#...#"],
  T: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "..#.."],
  O: [".###.", "#...#", "#...#", "#...#", "#...#", "#...#", ".###."],
  N: ["#...#", "##..#", "#.#.#", "#..##", "#...#", "#...#", "#...#"],
  I: ["#####", "..#..", "..#..", "..#..", "..#..", "..#..", "#####"],
  D: ["####.", "#...#", "#...#", "#...#", "#...#", "#...#", "####."],
  "3": ["####.", "....#", "....#", ".###.", "....#", "....#", "####."],
};
export function text(str, colorFn, { depth = 2, gap = 1 } = {}) {
  const pts = []; const W = str.length * (5 + gap) - gap;
  [...str].forEach((ch, k) => { const g = FONT[ch]; if (!g) return;
    for (let r = 0; r < 7; r++) for (let q = 0; q < 5; q++) if (g[r][q] === "#")
      for (let d = 0; d < depth; d++) pts.push({ x: k * (5 + gap) + q - (W - 1) / 2, y: 3 - r, z: d - (depth - 1) / 2,
        c: colorFn(k, q, r) }); });
  return pts;
}

// Voxel sundae (after the logo icon): cream swirl on a pink->orange cup, stem and base.
export function sundae() {
  const pts = [];
  const ring = (y, r, c, fill = false) => { for (let x = -r; x <= r; x++) for (let z = -r; z <= r; z++) {
    const d = Math.hypot(x, z); if (d <= r + 0.35 && (fill || d > r - 1.1)) pts.push({ x, y, z, c: typeof c === "function" ? c(x, z) : c }); } };
  // cup: wide rim tapering down
  const cupR = [6, 6, 5.6, 5, 4.3, 3.5, 2.6];
  cupR.forEach((r, k) => ring(4 - k, r, mix(C.pink, C.orange, k / (cupR.length - 1)), k === 0 || k === cupR.length - 1));
  ring(-3, 1, C.orange, true); ring(-4, 1, C.orange, true);
  ring(-5, 3, C.orange, true);
  // swirl: stacked shrinking discs, cream with a purple tip
  [5.2, 4.6, 3.8, 3.0, 2.2, 1.4, 0.6].forEach((r, k) => ring(5 + k, r, k === 6 ? C.pink : (k % 2 ? 0xf3e3d3 : C.cream), true));
  return pts;
}

// The 12 little icon tiles from the logo ring (3x3 glyphs), coloured around the wheel.
const ICONS = [["#.#", ".#.", "#.#"], ["###", "#.#", "###"], [".#.", "###", ".#."], ["#..", "##.", "###"], ["###", "...", "###"], ["#.#", "#.#", "###"]];
export function iconTile(k) { const g = ICONS[k % ICONS.length]; const pts = [];
  const col = [C.purple, C.pink, C.orange][k % 3];
  for (let r = -2; r <= 2; r++) for (let q = -2; q <= 2; q++) {
    const edge = Math.abs(r) === 2 || Math.abs(q) === 2; const inner = !edge && g[r + 1][q + 1] === "#";
    if (edge || inner) pts.push({ x: q, y: -r, z: 0, c: inner ? C.cream : col });
  }
  return pts; }

// Voxel person, 3 wide x 7 tall (head, body, legs).
export function person(col, { wave = 0 } = {}) {
  return bitmap(["hhh", "ehe", "bbb", "bbb", "bbb", "l.l", "l.l"], { h: C.cream, e: C.navy, b: col, l: C.dark }, { depth: 2 })
    .map((p) => ({ ...p, y: p.y + 3 })); // feet at y=0
}

// Sample N points on a sphere surface/volume (seeded).
export function sphere(n, r, seed, colorFn, shell = true) {
  const rand = rng(seed), pts = [];
  for (let i = 0; i < n; i++) { const u = rand() * 2 - 1, a = rand() * Math.PI * 2, rr = shell ? r : r * Math.cbrt(rand());
    const s = Math.sqrt(1 - u * u); pts.push({ x: rr * s * Math.cos(a), y: rr * u, z: rr * s * Math.sin(a), c: colorFn(i, u) }); }
  return pts;
}

export function cubeShell(n, colorFn) { const pts = [], h = (n - 1) / 2;
  for (let x = 0; x < n; x++) for (let y = 0; y < n; y++) for (let z = 0; z < n; z++) {
    if (x && y && z && x < n - 1 && y < n - 1 && z < n - 1) continue;
    pts.push({ x: x - h, y: y - h, z: z - h, c: colorFn(x, y, z) }); }
  return pts; }

// Camera helpers: return [px,py,pz,tx,ty,tz]
export const orbit = ({ r = 38, h = 4, yaw = 0, speed = 0.08, t0 = 0, tx = 0, ty = 0, tz = 0, dolly = 0 }) => (t) => {
  const a = yaw + speed * (t - t0), rr = r - dolly * (t - t0);
  return [tx + Math.sin(a) * rr, ty + h, tz + Math.cos(a) * rr, tx, ty, tz]; };
