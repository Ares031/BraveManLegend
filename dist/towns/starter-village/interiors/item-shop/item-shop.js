import { initInterior } from '../../../../ui/interior-scene.js';
import { addFacilityNPC } from '../../../../ui/facility-npc.js';
const {canvas,addMessage}=initInterior({
  canvasId:'item-shop',
  imageUrl:new URL('./assets/item-shop-interior.png',import.meta.url).href,
  welcome:'你走進道具店，貨架上擺滿藥水、草藥與旅行用品。',
});
addFacilityNPC({
  canvas,addMessage,
  imageUrl:new URL('./assets/item-shop-owner-anime.png',import.meta.url).href,
  alt:'日系動漫風的成年道具店長艾莉兒，栗色短髮、綠色眼睛，穿著圍裙並拿著藍色藥水。',
  title:'艾莉兒',greeting:'歡迎光臨，今天要準備些什麼呢？',
  onTalk:()=>addMessage('艾莉兒親切地向你打招呼。交談內容稍後開放。'),
  actions:[
    {label:'交談',message:'艾莉兒的交談內容稍後開放。'},
    {label:'購買道具',message:'道具購買功能稍後開放。'},
    {label:'出售道具',message:'道具出售功能稍後開放。'},
  ],
});
