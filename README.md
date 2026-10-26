# BraveManLegend

自走 RPG 原型。目前入口為新手村，村口木門通往「微風草原」（沿用原行旅 DEMO）。

## 遊戲規劃

後續功能與內容統一記錄於 [遊戲規劃主檔](GAME_PLAN.md)。目前先整理規劃，DEMO 暫時擱置。

## 本機執行

Windows 可直接雙擊根目錄的「啟動遊戲.bat」，自動啟動本機伺服器並以預設瀏覽器開啟遊戲。遊玩時保留命令視窗，關閉視窗或按 Ctrl+C 可停止此次啟動的伺服器；若已有伺服器正常執行，則直接開啟網頁。

啟動檔優先使用 PATH 中的 Node.js，也支援目前 Codex 隨附的 Node.js 路徑；兩者都不存在時會顯示安裝提示。

執行 node server.cjs，開啟 http://127.0.0.1:4173/ 或 http://127.0.0.1:4173/journey.html 。

首頁會進入新手村；微風草原位於 dist/content/adventure-maps/breeze-plains/breeze-plains.html，舊 journey.html 網址會轉至微風草原。

## 主要檔案

- dist/content/items/：物品目錄、裝備品質與木劍資料；掉落規則說明見 [LOOT.md](dist/content/items/LOOT.md)。各冒險地圖的掉落機率放在該地圖的 drops.js。

- dist/player/：玩家屬性定義、本機存檔與共用讀寫 API，詳見 [玩家資料說明](dist/player/README.md)。所有頁面的「人物狀態」可查看目前資料。

- PreviewPng/：所有場景預覽圖與驗證截圖集中放置於此，不輸出到專案根目錄。

- dist/towns/：城鎮場景，每座城鎮獨立資料夾。
- dist/towns/starter-village/：新手村頁面、繪圖與配置資料。
- dist/content/：冒險地圖、怪物、道具與任務分類資料。
- dist/config/world.js：日夜、氣候與預留世界事件的全域設定。
- dist/world/：共用世界狀態與儲存規則，詳見其 README.md。新手村與行旅共用同一世界時間，重整與重新出發不重置；關閉遊戲期間時間持續推進。
- dist/config/portals.js：各城鎮傳送門登錄表；新增城鎮時登錄固定 ID、名稱與場景路徑。
- dist/world/portal-state.js：傳送門永久啟用與目的地檢查。狀態獨立存於 localStorage 的 bravemanlegend.portals.v1；與世界時間分開儲存。永久啟用指同一瀏覽器、同一網址來源下跨刷新與重開保存，清除網站資料會移除紀錄。

- dist/content/adventure-maps/breeze-plains/breeze-plains.html：微風草原頁面，提供回村入口。
- dist/content/adventure-maps/breeze-plains/breeze-plains.js：沿用行旅 DEMO 的自動前進場景；森林景物暫時保留，草原美術待後續補充。
- dist/content/adventure-maps/breeze-plains/encounters.js：遇怪判定、點擊攻擊與擊退計數。
- dist/content/adventure-maps/breeze-plains/monster-detail.js：原型怪物繪製，保留戰鬥用素材，已移除圖鑑預覽。
- dist/ui/game.css：新手村與微風草原共用的主畫面版面及訊息框樣式。
- dist/ui/game-layout.js、game-ui.js：共用頁面版型與介面互動，新增場景方式見 [版型說明](dist/ui/README.md)。
- dist/config/page-layouts.js：各場景版型配置，不需在每頁重複撰寫 HTML。

靜態部署目錄為 dist，入口為 index.html，導向新手村。
