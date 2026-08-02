/* 钢铁雄心4 3D v2 - 3D世界构建：地形/海洋/光照/天空/后处理 */
import * as THREE from 'three';
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

export const CELL = 4;                 // 每格世界尺寸
export const WORLD = {
  scene:null, camera:null, renderer:null, composer:null,
  tileMeshes:[], tileGroup:null, unitGroup:null, fxGroup:null,
  width:MAP_W*CELL, height:MAP_H*CELL
};
export function tileCenter(x,y){
  return new THREE.Vector3(
    x*CELL - WORLD.width/2 + CELL/2, 0,
    y*CELL - WORLD.height/2 + CELL/2);
}
export function tileHeight(t){ return T_INFO[t.ter].h; }

export function initWorld(container){
  const w = WORLD;
  w.scene = new THREE.Scene();
  w.scene.fog = new THREE.Fog(0x0e1a2a, 120, 320);

  w.camera = new THREE.PerspectiveCamera(50, container.clientWidth/container.clientHeight, 0.1, 1000);
  w.camera.position.set(0, 90, 110);
  w.camera.lookAt(0,0,0);

  w.renderer = new THREE.WebGLRenderer({antialias:true});
  w.renderer.setSize(container.clientWidth, container.clientHeight);
  w.renderer.setPixelRatio(Math.min(devicePixelRatio,2));
  w.renderer.shadowMap.enabled = true;
  w.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  w.renderer.toneMapping = THREE.ACESFilmicToneMapping;
  w.renderer.toneMappingExposure = 1.05;
  container.appendChild(w.renderer.domElement);

  // 光照
  const sun = new THREE.DirectionalLight(0xffe6c0, 2.2);
  sun.position.set(60,100,40);
  sun.castShadow = true;
  sun.shadow.mapSize.set(2048,2048);
  sun.shadow.camera.left=-100; sun.shadow.camera.right=100;
  sun.shadow.camera.top=100; sun.shadow.camera.bottom=-100;
  sun.shadow.camera.far=300;
  sun.shadow.bias=-0.0004;
  w.scene.add(sun);
  w.scene.add(new THREE.HemisphereLight(0x8fb8e8, 0x2a2418, 0.7));
  w.scene.add(new THREE.AmbientLight(0x404860, 0.4));

  w.tileGroup = new THREE.Group(); w.scene.add(w.tileGroup);
  w.unitGroup = new THREE.Group(); w.scene.add(w.unitGroup);
  w.fxGroup   = new THREE.Group(); w.scene.add(w.fxGroup);

  buildOcean();
  buildTerrain();
  buildCities();

  // 后处理 Bloom
  w.composer = new EffectComposer(w.renderer);
  w.composer.addPass(new RenderPass(w.scene, w.camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(container.clientWidth,container.clientHeight), 0.45, 0.6, 0.85);
  w.composer.addPass(bloom);
  w.composer.addPass(new OutputPass());

  loadHDRI();
  return w;
}
function loadHDRI(){
  new RGBELoader().load(ASSETS.hdri, tex=>{
    tex.mapping = THREE.EquirectangularReflectionMapping;
    WORLD.scene.environment = tex;
    WORLD.scene.background = tex;
    WORLD.scene.backgroundIntensity = 0.85;
  }, undefined, ()=>{
    // 降级：渐变天空
    WORLD.scene.background = new THREE.Color(0x1a3050);
  });
}
function buildOcean(){
  const geo = new THREE.PlaneGeometry(600,600,1,1);
  const mat = new THREE.MeshStandardMaterial({
    color:0x14304d, roughness:0.35, metalness:0.55,
    transparent:true, opacity:0.96
  });
  const sea = new THREE.Mesh(geo,mat);
  sea.rotation.x=-Math.PI/2;
  sea.position.y=-0.4;
  sea.receiveShadow=true;
  WORLD.scene.add(sea);
}
function buildTerrain(){
  // 每格一个 Box（低多边形风），按地形高度挤出，国家着色
  const geo = new THREE.BoxGeometry(CELL,1,CELL);
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const t=G.tiles[y][x];
    if(t.ter===0){ WORLD.tileMeshes.push(null); continue; }
    const h=tileHeight(t);
    const base=NATIONS[t.owner]?NATIONS[t.owner].color:0x55604c;
    const col=new THREE.Color(base);
    // 地形微调明暗
    if(t.ter===2)col.multiplyScalar(0.75);
    if(t.ter===3)col.multiplyScalar(0.9);
    if(t.ter===4)col.set(0x8a8a92);
    if(t.ter===5)col.lerp(new THREE.Color(0xffffff),0.12);
    const mat=new THREE.MeshStandardMaterial({color:col,roughness:0.85,metalness:0.08});
    const m=new THREE.Mesh(geo,mat);
    m.scale.y=h;
    const c=tileCenter(x,y);
    m.position.set(c.x,h/2-0.3,c.z);
    m.castShadow=true; m.receiveShadow=true;
    m.userData={tx:x,ty:y,isTile:true};
    WORLD.scene.add(m);
    WORLD.tileMeshes.push(m);
    // 森林加树
    if(t.ter===2)addTrees(c.x,h-0.3,c.z);
    if(t.ter===4)addRock(c.x,h-0.3,c.z);
  }
}
function addTrees(px,py,pz){
  const trunkG=new THREE.CylinderGeometry(0.12,0.16,0.7,5);
  const leafG=new THREE.ConeGeometry(0.7,1.6,6);
  const trunkM=new THREE.MeshStandardMaterial({color:0x4a3520,roughness:1});
  const leafM=new THREE.MeshStandardMaterial({color:0x1f4a22,roughness:0.9});
  for(let i=0;i<3;i++){
    const g=new THREE.Group();
    const tr=new THREE.Mesh(trunkG,trunkM);tr.position.y=0.35;
    const lf=new THREE.Mesh(leafG,leafM);lf.position.y=1.4;lf.castShadow=true;
    g.add(tr,lf);
    g.position.set(px+(Math.random()-0.5)*2.4, py, pz+(Math.random()-0.5)*2.4);
    const s=0.8+Math.random()*0.5;g.scale.set(s,s,s);
    WORLD.tileGroup.add(g);
  }
}
function addRock(px,py,pz){
  const g=new THREE.DodecahedronGeometry(0.9,0);
  const m=new THREE.MeshStandardMaterial({color:0x6a6a72,roughness:1,flatShading:true});
  const r=new THREE.Mesh(g,m);
  r.position.set(px,py+0.4,pz);
  r.scale.set(1,1.4,1);
  r.castShadow=true;
  WORLD.tileGroup.add(r);
}
function buildCities(){
  // 城市：程序化建筑簇
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const t=G.tiles[y][x];
    if(t.ter!==5)continue;
    const c=tileCenter(x,y), h=tileHeight(t);
    const city=new THREE.Group();
    const mat=new THREE.MeshStandardMaterial({color:0x9aa0aa,roughness:0.6,metalness:0.3});
    const winMat=new THREE.MeshStandardMaterial({color:0x223,emissive:0xffd780,emissiveIntensity:0.6,roughness:0.4});
    for(let i=0;i<4;i++){
      const bw=0.5+Math.random()*0.5, bh=0.8+Math.random()*1.8, bd=0.5+Math.random()*0.5;
      const b=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd), i%2?mat:winMat);
      b.position.set(c.x+(Math.random()-0.5)*2.2, h-0.3+bh/2, c.z+(Math.random()-0.5)*2.2);
      b.castShadow=true;
      city.add(b);
    }
    WORLD.tileGroup.add(city);
  }
}
// 领土变色（占领时更新 tile 材质颜色）
export function recolorTile(x,y,ownerTag){
  const idx=y*MAP_W+x;
  const m=WORLD.tileMeshes[idx];
  if(!m)return;
  const base=NATIONS[ownerTag]?NATIONS[ownerTag].color:0x55604c;
  const t=G.tiles[y][x];
  const col=new THREE.Color(base);
  if(t.ter===2)col.multiplyScalar(0.75);
  if(t.ter===3)col.multiplyScalar(0.9);
  if(t.ter===4)col.set(0x8a8a92);
  if(t.ter===5)col.lerp(new THREE.Color(0xffffff),0.12);
  m.material.color.copy(col);
}
export function render(){ WORLD.composer.render(); }