import { instanceIds } from '../player/instance-ids.js';
import { weaponDamageEnchantments } from '../content/enchantments/weaponDamage.js';

export function rollEnchantment(level,{rng=Math.random}={}){
  const definition=weaponDamageEnchantments[level];
  if(!definition)throw Error('Unknown enchantment level');
  const value=rng();if(!Number.isFinite(value)||value<0||value>=1)throw Error('Invalid RNG');
  const {min,max}=definition.costRange;
  return {type:definition.type,name:definition.name,level:definition.level,cost:min+Math.floor(value*(max-min+1))};
}
export async function createEnchantmentInstance(level,options={}){
  const enchantment=rollEnchantment(level,options);
  return {...enchantment,instanceId:await instanceIds.next('enchantment')};
}
