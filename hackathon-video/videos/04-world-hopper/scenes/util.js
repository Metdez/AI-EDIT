// Shared pure helpers. Every scene's render(t) must be a pure function of t.
export const rng = (a) => () => {
  a |= 0; a = (a + 0x6d2b79f5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const prog = (t, a, b) => clamp((t - a) / (b - a));
export const sstep = (t, a, b) => { const x = prog(t, a, b); return x * x * (3 - 2 * x); };
export const eOut3 = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const eIn3 = (x) => Math.pow(clamp(x), 3);
export const eInOut = (x) => { x = clamp(x); return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
export const BRAND = { pink: 0xec8796, orange: 0xf6b04a, purple: 0x8f7fd6, navy: 0x111827 };

// Starfield on a big sphere (shared look across worlds).
export function stars(THREE, n, radius, seed, size = 1.6) {
  const r = rng(seed), p = new Float32Array(n * 3), c = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const u = r() * 2 - 1, th = r() * Math.PI * 2, s = Math.sqrt(1 - u * u), rr = radius * (0.8 + 0.2 * r());
    p[i * 3] = s * Math.cos(th) * rr; p[i * 3 + 1] = u * rr; p[i * 3 + 2] = s * Math.sin(th) * rr;
    const b = 0.35 + 0.65 * r() * r(); c[i * 3] = b; c[i * 3 + 1] = b; c[i * 3 + 2] = b * (0.9 + 0.2 * r());
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("color", new THREE.BufferAttribute(c, 3));
  return new THREE.Points(g, new THREE.PointsMaterial({ size, sizeAttenuation: false, vertexColors: true, depthWrite: false }));
}

// Soft round sprite texture (no external files).
export function glowTexture(THREE, inner = "rgba(255,255,255,1)", outer = "rgba(255,255,255,0)") {
  const cv = document.createElement("canvas"); cv.width = cv.height = 128;
  const g = cv.getContext("2d"), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, inner); gr.addColorStop(0.25, inner.replace(/[\d.]+\)$/, "0.55)")); gr.addColorStop(1, outer);
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const tx = new THREE.CanvasTexture(cv); tx.colorSpace = THREE.SRGBColorSpace; return tx;
}

export function cam(THREE, fov = 50) { return new THREE.PerspectiveCamera(fov, 16 / 9, 0.05, 2000); }
