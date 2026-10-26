// Percent values are stored as ratios: 0.05 means 5%. No derived formulas yet.
export const playerStorageKey='bravemanlegend.player.v1';
export const playerGroups=[
  {id:'primaryAttributes',name:'主要屬性',fields:[
    {id:'STR',name:'力量 STR',initial:5,unit:'integer'},
    {id:'AGI',name:'敏捷 AGI',initial:5,unit:'integer'},
    {id:'INT',name:'智力 INT',initial:5,unit:'integer'},
    {id:'CON',name:'體質 CON',initial:5,unit:'integer'},
    {id:'LUK',name:'運氣 LUK',initial:5,unit:'integer'},
  ]},
  {id:'attackAttributes',name:'攻擊屬性',fields:[
    {id:'attack',name:'攻擊力',initial:0,unit:'number'},
    {id:'attackBonus',name:'攻擊增傷',initial:0,unit:'percent'},
    {id:'trueDamage',name:'真實傷害',initial:0,unit:'number'},
    {id:'criticalRate',name:'爆擊率',initial:0,unit:'percent'},
    {id:'criticalDamage',name:'爆擊傷害',initial:0,unit:'percent'},
  ]},
  {id:'defenseAttributes',name:'防禦屬性',fields:[
    {id:'defense',name:'防禦力',initial:0,unit:'number'},
    {id:'defenseReduction',name:'防禦減傷',initial:0,unit:'percent'},
    {id:'evasionRate',name:'迴避率',initial:0,unit:'percent'},
    {id:'criticalResistance',name:'爆擊抵抗',initial:0,unit:'percent'},
  ]},
  {id:'elementalResistances',name:'元素抗性',fields:[
    {id:'fire',name:'火',initial:0,unit:'percent'},
    {id:'water',name:'水',initial:0,unit:'percent'},
    {id:'earth',name:'地',initial:0,unit:'percent'},
    {id:'wind',name:'風',initial:0,unit:'percent'},
    {id:'holy',name:'神聖',initial:0,unit:'percent'},
    {id:'shadow',name:'暗影',initial:0,unit:'percent'},
  ]},
  {id:'weaponProficiencies',name:'武器熟練度',fields:[
    {id:'oneHandedSword',name:'單手劍',initial:0,unit:'integer'},
    {id:'twoHandedSword',name:'雙手劍',initial:0,unit:'integer'},
    {id:'dagger',name:'匕首',initial:0,unit:'integer'},
    {id:'bow',name:'弓',initial:0,unit:'integer'},
    {id:'spear',name:'長槍',initial:0,unit:'integer'},
    {id:'hammer',name:'大錘',initial:0,unit:'integer'},
    {id:'throwing',name:'投擲類',initial:0,unit:'integer'},
    {id:'unarmed',name:'拳腳',initial:0,unit:'integer'},
  ]},
];
export function createDefaultPlayer(){return Object.fromEntries([['version',2],...playerGroups.map(group=>[group.id,Object.fromEntries(group.fields.map(field=>[field.id,field.initial]))])]);}
export function validPlayerValue(field,value){return typeof value==='number'&&Number.isFinite(value)&&value>=0&&(field.unit!=='integer'||Number.isSafeInteger(value))&&(field.max===undefined||value<=field.max);}
