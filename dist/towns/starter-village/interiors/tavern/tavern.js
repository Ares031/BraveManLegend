import { initGameUI } from '../../../../ui/game-ui.js';
import { world } from '../../../../world/world-state.js';
import { weatherLabel } from '../../../../world/weather-effects.js';

const canvas=document.querySelector('#tavern'),ctx=canvas.getContext('2d');
const {addMessage}=initGameUI({welcome:'你走進了酒吧，溫暖的爐火照亮木造大廳。',onDayNight:()=>{world.toggleDayNight();updateStatus();},onWeather:()=>{world.rerollWeather();updateStatus();}});
const scene=canvas.closest('.scene');
const hostess=document.createElement('button');
hostess.className='tavern-npc';hostess.type='button';hostess.setAttribute('aria-label','與黎姐交談');
const portrait=document.createElement('img');
portrait.src=new URL('./assets/tavern-hostess-anime.png',import.meta.url).href;
portrait.alt='身穿綠色束身衣與酒紅長裙、微笑站立的成年黎姐';
portrait.onerror=()=>addMessage('黎姐圖片載入失敗，請重新整理。');
hostess.append(portrait);scene.append(hostess);
hostess.onclick=()=>addMessage('黎姐微笑看向你。交談內容稍後開放。');
const menu=document.createElement('section');menu.className='tavern-menu';menu.setAttribute('aria-label','酒吧功能');
const title=document.createElement('h2');title.textContent='黎姐';
const greeting=document.createElement('p');greeting.textContent='旅人，進來歇歇腳吧。';menu.append(title,greeting);
for(const [name,message] of [['交談','交談內容稍後開放。'],['打聽消息','村莊傳聞稍後開放。'],['查看委託','酒吧委託稍後開放。']]){
 const button=document.createElement('button');button.type='button';button.textContent=name;button.onclick=()=>addMessage(message);menu.append(button);
}
scene.append(menu);
// Interior lighting belongs to the painted scene. Outdoor rain/fog stays outside.
const artwork=new Image();
artwork.onload=()=>{ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(artwork,0,0,canvas.width,canvas.height);canvas.dataset.loaded='true';};
artwork.onerror=()=>addMessage('酒吧場景圖片載入失敗，請重新整理。');
artwork.src=new URL('./assets/tavern-interior.png',import.meta.url).href;
function updateStatus(){
  const state=world.getState();
  document.querySelector('.weather').textContent=`${state.phase==='night'?'☾ 夜晚':'☀ 白晝'} · ${weatherLabel(state.weather)}`;
  document.querySelector('#world-status').textContent=`${state.nextPhaseSeconds} 秒後日夜交替 · ${state.nextWeatherSeconds} 秒後判定天氣${state.persistent?'':' · 瀏覽器無法儲存世界進度'}`;
}
updateStatus();setInterval(updateStatus,1000);
