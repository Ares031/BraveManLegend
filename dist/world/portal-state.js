import { portalConfig } from '../config/portals.js';

export function createPortals({storage, destinations=portalConfig.destinations}={}) {
  const known = id => destinations.find(place=>place.id===id);
  let enabled = new Set();
  function load(){
    try {
      const saved=JSON.parse(storage.getItem(portalConfig.storageKey));
      if(saved?.version===1&&Array.isArray(saved.enabled))enabled=new Set(saved.enabled.filter(id=>typeof id==='string'));
    } catch { /* Keep in-memory state if storage is unavailable. */ }
  }
  function isActive(id){load();return enabled.has(id);}
  function activate(id){
    if(!known(id))throw Error('找不到這座城鎮的傳送門。');
    load();
    if(enabled.has(id))return;
    const next=new Set(enabled);next.add(id);
    // Do not show a permanent unlock unless it was successfully saved.
    try {storage.setItem(portalConfig.storageKey,JSON.stringify({version:1,enabled:[...next]}));}
    catch {throw Error('瀏覽器無法儲存傳送門狀態，請允許網站儲存資料後再啟用。');}
    enabled=next;
  }
  function availableFrom(id){
    if(!known(id)||!isActive(id))return [];
    return destinations.filter(place=>place.id!==id&&enabled.has(place.id));
  }
  function destination(from,to){
    const place=availableFrom(from).find(place=>place.id===to);
    if(!place)throw Error('只能在已啟用的傳送門之間傳送。');
    return place.path;
  }
  return {isActive,activate,availableFrom,destination};
}
let storage;try{storage=globalThis.localStorage;}catch{}
export const portals=createPortals({storage});
