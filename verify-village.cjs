// Requires Playwright and an installed Google Chrome browser.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
const previewDirectory = path.join(__dirname, 'PreviewPng');
fs.mkdirSync(previewDirectory, { recursive: true });
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 1100 } });
    const errors = [];
    async function clickBuilding(name){
      const coordinates={'宿屋':[210,180],'道具店':[688,180],'酒吧':[228,400],'訓練場':[698,400],'傳送門':[775,520]};
      const [x,y]=coordinates[name],box=await page.locator('canvas').boundingBox();
      await page.mouse.click(box.x+x/960*box.width,box.y+y/640*box.height);
      if(name==='道具店'){
        await page.waitForURL('**/interiors/item-shop/index.html');
        await page.waitForFunction(()=>document.querySelector('#item-shop')?.dataset.loaded==='true');
        await page.getByRole('heading',{name:'道具店',exact:true}).waitFor();
        await page.waitForFunction(()=>{const img=document.querySelector('.facility-npc img');return img?.complete&&img.naturalWidth>0;});
        await page.getByRole('button',{name:'購買道具',exact:true}).click();
        await page.getByText('道具購買功能稍後開放。',{exact:true}).waitFor();
        const npcFit=await page.evaluate(()=>{
          const b=s=>document.querySelector(s).getBoundingClientRect();
          return b('.facility-npc').right<=b('.facility-menu').left&&b('.facility-menu').bottom<=b('.scene').bottom;
        });
        if(!npcFit)throw Error('Shop NPC/menu layout');
        const aligned=await page.evaluate(()=>{
          const b=s=>document.querySelector(s).getBoundingClientRect();
          return Math.abs(b('.message-panel').bottom-b('.scene').bottom)<2&&Math.abs(b('#developer-panel').bottom-b('.scene').bottom)<2;
        });
        if(!aligned)throw Error('Item shop panels include controls');
        const worldBefore=await page.evaluate(()=>localStorage.getItem('bravemanlegend.world.v1'));
        await page.screenshot({path:path.join(previewDirectory,'item-shop-interior-preview.png'),fullPage:true});
        await page.getByRole('link',{name:'返回新手村',exact:false}).click();
        await page.waitForURL('**/towns/starter-village/index.html');
        if(await page.evaluate(()=>localStorage.getItem('bravemanlegend.world.v1'))!==worldBefore)throw Error('Shop reset world state');
      }
      if(name==='酒吧'){
        await page.waitForURL('**/interiors/tavern/index.html');
        await page.waitForFunction(()=>document.querySelector('#tavern')?.dataset.loaded==='true');
        await page.getByRole('heading',{name:'酒吧',exact:true}).waitFor();
        await page.waitForFunction(()=>{const img=document.querySelector('.tavern-npc img');return img?.complete&&img.naturalWidth>0;});
        await page.getByRole('button',{name:'打聽消息',exact:true}).click();
        await page.getByText('村莊傳聞稍後開放。',{exact:true}).waitFor();
        const npcSides=await page.evaluate(()=>{
          const box=s=>document.querySelector(s).getBoundingClientRect();
          return box('.tavern-npc').right<=box('.tavern-menu').left&&box('.tavern-menu').right<=box('.scene').right;
        });
        if(!npcSides)throw Error('NPC and facility menu overlap');
        if(await page.locator('#game-menu button').count()!==5)throw Error('Tavern shared layout');
        const aligned=await page.evaluate(()=>{
          const b=s=>document.querySelector(s).getBoundingClientRect();
          return Math.abs(b('.message-panel').bottom-b('.scene').bottom)<2&&Math.abs(b('#developer-panel').bottom-b('.scene').bottom)<2&&b('#game-menu').top>=b('.scene').bottom&&b('.interior-controls').top>=b('#game-menu').bottom;
        });
        if(!aligned)throw Error('Tavern panels include menu height');
        const townBeforeReturn=await page.evaluate(()=>localStorage.getItem('bravemanlegend.town-events.starter-village.v1'));
        await page.screenshot({path:path.join(previewDirectory,'tavern-interior-preview.png'),fullPage:true});
        await page.getByRole('link',{name:'返回新手村',exact:false}).click();
        await page.waitForURL('**/towns/starter-village/index.html');
        if(await page.evaluate(()=>localStorage.getItem('bravemanlegend.town-events.starter-village.v1'))!==townBeforeReturn)throw Error('Tavern return lost village state');
      }
    }
    page.on('pageerror', e => errors.push(e.message));
    await page.route('http://village.test/**', route => {
      const url = new URL(route.request().url());
      const file = path.join(__dirname, 'dist', url.pathname === '/' ? 'index.html' : url.pathname);
      const ext = path.extname(file);
      route.fulfill({ body: fs.readFileSync(file), contentType: { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png':'image/png' }[ext] });
    });
    await page.goto('http://village.test/');
    await page.waitForURL('**/towns/starter-village/index.html');
    await page.waitForFunction(() => !document.querySelector('#world-status').textContent.includes('正在載入'));
    const wideBoxes=await page.evaluate(()=>{
      const bounds=selector=>{const r=document.querySelector(selector).getBoundingClientRect();return {x:r.x,right:r.right,y:r.y,bottom:r.bottom};};
      return {scene:bounds('.scene'),messages:bounds('.message-panel'),developer:bounds('#developer-panel')};
    });
    if(wideBoxes.messages.right>wideBoxes.scene.x||wideBoxes.developer.x<wideBoxes.scene.right)throw Error('Wide side panels');
    if(await page.locator('#game-menu button').count()!==5||await page.locator('#facilities').count())throw Error('Bottom menu');
    await page.getByRole('button',{name:'人物狀態',exact:true}).click();
    await page.getByRole('dialog',{name:'人物狀態',exact:true}).waitFor();
    if(await page.locator('#character-panel [data-stat]').count()!==28)throw Error('Player field count');
    for(const stat of ['STR','AGI','INT','CON','LUK'])if(await page.locator(`[data-stat="${stat}"]`).textContent()!=='5')throw Error('Player initial primary attribute');
    await page.screenshot({path:path.join(previewDirectory,'player-status-preview.png'),fullPage:true});
    await page.locator('#character-panel').getByRole('button',{name:'關閉',exact:true}).click();
    await page.evaluate(async()=>{
      const {createPlayer}=await import('/player/player-state.js');
      const {playerStorageKey}=await import('/player/definitions.js');
      const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
      const assert=(v,m)=>{if(!v)throw Error(m);};
      const p=createPlayer({storage});
      assert(Object.values(p.getState().primaryAttributes).every(v=>v===5),'Initial primary stats');
      p.update({primaryAttributes:{STR:8},attackAttributes:{attack:12,criticalRate:.05,trueDamage:4},defenseAttributes:{criticalResistance:.15},elementalResistances:{fire:.2},weaponProficiencies:{unarmed:3}});
      const restored=createPlayer({storage});
      assert(restored.getState().primaryAttributes.STR===8&&restored.getState().attackAttributes.criticalRate===.05&&restored.getState().attackAttributes.trueDamage===4&&restored.getState().defenseAttributes.criticalResistance===.15&&restored.getState().elementalResistances.fire===.2&&restored.getState().weaponProficiencies.unarmed===3,'Player persistence');
      const copy=restored.getState();copy.primaryAttributes.STR=100;assert(restored.getState().primaryAttributes.STR===8,'Player snapshot isolation');
      for(const patch of [{primaryAttributes:{STR:-1}},{primaryAttributes:{STR:1.5}},{attackAttributes:{attack:NaN}},{weaponProficiencies:{unknown:1}}]){
        let rejected=false;try{restored.update(patch);}catch{rejected=true;}assert(rejected,'Invalid player update');
      }
      const original=memory.get(playerStorageKey);memory.set(playerStorageKey,'corrupt');
      const broken=createPlayer({storage});assert(!broken.getStatus().persistent&&memory.get(playerStorageKey)==='corrupt','Corrupt save preserved');
      memory.set(playerStorageKey,original);
      const legacy={version:1,primaryAttributes:{STR:9},combatAttributes:{attack:23,attackBonus:.2,criticalRate:.1,criticalDamage:.5,defense:17,defenseReduction:.1,evasionRate:.07},elementalResistances:{fire:.3},weaponProficiencies:{bow:8}};
      memory.set(playerStorageKey,JSON.stringify(legacy));
      const migrated=createPlayer({storage}).getState();
      assert(migrated.version===2&&migrated.attackAttributes.attack===23&&migrated.attackAttributes.attackBonus===.2&&migrated.defenseAttributes.defense===17&&migrated.defenseAttributes.evasionRate===.07,'Legacy combat migration');
      assert(migrated.attackAttributes.trueDamage===0&&migrated.defenseAttributes.criticalResistance===0&&migrated.primaryAttributes.STR===9&&migrated.elementalResistances.fire===.3&&migrated.weaponProficiencies.bow===8,'Migration defaults and other stats');
      const blocked=createPlayer({storage:{getItem:()=>null,setItem(){throw Error('blocked');}}});assert(!blocked.getStatus().persistent,'Blocked storage status');
    });
    const initialPlayerSave=await page.evaluate(()=>localStorage.getItem('bravemanlegend.player.v1'));
    await page.evaluate(async()=>{
      const {makeItemId,isItemIdForType}=await import('/content/items/id-rules.js');
      const {createInstanceIds}=await import('/player/instance-ids.js');
      const assert=(v,m)=>{if(!v)throw Error(m);};
      assert(makeItemId('weapon','oneHandedSword',1)===10001&&makeItemId('weapon','twoHandedSword',1)===11001&&makeItemId('weapon','unarmed',999)===17999,'Weapon IDs');
      assert(makeItemId('armor','helmet',1)===20001&&makeItemId('armor','gloves',1)===24001&&makeItemId('accessory','earring',1)===32001,'Other category IDs');
      assert(!isItemIdForType(10000,'weapon','oneHandedSword')&&!isItemIdForType(11001,'weapon','oneHandedSword'),'ID category validation');
      for(const serial of [0,1000]){let rejected=false;try{makeItemId('weapon','bow',serial);}catch{rejected=true;}assert(rejected,'Invalid item suffix');}
      const databaseName=`test-instance-ids-${Date.now()}`;
      const a=createInstanceIds({databaseName}),b=createInstanceIds({databaseName});
      const allocated=await Promise.all(Array.from({length:20},(_,i)=>(i%2?a:b).next('equipment')));
      assert(new Set(allocated).size===20&&allocated.includes('eq-00000000')&&allocated.includes('eq-00000019'),'Concurrent instance allocation');
      for(const [kind,prefix] of [['item','itm'],['runestone','ru'],['enchantment','eh']])assert(await a.next(kind)===`${prefix}-00000000`,'Independent instance counters');
      assert(await createInstanceIds({databaseName}).next('equipment')==='eq-00000020','Instance counter reload');
      let rejected=false;try{await a.next('unknown');}catch{rejected=true;}assert(rejected,'Unknown instance category');
      await new Promise((resolve,reject)=>{
        const request=indexedDB.open(databaseName,1);request.onerror=()=>reject(request.error);
        request.onsuccess=()=>{const db=request.result,tx=db.transaction('counters','readwrite');tx.objectStore('counters').put(99999999,'eq');tx.oncomplete=()=>{db.close();resolve();};};
      });
      assert(await a.next('equipment')==='eq-99999999','Instance last valid number');
      rejected=false;try{await a.next('equipment');}catch{rejected=true;}assert(rejected,'Instance counter does not wrap');
    });
    await page.evaluate(async()=>{
      const {createEquipment,rollMonsterDrops}=await import('/world/loot.js');
      const {dropSettings}=await import('/content/adventure-maps/breeze-plains/drops.js');
      const {getItem,weaponsByType,allItems}=await import('/content/items/catalog.js');const woodenSword=getItem(10001);
      const assert=(v,m)=>{if(!v)throw Error(m);};
      assert(woodenSword.id===10001&&typeof woodenSword.id==='number'&&Object.keys(weaponsByType).length===8&&allItems.length===1&&!getItem('10001'),'Numeric item catalog');
      assert(woodenSword.minDamage===1&&woodenSword.maxDamage===5&&woodenSword.weight===1&&woodenSword.criticalRate===.05,'Wooden sword stats');
      const sequence=[0,.2,0,.6,.99,.99,.99];
      const result=rollMonsterDrops(dropSettings,{rng:()=>sequence.shift()});
      assert(result.gold===10&&result.rolls.length===2&&result.rolls[0].item.quality==='fine'&&result.rolls[0].item.price===75&&result.rolls[0].item.runeSockets.length===2&&result.rolls[0].item.enchantmentCapacity===2&&result.rolls[1].status==='none','Loot boundary rolls');
      const maximum=rollMonsterDrops(dropSettings,{rng:()=>.999999});
      assert(maximum.gold===30&&maximum.rolls.every(r=>r.status==='none'),'Gold maximum and no drop');
      for(const value of [0,.7,.95])assert(createEquipment(10001,{source:'shop',rng:()=>value}).quality==='common','Shop white equipment');
      const twice=rollMonsterDrops(dropSettings,{rng:(()=>{const values=[0,.21,0,0,0,0,.21,0,.95,0,0];return()=>values.shift();})()});
      assert(twice.rolls.every(r=>r.status==='dropped')&&twice.rolls[0].item.quality==='common'&&twice.rolls[1].item.quality==='rare','Two independent items');
      const pending=rollMonsterDrops(dropSettings,{rng:()=>0});assert(pending.rolls.every(r=>r.status==='pending'),'Undefined potions explicit');
      let seed=12;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      const counts={common:0,fine:0,rare:0};for(let i=0;i<10000;i++){const item=createEquipment(10001,{qualityWeights:dropSettings.equipmentQualities,rng});counts[item.quality]++;assert(item.price===({common:50,fine:75,rare:150}[item.quality])&&item.runeSockets.length<=3&&item.enchantmentCapacity<=3&&item.criticalRate===.05,'Quality properties');}
      assert(counts.common>5700&&counts.common<6300&&counts.fine>2700&&counts.fine<3300&&counts.rare>800&&counts.rare<1200,'Quality probabilities');
      const {buildEquipment,applyEnchantment,raiseEnchantmentCapacity,usedEnchantmentCapacity}=await import('/world/equipment.js');
      const {rollEnchantment}=await import('/world/enchantments.js');
      const {equipmentQualities}=await import('/content/items/qualities.js');
      for(const quality of ['common','fine','rare','legendary']){
        const rule=equipmentQualities[quality];
        for(const randomValue of [0,.999999]){
          const item=buildEquipment(woodenSword,{quality,rng:()=>randomValue});
          assert(item.minDamage===Math.round(rule.multiplier)&&item.maxDamage===Math.round(5*rule.multiplier),'Round quality stats');
          assert(item.criticalRate===.05&&item.weight===1&&item.price===Math.round(50*rule.priceMultiplier),'Quality price and unchanged crit/weight');
          assert(item.runeSockets.length===(randomValue===0?rule.sockets.min:rule.sockets.max),'Quality socket range');
          assert(item.enchantmentCapacity===(randomValue===0?rule.enchantmentCapacity.min:rule.enchantmentCapacity.max),'Quality enchantment capacity range');
        }
      }
      assert(buildEquipment({...woodenSword,price:51},{quality:'fine',rng:()=>0}).price===77,'Fractional price rounds');
      assert(!('runeSockets' in woodenSword),'Base weapon does not define sockets');
      const fixed={...woodenSword,minDamage:12.5,maxDamage:35,criticalRate:.15,socketCount:4,enchantmentCapacity:6,effects:[{type:'unique-effect'}]};
      const unique=buildEquipment(fixed,{quality:'unique',rng:()=>{throw Error('Unique must not roll');}});
      assert(unique.price===50&&unique.minDamage===12.5&&unique.runeSockets.length===4&&unique.enchantmentCapacity===6&&unique.effects[0].type==='unique-effect','Unique fixed properties');
      const low1={...rollEnchantment(1,{rng:()=>0}),instanceId:'eh-00000000'},low2={...rollEnchantment(2,{rng:()=>0}),instanceId:'eh-00000001'},high2={...rollEnchantment(2,{rng:()=>.999999}),instanceId:'eh-00000002'};
      const base={...buildEquipment(woodenSword,{quality:'rare',rng:()=>.999999}),instanceId:'eq-00000000'};
      const combined=applyEnchantment(applyEnchantment(base,low1),low2);
      assert(usedEnchantmentCapacity(combined)===2&&combined.enchantments.length===2&&base.enchantments.length===0,'Two cheap enchantments fit');
      const full=applyEnchantment(base,high2);assert(usedEnchantmentCapacity(full)===3,'Expensive enchantment fills weapon');
      let rejected=false;try{applyEnchantment(full,low1);}catch{rejected=true;}assert(rejected,'No capacity overflow');
      rejected=false;try{applyEnchantment(combined,low1);}catch{rejected=true;}assert(rejected,'No duplicate enchantment instance');
      assert(raiseEnchantmentCapacity(base,3).enchantmentCapacity===6,'Enhance above quality limit');
      rejected=false;try{raiseEnchantmentCapacity(base,4);}catch{rejected=true;}assert(rejected,'Global capacity cap');
    });
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    if(await page.locator('#developer-panel').isVisible())throw Error('Developer hide');
    if(!await page.locator('#system-panel').isVisible())throw Error('System replaces developer');
    const systemPosition=await page.locator('#system-panel').boundingBox();
    if(Math.abs(systemPosition.x-wideBoxes.developer.x)>1)throw Error('System panel changed column');
    await page.evaluate(async()=>{
      const {reportReward}=await import('/world/messages.js');
      reportReward({experience:25,money:10});
    });
    if(await page.locator('#system-message-log').getByText('取得經驗值 +25',{exact:true}).count()!==1)throw Error('Experience system message');
    if(await page.locator('#system-message-log').getByText('取得金幣 +10 z',{exact:true}).count()!==1)throw Error('Money system message');
    if((await page.locator('#message-log').textContent()).includes('取得經驗值'))throw Error('Message channels mixed');
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    if(!await page.locator('#developer-panel').isVisible())throw Error('Developer show');
    if(await page.locator('#system-panel').isVisible())throw Error('System hidden while developing');
    await page.evaluate(async()=>{const {reportReward}=await import('/world/messages.js');reportReward({money:5});});
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    if(await page.locator('#system-message-log p').count()!==3)throw Error('Messages retained while hidden');
    await page.screenshot({path:path.join(previewDirectory,'starter-village-system-preview.png'),fullPage:true});
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    const worldTests = await page.evaluate(async () => {
      const { createWorld } = await import('/world/world-state.js');
      const { worldConfig } = await import('/config/world.js');
      let current = 1000000;
      const memory = new Map();
      const storage = { getItem: k => memory.get(k) ?? null, setItem: (k,v) => memory.set(k,v) };
      const make = () => createWorld({storage, now:()=>current, random:()=>.123});
      const w = make(), initial = w.getState();
      const assert = (condition, message) => { if(!condition) throw Error(message); };
      assert(initial.phase==='day' && initial.weatherIndex===0, 'Initial world');
      current += 299000; assert(w.getState().weatherIndex===0, 'No early weather roll');
      current += 1000; assert(w.getState().weatherIndex===1, 'Weather boundary');
      assert(JSON.stringify(w.getState())===JSON.stringify(make().getState()),'Refresh preserves world');
      current += 300000; assert(w.getState().phase==='night', '600 second night');
      current += 12000; assert(w.getState().darkness===1, 'Night transition');
      current += 588000; assert(w.getState().phase==='day', '1200 second day');
      assert(!w.getState().events.enabled && w.getState().events.active===null, 'Events reserved');
      const weatherCounts={sunny:0,rainy:0,foggy:0}; for(let i=0;i<10000;i++){current=1000000+i*300000;weatherCounts[w.getState().weather]++;}
      assert(weatherCounts.sunny>6700&&weatherCounts.sunny<7300&&weatherCounts.rainy>1800&&weatherCounts.rainy<2200&&weatherCounts.foggy>800&&weatherCounts.foggy<1200,'Weather distribution');
      assert(worldConfig.weather.probabilities.sunny===.7&&worldConfig.weather.probabilities.rainy===.2&&worldConfig.weather.probabilities.foggy===.1,'Configured weights');
      const blocked=createWorld({storage:{getItem(){throw Error();},setItem(){throw Error();}},now:()=>current});
      assert(!blocked.getState().persistent,'Storage fallback');
      current=1000000;
      const manualMemory=new Map();
      const manualStorage={getItem:k=>manualMemory.get(k)??null,setItem:(k,v)=>manualMemory.set(k,v)};
      const manual=createWorld({storage:manualStorage,now:()=>current,random:()=>.123});
      current+=123000;
      const before=manual.getState();
      const toggled=manual.toggleDayNight();
      assert(toggled.phase==='night'&&toggled.darkness===1&&toggled.nextPhaseSeconds===600,'Manual night and timer');
      assert(toggled.nextWeatherSeconds===before.nextWeatherSeconds&&toggled.weather===before.weather,'Day toggle preserves weather clock');
      current+=7000;
      const beforeRoll=manual.getState();
      const rolled=manual.rerollWeather();
      assert(rolled.nextWeatherSeconds===300&&rolled.weatherIndex===beforeRoll.weatherIndex+1,'Manual weather and timer');
      assert(rolled.nextPhaseSeconds===beforeRoll.nextPhaseSeconds&&rolled.phase===beforeRoll.phase,'Weather preserves day clock');
      const restored=createWorld({storage:manualStorage,now:()=>current});
      assert(JSON.stringify(restored.getState())===JSON.stringify(manual.getState()),'Manual state restored');
      current+=300000;
      assert(restored.getState().weatherIndex===rolled.weatherIndex+1,'Automatic weather follows reset');
      current+=293000;
      assert(restored.getState().phase==='day','Automatic day follows reset');
      restored.toggleDayNight();restored.toggleDayNight();
      assert(restored.getState().phase==='day','Repeated toggle');
      return {weatherCounts, checks:'time boundaries, persistence, offline advance, weather probabilities, disabled events, blocked storage'};
    });
    console.log(worldTests);
    await page.evaluate(async()=>{
      const {createTownEvents}=await import('/world/town-events.js');
      const {townEvents}=await import('/towns/starter-village/events.js');
      const memory=new Map(),storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v)};
      const make=(defs=townEvents)=>createTownEvents(defs,{storage,now:()=>12345});
      const log=make(),assert=(v,m)=>{if(!v)throw Error(m);};
      assert(log.getState().lightsOn,'Initial house light');
      log.clickBuilding('home-3');assert(!log.getState().lightsOn,'First click lights off');
      log.clickBuilding('home-3');assert(log.getState().lightsOn,'Second click lights on');
      log.clickBuilding('inn');assert(log.getState().consecutiveClicks===0,'Other building interrupts');
      for(let i=0;i<99;i++)log.clickBuilding('home-3');
      assert(!log.getState().hiddenEvent.triggered,'No early event');
      const restored=make();assert(restored.getState().consecutiveClicks===99,'Counter restored');
      assert(restored.clickBuilding('home-3').justTriggered,'100th click triggers');
      assert(!restored.clickBuilding('home-3').justTriggered,'One time event');
      assert(make().getState().hiddenEvent.triggered,'Event permanent');
      assert(restored.openChest('hidden-chest-1').firstOpen,'First chest open');
      assert(!make().openChest('hidden-chest-1').firstOpen,'Chest does not reopen');
      assert(!make().getState().chests['hidden-chest-2'].opened,'Independent chest');
      const another=make({...townEvents,townId:'another-town'});
      assert(!another.getState().hiddenEvent.triggered&&!another.getState().chests['hidden-chest-1'].opened,'Independent towns');
    });
    // Verify facility clicks use an entry hook rather than the removed guide.
    await page.evaluate(()=>{window.lastFacility=null;window.addEventListener('town:enter-facility',e=>window.lastFacility=e.detail);});
    await clickBuilding('宿屋');
    if(!(await page.evaluate(()=>window.lastFacility?.facilityId==='inn'&&!window.lastFacility.ready)))throw Error('Facility entry hook');
    await page.evaluate(()=>{
      const canvas=document.querySelector('canvas'),b=canvas.getBoundingClientRect();
      for(let i=0;i<100;i++)canvas.dispatchEvent(new MouseEvent('click',{clientX:b.x+395/960*b.width,clientY:b.y+490/640*b.height,bubbles:true}));
    });
    await page.locator('#message-log').getByText('屋內傳來一聲輕響……你觸發了民房三的隱藏事件！',{exact:true}).waitFor();
    const townSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('bravemanlegend.town-events.starter-village.v1')));
    if(!townSaved.hiddenEvent.triggered||!townSaved.lightsOn)throw Error('House hidden event UI');
    await page.evaluate(async()=>{
      const {createPortals}=await import('/world/portal-state.js');
      const data=new Map(),storage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};
      const destinations=[{id:'a',name:'A',path:'/a'},{id:'b',name:'B',path:'/b'},{id:'c',name:'C',path:'/c'}];
      const make=()=>createPortals({storage,destinations}),p=make();
      const assert=(v,msg)=>{if(!v)throw Error(msg);};
      assert(!p.isActive('a')&&!p.availableFrom('a').length,'Portal initially locked');
      p.activate('a');assert(make().isActive('a'),'Portal permanent unlock');
      p.activate('a');assert(!p.availableFrom('a').length,'No self teleport');
      let rejected=false;try{p.destination('a','b');}catch{rejected=true;}assert(rejected,'Locked destination blocked');
      p.activate('b');assert(p.destination('a','b')==='/b'&&p.destination('b','a')==='/a','Bidirectional enabled teleport');
      assert(p.availableFrom('a').length===1,'Locked towns excluded');
      const blocked=createPortals({storage:{getItem(){return null;},setItem(){throw Error();}},destinations});
      rejected=false;try{blocked.activate('a');}catch{rejected=true;}assert(rejected&&!blocked.isActive('a'),'No false permanent unlock');
    });
    // Activate by clicking the actual portal on the map.
    const portalBox=await page.locator('canvas').boundingBox();
    await page.mouse.click(portalBox.x+775/960*portalBox.width,portalBox.y+520/640*portalBox.height);
    await page.getByText('新手村的傳送門已永久啟用！', {exact:false}).waitFor();
    await page.getByRole('button',{name:'關閉',exact:true}).click();
    await page.reload();
    await clickBuilding('傳送門');
    await page.getByText('目前尚無其他已啟用的傳送門。',{exact:false}).waitFor();
    await page.getByRole('button',{name:'關閉',exact:true}).click();
    const phaseBefore=await page.locator('.weather').textContent();
    await page.getByRole('button',{name:'切換日夜',exact:false}).click();
    const phaseAfter=await page.locator('.weather').textContent();
    if(phaseBefore.includes('白晝')===phaseAfter.includes('白晝'))throw Error('UI phase toggle');
    if(!(await page.locator('#world-status').textContent()).includes('600 秒後'))throw Error('UI phase timer');
    await page.getByRole('button',{name:'重骰天氣',exact:false}).click();
    if(!(await page.locator('#world-status').textContent()).includes('300 秒後判定天氣'))throw Error('UI weather timer');
    const savedWorld = await page.evaluate(() => localStorage.getItem('bravemanlegend.world.v1'));
    await page.reload();
    await page.locator('canvas').waitFor();
    if(await page.evaluate(() => localStorage.getItem('bravemanlegend.world.v1')) !== savedWorld) throw Error('Reload reset world');
    await clickBuilding('宿屋');

    for (const name of ['道具店', '酒吧', '訓練場']) {
      await clickBuilding(name);

    }
    await page.screenshot({ path: path.join(previewDirectory, 'starter-village-preview.png'), fullPage: true });
    await page.setViewportSize({ width: 390, height: 844 });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
    if (overflow) throw Error('Mobile horizontal overflow');
    await page.getByRole('button',{name:'人物狀態',exact:true}).click();
    if(await page.locator('#character-panel [data-stat="STR"]').textContent()!=='5')throw Error('Mobile player panel');
    await page.screenshot({path:path.join(previewDirectory,'player-status-mobile-preview.png'),fullPage:true});
    await page.locator('#character-panel').getByRole('button',{name:'關閉',exact:true}).click();
    const mobileOrder=await page.evaluate(()=>document.querySelector('.message-panel').getBoundingClientRect().top>=document.querySelector('.scene').getBoundingClientRect().bottom);
    if(!mobileOrder)throw Error('Mobile messages below scene');
    const menuOrder=await page.evaluate(()=>{
      const b=s=>document.querySelector(s).getBoundingClientRect();
      return b('#game-menu').top>=b('.scene').bottom&&b('#game-menu').bottom<=b('.message-panel').top&&b('.message-panel').bottom<=b('#developer-panel').top;
    });
    if(!menuOrder)throw Error('Mobile order: canvas, menu, messages, developer');
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    const mobileSystemOrder=await page.evaluate(()=>document.querySelector('#system-panel').getBoundingClientRect().top>=document.querySelector('.message-panel').getBoundingClientRect().bottom);
    if(!mobileSystemOrder)throw Error('Mobile system panel order');
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    await page.screenshot({path:path.join(previewDirectory,'starter-village-mobile-preview.png'),fullPage:true});
    const box = await page.locator('canvas').boundingBox();
    await page.mouse.click(box.x + 409 / 960 * box.width, box.y + 130 / 640 * box.height);
    if(await page.locator('#detail-title').count()) throw Error('Obsolete guide still present');
    const gateBox=await page.locator('canvas').boundingBox();
    await page.mouse.click(gateBox.x+478/960*gateBox.width,gateBox.y+575/640*gateBox.height);
    await page.waitForURL('**/breeze-plains/breeze-plains.html');
    await page.getByRole('heading',{name:'微風草原',exact:true}).first().waitFor();
    await page.evaluate(async()=>{
      const {createRoamingState,advanceRoaming}=await import('/world/monster-movement.js');
      let seed=71;const rng=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      for(const type of monsterTypes){
        const m={type,x:220,y:110,w:48*type.scale,h:64*type.scale};
        m.motion=createRoamingState(m,{width:480,height:320},()=>.9);
        const initialX=m.x,initialY=m.y;
        advanceRoaming(m,.1,rng);
        if(m.x===initialX&&m.y===initialY)throw Error('Monster did not walk');
        for(let i=0;i<10000;i++){
          advanceRoaming(m,.1,rng);
          if(m.x<m.motion.minX||m.x>m.motion.maxX||m.y<m.motion.minY||m.y>m.motion.maxY||m.x<0||m.x+m.w>480||m.y+m.h+2>320)throw Error('Monster left roaming area');
        }
        m.motion.targetX=m.x;m.motion.targetY=m.y;m.motion.wait=0;advanceRoaming(m,.1,()=>.5);
        const heldX=m.x,heldY=m.y;advanceRoaming(m,.1,rng);
        if(m.x!==heldX||m.y!==heldY)throw Error('Monster idle pause missing');
      }
    });
    await page.waitForFunction(()=>window.monsterMovement);
    await page.evaluate(()=>{monsters=[];addMonster(monsterTypes[0],()=>.5);const m=monsters[0];m.motion=window.monsterMovement.createRoamingState(m,{width:WIDTH,height:HEIGHT},()=>.95);window.walkingStart={x:m.x,y:m.y,id:m.id};});
    await page.waitForFunction(()=>{const m=monsters.find(m=>m.id===window.walkingStart.id);return m&&Math.hypot(m.x-window.walkingStart.x,m.y-window.walkingStart.y)>2;});
    const adventureCanvas=await page.evaluate(()=>{
      const c=document.querySelector('canvas'),r=c.getBoundingClientRect();
      return {width:c.width,height:c.height,ratio:r.width/r.height};
    });
    if(adventureCanvas.width!==960||adventureCanvas.height!==640||Math.abs(adventureCanvas.ratio-1.5)>.01)throw Error('Adventure canvas does not match village');
    const monsterTarget=await page.evaluate(()=>{
      paused=true;monsters=[];addMonster(monsterTypes[0],()=>.5);
      const m=monsters[0],b=monsterBounds(m),sprite=monsterSprites[m.type.id];
      const data=sprite.getContext('2d').getImageData(0,0,sprite.width,sprite.height).data;
      for(let sy=20;sy<sprite.height-10;sy++)for(let sx=10;sx<sprite.width-10;sx++)if(data[(sy*sprite.width+sx)*4+3])return{x:(b.x+(sx+.5)/sprite.width*b.w)/WIDTH,y:(b.y+(sy+.5)/sprite.height*b.h)/HEIGHT};
      throw Error('No opaque monster hit target');
    });
    const combatBox=await page.locator('canvas').boundingBox();
    await page.mouse.click(combatBox.x+monsterTarget.x*combatBox.width,combatBox.y+monsterTarget.y*combatBox.height);
    await page.waitForFunction(()=>defeated===1&&window.lastMonsterLoot?.rolls.length===2);
    if(!(await page.evaluate(()=>window.lastMonsterLoot?.gold>=10&&window.lastMonsterLoot?.gold<=30&&window.lastMonsterLoot.rolls.length===2)))throw Error('Monster death loot hook');
    await page.evaluate(()=>{paused=false;});
    if(await page.locator('.monster-study,.monster-cards').count())throw Error('Monster preview still visible');
    if(await page.locator('#developer-panel #encounterRates').count()!==1||await page.locator('#developer-panel').getByText('點擊怪物揮斬',{exact:true}).count()!==1)throw Error('Encounter info not in developer panel');
    if(await page.locator('#game-menu button').count()!==5)throw Error('Adventure menu');
    const movementBelow=await page.evaluate(()=>document.querySelector('.travel-controls').getBoundingClientRect().top>=document.querySelector('#game-menu').getBoundingClientRect().bottom);
    if(!movementBelow)throw Error('Movement controls not below menu');
    await page.locator('#pause').click();
    if(!(await page.locator('#pause').textContent()).includes('繼續前進'))throw Error('Adventure pause');
    await page.locator('#pause').click();
    if(!(await page.locator('#pause').textContent()).includes('暫停前進'))throw Error('Adventure resume');
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    if(!await page.locator('#system-panel').isVisible()||await page.locator('#developer-panel').isVisible())throw Error('Adventure message swap');
    await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    const adventureMobileOrder=await page.evaluate(()=>{
      const b=s=>document.querySelector(s).getBoundingClientRect();
      return b('.travel-controls').bottom<=b('.message-panel').top&&b('.message-panel').bottom<=b('#developer-panel').top&&document.documentElement.scrollWidth<=innerWidth;
    });
    if(!adventureMobileOrder)throw Error('Adventure mobile layout');
    await page.screenshot({path:path.join(previewDirectory,'breeze-plains-mobile-preview.png'),fullPage:true});
    await page.setViewportSize({width:1440,height:1000});
    await page.screenshot({path:path.join(previewDirectory,'breeze-plains-preview.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    await page.getByRole('link',{name:'返回新手村',exact:false}).click();
    await page.waitForURL('**/towns/starter-village/index.html');
    if(await page.evaluate(() => localStorage.getItem('bravemanlegend.world.v1')) !== savedWorld)throw Error('Gate travel reset world');
    const returnedTown=await page.evaluate(()=>JSON.parse(localStorage.getItem('bravemanlegend.town-events.starter-village.v1')));
    if(!returnedTown.hiddenEvent.triggered)throw Error('Return lost village event');
    await page.goto('http://village.test/content/adventure-maps/breeze-plains/breeze-plains.html');
    await page.waitForFunction(() => window.gameWorld && document.querySelector('#phase').textContent.includes(' · '));
    if(await page.evaluate(() => localStorage.getItem('bravemanlegend.world.v1')) !== savedWorld) throw Error('Scene navigation reset world');
    await page.getByRole('button', { name: '重新出發', exact: false }).click();
    if(await page.evaluate(() => localStorage.getItem('bravemanlegend.world.v1')) !== savedWorld) throw Error('Journey reset world');
    // Exercise night/rain rendering without adding production debug controls.
    await page.evaluate(async () => {
      const { createWorld } = await import('/world/world-state.js');
      const startedAt=Date.now()-620000;
      for(let seed=0;seed<100;seed++){
        const value=JSON.stringify({version:1,startedAt,seed});
        const candidate=createWorld({storage:{getItem:()=>value,setItem(){}}});
        if(candidate.getState().weather==='rainy'){localStorage.setItem('bravemanlegend.world.v1',value);break;}
      }
    });
    await page.setViewportSize({width:1280,height:1100});
    await page.goto('http://village.test/towns/starter-village/index.html');
    await page.waitForFunction(() => document.querySelector('.weather').textContent.includes('夜晚') && document.querySelector('.weather').textContent.includes('雨天'));
    await page.screenshot({path:path.join(previewDirectory,'starter-village-night-rain-preview.png'),fullPage:true});
    await page.evaluate(async()=>{
      const {createWorld}=await import('/world/world-state.js');
      const startedAt=Date.now();
      for(let seed=0;seed<1000;seed++){
        const saved=JSON.stringify({version:1,startedAt,seed});
        if(createWorld({storage:{getItem:()=>saved,setItem(){}}}).getState().weather==='foggy'){
          localStorage.setItem('bravemanlegend.world.v1',saved);return;
        }
      }
      throw Error('Unable to create fog test state');
    });
    await page.reload();
    await page.waitForFunction(()=>document.querySelector('.weather').textContent.includes('迷霧'));
    await page.screenshot({path:path.join(previewDirectory,'starter-village-fog-preview.png'),fullPage:true});
    await clickBuilding('傳送門');
    await page.getByText('目前尚無其他已啟用的傳送門。',{exact:false}).waitFor();
    await page.getByRole('button',{name:'關閉',exact:true}).click();
    await page.goto('http://village.test/content/adventure-maps/breeze-plains/breeze-plains.html');
    await page.waitForFunction(()=>document.querySelector('#phase').textContent.includes('迷霧'));
    await page.screenshot({path:path.join(previewDirectory,'forest-journey-fog-preview.png'),fullPage:true});
    await page.evaluate(async()=>{
      const {drawAtmosphere}=await import('/world/weather-effects.js');
      const ctx=document.createElement('canvas').getContext('2d');
      ctx.globalAlpha=.7;ctx.globalCompositeOperation='multiply';ctx.lineWidth=4;
      for(const weather of ['sunny','rainy','foggy'])drawAtmosphere(ctx,{width:320,height:240,time:123,state:{weather,darkness:.5},lights:[{x:40,y:40,radius:20}]});
      if(ctx.globalCompositeOperation!=='multiply'||ctx.lineWidth!==4||Math.abs(ctx.globalAlpha-.7)>.001)throw Error('Shared weather leaked canvas state');
    });
    await page.goto('http://village.test/towns/starter-village/index.html');
    await page.waitForFunction(()=>!document.querySelector('#world-status').textContent.includes('正在載入'));
    await page.screenshot({path:path.join(previewDirectory,'starter-village-hidden-chests-preview.png'),fullPage:true});
    await page.setViewportSize({width:390,height:844});
    async function clickChest(x,y){const box=await page.locator('canvas').boundingBox();await page.mouse.click(box.x+x/960*box.width,box.y+y/640*box.height);}
    await clickChest(124,531);
    if(!await page.locator('.message-panel').isVisible())throw Error('Chest reward not shown');
    if(await page.locator('#message-log').getByText('取得道具（內容待補）',{exact:true}).count()!==1)throw Error('Pond chest reward');
    await clickChest(124,531);
    if(await page.locator('#message-log').getByText('取得道具（內容待補）',{exact:true}).count()!==1)throw Error('Duplicate chest reward');
    await clickChest(844,552);
    if(await page.locator('#message-log').getByText('取得道具（內容待補）',{exact:true}).count()!==2)throw Error('Bush chest reward');
    const chestSaved=await page.evaluate(()=>JSON.parse(localStorage.getItem('bravemanlegend.town-events.starter-village.v1')));
    if(!chestSaved.chests['hidden-chest-1'].opened||!chestSaved.chests['hidden-chest-2'].opened)throw Error('Chest saved flags');
    await page.reload();
    await page.waitForFunction(()=>!document.querySelector('#world-status').textContent.includes('正在載入'));
    await clickChest(844,552);
    if(await page.locator('#message-log').getByText('取得道具（內容待補）',{exact:true}).count())throw Error('Reload allowed duplicate chest reward');
    await page.getByText('這個寶箱已經開啟過了。',{exact:true}).waitFor();
    await page.evaluate(async()=>{
      const {publishMessage}=await import('/world/messages.js');
      for(const channel of ['general','system'])for(let i=0;i<230;i++)publishMessage(channel,`cap ${channel} ${i}`);
    });
    if(await page.locator('#system-panel').isHidden())await page.getByRole('button',{name:'開發者專用',exact:true}).click();
    for(const [channel,selector] of [['general','#message-log'],['system','#system-message-log']]){
      await page.waitForFunction(selector=>{const log=document.querySelector(selector);return log.scrollHeight>log.clientHeight&&log.scrollHeight-log.clientHeight-log.scrollTop<4;},selector);
      const log=page.locator(selector);
      if(await log.locator('[data-message]').count()!==200)throw Error('Message cap '+channel);
      if(await log.locator('[data-message]').first().textContent()!==`cap ${channel} 30`)throw Error('Oldest message eviction');
      await page.evaluate(selector=>{const log=document.querySelector(selector);log.scrollTop=log.scrollHeight/2;},selector);
      await page.waitForTimeout(100);
      const anchor=await page.evaluate(selector=>{
        const log=document.querySelector(selector),node=[...log.children].find(n=>n.offsetTop+n.offsetHeight>log.scrollTop);
        return {text:node.textContent,offset:node.offsetTop-log.scrollTop};
      },selector);
      await page.evaluate(async({channel})=>{const {publishMessage}=await import('/world/messages.js');publishMessage(channel,'incoming while reading');},{channel});
      const preserved=await page.evaluate(({selector,anchor})=>{
        const log=document.querySelector(selector),node=[...log.children].find(n=>n.textContent===anchor.text);
        return node&&Math.abs(node.offsetTop-log.scrollTop-anchor.offset)<2&&log.scrollHeight-log.clientHeight-log.scrollTop>10;
      },{selector,anchor});
      if(!preserved)throw Error('Reader scroll position lost '+channel);
      await page.evaluate(selector=>{const log=document.querySelector(selector);log.scrollTop=log.scrollHeight;},selector);
      await page.waitForTimeout(100);
      await page.evaluate(async({channel})=>{const {publishMessage}=await import('/world/messages.js');publishMessage(channel,'following again');},{channel});
      await page.waitForFunction(selector=>{const log=document.querySelector(selector);return log.scrollHeight-log.clientHeight-log.scrollTop<4;},selector);
      const retained=await page.evaluate(async channel=>{
        const {subscribeMessages}=await import('/world/messages.js');let count=0;const unsubscribe=subscribeMessages(channel,()=>count++);unsubscribe();return count;
      },channel);
      if(retained!==200)throw Error('Message store cap '+channel);
    }
    await page.screenshot({path:path.join(previewDirectory,'starter-village-message-scroll-preview.png'),fullPage:true});
    if(await page.evaluate(()=>localStorage.getItem('bravemanlegend.player.v1'))!==initialPlayerSave)throw Error('Scene navigation or reload reset player');
    if (errors.length) throw Error(errors.join('\n'));
    console.log('PASS: homepage redirect, four facilities, mobile layout, canvas house selection; no browser errors.');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
