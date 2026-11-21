// SPLAT: a real AI-generated world (World Labs Marble sample "Narrow European cobblestone lane",
// 500k Gaussian splats) rendered by Spark inside three.js, plus three.js rain and a "how it works" overlay.
// render(t) is async: it waits until Spark's splat sort matches this exact camera before drawing.
import { SparkRenderer, SplatMesh } from "@sparkjsdev/spark";
import { rng, prog, sstep, eInOut, lerp } from "./util.js";

let THREE, renderer, scene, camera, spark, world, rain, grid, arrows, U;
const GROUND = -1.45;
export let ready;

export function init(T, R) {
  THREE = T; renderer = R;
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(62, 16 / 9, 0.01, 500);
  // The render engine runs Chrome in deterministic BeginFrame mode, where setTimeout never fires inside a
  // seek. three's async readback polls a GPU fence with setTimeout, so Spark's sort would hang: read synchronously.
  renderer.readRenderTargetPixelsAsync = (rt, x, y, w, h, buf, face, idx) => { renderer.readRenderTargetPixels(rt, x, y, w, h, buf, face, idx); return Promise.resolve(buf); };
  spark = new SparkRenderer({ renderer, autoUpdate: false, minSortIntervalMs: 0 });
  scene.add(spark);
  world = new SplatMesh({ url: "assets/worlds/cobblestone_lane_500k.spz" });
  world.quaternion.set(1, 0, 0, 0); // Marble (OpenCV axes) -> three.js: flip Y and Z
  scene.add(world);
  ready = world.initialized;

  U = { uTime: { value: 0 }, uHow: { value: 0 } };
  // rain: streaks whose height is fract(seed - speed*t), pure in t
  const N = 5000, r = rng(5), p = new Float32Array(N * 6), s = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    const x = (r() - 0.5) * 6, z = -r() * 9 + 1.5, sd = r();
    p.set([x, 0, z, x, 1, z], i * 6); s[i * 2] = sd; s[i * 2 + 1] = sd;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(p, 3)); g.setAttribute("seed", new THREE.BufferAttribute(s, 1));
  rain = new THREE.LineSegments(g, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute float seed; uniform float uTime; varying float vA;
      void main(){ float h = fract(seed*7.13 - uTime*(0.9+seed*0.3)); vec3 q = position;
        q.y = mix(1.8, ${GROUND.toFixed(2)}, h) + position.y*0.22; q.x += position.y*0.03; vA = position.y;
        gl_Position = projectionMatrix*modelViewMatrix*vec4(q,1.); }`,
    fragmentShader: `uniform float uHow; varying float vA; void main(){ vec3 c = mix(vec3(.75,.82,.95), vec3(.35,.95,1.), uHow);
      gl_FragColor = vec4(c*(0.30+0.45*uHow), 0.5*vA+0.2); }`,
  }));
  rain.renderOrder = 999; scene.add(rain);

  // "how it works": a measuring grid on the ground and force arrows
  grid = new THREE.Mesh(new THREE.PlaneGeometry(10, 14), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, depthTest: false,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform float uHow, uTime; varying vec3 vW;
      void main(){ vec2 q = vW.xz/0.4; vec2 gg = abs(fract(q-.5)-.5)/fwidth(q); float l = 1.-min(min(gg.x,gg.y),1.);
        float sweep = smoothstep(0.,1., uHow*16. - (-vW.z+1.5));
        gl_FragColor = vec4(vec3(.3,.95,1.)*l*1.4, l*0.8*sweep*uHow); }`,
  }));
  grid.renderOrder = 1000; grid.rotation.x = -Math.PI / 2; grid.position.set(0, GROUND + 0.02, -4); scene.add(grid);
  arrows = new THREE.Group();
  const mk = (dir, origin, len, col) => { const a = new THREE.ArrowHelper(new THREE.Vector3(...dir).normalize(), new THREE.Vector3(...origin), len, col, 0.18, 0.1); a.traverse((o) => { if (o.material) { o.material.depthTest = false; o.renderOrder = 1001; } }); arrows.add(a); };
  mk([0, -1, 0], [-0.55, 0.6, -2.6], 1.4, 0x55f0ff); // gravity on rain
  mk([1, -0.25, 0], [-0.9, 0.2, -3.2], 1.0, 0xf6b04a); // wind
  mk([0, -1, 0], [0.55, 0.9, -3.6], 1.4, 0x55f0ff);
  scene.add(arrows);
}

function rig(t) {
  const u = t - 17.85, k = eInOut(prog(t, 17.85, 33));
  camera.position.set(0.07 * Math.sin(u * 0.35), -0.03 * u * 0.4, lerp(0.35, -1.0, k));
  camera.rotation.set(0.02 * Math.sin(u * 0.25), 0.13 * Math.sin(u * 0.28), 0);
  camera.updateMatrixWorld();
}

export async function render(t) {
  await ready;
  rig(t);
  U.uTime.value = t;
  const how = sstep(t, 27.0, 27.6) * (1 - sstep(t, 29.3, 30.0));
  U.uHow.value = how; grid.visible = how > 0.001; arrows.visible = how > 0.05;
  arrows.children.forEach((a, i) => a.scale.setScalar(Math.max(0.001, sstep(t, 27.2 + i * 0.15, 27.6 + i * 0.15))));
  const target = renderer.getRenderTarget();
  for (let i = 0; i < 8; i++) {
    await spark.update({ scene, camera });
    if (!spark.sorting && !spark.sortDirty && spark.sortedCenter.distanceTo(camera.position) < 1e-4) break;
    await Promise.resolve(); // no timers (see init); bounded retry, a frame could keep a 1-step-stale sort if it never settles
  }
  renderer.setRenderTarget(target);
  renderer.render(scene, camera);
}
