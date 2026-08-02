/* 钢铁雄心4 3D v2 - 游戏逻辑（与渲染解耦） */
const G = {
  date:new Date(1936,0,1), speed:0, player:'GER',
  tiles:null, units:[], uid:1, nations:{}, research:{}, queue:{},
  rel:{}, selUnit:null, log:[], aiTimer:0, gameOver:false,
  listeners:{move:[],battle:[],capture:[]}
};
function relKey(a,b){return a<b?a+'-'+b:b+'-'+a;}
function atWar(a,b){const r=G.rel[relKey(a,b)];return r&&r.war;}
function on(ev,fn){G.listeners[ev].push(fn);}
function emit(ev,data){G.listeners[ev].forEach(f=>f(data));}
function addLog(m){
  const d=G.date;
  G.log.unshift(`[${d.getFullYear()}.${d.getMonth()+1}.${d.getDate()}] ${m}`);
  if(G.log.length>50)G.log.pop();
}
function initGame(player){
  G.player=player; G.tiles=buildTiles();
  G.units=[];G.uid=1;G.log=[];G.gameOver=false;G.date=new Date(1936,0,1);
  for(const t in NATIONS){
    if(t==='NEU')continue;
    G.nations[t]={tag:t,ind:NATIONS[t].ind,pp:60,done:[],atkBonus:0,spdBonus:0,defeated:false};
    G.research[t]={cur:null,prog:0};G.queue[t]=[];
  }
  const tags=Object.keys(NATIONS).filter(t=>t!=='NEU');
  for(let i=0;i<tags.length;i++)for(let j=i+1;j<tags.length;j++)
    G.rel[relKey(tags[i],tags[j])]={war:false};
  deploy();
  addLog(`${NATIONS[player].name}在你的领导下登场。`);
}
function deploy(){
  const D={GER:[['inf',6],['arm',2]],FRA:[['inf',7]],ENG:[['inf',4],['gar',2]],
    SOV:[['inf',10]],ITA:[['inf',5]],POL:[['inf',5]],SPA:[['inf',3]],TUR:[['inf',2]]};
  for(const tag in D){
    const own=tilesOf(tag);
    for(const[type,cnt]of D[tag])for(let i=0;i<cnt;i++){
      for(let a=0;a<80;a++){
        const t=own[Math.floor(Math.random()*own.length)];
        if(t&&!unitAt(t.x,t.y)&&T_INFO[t.ter].pass){mkUnit(tag,type,t.x,t.y);break;}
      }
    }
  }
}
function tilesOf(tag){
  const r=[];
  for(let y=0;y<MAP_H;y++)for(let x=0;x<MAP_W;x++)
    if(G.tiles[y][x].owner===tag)r.push(G.tiles[y][x]);
  return r;
}
function unitAt(x,y){return G.units.find(u=>u.x===x&&u.y===y)||null;}
function mkUnit(nation,type,x,y){
  const t=UNIT_T[type],n=G.nations[nation];
  const u={id:G.uid++,nation,type,x,y,hp:t.hp,maxHp:t.hp,
    atk:t.atk+(n?n.atkBonus:0),def:t.def,spd:t.spd+(n?n.spdBonus:0),
    org:100,ent:0,moving:false};
  G.units.push(u);
  emit('spawn',u);
  return u;
}
function neighbors(x,y){
  const r=[];
  for(const[dx,dy]of[[1,0],[-1,0],[0,1],[0,-1]]){
    const nx=x+dx,ny=y+dy;
    if(nx>=0&&nx<MAP_W&&ny>=0&&ny<MAP_H)r.push(G.tiles[ny][nx]);
  }
  return r;
}
function orderMove(u,tx,ty){
  const target=G.tiles[ty][tx];
  if(!T_INFO[target.ter].pass)return false;
  const foe=unitAt(tx,ty);
  if(foe&&foe.nation!==u.nation){
    if(!atWar(u.nation,foe.nation))declareWar(u.nation,foe.nation);
    resolveCombat(u,foe,target);
    return true;
  }
  if(foe)return false;
  if(target.owner&&target.owner!==u.nation){
    if(atWar(u.nation,target.owner)||target.owner==='NEU'){
      moveUnit(u,tx,ty);captureTile(u,target);return true;
    }
    return false;
  }
  moveUnit(u,tx,ty);return true;
}
function moveUnit(u,tx,ty){
  const fx=u.x,fy=u.y;
  u.x=tx;u.y=ty;u.ent=0;
  emit('move',{u,fx,fy});
}
function captureTile(u,tile){
  const prev=tile.owner;
  tile.owner=u.nation;
  emit('capture',{tile,prev,by:u.nation});
  if(tile.fac>0)addLog(`${NATIONS[u.nation].name} 攻占了 ${NATIONS[prev]?.name||''} 的城市！`);
  checkDefeat(prev);
}
function resolveCombat(atk,def,tile){
  const defBonus=1+(tile.ter===2||tile.ter===3?0.25:tile.ter===4?0.5:tile.ter===5?0.3:0)+def.ent*0.05;
  const atkPow=atk.atk*(atk.hp/atk.maxHp)*(atk.org/100);
  const defPow=def.def*(def.hp/def.maxHp)*(def.org/100)*defBonus;
  const dmgDef=Math.max(1,Math.round(atkPow*(0.3+Math.random()*0.4)));
  const dmgAtk=Math.max(1,Math.round(defPow*(0.2+Math.random()*0.3)));
  def.hp-=dmgDef;def.org-=15+Math.random()*20;
  atk.hp-=dmgAtk;atk.org-=10+Math.random()*15;
  emit('battle',{x:tile.x,y:tile.y,atk,def});
  if(def.hp<=0||def.org<=0){
    killUnit(def);
    addLog(`${NATIONS[atk.nation].name} 歼灭了 ${NATIONS[def.nation].name} 一个${UNIT_T[def.type].name}`);
    if(!unitAt(tile.x,tile.y)){moveUnit(atk,tile.x,tile.y);captureTile(atk,tile);}
  }else if(atk.hp<=0||atk.org<=0){
    killUnit(atk);
    addLog(`${NATIONS[atk.nation].name} 的进攻被击退`);
  }
}
function killUnit(u){
  G.units=G.units.filter(x=>x!==u);
  if(G.selUnit===u)G.selUnit=null;
  emit('die',u);
}
function checkDefeat(tag){
  if(!tag||tag==='NEU')return;
  if(tilesOf(tag).length===0&&!G.nations[tag].defeated){
    G.nations[tag].defeated=true;
    G.units.filter(u=>u.nation===tag).forEach(killUnit);
    addLog(`☠️ ${NATIONS[tag].name} 已经灭亡！`);
    if(tag===G.player){G.gameOver=true;addLog('你的国家灭亡了。游戏结束。');}
    else if(allEnemiesDead()){G.gameOver=true;addLog('🏆 你征服了欧洲！胜利！');}
  }
}
function allEnemiesDead(){
  for(const t in G.nations)if(t!==G.player&&!G.nations[t].defeated)return false;
  return true;
}
function declareWar(a,b){
  const r=G.rel[relKey(a,b)];
  if(r&&!r.war){r.war=true;addLog(`⚔️ ${NATIONS[a].name} 向 ${NATIONS[b].name} 宣战！`);}
}
function gameTick(){
  if(G.gameOver)return;
  G.date.setDate(G.date.getDate()+1);
  for(const t in G.nations){
    const n=G.nations[t];
    if(n.defeated)continue;
    let fac=0;tilesOf(t).forEach(tile=>fac+=tile.fac);
    n.pp+=0.5+fac*0.3;
    const rs=G.research[t];
    if(rs.cur){
      rs.prog+=1;
      const tech=TECHS.find(x=>x.id===rs.cur);
      if(rs.prog>=tech.cost){applyTech(t,tech);rs.cur=null;rs.prog=0;}
    }
    const q=G.queue[t];
    if(q.length>0){
      q[0].prog+=2+fac*0.2;
      if(q[0].prog>=UNIT_T[q[0].type].cost){const it=q.shift();spawnNear(t,it.type);}
    }
  }
  G.units.forEach(u=>{
    u.org=Math.min(100,u.org+3);
    if(u.hp<u.maxHp)u.hp=Math.min(u.maxHp,u.hp+0.3);
    u.ent=Math.min(5,u.ent+0.05);
  });
  G.aiTimer++;
  if(G.aiTimer>=3){G.aiTimer=0;runAI();}
}
function applyTech(tag,tech){
  const n=G.nations[tag];n.done.push(tech.id);
  if(tech.fx.atk){n.atkBonus+=tech.fx.atk;G.units.filter(u=>u.nation===tag).forEach(u=>u.atk+=tech.fx.atk);}
  if(tech.fx.spd){n.spdBonus+=tech.fx.spd;G.units.filter(u=>u.nation===tag).forEach(u=>u.spd+=tech.fx.spd);}
  if(tech.fx.ind)n.ind+=tech.fx.ind;
  if(tag===G.player)addLog(`🔬 科研完成：${tech.name}`);
}
function spawnNear(tag,type){
  const own=tilesOf(tag).filter(t=>!unitAt(t.x,t.y)&&T_INFO[t.ter].pass);
  if(own.length===0){G.queue[tag].unshift({type,prog:0});return;}
  const t=own[Math.floor(Math.random()*own.length)];
  mkUnit(tag,type,t.x,t.y);
  if(tag===G.player)addLog(`🏭 新的${UNIT_T[type].name}组建完成`);
}
function runAI(){
  for(const tag in G.nations){
    const n=G.nations[tag];
    if(n.defeated||tag===G.player)continue;
    if(!G.research[tag].cur){
      const av=TECHS.filter(t=>!n.done.includes(t.id)&&(!t.req||n.done.includes(t.req)));
      if(av.length)G.research[tag].cur=av[Math.floor(Math.random()*av.length)].id;
    }
    if(G.queue[tag].length<2&&n.pp>60){
      n.pp-=50;
      const type=n.done.includes('armor1')&&Math.random()<0.3?'arm':'inf';
      G.queue[tag].push({type,prog:0});
    }
    const my=G.units.filter(u=>u.nation===tag);
    if(my.length===0)continue;
    let enemy=null;
    for(const t2 in G.nations){
      if(t2===tag||G.nations[t2].defeated)continue;
      if(atWar(tag,t2)){enemy=t2;break;}
    }
    if(!enemy&&n.pp>80&&Math.random()<0.15){
      const weak=['POL','SPA','TUR','FRA'].filter(t=>t!==tag&&!G.nations[t].defeated);
      if(weak.length){enemy=weak[Math.floor(Math.random()*weak.length)];declareWar(tag,enemy);}
    }
    if(enemy){
      my.forEach(u=>{
        if(u.org<40)return;
        const nb=neighbors(u.x,u.y);
        const foe=nb.find(t=>{const un=unitAt(t.x,t.y);return un&&un.nation===enemy;});
        if(foe){orderMove(u,foe.x,foe.y);return;}
        const et=nb.find(t=>t.owner===enemy&&T_INFO[t.ter].pass&&!unitAt(t.x,t.y));
        if(et){orderMove(u,et.x,et.y);return;}
        const eT=tilesOf(enemy);
        if(eT.length){
          const c=eT[Math.floor(eT.length/2)];
          const best=nb.filter(t=>T_INFO[t.ter].pass&&!unitAt(t.x,t.y)&&(t.owner===tag||t.owner==='NEU'))
            .sort((a,b)=>(Math.abs(a.x-c.x)+Math.abs(a.y-c.y))-(Math.abs(b.x-c.x)+Math.abs(b.y-c.y)))[0];
          if(best)orderMove(u,best.x,best.y);
        }
      });
    }
  }
}