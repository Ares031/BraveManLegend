import { createMessageLog } from '../world/message-log.js';
import { publishMessage, subscribeMessages } from '../world/messages.js';
import { world } from '../world/world-state.js';
import { openCharacterPanel } from './character-panel.js';

export function initGameUI({welcome,onDayNight=()=>world.toggleDayNight(),onWeather=()=>world.rerollWeather()}={}){
  const generalLog=createMessageLog(document.querySelector('#message-log'));
  const systemLog=createMessageLog(document.querySelector('#system-message-log'));
  subscribeMessages('general',message=>generalLog.append(message.text,message));
  subscribeMessages('system',message=>systemLog.append(message.text,message));
  const developer=document.querySelector('#developer-panel'),system=document.querySelector('#system-panel');
  function setDeveloperVisible(visible){
    developer.hidden=!visible;system.hidden=visible;
    document.querySelector('#toggle-developer').setAttribute('aria-expanded',String(visible));
    if(!visible)systemLog.refresh();
  }
  document.querySelector('#toggle-developer').onclick=()=>setDeveloperVisible(developer.hidden);
  const addMessage=text=>publishMessage('general',text);
  for(const button of document.querySelectorAll('[data-panel]'))button.onclick=()=>{
    window.dispatchEvent(new CustomEvent('game:open-panel',{detail:{panel:button.dataset.panel}}));
    if(button.dataset.panel==='character'){openCharacterPanel();return;}
    addMessage(`${button.textContent}功能尚未開放。`);
  };
  document.querySelector('#toggle-day-night').onclick=onDayNight;
  document.querySelector('#reroll-weather').onclick=onWeather;
  if(welcome)addMessage(welcome);
  return {addMessage,setDeveloperVisible};
}
