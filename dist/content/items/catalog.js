import { oneHandedSwords } from './weapons/oneHandedSword.js';
import { twoHandedSwords } from './weapons/twoHandedSword.js';
import { daggers } from './weapons/dagger.js';
import { bows } from './weapons/bow.js';
import { spears } from './weapons/spear.js';
import { hammers } from './weapons/hammer.js';
import { throwingWeapons } from './weapons/throwing.js';
import { unarmedWeapons } from './weapons/unarmed.js';
import { isItemIdForType } from './id-rules.js';
export const weaponsByType={oneHandedSword:oneHandedSwords,twoHandedSword:twoHandedSwords,dagger:daggers,bow:bows,spear:spears,hammer:hammers,throwing:throwingWeapons,unarmed:unarmedWeapons};
export const allItems=Object.values(weaponsByType).flat();
const itemIndex=new Map();
for(const [type,items] of Object.entries(weaponsByType))for(const item of items){
  if(!Number.isSafeInteger(item.id)||item.id<=0)throw Error('Item ID must be a positive integer');
  if(itemIndex.has(item.id))throw Error(`Duplicate item ID: ${item.id}`);
  if(item.weaponType!==type)throw Error(`Weapon type mismatch: ${item.id}`);
  if(!isItemIdForType(item.id,'weapon',type))throw Error(`Item ID/category mismatch: ${item.id}`);
  itemIndex.set(item.id,item);
}
export const getItem=id=>itemIndex.get(id);
