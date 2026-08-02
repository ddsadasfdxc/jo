/* 钢铁雄心4移动版 - 地图数据 (1936剧本, 简化欧洲) */
const MAP_W = 32, MAP_H = 22;
const TERRAIN = { SEA:0, PLAIN:1, FOREST:2, HILL:3, MOUNT:4, CITY:5 };
const T_INFO = {
  0:{name:'海洋',pass:false,mc:99}, 1:{name:'平原',pass:true,mc:1},
  2:{name:'森林',pass:true,mc:2}, 3:{name:'丘陵',pass:true,mc:2},
  4:{name:'山地',pass:true,mc:3}, 5:{name:'城市',pass:true,mc:1}
};
const NATIONS = {
  GER:{name:'德意志国',color:'#4a4a55',mani:70,ind:72,fac:'法西斯'},
  FRA:{name:'法兰西',color:'#3a5a9c',mani:42,ind:55,fac:'民主'},
  ENG:{name:'联合王国',color:'#b03a48',mani:46,ind:64,fac:'民主'},
  SOV:{name:'苏联',color:'#a83232',mani:170,ind:58,fac:'共产'},
  ITA:{name:'意大利',color:'#3d7a3d',mani:43,ind:40,fac:'法西斯'},
  POL:{name:'波兰',color:'#d6c8b0',mani:35,ind:28,fac:'民主'},
  SPA:{name:'西班牙',color:'#c8a832',mani:25,ind:22,fac:'中立'},
  TUR:{name:'土耳其',color:'#b85c5c',mani:17,ind:15,fac:'中立'},
  NEU:{name:'中立区',color:'#5c6650',mani:0,ind:0,fac:'中立'}
};
// O=海 .=平原 F=森林 H=丘陵 M=山地 U=城市
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
// 所有者层: G德 F法 E英 S苏 I意 P波 s西 T土 空格=中立
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
  const T = {O:0,'.':1,F:2,H:3,M:4,U:5};
  const N = {G:'GER',F:'FRA',E:'ENG',S:'SOV',I:'ITA',P:'POL',s:'SPA',T:'TUR'};
  const tiles = [];
  for(let y=0;y<MAP_H;y++){ tiles.push([]);
    for(let x=0;x<MAP_W;x++){
      const tc=(MAP_ASCII[y]||'')[x]||'O', oc=(OWN_ASCII[y]||'')[x]||' ';
      const ter = T[tc]!==undefined?T[tc]:0;
      tiles[y].push({x,y,ter,owner:ter===0?null:(N[oc]||'NEU'),unit:null,fac:tc==='U'?2:0});
    }
  }
  return tiles;
}