// H–L: AI physics balls, idea bulb, 2D->3D smiley, book, people, tower, "!", knot, gyroscope, one cube, talk circle.
import { C, rng, hash, clamp, ease, easeOut, mix, grad, still, bitmap, ball, sphere, cycle, bounceY, person, orbit } from "./lib.js";

const cam0 = (r = 34, h = 3, tx = 0, ty = 0) => (t) => [tx + Math.sin(t * 0.2) * 3, ty + h, r, tx, ty, 0];

function balls() { // 24 balls dropped onto a floor on the right half; the code on the left "runs" them
  const R = rng(81), B = [], shape = ball(1.75, () => 0);
  for (let k = 0; k < 24; k++) B.push({ x: 8 + (k % 6) * 2.3 + (R() - 0.5), z: Math.floor(k / 6) * 2.2 - 3, h: 6 + R() * 8, d: 43.45 + k * 0.07, c: [C.pink, C.orange, C.purple, C.sky][k % 4] });
  return { B, shape };
}
const BALLS = balls();
const ballFormation = (lock) => () => { const { B, shape } = BALLS, n = shape.length;
  return { count: B.length * n, fn(i, t, o) { const b = B[Math.floor(i / n)], p = shape[i % n], k = Math.floor(i / n);
    let x = b.x, y = -7 + 1.3 + bounceY(t - b.d, b.h, 38, 0.62), z = b.z;
    if (lock) { const q = easeOut(clamp((t - 47.06 - k * 0.02) / 0.5)); const lx = 8.5 + (k % 6) * 2.2, ly = 4 - Math.floor(k / 6) * 2.2;
      x += (lx - x) * q; y += (ly - y) * q; z += (0 - z) * q; }
    o.x = x + p.x * 0.5; o.y = y + p.y * 0.5; o.z = z + p.z * 0.5; o.c = b.c; o.sx = o.sy = o.sz = 0.5; } }; };

function bulb() { const pts = [];
  ball(5, () => 0).forEach((p) => { if (p.x * p.x + p.y * p.y + p.z * p.z > 13) pts.push({ x: p.x, y: p.y + 2, z: p.z, kind: 0 }); });
  for (let y = -4; y >= -8; y--) for (let a = 0; a < 12; a++) { const r = y > -7 ? 2.4 : 1.6; pts.push({ x: Math.round(Math.cos(a / 12 * 6.283) * r), y, z: Math.round(Math.sin(a / 12 * 6.283) * r), kind: y % 2 ? 1 : 2 }); }
  for (let y = -2; y <= 3; y++) pts.push({ x: 0, y: y + 1, z: 0, kind: 3 });
  for (let r = 0; r < 8; r++) for (let s = 0; s < 4; s++) { const a = (r / 8) * 6.283; pts.push({ x: Math.cos(a) * (7.5 + s * 1.2), y: 2 + Math.sin(a) * (7.5 + s * 1.2), z: 0, kind: 4, s }); }
  return pts; }

const FACE2D = ["...######...", ".##########.", "############", "###..##..###", "###..##..###", "############", "############", "##.######.##", "###.####.###", ".###....###.", "..########..", "...######..."];

function face3d() { const pts = [];
  ball(6, () => 0).forEach((p) => { const d = p.x * p.x + p.y * p.y + p.z * p.z; if (d < 25) return;
    const front = p.z > 3; let c = C.orange;
    if (front && Math.abs(Math.abs(p.x) - 2) <= 0.5 && p.y >= 1 && p.y <= 2) c = C.navy;
    if (front && p.y <= -2 && p.y >= -3 && Math.abs(p.x) <= 3 && (p.y === -3 || Math.abs(p.x) === 3)) c = C.navy;
    pts.push({ ...p, c }); });
  return pts; }

function book() { const pts = []; // spine on x=0; two pages tilted up like a V, one flipping page
  for (let side = -1; side <= 1; side += 2) for (let u = 1; u <= 8; u++) for (let v = -5; v <= 5; v++) pts.push({ u: u * side, v, kind: 0 });
  for (let u = 1; u <= 8; u++) for (let v = -5; v <= 5; v++) pts.push({ u, v, kind: 1 });
  return pts; }

function tower() { const pts = []; for (let y = 0; y < 40; y++) for (let x = 0; x < 5; x++) for (let z = 0; z < 5; z++)
  if (x === 0 || z === 0 || x === 4 || z === 4) pts.push({ x: x - 2, y, z: z - 2, c: (y % 3 === 1 && (x + z) % 2) ? C.cream : mix(C.purple, C.pink, y / 39) }); return pts; }

function knot() { const pts = []; for (let k = 0; k < 900; k++) { const f = (k / 900) * Math.PI * 2, p = 3, q = 7, r = Math.cos(q * f) + 2.2;
  pts.push({ x: r * Math.cos(p * f) * 3.4, y: r * Math.sin(p * f) * 3.4, z: -Math.sin(q * f) * 3.4, c: grad(k / 900) }); } return pts; }

function gyro() { const rings = [[4.5, C.pink, 1.3, 0], [7, C.orange, -0.9, 1], [9.5, C.purple, 0.7, 2], [12, C.sky, -0.5, 0]], pts = [];
  rings.forEach(([R, c, w, ax], k) => { const n = Math.round(2 * Math.PI * R / 0.8); for (let j = 0; j < n; j++) pts.push({ k, R, a: j / n * 6.283, c, w, ax }); });
  ball(1.8, () => C.cream).forEach((p) => pts.push({ core: 1, ...p }));
  return { count: pts.length, fn(i, t, o) { const p = pts[i], lt = t - 67.4;
    if (p.core) { o.x = p.x; o.y = p.y; o.z = p.z; o.c = C.cream; return; }
    let x = Math.cos(p.a) * p.R, y = Math.sin(p.a) * p.R, z = 0; const b = lt * p.w * 2 + p.k;
    if (p.ax === 0) { const y2 = y * Math.cos(b) - z * Math.sin(b); z = y * Math.sin(b) + z * Math.cos(b); y = y2; }
    else if (p.ax === 1) { const x2 = x * Math.cos(b) + z * Math.sin(b); z = -x * Math.sin(b) + z * Math.cos(b); x = x2; }
    else { const x2 = x * Math.cos(b) - y * Math.sin(b); y = x * Math.sin(b) + y * Math.cos(b); x = x2; const y3 = y * 0.7 - z * 0.7; z = y * 0.7 + z * 0.7; y = y3; }
    o.x = x; o.y = y; o.z = z; o.c = p.c; o.sx = o.sy = o.sz = 0.75; } };
}

// People standing in a circle; extras (bulbs, ?, fountain) added after them.
const PCOL = [C.pink, C.orange, C.purple, C.sky, C.cream, C.green];
const BODY = person(C.pink);
const ring6 = (k, R = 8) => { const a = (k / 6) * 6.283 + 0.5; return [Math.cos(a) * R, Math.sin(a) * R * 0.8]; };
function circle(extra) { const nb = 6 * BODY.length;
  return () => { const ex = extra ? extra() : { count: 0 };
    return { count: nb + ex.count, fn(i, t, o) {
      if (i < nb) { const k = Math.floor(i / BODY.length), b = BODY[i % BODY.length], [x, z] = ring6(k), talk = Math.abs(Math.sin(t * 6 + k)) * 0.25;
        o.x = x + b.x * 1.1; o.y = -6 + b.y * 1.1 + (b.y > 5 ? talk : 0); o.z = z + b.z * 1.1; o.c = b.c === C.pink ? PCOL[k] : b.c; o.sx = o.sy = o.sz = 1.0; return; }
      ex.fn(i - nb, t, o); } }; };
}
const QM = ["###", "..#", ".##", "...", ".#."];

export const shots = [
  // H1 balls fall (gravity code on the left drives them)
  { t0: 43.28, md: 0.7, arc: 1, floor: -7, make: ballFormation(false), cam: (t) => [8 + Math.sin(t * 0.2) * 2, 1, 33, 6, -1, 0] },
  // H2 balls lock into a lattice: solved
  { t0: 47.06, md: 0, make: ballFormation(true), floor: -7, cam: (t) => [8 + Math.sin(t * 0.2) * 2, 1, 33, 6, -1, 0] },
  // H3 idea bulb: lights at 49.2, rays at 50.8
  { t0: 48.68, md: 0.8, arc: 3, make: () => { const pts = bulb();
      return { count: pts.length, fn(i, t, o) { const p = pts[i], on = clamp((t - 49.2) / 0.3), a = (t - 48.68) * 0.4, cs = Math.cos(a), sn = Math.sin(a);
        o.x = cs * p.x + sn * p.z; o.z = -sn * p.x + cs * p.z; o.y = p.y; o.ry = a;
        o.c = p.kind === 0 ? mix(0x59607e, 0xffd27a, on) : p.kind === 3 ? mix(C.grey, C.cream, on) : p.kind === 4 ? C.orange : p.kind === 1 ? 0x9aa0b8 : 0x6c728c;
        if (p.kind === 4) { const q = clamp((t - 50.76 - p.s * 0.06) / 0.2); o.x = p.x; o.z = 0; o.ry = 0; o.sx = o.sy = o.sz = q * 0.9; } } }; },
    cam: (t) => [0, 1, 36 - (t - 48.68) * 0.6, 0, 0.5, 0] },
  // I1 flat 2D smiley
  { t0: 52.2, md: 0.8, arc: 3, make: () => still(bitmap(FACE2D, { "#": C.orange }, { depth: 1 }), { sway: 0.2, t0: 52.2 }), cam: cam0(30, 0) },
  // I2 it inflates into a 3D voxel head
  { t0: 54.4, md: 0.6, arc: 0, make: () => still(face3d(), { sway: 0.7, t0: 54.4 }), cam: cam0(30, 2) },
  // I3 open book, one page flipping
  { t0: 56.64, md: 0.7, arc: 3, make: () => { const pts = book();
      return { count: pts.length, fn(i, t, o) { const p = pts[i];
        let ang = p.kind === 0 ? (p.u > 0 ? 0.35 : Math.PI - 0.35) : 0.35 + ((t - 56.9) % 0.9) / 0.9 * (Math.PI - 0.7);
        if (p.kind === 1 && t < 56.9) ang = 0.35;
        const u = Math.abs(p.u); o.x = Math.cos(ang) * u * 0.9; o.y = Math.sin(ang) * u * 0.9 - 2; o.z = p.v * 0.9;
        o.c = p.kind === 1 ? C.cream : (u === 8 ? C.purple : 0xf3e3d3); o.sx = o.sz = 0.88; o.sy = 0.35; } }; },
    cam: (t) => [Math.sin(t * 0.3) * 3, 14, 18, 0, 1, 0] },
  // J1 try new things: cube <-> pyramid shuffle
  { t0: 58.6, md: 0.4, arc: 2, make: () => { const cube = [], pyr = [];
      for (let x = 0; x < 6; x++) for (let y = 0; y < 6; y++) for (let z = 0; z < 6; z++) cube.push({ x: (x - 2.5) * 1.6, y: (y - 2.5) * 1.6, z: (z - 2.5) * 1.6, c: C.purple });
      for (let y = 0; y < 6; y++) for (let x = -5 + y; x <= 5 - y; x++) for (let z = -5 + y; z <= 5 - y; z++) pyr.push({ x: x * 0.9, y: y * 1.5 - 4, z: z * 0.9, c: C.orange });
      return cycle([cube, pyr, cube], 58.6, 0.3, { trans: 0.2, spin: 1.2 }); }, cam: cam0(32, 6) },
  // J2 five voxel people jumping hello
  { t0: 59.3, md: 0.5, arc: 2, floor: -6, make: () => { const n = BODY.length;
      return { count: 5 * n, fn(i, t, o) { const k = Math.floor(i / n), b = BODY[i % n], j = Math.max(0, Math.sin((t - 59.3) * 7 - k * 0.8)) * 1.6;
        o.x = (k - 2) * 6 + b.x * 1.5; o.y = -6 + b.y * 1.5 + j; o.z = b.z * 1.5; o.c = b.c === C.pink ? PCOL[k] : b.c; o.sx = o.sy = o.sz = 1.35; } }; },
    cam: cam0(32, 2, 0, -1) },
  // J3 the people stack into a skyscraper; camera tilts up it
  { t0: 60.5, md: 0.7, arc: 4, floor: -8, make: () => { const pts = tower();
      return { count: pts.length, fn(i, t, o) { const p = pts[i], top = (t - 60.5) * 22; o.x = p.x * 1.1; o.z = p.z * 1.1; o.y = -8 + p.y;
        o.c = p.c; o.sx = o.sy = o.sz = p.y < top ? 1.0 : 0; o.ry = 0; } }; },
    cam: (t) => { const p = ease(clamp((t - 60.6) / 2.2)); return [10, -4 + p * 30, 30 - p * 6, 0, -2 + p * 30, 0]; } },
  // K1 a giant "!"
  { t0: 63.0, md: 0.9, arc: 5, make: () => still(bitmap(["###", "###", "###", "###", "###", "###", "###", "...", "###", "###"], { "#": C.pink }, { depth: 3 }), { sc: 1.6, sway: 0.4, t0: 63 }), cam: cam0(34, 1) },
  // K2 overthinking: a tangled knot
  { t0: 65.96, md: 0.6, arc: 2, make: () => still(knot(), { spin: 1.4, t0: 65.96, s: 0.85 }), cam: cam0(36, 6) },
  // K3 the most complicated project: gyroscope machine
  { t0: 67.4, md: 0.7, arc: 1, make: gyro, cam: (t) => [Math.sin(t * 0.4) * 8, 6, 34, 0, 0, 0] },
  // K4 start simple: ONE cube
  { t0: 69.76, md: 0.8, arc: 0, make: () => ({ count: 1, fn(i, t, o) { const a = (t - 69.76) * 0.5; o.x = 0; o.y = 0; o.z = 0; o.ry = a; o.c = C.pink; o.sx = o.sy = o.sz = 7; } }),
    cam: (t) => [0, 8, 30, 0, 0, 0] },
  // K5 interactive: click at 71.75 squashes it, then a trail of cubes grows to the right
  { t0: 71.6, md: 0, make: () => ({ count: 26, fn(i, t, o) {
      const lt = t - 71.75, a = (t - 69.76) * 0.5;
      if (i === 0) { const sq = lt > 0 ? Math.exp(-lt * 5) * Math.sin(lt * 18) : 0; o.x = 0; o.y = sq * 1.5; o.z = 0; o.ry = a; o.c = lt > 0 && lt < 0.12 ? C.orange : C.pink;
        o.sx = o.sz = 7 * (1 + sq * 0.15); o.sy = 7 * (1 - sq * 0.25); return; }
      const q = clamp((t - 72.0 - i * 0.035) / 0.18), u = i * 1.25; o.x = 4 + u; o.y = Math.sin(u * 0.45) * 3 - 1; o.z = Math.cos(u * 0.3) * 2;
      o.c = grad(i / 25); o.sx = o.sy = o.sz = q * (1.4 - i * 0.02); } }),
    cam: (t) => [0 + clamp(t - 72.1) * 6, 8, 30 + clamp(t - 72.1) * 4, clamp(t - 72.1) * 10, 0, 0] },
  // L1 talk: six people in a circle
  { t0: 73.0, md: 0.8, arc: 3, floor: -6, make: circle(null), cam: (t) => [Math.sin(t * 0.2) * 4, 9, 30, 0, -2, 0] },
  // L2 share ideas: little bulbs hop person to person
  { t0: 74.98, md: 0, floor: -6, make: circle(() => { const b = ball(1, () => C.orange);
      return { count: 6 * b.length, fn(i, t, o) { const k = Math.floor(i / b.length), p = b[i % b.length], f = ((t - 74.98) * 1.6 + k / 6) % 1;
        const [x0, z0] = ring6(k), [x1, z1] = ring6(k + 2); o.x = x0 + (x1 - x0) * f + p.x * 0.6; o.z = z0 + (z1 - z0) * f + p.z * 0.6;
        o.y = 4 + Math.sin(f * Math.PI) * 4 + p.y * 0.6; o.c = C.orange; o.sx = o.sy = o.sz = 0.55 * clamp((t - 74.98) / 0.15); } }; }),
    cam: (t) => [Math.sin(t * 0.2) * 4, 9, 30, 0, -2, 0] },
  // L3 ask questions: "?" over each head
  { t0: 75.96, md: 0, floor: -6, make: circle(() => { const q = bitmap(QM, { "#": C.cream });
      return { count: 6 * q.length, fn(i, t, o) { const k = Math.floor(i / q.length), p = q[i % q.length], [x, z] = ring6(k);
        o.x = x + p.x * 0.6; o.z = z; o.y = 5.5 + p.y * 0.6 + Math.sin(t * 4 + k) * 0.4; o.c = k % 2 ? C.cream : C.orange; o.sx = o.sy = o.sz = 0.55 * clamp((t - 75.96 - k * 0.06) / 0.15); } }; }),
    cam: (t) => [Math.sin(t * 0.2) * 4, 9, 30, 0, -2, 0] },
  // L4 experiment: colour fountain
  { t0: 77.2, md: 0.6, arc: 2, floor: -6, make: () => { const R = rng(91), ps = [];
      for (let k = 0; k < 900; k++) ps.push({ a: R() * 6.283, v: 6 + R() * 6, up: 14 + R() * 8, ph: R(), c: [C.pink, C.orange, C.purple, C.cream, C.sky, C.green][k % 6] });
      return { count: ps.length, fn(i, t, o) { const p = ps[i], T = 1.6, f = ((t - 77.2) / T + p.ph) % 1, tt = f * T;
        o.x = Math.cos(p.a) * p.v * tt; o.z = Math.sin(p.a) * p.v * tt * 0.7; o.y = -6 + p.up * tt - 0.5 * 18 * tt * tt; o.ry = tt * 6; o.c = p.c; o.sx = o.sy = o.sz = 0.7; } }; },
    cam: (t) => [Math.sin(t * 0.3) * 6, 6, 34, 0, 0, 0] },
];
export { bulb, BODY, PCOL };
