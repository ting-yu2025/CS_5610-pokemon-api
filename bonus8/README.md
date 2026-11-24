# Pokémon API with cookies

這份作業用 Hono 建立六個 API。使用者和 Pokémon 存在記憶體，重啟伺服器會重設資料。程式主檔是 [`src/pokemon.js`](src/pokemon.js)。

## 第 1 步：安裝與啟動

需要 Node.js 20 或更新版本。在本資料夾執行：

```bash
npm install
npm start
```

伺服器會顯示 `http://localhost:3000`。請保持這個終端機開著，在另一個終端機執行後續指令。可以用 `PORT=4000 npm start` 改用其他連接埠。

## 第 2 步：理解程式

1. `users` 陣列保存 `username`、`password`、`createdAt`；`pokemon` 陣列預先放入一隻屬於 `ash` 的 Pikachu。
2. 註冊和登入成功後，伺服器設定名為 `username` 的 HTTP cookie。登出會立即清除它。
3. 每個 Pokémon API 都先讀 cookie，確認使用者存在。未登入回 `401`。
4. `GET /api/pokemon` 只回傳該使用者擁有的 Pokémon。
5. `POST /api/pokemon` 以 cookie 決定 `owner`，忽略請求 body 的 `owner`，並產生數字 `id`、`health`、`level`。
6. `DELETE /api/pokemon/:id` 只允許擁有者刪除；其他使用者會收到 `403`。不存在的 ID 回 `404`。

| API | 成功狀態 | 請求 body |
| --- | --- | --- |
| `POST /user/register` | `201` | `{"username":"student","password":"pika123"}` |
| `POST /user/login` | `200` | 同上 |
| `POST /user/logout` | `200` | 無 |
| `GET /api/pokemon` | `200` | 無 |
| `POST /api/pokemon` | `201` | `{"species":"Eevee","name":"Eevee"}`；`name` 可省略 |
| `DELETE /api/pokemon/:id` | `204` | 無 |

## 第 3 步：執行與截圖

在第二個終端機執行：

```bash
bash scripts/demo.sh
```

腳本會依序示範六個 API 的成功流程，列出 HTTP 狀態、`Set-Cookie`、新增的 `owner`，以及刪除後的結果。請依作業要求，對這些真實的終端機輸出截圖或錄影。若改用 4000 埠，執行 `BASE_URL=http://127.0.0.1:4000 bash scripts/demo.sh`。

可以另外執行 `npm test`，確認未登入、重複註冊、錯誤密碼、跨使用者刪除等狀態碼。

## 第 4 步：繳交

將本專案放到你可分享的程式碼儲存庫，複製 `src/pokemon.js` 的檔案連結，並連同第 3 步的真實截圖或錄影交到 Canvas。請在截止前確認連結能開啟。

這是符合題目要求的練習版：密碼為明文，cookie 未簽章。不要將這個登入方式用於正式服務。
