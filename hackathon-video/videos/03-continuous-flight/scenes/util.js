// Shared helpers. Everything here is a pure function of its inputs (frames render out of order).
export const rng = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, u) => a + (b - a) * u;
export const smooth = (u) => { u = clamp(u); return u * u * (3 - 2 * u); };
export const ramp = (t, t0, t1) => clamp((t - t0) / (t1 - t0));
export const sramp = (t, t0, t1) => smooth(ramp(t, t0, t1));
export const expoOut = (u) => (u >= 1 ? 1 : 1 - Math.pow(2, -10 * clamp(u)));
export const expoIn = (u) => (u <= 0 ? 0 : Math.pow(2, 10 * (clamp(u) - 1)));
export const cubicIn = (u) => clamp(u) ** 3;
// window: 0 before a, ramps up a..b, holds, ramps down c..d
export const win = (t, a, b, c, d) => sramp(t, a, b) * (1 - sramp(t, c, d));

// Non-uniform Catmull-Rom (cubic Hermite) through timed keys [[t, ...values]].
// Velocity is continuous through every key, so the camera never stops dead; zero velocity at the ends.
export function track(keys, t) {
  const n = keys.length, dim = keys[0].length - 1, out = new Array(dim);
  if (t <= keys[0][0]) return keys[0].slice(1);
  if (t >= keys[n - 1][0]) return keys[n - 1].slice(1);
  let k = 0; while (k < n - 2 && t > keys[k + 1][0]) k++;
  const k0 = keys[k], k1 = keys[k + 1], h = k1[0] - k0[0], u = (t - k0[0]) / h;
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  for (let d = 1; d <= dim; d++) {
    const m0 = k > 0 ? (k1[d] - keys[k - 1][d]) / (k1[0] - keys[k - 1][0]) : 0;
    const m1 = k + 2 < n ? (keys[k + 2][d] - k0[d]) / (keys[k + 2][0] - k0[0]) : 0;
    out[d - 1] = h00 * k0[d] + h10 * h * m0 + h01 * k1[d] + h11 * h * m1;
  }
  return out;
}

// Soft round sprite for points / glows.
export function dotTexture(THREE, size = 64, hard = 0.35) {
  const c = document.createElement("canvas"); c.width = c.height = size;
  const g = c.getContext("2d"), r = size / 2;
  const grd = g.createRadialGradient(r, r, 0, r, r, r);
  grd.addColorStop(0, "rgba(255,255,255,1)"); grd.addColorStop(hard, "rgba(255,255,255,.85)");
  grd.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = grd; g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; return tex;
}

export function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = rej; im.src = src; });
}
