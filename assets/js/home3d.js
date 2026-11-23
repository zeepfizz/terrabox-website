// TerraBox 3D home: one WebGL scene behind the page, driven by scroll.
// The customer's box (the TerraBox cube) is sized by the calculator and travels the route:
// studio (hero, calculator) -> Miami sign -> store -> warehouse -> flight -> customs -> door -> prices -> address -> rules -> arrival.
// Prices come from TB.quote (calculator.js). Without WebGL the page keeps its plain layout (see home3d.css).
import * as THREE from '../vendor/three.module.min.js';

const C = { deep: 0x0a1a4d, navy: 0x15369c, blue: 0x228ecf, cyan: 0x4dd1f3, white: 0xffffff, pale: 0xd9e1f5, ground: 0x0d2263, red: 0xe5484d };
const FONT = '"Instrument Sans", system-ui, sans-serif';
const TB = window.TB || {};
const LOCKER = TB.lockerExample || 'TB-300';
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

function start() {
  const canvas = document.getElementById('scene3d');
  if (!canvas) return;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' }); }
  catch (e) { return; }
  document.documentElement.classList.add('gl');

  const small = () => innerWidth < 900;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small() ? 1.5 : 2));
  renderer.setClearColor(C.deep);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(C.deep, 16, 58);
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 200);

  // ---------------------------------------------------------------- light
  scene.add(new THREE.HemisphereLight(0xdfe9ff, 0x0a1a4d, 0.95));
  const sun = new THREE.DirectionalLight(0xffffff, 2.3);
  sun.castShadow = true;
  sun.shadow.mapSize.set(small() ? 1024 : 2048, small() ? 1024 : 2048);
  const sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 50;
  sun.shadow.bias = -0.0005; sun.shadow.normalBias = 0.03;
  scene.add(sun, sun.target);
  const rim = new THREE.DirectionalLight(0x4dd1f3, 1.1); rim.position.set(-6, 4, -8); scene.add(rim);

  // ---------------------------------------------------------------- helpers
  const mats = {};
  const mat = (color, o) => { const k = color + JSON.stringify(o || {}); return mats[k] || (mats[k] = new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness: 0, ...o })); };
  function mesh(geo, color, x, y, z, o) {
    const m = new THREE.Mesh(geo, typeof color === 'number' ? mat(color, o && o.mat) : color);
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    if (o && o.rot) m.rotation.set(o.rot[0], o.rot[1], o.rot[2]);
    return m;
  }
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  function canvasTex(w, h, draw) {
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const redraw = () => { const g = cv.getContext('2d'); g.clearRect(0, 0, w, h); draw(g, w, h); tex.needsUpdate = true; };
    redraw();
    return { tex, redraw };
  }
  const hex = n => '#' + n.toString(16).padStart(6, '0');
  function sign(lines, w, h, o) {
    o = o || {};
    const t = canvasTex(1024, Math.round(1024 * h / w), (g, W, H) => {
      g.fillStyle = hex(o.bg == null ? C.white : o.bg); g.fillRect(0, 0, W, H);
      g.fillStyle = hex(o.fg == null ? C.deep : o.fg); g.textAlign = 'center'; g.textBaseline = 'middle';
      lines.forEach((l, i) => { const size = (l.size || 0.4) * H; g.font = (l.weight || 700) + ' ' + size + 'px ' + FONT; g.fillText(l.text, W / 2, H * (l.y == null ? (i + 1) / (lines.length + 1) : l.y)); });
    });
    signs.push(t);
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: t.tex, roughness: 0.6 }));
    m.castShadow = true;
    return m;
  }
  const signs = [];

  // ---------------------------------------------------------------- the TerraBox box
  // Faces follow the logo: cyan top, blue side with the stacked bands, navy front carrying the label.
  const BW = 1.7, BH = 1.3, BD = 1.4;
  function makeBox(drawLabel) {
    const top = canvasTex(512, 420, (g, W, H) => {
      g.fillStyle = hex(C.cyan); g.fillRect(0, 0, W, H);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(0, H * 0.4, W, H * 0.2);
    });
    const side = () => canvasTex(512, 480, (g, W, H) => {
      g.fillStyle = hex(C.blue); g.fillRect(0, 0, W, H);
      g.fillStyle = hex(C.cyan); for (let i = 0; i < 3; i++) g.fillRect(0, H * (0.5 + i * 0.15), W, H * 0.075);
      g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(W * 0.4, 0, W * 0.2, H * 0.16);
    });
    const front = canvasTex(1024, Math.round(1024 * BH / BW), (g, W, H) => {
      g.fillStyle = hex(C.navy); g.fillRect(0, 0, W, H);
      const lx = W * 0.09, ly = H * 0.14, lw = W * 0.82, lh = H * 0.72;
      g.fillStyle = '#fff'; g.fillRect(lx, ly, lw, lh);
      g.save(); g.translate(lx, ly); drawLabel(g, lw, lh); g.restore();
    });
    const s1 = side(), s2 = side();
    const m = (t, o) => new THREE.MeshStandardMaterial({ map: t ? t.tex : null, roughness: 0.72, ...o });
    const body = new THREE.Mesh(box(BW, BH, BD), [m(s1), m(s2), m(top), m(null, { color: C.deep }), m(front), m(null, { color: C.navy })]);
    body.castShadow = true; body.receiveShadow = true;
    body.position.y = BH / 2;
    const group = new THREE.Group(); group.add(body);
    return { group, front };
  }

  const label = { mode: 'price', price: 'US$30', lb: '7 lb', tax: 'Cero impuestos', warn: false };
  function drawWordmark(g, x, y, s) {
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    g.fillStyle = hex(C.navy); g.font = '700 ' + s + 'px ' + FONT; g.fillText('terrabox', x, y);
    const w = g.measureText('terrabox').width;
    g.fillStyle = hex(C.blue); g.font = '500 ' + s * 0.5 + 'px ' + FONT; g.fillText('CARGO', x + w + s * 0.12, y);
  }
  function drawHeroLabel(g, w, h) {
    drawWordmark(g, w * 0.06, h * 0.2, h * 0.13);
    g.fillStyle = hex(C.deep); g.fillRect(w * 0.06, h * 0.27, w * 0.88, h * 0.018);
    g.textAlign = 'left'; g.textBaseline = 'alphabetic';
    if (label.mode === 'address') {
      g.fillStyle = hex(C.deep); g.font = '500 ' + h * 0.09 + 'px ' + FONT; g.fillText('Full name', w * 0.06, h * 0.43);
      let ns = h * 0.17; g.font = '700 ' + ns + 'px ' + FONT; while (g.measureText('Tu nombre ' + LOCKER).width > w * 0.88 && ns > 8) { ns *= 0.95; g.font = '700 ' + ns + 'px ' + FONT; } g.fillText('Tu nombre ' + LOCKER, w * 0.06, h * 0.62);
      g.font = '500 ' + h * 0.1 + 'px ' + FONT; g.fillText('Miami, FL · Estados Unidos', w * 0.06, h * 0.78);
      g.fillStyle = hex(C.deep); let x = w * 0.06; const bars = [3, 1, 4, 1, 2, 1, 5, 1, 3, 2, 1, 4, 1, 2, 3, 1, 5, 1, 2, 1, 4, 2, 1, 3];
      bars.forEach((b, i) => { if (i % 2 === 0) g.fillRect(x, h * 0.84, b * w * 0.006, h * 0.1); x += b * w * 0.006 + w * 0.004; });
    } else {
      // price and weight share one line; shrink both if they would not fit the label
      let ps = h * 0.36; g.fillStyle = hex(C.deep);
      const fit = () => { g.font = '700 ' + ps + 'px ' + FONT; const a = g.measureText(label.price).width; g.font = '600 ' + ps * 0.42 + 'px ' + FONT; return [a, g.measureText(label.lb).width]; };
      let [pw, lw] = fit();
      while (pw + lw + w * 0.04 > w * 0.88 && ps > h * 0.16) { ps *= 0.94; [pw, lw] = fit(); }
      g.font = '700 ' + ps + 'px ' + FONT; g.fillText(label.price, w * 0.055, h * 0.66);
      g.font = '600 ' + ps * 0.42 + 'px ' + FONT; g.fillText(label.lb, w * 0.055 + pw + w * 0.04, h * 0.66);
      g.fillStyle = hex(label.warn ? 0x8a4b00 : C.navy); g.font = '600 ' + h * 0.11 + 'px ' + FONT; g.fillText(label.tax, w * 0.06, h * 0.88);
    }
  }
  const hero = makeBox(drawHeroLabel);
  scene.add(hero.group);

  // ---------------------------------------------------------------- ground and drifting boxes
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(600, 160), new THREE.MeshStandardMaterial({ color: C.ground, roughness: 1 }));
  ground.rotation.x = -Math.PI / 2; ground.position.set(70, 0, -20); ground.receiveShadow = true; scene.add(ground);

  const N = small() ? 70 : 150;
  const drift = new THREE.InstancedMesh(box(1, 1, 1), new THREE.MeshStandardMaterial({ roughness: 0.8 }), N);
  const dz = [], dummy = new THREE.Object3D(), col = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const s = 0.14 + Math.random() * 0.34;
    dz.push({ x: -14 + Math.random() * 170, y: 1.5 + Math.random() * 11, z: -5 - Math.random() * 26, s, r: Math.random() * 6.28, v: 0.15 + Math.random() * 0.4, p: Math.random() * 6.28 });
    drift.setColorAt(i, col.set([C.cyan, C.blue, C.navy, C.blue][i % 4]));
  }
  drift.instanceColor.needsUpdate = true; scene.add(drift);

  // ---------------------------------------------------------------- the route world
  const RX = [20, 35, 50, 65, 80];              // sign, store, warehouse, flight, door
  const world = new THREE.Group(); scene.add(world);
  const add = (...m) => { m.forEach(x => world.add(x)); };

  // dotted path on the ground
  const dotGeo = new THREE.CylinderGeometry(0.09, 0.09, 0.02, 12), dots = [];
  for (let x = 8; x <= 92; x += 0.9) dots.push(x);
  const dotMesh = new THREE.InstancedMesh(dotGeo, new THREE.MeshBasicMaterial({ color: C.cyan, transparent: true, opacity: 0.55 }), dots.length);
  dots.forEach((x, i) => { dummy.position.set(x, 0.012, 1.25); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix(); dotMesh.setMatrixAt(i, dummy.matrix); });
  add(dotMesh);

  // 1. Miami: a pin and the address sign
  {
    const x = RX[0], z = -2.4;
    add(mesh(new THREE.CylinderGeometry(0.07, 0.07, 3.2, 12), C.pale, x - 1.6, 1.6, z));
    const s = sign([{ text: 'Miami, FL', size: 0.34, y: 0.34 }, { text: LOCKER, size: 0.3, weight: 600, y: 0.72 }], 2.6, 1.3, { bg: C.white, fg: C.deep });
    s.position.set(x - 0.2, 2.6, z + 0.06); add(s);
    add(mesh(box(2.7, 1.4, 0.1), C.navy, x - 0.2, 2.6, z));
    const pin = new THREE.Group();
    pin.add(mesh(new THREE.SphereGeometry(0.55, 24, 16), C.cyan, 0, 1.75, 0), mesh(new THREE.ConeGeometry(0.42, 1.1, 24), C.cyan, 0, 0.72, 0, { rot: [Math.PI, 0, 0] }), mesh(new THREE.SphereGeometry(0.2, 16, 12), C.white, 0, 1.75, 0.42));
    pin.position.set(x + 2.3, 0.25, z + 0.4); add(pin);
    add(mesh(new THREE.CylinderGeometry(0.75, 0.75, 0.08, 32), C.navy, x + 2.3, 0.04, z + 0.4));
  }
  // 2. The store
  {
    const x = RX[1], z = -2.6;
    add(mesh(box(4.2, 2.6, 1.6), C.pale, x, 1.3, z));
    add(mesh(box(4.4, 0.25, 1.8), C.navy, x, 2.72, z));
    for (let i = 0; i < 6; i++) add(mesh(box(0.7, 0.12, 0.9), i % 2 ? C.white : C.cyan, x - 1.75 + i * 0.7, 1.95, z + 1.15, { rot: [0.5, 0, 0] }));
    add(mesh(box(0.9, 1.5, 0.08), C.navy, x - 1.2, 0.75, z + 0.82));
    add(mesh(box(2.0, 1.0, 0.08), C.blue, x + 0.8, 1.0, z + 0.82, { mat: { roughness: 0.25, metalness: 0.1 } }));
    const bag = new THREE.Group();
    bag.add(mesh(box(0.7, 0.8, 0.34), C.cyan, 0, 0.4, 0), mesh(new THREE.TorusGeometry(0.2, 0.035, 8, 20, Math.PI), C.deep, 0, 0.8, 0));
    bag.position.set(x + 2.9, 0, z + 1.6); bag.rotation.y = -0.4; add(bag);
    const bag2 = bag.clone(); bag2.scale.setScalar(0.7); bag2.position.set(x + 3.6, 0, z + 2.0); bag2.rotation.y = 0.3; add(bag2);
  }
  // 3. The warehouse in Miami
  {
    const x = RX[2], z = -3.2;
    add(mesh(box(6.4, 3.0, 2.4), C.pale, x, 1.5, z));
    add(mesh(box(6.7, 0.3, 2.7), C.navy, x, 3.15, z));
    add(mesh(box(2.2, 2.0, 0.08), C.blue, x - 1.6, 1.0, z + 1.22));
    for (let i = 0; i < 5; i++) add(mesh(box(2.2, 0.04, 0.1), C.navy, x - 1.6, 0.35 + i * 0.4, z + 1.25));
    const s = sign([{ text: 'terrabox', size: 0.5, y: 0.42 }, { text: 'Bodega Miami', size: 0.24, weight: 500, y: 0.8 }], 2.6, 1.1, { bg: C.navy, fg: C.white });
    s.position.set(x + 1.6, 2.1, z + 1.23); add(s);
    // a rack of parcels beside it
    const rx = x + 4.9, rz = z + 1.2;
    for (let l = 0; l < 3; l++) {
      add(mesh(box(2.4, 0.07, 0.8), C.pale, rx, 0.5 + l * 0.85, rz));
      for (let i = 0; i < 3; i++) { const w = 0.45 + ((i + l) % 3) * 0.1; add(mesh(box(w, 0.42 + (i % 2) * 0.12, 0.5), [C.cyan, C.blue, C.navy][(i + l) % 3], rx - 0.75 + i * 0.75, 0.76 + l * 0.85 + (i % 2) * 0.06, rz)); }
    }
    [-1.15, 1.15].forEach(o => add(mesh(box(0.08, 2.6, 0.8), C.pale, rx + o, 1.3, rz)));
  }
  // 4. The plane (flies with the box) and the customs gate
  const plane = new THREE.Group();
  {
    const white = mat(C.white, { roughness: 0.4 });
    const fus = new THREE.Mesh(new THREE.CapsuleGeometry(0.5, 3.6, 8, 20), white); fus.rotation.z = Math.PI / 2; fus.castShadow = true; plane.add(fus);
    plane.add(mesh(box(1.1, 0.08, 5.2), white, -0.1, -0.1, 0));
    plane.add(mesh(box(0.7, 0.07, 2.0), white, -2.0, 0.15, 0));
    plane.add(mesh(box(0.9, 1.1, 0.08), C.cyan, -2.05, 0.65, 0, { rot: [0, 0, -0.35] }));
    [-1.3, 1.3].forEach(z => { const e = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16), mat(C.navy)); e.rotation.z = Math.PI / 2; e.position.set(0.25, -0.35, z); e.castShadow = true; plane.add(e); });
    for (let i = 0; i < 7; i++) plane.add(mesh(box(0.16, 0.14, 1.02), C.navy, 1.3 - i * 0.42, 0.14, 0));
    plane.add(mesh(box(0.5, 0.2, 0.8), C.navy, 2.05, 0.12, 0));
    plane.visible = false; scene.add(plane);

    const x = 73.5, z = 0;
    add(mesh(box(0.35, 3.2, 0.35), C.pale, x, 1.6, z - 1.9), mesh(box(0.35, 3.2, 0.35), C.pale, x, 1.6, z + 2.6), mesh(box(0.45, 0.5, 5.0), C.navy, x, 3.35, z + 0.35));
    const s = sign([{ text: 'Aduana', size: 0.56, y: 0.52 }], 2.4, 0.42, { bg: C.navy, fg: C.white });
    s.rotation.y = -Math.PI / 2; s.position.set(x - 0.24, 3.35, z + 0.35); add(s);
    const ok = mesh(new THREE.TorusGeometry(0.34, 0.07, 10, 28), C.cyan, x - 0.3, 2.45, z + 2.6, { rot: [0, Math.PI / 2, 0], mat: { emissive: C.cyan, emissiveIntensity: 0.7 } }); add(ok);
  }
  // 5. The door (also reused for the arrival)
  function house(x, z) {
    const g = new THREE.Group();
    g.add(mesh(box(5.2, 3.4, 0.5), C.pale, 0, 1.7, 0));
    g.add(mesh(box(1.25, 2.3, 0.14), C.navy, -0.2, 1.15, 0.3));
    g.add(mesh(new THREE.SphereGeometry(0.07, 12, 8), C.cyan, 0.25, 1.1, 0.4));
    g.add(mesh(box(1.2, 1.2, 0.1), C.cyan, 1.65, 1.9, 0.28, { mat: { emissive: C.cyan, emissiveIntensity: 0.45, roughness: 0.3 } }));
    g.add(mesh(box(0.06, 1.2, 0.14), C.pale, 1.65, 1.9, 0.3), mesh(box(1.2, 0.06, 0.14), C.pale, 1.65, 1.9, 0.3));
    g.add(mesh(box(5.6, 0.3, 1.3), C.navy, 0, 3.5, 0.3));
    g.add(mesh(box(2.2, 0.12, 1.4), C.pale, -0.2, 0.06, 1.0));
    g.add(mesh(box(1.5, 0.04, 0.8), C.cyan, -0.2, 0.14, 1.1));
    g.add(mesh(box(0.5, 0.32, 0.08), C.navy, -1.25, 2.0, 0.3));
    g.position.set(x, 0, z);
    return g;
  }
  add(house(RX[4] + 0.2, -1.9));
  const END_X = 140;
  add(house(END_X + 0.2, -1.9));

  // price boxes (the public Colombia prices from config.js: courier minimum, extra pound, tax-free declared value)
  const PX = 104;
  const CO = TB.pricing.destinations.CO.types;
  const priceBoxes = [
    [TB.money(CO.courier.min), 'hasta ' + Math.floor(CO.courier.min / CO.courier.perLb) + ' libras', 0.74, -2.2],
    ['+' + TB.money(CO.courier.perLb), 'cada libra adicional', 1, -0.1],
    [TB.money(TB.pricing.taxFreeUpTo), 'declarado sin impuestos', 1.24, 2.5]
  ].map(([a, b, s, dx]) => {
    const bx = makeBox((g, w, h) => {
      drawWordmark(g, w * 0.06, h * 0.2, h * 0.13);
      g.fillStyle = hex(C.deep); g.fillRect(w * 0.06, h * 0.27, w * 0.88, h * 0.018);
      g.textAlign = 'left'; g.textBaseline = 'alphabetic';
      g.font = '700 ' + h * 0.38 + 'px ' + FONT; g.fillText(a, w * 0.055, h * 0.68);
      g.fillStyle = hex(C.navy); g.font = '600 ' + h * 0.12 + 'px ' + FONT; g.fillText(b, w * 0.06, h * 0.88);
    });
    bx.group.position.set(PX + dx, 0, 0); bx.group.rotation.y = -0.38; bx.s = s; bx.group.scale.setScalar(0.001);
    scene.add(bx.group); return bx;
  });

  // "cannot travel" ring around the box
  const ring = new THREE.Group();
  ring.add(new THREE.Mesh(new THREE.TorusGeometry(1.35, 0.1, 14, 64), mat(C.red, { emissive: C.red, emissiveIntensity: 0.35 })));
  const bar = new THREE.Mesh(box(2.7, 0.18, 0.18), mat(C.red, { emissive: C.red, emissiveIntensity: 0.35 })); bar.rotation.z = -Math.PI / 4; ring.add(bar);
  ring.scale.setScalar(0.001); scene.add(ring);

  // ---------------------------------------------------------------- states
  // bp/br/bs: box position, rotation, scale. cp/ct: camera position and target. f: where the scene centre sits on screen (x, y fractions).
  const DX = 122;                                   // address / rules studio
  const S = {
    hero:       { bp: [0, 0.35, 0], br: [0.12, -0.62, 0.04], bs: 1.25, cp: [0, 2.7, 9.2], ct: [0, 1.25, 0], f: [0.73, 0.5], pb: 0, ring: 0, lab: 0, fly: 0, m: 1 },
    caja:       { bp: [0, 0, 0], br: [0, -0.34, 0], bs: 1.1, cp: [0.4, 2.0, 8.0], ct: [0, 0.95, 0], f: [0.74, 0.5], pb: 0, ring: 0, lab: 0, fly: 0, m: 1 },
    precios:    { bp: [PX - 8, 0, 0.6], br: [0, -0.3, 0], bs: 0.001, cp: [PX + 0.6, 3.4, 15.5], ct: [PX + 0.2, 1.0, 0], f: [0.72, 0.52], pb: 1, ring: 0, lab: 0, fly: 0, m: 1.7 },
    direccion:  { bp: [DX, 0.25, 0], br: [0.05, 0.24, 0], bs: 1.4, cp: [DX + 0.8, 1.9, 8.2], ct: [DX, 1.2, 0], f: [0.27, 0.52], pb: 0, ring: 0, lab: 1, fly: 0, m: 1 },
    prohibidos: { bp: [DX, 0, 0], br: [0, -0.5, 0], bs: 1.0, cp: [DX, 5.6, 9.6], ct: [DX, 0.75, 0], f: [0.85, 0.5], pb: 0, ring: 1, lab: 0, fly: 0, m: 1.15 },
    cierre:     { bp: [END_X, 0.16, -0.75], br: [0, -0.22, 0], bs: 0.8, cp: [END_X + 0.8, 1.9, 8.6], ct: [END_X + 0.2, 1.5, -1], f: [0.72, 0.5], pb: 0, ring: 0, lab: 0, fly: 0, m: 1.25 }
  };
  // The route: u 0..1 from the Miami sign to the door. The box flies between the warehouse and the door.
  function routeState(u) {
    const x = RX[0] + (RX[4] - 0.2 - RX[0]) * u;
    const fl = Math.max(0, Math.min(1, (x - 54.5) / (71 - 54.5)));
    const arc = Math.sin(Math.PI * fl);
    const y = 4.6 * arc;
    const door = Math.max(0, (x - 76) / 3.8);
    return {
      bp: [x, y, 1.25 - 2.0 * door * door], br: [0.1 * arc, -0.42 + 0.25 * Math.sin(u * 9), -0.16 * Math.cos(Math.PI * fl) * (fl > 0 && fl < 1 ? 1 : 0)], bs: 0.8,
      cp: [x + 2.6, 3.7 + y * 0.5, 15.5 + arc * 2.5], ct: [x + 0.9, 1.7 + y * 0.7, -1.2], f: [0.73, 0.54], pb: 0, ring: 0, lab: 0, fly: fl > 0.02 && fl < 0.98 ? Math.min(1, arc * 3) : 0, m: 1
    };
  }
  const keys = ['bp', 'br', 'cp', 'ct', 'f'];
  const mix = (a, b, t) => { const o = {}; for (const k in a) o[k] = keys.includes(k) ? a[k].map((v, i) => v + (b[k][i] - v) * t) : a[k] + (b[k] - a[k]) * t; return o; };
  const ease = t => t * t * (3 - 2 * t);

  // ---------------------------------------------------------------- anchors from the page layout
  const ruta = document.getElementById('ruta');
  const steps = ruta ? Array.from(ruta.querySelectorAll('.ruta__step')) : [];
  const navs = ruta ? Array.from(ruta.querySelectorAll('.ruta__nav li')) : [];
  let anchors = [], vh = innerHeight, rutaRange = [0, 1];
  function measure() {
    vh = innerHeight; anchors = [];
    const top = el => el.getBoundingClientRect().top + scrollY;
    document.querySelectorAll('[data-scene]').forEach(el => {
      const st = S[el.dataset.scene]; if (!st) return;
      const t = top(el), h = el.offsetHeight;
      anchors.push({ y: t + Math.min(h, vh) / 2, s: st });
      if (h > vh * 1.15) anchors.push({ y: t + h - vh / 2, s: st });
    });
    if (ruta) {
      const t = top(ruta), h = ruta.offsetHeight, y0 = t + vh / 2, y1 = t + h - vh / 2;
      rutaRange = [y0, y1];
      for (let i = 0; i <= 48; i++) anchors.push({ y: y0 + (y1 - y0) * i / 48, s: routeState(i / 48), r: true });
    }
    anchors.sort((a, b) => a.y - b.y);
  }
  function targetAt(c) {
    if (!anchors.length) return S.hero;
    if (c <= anchors[0].y) return anchors[0].s;
    for (let i = 0; i < anchors.length - 1; i++) {
      const a = anchors[i], b = anchors[i + 1];
      if (c <= b.y) { const t = (c - a.y) / Math.max(1, b.y - a.y); return mix(a.s, b.s, a.r && b.r ? t : ease(t)); }
    }
    return anchors[anchors.length - 1].s;
  }

  // ---------------------------------------------------------------- calculator -> box
  let calcScale = 1;
  const form = document.querySelector('form.caja');
  function readCalc() {
    if (!form || !TB.quote) return;
    const num = s => parseFloat(String(s == null ? '' : s).replace(/\s/g, '').replace(',', '.'));
    const raw = form.querySelector('[name="peso"]').value.trim(), val = form.querySelector('[name="valor"]').value.trim();
    const dest = (form.querySelector('[name="destino"]') || {}).value, tipo = (form.querySelector('[name="tipo"]') || {}).value;
    const q = raw ? TB.quote(num(raw), val === '' ? '' : num(val), dest, tipo) : { ok: false };
    if (!q.ok) { label.price = 'US$—'; label.lb = ''; label.tax = ''; calcScale = 1; }
    else {
      calcScale = q.billedLb <= 4 ? 0.78 : q.billedLb <= 10 ? 1 : Math.min(1.42, 1.16 + (q.billedLb - 10) * 0.012);
      label.price = TB.money(q.price);
      label.lb = (Number.isInteger(q.billedLb) ? q.billedLb : q.billedLb.toFixed(1).replace('.', ',')) + ' lb';
      label.tax = q.taxFree === null ? '' : (q.taxFree ? 'Cero impuestos' : 'Paga impuestos');
      label.warn = q.taxFree === false;
    }
    hero.front.redraw();
  }
  if (form) { form.addEventListener('input', readCalc); form.addEventListener('change', readCalc); form.addEventListener('keydown', () => setTimeout(readCalc, 0)); }
  readCalc();
  if (document.fonts && document.fonts.load) {
    Promise.all([document.fonts.load('700 40px "Instrument Sans"'), document.fonts.load('500 40px "Instrument Sans"'), document.fonts.load('600 40px "Instrument Sans"')])
      .then(() => { hero.front.redraw(); priceBoxes.forEach(b => b.front.redraw()); signs.forEach(s => s.redraw()); });
  }

  // ---------------------------------------------------------------- frame loop
  let cur = null, W = 0, H = 0, mx = 0, my = 0, pmx = 0, pmy = 0, sBox = 1, t0 = performance.now(), labMode = 'price', activeStep = -1, running = true;
  function resize() {
    W = canvas.clientWidth; H = canvas.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small() ? 1.5 : 2));
    renderer.setSize(W, H, false);
    camera.aspect = W / H; camera.updateProjectionMatrix();
    measure();
  }
  addEventListener('resize', resize);
  if ('ResizeObserver' in window) new ResizeObserver(() => measure()).observe(document.getElementById('main'));
  addEventListener('pointermove', e => { if (e.pointerType === 'mouse') { mx = e.clientX / innerWidth - 0.5; my = e.clientY / innerHeight - 0.5; } }, { passive: true });
  document.addEventListener('visibilitychange', () => { running = !document.hidden; if (running) { last = performance.now(); requestAnimationFrame(frame); } });

  const v = new THREE.Vector3(), v2 = new THREE.Vector3();
  let last = performance.now();
  function frame(now) {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    const time = (now - t0) / 1000;
    const c = scrollY + vh / 2;
    if (anchors.length && scrollY > anchors[anchors.length - 1].y + vh) return;
    const tgt = targetAt(c);
    const k = reduce || !cur ? 1 : 1 - Math.exp(-dt * 5.5);
    cur = cur ? mix(cur, tgt, k) : mix(tgt, tgt, 0);
    sBox += (calcScale - sBox) * (reduce ? 1 : 1 - Math.exp(-dt * 7));
    pmx += (mx - pmx) * 0.06; pmy += (my - pmy) * 0.06;

    // route text
    if (steps.length) {
      const u = Math.max(0, Math.min(1, (c - rutaRange[0]) / Math.max(1, rutaRange[1] - rutaRange[0])));
      const idx = Math.min(steps.length - 1, Math.round(u * (steps.length - 1)));
      if (idx !== activeStep) { activeStep = idx; steps.forEach((s, i) => s.classList.toggle('is-on', i === idx)); navs.forEach((n, i) => { n.classList.toggle('is-on', i === idx); n.classList.toggle('is-done', i < idx); }); }
    }

    // the box
    const idle = reduce ? 0 : 1;
    const air = cur.bp[1] > 0.3 || cur.fly > 0.01;
    hero.group.position.set(cur.bp[0], cur.bp[1] + idle * Math.sin(time * 1.3) * 0.05 * (air ? 1 : 0.25), cur.bp[2]);
    hero.group.rotation.set(cur.br[0] + idle * Math.sin(time * 0.9) * 0.02, cur.br[1] + idle * Math.sin(time * 0.55) * 0.07 + pmx * 0.25, cur.br[2]);
    hero.group.scale.setScalar(Math.max(0.001, cur.bs * sBox));
    hero.group.visible = cur.bs > 0.02;
    const mode = cur.lab > 0.5 ? 'address' : 'price';
    if (mode !== labMode) { labMode = mode; label.mode = mode; hero.front.redraw(); }

    // plane beside the box while it flies
    plane.visible = cur.fly > 0.02;
    if (plane.visible) {
      plane.position.set(cur.bp[0] - 0.4, cur.bp[1] + 1.25, cur.bp[2] - 2.6);
      plane.rotation.set(0, 0, cur.br[2] * 1.2);
      plane.scale.setScalar(cur.fly);
    }
    // price boxes and the ring
    priceBoxes.forEach((b, i) => { const s = Math.max(0.001, b.s * Math.max(0, Math.min(1, cur.pb * 1.6 - i * 0.2))); b.group.scale.setScalar(s); b.group.visible = s > 0.01; b.group.rotation.y = -0.38 + idle * Math.sin(time * 0.5 + i) * 0.04; });
    ring.visible = cur.ring > 0.02;
    if (ring.visible) {
      ring.position.set(cur.bp[0], cur.bp[1] + BH * 0.5 * cur.bs * sBox, cur.bp[2]);
      ring.scale.setScalar(Math.max(0.001, cur.ring) * (0.85 + 0.2 * sBox));
    }

    // drifting boxes
    if (idle || !frame.once) {
      for (let i = 0; i < N; i++) {
        const d = dz[i];
        dummy.position.set(d.x, d.y + Math.sin(time * d.v + d.p) * 0.5, d.z);
        dummy.rotation.set(d.r + time * d.v * 0.3, d.r * 2 + time * d.v * 0.2, 0);
        dummy.scale.setScalar(d.s); dummy.updateMatrix(); drift.setMatrixAt(i, dummy.matrix);
      }
      drift.instanceMatrix.needsUpdate = true; frame.once = true;
    }

    // camera: portrait screens stand further back and put the subject in the top window
    const portrait = W / H < 0.9;
    const far = portrait ? 1.6 * cur.m : (W / H < 1.35 ? 1.18 : 1);
    v.set(cur.ct[0], cur.ct[1], cur.ct[2]);
    v2.set(cur.cp[0], cur.cp[1], cur.cp[2]).sub(v).multiplyScalar(far).add(v);
    camera.position.set(v2.x + pmx * 0.5, v2.y - pmy * 0.3, v2.z);
    camera.lookAt(v);
    const fx = portrait || small() ? 0.5 : cur.f[0], fy = portrait || small() ? 0.2 : cur.f[1];
    camera.setViewOffset(W, H, (0.5 - fx) * W, (0.5 - fy) * H, W, H);
    if (ring.visible) ring.quaternion.copy(camera.quaternion);

    sun.position.set(v.x + 6, v.y + 11, v.z + 8); sun.target.position.copy(v);
    renderer.render(scene, camera);
    if (!frame.shown) { frame.shown = true; canvas.classList.add('is-ready'); }
  }
  resize();
  requestAnimationFrame(frame);
  addEventListener('load', measure);
}

start();
