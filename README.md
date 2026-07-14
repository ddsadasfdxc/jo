# MAX 工具箱

一个采用 Apple 系统级设计语言的趣味工具聚合主页，界面流畅、精致，包含 Bilibili 解析、抖音解析、今天吃啥、二维码生成等实用小工具。

## 技术栈

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Lucide React
- Express（后端 API）

## 本地开发

```bash
pnpm install
pnpm run dev
```

`pnpm run dev` 会同时启动前端（Vite）和后端 API（Express）。

## 构建

```bash
pnpm run build
```

## 后端说明

Bilibili 视频解析等功能需要后端支持，因为 B 站 API 在浏览器端受 CORS 限制。

- 后端入口：`server/index.ts`
- 主要接口：`POST /api/bilibili/parse`
- 本地开发时 Vite 会自动代理 `/api/*` 到 `http://localhost:3001`

部署到生产环境时，需要将后端单独部署到支持 Node.js 的服务器（如 IGA Pages、Vercel、Render 等），并通过环境变量 `VITE_API_BASE_URL` 指定后端地址。

## 在线预览

<https://ddsadasfdxc.github.io/jo/>

> 注意：GitHub Pages 仅托管前端静态页面，Bilibili 解析等需要后端的功能在在线预览版中暂不可用。请在本地运行完整体验。
