import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { BODIES } from './data.js';
import { initAmbientSound } from './audio.js';

/* =========================================================
   SCENE SETUP
   ========================================================= */
const container = document.getElementById('scene');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x04050c, 0.0016);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 4000);
camera.position.set(0, 40, 95);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.06;
controls.minDistance = 8;
controls.maxDistance = 320;

/* Starfield */
function makeStars(count, spread, size){
  const geo = new THREE.BufferGeometry();
  const positions = new Float32Array(count*3);
  for(let i=0;i<count;i++){
    const r = spread*(0.4+Math.random()*0.6);
    const theta = Math.random()*Math.PI*2;
    const phi = Math.acos(2*Math.random()-1);
    positions[i*3] = r*Math.sin(phi)*Math.cos(theta);
    positions[i*3+1] = r*Math.cos(phi);
    positions[i*3+2] = r*Math.sin(phi)*Math.sin(theta);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions,3));
  const mat = new THREE.PointsMaterial({ color:0xffffff, size, sizeAttenuation:true, transparent:true, opacity:0.95, fog:false });
  return new THREE.Points(geo, mat);
}
scene.add(makeStars(4600, 900, 0.75));
scene.add(makeStars(1800, 400, 1.25));

/* ---------- Procedural Milky Way backdrop ---------- */
function makeMilkyWayTexture(){
  const w = 2048, h = 1024;
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#02030a';
  ctx.fillRect(0,0,w,h);

  // soft galactic band
  const band = ctx.createLinearGradient(0, h*0.28, 0, h*0.72);
  band.addColorStop(0, 'rgba(90,80,140,0)');
  band.addColorStop(0.5, 'rgba(150,130,190,0.22)');
  band.addColorStop(1, 'rgba(90,80,140,0)');
  ctx.fillStyle = band;
  ctx.fillRect(0, h*0.2, w, h*0.6);

  // nebula blobs
  const colors = ['rgba(120,90,190,0.16)','rgba(70,110,200,0.14)','rgba(200,140,120,0.10)','rgba(90,170,190,0.12)'];
  for(let i=0;i<70;i++){
    const x = Math.random()*w;
    const y = h*0.15 + Math.random()*h*0.7;
    const r = 40 + Math.random()*220;
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    const col = colors[i%colors.length];
    g.addColorStop(0, col);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }

  // dense star dust
  for(let i=0;i<9000;i++){
    const x = Math.random()*w;
    const y = Math.random()*h;
    const bandFalloff = 1 - Math.min(1, Math.abs(y-h/2)/(h*0.42));
    if(Math.random() > 0.15 + bandFalloff*0.55) continue;
    const b = Math.random();
    ctx.fillStyle = `rgba(255,255,255,${0.15+b*0.55})`;
    const s = Math.random()<0.05 ? 1.6 : 0.7;
    ctx.fillRect(x,y,s,s);
  }
  return new THREE.CanvasTexture(c);
}
const milkyWayGeo = new THREE.SphereGeometry(1600, 48, 32);
const milkyWayMat = new THREE.MeshBasicMaterial({
  map: makeMilkyWayTexture(), side: THREE.BackSide, transparent:true, opacity:0.9, fog:false
});
const milkyWay = new THREE.Mesh(milkyWayGeo, milkyWayMat);
scene.add(milkyWay);

/* soft ambient + sun light */
scene.add(new THREE.AmbientLight(0x223, 0.35));
const sunLight = new THREE.PointLight(0xfff3d0, 5.5, 0, 0.15);
scene.add(sunLight);

/* glow sprite texture generator */
function glowTexture(colorHex){
  const c = document.createElement('canvas'); c.width=c.height=256;
  const ctx = c.getContext('2d');
  const g = ctx.createRadialGradient(128,128,0,128,128,128);
  const col = new THREE.Color(colorHex);
  g.addColorStop(0, `rgba(${col.r*255},${col.g*255},${col.b*255},0.9)`);
  g.addColorStop(0.4, `rgba(${col.r*255},${col.g*255},${col.b*255},0.35)`);
  g.addColorStop(1, `rgba(${col.r*255},${col.g*255},${col.b*255},0)`);
  ctx.fillStyle = g; ctx.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(c);
}

/* orbit ring helper */
function makeOrbitRing(radius){
  const pts = [];
  const segs = 256;
  for(let i=0;i<=segs;i++){
    const a = (i/segs)*Math.PI*2;
    pts.push(new THREE.Vector3(Math.cos(a)*radius, 0, Math.sin(a)*radius));
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color:0x8fa3c9, transparent:true, opacity:0.22 });
  return new THREE.LineLoop(geo, mat);
}

/* procedural wispy cloud texture for Earth */
function makeCloudTexture(){
  const w = 512, h = 256;
  const c = document.createElement('canvas'); c.width=w; c.height=h;
  const ctx = c.getContext('2d');
  ctx.clearRect(0,0,w,h);
  for(let i=0;i<220;i++){
    const x = Math.random()*w, y = Math.random()*h;
    const r = 8 + Math.random()*34;
    const g = ctx.createRadialGradient(x,y,0,x,y,r);
    const a = 0.12 + Math.random()*0.35;
    g.addColorStop(0, `rgba(255,255,255,${a})`);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(x,y,r,r*0.55,0,0,Math.PI*2); ctx.fill();
  }
  return new THREE.CanvasTexture(c);
}

/* group registry for interaction + animation */
const clickable = [];
const orbiters = [];   // {group, speed}
const spinners = [];   // {mesh, spinSpeed}
let bodiesByKey = {};

/* unified search/selection registry — covers sun, planets AND moons */
const registry = {};
function slug(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }

/* ---------- SUN ---------- */
const sunData = BODIES[0];
const sunGeo = new THREE.SphereGeometry(sunData.radius, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ color: sunData.color });
const sunMesh = new THREE.Mesh(sunGeo, sunMat);
sunMesh.userData.key = 'sun';
sunMesh.userData.selRadius = sunData.radius;
scene.add(sunMesh);
clickable.push(sunMesh);
spinners.push({mesh:sunMesh, spinSpeed:0.02});

const sunGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTexture(sunData.glow), transparent:true, depthWrite:false }));
sunGlow.scale.set(sunData.radius*7, sunData.radius*7, 1);
scene.add(sunGlow);
bodiesByKey['sun'] = { mesh:sunMesh, group:sunMesh };
registry['sun'] = { key:'sun', name:sunData.name, kind:'sun', sub:'Star', mesh:sunMesh, radius:sunData.radius, colorHex:sunData.color };

/* ---------- PLANETS ---------- */
const MOON_ORBIT_SPEED_BASE = 1.6;

BODIES.slice(1).forEach((p) => {
  const orbitGroup = new THREE.Group();          // rotates around sun (orbital revolution)
  scene.add(orbitGroup);
  scene.add(makeOrbitRing(p.dist));

  const tiltGroup = new THREE.Group();            // positions planet at distance
  tiltGroup.position.x = p.dist;
  orbitGroup.add(tiltGroup);

  const axisGroup = new THREE.Group();            // carries axial tilt
  axisGroup.rotation.z = THREE.MathUtils.degToRad(p.tilt > 90 ? 180 - p.tilt : p.tilt) * (p.tilt>90?-1:1);
  tiltGroup.add(axisGroup);

  const geo = new THREE.SphereGeometry(p.radius, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    color: p.color, roughness:0.75, metalness:0.05,
    emissive: new THREE.Color(p.color).multiplyScalar(0.06)
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.userData.key = p.key;
  mesh.userData.selRadius = p.radius;
  axisGroup.add(mesh);
  clickable.push(mesh);
  spinners.push({mesh, spinSpeed: 0.25 + Math.random()*0.5});
  registry[p.key] = { key:p.key, name:p.name, kind:'planet', sub:'Planet', mesh, radius:p.radius, colorHex:p.color };

  /* earth cloud layer */
  if(p.key === 'earth'){
    const cloudTex = makeCloudTexture();
    const cloudGeo = new THREE.SphereGeometry(p.radius*1.035, 48, 48);
    const cloudMat = new THREE.MeshStandardMaterial({
      map: cloudTex, transparent:true, opacity:0.75, depthWrite:false, roughness:1
    });
    const clouds = new THREE.Mesh(cloudGeo, cloudMat);
    axisGroup.add(clouds);
    spinners.push({mesh:clouds, spinSpeed: 0.4});
  }

  /* saturn ring */
  if(p.hasRing){
    const ringGeo = new THREE.RingGeometry(p.radius*1.4, p.radius*2.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({ color:0xcbb98a, side:THREE.DoubleSide, transparent:true, opacity:0.75 });
    const posAttr = ringGeo.attributes.position;
    const uv = ringGeo.attributes.uv;
    for(let i=0;i<uv.count;i++){ uv.setXY(i, posAttr.getX(i)/(p.radius*2.4)+0.5, posAttr.getY(i)/(p.radius*2.4)+0.5); }
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI/2 - 0.35;
    axisGroup.add(ring);
  }

  /* moons */
  const moonMeshes = [];
  (p.moons||[]).forEach((m, idx) => {
    const moonOrbit = new THREE.Group();
    tiltGroup.add(moonOrbit);
    const mDist = p.radius*1.9 + idx*(p.radius*0.9+0.5);
    const mRadius = Math.max(p.radius*0.14, 0.06);
    const mGeo = new THREE.SphereGeometry(mRadius, 20, 20);
    const mMat = new THREE.MeshStandardMaterial({ color:0xcfcfcf, roughness:0.9 });
    const mMesh = new THREE.Mesh(mGeo, mMat);
    mMesh.position.x = mDist;
    const moonKey = `${p.key}-${slug(m.name)}`;
    mMesh.userData.key = moonKey;
    mMesh.userData.selRadius = mRadius;
    moonOrbit.add(mMesh);
    clickable.push(mMesh);
    moonMeshes.push({ orbit:moonOrbit, speed:(MOON_ORBIT_SPEED_BASE/(idx*0.4+1)) });
    registry[moonKey] = { key:moonKey, name:m.name, kind:'moon', sub:`Moon of ${p.name}`, mesh:mMesh, radius:mRadius, colorHex:0xcfcfcf, note:m.note, parentKey:p.key, parentName:p.name };
    makeOrbitRingLocal(tiltGroup, mDist);
  });

  orbiters.push({ group:orbitGroup, speed: p.speed, dist:p.dist });
  bodiesByKey[p.key] = { mesh, group:orbitGroup, moonMeshes };
});

/* ---------- Asteroid belt (between Mars and Jupiter) ---------- */
const beltGroup = new THREE.Group();
scene.add(beltGroup);
const ASTEROID_COUNT = 1400;
const asteroidGeo = new THREE.IcosahedronGeometry(0.055, 0);
const asteroidMat = new THREE.MeshStandardMaterial({ color:0x8a7f74, roughness:1, flatShading:true });
const asteroidMesh = new THREE.InstancedMesh(asteroidGeo, asteroidMat, ASTEROID_COUNT);
const dummy = new THREE.Object3D();
const beltInner = 23.4, beltOuter = 26.6;
for(let i=0;i<ASTEROID_COUNT;i++){
  const a = Math.random()*Math.PI*2;
  const r = beltInner + Math.random()*(beltOuter-beltInner);
  const y = (Math.random()-0.5)*1.1;
  dummy.position.set(Math.cos(a)*r, y, Math.sin(a)*r);
  const s = 0.4 + Math.random()*1.6;
  dummy.scale.set(s,s,s);
  dummy.rotation.set(Math.random()*Math.PI, Math.random()*Math.PI, Math.random()*Math.PI);
  dummy.updateMatrix();
  asteroidMesh.setMatrixAt(i, dummy.matrix);
}
beltGroup.add(asteroidMesh);

function makeOrbitRingLocal(parent, radius){
  const pts = [];
  for(let i=0;i<=96;i++){ const a=(i/96)*Math.PI*2; pts.push(new THREE.Vector3(Math.cos(a)*radius,0,Math.sin(a)*radius)); }
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const mat = new THREE.LineBasicMaterial({ color:0xffffff, transparent:true, opacity:0.08 });
  const loop = new THREE.LineLoop(geo, mat);
  parent.add(loop);
}

/* =========================================================
   DOCK (bottom chip navigation, echoes the reference image)
   ========================================================= */
const dock = document.getElementById('dock');
BODIES.forEach(b => {
  const chip = document.createElement('div');
  chip.className = 'chip';
  chip.dataset.key = b.key;
  const dot = document.createElement('div');
  dot.className = 'dot';
  dot.style.background = `radial-gradient(circle at 35% 30%, #fff8, #000), #${b.color.toString(16).padStart(6,'0')}`;
  const label = document.createElement('div');
  label.className = 'label';
  label.textContent = b.name;
  chip.appendChild(dot); chip.appendChild(label);
  chip.addEventListener('click', () => selectByKey(b.key));
  dock.appendChild(chip);
});

/* =========================================================
   SEARCH — find any planet or moon by name
   ========================================================= */
const searchList = Object.values(registry);
const searchWrap = document.getElementById('search-wrap');
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');
const searchClear = document.getElementById('search-clear');

function renderResults(list){
  if(!list.length){
    searchResults.innerHTML = `<div class="result-empty">No matches in this Solar System</div>`;
    return;
  }
  searchResults.innerHTML = list.map((r,i) => {
    const hex = '#'+r.colorHex.toString(16).padStart(6,'0');
    return `<div class="result-item${i===0?' hover':''}" data-key="${r.key}">
      <div class="r-dot" style="background:radial-gradient(circle at 35% 30%, #fff8, #000), ${hex}"></div>
      <div class="r-text">
        <div class="r-name">${r.name}</div>
        <div class="r-sub">${r.sub}</div>
      </div>
    </div>`;
  }).join('');
}

function runSearch(q){
  const query = q.trim().toLowerCase();
  searchWrap.classList.toggle('has-text', query.length>0);
  const source = query ? searchList.filter(r => r.name.toLowerCase().includes(query)) : searchList;
  const sorted = query ? source.sort((a,b) => a.name.toLowerCase().indexOf(query) - b.name.toLowerCase().indexOf(query)) : source;
  renderResults(sorted.slice(0, 10));
  searchWrap.classList.add('open');
}

function closeSearchResults(){
  searchWrap.classList.remove('open');
}

searchInput.addEventListener('input', e => runSearch(e.target.value));
searchInput.addEventListener('focus', e => runSearch(e.target.value));
searchInput.addEventListener('keydown', e => {
  if(e.key === 'Escape'){ searchInput.blur(); closeSearchResults(); }
  if(e.key === 'Enter'){
    const first = searchResults.querySelector('.result-item');
    if(first) selectByKey(first.dataset.key);
    searchInput.blur();
  }
});
searchResults.addEventListener('pointerdown', e => {
  const item = e.target.closest('.result-item');
  if(item) selectByKey(item.dataset.key);
});
searchClear.addEventListener('click', () => {
  searchInput.value = '';
  searchWrap.classList.remove('has-text');
  searchInput.focus();
  runSearch('');
});
document.addEventListener('pointerdown', e => {
  if(!searchWrap.contains(e.target)) closeSearchResults();
});

/* =========================================================
   INTERACTION — raycasting for click on planets
   ========================================================= */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
renderer.domElement.addEventListener('pointerdown', (e) => {
  mouse.x = (e.clientX/window.innerWidth)*2-1;
  mouse.y = -(e.clientY/window.innerHeight)*2+1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(clickable, false);
  if(hits.length){
    selectByKey(hits[0].object.userData.key);
  }
});

function worldPosOf(key){
  const v = new THREE.Vector3();
  registry[key].mesh.getWorldPosition(v);
  return v;
}

/* focus camera on any registry entry (sun, planet, or moon) */
function focusBody(key){
  const entry = registry[key];
  if(!entry) return;
  document.querySelectorAll('.chip').forEach(c => c.classList.toggle('active', c.dataset.key===key));
  const target = worldPosOf(key);
  const dist = (entry.radius||0.3)*10 + 5;
  const dir = new THREE.Vector3(0.5,0.35,0.8).normalize();
  const camGoal = target.clone().add(dir.multiplyScalar(dist));
  animateCamera(camGoal, target);
}

/* single entry point used by clicks, dock chips, and search results */
function selectByKey(key){
  const entry = registry[key];
  if(!entry) return;
  focusBody(key);
  openPanel(key);
  triggerSelectionGlow(entry.mesh);
  closeSearchResults();
}

let camAnim = null;
function animateCamera(camGoal, lookGoal){
  camAnim = { from: camera.position.clone(), to: camGoal, lookFrom: controls.target.clone(), lookTo: lookGoal, t:0 };
}

/* =========================================================
   SELECTION GLOW — lights up the exact body that was clicked
   ========================================================= */
function ringGlowTexture(){
  const c = document.createElement('canvas'); c.width=c.height=256;
  const ctx = c.getContext('2d');
  const cx=128, cy=128;
  const g = ctx.createRadialGradient(cx,cy,0,cx,cy,128);
  g.addColorStop(0.0,'rgba(255,200,140,0)');
  g.addColorStop(0.55,'rgba(255,200,140,0)');
  g.addColorStop(0.68,'rgba(255,186,120,0.95)');
  g.addColorStop(0.78,'rgba(255,170,90,0.35)');
  g.addColorStop(1.0,'rgba(255,170,90,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,256,256);
  return new THREE.CanvasTexture(c);
}
const selGlow = new THREE.Sprite(new THREE.SpriteMaterial({
  map: ringGlowTexture(), color:0xffcf9e, transparent:true, opacity:0,
  depthWrite:false, blending:THREE.AdditiveBlending
}));
selGlow.visible = false;
scene.add(selGlow);
let selMesh = null, selRadius = 1, selT = 0;

function triggerSelectionGlow(mesh){
  selMesh = mesh;
  selRadius = mesh.userData.selRadius || 1;
  selT = 0;
  selGlow.visible = true;
}
function clearSelectionGlow(){
  selMesh = null;
  selGlow.visible = false;
}

/* =========================================================
   INFO PANEL RENDERING
   ========================================================= */
const panel = document.getElementById('info-panel');
const panelContent = document.getElementById('panel-content');

function bar(pct, color){
  return `<div class="bar"><div style="width:${pct}%;background:${color}"></div></div>`;
}

function openPanel(key){
  const entry = registry[key];
  if(entry && entry.kind === 'moon'){
    const hex = '#'+entry.colorHex.toString(16).padStart(6,'0');
    let html = `<div class="body-badge" style="background:radial-gradient(circle at 32% 28%, #fff9, ${hex} 60%); color:${hex}"></div>`;
    html += `<div class="eyebrow">Moon</div>`;
    html += `<h2>${entry.name}</h2>`;
    html += `<p class="tagline">${entry.note || ''}</p>`;
    html += `<div class="section-title">Orbits</div>`;
    html += `<div class="fact-row"><span class="fk">Parent planet</span><span class="fv">${entry.parentName}</span></div>`;
    html += `<div class="fact-row" style="border-bottom:none;"><span class="fk">Type</span><span class="fv">Natural satellite</span></div>`;
    panelContent.innerHTML = html;
    panel.classList.add('open');
    return;
  }

  const b = BODIES.find(x=>x.key===key);
  const hex = '#'+b.color.toString(16).padStart(6,'0');
  let html = `<div class="body-badge" style="background:radial-gradient(circle at 32% 28%, #fff9, ${hex} 60%); color:${hex}"></div>`;
  html += `<div class="eyebrow">${b.isSun ? 'Star' : 'Planet'}</div>`;
  html += `<h2>${b.name}</h2>`;
  html += `<p class="tagline">${b.tagline}</p>`;

  if(!b.isSun){
    html += `<div class="stat-grid">
      <div class="stat"><div class="k">Distance from Sun</div><div class="v">${b.distReal}</div></div>
      <div class="stat"><div class="k">Orbital speed</div><div class="v">${b.speed} km/s</div></div>
      <div class="stat"><div class="k">Axial tilt</div><div class="v">${b.tilt}°</div></div>
      <div class="stat"><div class="k">Orbital period</div><div class="v">${b.period}</div></div>
    </div>`;

    html += `<div class="section-title">Composition</div><div class="fact-row"><span class="fv" style="text-align:left">${b.composition}</span></div>`;

    html += `<div class="section-title">Atmosphere</div><div class="fact-row"><span class="fv" style="text-align:left">${b.atmosphere}</span></div>`;
    html += `<div class="barlabel"><span>Oxygen level</span><span>${b.oxygen}%</span></div>${bar(Math.max(b.oxygen,1.5), 'linear-gradient(90deg,#7fd8d0,#3aa0ff)')}`;

    html += `<div class="barlabel"><span>Surface water coverage</span><span>${b.water}%</span></div>${bar(Math.max(b.water,1.5), 'linear-gradient(90deg,#4fc3f7,#1565c0)')}`;
    html += `<div class="fact-row" style="border-bottom:none; padding-top:10px;"><span class="fv" style="text-align:left; color:var(--text-lo); font-weight:400;">${b.waterNote}</span></div>`;

    html += `<div class="section-title">Moons</div>`;
    if(b.moons && b.moons.length){
      html += `<div class="fact-row"><span class="fk">Has moons</span><span class="fv">Yes ✓</span></div>`;
      if(b.moonNote) html += `<div class="fact-row"><span class="fv" style="text-align:left; color:var(--text-lo);">${b.moonNote}</span></div>`;
      html += `<div class="moon-list">` + b.moons.map(m=>`<span class="moon-tag" title="${m.note}">${m.name}</span>`).join('') + `</div>`;
    } else {
      html += `<div class="fact-row"><span class="fk">Has moons</span><span class="fv">None ✕</span></div>`;
    }
  } else {
    Object.entries(b.facts).forEach(([k,v])=>{
      html += `<div class="fact-row"><span class="fk">${k}</span><span class="fv" style="text-align:right; max-width:60%;">${v}</span></div>`;
    });
  }

  panelContent.innerHTML = html;
  panel.classList.add('open');
}
document.getElementById('close-panel').addEventListener('click', ()=>{
  panel.classList.remove('open');
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  clearSelectionGlow();
});

/* =========================================================
   TRANSPORT CONTROLS
   ========================================================= */
let playing = true;
let speedMul = 1.4;
document.getElementById('speed').addEventListener('input', e => speedMul = parseFloat(e.target.value));
document.getElementById('play-pause').addEventListener('click', (e) => {
  playing = !playing;
  e.target.textContent = playing ? '⏸' : '▶';
});
document.getElementById('reset-cam').addEventListener('click', () => {
  document.querySelectorAll('.chip').forEach(c=>c.classList.remove('active'));
  clearSelectionGlow();
  animateCamera(new THREE.Vector3(0,40,95), new THREE.Vector3(0,0,0));
});



/* legend / welcome */
document.getElementById('enter-btn').addEventListener('click', () => {
  document.getElementById('welcome').classList.add('hide');
  const hint = document.getElementById('hint');
  hint.style.opacity = 1;
  setTimeout(()=>{ hint.style.opacity = 0; }, 4200);
});
document.getElementById('legend-toggle').addEventListener('click', () => {
  document.getElementById('welcome').classList.remove('hide');
});

/* =========================================================
   RESIZE
   ========================================================= */
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth/window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

/* =========================================================
   ANIMATE
   ========================================================= */
const clock = new THREE.Clock();
function animate(){
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);

  if(playing){
    const t = dt*speedMul;
    orbiters.forEach(o => { o.group.rotation.y += (t * (10/Math.sqrt(o.dist))) * 0.12; });
    spinners.forEach(s => { s.mesh.rotation.y += t*s.spinSpeed; });
    Object.values(bodiesByKey).forEach(b=>{
      (b.moonMeshes||[]).forEach(m=> m.orbit.rotation.y += t*m.speed);
    });
    beltGroup.rotation.y += t*0.045;
    milkyWay.rotation.y += t*0.002;
  }

  if(camAnim){
    camAnim.t += dt*2.2;
    const k = Math.min(camAnim.t, 1);
    const ease = 1-Math.pow(1-k,3);
    camera.position.lerpVectors(camAnim.from, camAnim.to, ease);
    controls.target.lerpVectors(camAnim.lookFrom, camAnim.lookTo, ease);
    if(k>=1) camAnim = null;
  }

  if(selMesh){
    selT += dt;
    const wp = new THREE.Vector3();
    selMesh.getWorldPosition(wp);
    selGlow.position.copy(wp);
    const pulse = Math.max(0, Math.sin(selT*5.5) * Math.exp(-selT*2.2));
    const breathe = 0.08*Math.sin(selT*1.8);
    const scale = selRadius*4.4*(1 + pulse*0.6 + breathe);
    selGlow.scale.set(scale, scale, 1);
    selGlow.material.opacity = Math.min(selT*9, 1) * (0.6 + pulse*0.4);
  }

  sunGlow.lookAt(camera.position);
  controls.update();
  renderer.render(scene, camera);
}
initAmbientSound();
animate();

/* =========================================================
   BOOT LOADER — quick premium entrance
   ========================================================= */
const loader = document.getElementById('loader');
window.addEventListener('load', () => {
  setTimeout(() => loader.classList.add('done'), 500);
});
setTimeout(() => loader.classList.add('done'), 2200); // safety fallback