'use strict';
// Three separate Bernoulli trials on every active second; never an exclusive draw.
const monsterTypes=[{id:'goblin',name:'哥布林',chance:.20,scale:1},{id:'cyclops',name:'獨眼巨人',chance:.05,scale:1.65},{id:'bandit',name:'土匪',chance:.15,scale:1.15}];
let monsters=[],slashes=[],spawnSeconds=0,defeated=0,monsterId=0;
function monsterArt(id){const c=document.createElement('canvas');c.width=48;c.height=64;const p=c.getContext('2d');
const r=(x,y,w,h,color)=>fill(p,x,y,w,h,color),poly=(pts,c)=>polygon(p,pts,c);
if(id==='goblin'){
 r(12,43,9,15,'#27382f');r(27,43,8,15,'#27382f');r(12,45,6,10,'#71954b');r(28,45,5,10,'#88aa57');r(9,57,12,4,'#40382b');r(27,57,12,4,'#40382b');
 poly([[12,27],[32,27],[39,46],[31,51],[12,49],[8,41]],'#4b342a');r(15,29,15,17,'#886a40');r(16,31,5,11,'#ae8b52');r(12,44,23,3,'#352e29');r(23,44,4,3,'#d6b269');
 poly([[11,12],[1,8],[6,23],[13,24]],'#557744');poly([[34,12],[46,8],[41,23],[34,24]],'#76974c');r(11,8,24,19,'#263b2e');r(13,7,20,21,'#8fac58');r(12,13,23,11,'#8fac58');r(15,10,10,7,'#b0c875');r(12,21,22,7,'#6c9049');r(14,17,7,3,'#e7d896');r(27,17,6,3,'#e7d896');r(18,17,2,3,'#ba4c34');r(27,17,2,3,'#ba4c34');r(19,23,11,2,'#314330');r(20,23,2,4,'#f0e6c2');r(28,23,2,4,'#f0e6c2');
 r(6,30,7,14,'#72984b');r(6,31,5,4,'#a7bf65');r(35,30,6,13,'#88a951');r(36,42,6,5,'#b0bd70');r(39,24,3,18,'#6a5337');poly([[38,24],[39,14],[43,24]],'#d7ddd0');
}else if(id==='cyclops'){
 r(10,42,11,17,'#665d49');r(28,42,11,17,'#665d49');r(10,47,8,10,'#b69875');r(29,47,8,10,'#b69875');r(7,57,15,5,'#57483b');r(27,57,15,5,'#57483b');
 poly([[11,22],[35,22],[42,43],[35,49],[10,49],[5,40]],'#8c7658');r(12,23,24,20,'#b59a72');r(15,25,9,14,'#d3b786');r(25,30,8,12,'#a68965');r(19,38,3,2,'#7f694f');poly([[9,41],[37,41],[40,49],[29,48],[23,52],[12,48],[8,49]],'#654b38');r(9,41,29,3,'#433c32');r(23,41,5,4,'#baa16a');
 r(13,4,22,20,'#584e40');r(12,8,24,13,'#bda17a');r(15,5,18,20,'#cbb18a');r(16,5,8,3,'#e1c69a');r(16,11,17,7,'#675948');r(18,12,13,5,'#eee8cd');r(22,12,5,5,'#8c5834');r(24,12,2,4,'#232e2e');r(20,21,10,2,'#70523c');r(25,21,3,3,'#f0e5bd');
 r(3,25,9,18,'#b89b73');r(2,28,7,8,'#d0b184');r(36,25,9,18,'#ad906c');r(38,40,8,6,'#cfb387');r(40,19,4,25,'#715238');r(37,13,10,13,'#514638');r(38,14,8,7,'#867052');r(39,15,5,2,'#aa8c60');
}else{
 r(13,43,9,16,'#3a4051');r(27,43,9,16,'#3a4051');r(15,45,4,11,'#596174');r(29,46,4,10,'#596174');r(10,56,12,6,'#332d30');r(27,56,12,6,'#332d30');r(11,56,10,2,'#86634a');r(28,56,10,2,'#86634a');
 poly([[13,25],[33,25],[38,45],[31,49],[12,47],[8,38]],'#4c3341');r(14,27,18,18,'#815145');r(17,29,6,12,'#ae7254');r(12,44,24,3,'#292d33');r(22,44,5,3,'#c9a661');poly([[28,25],[32,27],[17,44],[13,43]],'#c19766');r(10,26,7,6,'#656474');r(11,26,6,2,'#a3a39d');
 r(13,6,22,20,'#292a35');r(15,9,18,15,'#b67857');r(16,11,10,9,'#e2ad79');r(12,5,23,7,'#583b43');poly([[12,6],[19,2],[29,2],[36,9],[31,11],[14,11]],'#7a4145');r(16,5,11,2,'#ab6860');r(13,20,22,7,'#4a3541');r(15,20,15,2,'#77505a');r(17,15,4,2,'#252b32');r(28,15,4,2,'#252b32');r(18,15,1,1,'#f7deac');r(29,15,1,1,'#f7deac');
 r(6,32,7,13,'#694c49');r(6,43,7,5,'#d39b70');r(34,31,7,14,'#6c5052');r(35,43,7,5,'#d39b70');r(39,30,3,15,'#4b3834');r(36,32,9,2,'#c6a566');poly([[39,30],[40,18],[44,16],[43,30]],'#cadbce');r(41,20,1,10,'#f3f1cc');
}
return refineMonster(c,id);}
const monsterSprites=Object.fromEntries(monsterTypes.map(t=>[t.id,monsterArt(t.id)]));
function addMonster(type,rng=Math.random){const w=48*type.scale,h=64*type.scale;const x=12+rng()*(WIDTH-w-24),y=94+rng()*(HEIGHT-h-123);monsters.push({id:++monsterId,type,x,y,w,h,phase:rng()*Math.PI*2});}
function encounterChance(type){return type.chance*(paused?1:2)}
function rollMonsters(rng=Math.random){for(const type of monsterTypes)if(rng()<encounterChance(type))addMonster(type,rng)}
function advanceEncounters(dt,rng=Math.random){spawnSeconds+=dt;while(spawnSeconds>=1){spawnSeconds-=1;rollMonsters(rng)}for(const s of slashes)s.age+=dt;slashes=slashes.filter(s=>s.age<.32)}
function monsterBounds(m){return{x:Math.round(m.x),y:Math.round(m.y+Math.sin(clock*3+m.phase)),w:m.w,h:m.h}}
function drawEncounters(){for(const m of monsters){const b=monsterBounds(m);g.fillStyle='#07150b66';g.beginPath();g.ellipse(b.x+b.w/2,b.y+b.h-2,b.w*.32,3,0,0,Math.PI*2);g.fill();g.drawImage(monsterSprites[m.type.id],b.x,b.y,b.w,b.h);fill(g,b.x+b.w/2-3,b.y-5,6,2,'#ddad68')}
for(const s of slashes){const a=1-s.age/.32;g.save();g.globalAlpha=a;g.translate(s.x,s.y);const grow=1+s.age*2;g.scale(grow,grow);polygon(g,[[-27,22],[-8,-3],[21,-25],[12,-9],[-9,9]],'#e9ffef');polygon(g,[[-20,25],[0,-1],[28,-20],[13,0],[-8,16]],'#88e4d3');fill(g,-3,-3,6,6,'#fff5b8');for(let i=0;i<6;i++)fill(g,Math.cos(i*2.4)*s.age*100,Math.sin(i*2.4)*s.age*80,2,2,'#f5d397');g.restore()}
document.querySelector('#encounterCount').textContent=`場上 ${monsters.length} 隻 · 擊退 ${defeated} 隻`;
document.querySelector('#encounterRates').textContent=`${paused?'停止 · 原機率':'前進 · 雙倍機率'} ／ 每秒獨立判定：`+monsterTypes.map(type=>`${type.name} ${Math.round(encounterChance(type)*100)}%`).join(' · ');}
function strike(x,y){for(let i=monsters.length-1;i>=0;i--){const m=monsters[i],b=monsterBounds(m);if(x<b.x||x>=b.x+b.w||y<b.y||y>=b.y+b.h)continue;const sprite=monsterSprites[m.type.id],sx=Math.floor((x-b.x)/b.w*sprite.width),sy=Math.floor((y-b.y)/b.h*sprite.height);if(!monsterSprites[m.type.id].getContext('2d').getImageData(sx,sy,1,1).data[3])continue;monsters.splice(i,1);slashes.push({x,y,age:0});defeated++;return m.type.id}return null;}
canvas.addEventListener('pointerdown',e=>{if(e.button!==0)return;const b=canvas.getBoundingClientRect();strike((e.clientX-b.left)*WIDTH/b.width,(e.clientY-b.top)*HEIGHT/b.height)});
const encounterInfo=document.createElement('div');encounterInfo.className='encounters';encounterInfo.innerHTML='<span>點擊怪物揮斬</span><span id="encounterRates"></span><span id="encounterCount">場上 0 隻 · 擊退 0 隻</span>';document.querySelector('.controls').after(encounterInfo);
const forestRender=render,forestUpdate=update,forestReset=reset;
render=function(){forestRender();drawEncounters()};update=function(dt){forestUpdate(dt);advanceEncounters(dt)};reset=function(){forestReset();monsters=[];slashes=[];spawnSeconds=0;defeated=0;monsterId=0};
