'use strict';
const canvas=document.querySelector('#journey'),g=canvas.getContext('2d');
const WIDTH=480,HEIGHT=300,HORIZON=121,FOCAL=245,EYE=1.35,SPEED=4.2,FAR=95;
g.imageSmoothingEnabled=false;
let clock=0,travel=0,paused=false,last=null,seed=81293,spawnIndex=0;
const objects=[];
function random(){seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296}
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
function mix(a,b,t){return a.map((v,i)=>Math.round(v+(b[i]-v)*t))}
const rgb=a=>`rgb(${a.join(',')})`;
function fill(ctx,x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),w,h)}
function polygon(ctx,points,color){ctx.fillStyle=color;ctx.beginPath();points.forEach(([x,y],i)=>i?ctx.lineTo(Math.round(x),Math.round(y)):ctx.moveTo(Math.round(x),Math.round(y)));ctx.closePath();ctx.fill()}
function makeSprite(type,variant){const c=document.createElement('canvas');c.width=80;c.height=128;const p=c.getContext('2d');p.imageSmoothingEnabled=false;
 if(type==='tree'){
  fill(p,34,49,12,79,'#343b2a');fill(p,38,58,6,69,'#696044');fill(p,39,66,2,58,'#a58a5a');
  polygon(p,[[36,95],[23,66],[27,64],[40,84],[51,52],[54,55],[43,97]],'#4b4c31');
  const tones=['#263e30','#345337','#41653c','#527b45','#6a8b4d'];
  for(let i=0;i<28;i++){const x=10+random()*54,y=8+random()*60,r=10+random()*14;polygon(p,[[x-r,y-3],[x-r+3,y-r/2],[x-3,y-r],[x+7,y-r+2],[x+r,y-5],[x+r-2,y+9],[x+4,y+r/2], [x-r+3,y+8]],tones[Math.floor(random()*tones.length)]);}
  for(let i=0;i<55;i++){const x=10+random()*57,y=12+random()*53;fill(p,x,y,2+Math.floor(random()*5),2,random()>.45?'#8aa35c66':'#b3ba7266')}
  polygon(p,[[34,119],[28,127],[39,125],[47,127],[43,119]],'#4b4930');
 }else if(type==='grass'){
  for(let i=0;i<22;i++){const x=14+random()*52,y=120+random()*7,h=5+random()*23;polygon(p,[[x-2,y],[x-5+random()*8,y-h],[x+2,y]],['#49633b','#6f8649','#899556','#3c5435'][i%4]);}
 }else{
  fill(p,36,122,11,6,'#394035');fill(p,40,27,4,99,'#424c43');fill(p,41,31,1,89,'#a59c6b');fill(p,29,27,27,3,'#323e36');fill(p,32,9,20,19,'#293e35');fill(p,35,12,14,13,'#ead08a');fill(p,37,14,9,9,'#fff0ba');fill(p,40,12,2,14,'#7c754e');fill(p,32,20,20,2,'#6e6949');polygon(p,[[28,10],[42,1],[57,10]],'#35473b');fill(p,29,9,28,3,'#67705a');fill(p,41,0,2,4,'#c2aa6b');
 }
 return {image:c,type,variant};
}
const sprites={tree:Array.from({length:5},(_,i)=>makeSprite('tree',i)),grass:Array.from({length:4},(_,i)=>makeSprite('grass',i)),lamp:[makeSprite('lamp',0)]};
function spawn(z){const side=random()>.5?1:-1,type=spawnIndex%13===0?'lamp':random()<.5?'tree':'grass';objects.push({z,x:side*(type==='lamp'?2.35:type==='tree'?2.8+random()*9:1.85+random()*8),type,variant:Math.floor(random()*sprites[type].length),size:type==='tree'?4.5+random()*2.8:type==='lamp'?3.15:.65+random()*.6});spawnIndex++}
function reset(){clock=0;travel=0;seed=81293;spawnIndex=0;objects.length=0;for(let z=3;z<FAR;z+=.58)spawn(z);last=null}
function getNight(time){const segment=Math.floor(time/20),part=time%20,from=segment%2===0?1:0,to=1-from;return segment===0?0:from+(to-from)*clamp(part/2,0,1)}
function ground(night,bob){const skyTop=mix([135,170,146],[9,20,33],night),skyBottom=mix([199,207,151],[38,59,64],night);const sky=g.createLinearGradient(0,0,0,HORIZON);sky.addColorStop(0,rgb(skyTop));sky.addColorStop(1,rgb(skyBottom));g.fillStyle=sky;g.fillRect(0,0,WIDTH,HORIZON+8);
 for(let i=0;i<32;i++){const x=i*19-20,w=22+(i*17)%31,h=25+(i*23)%52;polygon(g,[[x-w,HORIZON+6],[x-w/2,HORIZON-h*.7],[x,HORIZON-h],[x+w/2,HORIZON-h*.8],[x+w,HORIZON+6]],rgb(mix([95,131,100],[24,45,47],night)));}
 for(let y=HORIZON;y<HEIGHT;y+=2){const depth=FOCAL*EYE/Math.max(1,y-HORIZON-bob),world=depth+travel;const grain=(Math.floor(world*1.5)%3)/2;const fog=clamp(depth/100,0,.85);const forest=mix(mix([73+grain*9,94+grain*8,53],[15,32,29],night),skyBottom,fog);fill(g,0,y,WIDTH,2,rgb(forest));const half=FOCAL*1.7/depth;let edge=Math.sin(world*2.4)*.015+Math.sin(world*5.1)*.012;const mud=mix(mix([135+grain*10,113+grain*7,77],[43,43,36],night),skyBottom,fog);fill(g,240-half*(1+edge),y,half*2*(1+edge),2,rgb(mud));
  // World-space flecks and wheel-worn tracks travel toward the viewer.
  if(depth<60){for(let i=0;i<8;i++){let cell=Math.floor(world*3);let hash=((Math.imul(cell+1,374761393)^Math.imul(i+1,668265263))>>>0);const wx=((hash%1000)/1000*3.2-1.6),xx=240+wx*FOCAL/depth;fill(g,xx,y,Math.max(1,FOCAL/depth*.025),1,rgb(mix(mud,[85,76,53],.25)));}for(const track of [-.75,.75])fill(g,240+track*FOCAL/depth,y,Math.max(1,FOCAL/depth*.04),2,`rgba(38,36,24,${.07*(1-night)})`)}
 }
}
function drawObject(o,night,bob){const s=FOCAL/o.z,h=o.size*s,w=h*80/128,x=240+o.x*s,y=HORIZON+EYE*s+bob; if(x+w/2<0||x-w/2>WIDTH||y-h>HEIGHT)return;const sprite=sprites[o.type][o.variant].image;
 g.globalAlpha=clamp(1-o.z/FAR*.85,.15,1);g.fillStyle='#0c201a35';g.beginPath();g.ellipse(x,y,w*.35,Math.max(1,h*.025),0,0,Math.PI*2);g.fill();g.drawImage(sprite,Math.round(x-w/2),Math.round(y-h),Math.ceil(w),Math.ceil(h));g.globalAlpha=1;
}
function drawLampLight(o,night,bob){const s=FOCAL/o.z,h=o.size*s,x=240+o.x*s,y=HORIZON+EYE*s+bob-h*.86;if(x< -100||x>580)return;const strength=night*.65+.08,r=Math.min(100,h*.65);g.globalCompositeOperation='screen';let halo=g.createRadialGradient(x,y,0,x,y,r);halo.addColorStop(0,`rgba(255,200,98,${strength})`);halo.addColorStop(.2,`rgba(255,177,65,${strength*.5})`);halo.addColorStop(1,'rgba(255,166,50,0)');g.fillStyle=halo;g.fillRect(x-r,y-r,r*2,r*2);g.globalCompositeOperation='source-over';}
function render(){const night=getNight(clock),bob=Math.sin(travel*2.8)*.65;ground(night,bob);objects.sort((a,b)=>b.z-a.z).forEach(o=>drawObject(o,night,bob));fill(g,0,0,WIDTH,HEIGHT,`rgba(4,16,32,${night*.5})`);objects.filter(o=>o.type==='lamp').forEach(o=>drawLampLight(o,night,bob));const vignette=g.createRadialGradient(240,150,85,240,150,280);vignette.addColorStop(0,'#07150d00');vignette.addColorStop(1,'#06181188');g.fillStyle=vignette;g.fillRect(0,0,WIDTH,HEIGHT);document.querySelector('#phase').textContent=Math.floor(clock/20)%2?'☾ 夜晚 · 路燈點亮':'☀ 白晝 · 林間微光';document.querySelector('#countdown').textContent=`${Math.ceil(20-clock%20)} 秒後轉為${Math.floor(clock/20)%2?'白晝':'夜晚'}`;document.querySelector('#distance').textContent=`旅程 ${String(Math.floor(travel)).padStart(4,'0')} m`;}
function update(dt){clock+=dt;if(!paused){const step=SPEED*dt;travel+=step;for(let i=objects.length-1;i>=0;i--){const o=objects[i];o.z-=step;if(o.z<.65){const z=o.z+FAR-.65;objects.splice(i,1);spawn(z)}}}}
function frame(t){const dt=last===null?0:Math.min((t-last)/1000,.1);last=t;if(!document.hidden)update(dt);render();requestAnimationFrame(frame)}
function toggle(){paused=!paused;document.querySelector('#pause').textContent=paused?'▶ 繼續前進':'Ⅱ 暫停前進';document.querySelector('#moving').textContent=paused?'停下腳步 · 日夜持續':'自動前進中'}
document.querySelector('#pause').onclick=toggle;document.querySelector('#restart').onclick=()=>{reset();render()};window.addEventListener('keydown',e=>{if(e.code==='Space'){e.preventDefault();if(!e.repeat)toggle()}});document.addEventListener('visibilitychange',()=>{last=null});reset();requestAnimationFrame(frame);
