import { equipmentQualities } from '../content/items/qualities.js';
import { getItem } from '../content/items/catalog.js';
import { instanceIds } from '../player/instance-ids.js';
import { buildEquipment } from './equipment.js';

function sample(rng){const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw Error('RNG must return [0, 1)');return value;}
function integer(min,max,rng){return min+Math.floor(sample(rng)*(max-min+1));}
function weighted(entries,rng){
  const total=entries.reduce((sum,[,weight])=>sum+weight,0);
  if(!entries.length||total<=0)throw Error('Empty quality distribution');
  // Decimal weights such as .6+.3+.1 can sum just below 1 in JavaScript.
  let value=sample(rng)*(Math.abs(total-1)<1e-12?1:total);
  for(const [id,weight] of entries){value-=weight;if(value<0)return id;}
  return entries.at(-1)[0];
}
export function createEquipment(itemId,{source='monster',qualityWeights,rng=Math.random}={}){
  const definition=getItem(itemId);
  if(!definition?.allowedQualities)throw Error('Unknown equipment');
  const unique=definition.allowedQualities.length===1&&definition.allowedQualities[0]==='unique';
  const quality=source==='shop'?'common':unique?'unique':weighted(Object.entries(qualityWeights||{}).filter(([id,weight])=>definition.allowedQualities.includes(id)&&equipmentQualities[id]&&weight>0),rng);
  if(!definition.allowedQualities.includes(quality))throw Error('Unsupported shop quality');
  return buildEquipment(definition,{quality,source,rng});
}
export function rollMonsterDrops(settings,{rng=Math.random}={}){
  const total=settings.categories.reduce((sum,category)=>sum+category.chance,0);
  if(!Number.isFinite(total)||total>1+1e-9||settings.categories.some(c=>!Number.isFinite(c.chance)||c.chance<0))throw Error('Invalid drop chances');
  if(!Number.isSafeInteger(settings.itemRolls)||settings.itemRolls<0)throw Error('Invalid roll count');
  const gold=integer(settings.gold.min,settings.gold.max,rng),rolls=[];
  for(let i=0;i<settings.itemRolls;i++){
    let roll=sample(rng),category;
    for(const candidate of settings.categories){roll-=candidate.chance;if(roll<0){category=candidate;break;}}
    if(!category){rolls.push({status:'none'});continue;}
    if(!category.items.length){rolls.push({status:'pending',category:category.id});continue;}
    const itemId=category.items[integer(0,category.items.length-1,rng)],definition=getItem(itemId);
    if(!definition)throw Error('Unknown drop item');
    rolls.push({status:'dropped',category:category.id,item:createEquipment(itemId,{qualityWeights:settings.equipmentQualities,rng})});
  }
  return {mapId:settings.mapId,gold,rolls};
}
export async function createEquipmentInstance(itemId,options={}){
  const item=createEquipment(itemId,options);
  return {...item,instanceId:await instanceIds.next('equipment')};
}
export async function rollMonsterDropInstances(settings,options={}){
  const loot=rollMonsterDrops(settings,options);
  for(const roll of loot.rolls)if(roll.status==='dropped')roll.item.instanceId=await instanceIds.next('equipment');
  return loot;
}
