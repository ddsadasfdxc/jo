/* 钢铁雄心4 3D v2 - 主入口：相机/触屏/特效/循环/UI */
import * as THREE from 'three';
import { initWorld, WORLD, render, tileCenter, tileHeight, recolorTile } from './world.js';
import { preloadUnits, spawnUnitMesh, removeUnitMesh, getUnitRec, moveUnitAnim, tickUnits, setSelected, updateHpBar } from './units.js';

// ---------- 战斗特效 ----------
function battleFX(x,y){
  const c=tileCenter(x,y), t=G.tiles[y][x], h=tileHeight(t);
  for(let i=0;i<3;i++){
    const flash=new THREE.PointLight(0xff6633,30,20);
    flash.position.set(c.x+(Math.random()-0.5)*2, h+1.5, c.z+(Math.random()-0.5)*2);
    WORLD.fxGroup.add(flash);
    setTimeout(()=>WORLD.fxGroup.remove(flash), 120+i*80);
  }
  // 烟尘
  for(let i=0;i<5;i++){
    const s=new THREE.Mesh(new THREE.SphereGeometry(0.4+Math.random()*0.4,6,6),
      new THREE.MeshBasicMaterial({color:0x555,transparent:true,opacity:0.7}));
    s.position.set(c.x+(Math.random()-0.5)*2, h+1+Math.random()*1.5, c.z+(Math.random()-0.5)*2);
    WORLD.fxGroup.add(s);
    const vy=1.5+Math.random();
    const iv=setInterval(()=>{
      s.position.y+=vy*0.03; s.material.opacity-=0.03; s.scale.multiplyScalar(1.04);
      if(s.material.opacity<=0){clearInterval(iv);WORLD.fxGroup.remove(s);}
    },30);
  }
}

// ---------- 事件接线 ----------
function wireEvents(){
  on('spawn', u=>{ spawnUnitMesh(u); });
  on('move', ({u,fx,fy})=>{
    const rec=getUnitRec(u.id);
    if(rec) moveUnitAnim(rec,fx,fy,u.x,u.y,0.5);
  });
  on('battle', ({x,y,atk,def})=>{
    battleFX(x,y);
    updateHpBar(atk);updateHpBar(def);
    updateHUD();
  });
  on('capture', ({tile,by})=>{ recolorTile(tile.x,tile.y,by); });
  on('die', u=>{ removeUnitMesh(u); updateHUD(); });
}

// ---------- 相机控制（拖拽旋转 + 双指缩放 + 点击选中）----------
const cam = {theta:0.6, phi:0.95, dist:130, cx:0, cz:0};
function applyCam(){
  const {theta,phi,dist,cx,cz}=cam;
  WORLD.camera.position.set(
    cx+dist*Math.sin(phi)*Math.sin(theta),
    dist*Math.cos(phi),
    cz+dist*Math.sin(phi)*Math.cos(theta));
  WORLD.camera.lookAt(cx,0,cz);
}
function setupControls(dom){
  const ray=new THREE.Raycaster(), ptr=new THREE.Vector2();
  let drag=false, sx=0, sy=0, moved=0, pinch=0;
  dom.addEventListener('pointerdown',e=>{
    drag=true;moved=0;sx=e.clientX;sy=e.clientY;
    dom.setPointerCapture(e.pointerId);
  });
  dom.addEventListener('pointermove',e=>{
    if(!drag)return;
    const dx=e.clientX-sx, dy=e.clientY-sy;
    moved+=Math.abs(dx)+Math.abs(dy);
    if(moved>12){
      cam.theta-=dx*0.005;
      cam.phi=Math.max(0.3,Math.min(1.4,cam.phi-dy*0.004));
      sx=e.clientX;sy=e.clientY;
    }
  });
  dom.addEventListener('pointerup',e=>{
    drag=false;
    if(moved<=12)handleTap(e);
  });
  dom.addEventListener('wheel',e=>{
    cam.dist=Math.max(40,Math.min(240,cam.dist+e.deltaY*0.1));
  },{passive:true});
  // 双指缩放
  dom.addEventListener('touchmove',e=>{
    if(e.touches.length===2){
      const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);
      if(pinch)cam.dist=Math.max(40,Math.min(240,cam.dist*(pinch/d)));
      pinch=d;
      e.preventDefault();
    }
  },{passive:false});
  dom.addEventListener('touchend',()=>{pinch=0;});
}
function handleTap(e){
  const rect=WORLD.renderer.domElement.getBoundingClientRect();
  const ptr=new THREE.Vector2(
    ((e.clientX-rect.left)/rect.width)*2-1,
    -((e.clientY-rect.top)/rect.height)*2+1);
  const ray=new THREE.Raycaster();
  ray.setFromCamera(ptr,WORLD.camera);
  // 检测单位（优先）
  const unitHits=ray.intersectObjects(WORLD.unitGroup.children,true);
  if(unitHits.length){
    let g=unitHits[0].object;
    while(g&&!g.userData.unitId&&g.parent)g=g.parent;
    // 通过位置反查单位
    const hit=findUnitByObject(unitHits[0].object);
    if(hit){
      if(hit.nation===G.player){selectUnit(hit);}
      else{
        // 点敌军：若已选我方单位且相邻→攻击
        if(G.selUnit&&adjacent(G.selUnit,hit)){orderMove(G.selUnit,hit.x,hit.y);deselect();updateHUD();}
      }
      return;
    }
  }
  // 检测地块
  const tileMeshes=WORLD.tileMeshes.filter(Boolean);
  const hits=ray.intersectObjects(tileMeshes,false);
  if(hits.length){
    const {tx,ty}=hits[0].object.userData;
    if(G.selUnit){
      const u=G.selUnit;
      if(Math.abs(u.x-tx)+Math.abs(u.y-ty)===1){
        if(orderMove(u,tx,ty)){deselect();updateHUD();return;}
      }
      deselect();
    }
    showTileInfo(tx,ty);
  }else{
    deselect();
  }
}
function findUnitByObject(obj){
  for(const u of G.units){
    const rec=getUnitRec(u.id);
    if(rec){
      let o=obj,found=false;
      while(o){if(o===rec.group){found=true;break;}o=o.parent;}
      if(found)return u;
    }
  }
  return null;
}
function adjacent(a,b){return Math.abs(a.x-b.x)+Math.abs(a.y-b.y)===1;}
function selectUnit(u){
  if(G.selUnit)setSelected(G.selUnit,false);
  G.selUnit=u;setSelected(u,true);
  showTileInfo(u.x,u.y);
}
function deselect(){
  if(G.selUnit)setSelected(G.selUnit,false);
  G.selUnit=null;
}

// ---------- HUD / 面板 ----------
function showTileInfo(x,y){
  const t=G.tiles[y][x],u=unitAt(x,y);
  let h=`<b>${T_INFO[t.ter].name}</b>`;
  if(t.owner)h+=` · <span style="color:${NATIONS[t.owner].css}">${NATIONS[t.owner].name}</span>`;
  if(t.fac>0)h+=` · 🏭×${t.fac}`;
  if(u){h+=`<br>${UNIT_T[u.type].icon} ${NATIONS[u.nation].name}·${UNIT_T[u.type].name} HP:${Math.ceil(u.hp)}/${u.maxHp} 组织:${Math.round(u.org)}%`;}
  document.getElementById('tileInfo').innerHTML=h;
}
function updateHUD(){
  const d=G.date;
  document.getElementById('dateEl').textContent=`${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  const n=G.nations[G.player];
  document.getElementById('ppEl').textContent=Math.floor(n.pp);
  document.getElementById('unitEl').textContent=G.units.filter(u=>u.nation===G.player).length;
  let fac=0;tilesOf(G.player).forEach(t=>fac+=t.fac);
  document.getElementById('facEl').textContent=fac;
  document.getElementById('logEl').innerHTML=G.log.slice(0,10).map(l=>`<div>${l}</div>`).join('');
  renderResearch();renderProd();
  if(G.gameOver){setSpeed(0);showGameOver();}
}
function showGameOver(){
  const el=document.getElementById('gameOver');
  const win=allEnemiesDead()&&!G.nations[G.player].defeated;
  el.querySelector('h2').textContent=win?'🏆 你征服了欧洲！':'☠️ 国家灭亡';
  el.style.display='flex';
}
let tickTimer=null,curSpeed=0;
const SPEEDS=[0,900,450,180,80];
function setSpeed(s){
  curSpeed=s;
  if(tickTimer){clearInterval(tickTimer);tickTimer=null;}
  if(s>0&&!G.gameOver)tickTimer=setInterval(()=>{gameTick();updateHUD();},SPEEDS[s]);
  document.getElementById('speedBtn').textContent=s===0?'▶️':`⏩×${s}`;
}
function cycleSpeed(){setSpeed(curSpeed>=4?0:curSpeed+1);}
function renderResearch(){
  const el=document.getElementById('researchList');if(!el)return;
  const n=G.nations[G.player],rs=G.research[G.player];
  let h='';
  if(rs.cur){const t=TECHS.find(x=>x.id===rs.cur);h+=`<div class="item cur">🔬 ${t.name} ${Math.floor(rs.prog/t.cost*100)}%</div>`;}
  TECHS.forEach(t=>{
    if(n.done.includes(t.id)){h+=`<div class="item done">✅ ${t.name}</div>`;return;}
    if(rs.cur===t.id)return;
    const locked=t.req&&!n.done.includes(t.req);
    h+=`<div class="item ${locked?'locked':''}" data-tech="${t.id}">${locked?'🔒':'⬜'} ${t.name}<small>${t.desc}</small></div>`;
  });
  el.innerHTML=h;
}
function renderProd(){
  const el=document.getElementById('prodList');if(!el)return;
  const n=G.nations[G.player];
  let h='';
  for(const k in UNIT_T){
    const ut=UNIT_T[k],locked=ut.tech&&!n.done.includes(ut.tech);
    h+=`<div class="item ${locked?'locked':''}" data-unit="${k}">${ut.icon} ${ut.name}<small>${locked?'需科技':ut.cost+' PP'}</small></div>`;
  }
  h+=G.queue[G.player].map(q=>`<div class="item cur">🏭 ${UNIT_T[q.type].name} ${Math.floor(q.prog/UNIT_T[q.type].cost*100)}%</div>`).join('');
  el.innerHTML=h;
}
function renderDiplo(){
  const el=document.getElementById('diploList');
  let h='';
  for(const t in NATIONS){
    if(t==='NEU'||t===G.player)continue;
    const n=G.nations[t];
    if(n.defeated){h+=`<div class="item dead">☠️ ${NATIONS[t].name}</div>`;continue;}
    const war=atWar(G.player,t);
    h+=`<div class="item diplo" style="border-left:4px solid ${NATIONS[t].css}">
      <span>${NATIONS[t].name}<small>${NATIONS[t].fac}</small></span>
      ${war?'<span class="warTag">交战中</span>':`<button class="warBtn" data-war="${t}">宣战</button>`}</div>`;
  }
  el.innerHTML=h;
}
function switchTab(tab){
  document.querySelectorAll('.panel').forEach(p=>p.classList.remove('show'));
  document.querySelectorAll('.tabBtn').forEach(b=>b.classList.remove('active'));
  if(tab){
    document.getElementById('panel-'+tab).classList.add('show');
    document.getElementById('tab-'+tab).classList.add('active');
    if(tab==='diplo')renderDiplo();
  }
}

// ---------- 启动 ----------
export async function boot(playerTag){
  initGame(playerTag);
  const container=document.getElementById('gl');
  initWorld(container);
  wireEvents();
  setupControls(WORLD.renderer.domElement);
  applyCam();

  // 预载士兵模型，再生成所有初始单位
  await new Promise(res=>preloadUnits(res));
  G.units.forEach(u=>spawnUnitMesh(u));

  // 面板事件委托
  document.getElementById('researchList').addEventListener('click',e=>{
    const el=e.target.closest('[data-tech]');
    if(el){const id=el.dataset.tech;const rs=G.research[G.player];if(!rs.cur){rs.cur=id;rs.prog=0;addLog(`🔬 开始研究：${TECHS.find(t=>t.id===id).name}`);updateHUD();}}
  });
  document.getElementById('prodList').addEventListener('click',e=>{
    const el=e.target.closest('[data-unit]');
    if(el){const type=el.dataset.unit;const n=G.nations[G.player],ut=UNIT_T[type];
      if(ut.tech&&!n.done.includes(ut.tech)){addLog('❌ 需要科技');updateHUD();return;}
      if(n.pp<ut.cost){addLog('❌ PP不足');updateHUD();return;}
      n.pp-=ut.cost;G.queue[G.player].push({type,prog:0});addLog(`🏭 已下单：${ut.name}`);updateHUD();}
  });
  document.getElementById('diploList').addEventListener('click',e=>{
    const el=e.target.closest('[data-war]');
    if(el){declareWar(G.player,el.dataset.war);renderDiplo();updateHUD();}
  });
  document.getElementById('speedBtn').addEventListener('click',cycleSpeed);
  document.querySelectorAll('.tabBtn[data-tab]').forEach(b=>{
    b.addEventListener('click',()=>{
      const tab=b.dataset.tab;
      const isOpen=document.getElementById('panel-'+tab).classList.contains('show');
      switchTab(isOpen?null:tab);
    });
  });
  document.getElementById('restartBtn').addEventListener('click',()=>location.reload());

  updateHUD();
  // 主循环
  const clock=new THREE.Clock();
  function loop(){
    requestAnimationFrame(loop);
    const dt=Math.min(0.05,clock.getDelta());
    tickUnits(dt);
    applyCam();
    render();
  }
  loop();
  // 窗口自适应
  window.addEventListener('resize',()=>{
    WORLD.camera.aspect=container.clientWidth/container.clientHeight;
    WORLD.camera.updateProjectionMatrix();
    WORLD.renderer.setSize(container.clientWidth,container.clientHeight);
    WORLD.composer.setSize(container.clientWidth,container.clientHeight);
  });
}