// CITY: Boston at night with traffic light-trails, then a storm. Used 31.2–35.2 and 78.6–87.0.
import { rng, clamp, sramp, win, track, dotTexture } from "./util.js";

let THREE, scene, cam, bMat, bMesh, cars, carData = [], rain, rainSeeds, bolt, boltMat, cloudSprites = [], cloudMat, fog, rise = [];
const STREET = 10, HALF = 110, dummy = { m: null };

export async function init(THREE_) {
  THREE = THREE_;
  scene = new THREE.Scene(); scene.background = new THREE.Color("#070a14");
  cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.1, 1500);
  const r = rng(31), M = new THREE.Matrix4(), Q = new THREE.Quaternion(), S = new THREE.Vector3(), P = new THREE.Vector3();
  const riverZ = (x) => -78 + 7 * Math.sin(x / 33);
  const onDiag = (x, z) => Math.abs((z - 0.62 * x - 6) / Math.hypot(1, 0.62)) < 2.4;

  // ground with glowing street lines (seen from above it reads as a city-lights map)
  const gc = document.createElement("canvas"); gc.width = gc.height = 2048; const g = gc.getContext("2d");
  g.fillStyle = "#06080f"; g.fillRect(0, 0, 2048, 2048);
  const toPx = (v) => ((v + HALF) / (2 * HALF)) * 2048;
  g.strokeStyle = "rgba(255,170,90,0.55)"; g.lineWidth = 7;
  for (let k = -HALF; k <= HALF; k += STREET) { g.beginPath(); g.moveTo(toPx(k), 0); g.lineTo(toPx(k), 2048); g.stroke(); g.beginPath(); g.moveTo(0, toPx(k)); g.lineTo(2048, toPx(k)); g.stroke(); }
  g.lineWidth = 12; g.beginPath(); g.moveTo(toPx(-HALF), toPx(0.62 * -HALF + 6)); g.lineTo(toPx(HALF), toPx(0.62 * HALF + 6)); g.stroke();
  g.fillStyle = "#0a1428"; g.beginPath(); g.moveTo(0, 0); for (let x = -HALF; x <= HALF; x += 2) g.lineTo(toPx(x), toPx(riverZ(x))); g.lineTo(2048, 0); g.fill();
  const gtex = new THREE.CanvasTexture(gc); gtex.colorSpace = THREE.SRGBColorSpace; gtex.anisotropy = 8;
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(2 * HALF, 2 * HALF), new THREE.MeshBasicMaterial({ map: gtex, color: new THREE.Color(0.9, 0.9, 0.9) }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  const far = new THREE.Mesh(new THREE.PlaneGeometry(1400, 1400), new THREE.MeshBasicMaterial({ color: "#05070d" })); far.rotation.x = -Math.PI / 2; far.position.y = -0.05; scene.add(far);

  // river reflections: vertical streaks of light on the water
  { const n = 500, p = new Float32Array(n * 3), c = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const x = (r() * 2 - 1) * HALF; p.set([x, 0.05, riverZ(x) - 1 - r() * 12], i * 3); const w = r() < 0.6; c.set(w ? [1.2, 0.75, 0.35] : [0.6, 0.7, 1.2], i * 3); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.BufferAttribute(p, 3)); geo.setAttribute("color", new THREE.BufferAttribute(c, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.9, map: dotTexture(THREE), vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); }

  // buildings: brownstones everywhere, glass towers downtown
  const lots = [];
  for (let bx = -HALF; bx < HALF; bx += STREET) for (let bz = -HALF; bz < HALF; bz += STREET) {
    for (let ix = 0; ix < 2; ix++) for (let iz = 0; iz < 2; iz++) {
      const cx = bx + 2.9 + ix * 4.2, cz = bz + 2.9 + iz * 4.2;
      if (cz < riverZ(cx) + 3 || onDiag(cx, cz) || r() < 0.08) continue;
      const dd = Math.hypot(cx - 15, cz + 25), down = Math.exp(-(dd * dd) / 900);
      const tower = r() < down * 0.85;
      const h = tower ? 14 + r() * 32 * (0.5 + down) : 2.2 + r() * 4.5;
      const w = tower ? 3.2 + r() * 0.6 : 3.3 + r() * 0.5;
      lots.push({ cx, cz, h, w, tower, d: Math.hypot(cx, cz) });
    }
  }
  // the lightning target: the tallest tower
  const tallest = lots.reduce((a, b) => (b.h > a.h ? b : a));
  bMesh = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0), null, lots.length);
  bMat = new THREE.ShaderMaterial({
    uniforms: { uFlash: { value: 0 }, uFogC: { value: new THREE.Color("#070a14") }, uFogD: { value: 0.009 } },
    vertexShader: `varying vec3 vW; varying vec3 vN; varying vec3 vC; varying float vId;
      void main(){ vec4 w = modelMatrix * instanceMatrix * vec4(position,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix * instanceMatrix) * normal);
        vC = instanceColor; vId = float(gl_InstanceID); gl_Position = projectionMatrix * viewMatrix * w; }`,
    fragmentShader: `uniform float uFlash, uFogD; uniform vec3 uFogC; varying vec3 vW; varying vec3 vN; varying vec3 vC; varying float vId;
      float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,37.719))) * 43758.5453); }
      void main(){ vec3 n = normalize(vN); float moon = max(dot(n, normalize(vec3(-0.5,0.7,0.4))), 0.0);
        vec3 col = vC * (0.06 + 0.16 * moon) + vec3(0.55,0.65,1.0) * uFlash * (0.15 + 0.35 * max(n.y, 0.0));
        if (n.y < 0.5) { float tower = step(1.5, vC.b / max(vC.r, 0.01));
          float u = abs(n.x) > 0.5 ? vW.z : vW.x; float fy = floor(vW.y / 0.75), fx = floor(u / 0.62);
          vec2 f = vec2(fract(u / 0.62), fract(vW.y / 0.75)); float pane = step(0.18, f.x) * step(f.x, 0.82) * step(0.28, f.y) * step(f.y, 0.8);
          float lit = step(mix(0.62, 0.55, tower), h(vec3(fx, fy, vId))); vec3 wc = mix(vec3(1.0,0.62,0.28), vec3(0.5,0.62,0.9), tower);
          col += wc * pane * lit * (0.3 + 0.4 * h(vec3(fy, fx, vId + 3.0))) * step(0.4, vW.y); }
        float d = length(cameraPosition - vW); float fg = 1.0 - exp(-uFogD * uFogD * d * d);
        gl_FragColor = vec4(mix(col, uFogC, fg), 1.0); }`,
  });
  bMesh.material = bMat;
  const brick = ["#6b3a2a", "#7a4a35", "#5a3326", "#82553f", "#4f3a33"].map((h) => new THREE.Color(h)), glass = ["#2b3d5c", "#33476b", "#263650"].map((h) => new THREE.Color(h));
  lots.forEach((l, i) => { M.compose(P.set(l.cx, 0, l.cz), Q.identity(), S.set(l.w, l.h, l.w)); bMesh.setMatrixAt(i, M);
    bMesh.setColorAt(i, l.tower ? glass[i % 3] : brick[i % 5]); l.i = i; });
  // a handful of new towers that rise for "something you've built" (78–86)
  lots.filter((l) => !l.tower && l.d > 18 && l.d < 55).slice(0, 26).forEach((l, k) => { l.riseH = 10 + ((k * 7) % 11) * 1.6; l.riseT = 81.5 + k * 0.035; rise.push(l); });
  scene.add(bMesh); dummy.M = M; dummy.Q = Q; dummy.S = S; dummy.P = P; dummy.lots = lots;

  // traffic: each car is a light trail (long exposure); white heading one way, red the other
  const lanes = [];
  for (let k = -HALF + STREET; k < HALF; k += STREET) { lanes.push({ ax: "x", c: k, dir: 1 }, { ax: "x", c: k, dir: -1 }, { ax: "z", c: k, dir: 1 }, { ax: "z", c: k, dir: -1 }); }
  lanes.push({ ax: "d", c: 0, dir: 1 }, { ax: "d", c: 0, dir: -1 });
  lanes.forEach((ln) => { const n = ln.ax === "d" ? 26 : 9; for (let j = 0; j < n; j++) carData.push({ ln, off: r() * 2 * HALF, v: 7 + r() * 6, len: 2.2 + r() * 2.2, ph: r() * 6.28 }); });
  cars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 0.22, 0.4), new THREE.MeshBasicMaterial({ toneMapped: false }), carData.length);
  carData.forEach((c, i) => cars.setColorAt(i, c.ln.dir > 0 ? new THREE.Color(3.6, 3.4, 3.0) : new THREE.Color(3.8, 0.32, 0.2)));
  scene.add(cars);

  // street lights
  { const pts = []; for (let k = -HALF; k <= HALF; k += STREET) for (let s = -HALF; s <= HALF; s += 5) { pts.push(k + 1.1, 0.9, s, s, 0.9, k + 1.1); }
    const geo = new THREE.BufferGeometry(); geo.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3));
    scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ size: 0.55, map: dotTexture(THREE), color: new THREE.Color(1.6, 0.95, 0.45), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }))); }

  // storm clouds: soft sprites in a deck at 52–80
  const cc = document.createElement("canvas"); cc.width = cc.height = 256; const cg = cc.getContext("2d"); const rc = rng(41);
  for (let k = 0; k < 26; k++) { const x = 60 + rc() * 136, y = 70 + rc() * 116, rr = 30 + rc() * 50; const gr = cg.createRadialGradient(x, y, 0, x, y, rr);
    gr.addColorStop(0, "rgba(255,255,255,0.45)"); gr.addColorStop(1, "rgba(255,255,255,0)"); cg.fillStyle = gr; cg.fillRect(0, 0, 256, 256); }
  const ctex = new THREE.CanvasTexture(cc);
  cloudMat = new THREE.SpriteMaterial({ map: ctex, color: new THREE.Color(0.16, 0.18, 0.24), transparent: true, depthWrite: false, opacity: 0 });
  for (let k = 0; k < 170; k++) { const s = new THREE.Sprite(cloudMat); s.position.set((rc() * 2 - 1) * 130, 52 + rc() * 28, (rc() * 2 - 1) * 130); s.scale.setScalar(38 + rc() * 40); cloudSprites.push(s); scene.add(s); }

  // rain around the camera
  const RN = 5000; rainSeeds = new Float32Array(RN * 3); for (let i = 0; i < RN * 3; i++) rainSeeds[i] = rc();
  const rg = new THREE.BufferGeometry(); rg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(RN * 6), 3));
  rain = new THREE.LineSegments(rg, new THREE.LineBasicMaterial({ color: new THREE.Color(0.6, 0.7, 0.95), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  rain.frustumCulled = false; scene.add(rain);

  // lightning: a jagged branching bolt from the cloud deck to the tallest tower
  const rb = rng(77), top = new THREE.Vector3(tallest.cx - 14, 66, tallest.cz - 10), bot = new THREE.Vector3(tallest.cx, tallest.h, tallest.cz);
  const zig = (a, b, depth, amp) => { if (depth === 0) return [a, b]; const m = a.clone().lerp(b, 0.5).add(new THREE.Vector3((rb() - .5) * amp, (rb() - .5) * amp * 0.3, (rb() - .5) * amp));
    return [...zig(a, m, depth - 1, amp / 2).slice(0, -1), ...zig(m, b, depth - 1, amp / 2)]; };
  const main = zig(top, bot, 6, 16); boltMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(4, 4.2, 6), transparent: true, opacity: 0, toneMapped: false });
  bolt = new THREE.Group(); bolt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(main, false, "catmullrom", 0.1), 200, 0.22, 6), boltMat));
  for (let b = 0; b < 4; b++) { const st = main[10 + b * 9]; const end = st.clone().add(new THREE.Vector3((rb() - .5) * 18, -8 - rb() * 10, (rb() - .5) * 18));
    bolt.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(zig(st, end, 4, 6), false, "catmullrom", 0.1), 60, 0.1, 5), boltMat)); }
  scene.add(bolt);
  scene.userData.tallest = tallest;
  return { scene, cam };
}

const flashAt = (t) => Math.max(win(t, 34.18, 34.2, 34.3, 34.42), 0.7 * win(t, 34.5, 34.52, 34.56, 34.66), 0.4 * win(t, 34.95, 34.97, 35.0, 35.1), 0.6 * win(t, 86.15, 86.17, 86.22, 86.34));

const CAM1 = [[31.2, 6, 236, 44, 6, 0, 12], [31.9, 4, 120, 70, 4, 0, 4], [32.5, 0, 24, 76, 0, 3, 22], [33.0, 0.4, 7.5, 54, 0, 1.2, 14], [33.5, 0.4, 6, 39, 0, 3, 0],
  [34.0, 0, 13, 26, 4, 36, -24], [34.4, 2, 27, 18, 10, 50, -40], [34.85, 3, 48, 10, 8, 95, -30], [35.25, 4, 70, 4, 6, 130, -20]];
const CAM2 = [[78.6, 0, 236, 30, 0, 0, 2], [80.4, 28, 125, 92, 0, 0, 0], [82.4, 62, 46, 84, 6, 8, -12], [84.4, 44, 26, 52, 10, 14, -22], [85.6, 22, 22, 30, 12, 30, -24],
  [86.3, 12, 40, 16, 10, 80, -14], [87.0, 6, 72, 6, 6, 130, -6]];

export function render(t, ctx) {
  const k = t < 60 ? CAM1 : CAM2, v = track(k, t);
  cam.position.set(v[0], v[1], v[2]); cam.lookAt(v[3], v[4], v[5]);
  // traffic, pure function of t
  const { M, Q, S, P } = dummy;
  carData.forEach((c, i) => {
    const sp = c.off + c.v * t + 2.2 * Math.sin(0.7 * t + c.ph), s = ((sp % (2 * HALF)) + 2 * HALF) % (2 * HALF) - HALF, d = c.ln.dir;
    const lane = c.ln.c + d * 0.55, y = 0.2;
    if (c.ln.ax === "x") { P.set(s * d, y, lane); Q.setFromAxisAngle(UP(), 0); }
    else if (c.ln.ax === "z") { P.set(lane, y, s * d); Q.setFromAxisAngle(UP(), Math.PI / 2); }
    else { const ang = Math.atan(0.62), x = s * d * Math.cos(ang); P.set(x - d * 0.5 * Math.sin(ang), y, 0.62 * x + 6 + d * 0.5 * Math.cos(ang)); Q.setFromAxisAngle(UP(), -ang); }
    S.set(c.len, 1, 1); M.compose(P, Q, S); cars.setMatrixAt(i, M);
  });
  cars.instanceMatrix.needsUpdate = true;
  // towers rising (only in the revisit)
  rise.forEach((l) => { const u = t > 60 ? sramp(t, l.riseT, l.riseT + 0.9) : 0; M.compose(P.set(l.cx, 0, l.cz), Q.identity(), S.set(l.w, l.h + u * l.riseH, l.w)); bMesh.setMatrixAt(l.i, M); });
  bMesh.instanceMatrix.needsUpdate = true;

  // weather
  const storm = t < 60 ? sramp(t, 33.0, 33.7) : sramp(t, 85.4, 86.0);
  const fl = flashAt(t);
  cloudMat.opacity = 0.95 * storm; cloudMat.color.setRGB(0.15 + fl * 0.35, 0.17 + fl * 0.38, 0.23 + fl * 0.48);
  boltMat.opacity = fl > 0.25 ? 1 : 0;
  bMat.uniforms.uFlash.value = fl * 0.9;
  const inCloud = t < 60 ? sramp(t, 34.75, 35.2) : sramp(t, 86.55, 87.0);
  bMat.uniforms.uFogD.value = 0.009 + 0.03 * inCloud;
  scene.background.setRGB(0.027 + fl * 0.05 + inCloud * 0.1, 0.04 + fl * 0.055 + inCloud * 0.11, 0.08 + fl * 0.08 + inCloud * 0.14);
  bMat.uniforms.uFogC.value.copy(scene.background);
  const rp = rain.geometry.attributes.position.array, n = rainSeeds.length / 3, H = 50;
  for (let i = 0; i < n; i++) {
    const x = cam.position.x + (rainSeeds[i * 3] - 0.5) * 80, z = cam.position.z + (rainSeeds[i * 3 + 2] - 0.5) * 80;
    const y = cam.position.y + 25 - ((((rainSeeds[i * 3 + 1] * H + t * 38) % H) + H) % H);
    rp[i * 6] = x; rp[i * 6 + 1] = y; rp[i * 6 + 2] = z; rp[i * 6 + 3] = x - 0.15; rp[i * 6 + 4] = y - 1.3; rp[i * 6 + 5] = z - 0.1;
  }
  rain.geometry.attributes.position.needsUpdate = true; rain.material.opacity = 0.45 * storm * (1 - inCloud * 0.5);
  ctx.bloom.strength = 0.85 + fl * 0.3;
  return { scene, cam };
}
let _up; const UP = () => (_up || (_up = new THREE.Vector3(0, 1, 0)));
export const camera = () => cam;
