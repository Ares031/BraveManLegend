// Fixed category codes: never derive IDs from current import/array positions.
export const itemTypeCodes={
  weapon:{oneHandedSword:10,twoHandedSword:11,dagger:12,bow:13,spear:14,hammer:15,throwing:16,unarmed:17},
  armor:{helmet:20,armor:21,leggings:22,boots:23,gloves:24},
  accessory:{ring:30,necklace:31,earring:32},
};
export function makeItemId(category,type,serial){
  const code=itemTypeCodes[category]?.[type];
  if(code===undefined||!Number.isInteger(serial)||serial<1||serial>999)throw Error('Invalid item type or serial (001–999)');
  return code*1000+serial;
}
export function isItemIdForType(id,category,type){
  return Number.isSafeInteger(id)&&itemTypeCodes[category]?.[type]===Math.floor(id/1000)&&id%1000>=1;
}
export const instancePrefixes={equipment:'eq',item:'itm',runestone:'ru',enchantment:'eh'};
