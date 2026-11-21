// PARTICLES: exactly 1,000 glowing particles. They spawn from the centre (36.9-37.7 s, in step with the
// on-screen counter), swarm on Lissajous paths, snap into the shape "1000", then burst. Pure in t (GPU).
import { rng, cam, stars } from "./util.js";

let THREE, renderer, scene, camera, U;
const N = 1000;

function textTargets(r) {
  const cv = document.createElement("canvas"); cv.width = 640; cv.height = 220;
  const g = cv.getContext("2d"); g.fillStyle = "#fff"; g.font = "900 200px Arial, Helvetica, sans-serif";
  g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("1000", 320, 115);
  const d = g.getImageData(0, 0, 640, 220).data, on = [];
  for (let y = 0; y < 220; y += 2) for (let x = 0; x < 640; x += 2) if (d[(y * 640 + x) * 4 + 3] > 128) on.push([x, y]);
  const out = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { const [x, y] = on[Math.floor(r() * on.length)]; out.set([(x - 320) / 640 * 30, -(y - 110) / 640 * 30, (r() - 0.5) * 1.2], i * 3); }
  return out;
}

export function init(T, R) {
  THREE = T; renderer = R;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x07060f);
  camera = cam(THREE, 50);
  scene.add(stars(THREE, 2500, 300, 8, 1.5));
  U = { uTime: { value: 0 } };
  const r = rng(1000), seed = new Float32Array(N * 4), col = new Float32Array(N * 3), pos = new Float32Array(N * 3);
  const pal = [[0.93, 0.53, 0.59], [0.96, 0.69, 0.29], [0.56, 0.5, 0.84], [1, 1, 1]];
  for (let i = 0; i < N; i++) {
    seed.set([r(), r(), r(), i / N], i * 4);
    const c = pal[i % 4]; col.set(c, i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  g.setAttribute("seed", new THREE.BufferAttribute(seed, 4));
  g.setAttribute("tcol", new THREE.BufferAttribute(col, 3));
  g.setAttribute("target", new THREE.BufferAttribute(textTargets(r), 3));
  scene.add(new THREE.Points(g, new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    vertexShader: `attribute vec4 seed; attribute vec3 tcol; attribute vec3 target; uniform float uTime; varying vec3 vC;
      void main(){ float t = uTime; vec4 s = seed;
        vec3 fly = vec3(sin(t*(0.5+s.x*0.9)+s.y*6.28)*(9.+s.z*9.) + sin(t*1.3+s.z*9.)*2.,
                        cos(t*(0.4+s.y*0.8)+s.x*6.28)*(5.+s.x*5.) + sin(t*1.7+s.y*7.)*1.5,
                        sin(t*(0.3+s.z*0.6)+s.w*12.)*8.);
        float ti = 36.9 + s.w*0.8; float sp = t < 36. ? 1. : smoothstep(ti, ti+0.6, t);
        vec3 p = mix(vec3(0.), fly, sp);
        float m = smoothstep(37.5, 38.15, t) * (1. - smoothstep(38.75, 39.0, t));
        p = mix(p, target, m);
        float burst = smoothstep(38.75, 39.6, t) * (t < 41. ? 1. : 0.);
        p += normalize(target + vec3(0.001)) * burst * (6. + s.z*14.);
        vC = tcol * (1.3 + 0.9*m);
        vec4 mv = modelViewMatrix*vec4(p,1.); gl_PointSize = (0.55 + 0.45*s.z) * 520. / -mv.z * sp; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vC; void main(){ float d = length(gl_PointCoord-.5); if(d>.5) discard;
        float core = smoothstep(.5,.0,d); gl_FragColor = vec4(vC*core*core*1.6, 1.); }`,
  })));
}

export function render(t) {
  U.uTime.value = t;
  camera.position.set(Math.sin(t * 0.2) * 5, Math.sin(t * 0.13) * 2, 30 - Math.max(0, Math.min(1, (t - 36.6) / 2.5)) * 3);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
}
