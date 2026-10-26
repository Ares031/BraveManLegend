// Page-specific layout data. Load before ui/game-layout.js.
const GAME_PAGE_LAYOUTS={
    'starter-village-item-shop':{
      name:'道具店',subtitle:'補齊行囊，讓下一段旅途更從容。',canvasId:'item-shop',
      description:'新手村道具店內景：藥水、草藥、旅行用品、木製貨架與櫃台。',
      clockId:'world-status',returnTo:{path:'towns/starter-village/index.html',text:'← 返回新手村'},
      footer:'新手村 · 道具店',footerText:'室內場景 · 功能待擴充',
    },
    'starter-village-tavern':{
      name:'酒吧',subtitle:'推開木門，讓爐火與木香接住旅途的疲憊。',canvasId:'tavern',
      description:'新手村酒吧內景：木造吧台、酒架、壁爐、燈籠與旅人座位。',
      clockId:'world-status',returnTo:{path:'towns/starter-village/index.html',text:'← 返回新手村'},
      footer:'新手村 · 酒吧',footerText:'室內場景 · 功能待擴充',
    },
    'starter-village':{
      name:'新手村',subtitle:'一段冒險，從一個小小的村落開始。',canvasId:'village',
      description:'新手村全景，點擊建築進入設施、點擊傳送門啟用或傳送，民房三可切換燈光。',
      caption:'微光之森邊境 ・ 新手村',clockId:'world-status',portal:true,
      debug:[['傳送門','debug-portal'],['民房三燈光','debug-lights'],['連續點擊','debug-clicks'],['民房三隱藏事件','debug-event']],
      footer:'4 處設施 · 4 棟民房 · 1 座傳送門',footerLink:{path:'content/adventure-maps/breeze-plains/breeze-plains.html',text:'前往微風草原 ↗'},
    },
    'breeze-plains':{
      name:'微風草原',subtitle:'走出村莊，沿著小徑開始你的第一段冒險。',canvasId:'journey',
      description:'第一人稱微風草原旅程，沿泥路自動前進，點擊怪物攻擊',
      distance:true,clockId:'countdown',travel:true,encounters:true,
      footer:'空白鍵暫停／繼續前進 · 世界時間持續流動',footerText:'微風草原 · 行旅原型',
    },
  };
