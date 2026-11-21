// A–C: boot floor, HACKATHON, sundae, icon burst, people huddle, build / experiment / fun.
import { C, rng, hash, clamp, easeOut, mix, grad, still, text, sundae, iconTile, person, sphere, cycle, orbit } from "./lib.js";

const floorFn = () => {
  const cells = []; for (let gx = -20; gx <= 20; gx++) for (let gz = -18; gz <= 4; gz++) cells.push([gx * 1.5, gz * 1.5]);
  return { count: cells.length, fn(i, t, o) {
    const [x, z] = cells[i];
    const h = Math.max(0.3, 1.6 + 1.4 * Math.sin(x * 0.22 + t * 2.2) + 1.1 * Math.cos(z * 0.3 - t * 1.6));
    o.x = x; o.z = z; o.y = -6 + h / 2; o.sx = o.sz = 1.3; o.sy = h;
    o.c = h > 3.2 ? C.orange : h > 2 ? C.pink : h > 1 ? C.purple : 0x3a3570;
  } };
};

const icons = () => {
  const pts = []; for (let k = 0; k < 12; k++) iconTile(k).forEach((p) => pts.push({ ...p, k }));
  return pts;
};

export const shots = [
  { t0: 0, md: 0, floor: undefined, make: floorFn, cam: (t) => [Math.sin(t * 0.12) * 4 + 6, 3.5, 30 - t * 0.8, 6, -2, -8] },
  { t0: 3.3, md: 0.9, arc: 4, make: () => still(text("HACKATHON", (k) => grad(k / 8)), { sc: 0.62, ox: 9.5, oy: 0.5, sway: 0.12, t0: 3.3 }),
    cam: (t) => [Math.sin(t * 0.2) * 2, 2, 34, 0, 0.5, 0] },
  // B1 sundae, turntable
  { t0: 5.1, md: 0.9, arc: 3, make: () => still(sundae(), { spin: 0.6, oy: -3, sc: 1.05, t0: 5.1 }),
    cam: orbit({ r: 36, h: 7, yaw: 0.2, speed: -0.05, t0: 5.1, ty: 0.5 }) },
  // B2 icon tiles burst out of the sundae into a ring around the logo
  { t0: 7.2, md: 0.55, arc: 0, make: () => { const pts = icons();
      return { count: pts.length, fn(i, t, o) { const p = pts[i], a = (p.k / 12) * Math.PI * 2 + (t - 7.2) * 0.35;
        const sc = 0.95; o.x = Math.cos(a) * 21 + p.x * sc; o.y = Math.sin(a) * 12 + p.y * sc + 1; o.z = p.z; o.c = p.c; o.sx = o.sy = o.sz = 0.88 * sc; } }; },
    cam: (t) => [0, 1, 36 + (t - 7.2) * 0.8, 0, 1, 0] },
  // B3 icons become voxel people walking into one huddle
  { t0: 8.4, md: 0.6, arc: 2, floor: -5, make: () => {
      const P = 40, body = person(C.pink), cols = [C.pink, C.orange, C.purple, C.sky, C.cream], R = rng(11), slots = [];
      for (let k = 0; k < P; k++) { const a = (k / P) * Math.PI * 2, ring = 2 + Math.floor(k / 9) * 0; void ring;
        const rr = 2.2 * Math.sqrt(k + 0.5), aa = k * 2.39996; slots.push({ a, sx: Math.cos(a) * 24, sz: Math.sin(a) * 15, ex: Math.cos(aa) * rr, ez: Math.sin(aa) * rr * 0.8, c: cols[k % 5], d: R() * 0.4 }); }
      return { count: P * body.length, fn(i, t, o) {
        const s = slots[Math.floor(i / body.length)], b = body[i % body.length];
        const p = easeOut(clamp((t - 8.6 - s.d) / 1.6)), x = s.sx + (s.ex - s.sx) * p, z = s.sz + (s.ez - s.sz) * p;
        const walk = p < 1 ? Math.abs(Math.sin(t * 11 + s.d * 9)) * 0.5 : 0;
        const face = Math.atan2(-(s.ex - s.sx), -(s.ez - s.sz)) * 0; // keep fronts to camera
        o.x = x + b.x * 0.8; o.y = -5 + b.y * 0.8 + walk; o.z = z + b.z * 0.8; o.ry = face;
        o.c = b.c === C.pink ? s.c : b.c; o.sx = o.sy = o.sz = 0.75; } }; },
    cam: (t) => [Math.sin(t * 0.15) * 4, 16, 34, 0, -3, 0] },
  // C1 tower built block by block
  { t0: 10.8, md: 0.7, arc: 3, floor: -6, make: () => {
      const pts = []; for (let y = 0; y < 16; y++) for (let x = 0; x < 6; x++) for (let z = 0; z < 6; z++)
        if (x === 0 || z === 0 || x === 5 || z === 5) pts.push({ x: x - 2.5, y, z: z - 2.5, c: grad(y / 15) });
      return { count: pts.length, fn(i, t, o) { const p = pts[i], at = 10.95 + p.y * 0.075 + hash(i) * 0.05, q = clamp((t - at) / 0.22);
        o.x = p.x * 1.1; o.z = p.z * 1.1; o.y = -6 + p.y * 1.0 + (1 - easeOut(q)) * 5; o.ry = (t - 10.8) * 0.5;
        const cs = Math.cos(o.ry), sn = Math.sin(o.ry), x = o.x; o.x = cs * x + sn * o.z; o.z = -sn * x + cs * o.z;
        o.c = p.c; o.sx = o.sy = o.sz = q > 0 ? 1.0 : 0; } }; },
    cam: (t) => [Math.sin(t * 0.2) * 3, 4, 34, 0, 1.5, 0] },
  // C2 experiment: sphere -> pyramid -> ring -> cube
  { t0: 12.2, md: 0.5, arc: 2, make: () => {
      const n = 520, sph = sphere(n, 7, 3, (i, u) => grad((u + 1) / 2));
      const pyr = []; for (let y = 0; y < 9; y++) { const w = 8 - y; for (let x = -w; x <= w; x += 1) for (let z = -w; z <= w; z += 1)
        if (Math.abs(x) === w || Math.abs(z) === w) pyr.push({ x: x * 0.85, y: y * 1.5 - 6, z: z * 0.85, c: mix(C.orange, C.pink, y / 8) }); }
      const ring = []; for (let k = 0; k < n; k++) { const a = (k / n) * Math.PI * 2 * 1, tube = (k % 8) / 8 * Math.PI * 2;
        const R = 7 + 1.4 * Math.cos(tube); ring.push({ x: R * Math.cos(a), y: 1.4 * Math.sin(tube), z: R * Math.sin(a), c: (k % 2) ? C.purple : C.sky }); }
      return cycle([sph, pyr, ring], 12.2, 0.6, { trans: 0.3, spin: 0.9 }); },
    cam: (t) => [0, 7, 30, 0, 0, 0] },
  // C3 have fun: bouncing confetti
  { t0: 13.9, md: 0.6, arc: 5, floor: -6, make: () => { const R = rng(5), cols = [C.pink, C.orange, C.purple, C.cream, C.sky], ps = [];
      for (let k = 0; k < 700; k++) { const a = R() * 6.283, r = 3 + 17 * Math.sqrt(R()); ps.push({ x: Math.cos(a) * r, z: Math.sin(a) * r * 0.7, h: 2 + R() * 7, w: 4 + R() * 5, ph: R() * 6, c: cols[k % 5], sp: (R() - 0.5) * 8 }); }
      return { count: ps.length, fn(i, t, o) { const p = ps[i]; o.x = p.x; o.z = p.z; o.y = -5.5 + Math.abs(Math.sin(t * p.w * 0.5 + p.ph)) * p.h;
        o.ry = t * p.sp; o.c = p.c; o.sx = o.sy = o.sz = 0.8; } }; },
    cam: orbit({ r: 34, h: 8, yaw: 0, speed: 0.12, t0: 13.9, ty: -1 }) },
];
