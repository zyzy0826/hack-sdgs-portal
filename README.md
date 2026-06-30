# hack-sdgs-portal

資工營 2026 活動網站 — 公館商圈任務 & 桌遊之夜計分系統。
React (Vite) + Firebase Realtime Database，Minecraft 像素風，手機優先 RWD。

## 開發

```bash
npm install
cp .env.example .env   # 填入真實 Firebase 設定
npm run dev
```

## Firebase 設定

1. 建立 Firebase 專案並啟用 **Realtime Database**。
2. 把 Web App 的設定值填入 `.env`（見 `.env.example`）。
3. 資料庫規則設為全開（見 `database.rules.json`）：
   ```json
   { "rules": { ".read": true, ".write": true } }
   ```
4. 首次載入網站時會自動初始化 `camp2026/config`、`camp2026/teams`、
   `camp2026/gongguan/team_1..6` 的空白資料（缺資料才寫入，不覆寫進度）。

## 密碼

定義在 `src/config/passwords.js`（非安全機制，僅防誤操作）：
隊輔 `1234`、關主 `5678`、工作人員/管理員 `0000`。

## 路由

| 路徑 | 說明 |
| --- | --- |
| `/` | 首頁身份選擇 |
| `/student/:teamId` | 學員端（唯讀任務進度） |
| `/leader/:teamId` | 隊輔端（打勾任務、計分） |
| `/gamemaster/:groupId` | 關主端（桌遊記分） |
| `/admin/groups` | 大組分組設定 |
| `/staff` | 工作人員 Dashboard |
| `/staff/ranking` | 閉幕排名動畫 |

## 部署到 GitHub Pages

```bash
npm run deploy   # vite build + gh-pages -d dist
```

`vite.config.js` 的 `base` 設為 `/hack-sdgs-portal/`，並使用 HashRouter，
因此在 GitHub Pages 子路徑下路由可正常運作。
