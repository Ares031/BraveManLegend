export const dropSettings={
  mapId:'breeze-plains',difficulty:'一般',
  equipmentQualities:{common:0.60,fine:0.30,rare:0.10},
  gold:{min:10,max:30},
  itemRolls:2,
  // Initial category chances follow the example; each trial selects ONE category.
  categories:[
    {id:'potion',name:'藥水',chance:0.20,items:[]},
    {id:'weapon',name:'武器',chance:0.05,items:[10001]}, // 木劍
    {id:'armor',name:'防具',chance:0.05,items:[]},
    {id:'tradeGoods',name:'換金道具',chance:0.30,items:[]},
  ],
  // The remaining 40% is no drop. Empty item pools remain explicitly pending.
};
