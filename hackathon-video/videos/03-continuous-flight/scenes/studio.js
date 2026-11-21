// STUDIO: a grid world. Physics lab (43.3–53.6), hello cube and the build (53.6–78.6).
import { rng, clamp, lerp, smooth, sramp, ramp, win, track, expoOut } from "./util.js";

let THREE, scene, cam, grid, gridPos, star, starGlow, bodies = [], trails = [], arrows = [], spiral, cubeWire, cubeSolid, sphere, torus, nodes, tower, wires, ball, people, arcs, pulses;
const GN = 61, GS = 44, SEG = 110; // grid lines, size, segments per line
const PAL = ["#EC8796", "#F6B04A", "#8F7FD6", "#ffffff"];
const ORB = [{ r: 3.6, w: 1.25, c: "#F6B04A", s: 0.32 }, { r: 5.6, w: 0.68, c: "#EC8796", s: 0.42 }, { r: 8.2, w: 0.38, c: "#8F7FD6", s: 0.36 }];
const NT = 160, NN = 40, NP = 60, NA = 80;
let towerData = [], nodeData = [], peopleData = [], arcData = [], COLS;
const V = (x, y, z) => new THREE.Vector3(x, y, z);

export async function init(THREE_) {
  THREE = THREE_; COLS = PAL.map((h) => new THREE.Color(h));
  scene = new THREE.Scene(); scene.background = new THREE.Color("#07080f"); scene.fog = new THREE.FogExp2("#07080f", 0.028);
  cam = new THREE.PerspectiveCamera(50, 16 / 9, 0.05, 500);
  const key = new THREE.DirectionalLight(0xffe8d6, 2.4); key.position.set(-6, 10, 6);
  const rim = new THREE.DirectionalLight(0x8fa8ff, 1.2); rim.position.set(5, 4, -8);
  scene.add(key, rim, new THREE.HemisphereLight(0x8f7fd6, 0x05060a, 0.35));

  // deformable grid: lines along x and z
  const n = GN * SEG * 2 * 2; gridPos = new Float32Array(n * 3);
  const gg = new THREE.BufferGeometry(); gg.setAttribute("position", new THREE.BufferAttribute(gridPos, 3));
  grid = new THREE.LineSegments(gg, new THREE.LineBasicMaterial({ color: new THREE.Color(0.42, 0.36, 0.85), transparent: true, opacity: 0.55, fog: true }));
  grid.frustumCulled = false; scene.add(grid);

  // lab: star + bodies with trails and velocity arrows
  star = new THREE.Mesh(new THREE.SphereGeometry(0.85, 48, 24), new THREE.MeshBasicMaterial({ color: new THREE.Color(3.2, 2.4, 1.5) }));
  starGlow = new THREE.PointLight(0xffc890, 30, 30, 1.6); star.add(starGlow); scene.add(star);
  ORB.forEach((o) => {
    const b = new THREE.Mesh(new THREE.SphereGeometry(o.s, 32, 16), new THREE.MeshStandardMaterial({ color: o.c, roughness: 0.5, emissive: new THREE.Color(o.c), emissiveIntensity: 0.35 }));
    bodies.push(b); scene.add(b);
    const tg = new THREE.BufferGeometry(); tg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(60 * 3), 3));
    const col = new Float32Array(60 * 3), c = new THREE.Color(o.c); for (let j = 0; j < 60; j++) { const f = 1 - j / 59; col.set([c.r * f * 1.6, c.g * f * 1.6, c.b * f * 1.6], j * 3); }
    tg.setAttribute("color", new THREE.BufferAttribute(col, 3));
    const tr = new THREE.Line(tg, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); tr.frustumCulled = false; trails.push(tr); scene.add(tr);
    const ar = new THREE.Group(), am = new THREE.MeshBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.7) });
    const sh = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1, 8), am); sh.position.y = 0.5; const hd = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.3, 12), am); hd.position.y = 1.05;
    ar.add(sh, hd); arrows.push(ar); scene.add(ar);
  });
  spiral = new THREE.InstancedMesh(new THREE.SphereGeometry(0.16, 16, 8), new THREE.MeshStandardMaterial({ roughness: 0.4, emissiveIntensity: 0.6 }), 24);
  for (let i = 0; i < 24; i++) spiral.setColorAt(i, new THREE.Color(PAL[i % 3])); spiral.material.emissive = new THREE.Color(0.3, 0.25, 0.4); scene.add(spiral);

  // hello cube: wireframe first, then solid; then sphere and torus
  const pink = new THREE.MeshStandardMaterial({ color: "#EC8796", roughness: 0.45, metalness: 0.05 });
  cubeWire = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4, 2.4, 2.4)), new THREE.LineBasicMaterial({ color: new THREE.Color(1.6, 1.6, 1.8) }));
  cubeSolid = new THREE.Mesh(new THREE.BoxGeometry(2.36, 2.36, 2.36), pink);
  sphere = new THREE.Mesh(new THREE.SphereGeometry(1.45, 48, 24), new THREE.MeshStandardMaterial({ color: "#F6B04A", roughness: 0.4 }));
  torus = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.45, 24, 64), new THREE.MeshStandardMaterial({ color: "#8F7FD6", roughness: 0.4 }));
  scene.add(cubeWire, cubeSolid, sphere, torus);

  const r = rng(51);
  // 40 people-nodes that rise and link up
  nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(0.28, 20, 10), new THREE.MeshStandardMaterial({ roughness: 0.4, emissive: new THREE.Color(0.35, 0.3, 0.4) }), NN);
  for (let i = 0; i < NN; i++) { const a = (i / NN) * Math.PI * 2 + r() * 0.1, rr = 5 + r() * 3.5; nodeData.push({ x: rr * Math.cos(a), z: rr * Math.sin(a), y: 0.6 + r() * 2.2, t0: 59.25 + r() * 0.5 }); nodes.setColorAt(i, new THREE.Color(PAL[i % 4])); }
  scene.add(nodes);
  wires = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(NT * 6 + NN * 6), 3)),
    new THREE.LineBasicMaterial({ color: new THREE.Color(0.9, 0.8, 1.4), transparent: true, opacity: 0.5, blending: THREE.AdditiveBlending, depthWrite: false }));
  wires.frustumCulled = false; scene.add(wires);

  // tower blocks: fly from the nodes into a spiral tower, then into a tangle
  tower = new THREE.InstancedMesh(new THREE.BoxGeometry(0.9, 0.9, 0.9), new THREE.MeshStandardMaterial({ roughness: 0.45 }), NT);
  for (let i = 0; i < NT; i++) { const lv = Math.floor(i / 8), a = (i % 8) * (Math.PI / 4) + lv * 0.22;
    towerData.push({ lv, tx: 2.3 * Math.cos(a), ty: 0.45 + lv * 0.92, tz: 2.3 * Math.sin(a), node: i % NN, ax: V(r() - .5, r() - .5, r() - .5).normalize(), R: 3 + r() * 10, w: (0.4 + r() * 0.9) * (r() < 0.5 ? -1 : 1), ph: r() * 6.28, yy: (r() - .5) * 9 });
    tower.setColorAt(i, new THREE.Color(PAL[(i * 7) % 4])); }
  scene.add(tower);

  // the one simple sphere you click
  ball = new THREE.Mesh(new THREE.SphereGeometry(1.5, 64, 32), new THREE.MeshStandardMaterial({ color: "#EC8796", roughness: 0.35, emissive: new THREE.Color("#EC8796"), emissiveIntensity: 0 }));
  scene.add(ball);

  // people network after the click
  people = new THREE.InstancedMesh(new THREE.SphereGeometry(0.3, 20, 10), new THREE.MeshStandardMaterial({ roughness: 0.4, emissive: new THREE.Color(0.25, 0.2, 0.3) }), NP);
  for (let i = 0; i < NP; i++) { const ring = i < 24 ? 0 : 1, a = (ring ? (i - 24) / 36 : i / 24) * Math.PI * 2 + ring * 0.2, rr = ring ? 10 + r() * 1.5 : 5.8 + r() * 1.2;
    peopleData.push({ x: rr * Math.cos(a), z: rr * Math.sin(a), r: rr, c: (i * 5) % 4, c2: (i * 3 + 1) % 4, q: r() < 0.22 }); people.setColorAt(i, new THREE.Color(PAL[(i * 5) % 4])); }
  scene.add(people);
  for (let k = 0; k < NA; k++) { const a = Math.floor(r() * NP); let b = Math.floor(r() * NP); if (b === a) b = (a + 7) % NP; arcData.push({ a, b, ph: r(), sp: 0.5 + r() * 0.5, t0: 73.4 + r() * 1.2 }); }
  arcs = new THREE.LineSegments(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(NA * 16 * 6), 3)),
    new THREE.LineBasicMaterial({ color: new THREE.Color(0.95, 0.75, 1.3), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  arcs.frustumCulled = false; scene.add(arcs);
  pulses = new THREE.Points(new THREE.BufferGeometry().setAttribute("position", new THREE.BufferAttribute(new Float32Array(NA * 3), 3)),
    new THREE.PointsMaterial({ size: 0.38, color: new THREE.Color(2.6, 2.2, 1.6), transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
  pulses.frustumCulled = false; scene.add(pulses);
  return { scene, cam };
}

// gravity mass, burst ripple, click ripple → grid height
const mass = (t) => sramp(t, 43.3, 43.9) * (1 - sramp(t, 52.4, 53.7));
function heightAt(x, z, t, M) {
  const r2 = x * x + z * z, r = Math.sqrt(r2);
  let h = -M * 3.2 / Math.sqrt(r2 + 1.8) + M * 3.2 / Math.sqrt(22 * 22 + 1.8);
  const tb = t - 43.3; if (tb > 0 && tb < 3) { const fr = tb * 9; h += 0.5 * Math.exp(-tb * 1.4) * Math.exp(-((r - fr) ** 2) / 2.5); }
  const tc = t - 71.6; if (tc > 0 && tc < 6.5) { const fr = tc * 4.1; h += 0.45 * Math.exp(-tc * 0.55) * Math.sin(1.6 * (r - fr)) * Math.exp(-((r - fr) ** 2) / 10) ; }
  return h;
}
const orbitPos = (o, t, M, out) => { const a = o.w * t + o.r; out.set(o.r * Math.cos(a), 0, o.r * Math.sin(a)); out.y = heightAt(out.x, out.z, t, M) + o.s + 0.05; return out; };

const CAM = [
  [43.3, 0, 1.4, 3.4, 0, -0.9, 0], [44.4, 0, 6, 12.5, 0, -1, 0], [46.5, 7, 7.5, 15, 0, -1, 0], [48.6, 5, 9, 16, 0, -1, 0], [50.6, -5, 15, 15, 0, -1, 0],
  [52.3, -5, 10, 15, 0, 0, 0], [53.8, -2, 4.6, 10.5, 0, 1.3, 0], [55.8, 1.8, 3.6, 7.6, 0, 1.6, 0], [57.6, 0, 3.4, 7.4, 0, 1.6, 0], [59.4, -3, 6, 15, 0, 1.6, 0],
  [61.1, 0, 6.5, 17, 0, 3, 0], [62.9, 6, 10, 27, 0, 9.5, 0], [65.2, 4, 10.5, 28, 0, 9.5, 0], [66.4, 8, 12, 28, 0, 7, 0], [69.4, 0, 13, 33, 0, 6, 0],
  [70.3, 0, 5.2, 13, 0, 1.6, 0], [72.0, 0, 5, 13, 0, 1.6, 0], [73.4, 3, 7, 16, 0, 1, 0], [75.0, 7, 9, 19, 0, 0.6, 0], [76.6, -6, 13, 19, 0, 0.3, 0],
  [77.8, 0, 24, 15, 0, 0, 0], [78.6, 0, 34, 5, 0, 0, 0]];

export function render(t, ctx) {
  const M = mass(t);
  // grid
  let p = 0; const half = GS / 2, step = GS / (GN - 1), sl = GS / SEG;
  const flat = t > 54.2 && t < 71.5; // no deformation needed: skip the math
  for (let l = 0; l < GN; l++) { const c = -half + l * step;
    for (let s = 0; s < SEG; s++) { const a = -half + s * sl, b = a + sl;
      const ha = flat ? 0 : heightAt(a, c, t, M), hb = flat ? 0 : heightAt(b, c, t, M), va = flat ? 0 : heightAt(c, a, t, M), vb = flat ? 0 : heightAt(c, b, t, M);
      gridPos[p++] = a; gridPos[p++] = ha; gridPos[p++] = c; gridPos[p++] = b; gridPos[p++] = hb; gridPos[p++] = c;
      gridPos[p++] = c; gridPos[p++] = va; gridPos[p++] = a; gridPos[p++] = c; gridPos[p++] = vb; gridPos[p++] = b; } }
  grid.geometry.attributes.position.needsUpdate = true;
  const toOrange = sramp(t, 77.9, 78.6); grid.material.color.setRGB(lerp(0.42, 1.3, toOrange), lerp(0.36, 0.72, toOrange), lerp(0.85, 0.35, toOrange));

  // lab
  const lab = t < 53.8;
  star.visible = lab; star.position.set(0, heightAt(0, 0, t, M) + 0.85 * M, 0); star.scale.setScalar(Math.max(1e-3, sramp(t, 43.25, 43.6) * (1 - sramp(t, 52.6, 53.6))));
  const tmp = V(), tmp2 = V();
  ORB.forEach((o, i) => {
    const vis = sramp(t, 43.5 + i * 0.25, 44.0 + i * 0.25) * (1 - sramp(t, 52.4, 53.4)); const drift = 1 + sramp(t, 52.3, 53.6) * 2.2;
    orbitPos(o, t, M, tmp); tmp.x *= drift; tmp.z *= drift; bodies[i].position.copy(tmp); bodies[i].scale.setScalar(Math.max(vis, 1e-3)); bodies[i].visible = lab;
    const tp = trails[i].geometry.attributes.position.array;
    for (let j = 0; j < 60; j++) { orbitPos(o, t - j * 0.035 / o.w * 0.9, M, tmp2); tmp2.x *= drift; tmp2.z *= drift; tp[j * 3] = tmp2.x; tp[j * 3 + 1] = tmp2.y; tp[j * 3 + 2] = tmp2.z; }
    trails[i].geometry.attributes.position.needsUpdate = true; trails[i].visible = lab && vis > 0.01;
    const a = o.w * t + o.r, dir = V(-Math.sin(a), 0, Math.cos(a)).multiplyScalar(Math.sign(o.w));
    const av = sramp(t, 45.0 + i * 0.3, 45.6 + i * 0.3) * (1 - sramp(t, 49.0, 49.5));
    arrows[i].position.copy(tmp); arrows[i].quaternion.setFromUnitVectors(V(0, 1, 0), dir); arrows[i].scale.set(1, Math.max(av * 1.6, 1e-3), 1); arrows[i].visible = lab && av > 0.01;
  });
  // ideas: 24 bodies spiral out of the star
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), sc = V();
  for (let i = 0; i < 24; i++) { const t0 = 49.3 + i * 0.07, u = clamp((t - t0) / 1.6), R = 1 + (2.5 + (i % 6) * 0.9) * smooth(u) + sramp(t, 52.3, 53.6) * 9;
    const a = i * 2.4 + (t - t0) * (1.6 / Math.sqrt(R)) * 1.4; const x = R * Math.cos(a), z = R * Math.sin(a);
    const s = t > t0 ? Math.max(1e-3, sramp(t, t0, t0 + 0.3) * (1 - sramp(t, 52.8, 53.6))) : 1e-3;
    m4.compose(sc.set(x, heightAt(x, z, t, M) + 0.2, z), q.identity(), V(s, s, s)); spiral.setMatrixAt(i, m4); }
  spiral.instanceMatrix.needsUpdate = true; spiral.visible = lab;

  // hello cube → sphere → torus
  const rise = expoOut(ramp(t, 54.2, 55.0)), cy = lerp(-1.6, 1.6, rise), rotY = t * 0.6, rotX = 0.4 + t * 0.15;
  const toSphere = sramp(t, 57.75, 58.0), toTorus = sramp(t, 58.55, 58.8), shrink = sramp(t, 61.0, 61.5);
  cubeWire.visible = t > 54.1 && t < 58.1; cubeWire.position.set(0, cy, 0); cubeWire.rotation.set(rotX, rotY, 0); cubeWire.scale.setScalar(Math.max(1e-3, 1 - toSphere));
  const solid = expoOut(ramp(t, 55.7, 56.2)); cubeSolid.visible = cubeWire.visible && solid > 0; cubeSolid.position.copy(cubeWire.position); cubeSolid.rotation.copy(cubeWire.rotation);
  cubeSolid.scale.setScalar(Math.max(1e-3, solid * (1 - toSphere)));
  sphere.visible = t > 57.7 && t < 59.0; sphere.position.set(0, 1.6, 0); sphere.scale.setScalar(Math.max(1e-3, sramp(t, 57.85, 58.15) * (1 - toTorus)));
  torus.visible = t > 58.5 && t < 61.6; torus.position.set(0, 1.6, 0); torus.rotation.set(rotX * 1.5, rotY, 0); torus.scale.setScalar(Math.max(1e-3, sramp(t, 58.65, 58.95) * (1 - shrink)));

  // nodes rise 59.25–60.2 and link to the torus; then become the tower blocks
  const wp = wires.geometry.attributes.position.array; let w = 0;
  for (let i = 0; i < NN; i++) { const d = nodeData[i], u = expoOut(ramp(t, d.t0, d.t0 + 0.7)), gone = sramp(t, 61.1, 61.4);
    const s = Math.max(1e-3, u * (1 - gone)), y = lerp(-1, d.y, u) + Math.sin(t * 1.3 + i) * 0.15;
    m4.compose(sc.set(d.x, y, d.z), q.identity(), V(s, s, s)); nodes.setMatrixAt(i, m4);
    const link = sramp(t, d.t0 + 0.4, d.t0 + 0.9) * (1 - gone);
    wp[w++] = d.x; wp[w++] = y; wp[w++] = d.z; wp[w++] = lerp(d.x, 0, link); wp[w++] = lerp(y, 1.6, link); wp[w++] = lerp(d.z, 0, link); }
  nodes.instanceMatrix.needsUpdate = true; nodes.visible = t > 59.2 && t < 61.5;

  // tower → tangle → collapse
  const tpos = []; let tv = false;
  for (let i = 0; i < NT; i++) { const d = towerData[i], nd = nodeData[d.node];
    const t0 = 61.15 + d.lv * 0.055, u = smooth(ramp(t, t0, t0 + 0.6));
    let x = lerp(nd.x, d.tx, u), y = lerp(nd.y, d.ty, u) + Math.sin(u * Math.PI) * 2.5, z = lerp(nd.z, d.tz, u);
    const ch = smooth(ramp(t, 65.6 + (i % 20) * 0.012, 66.4 + (i % 20) * 0.012));
    if (ch > 0) { const a = d.ph + d.w * (t - 65.6) * 1.6; const cx = d.R * Math.cos(a), cz = d.R * Math.sin(a), cy = 7 + d.yy + Math.sin(a * 1.7) * 2;
      x = lerp(x, cx, ch); y = lerp(y, cy, ch); z = lerp(z, cz, ch); }
    const col = smooth(ramp(t, 69.45, 69.85)); x = lerp(x, 0, col); y = lerp(y, 1.6, col); z = lerp(z, 0, col);
    const s = Math.max(1e-3, sramp(t, t0 - 0.05, t0 + 0.15) * (1 - sramp(t, 69.7, 69.9)));
    q.setFromAxisAngle(d.ax, ch * (t - 65.6) * d.w * 2.5); m4.compose(sc.set(x, y, z), q, V(s, s, s)); tower.setMatrixAt(i, m4); tpos.push(x, y, z); }
  tower.instanceMatrix.needsUpdate = true; tv = t > 61.1 && t < 69.95; tower.visible = tv;
  const tangle = sramp(t, 65.4, 66.0) * (1 - sramp(t, 69.4, 69.7));
  for (let i = 0; i < NT; i++) { const j = (i * 37 + 11) % NT; const k = tangle;
    wp[w++] = tpos[i * 3]; wp[w++] = tpos[i * 3 + 1]; wp[w++] = tpos[i * 3 + 2];
    wp[w++] = lerp(tpos[i * 3], tpos[j * 3], k); wp[w++] = lerp(tpos[i * 3 + 1], tpos[j * 3 + 1], k); wp[w++] = lerp(tpos[i * 3 + 2], tpos[j * 3 + 2], k); }
  wires.geometry.attributes.position.needsUpdate = true; wires.visible = (t > 59.3 && t < 61.5) || (tangle > 0.01);
  wires.material.color.setRGB(tangle > 0.01 ? 1.4 : 0.9, tangle > 0.01 ? 0.7 : 0.8, tangle > 0.01 ? 0.5 : 1.4);

  // the simple sphere + click bounce (click at 71.6)
  const tc = t - 71.6, bounce = tc > 0 ? Math.abs(Math.sin(tc * 5.2)) * 1.6 * Math.exp(-tc * 1.6) : 0;
  const squash = tc > 0 && tc < 0.12 ? 1 - Math.sin((tc / 0.12) * Math.PI) * 0.22 : 1;
  ball.visible = t > 69.7; const bs = expoOut(ramp(t, 69.8, 70.3)) * (1 - sramp(t, 77.8, 78.4) * 0.6);
  ball.position.set(0, 1.5 * squash * bs + bounce + heightAt(0, 0, t, 0) * 0.6, 0); ball.scale.set(bs / Math.sqrt(squash), Math.max(1e-3, bs * squash), bs / Math.sqrt(squash));
  ball.material.emissiveIntensity = tc > 0 ? 0.9 * Math.exp(-tc * 1.5) : 0;

  // people rise as the ripple reaches them; arcs; pulses; questions flare; experiment shuffles colours
  const pp = arcs.geometry.attributes.position.array, pu = pulses.geometry.attributes.position.array, P = [];
  for (let i = 0; i < NP; i++) { const d = peopleData[i], tr = 71.6 + d.r / 4.1, u = expoOut(ramp(t, tr, tr + 0.6));
    const flare = d.q ? 1 + 0.7 * win(t, 75.9, 76.1, 76.4, 76.8) : 1, s = Math.max(1e-3, u * flare);
    const y = lerp(-0.5, 0.9 + (d.r > 9 ? 0.4 : 0), u) + heightAt(d.x, d.z, t, 0); P.push(y);
    m4.compose(sc.set(d.x, y, d.z), q.identity(), V(s, s, s)); people.setMatrixAt(i, m4);
    people.setColorAt(i, COLS[t > 77.6 + (i % 10) * 0.04 ? d.c2 : d.c]); } // set every frame: frames render out of order
  people.instanceMatrix.needsUpdate = true; if (people.instanceColor) people.instanceColor.needsUpdate = true; people.visible = t > 72.0;
  let ap = 0;
  arcData.forEach((a, k) => { const A = peopleData[a.a], B = peopleData[a.b], ya = P[a.a], yb = P[a.b], prog = sramp(t, a.t0, a.t0 + 0.8), lift = 1.5 + 0.15 * Math.hypot(A.x - B.x, A.z - B.z);
    const pt = (u) => { const uu = u * prog; const mx = (A.x + B.x) / 2, mz = (A.z + B.z) / 2, my = (ya + yb) / 2 + lift; const o = 1 - uu;
      return [o * o * A.x + 2 * o * uu * mx + uu * uu * B.x, o * o * ya + 2 * o * uu * my + uu * uu * yb, o * o * A.z + 2 * o * uu * mz + uu * uu * B.z]; };
    for (let j = 0; j < 16; j++) { const p0 = pt(j / 16), p1 = pt((j + 1) / 16); pp.set(p0, ap); pp.set(p1, ap + 3); ap += 6; }
    const f = ((t - 74.9) * a.sp + a.ph) % 1; const pq = t > 74.9 ? pt(f) : [0, -50, 0]; pu.set(pq, k * 3); });
  arcs.geometry.attributes.position.needsUpdate = true; pulses.geometry.attributes.position.needsUpdate = true; arcs.visible = t > 73.3; pulses.visible = t > 74.9;

  const v = track(CAM, t); cam.position.set(v[0], v[1], v[2]); cam.lookAt(v[3], v[4], v[5]);
  ctx.bloom.strength = 0.85;
  return { scene, cam };
}
export const camera = () => cam;
