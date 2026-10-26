import { player } from '../player/player-state.js';
import { playerGroups } from '../player/definitions.js';

export function openCharacterPanel(){
  let dialog=document.querySelector('#character-panel');
  if(!dialog){dialog=document.createElement('dialog');dialog.id='character-panel';dialog.setAttribute('aria-labelledby','character-title');document.querySelector('main').append(dialog);}
  dialog.replaceChildren();
  const title=document.createElement('h2');title.id='character-title';title.textContent='人物狀態';dialog.append(title);
  const status=player.getStatus();
  if(!status.persistent){const warning=document.createElement('p');warning.className='player-warning';warning.textContent='玩家存檔無法載入或儲存，目前顯示預設資料；原存檔未覆寫。';dialog.append(warning);}
  const sections=document.createElement('div');sections.className='character-sections';
  const state=player.getState();
  for(const group of playerGroups){
    const section=document.createElement('section');section.dataset.group=group.id;
    const heading=document.createElement('h3');heading.textContent=group.name;section.append(heading);
    const list=document.createElement('dl');list.className='character-stats';
    for(const field of group.fields){
      const term=document.createElement('dt'),value=document.createElement('dd');term.textContent=field.name;value.dataset.stat=field.id;
      const amount=state[group.id][field.id];value.textContent=field.unit==='percent'?`${Number((amount*100).toFixed(2))}%`:String(amount);list.append(term,value);
    }
    section.append(list);sections.append(section);
  }
  dialog.append(sections);
  const note=document.createElement('p');note.className='player-note';note.textContent='戰鬥屬性與熟練度初始值暫為 0，計算及成長規則待設定。';dialog.append(note);
  const form=document.createElement('form');form.method='dialog';const close=document.createElement('button');close.textContent='關閉';form.append(close);dialog.append(form);
  if(!dialog.open)dialog.showModal();
}
