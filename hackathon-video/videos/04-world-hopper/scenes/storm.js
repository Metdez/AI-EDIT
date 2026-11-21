// STORM: "crazy weather". Cloud deck, wind-driven rain, a tornado funnel of points, lightning strikes
// at fixed times with a flash that decays. Everything is closed-form in t.
import { rng, prog, lerp, eInOut } from "./util.js";

let THREE, renderer, scene, camera, U, clouds = [], bolts = [], cloudMat;
const STRIKES = [11.4, 13.9, 16.5, 34.42, 35.02, 40.3, 42.2];

function noiseTexture(seed) {
  const r = rng(seed), S = 256, cv = document.createElement("canvas"); cv.width = cv.height = S;
  const g = cv.getContext("2d");
  for (let i = 0; i < 90; i++) { // soft puffs make a cloud
    const x = S / 2 + (r() - 0.5) * S * 0.55, y = S / 2 + (r() - 0.5) * S * 0.3, rad = 25 + r() * 55;
    const gr = g.createRadialGradient(x, y, 0, x, y, rad); const a = 0.08 + r() * 0.1;
    gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, S, S);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function bolt(r, x0, y0, z0, len) { // jagged branching polyline as segment pairs
  const segs = [];
  const walk = (x, y, z, n, spread, depth) => {
    for (let i = 0; i < n; i++) {
      const nx = x + (r() - 0.5) * spread, ny = y - len / 14, nz = z + (r() - 0.5) * spread * 0.5;
      segs.push(x, y, z, nx, ny, nz);
      if (depth < 2 && r() < 0.13) walk(nx, ny, nz, 4 + Math.floor(r() * 4), spread * 1.3, depth + 1);
      x = nx; y = ny; z = nz;
    }
  };
  walk(x0, y0, z0, 14, 1.6, 0);
  return new Float32Array(segs);
}

export function init(T, R) {
  THREE = T; renderer = R;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0e17);
  scene.fog = new THREE.Fog(0x0d1320, 25, 120);
  camera = new THREE.PerspectiveCamera(55, 16 / 9, 0.1, 500);
  U = { uTime: { value: 0 }, uFlash: { value: 0 } };
  const r = rng(9);

  const ground = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.MeshStandardMaterial({ color: 0x10141c, roughness: 0.35, metalness: 0.2 }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  scene.add(new THREE.HemisphereLight(0x5a6c90, 0x0a0a10, 0.7));
  const key = new THREE.DirectionalLight(0x9fb4e0, 0.9); key.position.set(-20, 30, 10); scene.add(key);
  U.key = key;

  cloudMat = [];
  for (let i = 0; i < 3; i++) cloudMat.push(noiseTexture(100 + i));
  for (let i = 0; i < 80; i++) {
    const m = new THREE.SpriteMaterial({ map: cloudMat[i % 3], color: 0x55607a, transparent: true, opacity: 0.85, depthWrite: false, fog: true });
    const s = new THREE.Sprite(m), sc = 30 + r() * 40;
    s.scale.set(sc, sc * 0.55, 1);
    s.userData = { x: (r() - 0.5) * 160, y: 17 + r() * 8, z: -60 + r() * 90, v: 0.5 + r() * 1.2 };
    clouds.push(s); scene.add(s);
  }

  // rain
  const N = 7000, p = new Float32Array(N * 6), sd = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) { const x = (r() - 0.5) * 70, z = -40 + r() * 75, s = r(); p.set([x, 0, z, x, 1, z], i * 6); sd[i * 2] = sd[i * 2 + 1] = s; }
  const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(p, 3)); rg.setAttribute("seed", new THREE.BufferAttribute(sd, 1));
  scene.add(new THREE.LineSegments(rg, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float seed; uniform float uTime; varying float vA;
      void main(){ float h = fract(seed*9.7 - uTime*(1.3+seed*.4)); vec3 q = position; q.y = mix(22., 0., h) + position.y*1.1;
        q.x += position.y*0.45 + h*4.; vA = position.y; gl_Position = projectionMatrix*modelViewMatrix*vec4(q,1.); }`,
    fragmentShader: `uniform float uFlash; varying float vA; void main(){ gl_FragColor = vec4(vec3(.6,.7,.9)*(0.32+uFlash*0.9), .25+.5*vA); }`,
  })));

  // tornado funnel
  const TN = 9000, tp = new Float32Array(TN * 3), ts = new Float32Array(TN * 3);
  for (let i = 0; i < TN; i++) { ts[i * 3] = r(); ts[i * 3 + 1] = r() * Math.PI * 2; ts[i * 3 + 2] = r(); }
  const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(tp, 3)); tg.setAttribute("s", new THREE.BufferAttribute(ts, 3));
  scene.add(new THREE.Points(tg, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `attribute vec3 s; uniform float uTime; varying float vH;
      void main(){ float h = s.x; float rad = 0.35 + 7.5*pow(h,1.7) + s.z*0.9*h; float a = s.y + uTime*(4.2-2.4*h);
        vec3 q = vec3(cos(a)*rad + sin(h*4.+uTime*.9)*1.6*h, h*21., sin(a)*rad*0.8 - 8.);
        q.x += sin(uTime*0.4)*3.; vH = h; vec4 mv = modelViewMatrix*vec4(q,1.); gl_PointSize = (5.+8.*h)*30./-mv.z; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `uniform float uFlash; varying float vH; void main(){ vec2 c = gl_PointCoord-.5; float d = length(c); if(d>.5) discard;
        gl_FragColor = vec4(mix(vec3(.10,.11,.13), vec3(.30,.32,.38), vH) * (1.+uFlash*1.6), (1.-d*2.)*0.5); }`,
  })));

  // lightning bolts, one geometry per strike
  STRIKES.forEach((tb, i) => {
    const g = new THREE.BufferGeometry(); g.setAttribute("position", new THREE.BufferAttribute(bolt(rng(300 + i), -18 + (i % 3) * 16, 22, -20 - (i % 2) * 10, 22), 3));
    const l = new THREE.LineSegments(g, new THREE.LineBasicMaterial({ color: new THREE.Color(6.0, 5.6, 8.0), toneMapped: false, transparent: true }));
    l.userData.tb = tb; bolts.push(l); scene.add(l);
  });
}

export function render(t) {
  U.uTime.value = t;
  let flash = 0;
  bolts.forEach((b) => { const d = t - b.userData.tb; const f = d >= 0 && d < 0.5 ? Math.exp(-d * 9) * (d < 0.06 || (d > 0.1 && d < 0.16) ? 1 : 0.55) : 0;
    b.visible = f > 0.05; b.material.opacity = Math.min(1, f * 1.5); flash = Math.max(flash, f); });
  U.uFlash.value = flash;
  U.key.intensity = 0.9 + flash * 2.5;
  scene.background.setRGB(0.04 + flash * 0.08, 0.055 + flash * 0.09, 0.09 + flash * 0.12);
  clouds.forEach((s) => { const u = s.userData; s.position.set(((u.x + t * u.v + 80) % 160 + 160) % 160 - 80, u.y, u.z);
    s.material.color.setRGB(0.045 + flash * 0.28, 0.052 + flash * 0.3, 0.075 + flash * 0.4); });
  const k = eInOut(prog(t, 33.9, 35.8));
  camera.position.set(lerp(-14, -3, k), lerp(2.2, 4.5, k), lerp(34, 24, k));
  camera.lookAt(lerp(-2, 2, k), 8.5, -8);
  renderer.render(scene, camera);
}
