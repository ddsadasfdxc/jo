/* 钢铁雄心4 3D v2 - 单位3D模型：GLTF士兵骨骼动画 + 程序化坦克/卫戍 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { clone as skClone } from 'three/addons/utils/SkeletonUtils.js';
import { WORLD, tileCenter, tileHeight } from './world.js';

const unitMeshes = {};   // unit.id -> {group, mixer, actions, current}
let soldierProto = null, soldierClips = null;

export function preloadUnits(onDone){
  new GLTFLoader().load(ASSETS.soldier, gltf=>{
    soldierProto = gltf.scene;
    soldierClips = gltf.animations;   // idle, walk, run, tpose
    soldierProto.traverse(o=>{ if(o.isMesh){o.castShadow=true;} });
    if(onDone)onDone(true);
  }, undefined, err=>{
    console.warn('Soldier 加载失败，使用程序化模型降级', err);
    if(onDone)onDone(false);
  });
}
// 程序化坦克建模（底盘/炮塔/炮管/履带）
function buildTank(colorCss){
  const g = new THREE.Group();
  const body = new THREE.MeshStandardMaterial({color:new THREE.Color(colorCss).multiplyScalar(0.6),roughness:0.5,metalness:0.6});
  const dark = new THREE.MeshStandardMaterial({color:0x1a1a1a,roughness:0.8,metalness:0.3});
  // 底盘
  const hull = new THREE.Mesh(new THREE.BoxGeometry(2.4,0.8,3.6), body);
  hull.position.y=0.8; hull.castShadow=true; g.add(hull);
  // 倾斜首上
  const glacis = new THREE.Mesh(new THREE.BoxGeometry(2.4,0.7,1.0), body);
  glacis.position.set(0,0.85,1.9); glacis.rotation.x=0.5; g.add(glacis);
  // 炮塔
  const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.9,1.05,0.7,8), body);
  turret.position.set(0,1.5,-0.2); turret.castShadow=true; g.add(turret);
  // 炮管
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.09,0.11,2.6,6), dark);
  barrel.rotation.x=Math.PI/2; barrel.position.set(0,1.5,1.3); g.add(barrel);
  // 履带
  for(const s of [-1,1]){
    const track = new THREE.Mesh(new THREE.BoxGeometry(0.6,0.9,3.9), dark);
    track.position.set(s*1.35,0.45,0); track.castShadow=true; g.add(track);
  }
  return g;
}
// 程序化卫戍（碉堡/工事）
function buildGarrison(colorCss){
  const g = new THREE.Group();
  const conc = new THREE.MeshStandardMaterial({color:0x7a7f86,roughness:0.95});
  const flagM = new THREE.MeshStandardMaterial({color:new THREE.Color(colorCss),roughness:0.7});
  const bunker = new THREE.Mesh(new THREE.CylinderGeometry(1.3,1.6,1.1,8), conc);
  bunker.position.y=0.55; bunker.castShadow=true; g.add(bunker);
  const slit = new THREE.Mesh(new THREE.BoxGeometry(2.2,0.2,0.3), new THREE.MeshStandardMaterial({color:0x111}));
  slit.position.set(0,0.8,1.35); g.add(slit);
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.04,0.04,2.0,4), conc);
  pole.position.set(0,1.6,0); g.add(pole);
  const flag = new THREE.Mesh(new THREE.PlaneGeometry(0.9,0.55), flagM);
  flag.position.set(0.48,2.3,0); g.add(flag);
  return g;
}
// 步兵：GLTF 士兵 或 降级胶囊兵
function buildInfantry(colorCss){
  if(soldierProto){
    const inst = skClone(soldierProto);
    // 染色：找到主要材质，给国家色 shoulder/body  tint
    inst.traverse(o=>{
      if(o.isMesh||o.isSkinnedMesh){
        o.castShadow=true;
        if(o.material){
          o.material = o.material.clone();
          o.material.color = new THREE.Color(colorCss).lerp(new THREE.Color(0xffffff),0.35);
        }
      }
    });
    inst.scale.set(1.0,1.0,1.0);
    return {group:inst, hasAnim:true};
  }
  // 降级：胶囊士兵
  const g=new THREE.Group();
  const body=new THREE.Mesh(new THREE.CapsuleGeometry(0.4,0.9,4,8),
    new THREE.MeshStandardMaterial({color:new THREE.Color(colorCss),roughness:0.8}));
  body.position.y=1.0;body.castShadow=true;g.add(body);
  const head=new THREE.Mesh(new THREE.SphereGeometry(0.28,8,8),
    new THREE.MeshStandardMaterial({color:0xd8b89a}));
  head.position.y=1.95;g.add(head);
  return {group:g, hasAnim:false};
}
export function spawnUnitMesh(u){
  const colorCss = NATIONS[u.nation].css;
  let entry;
  if(u.type==='arm') entry={group:buildTank(colorCss),hasAnim:false};
  else if(u.type==='gar') entry={group:buildGarrison(colorCss),hasAnim:false};
  else entry=buildInfantry(colorCss);

  const grp = entry.group;
  const c = tileCenter(u.x,u.y);
  const t = G.tiles[u.y][u.x];
  grp.position.set(c.x, tileHeight(t)-0.3, c.z);
  WORLD.unitGroup.add(grp);

  // 血条精灵
  const hpBar = makeHpBar();
  hpBar.position.set(0,3.2,0);
  grp.add(hpBar);

  // 选中光环
  const ring = new THREE.Mesh(
    new THREE.RingGeometry(1.6,1.9,32),
    new THREE.MeshBasicMaterial({color:0xffd700,transparent:true,opacity:0.9,side:THREE.DoubleSide}));
  ring.rotation.x=-Math.PI/2; ring.position.y=0.05; ring.visible=false;
  grp.add(ring);

  const rec = {group:grp, mixer:null, actions:{}, current:null, ring, hpBar, targetPos:null, u};
  // 骨骼动画
  if(entry.hasAnim && soldierClips){
    const mixer = new THREE.AnimationMixer(grp);
    rec.mixer=mixer;
    for(const clip of soldierClips){
      rec.actions[clip.name.toLowerCase()] = mixer.clipAction(clip);
    }
    playAction(rec,'idle');
  }
  unitMeshes[u.id]=rec;
  updateHpBar(u);
  return rec;
}
function playAction(rec,name){
  const map={idle:'idle',walk:'walk',run:'run'};
  const key=map[name]||'idle';
  const next=rec.actions[key]||rec.actions['idle'];
  if(!next||rec.current===next)return;
  if(rec.current)rec.current.fadeOut(0.25);
  next.reset().fadeIn(0.25).play();
  rec.current=next;
}
export function setUnitMoving(rec,moving){
  if(rec.mixer) playAction(rec, moving?'walk':'idle');
}
function makeHpBar(){
  const cvs=document.createElement('canvas');cvs.width=64;cvs.height=8;
  const tex=new THREE.CanvasTexture(cvs);
  const spr=new THREE.Sprite(new THREE.SpriteMaterial({map:tex,depthTest:false}));
  spr.scale.set(2.4,0.3,1);
  spr.userData.canvas=cvs;spr.userData.tex=tex;
  return spr;
}
export function updateHpBar(u){
  const rec=unitMeshes[u.id];if(!rec)return;
  const cvs=rec.hpBar.userData.canvas, ctx=cvs.getContext('2d');
  ctx.clearRect(0,0,64,8);
  ctx.fillStyle='#300';ctx.fillRect(0,0,64,8);
  const r=u.hp/u.maxHp;
  ctx.fillStyle=r>0.5?'#4c4':r>0.25?'#cc4':'#c44';
  ctx.fillRect(0,0,64*r,8);
  rec.hpBar.userData.tex.needsUpdate=true;
}
export function moveUnitAnim(rec, fx, fy, tx, ty, dur){
  const from=tileCenter(fx,fy), to=tileCenter(tx,ty);
  const fromT=G.tiles[fy][fx], toT=G.tiles[ty][tx];
  const fromY=tileHeight(fromT)-0.3, toY=tileHeight(toT)-0.3;
  rec.anim={t:0,dur,from:new THREE.Vector3(from.x,fromY,from.z),to:new THREE.Vector3(to.x,toY,to.z)};
  // 朝向
  rec.group.lookAt(to.x,rec.group.position.y,to.z);
  setUnitMoving(rec,true);
}
export function removeUnitMesh(u){
  const rec=unitMeshes[u.id];
  if(rec){WORLD.unitGroup.remove(rec.group);delete unitMeshes[u.id];}
}
export function getUnitRec(id){return unitMeshes[id];}
export function tickUnits(dt){
  for(const id in unitMeshes){
    const rec=unitMeshes[id];
    if(rec.mixer)rec.mixer.update(dt);
    if(rec.anim){
      const a=rec.anim;
      a.t+=dt;
      const k=Math.min(1,a.t/a.dur);
      rec.group.position.lerpVectors(a.from,a.to,k);
      if(k>=1){rec.anim=null;setUnitMoving(rec,false);}
    }
    // 血条面向相机
    if(rec.hpBar)rec.hpBar.quaternion.copy(WORLD.camera.quaternion);
  }
}
export function setSelected(u,on){
  const rec=unitMeshes[u.id];
  if(rec)rec.ring.visible=on;
}