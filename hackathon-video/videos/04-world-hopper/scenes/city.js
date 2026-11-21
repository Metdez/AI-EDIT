// CITY: Boston-ish night grid. Instanced buildings with lit windows, the Charles River, two towers
// (Pru + Hancock nods), and 1,800 car lights whose positions are closed-form in t.
import { rng, prog, eInOut, lerp, stars, cam } from "./util.js";

let THREE, renderer, scene, camera, cars, carData, dummy, U;
const B = 12, ST = 2.6, NB = 9; // block pitch, street width, blocks per side of centre
const HALF = NB * B;

export function init(T, R) {
  THREE = T; renderer = R;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x060914);
  scene.fog = new THREE.FogExp2(0x0a1022, 0.0105);
  camera = cam(THREE, 52);
  U = { uTime: { value: 0 } };
  const r = rng(42);

  // ground: dark blocks, faintly sodium-lit streets, the river to the north
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), new THREE.ShaderMaterial({
    uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) }, fog: true,
    vertexShader: `varying vec3 vW;\n#include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; vec4 mvPosition = viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    fragmentShader: `uniform float uTime; varying vec3 vW;\n#include <fog_pars_fragment>
      void main(){ vec2 q = mod(vW.xz + ${(B / 2).toFixed(1)}, ${B.toFixed(1)}); float st = step(q.x, ${ST.toFixed(1)}) + step(q.y, ${ST.toFixed(1)});
        vec3 c = mix(vec3(.018,.02,.03), vec3(.09,.06,.035), clamp(st,0.,1.));
        float river = smoothstep(${(HALF + 2).toFixed(1)}, ${(HALF + 4).toFixed(1)}, vW.z) * (1.-smoothstep(${(HALF + 34).toFixed(1)}, ${(HALF + 36).toFixed(1)}, vW.z));
        float shim = .5+.5*sin(vW.x*1.7 + uTime*1.3 + sin(vW.z*2.3)*2.);
        c = mix(c, vec3(.02,.04,.08) + vec3(.25,.18,.08)*pow(shim,8.)*.6, river);
        gl_FragColor = vec4(c,1.);\n#include <fog_fragment>\n}`,
  }));
  ground.rotation.x = -Math.PI / 2; scene.add(ground);
  scene.add(stars(THREE, 1500, 400, 3, 1.4));

  // buildings: 2-3 boxes per block, taller toward downtown; two landmark towers
  const boxes = [];
  for (let i = -NB; i < NB; i++) for (let j = -NB; j < NB; j++) {
    const cx = i * B, cz = j * B, // blocks sit between streets at [12k-6, 12k-3.4]
      d = Math.hypot(cx, cz) / HALF;
    const n = 2 + Math.floor(r() * 2), inner = B - ST - 1.2;
    for (let k = 0; k < n; k++) {
      const w = inner / n - 0.4, h = (2 + r() * 6) * (1 + 3.2 * Math.max(0, 1 - d) ** 2) + r() * 3;
      boxes.push([cx - inner / 2 + (k + 0.5) * (inner / n) + ST / 2, h, cz + ST / 2, w, inner * (0.6 + r() * 0.35)]);
    }
  }
  boxes.push([ST / 2, 52, -B + ST / 2, 6.5, 6.5]); // Pru
  boxes.push([B + ST / 2, 60, ST / 2, 7.5, 4]);   // Hancock
  const bm = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.ShaderMaterial({
    uniforms: { ...U, ...THREE.UniformsUtils.clone(THREE.UniformsLib.fog) }, fog: true,
    vertexShader: `varying vec3 vW; varying vec3 vN; varying float vId;\n#include <fog_pars_vertex>
      void main(){ vec4 w = modelMatrix*instanceMatrix*vec4(position,1.); vW=w.xyz; vN=normal; vId=float(gl_InstanceID);
        vec4 mvPosition = viewMatrix*w; gl_Position=projectionMatrix*mvPosition;\n#include <fog_vertex>\n}`,
    fragmentShader: `varying vec3 vW; varying vec3 vN; varying float vId;\n#include <fog_pars_fragment>
      float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
      void main(){ vec3 c = vec3(.035,.032,.04) + vec3(.05,.06,.1)*max(0.,dot(vN, normalize(vec3(-.4,.6,.5))));
        if (abs(vN.y) < .5) { float along = abs(vN.x) > .5 ? vW.z : vW.x; vec2 cell = floor(vec2(along/0.8, vW.y/1.0));
          vec2 f = fract(vec2(along/0.8, vW.y/1.0)); float win = step(.18,f.x)*step(f.x,.82)*step(.25,f.y)*step(f.y,.75);
          float lit = step(.58, h(cell + vId*1.7)); vec3 wc = mix(vec3(1.,.72,.38), vec3(.75,.85,1.), step(.8, h(cell*1.3+vId)));
          c += win*lit*wc*1.25*step(.6, vW.y); }
        gl_FragColor = vec4(c,1.);\n#include <fog_fragment>\n}`,
  }), boxes.length);
  const m = new THREE.Matrix4();
  boxes.forEach((b, i) => { m.makeScale(b[3], b[1], b[4]); m.setPosition(b[0], b[1] / 2, b[2]); bm.setMatrixAt(i, m); });
  scene.add(bm);

  // cars: each lives on one street lane, position = fract(offset + speed*t)
  const NC = 1800; carData = [];
  for (let i = 0; i < NC; i++) {
    const main = r() < 0.45, alongX = main ? false : r() < 0.5, line = main ? Math.floor(r() * 3) - 1 : Math.floor(r() * 2 * NB) - NB, dir = r() < 0.5 ? 1 : -1;
    carData.push({ alongX, c: line * B - B / 2 + ST / 2 + (dir > 0 ? 0.6 : -0.6), dir, off: r(), sp: (0.018 + r() * 0.02) * dir });
  }
  cars = new THREE.InstancedMesh(new THREE.BoxGeometry(0.5, 0.3, 1), new THREE.MeshBasicMaterial({ toneMapped: false, fog: true }), NC);
  const head = new THREE.Color(4.0, 3.4, 2.4), tail = new THREE.Color(4.0, 0.35, 0.2);
  carData.forEach((c, i) => cars.setColorAt(i, (c.dir > 0) === c.alongX ? head : tail));
  scene.add(cars); dummy = new THREE.Object3D();
}

function rig(t) {
  if (t < 60) { // pass A: dive in over the river toward the towers
    // low over the main avenue (x = -4.7), traffic streaming toward the towers
    const k = eInOut(prog(t, 32.0, 34.6));
    camera.position.set(lerp(-1, -7, k), lerp(26, 17, k), lerp(98, 70, k));
    camera.lookAt(lerp(-3, 1, k), 2, lerp(20, 5, k));
  } else { // pass B: "something cool they've built", a slow high orbit
    const a = -0.9 + (t - 78.7) * 0.12;
    camera.position.set(Math.sin(a) * 95, 42 - (t - 78.7) * 1.5, Math.cos(a) * 95);
    camera.lookAt(0, 6, 0);
  }
}

export function render(t) {
  U.uTime.value = t; rig(t);
  const L = 2 * HALF;
  carData.forEach((c, i) => {
    const s = ((c.off + c.sp * t) % 1 + 1) % 1 * L - HALF;
    if (c.alongX) { dummy.position.set(s, 0.2, c.c); dummy.rotation.set(0, Math.PI / 2, 0); }
    else { dummy.position.set(c.c, 0.2, s); dummy.rotation.set(0, 0, 0); }
    dummy.scale.set(1, 1, 3.4); dummy.updateMatrix(); cars.setMatrixAt(i, dummy.matrix);
  });
  cars.instanceMatrix.needsUpdate = true;
  renderer.render(scene, camera);
}
