# 共用遊戲版型

目前新手村與微風草原共用同一份 HTML 版型及互動程式，維持既有外觀與響應式排列。

- `game-layout.js`：建立品牌、場景名稱、天氣提示、訊息區、960 × 640 畫布、五顆選單按鈕、開發者區及系統訊息區。
- `game.css`：共用間距、欄寬、桌面／窄畫面配置、訊息框與按鈕樣式。
- `game-ui.js`：`initGameUI()` 初始化共用選單、一般／系統訊息訂閱、捲動、開發者切換及世界控制。
- `../config/page-layouts.js`：各場景的版型配置，包括標題、說明、canvas ID、場景標籤、旅程距離、額外控制列與開發者欄位。

## 新增場景

1. 在 `config/page-layouts.js` 的 `GAME_PAGE_LAYOUTS` 加入固定場景 ID 的配置。不要放入來自使用者的任意 HTML。
2. 頁面引用 `game.css`，若有特殊繪圖介面，再引用該場景的 CSS。
3. body 依序載入一般 script：`config/page-layouts.js`、帶有 `data-scene="場景ID"` 的 `ui/game-layout.js`。版型會同步建立，之後的舊式 Canvas script 也能直接取得元素。
4. 載入該場景程式，匯入 `initGameUI`，呼叫 `initGameUI({ welcome: '進場訊息' })`。可選擇傳入 `onDayNight`、`onWeather` 回呼；預設會操作共用世界狀態。
5. 場景繪圖與玩法保持在場景自己的資料夾，無須再複製 HTML 版面或訊息框控制程式。

配置的路徑相對於 dist 根目錄，由版型依自身 script URL 解析，不受場景資料夾深度影響。微風草原的 `breeze-plains.css` 只保留獨有的旅程文字與前進控制列排法。
