/* 钢铁雄心4移动版 - 渲染与触屏交互 */
let cv, ctx, ts=24, cam={x:0,y:0}, tickTimer=null;
const SPEEDS=[0,800,400,150,60];

function setupCanvas(){
  cv=document.getElementById('map');
  ctx=cv.getContext('2d');
  resize();
  window.addEventListener('resize',resize);
  setupTouch();
}
function resize(){
  cv.width=cv.clientWidth; cv.height=cv.clientHeight;
  ts=Math.max(14,Math.floor(Math.min(cv.width/MAP_W,cv.height/MAP_H)));
  draw();
}
function draw(){
  if(!ctx||!G.tiles) return;
  ctx.fillStyle='#0d1b2a'; ctx.fillRect(0,0,cv.width,cv.height);
  const ox=(cv.width-MAP_W*ts)/2, oy=(cv.height-MAP_H*ts)/2;
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++){
    const t=G.tiles[y][x];
    const px=ox+x*ts, py=oy+y*ts;
    // 国家底色
    if(t.ter===0){ ctx.fillStyle='#16324f'; }
    else{
      ctx.fillStyle=t.owner?NATIONS[t.owner].color:'#5c6650';
      ctx.globalAlpha=0.75;
      ctx.fillRect(px,py,ts,ts);
      ctx.globalAlpha=1;
      // 地形标记
      ctx.fillStyle='rgba(0,0,0,0.35)';
      if(t.ter===2){ctx.font=`${ts*0.6}px serif`;ctx.fillText('🌲',px,py+ts*0.8);}
      if(t.ter===4){ctx.font=`${ts*0.6}px serif`;ctx.fillText('⛰️',px,py+ts*0.8);}
      if(t.ter===5){ctx.font=`${ts*0.7}px serif`;ctx.fillText('🏙️',px,py+ts*0.85);}
      // 网格线
      ctx.strokeStyle='rgba(0,0,0,0.18)';
      ctx.strokeRect(px,py,ts,ts);
      continue;
    }
    ctx.fillRect(px,py,ts,ts);
  }
  // 高亮选中单位的可行动邻格
  if(G.selUnit){
    const u=G.selUnit;
    neighbors(u.x,u.y).forEach(t=>{
      if(T_INFO[t.ter].pass){
        ctx.strokeStyle='rgba(255,220,80,0.9)';
        ctx.lineWidth=2;
        ctx.strokeRect(ox+t.x*ts+1,oy+t.y*ts+1,ts-2,ts-2);
        ctx.lineWidth=1;
      }
    });
  }
  // 单位
  G.units.forEach(u=>{
    const px=ox+u.x*ts, py=oy+u.y*ts;
    ctx.fillStyle=u.nation===G.player?'#ffd700':'rgba(255,255,255,0.9)';
    ctx.font=`${ts*0.75}px serif`;
    ctx.fillText(UNIT_T[u.type].icon,px+1,py+ts*0.82);
    // 血条
    ctx.fillStyle='#400';
    ctx.fillRect(px+2,py+ts-4,ts-4,3);
    ctx.fillStyle=u.hp/u.maxHp>0.5?'#4c4':'#c44';
    ctx.fillRect(px+2,py+ts-4,(ts-4)*(u.hp/u.maxHp),3);
    // 选中圈
    if(G.selUnit===u){
      ctx.strokeStyle='#ffd700'; ctx.lineWidth=2;
      ctx.strokeRect(px,py,ts,ts); ctx.lineWidth=1;
    }
  });
  // 玩家选中框
  if(G.sel){
    ctx.strokeStyle='#fff'; ctx.lineWidth=2;
    ctx.strokeRect(ox+G.sel.x*ts,oy+G.sel.y*ts,ts,ts);
    ctx.lineWidth=1;
  }
}
function canvasPos(e){
  const r=cv.getBoundingClientRect();
  const cx=(e.clientX-r.left), cy=(e.clientY-r.top);
  const ox=(cv.width-MAP_W*ts)/2, oy=(cv.height-MAP_H*ts)/2;
  return {x:Math.floor((cx-ox)/ts), y:Math.floor((cy-oy)/ts)};
}
function setupTouch(){
  let moved=false, sx=0, sy=0;
  cv.addEventListener('touchstart',e=>{
    moved=false;
    const t=e.touches[0]; sx=t.clientX; sy=t.clientY;
  },{passive:true});
  cv.addEventListener('touchmove',e=>{ moved=true; },{passive:true});
  cv.addEventListener('touchend',e=>{
    if(!moved){
      const t=e.changedTouches[0];
      handleTap(canvasPos(t));
    }
  });
  cv.addEventListener('click',e=>handleTap(canvasPos(e)));
}
function handleTap(p){
  if(p.x<0||p.x>=MAP_W||p.y<0||p.y>=MAP_H) return;
  const t=G.tiles[p.y][p.x];
  // 已选中单位 → 下达移动/攻击命令
  if(G.selUnit && G.selUnit.nation===G.player){
    const u=G.selUnit;
    const dx=Math.abs(u.x-p.x), dy=Math.abs(u.y-p.y);
    if(dx+dy===1){
      if(orderMove(u,p.x,p.y)){ G.selUnit=null; draw(); updateHUD(); return; }
    }
    if(t.unit&&t.unit.nation===G.player){ G.selUnit=t.unit; draw(); showTileInfo(t); return; }
    G.selUnit=null; draw(); return;
  }
  // 选择单位或地块
  G.sel=t;
  if(t.unit&&t.unit.nation===G.player) G.selUnit=t.unit;
  draw(); showTileInfo(t);
}
function showTileInfo(t){
  const el=document.getElementById('tileInfo');
  let h=`<b>${T_INFO[t.ter].name}</b>`;
  if(t.owner) h+=` · ${NATIONS[t.owner].name}`;
  if(t.fac>0) h+=` · 🏭×${t.fac}`;
  if(t.unit){
    const u=t.unit, ut=UNIT_T[u.type];
    h+=`<br>${ut.icon} ${NATIONS[u.nation].name} ${ut.name} HP:${Math.ceil(u.hp)}/${u.maxHp} 组织:${Math.round(u.org)}%`;
  }
  el.innerHTML=h;
}
// HUD 更新
function updateHUD(){
  const d=G.date;
  document.getElementById('dateEl').textContent=
    `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  const n=G.nations[G.player];
  document.getElementById('ppEl').textContent=Math.floor(n.pp);
  document.getElementById('unitEl').textContent=G.units.filter(u=>u.nation===G.player).length;
  let fac=0; tilesOf(G.player).forEach(t=>fac+=t.fac);
  document.getElementById('facEl').textContent=fac;
  // 日志
  document.getElementById('logEl').innerHTML=G.log.slice(0,12).map(l=>`<div>${l}</div>`).join('');
  // 科研面板
  renderResearch();
  renderProd();
  if(G.gameOver){
    clearInterval(tickTimer); tickTimer=null;
    document.getElementById('speedBtn').textContent='⏸';
    G.speed=0;
  }
}
function setSpeed(s){
  G.speed=s;
  if(tickTimer){ clearInterval(tickTimer); tickTimer=null; }
  if(s>0&&!G.gameOver) tickTimer=setInterval(()=>{ gameTick(); updateHUD(); draw(); },SPEEDS[s]);
  document.getElementById('speedBtn').textContent=s===0?'▶️':`⏩×${s}`;
}
function renderResearch(){
  const el=document.getElementById('researchList');
  if(!el) return;
  const n=G.nations[G.player], rs=G.research[G.player];
  let h='';
  if(rs.cur){
    const t=TECHS.find(x=>x.id===rs.cur);
    h+=`<div class="tech cur">🔬 ${t.name} ${Math.floor(rs.prog/t.cost*100)}%</div>`;
  }
  TECHS.forEach(t=>{
    if(n.done.includes(t.id)){ h+=`<div class="tech done">✅ ${t.name}</div>`; return; }
    if(rs.cur===t.id) return;
    const locked=t.req&&!n.done.includes(t.req);
    h+=`<div class="tech ${locked?'locked':''}" onclick="startResearch('${t.id}')">${locked?'🔒':'⬜'} ${t.name} <small>${t.desc}</small></div>`;
  });
  el.innerHTML=h;
}
function startResearch(id){
  const rs=G.research[G.player], n=G.nations[G.player];
  if(rs.cur||n.done.includes(id)) return;
  rs.cur=id; rs.prog=0;
  addLog(`🔬 开始研究：${TECHS.find(t=>t.id===id).name}`);
  updateHUD();
}
function renderProd(){
  const el=document.getElementById('prodList');
  if(!el) return;
  const n=G.nations[G.player];
  let h='';
  for(const k in UNIT_T){
    const ut=UNIT_T[k];
    const locked=ut.tech&&!n.done.includes(ut.tech);
    h+=`<div class="prodItem ${locked?'locked':''}" onclick="queueUnit('${k}')">${ut.icon} ${ut.name} <small>${locked?'需科技':ut.cost+'PP'}</small></div>`;
  }
  h+=G.queue[G.player].map(q=>`<div class="tech cur">🏭 ${UNIT_T[q.type].name} ${Math.floor(q.prog/UNIT_T[q.type].cost*100)}%</div>`).join('');
  el.innerHTML=h;
}
function queueUnit(type){
  const n=G.nations[G.player], ut=UNIT_T[type];
  if(ut.tech&&!n.done.includes(ut.tech)){ addLog('❌ 需要科技：'+TECHS.find(t=>t.id===ut.tech).name); updateHUD(); return; }
  if(n.pp<ut.cost){ addLog('❌ 政治点数不足'); updateHUD(); return; }
  n.pp-=ut.cost;
  G.queue[G.player].push({type,prog:0});
  addLog(`🏭 已下单：${ut.name}`);
  updateHUD();
}
function declareWarOn(tag){
  if(tag===G.player||G.nations[tag].defeated) return;
  declareWar(G.player,tag);
  updateHUD();
}
function renderDiplo(){
  const el=document.getElementById('diploList');
  if(!el) return;
  let h='';
  for(const t in NATIONS){
    if(t==='NEU'||t===G.player) continue;
    const n=G.nations[t];
    if(n.defeated){ h+=`<div class="diploRow dead">☠️ ${NATIONS[t].name}</div>`; continue; }
    const war=atWar(G.player,t);
    h+=`<div class="diploRow" style="border-left:4px solid ${NATIONS[t].color}">
      <span>${NATIONS[t].name} <small>${NATIONS[t].fac}</small></span>
      ${war?'<span class="warTag">交战中</span>':`<button class="warBtn" onclick="declareWarOn('${t}')">宣战</button>`}
    </div>`;
  }
  el.innerHTML=h;
}
function switchTab(tab){
  document.querySelectorAll('.panel').forEach(p=>p.style.display='none');
  document.querySelectorAll('.tabBtn').forEach(b=>b.classList.remove('active'));
  document.getElementById('panel-'+tab).style.display='block';
  document.getElementById('tab-'+tab).classList.add('active');
  if(tab==='diplo') renderDiplo();
  if(tab==='research') renderResearch();
  if(tab==='prod') renderProd();
}