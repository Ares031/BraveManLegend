import { equipmentQualities,maxEnchantmentCapacity } from '../content/items/qualities.js';

const scalableFields=['minDamage','maxDamage','attack','defense','trueDamage','STR','AGI','INT','CON','LUK'];
function integer(min,max,rng){const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Invalid RNG');return min+Math.floor(value*(max-min+1));}
export function buildEquipment(definition,{quality,source='monster',rng=Math.random}={}){
  const rule=equipmentQualities[quality];
  if(!rule)throw Error('Unknown quality');
  const stats={};
  for(const field of scalableFields)if(definition[field]!==undefined)stats[field]=quality==='unique'?definition[field]:Math.round(definition[field]*rule.multiplier);
  const attributeBonuses=Object.fromEntries(Object.entries(definition.attributeBonuses||{}).map(([key,value])=>[key,quality==='unique'?value:Math.round(value*rule.multiplier)]));
  const socketCount=quality==='unique'?definition.socketCount:integer(rule.sockets.min,rule.sockets.max,rng);
  const capacity=quality==='unique'?definition.enchantmentCapacity:integer(rule.enchantmentCapacity.min,rule.enchantmentCapacity.max,rng);
  if(!Number.isSafeInteger(socketCount)||socketCount<0||!Number.isSafeInteger(capacity)||capacity<0||capacity>maxEnchantmentCapacity)throw Error('Invalid fixed equipment properties');
  return {
    itemId:definition.id,name:definition.name,source,quality,...stats,
    weight:definition.weight,price:quality==='unique'?definition.price:Math.round(definition.price*rule.priceMultiplier),criticalRate:definition.criticalRate,
    attributeBonuses,effects:structuredClone(definition.effects||[]),
    runeSockets:Array(socketCount).fill(null),enchantmentCapacity:capacity,enchantments:[],
  };
}
export function usedEnchantmentCapacity(equipment){
  return equipment.enchantments.reduce((sum,enchantment)=>{
    if(!Number.isSafeInteger(enchantment.cost)||enchantment.cost<1)throw Error('Invalid enchantment cost');
    return sum+enchantment.cost;
  },0);
}
export function applyEnchantment(equipment,enchantment){
  if(!Number.isSafeInteger(equipment.enchantmentCapacity)||equipment.enchantmentCapacity<0||equipment.enchantmentCapacity>maxEnchantmentCapacity)throw Error('Invalid enchantment capacity');
  if(!/^eh-\d{8}$/.test(enchantment.instanceId))throw Error('Invalid enchantment instance');
  if(equipment.enchantments.some(item=>item.instanceId===enchantment.instanceId))throw Error('Enchantment already applied');
  const next=structuredClone(equipment);next.enchantments.push(structuredClone(enchantment));
  if(usedEnchantmentCapacity(next)>next.enchantmentCapacity)throw Error('附魔容量不足');
  return next;
}
export function raiseEnchantmentCapacity(equipment,amount=1){
  if(!Number.isSafeInteger(amount)||amount<1||!Number.isSafeInteger(equipment.enchantmentCapacity)||equipment.enchantmentCapacity<0||equipment.enchantmentCapacity+amount>maxEnchantmentCapacity)throw Error('附魔容量強化上限為 6');
  return {...structuredClone(equipment),enchantmentCapacity:equipment.enchantmentCapacity+amount};
}
