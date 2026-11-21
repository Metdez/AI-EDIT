// BLOCKS: the three.js "hello cube". 54-58 one spinning cube; 58.3-62.5 420 cubes fly out and build a
// tower; 65.9-69.7 the tower tangles into chaos ("overthinking"); 69.76 everything collapses back to one
// cube; 71.5-72.8 a cursor drags it (rotation shares its curve with the HTML cursor). Pure in t.
import { rng, prog, sstep, eOut3, eIn3, eInOut, lerp, cam } from "./util.js";

let THREE, renderer, scene, camera, hero, inst, slots, sd, dummy, ripples = [], gridU;
const N = 420, HERO = new Float32Array([0, 1, 0]);
export const drag = (t) => 2.2 * eInOut(prog(t, 71.55, 72.15)) - 1.4 * eInOut(prog(t, 72.3, 72.75));

export function init(T, R) {
  THREE = T; renderer = R;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x10121c);
  scene.fog = new THREE.Fog(0x10121c, 40, 110);
  camera = cam(THREE, 45);
  gridU = { uTime: { value: 0 } };
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(300, 300), new THREE.ShaderMaterial({
    uniforms: gridU,
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `varying vec3 vW; void main(){ vec2 q = vW.xz; vec2 g = abs(fract(q-.5)-.5)/fwidth(q); float l = 1.-min(min(g.x,g.y),1.);
      vec2 q5 = vW.xz/5.; vec2 g5 = abs(fract(q5-.5)-.5)/fwidth(q5); float l5 = 1.-min(min(g5.x,g5.y),1.);
      float fade = exp(-length(vW.xz)*0.035); vec3 c = vec3(.05,.055,.075) + vec3(.22,.24,.32)*(l*.35+l5*.8)*fade;
      gl_FragColor = vec4(c,1.); }`,
  }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor);
  scene.add(new THREE.HemisphereLight(0x9aa6ff, 0x101018, 0.55));
  const key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-6, 10, 7); scene.add(key);
  const rim = new THREE.DirectionalLight(0xec8796, 1.2); rim.position.set(6, 4, -8); scene.add(rim);

  hero = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), new THREE.MeshStandardMaterial({ color: 0xec8796, roughness: 0.45, metalness: 0.1 }));
  hero.add(new THREE.LineSegments(new THREE.EdgesGeometry(hero.geometry), new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })));
  scene.add(hero);

  // tower slots, bottom-up, a stepped ziggurat with a spire
  slots = [];
  for (let y = 0; slots.length < N && y < 40; y++) {
    const side = Math.max(1, 7 - Math.floor(y / 2)), h = (side - 1) / 2;
    for (let x = 0; x < side; x++) for (let z = 0; z < side; z++) {
      const edge = x === 0 || z === 0 || x === side - 1 || z === side - 1;
      if ((edge || y % 3 === 0) && slots.length < N) slots.push([(x - h) * 1.05, 0.5 + y * 1.05, (z - h) * 1.05]);
    }
  }
  while (slots.length < N) slots.push([0, 0.5 + slots.length * 0.02, 0]);
  const r = rng(58); sd = [];
  for (let i = 0; i < N; i++) { const a = r() * 6.28, b = r() * 2 - 1, s = Math.sqrt(1 - b * b); sd.push([Math.cos(a) * s, b, Math.sin(a) * s, r(), r()]); }
  inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.95, 0.95, 0.95), new THREE.MeshStandardMaterial({ roughness: 0.5 }), N);
  const pal = [0xec8796, 0xf6b04a, 0x8f7fd6, 0xe9e6f5];
  for (let i = 0; i < N; i++) inst.setColorAt(i, new THREE.Color(pal[Math.floor(sd[i][3] * 4)]));
  scene.add(inst); dummy = new THREE.Object3D();

  for (let i = 0; i < 2; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.96, 1, 96), new THREE.MeshBasicMaterial({ color: new THREE.Color(0xf6b04a).multiplyScalar(2), toneMapped: false, transparent: true, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2; m.position.y = 0.02; m.userData.at = [71.55, 72.3][i]; ripples.push(m); scene.add(m);
  }
}

function rig(t) {
  let d = 8, h = 3.2, a = 0.5 + t * 0.12, look = 1;
  const out = eInOut(prog(t, 58.3, 61.5)), back = eInOut(prog(t, 69.6, 70.8));
  d = lerp(lerp(8, 34, out), 9, back); h = lerp(lerp(3.2, 16, out), 3.5, back); look = lerp(lerp(1, 8, out), 1.1, back);
  if (t > 63 && t < 70) a += (t - 63) * 0.08; // faster orbit during the chaos
  if (t > 70.8) a = 0.5 + 70.8 * 0.12 + (t - 70.8) * 0.03;
  camera.position.set(Math.sin(a) * d, h, Math.cos(a) * d); camera.lookAt(0, look, 0);
  const sh = 170 * (1 - eInOut(prog(t, 59.9, 60.7))); // cube sits right of the code snippet, then recentres
  if (sh > 0.5) camera.setViewOffset(1920, 1080, -sh, 0, 1920, 1080); else camera.clearViewOffset();
}

export function render(t) {
  rig(t);
  const press = Math.max(1 - Math.abs(t - 71.55) / 0.12, 1 - Math.abs(t - 72.3) / 0.12, 0);
  hero.position.set(HERO[0], HERO[1] - press * 0.08, HERO[2]);
  hero.scale.set(1 + press * 0.06, 1 - press * 0.1, 1 + press * 0.06);
  hero.rotation.set(t < 71.26 ? t * 0.35 : 71.26 * 0.35, (t < 71.26 ? t : 71.26) * 0.6 + drag(t), 0);

  const chaos = sstep(t, 65.9, 67.2), col = eIn3(prog(t, 69.76, 70.55));
  inst.visible = t > 58.2 && col < 1;
  if (inst.visible) for (let i = 0; i < N; i++) {
    const a = 58.3 + 4.2 * (i / N), k = eOut3(prog(t, a, a + 0.55)), s = slots[i], q = sd[i];
    let x = lerp(HERO[0], s[0], k), y = lerp(HERO[1], s[1], k), z = lerp(HERO[2], s[2], k);
    const R = chaos * (4 + q[4] * 9);
    x += q[0] * R + Math.sin(t * 2.1 + i) * chaos * 1.5; y += q[1] * R * 0.8 + chaos * 4; z += q[2] * R + Math.cos(t * 1.7 + i) * chaos * 1.5;
    x = lerp(x, HERO[0], col); y = lerp(y, HERO[1], col); z = lerp(z, HERO[2], col);
    dummy.position.set(x, y, z);
    dummy.rotation.set(chaos * t * (1 + q[3] * 3), chaos * t * (0.5 + q[4] * 2), 0);
    dummy.scale.setScalar(Math.max(0.001, k * (1 - col)));
    dummy.updateMatrix(); inst.setMatrixAt(i, dummy.matrix);
  }
  inst.instanceMatrix.needsUpdate = true;
  ripples.forEach((m) => { const u = (t - m.userData.at) / 0.9; m.visible = u > 0 && u < 1; m.scale.setScalar(1.5 + u * 5); m.material.opacity = 1 - u; });
  renderer.render(scene, camera);
}
