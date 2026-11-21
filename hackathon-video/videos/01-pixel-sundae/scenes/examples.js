// F–G: voxel Boston traffic -> storm -> solar system -> 1,000 particles -> shapes -> splash -> orb.
import { C, rng, hash, clamp, easeOut, mix, grad, still, bitmap, ball, sphere, cycle } from "./lib.js";

const SY = 60; // the solar system and what follows float high above the city

function city() {
  const R = rng(31), bld = [], cars = [], river = [];
  for (let bx = -4; bx <= 4; bx++) for (let bz = -3; bz <= 2; bz++) for (const [dx, dz] of [[-1.3, -1.3], [1.3, -1.3], [-1.3, 1.3], [1.3, 1.3]]) {
    const x = bx * 8 + dx, z = bz * 8 + dz, down = Math.exp(-((x - 6) ** 2 + (z + 6) ** 2) / 260);
    const h = 1.0 + R() * 2.5 + down * 9 * (0.6 + R() * 0.6);
    bld.push({ x, z, h, c: h > 7.5 ? 0xc9b8f0 : h > 5 ? C.purple : h > 3 ? 0x5a4f9a : 0x3b3566 });
  }
  for (let x = -40; x <= 40; x += 2) for (let k = 0; k < 3; k++) river.push({ x, z: -30 - k * 2 });
  const hz = [-20, -12, -4, 4, 12], vx = [-32, -24, -16, -8, 0, 8, 16, 24, 32];
  for (let k = 0; k < 340; k++) { const horiz = R() < 0.55, dir = R() < 0.5 ? 1 : -1;
    const lane = horiz ? hz[Math.floor(R() * hz.length)] : vx[Math.floor(R() * vx.length)];
    cars.push({ horiz, dir, lane: lane + dir * 0.75, off: R(), sp: 0.07 + R() * 0.06, c: [C.orange, C.pink, C.cream][k % 3] }); }
  const nb = bld.length, nr = river.length;
  return { count: nb + nr + cars.length, fn(i, t, o) {
    if (i < nb) { const b = bld[i]; o.x = b.x; o.z = b.z; o.y = b.h / 2; o.sx = o.sz = 2.3; o.sy = b.h; o.c = b.c; return; }
    if (i < nb + nr) { const r = river[i - nb]; o.x = r.x; o.z = r.z; o.y = 0.1; o.sx = o.sz = 1.9; o.sy = 0.3;
      o.c = Math.sin(r.x * 0.5 + t * 3 + r.z) > 0.6 ? 0x9fd3f5 : C.sky; return; }
    const c = cars[i - nb - nr], L = c.horiz ? 80 : 56, s = (((c.off + c.sp * t * c.dir) % 1) + 1) % 1, u = s * L - L / 2;
    o.x = c.horiz ? u : c.lane; o.z = c.horiz ? c.lane : u * 0.85 - 4; o.y = 0.4;
    o.sx = c.horiz ? 2.4 : 1.2; o.sz = c.horiz ? 1.2 : 2.4; o.sy = 1.0; o.c = c.c; } };
}

function storm() {
  const R = rng(41), cl = [], rain = [], bolt = [];
  for (let k = 0; k < 7; k++) { const cx = -24 + k * 8 + (R() - 0.5) * 4, cz = (R() - 0.5) * 14;
    ball(4.2, () => 0).forEach((p) => { if (R() < 0.62) cl.push({ x: cx + p.x * 1.1, y: 26 + p.y * 0.55, z: cz + p.z * 0.9, top: p.y }); }); }
  for (let k = 0; k < 520; k++) rain.push({ x: (R() - 0.5) * 64, z: (R() - 0.5) * 26, ph: R() });
  let x = 3, y = 23; while (y > 0.5) { const nx = x + (R() - 0.5) * 3.2, ny = y - 1.2 - R() * 1.2;
    for (let s = 0; s < 4; s++) bolt.push({ x: x + (nx - x) * s / 4, y: y + (ny - y) * s / 4 }); x = nx; y = ny; }
  const n1 = cl.length, n2 = n1 + rain.length;
  return { count: n2 + bolt.length, fn(i, t, o) {
    if (i < n1) { const p = cl[i]; o.x = p.x + Math.sin(t * 0.4 + p.z) * 0.6 + (t - 33.3) * 1.2; o.y = p.y; o.z = p.z; o.sx = o.sy = o.sz = 1.15;
      o.c = flash(t) ? 0xd8d2ff : p.top > 1 ? 0x8a8fae : p.top > -1 ? C.grey : 0x434862; return; }
    if (i < n2) { const r = rain[i - n1], f = (r.ph + t * 1.7) % 1; o.x = r.x - f * 3; o.z = r.z; o.y = 24 - f * 24; o.sx = o.sz = 0.16; o.sy = 1.3; o.c = C.sky; return; }
    const b = bolt[i - n2], on = flash(t); o.x = b.x; o.y = b.y; o.z = 2; o.sx = o.sy = o.sz = on ? 0.75 : 0; o.c = C.cream; } };
}
export const flash = (t) => (t > 34.26 && t < 34.42) || (t > 34.52 && t < 34.6);

function solar() {
  const sun = ball(3.6, (x, y, z) => (x * x + y * y + z * z > 9 ? C.orange : 0xffd27a)), pl = [], rings = [];
  const P = [[7, 0.9, C.cream], [10, 1.2, C.pink], [13.5, 1.4, C.sky], [17, 1.1, C.red], [21.5, 2.1, C.orange], [26, 1.7, C.purple]];
  P.forEach(([R, r, c], k) => { ball(Math.max(1.2, r * 1.4), () => c).forEach((p) => pl.push({ k, p })); });
  P.forEach(([R], k) => { const n = Math.round((2 * Math.PI * R) / 1.7); for (let j = 0; j < n; j++) rings.push({ R, a: (j / n) * 2 * Math.PI }); });
  const n1 = sun.length, n2 = n1 + pl.length;
  return { count: n2 + rings.length, fn(i, t, o) {
    const lt = t - 35.1;
    if (i < n1) { const p = sun[i], a = lt * 0.4, cs = Math.cos(a), sn = Math.sin(a); o.x = cs * p.x + sn * p.z; o.z = -sn * p.x + cs * p.z; o.y = SY + p.y; o.ry = a; o.c = p.c; return; }
    if (i < n2) { const { k, p } = pl[i - n1], [R, r] = P[k], a = k * 1.7 + lt * (3.2 / Math.sqrt(R)), s = r / Math.max(1.2, r * 1.4);
      o.x = Math.cos(a) * R + p.x * s; o.z = Math.sin(a) * R + p.z * s; o.y = SY + p.y * s; o.c = p.c; o.sx = o.sy = o.sz = 0.9 * s; return; }
    const g = rings[i - n2]; o.x = Math.cos(g.a) * g.R; o.z = Math.sin(g.a) * g.R; o.y = SY; o.sx = o.sz = 0.4; o.sy = 0.2; o.c = 0x4a4290; } };
}

function particles() { // exactly 1,000
  const R = rng(51), ps = [];
  for (let k = 0; k < 1000; k++) ps.push({ r: 3 + 20 * Math.sqrt(R()), a: R() * 6.283, w: 0.5 + R() * 1.4, h: (R() - 0.5) * 10, ph: R() * 6.283, c: [C.pink, C.orange, C.purple, C.cream, C.sky][k % 5] });
  return { count: 1000, fn(i, t, o) { const p = ps[i], lt = t - 36.4, a = p.a + lt * p.w * (8 / (p.r + 4));
    const r = p.r * (1 + 0.15 * Math.sin(lt * 2 + p.ph));
    o.x = Math.cos(a) * r; o.z = Math.sin(a) * r * 0.75; o.y = SY + p.h + 3 * Math.sin(a * 2 + lt * 1.5 + p.ph);
    o.ry = lt * 2 + p.ph; o.c = p.c; o.sx = o.sy = o.sz = 0.55; } };
}

const HEART = [".##...##.", "####.####", "#########", "#########", ".#######.", "..#####..", "...###...", "....#...."];
const STAR = [".....#.....", "....###....", "....###....", "###########", ".#########.", "..#######..", "...#####...", "..###.###..", "..##...##..", ".##.....##.", ".#.......#."];
const ROCKET = ["...#...", "..###..", "..#w#..", ".##w##.", ".#####.", ".#####.", ".#####.", ".#####.", "##.#.##", "#..#..#", "..ooo..", "..ooo..", "...o..."];

function splash() { const R = rng(61), pts = [];
  for (let k = 0; k < 640; k++) { const a = R() * 6.283, spike = Math.max(0, Math.sin(a * 7 + 1)) ** 3, r = Math.sqrt(R()) * (5 + 8 * spike);
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: (R() - 0.5) * 1.5, c: grad(((a / 6.283) + 1) % 1) }); }
  for (let k = 0; k < 14; k++) { const a = R() * 6.283, r = 14 + R() * 4; pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r, z: 0, c: [C.pink, C.orange, C.purple][k % 3] }); }
  return pts; }

const camHi = (r = 34, h = 6) => (t) => [Math.sin(t * 0.25) * 6, SY + h, r, 0, SY, 0];

export const shots = [
  { t0: 30.8, md: 0.9, arc: 6, floor: 0, make: city, cam: (t) => [-8 + (t - 30.8) * 2.5, 36, 26, (t - 30.8) * 1.5, 0, -6] },
  { t0: 33.3, md: 0.8, arc: 3, bg: (t) => (flash(t) ? 0x4b3f86 : 0x151a2c), floor: 0, make: storm, cam: (t) => [Math.sin(t * 0.3) * 3, 12, 40, 0, 17, 0] },
  { t0: 35.1, md: 0.75, arc: 6, bg: 0x0b0f1e, make: solar, cam: (t) => [Math.sin((t - 35.1) * 0.25) * 10, SY + 26, 40, 0, SY - 2, 0] },
  { t0: 36.4, md: 0.6, arc: 2, bg: 0x0b0f1e, make: particles, cam: (t) => { const a = (t - 36.4) * 0.22; return [Math.sin(a) * 36, SY + 10 - (t - 36.4) * 2, Math.cos(a) * 36, 0, SY, 0]; } },
  { t0: 39.2, md: 0.5, arc: 2, make: () => cycle([bitmap(HEART, { "#": C.pink }, { depth: 2 }), bitmap(STAR, { "#": C.orange }, { depth: 2 }),
      bitmap(ROCKET, { "#": C.cream, w: C.purple, o: C.orange }, { depth: 2 })], 39.2, 0.55, { trans: 0.25, sc: 1.35, oy: SY, spin: 0.5 }), cam: camHi(30, 0) },
  { t0: 40.88, md: 0.4, arc: 1, make: () => still(splash(), { oy: SY, sway: 0.4, t0: 40.88 }), cam: camHi(34, 0) },
  { t0: 41.84, md: 0.8, arc: 0, make: () => { const pts = sphere(600, 4.5, 71, (i, u) => mix(C.orange, C.pink, (u + 1) / 2));
      return still(pts, { spin: 2.2, oy: SY, t0: 41.84, s: 0.75 }); }, cam: (t) => [0, SY + 2, 26 - (t - 41.84) * 2.5, 0, SY, 0] },
];
