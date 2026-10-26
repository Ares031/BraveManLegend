# 道具編號規則

## 定義 ID（數字）

兩位分類前綴＋三位序號，序號每類獨立由 001 起，範圍 001～999。

| 大類 | 類型與前綴 |
| --- | --- |
| 武器 | 單手劍 10、雙手劍 11、匕首 12、弓 13、長槍 14、大錘 15、投擲類 16、拳腳 17 |
| 防具 | 頭盔 20、盔甲 21、護腿 22、靴子 23、手套 24、盾牌 25 |
| 飾品 | 戒指 30、項鍊 31、耳環 32 |

木劍為 `10001`；`11001` 是雙手劍類的第一個編號範例，目前並未新增雙手木劍資料。盾牌與其他道具的定義 ID 前綴尚未指定。

`id-rules.js` 集中固定前綴，`makeItemId(category,type,serial)` 建立數字 ID，catalog 載入時會檢查 ID 是否符合類型及是否重複。分類按目前 catalog import 順序確定後固定，不因未來重排而重編。序號明確寫入資料，不使用陣列位置自動產生，移除資料後不重用已發行 ID。

## 實例 ID（字串）

| 類型參數 | 格式 | 首個 ID |
| --- | --- | --- |
| equipment | eq-＋8 位數字 | eq-00000000 |
| item | itm-＋8 位數字 | itm-00000000 |
| runestone | ru-＋8 位數字 | ru-00000000 |
| enchantment | eh-＋8 位數字 | eh-00000000 |

四類各自計數至 99999999，用完拒絕產生，不回繞或重用。`player/instance-ids.js` 使用 IndexedDB `bravemanlegend.player.instances.v1` 的 counters object store 保存下個序號，交易提交成功後才回傳，跨刷新與分頁共用，並防止同時分配重複編號。這是本機同瀏覽器、同來源的編號空間，跨電腦合併存檔的規則尚未設計，清除網站資料也會清除計數器。

```js
await instanceIds.next('equipment');
await instanceIds.next('runestone');
```

`createEquipment`／`rollMonsterDrops` 僅骰出屬性，不耗用編號；`createEquipmentInstance`／`rollMonsterDropInstances` 再配置永久實例 ID。微風草原實際擊殺已接後者，目前仍只顯示掉落，背包入庫尚未實作。編號已配置即不回收，即使該次掉落未保存也可有跳號。
