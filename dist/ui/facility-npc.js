// Independent transparent character and menu layers over an interior scene.
export function addFacilityNPC({canvas,imageUrl,alt,title,greeting,actions,onTalk,addMessage}){
  const scene=canvas.closest('.scene'),npc=document.createElement('button');
  npc.type='button';npc.className='facility-npc';npc.setAttribute('aria-label',`與${title}交談`);
  const portrait=document.createElement('img');portrait.src=imageUrl;portrait.alt=alt;
  portrait.onerror=()=>addMessage(`${title}圖片載入失敗，請重新整理。`);
  npc.append(portrait);npc.onclick=onTalk;scene.append(npc);
  const menu=document.createElement('section');menu.className='facility-menu';menu.setAttribute('aria-label',`${title}功能`);
  const heading=document.createElement('h2');heading.textContent=title;
  const text=document.createElement('p');text.textContent=greeting;menu.append(heading,text);
  for(const {label,message} of actions){const button=document.createElement('button');button.type='button';button.textContent=label;button.onclick=()=>addMessage(message);menu.append(button);}
  scene.append(menu);
}
