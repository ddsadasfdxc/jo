/* 钢铁雄心4移动版 - 核心游戏逻辑 */
const G = {
  date: new Date(1936,0,1), speed:0, player:'GER',
  tiles:null, units:[], uid:1, nations:{}, research:{}, queue:{},
  rel:{}, sel:null, selUnit:null, log:[], aiTimer:0, gameOver:false
};
const UNIT_T = {
  inf:{name:'步兵师',icon:'🪖',atk:10,def:14,hp:25,spd:1,cost:50,mp:10},
  arm:{name:'装甲师',icon:'🛡️',atk:22,def:10,hp:20,spd:2,cost:120,mp:8,tech:'armor1'},
  gar:{name:'卫戍师',icon:'🏰',atk:4,def:18,hp:15,spd:0,cost:30,mp:5}
};
const TECHS = [
  {id:'inf1',name:'改进步兵装备',cost:80,fx:{atk:3},desc:'全体攻击+3'},
  {id:'armor1',name:'轻型坦克',cost:100,fx:{unlock:'arm'},desc:'解锁装甲师'},
  {id:'ind1',name:'集中工业',cost:90,fx:{ind:8},desc:'工业+8'},
  {id:'doc1',name:'机动作战',cost:110,fx:{spd:1},desc:'部队移速+1'},
  {id:'doc2',name:'闪电战',cost:180,fx:{atk:4,spd:1},desc:'攻击+4 移速+1',req:'doc1'},
  {id:'ind2',name:'战时经济',cost:150,fx:{ind:15},desc:'工业+15',req:'ind1'}
];
function relKey(a,b){ return a<b ? a+'-'+b : b+'-'+a; }
function atWar(a,b){ const r=G.rel[relKey(a,b)]; return r && r.war; }
function addLog(msg){
  const d = G.date;
  G.log.unshift(`[${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}] ${msg}`);
  if(G.log.length>60) G.log.pop();
}
function initGame(player){
  G.player = player; G.tiles = buildTiles();
  G.units=[]; G.uid=1; G.log=[]; G.gameOver=false;
  G.date = new Date(1936,0,1);
  for(const t in NATIONS){
    if(t==='NEU') continue;
    G.nations[t]={tag:t,mani:NATIONS[t].mani*1000,ind:NATIONS[t].ind,pp:60,
      done:[],atkBonus:0,spdBonus:0,defeated:false};
    G.research[t]={cur:null,prog:0};
    G.queue[t]=[];
  }
  const tags=Object.keys(NATIONS).filter(t=>t!=='NEU');
  for(let i=0;i<tags.length;i++)for(let j=i+1;j<tags.length;j++)
    G.rel[relKey(tags[i],tags[j])]={war:false};
  deploy();
  addLog(`${NATIONS[player].name}在你的领导下登场。`);
}
function deploy(){
  const D = {GER:[['inf',6],['arm',2]],FRA:[['inf',7]],ENG:[['inf',4],['gar',2]],
    SOV:[['inf',10]],ITA:[['inf',5]],POL:[['inf',5]],SPA:[['inf',3]],TUR:[['inf',2]]};
  for(const tag in D){
    const own = tilesOf(tag);
    for(const [type,cnt] of D[tag]){
      for(let i=0;i<cnt;i++){
        for(let a=0;a<80;a++){
          const t = own[Math.floor(Math.random()*own.length)];
          if(t && !t.unit && T_INFO[t.ter].pass){ mkUnit(tag,type,t.x,t.y); break; }
        }
      }
    }
  }
}
function tilesOf(tag){
  const r=[];
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++)
    if(G.tiles[y][x].owner===tag) r.push(G.tiles[y][x]);
  return r;
}
function mkUnit(nation,type,x,y){
  const t = UNIT_T[type], n = G.nations[nation];
  const u = {id:G.uid++,nation,type,x,y,hp:t.hp,maxHp:t.hp,
    atk:t.atk+(n?n.atkBonus:0),def:t.def,spd:t.spd+(n?n.spdBonus:0),
    org:100,mv:null,ent:0};
  G.units.push(u);
  G.tiles[y][x].unit = u;
  return u;
}
// 相邻格
function neighbors(x,y){
  const r=[];
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy;
    if(nx>=0&&nx<MAP_W&&ny>=0&&ny<MAP_H) r.push(G.tiles[ny][nx]);
  }
  return r;
}
// 移动/攻击命令
function orderMove(u,tx,ty){
  const target = G.tiles[ty][tx];
  if(!T_INFO[target.ter].pass) return false;
  if(target.unit && target.unit.nation!==u.nation){
    // 交战
    if(!atWar(u.nation,target.unit.nation)){
      declareWar(u.nation,target.unit.nation);
    }
    resolveCombat(u,target.unit,target);
    return true;
  }
  if(target.unit) return false; // 友军占用
  // 占领逻辑：进入敌国/中立领土
  if(target.owner && target.owner!==u.nation){
    if(atWar(u.nation,target.owner) || target.owner==='NEU'){
      moveUnit(u,tx,ty);
      captureTile(u,target);
      return true;
    }
    return false;
  }
  moveUnit(u,tx,ty);
  return true;
}
function moveUnit(u,tx,ty){
  G.tiles[u.y][u.x].unit=null;
  u.x=tx; u.y=ty; u.ent=0;
  G.tiles[ty][tx].unit=u;
}
function captureTile(u,tile){
  const prev = tile.owner;
  tile.owner = u.nation;
  if(tile.fac>0) addLog(`${NATIONS[u.nation].name} 攻占了 ${NATIONS[prev]?.name||'地区'} 的城市！`);
  checkDefeat(prev);
}
function resolveCombat(atk,def,tile){
  const ter = T_INFO[tile.ter];
  const defBonus = 1 + (tile.ter===2||tile.ter===3?0.25:tile.ter===4?0.5:tile.ter===5?0.3:0) + def.ent*0.05;
  const atkPow = atk.atk * (atk.hp/atk.maxHp) * (atk.org/100);
  const defPow = def.def * (def.hp/def.maxHp) * (def.org/100) * defBonus;
  const dmgDef = Math.max(1,Math.round(atkPow*(0.3+Math.random()*0.4)));
  const dmgAtk = Math.max(1,Math.round(defPow*(0.2+Math.random()*0.3)));
  def.hp -= dmgDef; def.org -= 15+Math.random()*20;
  atk.hp -= dmgAtk; atk.org -= 10+Math.random()*15;
  if(def.hp<=0 || def.org<=0){
    killUnit(def);
    addLog(`${NATIONS[atk.nation].name} 歼灭了 ${NATIONS[def.nation].name} 一个${UNIT_T[def.type].name}`);
    if(!tile.unit){ moveUnit(atk,tile.x,tile.y); captureTile(atk,tile); }
  } else if(atk.hp<=0 || atk.org<=0){
    killUnit(atk);
    addLog(`${NATIONS[atk.nation].name} 的进攻被 ${NATIONS[def.nation].name} 击退`);
  }
}
function killUnit(u){
  G.tiles[u.y][u.x].unit=null;
  G.units = G.units.filter(x=>x!==u);
  if(G.selUnit===u){ G.selUnit=null; }
}
function checkDefeat(tag){
  if(!tag||tag==='NEU') return;
  if(tilesOf(tag).length===0 && !G.nations[tag].defeated){
    G.nations[tag].defeated=true;
    G.units.filter(u=>u.nation===tag).forEach(killUnit);
    addLog(`☠️ ${NATIONS[tag].name} 已经灭亡！`);
    if(tag===G.player){ G.gameOver=true; addLog('你的国家灭亡了。游戏结束。'); }
    else if(allEnemiesDead()){ G.gameOver=true; addLog('🏆 你征服了欧洲！胜利！'); }
  }
}
function allEnemiesDead(){
  for(const t in G.nations){
    if(t!==G.player && !G.nations[t].defeated && !isAlly(t)) return false;
  }
  return true;
}
function isAlly(){ return false; } // v1 无同盟
function declareWar(a,b){
  const r = G.rel[relKey(a,b)];
  if(r && !r.war){ r.war=true; addLog(`⚔️ ${NATIONS[a].name} 向 ${NATIONS[b].name} 宣战！`); }
}
// 每日 tick
function gameTick(){
  if(G.gameOver) return;
  G.date.setDate(G.date.getDate()+1);
  // 工业产出
  for(const t in G.nations){
    const n=G.nations[t];
    if(n.defeated) continue;
    let fac=0;
    tilesOf(t).forEach(tile=>fac+=tile.fac);
    n.pp += 0.5 + fac*0.3;
    // 科研
    const rs=G.research[t];
    if(rs.cur){
      rs.prog += 1;
      const tech = TECHS.find(x=>x.id===rs.cur);
      if(rs.prog>=tech.cost){ applyTech(t,tech); rs.cur=null; rs.prog=0; }
    }
    // 建造队列
    const q=G.queue[t];
    if(q.length>0){
      q[0].prog += 2+fac*0.2;
      if(q[0].prog>=UNIT_T[q[0].type].cost){
        const item=q.shift();
        spawnUnitNearCapital(t,item.type);
      }
    }
  }
  // 单位恢复
  G.units.forEach(u=>{
    u.org=Math.min(100,u.org+3);
    if(u.hp<u.maxHp) u.hp=Math.min(u.maxHp,u.hp+0.3);
    u.ent=Math.min(5,u.ent+0.05);
  });
  // AI 行动（每3天）
  G.aiTimer++;
  if(G.aiTimer>=3){ G.aiTimer=0; runAI(); }
}
function applyTech(tag,tech){
  const n=G.nations[tag];
  n.done.push(tech.id);
  if(tech.fx.atk){ n.atkBonus+=tech.fx.atk; G.units.filter(u=>u.nation===tag).forEach(u=>u.atk+=tech.fx.atk); }
  if(tech.fx.spd){ n.spdBonus+=tech.fx.spd; G.units.filter(u=>u.nation===tag).forEach(u=>u.spd+=tech.fx.spd); }
  if(tech.fx.ind) n.ind+=tech.fx.ind;
  if(tag===G.player) addLog(`🔬 科研完成：${tech.name}`);
}
function spawnUnitNearCapital(tag,type){
  const own=tilesOf(tag).filter(t=>!t.unit&&T_INFO[t.ter].pass);
  if(own.length===0){ G.queue[tag].unshift({type,prog:0}); return; }
  const t=own[Math.floor(Math.random()*own.length)];
  mkUnit(tag,type,t.x,t.y);
  if(tag===G.player) addLog(`🏭 新的${UNIT_T[type].name}组建完成`);
}
// AI 简单逻辑
function runAI(){
  for(const tag in G.nations){
    const n=G.nations[tag];
    if(n.defeated||tag===G.player) continue;
    // AI 科研
    if(!G.research[tag].cur){
      const avail=TECHS.filter(t=>!n.done.includes(t.id)&&(!t.req||n.done.includes(t.req)));
      if(avail.length) G.research[tag].cur=avail[Math.floor(Math.random()*avail.length)].id;
    }
    // AI 造兵
    if(G.queue[tag].length<2 && n.pp>60){
      n.pp-=50;
      const type = n.done.includes('armor1')&&Math.random()<0.3?'arm':'inf';
      G.queue[tag].push({type,prog:0});
    }
    // AI 军事扩张
    const myUnits=G.units.filter(u=>u.nation===tag);
    if(myUnits.length===0) continue;
    // 找最弱邻居
    let enemy=null;
    for(const t2 in G.nations){
      if(t2===tag||G.nations[t2].defeated) continue;
      if(atWar(tag,t2)){ enemy=t2; break; }
    }
    if(!enemy && n.pp>80 && Math.random()<0.15){
      // 随机宣战弱国
      const weak=['POL','SPA','TUR','FRA'].filter(t=>t!==tag&&!G.nations[t].defeated);
      if(weak.length){ enemy=weak[Math.floor(Math.random()*weak.length)]; declareWar(tag,enemy); }
    }
    if(enemy){
      // 向敌境移动
      myUnits.forEach(u=>{
        if(u.org<40) return;
        const nb=neighbors(u.x,u.y);
        // 优先攻击敌军
        const foe=nb.find(t=>t.unit&&t.unit.nation===enemy);
        if(foe){ orderMove(u,foe.x,foe.y); return; }
        // 进入敌境
        const et=nb.find(t=>t.owner===enemy&&T_INFO[t.ter].pass&&!t.unit);
        if(et){ orderMove(u,et.x,et.y); return; }
        // 朝敌国方向走一步
        const eTiles=tilesOf(enemy);
        if(eTiles.length){
          const c=eTiles[Math.floor(eTiles.length/2)];
          const best=nb.filter(t=>T_INFO[t.ter].pass&&!t.unit&&(!t.owner||t.owner===tag||t.owner==='NEU'))
            .sort((a,b)=>(Math.abs(a.x-c.x)+Math.abs(a.y-c.y))-(Math.abs(b.x-c.x)+Math.abs(b.y-c.y)))[0];
          if(best && best.owner==='NEU' || (best&&best.owner===tag)) orderMove(u,best.x,best.y);
        }
      });
    }
  }
}