// SPACE: particles, the solar system and Earth. Used 0–31.2, 35.2–43.3, 87.0–93.4.
import { rng, clamp, lerp, sramp, ramp, win, track, dotTexture, expoOut } from "./util.js";
import * as PT from "./particles.js";

let THREE, scene, cam, sun, sunGlow, planets = [], orbitLines, earth, clouds, atmo, wire, wireMat, clip, arrows, logoPlane, stars, bostonDot;
const RADII = [6, 8.5, 11.5, 14.5, 19, 24], SIZES = [0.35, 0.55, 0.6, 0.45, 1.5, 1.25];
const TEX = ["2k_mercury", "2k_venus_surface", "2k_earth_daymap", "2k_mars", "2k_jupiter", "2k_saturn"];
const ER = 0.6; // Earth radius in scene units
const V = (x, y, z) => new THREE.Vector3(x, y, z);

const planetAngle = (k, t) => (k === 2 ? earthAngle(t) : 1.3 * k + 0.7 + 0.16 * Math.pow(6 / RADII[k], 1.5) * t);
const earthAngle = (t) => 0.9 + 0.006 * t;
export const earthPos = (t) => V(RADII[2] * Math.cos(earthAngle(t)), 0, RADII[2] * Math.sin(earthAngle(t)));
let bostonLocal, spin0;
const SPIN = 0.01, TD = 31.0;
const spin = (t) => spin0 + SPIN * (t - TD);
export function bostonNormal(t) { const n = bostonLocal.clone(); n.applyAxisAngle(V(0, 1, 0), spin(t)); return n; }

export async function init(THREE_, loader) {
  THREE = THREE_;
  scene = new THREE.Scene(); scene.background = new THREE.Color("#04050b");
  cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.005, 2000);
  const load = (n) => loader.loadAsync(`assets/tex/${n}.jpg`).then((tx) => { tx.colorSpace = THREE.SRGBColorSpace; tx.anisotropy = 8; return tx; });
  const tex = Object.fromEntries(await Promise.all([...TEX, "2k_sun", "2k_earth_nightmap", "2k_earth_clouds"].map(async (n) => [n, await load(n)])));
  tex["2k_earth_clouds"].colorSpace = THREE.NoColorSpace;

  // stars
  const r = rng(21), SN = 4000, sp = new Float32Array(SN * 3), sc = new Float32Array(SN * 3);
  for (let i = 0; i < SN; i++) { const u = r() * Math.PI * 2, v = Math.acos(2 * r() - 1), k = 0.25 + Math.pow(r(), 3) * 0.9;
    sp.set([400 * Math.sin(v) * Math.cos(u), 400 * Math.cos(v), 400 * Math.sin(v) * Math.sin(u)], i * 3); sc.set([k, k, k * (0.9 + r() * 0.3)], i * 3); }
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3)); sg.setAttribute("color", new THREE.BufferAttribute(sc, 3));
  stars = new THREE.Points(sg, new THREE.PointsMaterial({ size: 2.2, sizeAttenuation: false, map: dotTexture(THREE), vertexColors: true, transparent: true, depthWrite: false }));
  scene.add(stars);

  // sun
  sun = new THREE.Mesh(new THREE.SphereGeometry(2.0, 64, 32), new THREE.MeshBasicMaterial({ map: tex["2k_sun"], color: new THREE.Color(1.9, 1.35, 0.85) }));
  sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(THREE, 128, 0.05), color: new THREE.Color(0.7, 0.36, 0.12), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  sunGlow.scale.setScalar(7); scene.add(sun, sunGlow);
  const light = new THREE.PointLight(0xfff1dd, 3.2, 0, 0); scene.add(light, new THREE.AmbientLight(0x223355, 0.12));

  // planets + orbit lines
  orbitLines = new THREE.Group();
  RADII.forEach((R, k) => {
    const pts = []; for (let j = 0; j <= 256; j++) { const a = (j / 256) * Math.PI * 2; pts.push(V(R * Math.cos(a), 0, R * Math.sin(a))); }
    orbitLines.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: new THREE.Color(0.55, 0.5, 0.95), transparent: true, opacity: 0.35, depthWrite: false })));
    if (k === 2) return;
    const m = new THREE.Mesh(new THREE.SphereGeometry(SIZES[k], 48, 24), new THREE.MeshStandardMaterial({ map: tex[TEX[k]], roughness: 1, metalness: 0 }));
    if (k === 5) { const ring = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.7, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.75, 0.65, 0.5), side: THREE.DoubleSide, transparent: true, opacity: 0.55, depthWrite: false }));
      ring.rotation.x = -Math.PI / 2 + 0.45; m.add(ring); }
    m.userData.k = k; planets.push(m); scene.add(m);
  });
  scene.add(orbitLines);

  // Earth: day map lit by the Sun, city lights on the night side, rim of atmosphere
  earth = new THREE.Mesh(new THREE.SphereGeometry(ER, 128, 64), new THREE.ShaderMaterial({
    uniforms: { day: { value: tex["2k_earth_daymap"] }, night: { value: tex["2k_earth_nightmap"] } },
    vertexShader: `varying vec3 vN; varying vec3 vW; varying vec2 vUv; void main(){ vUv = uv; vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform sampler2D day, night; varying vec3 vN; varying vec3 vW; varying vec2 vUv;
      void main(){ vec3 L = normalize(-vW); float ndl = dot(normalize(vN), L);
        vec3 col = texture2D(day, vUv).rgb * (max(ndl, 0.0) * 1.35 + 0.015);
        col += texture2D(night, vUv).rgb * smoothstep(0.08, -0.22, ndl) * 2.2;
        vec3 Vd = normalize(cameraPosition - vW); float fr = pow(1.0 - max(dot(normalize(vN), Vd), 0.0), 3.0);
        col += vec3(0.25, 0.5, 1.0) * fr * (0.05 + 0.4 * smoothstep(-0.35, 0.45, ndl));
        gl_FragColor = vec4(col, 1.0); }`,
  }));
  clouds = new THREE.Mesh(new THREE.SphereGeometry(ER * 1.012, 96, 48), new THREE.MeshStandardMaterial({ color: 0xffffff, alphaMap: tex["2k_earth_clouds"], transparent: true, depthWrite: false, roughness: 1 }));
  atmo = new THREE.Mesh(new THREE.SphereGeometry(ER * 1.08, 64, 32), new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vN; varying vec3 vW; void main(){ vN = normalize(mat3(modelMatrix) * normal); vec4 w = modelMatrix * vec4(position,1.0); vW = w.xyz; gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `varying vec3 vN; varying vec3 vW; void main(){ vec3 Vd = normalize(cameraPosition - vW); float f = pow(max(0.0, 0.62 - dot(normalize(vN), Vd)) / 0.62, 2.2);
      float lit = smoothstep(-0.4, 0.5, dot(normalize(vN), normalize(-vW))); gl_FragColor = vec4(vec3(0.3, 0.6, 1.0) * f * (0.08 + 0.45 * lit), f * 0.5); }`,
    side: THREE.BackSide, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  }));
  earth.add(clouds); scene.add(earth, atmo);

  // Boston on the globe, and an Earth spin chosen so Boston faces the dive direction, just past dusk
  const lat = THREE.MathUtils.degToRad(42.36), lon = -71.06, phi = ((lon + 180) / 360) * Math.PI * 2, th = Math.PI / 2 - lat;
  bostonLocal = V(-Math.cos(phi) * Math.sin(th), Math.cos(th), Math.sin(phi) * Math.sin(th));
  const E = earthPos(TD), s = E.clone().normalize(), tau = V(-s.z, 0, s.x), h = tau.clone().add(s.clone().multiplyScalar(0.3)).normalize();
  spin0 = Math.atan2(bostonLocal.z, bostonLocal.x) - Math.atan2(h.z, h.x);
  bostonDot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTexture(THREE, 64, 0.2), color: new THREE.Color(3, 1.6, 0.8), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  bostonDot.scale.setScalar(0.035); bostonDot.position.copy(bostonLocal).multiplyScalar(ER * 1.005); earth.add(bostonDot);

  // "how it works": a lat/long wire shell revealed by a sweeping clip plane, plus velocity and gravity arrows
  const wp = [];
  for (let m = 0; m < 16; m++) { const a = (m / 16) * Math.PI * 2; for (let j = 0; j < 48; j++) { const b0 = (j / 48) * Math.PI, b1 = ((j + 1) / 48) * Math.PI;
    wp.push(V(Math.sin(b0) * Math.cos(a), Math.cos(b0), Math.sin(b0) * Math.sin(a)), V(Math.sin(b1) * Math.cos(a), Math.cos(b1), Math.sin(b1) * Math.sin(a))); } }
  for (let p = 1; p < 9; p++) { const b = (p / 9) * Math.PI; for (let j = 0; j < 64; j++) { const a0 = (j / 64) * Math.PI * 2, a1 = ((j + 1) / 64) * Math.PI * 2;
    wp.push(V(Math.sin(b) * Math.cos(a0), Math.cos(b), Math.sin(b) * Math.sin(a0)), V(Math.sin(b) * Math.cos(a1), Math.cos(b), Math.sin(b) * Math.sin(a1))); } }
  clip = new THREE.Plane(V(-1, 0, 0), 0);
  wireMat = new THREE.LineBasicMaterial({ color: new THREE.Color(1.1, 0.95, 2.0), transparent: true, opacity: 0, depthWrite: false, clippingPlanes: [clip], blending: THREE.AdditiveBlending });
  wire = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(wp), wireMat); wire.scale.setScalar(ER * 1.04); earth.add(wire);
  const arrow = (color) => { const g = new THREE.Group(), m = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0 });
    const shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 8), m); shaft.position.y = 0.5;
    const head = new THREE.Mesh(new THREE.ConeGeometry(0.045, 0.12, 12), m); head.position.y = 1.0; g.add(shaft, head); g.userData.m = m; return g; };
  arrows = [arrow(new THREE.Color(2.2, 1.4, 0.5)), arrow(new THREE.Color(2.2, 0.9, 1.0))]; scene.add(...arrows);

  // shared particles + the crisp Sundai logo they build (child of the particle object)
  const pts = await PT.init(THREE);
  const logoTex = await loader.loadAsync("assets/sundai-logo.png"); logoTex.colorSpace = THREE.SRGBColorSpace; logoTex.anisotropy = 8;
  logoPlane = new THREE.Mesh(new THREE.PlaneGeometry(18, (18 * 230) / 782), new THREE.MeshBasicMaterial({ map: logoTex, transparent: true, opacity: 0, depthWrite: false }));
  pts.add(logoPlane);
  return { scene, cam };
}

// camera keys [t, x, y, z] (world) for the particle chapters
const CAM_A = [[0, 0, 0.6, 35], [5, 0, 0.2, 30.5], [7.2, 0, 0, 25], [9.6, 0, 0, 23.5], [11, 2.5, 3, 26], [12.6, -3, 1.5, 24.5], [15.2, 0, -2.5, 28.5],
  [16.8, 0, 0, 27], [18.3, 0, 0, 25.5], [20.1, 1.2, 0.6, 24], [21.6, -1, 0, 23], [22.8, 0, 3, 28], [24.2, 0, 15, 31], [25.2, 3, 11, 24]];
const CAM_D = [[35.3, 3, 9, 28], [36.4, 0, 19, 36], [37.6, 0, 7, 25], [39.2, 4, 3, 21], [41.0, 0, 15, 22], [42.3, 0, 8, 15], [42.9, 0, 3.5, 7.5], [43.3, 0, 1.0, 3.2]];

function earthFrame(t) { // basis around Earth: s = away from Sun, tau = along orbit
  const E = earthPos(t), s = E.clone().normalize(), tau = V(-s.z, 0, s.x); return { E, s, tau };
}

export function render(t, ctx) {
  const { E, s, tau } = earthFrame(t);
  const nB = bostonNormal(t);
  earth.position.copy(E); atmo.position.copy(E); earth.rotation.y = spin(t); clouds.rotation.y = t * 0.004;
  planets.forEach((m) => { const k = m.userData.k, a = planetAngle(k, t); m.position.set(RADII[k] * Math.cos(a), 0, RADII[k] * Math.sin(a)); m.rotation.y = t * 0.2; });

  // what is visible when (birth 23.2–24.6, dissolve 36.8–37.4, back for the ending)
  const born = sramp(t, 23.4, 24.6), gone = 1 - sramp(t, 36.8, 37.3), endBack = sramp(t, 86.95, 87.0);
  const bodies = t < 43.3 ? born * (t < 35.2 ? 1 : gone) : endBack;
  const sunS = t < 43.3 ? sramp(t, 23.2, 24.2) * (t < 35.2 ? 1 : 1 - sramp(t, 37.0, 37.6)) : 0;
  sun.scale.setScalar(Math.max(sunS, 1e-3)); sunGlow.scale.setScalar(7 * sunS + 1e-3); sun.rotation.y = t * 0.05;
  planets.forEach((m) => m.scale.setScalar(Math.max(bodies * (1 - 0.0 * m.userData.k), 1e-3)));
  const earthS = t < 43.3 ? born * (t < 35.2 ? 1 : gone) : endBack; earth.scale.setScalar(Math.max(earthS, 1e-3)); atmo.scale.copy(earth.scale);
  orbitLines.children.forEach((l) => (l.material.opacity = 0.35 * (t < 30 ? win(t, 23.6, 24.6, 25.6, 26.6) : win(t, 35.3, 35.8, 36.9, 37.3))));
  bostonDot.visible = (t > 25 && t < 30.5) || t > 88;

  // how it works: wire shell sweeps across Earth 27.18–28.1, arrows grow 27.5–28.2
  const right = V(); cam.getWorldDirection(right); right.cross(cam.up).normalize();
  const sweep = lerp(-ER * 1.2, ER * 1.2, sramp(t, 27.15, 28.05)); clip.normal.copy(right).negate(); clip.constant = right.dot(E) + sweep;
  wireMat.opacity = 0.9 * win(t, 27.1, 27.25, 30.2, 30.6);
  const ag = sramp(t, 27.5, 28.2) * (1 - sramp(t, 30.2, 30.5));
  arrows.forEach((a, i) => { const dir = i === 0 ? tau.clone() : s.clone().negate(); const base = E.clone().add(dir.clone().multiplyScalar(ER * 1.02));
    a.position.copy(base); a.quaternion.setFromUnitVectors(V(0, 1, 0), dir); a.scale.set(1, Math.max(ag * (i === 0 ? 0.62 : 0.5), 1e-3), 1); a.userData.m.opacity = ag; });

  // ---- camera ----
  let pos, look, focus = 26;
  if (t < 24.2) {
    const lift = 1.7 * (1 - sramp(t, 22.4, 23.6)); // frame the particle shapes above the caption band
    pos = V(...track(CAM_A, t)); pos.y -= lift; look = V(0, -lift, 0); focus = pos.length();
  } else if (t < 35.2) {
    const pA = V(...track(CAM_A, t)), pE = earthApproach(t, E, s, tau, nB);
    const w = sramp(t, 24.2, 26.2); pos = pA.lerp(pE, w); look = V(0, 0, 0).lerp(E, sramp(t, 24.2, 25.6)); focus = pos.distanceTo(look);
  } else if (t >= 35.2 && t < 43.3) {
    const d = track([[35.2, ER * 1.07], [35.32, ER * 1.6], [35.6, 6], [35.9, 14]], t);
    const pE = E.clone().add(nB.clone().multiplyScalar(d[0]));
    const pW = V(...track(CAM_D, t)); const w = sramp(t, 35.32, 35.95);
    pos = pE.lerp(pW, w); look = E.clone().lerp(V(0, 0, 0), sramp(t, 35.3, 35.9)); focus = pos.distanceTo(V(0, 0, 0));
  } else if (t >= 43.3) { // the ending: burst out above Boston and pull back; the logo forms between us and Earth
    const d = track([[87.0, ER * 1.07], [87.3, ER * 2.2], [87.9, 7], [88.7, 18], [93.4, 24.5]], t)[0];
    const up = V(0, 1, 0).sub(nB.clone().multiplyScalar(nB.y)).normalize(), side = nB.clone().cross(up).normalize();
    pos = E.clone().add(nB.clone().multiplyScalar(d)).add(up.clone().multiplyScalar(d * 0.06)).add(side.clone().multiplyScalar(Math.sin(t * 0.3) * d * 0.02));
    const L = E.clone().add(nB.clone().multiplyScalar(4.0)).add(up.clone().multiplyScalar(0.9));
    look = E.clone().lerp(L, sramp(t, 87.4, 88.4)); focus = pos.distanceTo(L);
    const p = PT.object(); p.position.copy(L); p.up.copy(up); p.lookAt(pos.clone().add(up.clone().multiplyScalar(-d * 0.06)));
    p.updateMatrixWorld(); const b = p.worldToLocal(E.clone().add(nB.clone().multiplyScalar(ER * 1.01))); PT.extra.boston = [b.x, b.y, b.z];
  }
  // tiny drift so the camera is never locked off
  pos.add(V(Math.sin(t * 0.37) * 0.04, Math.sin(t * 0.29 + 1) * 0.03, 0).multiplyScalar(Math.min(1, pos.distanceTo(look) * 0.05)));
  cam.position.copy(pos); cam.up.set(0, 1, 0); cam.lookAt(look); cam.updateMatrixWorld();

  // particles
  const p = PT.object(); if (t < 43.3) { p.position.set(0, 0, 0); p.rotation.set(0, 0, 0); p.up.set(0, 1, 0); }
  scene.add(p); PT.update(t);
  const m = PT.material();
  m.uniforms.uFocus.value = focus; m.uniforms.uDof.value = t > 24 && t < 35 ? 0.0 : 0.05;
  const logoOn = t < 43.3 ? win(t, 6.95, 7.3, 9.45, 9.75) : sramp(t, 88.35, 88.75);
  m.uniforms.uOpacity.value = (t < 35.2 ? 1 - sramp(t, 25.0, 26.0) : t < 43.3 ? sramp(t, 35.4, 35.9) : sramp(t, 87.55, 87.9)) * (1 - 0.72 * logoOn);
  m.uniforms.uBright.value = 1 + 1.4 * win(t, 22.2, 22.35, 22.45, 22.9) + 0.15 * sramp(t, 42.9, 43.3) + 0.4 * sramp(t, 36.8, 37.2) * (1 - sramp(t, 39, 39.5));
  logoPlane.material.opacity = logoOn;
  ctx.bloom.strength = t > 42.6 && t < 43.3 ? 0.85 : 0.85 - 0.5 * logoOn;
  return { scene, cam };
}

function earthApproach(t, E, s, tau, nB) {
  // from far to an orbit 2.1 R-units out, sliding toward Boston, then the dive along Boston's normal
  const ang = track([[24.2, 1.1], [26.4, 0.55], [28.6, 0.32], [30.3, 0.08], [31.2, 0.0]], t)[0];
  const dist = track([[24.2, 12], [25.4, 4.2], [26.4, 2.25], [28.6, 2.0], [30.3, 1.9], [30.75, 1.45], [31.05, 0.78], [31.2, ER * 1.04]], t)[0];
  const dir = nB.clone().applyAxisAngle(V(0, 1, 0), -ang).normalize();
  return E.clone().add(dir.multiplyScalar(dist));
}

export const camera = () => cam;
