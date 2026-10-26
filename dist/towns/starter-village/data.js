// Coordinates use the scene's 960 × 640 drawing surface.
export const village = {
  id: 'starter-village', name: '新手村', subtitle: '一段冒險，從一個小小的村落開始。',
  portal: { id: 'portal', name: '傳送門', kind: 'portal', x: 775, y: 555, w: 76, h: 82 },
  exit: { id: 'village-exit', name: '出村・微風草原', kind: 'gate', x: 478, y: 598, w: 94, h: 48, destination: '/content/adventure-maps/breeze-plains/breeze-plains.html' },
  buildings: [
    { id: 'inn', name: '宿屋', kind: 'inn', x: 210, y: 209, w: 142, h: 90, roof: '#a86d49', note: '旅人歇腳的地方。住宿內容將在後續加入。' },
    { id: 'shop', name: '道具店', kind: 'shop', x: 688, y: 213, w: 132, h: 84, roof: '#60867b', note: '準備旅途用品的地方。商品與交易內容將在後續加入。' },
    { id: 'tavern', name: '酒吧', kind: 'tavern', x: 228, y: 433, w: 150, h: 90, roof: '#926053', note: '村民與旅人相聚的地方。對話與任務內容將在後續加入。' },
    { id: 'training', name: '訓練場', kind: 'training', x: 698, y: 438, w: 182, h: 112, note: '練習與鍛鍊的空地。訓練內容將在後續加入。' },
    { id: 'home-1', name: '民房一', kind: 'home', x: 409, y: 143, w: 86, h: 59, roof: '#747c57' },
    { id: 'home-2', name: '民房二', kind: 'home', x: 539, y: 151, w: 88, h: 59, roof: '#8a7954' },
    { id: 'home-3', name: '民房三', kind: 'home', x: 395, y: 515, w: 86, h: 59, roof: '#797d58' },
    { id: 'home-4', name: '民房四', kind: 'home', x: 532, y: 518, w: 86, h: 59, roof: '#7e6959' },
  ],
};
