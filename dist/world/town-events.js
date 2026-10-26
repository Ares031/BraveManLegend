export function createTownEvents(definitions,{storage,now=Date.now}={}) {
  const key=`bravemanlegend.town-events.${definitions.townId}.v1`;
  const defaults=()=>({version:1,chests:Object.fromEntries(definitions.chests.map(c=>[c.id,{opened:false,openedAt:null}])),lightsOn:definitions.lightSwitch.initialLightsOn,consecutiveClicks:0,hiddenEvent:{triggered:false,triggeredAt:null}});
  let state=defaults(),persistent=true;
  try{
    const saved=JSON.parse(storage.getItem(key));
    if(saved?.version===1){
      for(const chest of definitions.chests){const value=saved.chests?.[chest.id];if(value?.opened===true)state.chests[chest.id]={opened:true,openedAt:value.openedAt};}
      if(typeof saved.lightsOn==='boolean')state.lightsOn=saved.lightsOn;
      if(Number.isSafeInteger(saved.consecutiveClicks)&&saved.consecutiveClicks>=0)state.consecutiveClicks=Math.min(saved.consecutiveClicks,definitions.lightSwitch.threshold);
      if(saved.hiddenEvent?.triggered===true)state.hiddenEvent={triggered:true,triggeredAt:saved.hiddenEvent.triggeredAt};
    }
  }catch{persistent=false;}
  function save(){try{storage.setItem(key,JSON.stringify(state));persistent=true;}catch{persistent=false;}}
  function getState(){return {...structuredClone(state),persistent};}
  function clickBuilding(id){
    let justTriggered=false;
    if(id===definitions.lightSwitch.buildingId){
      state.lightsOn=!state.lightsOn;
      state.consecutiveClicks=Math.min(definitions.lightSwitch.threshold,state.consecutiveClicks+1);
      if(!state.hiddenEvent.triggered&&state.consecutiveClicks>=definitions.lightSwitch.threshold){state.hiddenEvent={triggered:true,triggeredAt:now()};justTriggered=true;}
    }else{state.consecutiveClicks=0;}
    save();return {state:getState(),justTriggered};
  }
  function openChest(id){
    if(!Object.hasOwn(state.chests,id))throw Error('未知的城鎮寶箱');
    const firstOpen=!state.chests[id].opened;
    if(firstOpen){state.chests[id]={opened:true,openedAt:now()};save();}
    return {firstOpen,state:getState()};
  }
  save();
  return {getState,clickBuilding,openChest};
}
