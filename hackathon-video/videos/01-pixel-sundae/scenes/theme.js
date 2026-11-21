// D–E: 2D tile -> 3D cube -> three.js triangle -> AI; tree/apple -> blueprint -> browser.
import { C, hash, clamp, ease, easeOut, mix, grad, still, text, sphere, ball, bounceY, cubeShell, orbit } from "./lib.js";

const tile = () => { const pts = []; for (let x = 0; x < 16; x++) for (let y = 0; y < 16; y++)
  pts.push({ x: x - 7.5, y: y - 7.5, z: 0, c: (x + y) % 2 ? grad(y / 15) : mix(grad(y / 15), C.navy, 0.35) }); return pts; };

// Apple: a small voxel ball with a stem
const apple = () => [...ball(1.6, (x, y) => (y > 0.9 ? C.pink : C.red)), { x: 0, y: 2, z: 0, c: C.green }];
const tree = () => {
  const pts = [];
  for (let y = 0; y < 7; y++) for (let x = 0; x < 2; x++) for (let z = 0; z < 2; z++) pts.push({ x: x - 0.5, y: y - 8, z: z - 0.5, c: 0x8a5a44 });
  sphere(420, 6, 21, (i, u) => mix(0x4fae6a, C.green, (u + 1) / 2), false).forEach((p) => pts.push({ x: Math.round(p.x), y: Math.round(p.y * 0.8) + 2, z: Math.round(p.z), c: p.c }));
  return pts;
};
const AP = { x: 3.2, y: 0.5 }; // apple hangs at the canopy edge; floor at y = -8
const appleY = (t, t0) => -8 + 0.95 + bounceY(t - t0, AP.y + 8 - 0.95, 45, 0.5);

export const shots = [
  // D1 flat 2D tile
  { t0: 16.0, md: 0.8, arc: 4, make: () => still(tile(), { sway: 0.25, t0: 16 }), cam: (t) => [0, 0, 32 - (t - 16) * 0.6, 0, 0, 0] },
  // D2/D3 extrude to a 3D cube shell with a ripple (runs through the browser frame beat)
  { t0: 18.1, md: 0.6, arc: 0, make: () => { const pts = cubeShell(10, (x, y, z) => grad((y + z * 0.3) / 12));
      return { count: pts.length, fn(i, t, o) { const p = pts[i], lt = t - 18.1, a = 0.5 + lt * 0.55;
        const r = Math.sin(lt * 5 - (p.y + 4.5) * 0.7) * 0.35 * clamp(lt - 0.6), k = 1.0 + r * 0.12;
        const x = p.x * k, z = p.z * k, y = p.y * k, cs = Math.cos(a), sn = Math.sin(a);
        o.x = cs * x + sn * z; o.z = -sn * x + cs * z; o.y = y + 1.5; o.ry = a; o.c = p.c; o.sx = o.sy = o.sz = 0.9; } }; },
    cam: (t) => [0, 10, 36 - (t - 18.1) * 0.3, 0, 1, 0] },
  // D4 Sierpinski triangle (a nod to the three.js mark)
  { t0: 21.05, md: 0.6, arc: 3, make: () => { const pts = []; for (let r = 0; r < 32; r++) for (let c = 0; c <= r; c++)
      if ((r & c) === c) pts.push({ x: (c - r / 2) * 1.0, y: (15.5 - r) * 0.87, z: 0, c: grad(r / 31) });
      return still(pts, { sc: 0.66, sway: 0.35, t0: 21.05, oy: 3 }); },
    cam: (t) => [0, 0, 30, 0, 0, 0] },
  // D5 "AI"
  { t0: 22.26, md: 0.5, arc: 2, make: () => still(text("AI", (k, q, r) => (k ? C.orange : mix(C.orange, C.pink, r / 6)), { depth: 3 }), { sc: 2.0, sway: 0.3, t0: 22.26 }),
    cam: (t) => [0, 2, 34 - (t - 22.26) * 0.8, 0, 0, 0] },
  // E1/E2 tree with apple; apple falls at 26.2 and bounces (the real world)
  { t0: 23.5, md: 0.9, arc: 4, floor: -8, make: () => { const tr = tree(), ap = apple(), n = tr.length;
      return { count: n + ap.length, fn(i, t, o) {
        if (i < n) { const p = tr[i]; o.x = p.x - 2; o.y = p.y; o.z = p.z; o.c = p.c; return; }
        const p = ap[i - n]; o.x = AP.x - 2 + p.x * 0.55 + 3; o.z = p.z * 0.55 + 6.5; o.y = (t < 26.2 ? AP.y : appleY(t, 26.2)) + p.y * 0.55;
        o.c = p.c; o.sx = o.sy = o.sz = 0.55; } }; },
    cam: (t) => [3 + Math.sin(t * 0.3) * 2, 2, 36 - (t - 23.5) * 0.7, 0, -1.5, 0] },
  // E3 blueprint: strobe ghosts of the fall (equal time steps, growing gaps) + gravity arrow
  { t0: 27.2, md: 0.6, arc: 1, floor: -8, bg: 0x1c1840, make: () => {
      const ap = apple(), G = 7, ghosts = [], arrow = [];
      for (let g = 0; g < G; g++) { const tt = g * 0.12, y = AP.y + 2 - 0.5 * 30 * tt * tt; ghosts.push(y); }
      for (let y = 0; y < 7; y++) arrow.push({ x: 0, y: 2 - y, z: 0 });
      [[-1, -5], [1, -5], [-2, -4], [2, -4], [0, -6]].forEach(([x, y]) => arrow.push({ x, y: y + 0, z: 0 }));
      const n1 = G * ap.length;
      return { count: n1 + arrow.length, fn(i, t, o) {
        if (i < n1) { const g = Math.floor(i / ap.length), p = ap[i % ap.length], vis = clamp((t - 27.3 - g * 0.09) / 0.15);
          o.x = 3 + p.x * 0.7; o.y = ghosts[g] - 1 + p.y * 0.7; o.z = p.z * 0.7;
          o.c = g === G - 1 ? C.red : mix(C.cream, C.purple, g / G); o.sx = o.sy = o.sz = 0.62 * vis; return; }
        const p = arrow[i - n1]; o.x = -3 + p.x * 0.8; o.y = p.y * 0.8 - 1; o.z = 0; o.c = C.orange; o.sx = o.sy = o.sz = 0.75; } }; },
    cam: (t) => [0, -1, 30, 0, -2, 0] },
  // E4 the same apple bouncing forever, inside a browser window
  { t0: 28.78, md: 0.6, arc: 1, floor: -6, make: () => { const ap = apple(), road = [];
      for (let x = -9; x <= 9; x++) road.push({ x, y: -6.5, z: 0, c: x % 2 ? C.purple : 0x6a5cb8 });
      return { count: ap.length + road.length, fn(i, t, o) {
        if (i < ap.length) { const p = ap[i], f = ((t - 28.78) / 0.62) % 1, y = -6 + 1.6 + 7 * 4 * f * (1 - f);
          const sq = f < 0.06 || f > 0.94 ? 0.82 : 1; o.x = Math.sin((t - 28.78) * 1.4) * 4 + p.x; o.y = y + p.y * sq; o.z = p.z; o.c = p.c; o.sx = o.sz = 0.95; o.sy = 0.95 * sq; return; }
        const p = road[i - ap.length]; o.x = p.x; o.y = p.y; o.z = p.z; o.c = p.c; o.sx = 0.95; o.sy = 0.5; o.sz = 3; } }; },
    cam: (t) => [0, 1.5, 26 + (t - 28.78) * 0.4, 0, -1, 0] },
];
