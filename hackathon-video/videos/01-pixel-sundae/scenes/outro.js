// M–N: walk, trophy, bulb, friends; the sundae returns with its icons orbiting.
import { C, clamp, mix, still, bitmap, sundae, iconTile } from "./lib.js";
import { bulb, BODY, PCOL } from "./middle.js";

const X = 7; // subjects sit right of the inventory panel
const TROPHY = ["#########", "#.#####.#", "#.#####.#", ".#######.", "..#####..", "...###...", "....#....", "....#....", "..#####..", "..#####.."];
const camR = (r = 32) => (t) => [Math.sin(t * 0.25) * 3, 3, r, 0, 0, 0];

function walker() { const n = BODY.length, road = [];
  for (let k = 0; k < 24; k++) road.push(k);
  return { count: n + road.length, fn(i, t, o) {
    if (i < n) { const b = BODY[i], ph = Math.sin(t * 9), leg = b.y < 2 ? (b.x < 0 ? ph : -ph) * 0.6 : 0, bob = Math.abs(Math.cos(t * 9)) * 0.35;
      o.x = X + b.x * 1.6 + leg; o.y = -5 + b.y * 1.6 + bob; o.z = b.z * 1.6; o.c = b.c === C.pink ? C.orange : b.c; o.sx = o.sy = o.sz = 1.45; return; }
    const k = i - n, u = ((k * 2.5 - (t - 79) * 9) % 60 + 60) % 60 - 30; o.x = X + u; o.y = -6; o.z = 0; o.c = k % 2 ? C.cream : C.purple; o.sx = 1.6; o.sy = 0.4; o.sz = 1.2; } };
}

function friends() { const n = BODY.length;
  return { count: 3 * n, fn(i, t, o) { const k = Math.floor(i / n), b = BODY[i % n], j = Math.max(0, Math.sin((t - 84.2) * 6 - k)) * 1.2;
    o.x = X + (k - 1) * 6 + b.x * 1.4; o.y = -5 + b.y * 1.4 + j; o.z = b.z * 1.4; o.c = b.c === C.pink ? PCOL[k] : b.c; o.sx = o.sy = o.sz = 1.25; } };
}

const SX = 10.5, SYY = 2.2, K = 0.8;
function sundaeOrbit() { const s = sundae(), ic = []; for (let k = 0; k < 12; k++) iconTile(k).forEach((p) => ic.push({ ...p, k }));
  return { count: s.length + ic.length, fn(i, t, o) {
    if (i < s.length) { const p = s[i], a = (t - 85.6) * 0.5, cs = Math.cos(a), sn = Math.sin(a);
      o.x = SX + (cs * p.x + sn * p.z) * K; o.z = (-sn * p.x + cs * p.z) * K; o.y = SYY + p.y * K; o.ry = a; o.c = p.c; o.sx = o.sy = o.sz = 0.9 * K; return; }
    const p = ic[i - s.length], a = (p.k / 12) * 6.283 + (t - 88.5) * 0.6, q = clamp((t - 88.55 - p.k * 0.03) / 0.3);
    o.x = SX + Math.cos(a) * 10 + p.x * 0.5; o.z = Math.sin(a) * 10; o.y = SYY + 2.5 + p.y * 0.5 + Math.sin(a * 2) * 1.5; o.c = p.c; o.sx = o.sy = o.sz = 0.45 * q; } };
}

export const shots = [
  { t0: 79.0, md: 0.9, arc: 4, make: walker, cam: camR(32) },
  { t0: 81.58, md: 0.6, arc: 3, make: () => still(bitmap(TROPHY, { "#": C.orange }, { depth: 3 }), { ox: X, sc: 1.1, spin: 0.9, t0: 81.58 }), cam: camR(30) },
  { t0: 82.92, md: 0.6, arc: 3, make: () => { const pts = bulb().filter((p) => p.kind !== 4);
      return still(pts.map((p) => ({ x: p.x, y: p.y, z: p.z, c: p.kind === 0 ? 0xffd27a : p.kind === 3 ? C.cream : p.kind === 1 ? 0x9aa0b8 : 0x6c728c })), { ox: X, sc: 0.75, spin: 0.9, t0: 82.92 }); }, cam: camR(30) },
  { t0: 84.22, md: 0.6, arc: 3, floor: -5, make: friends, cam: camR(32) },
  { t0: 85.6, md: 1.0, arc: 5, make: sundaeOrbit, cam: (t) => [Math.sin(t * 0.2) * 2, 5, 38 - (t - 85.6) * 0.7, 0, 1, 0] },
];
