/* 钢铁雄心4 3D v2 - 数据层：欧洲地图网格 + 国家 + 科技 + 单位模板 */
const MAP_W = 32, MAP_H = 22;
const T_INFO = {
  0:{name:'海洋',pass:false,h:0},  1:{name:'平原',pass:true,h:0.35},
  2:{name:'森林',pass:true,h:0.55}, 3:{name:'丘陵',pass:true,h:0.8},
  4:{name:'山地',pass:true,h:1.5}, 5:{name:'城市',pass:true,h:0.4}
};
const NATIONS = {
  GER:{name:'德意志国',color:0x4a4a58,css:'#4a4a58',fac:'法西斯',ind:72},
  FRA:{name:'法兰西',color:0x3a5a9c,css:'#3a5a9c',fac:'民主',ind:55},
  ENG:{name:'联合王国',color:0xb03a48,css:'#b03a48',fac:'民主',ind:64},
  SOV:{name:'苏联',color:0xa83232,css:'#a83232',fac:'共产',ind:58},
  ITA:{name:'意大利',color:0x3d7a3d,css:'#3d7a3d',fac:'法西斯',ind:40},
  POL:{name:'波兰',color:0xcfc2a8,css:'#cfc2a8',fac:'民主',ind:28},
  SPA:{name:'西班牙',color:0xc8a832,css:'#c8a832',fac:'中立',ind:22},
  TUR:{name:'土耳其',color:0xb85c5c,css:'#b85c5c',fac:'中立',ind:15},
  NEU:{name:'中立区',color:0x55604c,css:'#55604c',fac:'中立',ind:0}
};
const MAP_ASCII = [
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO",
"OOO...FF...FF...OOOO...FFFF...OO",
"OO.FF...FF.HH..OOOO.FF..FFFF..OO",
"O.FF.HHUU.HH..OO..FF.FF.HHFF..OO",
"O.HHUUUUHH.FF.OO.FFUUHHMM.FF..OO",
"O.HUFFFHHH....OO..FFHHMMMM.FF.OO",
"O.UFFFF.HHHH..OO..HH.MMMMMMHH.OO",
"OFFFF..HHHHUU.OO..FF.MMMMUUHH.OO",
"OFF..FF.HHUUUUUU..FF.MMUUUUHH.OO",
"O...FFFF.UUUUUFFFF...HHUUHHHH.OO",
"O.FF.FF.UUUUUUFFFFF..HHHH.HHH.OO",
"O.FFFF..UUUUUUFFFF...HH...HH.OOO",
"O.FF...FFUUUUUFF.HHHH..HHHHH.OOO",
"O..FFFF..FFUUUFF.HHMMMM.HH...OOO",
"OO..FFFF..FFF...HHMMMMMM.HHFF.OO",
"OO.FF....FF.HHHHMMMMUUHH.FF..OOO",
"OOO...FFFF.HHUUUUUUUUUUHH...OOOO",
"OOO.FF..FFHUUUUUUUMMUUUUUHH.OOOO",
"OOOO....HHUUUUMMMMMMUUUU...OOOOO",
"OOOOO...HHUUMMMMMMMUU......OOOOO",
"OOOOOO...HMMMMUUUUU...FF...OOOOO",
"OOOOOOOOOOOOOOOOOOOOOOOOOOOOOOOO"];
const OWN_ASCII = [
"                                ",
"   EEEE                 SSSS    ",
"  EEEE                SSSSSSS   ",
"  EEFFGG          PPPSSSSSSSSS  ",
" EEFFFFGGG      PPPPPPPSSSSSSS  ",
" EEFFFGGGGG     PPPPPPPSSSSSS   ",
" EFFFFFGGGGGG   PPPPPSSSSSSSS   ",
" EFFFFGGGGGGGG  PPPPSSSSSSSS    ",
" EFFFFGGGGGGGGGGPPPPSSSSSSS     ",
" FFFFGGGGGGGGGGGGPPPSSSSSSS     ",
" FFFFGGGGGGGGGGGPPPSSSSSSSS     ",
" FFFFFGGGGGGGGGPPPPPPSSSSS      ",
" FFFFFFGGGGGGGGPPPPPPPIISS      ",
"  FFFFFFFGGGGGPPPIIIIIIIIS      ",
"  FF      GG PPIIIIIIIIIII      ",
"   ssss   PPIIIIIIIIIIIIII      ",
"   ssssss IIIIIIIII  IIIIII     ",
"    sssssIIIIIIII     IIIII     ",
"    ssssIIIIIII        III      ",
"     ssIIIII           TTTT     ",
"      IIII      TTTT   TTTT     ",
"                                "];
function buildTiles(){
  const T={O:0,'.':1,F:2,H:3,M:4,U:5};
  const N={G:'GER',F:'FRA',E:'ENG',S:'SOV',I:'ITA',P:'POL',s:'SPA',T:'TUR'};
  const tiles=[];
  for(let y=0;y<MAP_H;y++){tiles.push([]);
    for(let x=0;x<MAP_W;x++){
      const tc=(MAP_ASCII[y]||'')[x]||'O', oc=(OWN_ASCII[y]||'')[x]||' ';
      const ter=T[tc]!==undefined?T[tc]:0;
      tiles[y].push({x,y,ter,owner:ter===0?null:(N[oc]||'NEU'),fac:tc==='U'?2:0});
    }}
  return tiles;
}
const UNIT_T = {
  inf:{name:'步兵师',icon:'🪖',atk:10,def:14,hp:25,spd:1,cost:50},
  arm:{name:'装甲师',icon:'🛡️',atk:22,def:10,hp:20,spd:2,cost:120,tech:'armor1'},
  gar:{name:'卫戍师',icon:'🏰',atk:4,def:18,hp:15,spd:0,cost:30}
};
const TECHS = [
  {id:'inf1',name:'改进步兵装备',cost:80,fx:{atk:3},desc:'全体攻击+3'},
  {id:'armor1',name:'轻型坦克',cost:100,fx:{unlock:'arm'},desc:'解锁装甲师'},
  {id:'ind1',name:'集中工业',cost:90,fx:{ind:8},desc:'工业+8'},
  {id:'doc1',name:'机动作战',cost:110,fx:{spd:1},desc:'部队移速+1'},
  {id:'doc2',name:'闪电战',cost:180,fx:{atk:4,spd:1},desc:'攻击+4 移速+1',req:'doc1'},
  {id:'ind2',name:'战时经济',cost:150,fx:{ind:15},desc:'工业+15',req:'ind1'}
];
// 资产清单（已探测可用）
const ASSETS = {
  soldier:'https://threejs.org/examples/models/gltf/Soldier.glb',
  hdri:'https://threejs.org/examples/textures/equirectangular/venice_sunset_1k.hdr'
};