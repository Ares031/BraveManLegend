# 玩家資料

道具實例編號由 `instance-ids.js` 另存本機 IndexedDB，不同於此處的屬性 localStorage。四類獨立流水號規則見 `../content/items/ID_RULES.md`。

- `definitions.js`：主要屬性、戰鬥屬性、元素抗性、武器熟練度的欄位名稱、單位與初始值。
- 戰鬥屬性拆為 `attackAttributes`（攻擊力、攻擊增傷、真實傷害、爆擊率、爆擊傷害）及 `defenseAttributes`（防禦力、防禦減傷、迴避率、爆擊抵抗）。真實傷害為數值，爆擊抵抗為百分比。
- 存檔格式目前為 version 2，沿用原儲存 key，自動把舊版 combatAttributes 數值移入新分類；新欄位初始為 0，其餘資料保留。
- `player-state.js`：遊戲啟動時載入本機玩家存檔；未有存檔才建立預設資料。全場景經共用 game-ui.js 載入同一模組。
- 儲存位置：瀏覽器 localStorage，key 為 `bravemanlegend.player.v1`，與世界、傳送門、城鎮事件存檔獨立。
- STR／AGI／INT／CON／LUK 各為 5。其餘欄位暫以 0 起始，尚未定義計算公式、成長、加點或戰鬥效果。
- 百分比欄位使用比例值，0.05 表示 5%。爆擊傷害先記為百分比數值，其公式語意待定，不預設傷害倍率。
- 武器熟練度先記為非負整數點數，不預設等級上限或升級門檻。
- 目前存檔屬於同一瀏覽器、同一網址來源。切換場景、刷新、重開延續；清除網站資料或更換來源會另建初始資料。
- 格式不支援、數值無效或讀取失敗時，介面顯示預設資料與警示，保留原有存檔而不覆寫。

## 共用 API

```js
import { player } from '../player/player-state.js';
const data = player.getState(); // 獨立副本，外部修改不會影響存檔
player.update({ primaryAttributes: { STR: 6 } });
player.update({ elementalResistances: { fire: 0.05 } });
```

`update` 僅接受已定義欄位與有效數值，成功寫入後才更新記憶體狀態；失敗會拋出錯誤。人物狀態視窗只讀取並展示資料，不提供配點或獎勵。
