// HUB: the traveller's lobby. Grid floor, a swirling gate ring at centre, four live world-portals,
// and (from 72.7 s) a network of other travellers. render(t) is a pure function of t.
import { rng, clamp, prog, eOut3, eInOut, lerp, stars, glowTexture, cam } from "./util.js";

let THREE, renderer, scene, camera, U, gate, disc, portals = [], nodes, spokes, links, pulses, pulseGlow, nodeData, linkPairs;
const GATE = [0, 2.2, 0];
const P = [[-4.6, 1.2, -1], [-3.4, 4.4, -3], [3.4, 4.4, -3], [4.6, 1.2, -1]];
const RISE = [10.78, 12.24, 13.3, 14.4];
const COLORS = [0xf6b04a, 0x8f7fd6, 0xec8796, 0x7fd6c8];

export function init(T, R, ctx) {
  THREE = T; renderer = R;
  scene = new THREE.Scene(); scene.background = new THREE.Color(0x0b0d1a);
  camera = cam(THREE, 50);
  U = { uTime: { value: 0 }, uIgnite: { value: 0 },
    pink: { value: new THREE.Color(0xec8796) }, orange: { value: new THREE.Color(0xf6b04a) }, purple: { value: new THREE.Color(0x8f7fd6) } };

  // floor grid
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), new THREE.ShaderMaterial({
    uniforms: { ...U, uCam: { value: new THREE.Vector3() } },
    vertexShader: `varying vec3 vW; void main(){ vec4 w = modelMatrix*vec4(position,1.); vW=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }`,
    fragmentShader: `uniform vec3 purple; uniform vec3 pink; uniform vec3 uCam; varying vec3 vW;
      void main(){ vec2 q = vW.xz/1.6; vec2 g = abs(fract(q-.5)-.5)/fwidth(q); float l = 1.-min(min(g.x,g.y),1.);
        float d = length(vW.xz-uCam.xz); float fade = exp(-d*0.055);
        vec3 c = vec3(0.012,0.014,0.04) + purple*l*fade*0.75 + pink*l*exp(-d*0.25)*0.25;
        gl_FragColor = vec4(c,1.); }`,
  }));
  floor.rotation.x = -Math.PI / 2; scene.add(floor); U.floorCam = floor.material.uniforms.uCam;
  scene.add(stars(THREE, 3000, 300, 11, 1.7));

  // gate ring: swirling brand colours, HDR so bloom catches it
  gate = new THREE.Mesh(new THREE.TorusGeometry(2, 0.075, 24, 220), new THREE.ShaderMaterial({
    uniforms: U,
    vertexShader: `varying vec3 vP; void main(){ vP=position; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime; uniform vec3 pink, orange, purple; varying vec3 vP;
      void main(){ float a = atan(vP.y,vP.x); vec3 c = mix(pink, orange, .5+.5*sin(a*2.+uTime*1.3));
        c = mix(c, purple, .5+.5*sin(a*5.-uTime*2.1)); gl_FragColor = vec4(c*2.4,1.); }`,
  }));
  gate.position.set(...GATE); scene.add(gate);
  disc = new THREE.Mesh(new THREE.CircleGeometry(1.96, 128), new THREE.ShaderMaterial({
    uniforms: U, transparent: true, depthWrite: false,
    vertexShader: `varying vec2 vU; void main(){ vU=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.); }`,
    fragmentShader: `uniform float uTime, uIgnite; uniform vec3 pink, orange, purple; varying vec2 vU;
      void main(){ vec2 p = vU*2.-1.; float r = length(p), a = atan(p.y,p.x);
        float s = .5+.5*sin(a*7. + r*14. - uTime*2.4); float s2 = .5+.5*sin(a*3. - r*9. + uTime*1.7);
        vec3 c = purple*0.16*s*r + pink*0.10*s2*r*r;
        c += uIgnite*(mix(pink,orange,s2)*0.55*s*smoothstep(1.,.2,r) + orange*0.35*smoothstep(.5,0.,r));
        gl_FragColor = vec4(c, 0.93); }`,
  }));
  disc.position.set(GATE[0], GATE[1], GATE[2] - 0.01); scene.add(disc);

  // four world portals showing live previews (textures rendered by the root each frame)
  const halo = glowTexture(THREE);
  P.forEach((p, i) => {
    const g = new THREE.Group();
    const tex = ctx.previews[i]; // 16:9 -> crop to centre square
    const m = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
    const d = new THREE.Mesh(new THREE.CircleGeometry(1.15, 96), m);
    const uv = d.geometry.attributes.uv; for (let k = 0; k < uv.count; k++) uv.setX(k, 0.5 + (uv.getX(k) - 0.5) * (9 / 16));
    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.17, 0.045, 16, 160),
      new THREE.MeshBasicMaterial({ color: new THREE.Color(COLORS[i]).multiplyScalar(2.2), toneMapped: false }));
    const glow = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: COLORS[i], transparent: true, opacity: 0.35, depthWrite: false, blending: THREE.AdditiveBlending }));
    glow.scale.set(3.6, 3.6, 1); glow.position.z = -0.05;
    g.add(glow, d, ring); g.userData.p = p; scene.add(g); portals.push(g);
  });

  // traveller network (people): nodes, spokes to centre, links between nodes, pulses along links
  const r = rng(77); nodeData = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2 + r() * 0.2, rad = 2.7 + r() * 2.3;
    nodeData.push({ x: Math.cos(a) * rad * 1.35, y: GATE[1] + Math.sin(a) * rad * 0.8, z: 0.4 + (r() - 0.5) * 2, c: COLORS[i % 4], at: 73.3 + i * 0.07 });
  }
  const sph = new THREE.SphereGeometry(0.11, 16, 12);
  nodes = new THREE.Group();
  nodeData.forEach((n) => {
    const m = new THREE.Mesh(sph, new THREE.MeshBasicMaterial({ color: new THREE.Color(n.c).multiplyScalar(2.0), toneMapped: false }));
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: halo, color: n.c, transparent: true, opacity: 0.5, depthWrite: false, blending: THREE.AdditiveBlending }));
    s.scale.set(0.9, 0.9, 1); m.add(s); m.position.set(n.x, n.y, n.z); nodes.add(m);
  });
  scene.add(nodes);
  const sp = new Float32Array(24 * 6);
  nodeData.forEach((n, i) => { sp.set([GATE[0], GATE[1], 0.3, n.x, n.y, n.z], i * 6); });
  const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.BufferAttribute(sp, 3));
  spokes = new THREE.LineSegments(sg, new THREE.LineBasicMaterial({ color: 0xec8796, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(spokes);
  linkPairs = [];
  for (let i = 0; i < 24; i++) { linkPairs.push([i, (i + 1) % 24]); if (i % 3 === 0) linkPairs.push([i, (i + 7) % 24]); }
  const lp = new Float32Array(linkPairs.length * 6);
  linkPairs.forEach(([a, b], k) => { const A = nodeData[a], B = nodeData[b]; lp.set([A.x, A.y, A.z, B.x, B.y, B.z], k * 6); });
  const lg = new THREE.BufferGeometry(); lg.setAttribute("position", new THREE.BufferAttribute(lp, 3));
  links = new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0xf6b04a, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false }));
  scene.add(links);
  const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(new Float32Array(40 * 3), 3));
  pulses = new THREE.Points(pg, new THREE.PointsMaterial({ map: halo, size: 0.42, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(pulses);
}

// camera rig: returns [position, viewOffsetY]
function rig(t) {
  let z = 9, x = Math.sin(t * 0.13) * 0.5, y = GATE[1] + 0.25 + Math.sin(t * 0.09) * 0.2, off = 0;
  if (t > 38 && t < 44) { // be creative: wider, slow orbit, then push into the gate
    const k = eInOut(prog(t, 39.2, 40.4)); z = lerp(9, 10.5, k); x = lerp(x, Math.sin(t * 0.3) * 1.6, k);
    const push = eInOut(prog(t, 41.84, 43.1)); z = lerp(z, 6, push); x = lerp(x, 0, push);
  }
  if (t > 70 && t < 86) { z = 8.6; x = Math.sin(t * 0.18) * 1.1; }
  if (t >= 85.6) { const k = eInOut(prog(t, 85.6, 86.6)); z = lerp(8.6, 9.4, k); x = lerp(Math.sin(t * 0.18) * 1.1, Math.sin(t * 0.13) * 0.35, k); off = 110 * k; }
  // the gate must sit dead centre for portal openings T1 and T7
  return [x, y, z, off];
}

export function render(t) {
  U.uTime.value = t;
  U.uIgnite.value = clamp(prog(t, 6.3, 7.24) * 1.0) * (1 - prog(t, 10.2, 10.9)) + 0.6 * prog(t, 17.0, 17.85);
  const [x, y, z, off] = rig(t);
  camera.position.set(x, y, z); camera.lookAt(GATE[0], GATE[1], GATE[2]);
  if (off > 0.01) camera.setViewOffset(1920, 1080, 0, off, 1920, 1080); else camera.clearViewOffset();
  U.floorCam.value.copy(camera.position);
  gate.rotation.z = t * 0.05;

  portals.forEach((g, i) => {
    const k = eOut3(prog(t, RISE[i], RISE[i] + 0.9)), p = g.userData.p;
    g.visible = k > 0.001;
    g.position.set(p[0], lerp(p[1] - 7, p[1], k) + Math.sin(t * 0.7 + i) * 0.06, p[2]);
    g.scale.setScalar(lerp(0.3, 1, k)); g.lookAt(camera.position);
  });

  const nOn = t > 73.2;
  nodes.visible = spokes.visible = links.visible = pulses.visible = nOn;
  if (nOn) {
    nodes.children.forEach((m, i) => { const n = nodeData[i]; const k = eOut3(prog(t, n.at, n.at + 0.4));
      m.scale.setScalar(Math.max(0.001, k)); m.position.set(n.x, n.y + Math.sin(t * 0.8 + i) * 0.08, n.z);
      // "experiment": nodes swap colours
      if (t > 77.6 && t < 78.9) m.material.color.setHex(COLORS[(i + Math.floor((t - 77.6) * 8)) % 4]).multiplyScalar(2.0);
      else m.material.color.setHex(n.c).multiplyScalar(2.0);
    });
    spokes.geometry.setDrawRange(0, Math.floor(24 * eOut3(prog(t, 73.48, 74.9))) * 2);
    links.geometry.setDrawRange(0, Math.floor(linkPairs.length * eOut3(prog(t, 74.98, 75.9))) * 2);
    const pa = pulses.geometry.attributes.position, on = prog(t, 75.96, 76.3);
    for (let k = 0; k < 40; k++) {
      const [a, b] = linkPairs[(k * 5) % linkPairs.length], A = nodeData[a], B = nodeData[b];
      const f = ((t * 0.9 + k * 0.37) % 1 + 1) % 1;
      pa.setXYZ(k, lerp(A.x, B.x, f), lerp(A.y, B.y, f), lerp(A.z, B.z, f));
    }
    pa.needsUpdate = true; pulses.geometry.setDrawRange(0, on > 0 ? 40 : 0);
  }
  renderer.render(scene, camera);
}

// screen radius (px) of the gate at time t, so portal openings match it
export function gateRadiusPx(t) { const [x, y, z] = rig(t); const d = Math.hypot(x, y - GATE[1], z); return 2 / (Math.tan((25 * Math.PI) / 180) * d) * 540; }
