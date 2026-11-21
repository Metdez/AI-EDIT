// Shot 5 (23.4-30.4): real-world bouncing ball -> blueprint of how it works -> back to solid (in the browser frame).
import { C, newScene, addLights, makeGrid, makeScan, makeSheet, placeSheet, latLong, dotTexture, eInOut, mix, frac, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, scan, sheet, ball, wball, shadow, floor, trail, vArrow, gArrow;
const RAD = 0.6, H = 1.75, T = 1.0, VX = 0.6;
const state = (t) => {
  const s = t - 23.4, u = frac(s / T);
  return { x: -2.2 + VX * s, y: RAD + H * 4 * u * (1 - u), vy: (H * 4 * (1 - 2 * u)) / T, u };
};

function ballTexture() {
  const c = document.createElement("canvas"); c.width = 512; c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#e0762f"; x.fillRect(0, 0, 512, 256);
  for (let i = 0; i < 2600; i++) { // pebble grain from a fixed pattern
    const px = (i * 97) % 512, py = (i * 61 + (i >> 3) * 13) % 256;
    x.fillStyle = i % 2 ? "rgba(0,0,0,.08)" : "rgba(255,255,255,.06)"; x.fillRect(px, py, 2, 2);
  }
  x.strokeStyle = "#1b1410"; x.lineWidth = 7;
  x.beginPath(); x.moveTo(0, 128); x.lineTo(512, 128); x.stroke();
  x.beginPath(); x.moveTo(128, 0); x.lineTo(128, 256); x.moveTo(384, 0); x.lineTo(384, 256); x.stroke();
  x.beginPath(); x.ellipse(0, 128, 90, 140, 0, -Math.PI / 2, Math.PI / 2); x.stroke();
  x.beginPath(); x.ellipse(512, 128, 90, 140, 0, Math.PI / 2, Math.PI * 1.5); x.stroke();
  x.beginPath(); x.ellipse(256, 128, 90, 140, 0, 0, Math.PI * 2); x.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

export function init(T3, renderer) {
  THREE = T3; R = renderer;
  scene = newScene(THREE, 12, 40);
  const L = addLights(THREE, scene);
  L.key.intensity = 2.8;
  cam = newCam(THREE, 40);
  scan = makeScan(THREE, "x"); // .solid keeps x <= s (blueprint side), .wire keeps x >= s (real side)
  sheet = makeSheet(THREE, 14, "x");
  scene.add(sheet);

  floor = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), new THREE.MeshStandardMaterial({ color: 0x3a3340, roughness: 0.85, clippingPlanes: scan.wire }));
  floor.rotation.x = -Math.PI / 2;
  scene.add(floor);
  const g = makeGrid(THREE, 30, 0.5, 4, scan.solid);
  g.position.y = 0.002;
  scene.add(g);

  ball = new THREE.Mesh(new THREE.SphereGeometry(RAD, 48, 32), new THREE.MeshStandardMaterial({ map: ballTexture(), roughness: 0.62, clippingPlanes: scan.wire }));
  wball = new THREE.LineSegments(latLong(THREE, RAD, 6, 10, 32), new THREE.LineBasicMaterial({ color: C.ink, clippingPlanes: scan.solid }));
  const st = dotTexture(THREE, 64, 0.2);
  shadow = new THREE.Mesh(new THREE.CircleGeometry(0.75, 32), new THREE.MeshBasicMaterial({ color: 0x000000, alphaMap: st, transparent: true, opacity: 0.6, depthWrite: false, clippingPlanes: scan.wire }));
  shadow.rotation.x = -Math.PI / 2; shadow.position.y = 0.004;
  scene.add(ball, wball, shadow);

  const tg = new THREE.BufferGeometry();
  tg.setAttribute("position", new THREE.Float32BufferAttribute(new Float32Array(48 * 3), 3));
  trail = new THREE.Points(tg, new THREE.PointsMaterial({ color: C.ink, size: 0.07, clippingPlanes: scan.solid }));
  scene.add(trail);
  vArrow = new THREE.ArrowHelper(new THREE.Vector3(1, 0, 0), new THREE.Vector3(), 1, C.pink, 0.25, 0.16);
  gArrow = new THREE.ArrowHelper(new THREE.Vector3(0, -1, 0), new THREE.Vector3(), 1.1, C.orange, 0.25, 0.16);
  [vArrow, gArrow].forEach((a) => { a.line.material.clippingPlanes = scan.solid; a.cone.material.clippingPlanes = scan.solid; scene.add(a); });
}

export function render(t) {
  // L->R sweep into blueprint on "how it works", R->L back to solid as the browser frame lands
  const s = mix(-40, 40, eInOut(27.1, 27.75, t)) - mix(0, 80, eInOut(28.85, 29.5, t));
  scan.set(s);
  placeSheet(sheet, s, s > -8 && s < 8);

  const p = state(t);
  let sy = 1, sxz = 1;
  if (p.u < 0.05 || p.u > 0.95) { sy = 0.84; sxz = 1.09; }
  ball.position.set(p.x, p.y * sy + (1 - sy) * 0, 0);
  ball.scale.set(sxz, sy, sxz);
  ball.position.y = RAD * sy + (p.y - RAD);
  ball.rotation.z = -p.x / RAD;
  wball.position.copy(ball.position); wball.scale.copy(ball.scale); wball.rotation.copy(ball.rotation);
  shadow.position.x = p.x;
  const hh = (p.y - RAD) / H;
  shadow.scale.setScalar(1 - 0.45 * hh);
  shadow.material.opacity = 0.65 - 0.4 * hh;

  // trajectory dots: the last 1.6 s of the path
  const a = trail.geometry.attributes.position;
  for (let k = 0; k < 48; k++) { const q = state(t - k * 0.034); a.setXYZ(k, q.x, q.y, 0); }
  a.needsUpdate = true;
  const v = new THREE.Vector3(VX, p.vy, 0);
  vArrow.position.copy(ball.position);
  vArrow.setDirection(v.clone().normalize());
  vArrow.setLength(0.6 + v.length() * 0.18, 0.25, 0.16);
  gArrow.position.set(p.x, ball.position.y - RAD - 0.05, 0);

  const cx = p.x * 0.55;
  camLook(cam, cx + Math.sin(t * 0.2) * 0.3, 1.9, 6.8, cx, 1.45, 0);
  R.render(scene, cam);
}
