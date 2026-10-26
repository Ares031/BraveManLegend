# 武器分類

每類武器各一個檔案，匯出該類資料陣列。

| 檔案 | 類型 | 陣列 |
| --- | --- | --- |
| oneHandedSword.js | 單手劍 | oneHandedSwords |
| twoHandedSword.js | 雙手劍 | twoHandedSwords |
| dagger.js | 匕首 | daggers |
| bow.js | 弓 | bows |
| spear.js | 長槍 | spears |
| hammer.js | 大錘 | hammers |
| throwing.js | 投擲類 | throwingWeapons |
| unarmed.js | 拳腳 | unarmedWeapons |

木劍 ID 為數字 `10001`。道具共用正整數 ID 空間，各分類不得重複；ID 不依陣列位置變動，也不要因排序或刪除而重編。

catalog.js 統整所有陣列並建立 Map 索引，使用 `getItem(10001)` 直接查找；字串 `'1'` 不等同數字 `1`。`allItems` 列出全部道具，`weaponsByType` 取得分類清單。查找改善主要來自索引，數字 ID 本身不會讓 Array.find 免除逐項搜尋。
