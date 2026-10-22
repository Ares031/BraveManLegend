// Original pixel character: the amber ranger. All coordinates are source pixels.
const basicCharacter=character;
let detailed=true,attackStart=-10,walking=false;
const inspect=document.createElement('section');
inspect.className='hero-panel';
inspect.innerHTML='<div><span class="eyebrow">CHARACTER STUDY · 02</span><h2>琥珀遊俠</h2><p>青綠披風 · 琥珀護甲 · 星紋短劍</p><div id="pose">待機 · 呼吸與披風擺動</div><p class="small">角色放大鏡 · 4× 原始像素<br>空白鍵 / J 攻擊，按鈕可切換舊版比較。</p></div><canvas id="portrait" width="160" height="192" aria-label="角色像素放大預覽"></canvas>';
document.querySelector('.footer').after(inspect);
const portrait=document.querySelector('#portrait'),pc=portrait.getContext('2d');pc.imageSmoothingEnabled=false;
const toggle=document.createElement('button');toggle.textContent='角色：精細版 ⇄';document.querySelector('.actions').prepend(toggle);
toggle.onclick=()=>{detailed=!detailed;toggle.textContent=detailed?'角色：精細版 ⇄':'角色：原始版 ⇄';canvas.focus()};
const hit=document.createElement('button');hit.textContent='⚔ 攻擊 J';document.querySelector('.actions').prepend(hit);hit.onclick=attack;
function attack(){if(open||elapsed-attackStart<.58)return;attackStart=elapsed}
window.addEventListener('keydown',e=>{if(e.code==='Space'||e.key.toLowerCase()==='j'){e.preventDefault();if(!e.repeat)attack()}});
function heroBusy(){return elapsed-attackStart<.58}
function ranger(target,x,y,scale=1){
 const age=elapsed-attackStart,attacking=age<.58,phase=Math.min(5,Math.floor(age/.095));
 const gait=walking&&!attacking?Math.floor(player.step*1.1)%6:0;
 const strides=[0,1,3,0,-1,-3],stride=walking&&!attacking?strides[gait]:0;
 const breathe=walking?0:Math.floor(Math.sin(elapsed*2.6)*.7+.5),bob=walking&&[1,2,4,5].includes(gait)?-1:breathe;
 const side=player.dir===1||player.dir===2,back=player.dir===3;
 const flip=player.dir===1?-1:1;
 target.save();target.translate(Math.round(x),Math.round(y));target.scale(scale,scale);target.scale(flip,1);
 const r=(a,b,w,h,c)=>{target.fillStyle=c;target.fillRect(a,b,w,h)};
 const p=(points,c)=>{target.fillStyle=c;target.beginPath();points.forEach(([a,b],i)=>i?target.lineTo(a,b):target.moveTo(a,b));target.closePath();target.fill()};
 target.fillStyle='#0e242955';target.beginPath();target.ellipse(0,1,11,3,0,0,Math.PI*2);target.fill();
 target.translate(attacking&&phase===2?3:0,bob);
 // Silhouette and split cloak; the hem advances in discrete pixel steps.
 const flutter=Math.floor(Math.sin(elapsed*5)*1.5)+(walking?stride:0);
 p([[-9,-30],[-13,-17],[-14+flutter,-7],[-8,-9],[-4,-6],[2,-9],[8,-7],[11,-21],[7,-31]],'#192c35');
 p([[-8,-29],[-11,-17],[-12+flutter,-10],[-7,-12],[-3,-9],[1,-12],[7,-10],[8,-23],[6,-29]],'#265561');
 p([[-7,-28],[-8,-17],[-9+flutter,-12],[-5,-14],[-2,-11],[-1,-25]],'#367582');
 r(-9,-16,2,4,'#508e91');r(-8+flutter,-12,3,1,'#a0b29a');r(4,-17,2,5,'#1b414f');
 // Boots, trousers and alternating knees.
 for(const [lx,s] of [[-7,stride],[2,-stride]]){r(lx,-13,6,10+s,'#202c39');r(lx+1,-12,3,6+s,'#4a5660');r(lx,-5+s,6,5,'#44383a');r(lx-1,-2+s,7,3,'#222a32');r(lx,-4+s,5,1,'#a08356');r(lx+1,-1+s,4,1,'#6c5b49')}
 // Jacket and faceted amber breastplate.
 r(-8,-28,16,16,'#352f37');r(-7,-27,14,13,'#8e613f');r(-5,-26,10,11,'#c38a4c');r(-4,-26,4,8,'#e7b86d');r(1,-24,3,9,'#a16b3e');r(-5,-16,11,2,'#614234');
 r(-8,-27,5,5,'#b78d56');r(-8,-27,4,2,'#efd18a');r(4,-27,5,5,'#997046');r(5,-27,3,1,'#dbbc78');r(-4,-21,8,1,'#f2c77d');r(-1,-24,2,8,'#77563d');r(-1,-23,1,5,'#f2d89b');
 r(-8,-14,16,3,'#403a36');r(-2,-14,4,3,'#d5ad64');r(-1,-13,2,1,'#f5e2a0');r(-7,-12,5,5,'#745644');r(-6,-11,3,2,'#a27b50');
 // Head: stepped outline, ears, layered hair and eye highlights.
 r(-7,-43,13,3,'#24303a');r(-9,-40,17,11,'#24303a');r(-7,-29,13,2,'#24303a');
 r(-7,-39,13,9,'#b77e60');r(-6,-39,11,8,'#edbd8b');r(-5,-38,8,6,'#f9d7a3');r(6,-36,2,4,'#d09a72');r(-8,-36,2,4,'#d09a72');r(-4,-30,7,2,'#bd8866');
 r(-6,-43,10,2,'#76503d');r(-8,-41,15,3,'#a77247');r(-8,-39,5,4,'#8d5b3e');r(-7,-41,4,2,'#d49a58');r(-3,-42,5,2,'#e3b36d');r(1,-40,4,3,'#ba8250');r(4,-39,3,4,'#684639');r(-8,-35,2,5,'#76503d');r(5,-34,2,4,'#694537');
 if(!back){if(side){r(2,-35,3,2,'#28343c');r(3,-35,1,1,'#fff0cf');r(5,-33,2,1,'#bf795e')}else{r(-5,-35,3,2,'#2b363e');r(2,-35,3,2,'#2b363e');r(-4,-35,1,1,'#f8edc9');r(3,-35,1,1,'#f8edc9');r(-1,-31,3,1,'#995d4d')}}else{r(-7,-39,13,9,'#8d5b3e');r(-6,-39,4,5,'#b7804d');r(-1,-40,3,8,'#a16b43');r(3,-38,2,8,'#694537');r(-4,-31,7,2,'#654439')}
 // Teal scarf and gold clasp.
 r(-7,-29,14,3,'#337c83');r(-5,-29,9,1,'#73b0a6');r(3,-28,3,4,'#d9b465');r(4,-28,1,1,'#fff0ba');p([[-6,-28],[-13,-25],[-16-flutter,-20],[-11,-21],[-8,-25],[-4,-26]],'#4f9290');r(-13-flutter,-22,3,1,'#a6c0a2');
 // Hands and sword pivot. Attack contains wind-up, sweep, follow-through, recovery.
 r(-10,-22,4,7,'#56666b');r(-10,-22,3,2,'#b6c2b4');r(-10,-15,4,3,'#dab085');
 const angles=[-1.5,-2.1,-.6,.7,1.0,.35];target.save();target.translate(9,-19);target.rotate(attacking?angles[phase]:.24);
 r(-2,-3,5,8,'#596a71');r(-2,-3,4,2,'#d0d3b9');r(-1,4,4,4,'#edc394');r(0,7,2,5,'#614a3c');r(-4,7,10,2,'#cca75e');r(-3,7,3,1,'#fff0b0');r(-1,10,4,17,'#283e4a');r(0,10,2,15,'#c5e5dd');r(0,10,1,13,'#f1fae3');p([[-1,26],[1,30],[3,26]],'#d8eee0');r(1,13,1,8,'#7ca8b0');target.restore();
 if(attacking&&phase>=2&&phase<=3){target.globalAlpha=phase===2?.85:.5;p([[7,-40],[26,-34],[37,-19],[33,-3],[20,7],[29,-9],[27,-21],[17,-31]],'#a9f0df');p([[15,-35],[28,-29],[33,-18],[30,-7],[31,-20],[25,-29]],'#f7ffe3');for(let i=0;i<5;i++)r(20+i*4,-25+(i*11)%29,2,2,'#ffe1a0');target.globalAlpha=1}
 target.restore();
}
character=function(){if(detailed)ranger(ctx,player.x,player.y);else basicCharacter()};
const originalFrame=frame;
frame=function(t){walking=!open&&!heroBusy()&&['w','a','s','d','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>keys.has(k));originalFrame(t);pc.clearRect(0,0,160,192);if(detailed)ranger(pc,76,177,4);else{pc.drawImage(canvas,player.x-18,player.y-45,40,48,0,0,160,192)}document.querySelector('#pose').textContent=(detailed?'精細版 · ':'原始版 · ')+(heroBusy()?'攻擊 · 蓄力 → 揮擊 → 收勢':walking?'行走 · 六段姿勢循環':'待機 · 呼吸與披風擺動')};
