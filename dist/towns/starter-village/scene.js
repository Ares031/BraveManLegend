import { village } from './data.js';
import { world } from '../../world/world-state.js';
import { drawAtmosphere, weatherLabel } from '../../world/weather-effects.js';
import { portals } from '../../world/portal-state.js';
import { townEvents } from './events.js';
import { createTownEvents } from '../../world/town-events.js';
import { enterFacility } from './entries.js';
import { initGameUI } from '../../ui/game-ui.js';

let eventStorage;try{eventStorage=globalThis.localStorage;}catch{}
const eventLog=createTownEvents(townEvents,{storage:eventStorage});
let townState=eventLog.getState();

const canvas = document.querySelector('#village'), ctx = canvas.getContext('2d');
ctx.imageSmoothingEnabled = false;
let selected = null, time = 0, worldState = world.getState();
let portalActive=portals.isActive(village.id);
const sceneObjects=[...village.buildings,village.portal,village.exit];
let exiting=false,gateOpenedAt=null;
const {addMessage}=initGameUI({
 welcome:'你來到了新手村。',
 onDayNight:()=>{worldState=world.toggleDayNight();draw();updateWorldDisplay();},
 onWeather:()=>{worldState=world.rerollWeather();draw();updateWorldDisplay();},
});window.addEventListener('town:enter-facility',e=>{if(!e.detail.ready){const b=village.buildings.find(b=>b.id===e.detail.facilityId);addMessage(`${b?.name||'設施'}的場景尚未開放。`);}});


const rect = (x,y,w,h,c) => { ctx.fillStyle=c; ctx.fillRect(Math.round(x),Math.round(y),w,h); };
function poly(points,c){ctx.fillStyle=c;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.closePath();ctx.fill();}
function oval(x,y,rx,ry,c){ctx.fillStyle=c;ctx.beginPath();ctx.ellipse(x,y,rx,ry,0,0,Math.PI*2);ctx.fill();}
let seed=7741;
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;}
const flecks=Array.from({length:2400},()=>({x:random()*960,y:random()*640,n:random()}));
const trees=Array.from({length:67},(_,i)=>({x:i<32?i*32-12: i<50?25+random()*58:865+random()*85,y:i<32?30+random()*47:75+random()*545,s:.7+random()*.5}));
function path(points,width){ctx.strokeStyle='#676b4380';ctx.lineWidth=width+7;ctx.lineJoin='round';ctx.lineCap='round';ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(x,y):ctx.moveTo(x,y));ctx.stroke();ctx.strokeStyle='#b6a47a';ctx.lineWidth=width;ctx.stroke();ctx.strokeStyle='#c5b48a';ctx.lineWidth=width-9;ctx.stroke();}
function tree({x,y,s}){ctx.save();ctx.translate(x,y);ctx.scale(s,s);oval(4,2,23,8,'#243e3444');rect(-5,-47,10,48,'#60533c');rect(-2,-42,3,39,'#94744d');for(let i=0;i<3;i++){const z=-28-i*18,w=32-i*4;poly([[-w,z],[-w+7,z-17],[-8,z-37],[7,z-39],[w-1,z-15],[w,z+2],[5,z+10]],['#344f3d','#426447','#53794d'][i]);rect(-w+12,z-10,10,3,'#81985b66');}ctx.restore();}
function fence(x,y,w){for(let i=0;i<=w;i+=17){rect(x+i,y-16,4,21,'#665c42');rect(x+i,y-16,3,3,'#c1ad7c');}rect(x,y-11,w,3,'#aa9062');rect(x,y-3,w,3,'#88764f');}
function label(b){const active=b.id===selected;ctx.font='12px "Microsoft JhengHei", sans-serif';ctx.textAlign='center';const width=ctx.measureText(b.name).width+24;rect(b.x-width/2,b.y+12,width,25,active?'#e2ce95':'#20382deF');rect(b.x-width/2,b.y+12,width,2,active?'#fff0bd':'#96a176');ctx.fillStyle=active?'#354332':'#f1e7c6';ctx.fillText(b.name,b.x,b.y+29);}
function house(b){const {x,y,w,h}=b,l=x-w/2,top=y-h,roof=b.roof;
 oval(x+5,y+2,w*.59,13,'#253d3244');
 rect(l,top,w,h,'#c7b68c');rect(l+w-17,top,17,h,'#9b936d');rect(l+4,top+5,w-25,5,'#e0cda1');
 for(let i=0;i<3;i++)rect(l+3,top+23+i*20,w-7,1,'#a3946d');
 for(const xx of [l+5,x-4,l+w-23])rect(xx,top,5,h,'#695d43');rect(l,y-6,w,7,'#817958');
 // Plaster speckles, stone footings, timber grain and forged door hinges.
 for(let i=0;i<35;i++){const f=flecks[i+Math.floor(x)];rect(l+7+f.x/960*(w-30),top+10+f.y/640*(h-20),2,1,'#f3dfb344');}
 for(let i=0;i<w;i+=12){rect(l+i,y-9,11,7,i%24?'#8d8d73':'#b1ad86');rect(l+i,y-9,10,1,'#d1c29a');}
 for(const xx of [l+6,x-3,l+w-22]){rect(xx,top+8,1,h-22,'#c3a87588');rect(xx+1,top+27,2,9,'#433f3144');}
 rect(x-10,y-34,21,34,'#4a4936');rect(x-7,y-31,15,30,'#746044');rect(x+4,y-18,2,3,'#eed68a');rect(x-16,y,34,5,'#c4b68b');
 for(let i=0;i<4;i++)rect(x-6+i*4,y-30,1,28,'#b4955a66');rect(x-8,y-27,7,2,'#353f35');rect(x-8,y-9,7,2,'#353f35');rect(x-18,y+5,38,3,'#7c795b');
 for(const xx of [l+19,l+w-43]){rect(xx,y-55,23,23,'#514e39');rect(xx+3,y-52,17,16,b.id==='home-3'&&!townState.lightsOn?'#34463e':'#e6ca84');rect(xx+5,y-51,5,13,b.id==='home-3'&&!townState.lightsOn?'#405047':'#f7dfa0');rect(xx+10,y-53,2,20,'#736244');rect(xx,y-43,23,2,'#736244');rect(xx-2,y-31,27,3,'#746044');}
 const peak=top-35;poly([[l-12,top+9],[x-10,peak],[x+w/2+12,top+9],[l+w+9,top+18],[l-12,top+18]],'#3c4837');
 poly([[l-10,top+7],[x-10,peak+2],[l+w+9,top+7],[l+w+9,top+13],[l-10,top+13]],roof);
 for(let i=0;i<5;i++){const yy=peak+8+i*9,half=(yy-peak)/(top+7-peak)*(w/2+10);rect(x-10-half,yy,half*2,2,'#e1c69344');for(let k=0;k<5;k++)rect(x-10-half+k*half*.45,yy+2,1,5,'#263e3333');}
 rect(l+w-31,peak-1,14,25,'#858064');rect(l+w-34,peak-4,20,5,'#bdb28b');
 // Individual shingles clipped to the roof silhouette.
 ctx.save();ctx.beginPath();ctx.moveTo(l-10,top+7);ctx.lineTo(x-10,peak+2);ctx.lineTo(l+w+9,top+7);ctx.closePath();ctx.clip();
 for(let row=0;row<6;row++)for(let col=0;col<15;col++){const xx=l-20+col*13+(row%2)*6,yy=peak+row*8;rect(xx,yy,11,1,'#f4d3a755');rect(xx+11,yy,1,7,'#283b3555');rect(xx+2,yy+6,9,1,'#293a3444');}
 ctx.restore();rect(l-11,top+13,w+30,3,'#c6ae7555');
 if(b.kind!=='home'){
  const sx=l-18,sy=y-63;rect(sx,sy-8,3,42,'#64563b');rect(sx,sy-8,26,3,'#64563b');rect(sx+7,sy-6,1,8,'#343f35');rect(sx+23,sy-6,1,8,'#343f35');rect(sx+3,sy+1,27,23,'#534d35');rect(sx+5,sy+3,23,19,'#c8b17a');
  ctx.fillStyle='#514e36';ctx.textAlign='center';ctx.font='bold 16px serif';ctx.fillText({inn:'☾',shop:'✦',tavern:'♜'}[b.kind],sx+16,sy+19);
 }
 if(b.kind==='inn'){rect(l+11,y-26,31,3,'#68573c');for(let i=0;i<4;i++){rect(l+13+i*8,y-24,2,12,'#695a3d');}rect(l+11,y-13,31,3,'#b2935c');}
 if(b.kind==='home'){const xx=l+w+12;rect(xx,y-20,16,19,'#84704b');rect(xx,y-17,16,2,'#c2a76b');rect(xx+3,y-13,2,8,'#b39a60');rect(xx+11,y-13,2,8,'#514e37');}
 if(b.kind==='inn'||b.kind==='tavern'){for(let i=0;i<3;i++){const phase=(time*.012+i*.35)%1;oval(l+w-24+Math.sin(phase*5+i)*6,peak-9-phase*30,4+phase*7,3+phase*3,`rgba(222,224,195,${(1-phase)*.22})`);}}
 if(b.kind==='shop'){for(let i=0;i<6;i++){rect(l+10+i*18,y-30,18,9,i%2?'#d4c79a':'#527b68');}rect(l+11,y-21,3,23,'#65583d');rect(l+115,y-21,3,23,'#65583d');rect(l+10,y-8,109,7,'#9c7a4e');for(let i=0;i<5;i++){rect(l+22+i*16,y-16,7,7,['#d5b466','#829b6c','#b67c58'][i%3]);}}
 if(b.kind==='tavern'){for(const xx of [l-14,l+w+5]){oval(xx,y-8,9,5,'#514b35');rect(xx-9,y-19,18,17,'#947349');rect(xx-9,y-16,18,3,'#494d3c');rect(xx-9,y-5,18,3,'#494d3c');}}
 for(const xx of [l+8,l+w-10]){rect(xx-5,y-1,11,6,'#917349');oval(xx,y-4,9,6,'#557547');rect(xx-4,y-8,3,3,'#e2c483');}
}
function training(b){const l=b.x-b.w/2,t=b.y-b.h;rect(l,t,b.w,b.h,'#a19366');for(let i=0;i<100;i++){const a=flecks[i];rect(l+a.x/960*b.w,t+a.y/640*b.h,3,1,'#d4c18a77');}fence(l,t+9,b.w);fence(l,t+b.h,b.w*.3);fence(l+b.w*.7,t+b.h,b.w*.3);
 for(const dx of [-47,10]){const x=b.x+dx,y=t+62;rect(x-3,y-26,6,47,'#6b5940');rect(x-19,y-18,38,6,'#967b4b');rect(x-10,y-30,20,25,'#baa06a');rect(x-7,y-28,14,21,'#d8be7f');oval(x,y-39,10,10,'#bda272');rect(x-10,y-41,20,3,'#746247');rect(x-12,y+19,24,4,'#776449');}
 const x=l+b.w-27,y=t+47;rect(x-2,y-2,4,42,'#6f6045');oval(x,y,16,20,'#695e43');oval(x,y,13,17,'#d6c393');oval(x,y,8,11,'#9f654e');oval(x,y,3,5,'#e5cd94');
 rect(l+15,t+b.h-29,38,5,'#665a40');rect(l+19,t+b.h-24,4,17,'#665a40');rect(l+45,t+b.h-24,4,17,'#665a40');}
function well(){oval(470,335,34,13,'#34493444');oval(466,329,24,13,'#777e68');rect(442,315,48,14,'#9d9e7d');oval(466,315,24,11,'#c4bf96');oval(466,315,16,6,'#344d4d');for(const x of [441,486])rect(x,273,5,48,'#6e5b3e');poly([[433,277],[465,257],[499,277]],'#657859');rect(433,277,66,5,'#42553d');rect(462,282,3,25,'#b7a276');}
function drawPortal(){
 const {x,y}=village.portal;
 oval(x,y+1,47,15,'#34473466');oval(x,y-1,42,13,'#777e6b');oval(x,y-4,34,10,'#b3b097');
 ctx.strokeStyle='#414c4a';ctx.lineWidth=15;ctx.beginPath();ctx.ellipse(x,y-43,27,37,0,Math.PI,Math.PI*2);ctx.stroke();
 rect(x-34,y-43,14,36,'#7b877d');rect(x+20,y-43,14,36,'#7b877d');
 ctx.strokeStyle='#a4b0a0';ctx.lineWidth=10;ctx.beginPath();ctx.ellipse(x,y-43,27,37,0,Math.PI,Math.PI*2);ctx.stroke();
 for(const xx of [x-34,x+20])for(let i=0;i<4;i++){rect(xx,y-40+i*9,14,1,'#465753');rect(xx+3,y-37+i*9,5,2,portalActive?'#8be8d8':'#596d65');}
 oval(x,y-39,20,32,portalActive?'#306b73bb':'#293e3444');
 if(portalActive){
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<5;i++){ctx.strokeStyle=`rgba(126,227,229,${.22+i*.09})`;ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(x+Math.sin(time*.001+i)*3,y-39,7+i*3,12+i*4,time*.0003+i*.4,0,Math.PI*2);ctx.stroke();}
  for(let i=0;i<12;i++){const phase=(time*.0003+i/12)%1;rect(x+Math.sin(i*7+time*.001)*23,y-8-phase*66,2,2,'#bef8df');}ctx.restore();
 }
 rect(x-5,y-82,10,8,portalActive?'#a9f6dc':'#65766c');
}
function usePortal(){
 const dialog=document.querySelector('#portal-dialog'),list=document.querySelector('#portal-destinations'),message=document.querySelector('#portal-message');
 list.replaceChildren();
 try{
  if(!portals.isActive(village.id)){
   portals.activate(village.id);portalActive=true;
   message.textContent='新手村的傳送門已永久啟用！再次點擊傳送門即可選擇已啟用的目的地。';
  }else{
   portalActive=true;const destinations=portals.availableFrom(village.id);
   message.textContent=destinations.length?'選擇已啟用的城鎮傳送門：':'目前尚無其他已啟用的傳送門。探索其他城鎮並啟用當地傳送門後，即可在這裡傳送。';
   for(const place of destinations){const button=document.createElement('button');button.textContent=`傳送至 ${place.name}`;button.onclick=()=>{try{window.location.assign(portals.destination(village.id,place.id));}catch(error){message.textContent=error.message;}};list.append(button);}
  }
 }catch(error){message.textContent=error.message;}

 draw();if(!dialog.open)dialog.showModal();
}
function drawGate(){
 const {x,y,w}=village.exit,l=x-w/2,opening=gateOpenedAt===null?0:Math.min(1,(performance.now()-gateOpenedAt)/220);
 oval(x,y+3,w*.65,9,'#243d3544');
 for(const xx of [l,x+w/2]){rect(xx-4,y-46,8,48,'#62563e');rect(xx-3,y-46,5,45,'#ac9060');poly([[xx-6,y-46],[xx,y-52],[xx+6,y-46]],'#b8a475');rect(xx-5,y-10,10,4,'#555e49');}
 for(const side of [-1,1]){
  const pivot=x+side*w/2,leaf=w/2*(1-opening*.8),left=side<0?pivot:pivot-leaf;
  for(let i=0;i<5;i++){const xx=left+i*leaf/5;rect(xx,y-35,Math.max(2,leaf/5-2),34,'#987b50');rect(xx,y-35,2,31,'#c1a271');}
  rect(left,y-28,leaf,4,'#695c40');rect(left,y-10,leaf,4,'#695c40');
  poly([[left,y-7],[left+leaf,y-31],[left+leaf,y-27],[left,y-3]],'#c2a270');
  rect(pivot-3,y-29,6,3,'#4a5747');rect(pivot-3,y-11,6,3,'#4a5747');
 }
 if(!opening)rect(x-8,y-20,16,4,'#525d47');
}
function drawHiddenChests(){
 for(const chest of townEvents.chests){
  const {x,y}=chest,opened=townState.chests[chest.id].opened;
  if(chest.location==='pond'){
   // The submerged chest only breaks the surface with its lid edge.
   rect(x-10,y,20,1,opened?'#53746e':'#b99862');
   rect(x-9,y+1,18,1,'#425f5577');
  }else{
   // A new low bush conceals all but the upper-right corner.
   oval(x+4,y+4,26,9,'#294b3544');
   rect(x-11,y-9,21,17,'#715538');rect(x-11,y-9,22,2,opened?'#79795a':'#c2a16a');
   rect(x+9,y-7,2,7,opened?'#79795a':'#c2a16a');
   for(const [dx,dy,r,c] of [[-18,0,12,'#416644'],[-7,7,15,'#4d7048'],[13,8,12,'#54764b'],[-15,-7,10,'#5d8150']]){
    poly([[x+dx-r,y+dy+3],[x+dx-r+3,y+dy-6],[x+dx,y+dy-r],[x+dx+r-2,y+dy-5],[x+dx+r,y+dy+5],[x+dx,y+dy+8]],c);
    rect(x+dx-4,y+dy-5,5,2,'#96a76788');
   }
   // Deliberate tiny corner left outside the foliage silhouette.
   rect(x+7,y-9,4,2,opened?'#6a7759':'#d2b77b');rect(x+9,y-7,2,4,opened?'#6a7759':'#a68a58');
  }
 }
}
function hitChest(x,y){return townEvents.chests.find(chest=>Math.abs(x-chest.x)<=chest.hitWidth/2&&Math.abs(y-chest.y)<=chest.hitHeight/2);}
function useChest(chest){
 townState=eventLog.clickBuilding(chest.id).state;
 const result=eventLog.openChest(chest.id);townState=result.state;
 if(result.firstOpen)addMessage('取得道具（內容待補）');
 else addMessage('這個寶箱已經開啟過了。');
 draw();updateWorldDisplay();
}
function draw(){rect(0,0,960,640,'#78905c');for(const f of flecks){rect(f.x,f.y,f.n>.8?3:2,f.n>.9?3:1,f.n>.5?'#b6ba6b55':'#395e3e44');}
 path([[478,654],[477,390],[466,310],[480,217],[480,100]],39);path([[218,212],[224,272],[469,294],[687,276],[688,215]],28);path([[229,432],[230,467],[332,465],[478,390],[696,400],[697,435]],30);path([[395,515],[395,474],[478,461],[533,474],[533,518]],20);path([[410,144],[410,194],[539,195],[539,151]],18);
 oval(470,319,65,40,'#aea27a');for(let i=0;i<38;i++){const f=flecks[i+400];rect(416+f.x/960*108,293+f.y/640*48,7,3,'#d1c39c88');}
 // Wildflowers and tufted grass around the outer gardens.
 for(let i=0;i<170;i++){const f=flecks[i+1100];if((f.x>95&&f.x<170)||(f.x>775&&f.x<850)||(f.y>565&&f.x<400)){rect(f.x,f.y,1,5,'#456b42');rect(f.x-2,f.y+1,2,1,'#a1b16a');if(i%4===0){rect(f.x-1,f.y-2,3,2,i%3?'#e3c98d':'#d7b0a0');}}}
 // Stepping stones, stacked firewood and a hand cart near the tavern.
 for(let i=0;i<5;i++){rect(265+i*12,301+i*2,8,3,'#d4c69d');rect(265+i*12,304+i*2,8,1,'#8b8766');}
 for(let row=0;row<3;row++)for(let col=0;col<4-row;col++){const xx=310+col*10+row*4,yy=427-row*6;rect(xx,yy,9,6,'#795b3e');oval(xx+7,yy+3,3,3,'#c1a070');rect(xx+6,yy+2,2,1,'#78603f');}
 rect(324,397,33,15,'#9b7e50');for(let i=0;i<4;i++)rect(324,398+i*4,33,1,'#d0ac6b');for(const xx of [329,352]){oval(xx,414,6,6,'#4b5139');oval(xx,414,3,3,'#bd9f65');}rect(355,398,18,3,'#735e3f');
 // Small kitchen gardens and a quiet pond give the village its rural edges.
 rect(329,220,54,40,'#6e6443');for(let i=0;i<4;i++){rect(334,225+i*9,44,3,'#a18c5b');for(let j=0;j<5;j++)rect(337+j*8,222+i*9,4,4,'#aec080');}fence(324,262,64);
 oval(126,521,37,53,'#566f53');oval(126,519,31,46,'#638b83');for(let i=0;i<8;i++)rect(105+i%3*12,490+i*8,13,2,'#b5ccad77');
 for(const [x,y] of [[345,370],[595,330],[806,310],[340,568]]){rect(x,y,3,26,'#686044');rect(x-5,y-5,13,10,'#b29d64');rect(x-3,y-3,9,6,'#f3d79a');poly([[x-7,y-5],[x+1,y-11],[x+8,y-5]],'#4f6043');}
 const layers=trees.map(t=>({y:t.y,draw:()=>tree(t)}));for(const b of village.buildings)layers.push({y:b.y,draw:()=>b.kind==='training'?training(b):house(b)});layers.push({y:333,draw:well},{y:village.portal.y,draw:drawPortal});layers.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
 // Foreground fence leaves an opening on the village's main road.
 fence(177,611,241);fence(538,611,267);
 drawGate();drawHiddenChests();atmosphere();for(const b of sceneObjects)label(b);
 const shade=ctx.createRadialGradient(480,310,210,480,320,610);shade.addColorStop(0,'#142c2400');shade.addColorStop(1,'#142c2466');ctx.fillStyle=shade;ctx.fillRect(0,0,960,640);
}
function select(b){
 selected=b.id;
 const result=eventLog.clickBuilding(b.id);townState=result.state;

 if(result.justTriggered){addMessage('屋內傳來一聲輕響……你觸發了民房三的隱藏事件！');window.dispatchEvent(new CustomEvent('town:hidden-event',{detail:{townId:village.id,eventId:townEvents.lightSwitch.eventId}}));}
 draw();if(b.kind==='portal'){usePortal();return;}
 if(b.kind==='gate'){
  if(exiting)return;exiting=true;gateOpenedAt=performance.now();
  addMessage('推開村口木門，前往微風草原。');
  setTimeout(()=>window.location.assign(b.destination),250);return;
 }
 enterFacility(b.id);
}
function hit(x,y){return [...sceneObjects].sort((a,b)=>b.y-a.y).find(b=>x>=b.x-b.w/2-12&&x<=b.x+b.w/2+12&&y>=b.y-b.h-(b.kind==='training'||b.kind==='portal'?0:35)&&y<=b.y+37);}
canvas.addEventListener('click',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*960/r.width,y=(e.clientY-r.top)*640/r.height,chest=hitChest(x,y);if(chest){useChest(chest);return;}const b=hit(x,y);if(b)select(b);});
canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect(),x=(e.clientX-r.left)*960/r.width,y=(e.clientY-r.top)*640/r.height;canvas.style.cursor=hitChest(x,y)||hit(x,y)?'pointer':'default';});
function frame(t){time=t;worldState=world.getState();if(!document.hidden){draw();updateWorldDisplay();}requestAnimationFrame(frame);}requestAnimationFrame(frame);

function updateWorldDisplay(){
 const night=worldState.phase==='night';
 document.querySelector('.weather').textContent=`${night?'☾ 夜晚':'☀ 白晝'} · ${weatherLabel(worldState.weather)}`;
 const status=document.querySelector('#world-status');
 const text=`${worldState.nextPhaseSeconds} 秒後${night?'天亮':'入夜'} · ${worldState.nextWeatherSeconds} 秒後判定天氣${worldState.persistent?'':' · 瀏覽器無法儲存世界進度'}`;
 if(status.textContent!==text)status.textContent=text;
 document.querySelector('#debug-portal').textContent=portalActive?'已啟用':'未啟用';
 document.querySelector('#debug-lights').textContent=townState.lightsOn?'開燈':'關燈';
 document.querySelector('#debug-clicks').textContent=`${townState.consecutiveClicks} / ${townEvents.lightSwitch.threshold}`;
 document.querySelector('#debug-event').textContent=townState.hiddenEvent.triggered?'已觸發':'未觸發';
}

function atmosphere(){
 const lights=[];
 for(const b of village.buildings.filter(b=>b.kind!=='training'&&(b.id!==townEvents.lightSwitch.buildingId||townState.lightsOn))){
  lights.push({x:b.x-b.w/2+29,y:b.y-44,radius:42},{x:b.x+b.w/2-31,y:b.y-44,radius:42});
 }
 for(const [x,y] of [[345,370],[595,330],[806,310],[340,568]])lights.push({x,y,radius:50});
 drawAtmosphere(ctx,{width:canvas.width,height:canvas.height,time:time/1000,state:worldState,lights});
}
