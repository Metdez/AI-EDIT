// Shots 1, 2, 17: blueprint grid world + six drafted primitives that fill in.
import { C, newScene, addLights, makeGrid, makeScan, makeSheet, placeSheet, bp, drawOn, eOut, eInOut, lin, mix, newCam, camLook } from "./common.js";

let THREE, R, scene, cam, grid, scan, sheet;
const objs = [];

export function init(T, renderer) {
  THREE = T; R = renderer;
  scene = newScene(THREE, 12, 38);
  addLights(THREE, scene);
  cam = newCam(THREE, 40);
  grid = makeGrid(THREE, 30, 1, 5);
  scene.add(grid);
  scan = makeScan(THREE, "y");
  sheet = makeSheet(THREE, 9, "y");
  scene.add(sheet);
  const geos = [
    new THREE.BoxGeometry(1.25, 1.25, 1.25),
    new THREE.IcosahedronGeometry(0.85, 1),
    new THREE.TorusGeometry(0.68, 0.26, 12, 36),
    new THREE.ConeGeometry(0.75, 1.5, 20),
    new THREE.TorusKnotGeometry(0.5, 0.17, 96, 10),
    new THREE.CylinderGeometry(0.6, 0.6, 1.35, 20),
  ];
  const cols = [C.pink, C.orange, C.purple, C.bone, C.pink, C.orange];
  geos.forEach((g, i) => {
    const o = bp(THREE, g, cols[i], scan, { flat: i === 1, angle: i === 4 ? 28 : 20 });
    scene.add(o); objs.push(o);
  });
}

export function render(t) {
  const outro = t > 60;
  const tt = outro ? t - 85.6 : t;
  // grid grows out from the centre
  const gs = outro ? 1 : Math.max(0.001, eOut(0, 1.4, t));
  grid.scale.set(gs, 1, gs);
  // fill level
  let h = outro ? 9 : mix(-1.2, 3.4, eInOut(3.25, 4.45, t));
  scan.set(h);
  placeSheet(sheet, h, h > -1.1 && h < 3.3);

  // ring radius: flung out when the logo lands (7.2), pulled together on "together" (7.9-8.7)
  let r = 3.5;
  if (!outro) r = 3.5 + 1.8 * eOut(7.05, 7.6, t) - 1.6 * eInOut(7.86, 8.75, t);
  else r = 3.4;
  objs.forEach((o, i) => {
    drawOn(o, outro ? 1 : lin(0.45 + i * 0.22, 1.55 + i * 0.22, t));
    const a = (i / objs.length) * Math.PI * 2 + tt * 0.28 + (outro ? 0.6 : 0);
    o.position.set(Math.cos(a) * r, 1.15 + 0.18 * Math.sin(tt * 1.2 + i * 1.7), Math.sin(a) * r);
    o.rotation.set(tt * 0.45 + i, tt * 0.6 + i * 2, 0);
  });

  if (!outro) {
    // hello: wide orbit; shout-out: dive low and closer
    const dive = eInOut(5.1, 6.4, t);
    const ang = 0.35 + t * 0.045;
    const rad = mix(11.5, 11.8, dive), ht = mix(4.8, 2.6, dive);
    camLook(cam, Math.sin(ang) * rad, ht, Math.cos(ang) * rad, 0, mix(0.9, 1.3, dive), 0);
  } else {
    const rise = eInOut(85.6, 93.4, t);
    const ang = 1.2 + tt * 0.06;
    const rad = mix(10.5, 12.5, rise), ht = mix(3.0, 6.5, rise);
    camLook(cam, Math.sin(ang) * rad, ht, Math.cos(ang) * rad, 0, 1.0, 0);
  }
  R.render(scene, cam);
}
