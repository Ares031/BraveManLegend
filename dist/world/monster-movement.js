import { enemyMotion } from '../config/enemy-motion.js';
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
export function createRoamingState(monster,{width,height},rng=Math.random){
  const minX=12,maxX=Math.max(minX,width-monster.w-12),minY=94,maxY=Math.max(minY,height-monster.h-29);
  const x=clamp(monster.x,minX,maxX),y=clamp(monster.y,minY,maxY);
  const state={minX:Math.max(minX,x-enemyMotion.radiusX),maxX:Math.min(maxX,x+enemyMotion.radiusX),minY:Math.max(minY,y-enemyMotion.radiusY),maxY:Math.min(maxY,y+enemyMotion.radiusY),targetX:x,targetY:y,wait:0};
  chooseTarget(state,rng);return state;
}
function chooseTarget(state,rng){state.targetX=state.minX+rng()*(state.maxX-state.minX);state.targetY=state.minY+rng()*(state.maxY-state.minY);}
export function advanceRoaming(monster,dt,rng=Math.random){
  if(!enemyMotion.enabled||!monster.motion||!Number.isFinite(dt)||dt<=0)return;
  const state=monster.motion;
  if(state.wait>0){state.wait=Math.max(0,state.wait-dt);if(state.wait===0)chooseTarget(state,rng);return;}
  const dx=state.targetX-monster.x,dy=state.targetY-monster.y,distance=Math.hypot(dx,dy),step=(enemyMotion.speeds[monster.type.id]??17)*dt;
  if(distance<=step){
    monster.x=state.targetX;monster.y=state.targetY;
    state.wait=enemyMotion.idleSeconds.min+rng()*(enemyMotion.idleSeconds.max-enemyMotion.idleSeconds.min);
  }else{monster.x+=dx/distance*step;monster.y+=dy/distance*step;}
  monster.x=clamp(monster.x,state.minX,state.maxX);monster.y=clamp(monster.y,state.minY,state.maxY);
}
