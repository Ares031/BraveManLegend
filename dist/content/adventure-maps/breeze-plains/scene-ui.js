import '../../../world/journey-world.js';
import { initGameUI } from '../../../ui/game-ui.js';
import { dropSettings } from './drops.js';
import { rollMonsterDropInstances } from '../../../world/loot.js';
import { equipmentQualities } from '../../items/qualities.js';
import { publishMessage } from '../../../world/messages.js';
import { formatMoney } from '../../../config/economy.js';
import { createRoamingState,advanceRoaming } from '../../../world/monster-movement.js';
window.monsterMovement={createRoamingState,advanceRoaming};
initGameUI({welcome:'你來到了微風草原。'});
window.addEventListener('monster:defeated',async e=>{
  let loot;
  try{loot=await rollMonsterDropInstances(dropSettings);}catch{publishMessage('general','掉落編號儲存失敗，這次掉落未完成。');return;}
  window.lastMonsterLoot=loot;
  publishMessage('system',`怪物掉落金幣 ${formatMoney(loot.gold)}`);
  for(const roll of loot.rolls)if(roll.status==='dropped'){
    const quality=equipmentQualities[roll.item.quality];
    publishMessage('general',`怪物掉落：${quality.name} ${roll.item.name}`,{quality:roll.item.quality});
  }
  document.querySelector('#last-drop').textContent=`金幣 ${formatMoney(loot.gold)} · `+loot.rolls.map(roll=>roll.status==='none'?'未掉落':roll.status==='pending'?`${roll.category}（道具待建立）`:`${equipmentQualities[roll.item.quality].name} ${roll.item.name}（${roll.item.runeSockets.length} 洞／附魔容量 ${roll.item.enchantmentCapacity}）`).join('／');
  window.dispatchEvent(new CustomEvent('loot:rolled',{detail:{monsterId:e.detail.id,...loot}}));
});
