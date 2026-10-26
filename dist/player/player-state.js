import { playerGroups,playerStorageKey,createDefaultPlayer,validPlayerValue } from './definitions.js';

export function createPlayer({storage}={}){
  let state=createDefaultPlayer(),persistent=false,loadError=null;
  try{
    const text=storage.getItem(playerStorageKey);
    if(text!==null){
      const saved=JSON.parse(text);
      if(![1,2].includes(saved?.version))throw Error('玩家存檔格式不支援');
      for(const group of playerGroups)for(const field of group.fields){
        // Version 1 kept attack and defense in one combatAttributes group.
        const legacy=saved.version===1&&['attackAttributes','defenseAttributes'].includes(group.id);
        const value=legacy?saved.combatAttributes?.[field.id]:saved[group.id]?.[field.id];
        if(value!==undefined){if(!validPlayerValue(field,value))throw Error('玩家存檔數值異常');state[group.id][field.id]=value;}
      }
    }
    storage.setItem(playerStorageKey,JSON.stringify(state));persistent=true;
  }catch(error){state=createDefaultPlayer();loadError=error.message;}
  function getState(){return structuredClone(state);}
  function getStatus(){return {persistent,loadError};}
  function update(patch){
    if(loadError)throw Error('玩家存檔尚未成功載入，無法覆寫。');
    if(!patch||typeof patch!=='object'||Array.isArray(patch))throw Error('玩家資料更新格式錯誤');
    const next=getState();
    for(const [groupId,values] of Object.entries(patch)){
      const group=playerGroups.find(group=>group.id===groupId);
      if(!group||!values||typeof values!=='object'||Array.isArray(values))throw Error('未知的玩家資料分類');
      for(const [id,value] of Object.entries(values)){
        const field=group.fields.find(field=>field.id===id);
        if(!field||!validPlayerValue(field,value))throw Error('玩家屬性數值無效');
        next[groupId][id]=value;
      }
    }
    // Save before committing: a failed write must not claim the update persisted.
    storage.setItem(playerStorageKey,JSON.stringify(next));state=next;persistent=true;
    return getState();
  }
  return {getState,getStatus,update};
}
let storage;try{storage=globalThis.localStorage;}catch{}
export const player=createPlayer({storage});
