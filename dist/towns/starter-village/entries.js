// Replace null with a scene URL once the corresponding interior is implemented.
export const facilityScenes = { inn: null, shop: '/towns/starter-village/interiors/item-shop/index.html', tavern: '/towns/starter-village/interiors/tavern/index.html', training: null };
export function enterFacility(id){
  if(!Object.hasOwn(facilityScenes,id))return;
  const target=facilityScenes[id];
  window.dispatchEvent(new CustomEvent('town:enter-facility',{detail:{townId:'starter-village',facilityId:id,ready:Boolean(target)}}));
  if(target)window.location.assign(target);
}
