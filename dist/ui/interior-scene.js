import { initGameUI } from './game-ui.js';
import { world } from '../world/world-state.js';
import { weatherLabel } from '../world/weather-effects.js';

export function initInterior({canvasId,imageUrl,welcome}){
  const canvas=document.getElementById(canvasId),ctx=canvas.getContext('2d');
  const {addMessage}=initGameUI({welcome,onDayNight:()=>{world.toggleDayNight();updateStatus();},onWeather:()=>{world.rerollWeather();updateStatus();}});
  const artwork=new Image();
  artwork.onload=()=>{ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(artwork,0,0,canvas.width,canvas.height);canvas.dataset.loaded='true';};
  artwork.onerror=()=>addMessage('場景圖片載入失敗，請重新整理。');
  artwork.src=imageUrl;
  function updateStatus(){
    const state=world.getState();
    document.querySelector('.weather').textContent=`${state.phase==='night'?'☾ 夜晚':'☀ 白晝'} · ${weatherLabel(state.weather)}`;
    document.querySelector('#world-status').textContent=`${state.nextPhaseSeconds} 秒後日夜交替 · ${state.nextWeatherSeconds} 秒後判定天氣${state.persistent?'':' · 瀏覽器無法儲存世界進度'}`;
  }
  updateStatus();setInterval(updateStatus,1000);
  return {canvas,ctx,addMessage};
}
