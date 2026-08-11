---
date: 2026-08-11T14:43:31.000+08:00
---

# Swagger / OpenAPI 文件管理學習筆記

> 目標：讓 Express API 自動產生互動式文件，前端不用再另外問「這個 API 要傳什麼」。

---

## 核心觀念：OpenAPI 規範

OpenAPI（前身 Swagger）是一份**描述 API 的規格文件**（YAML/JSON），主要描述：

- **paths**：有哪些網址、支援哪些 HTTP method

- **parameters**：路徑參數、query string、body 需要什麼

- **responses**：回傳格式與狀態碼

- **components/schemas**：可重複引用的資料結構定義

用 `swagger-jsdoc` 把程式碼裡的**特殊格式註解**掃描、轉換成 OpenAPI 規格，讓文件跟程式碼放在一起，減少「文件忘記更新」的問題。搭配 `swagger-ui-express` 把規格渲染成可互動測試的網頁。

```
npm install swagger-jsdoc swagger-ui-express
```

---

## 建立 Swagger 設定檔

```
// config/swagger.js
import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: '部落格系統 API',
      version: '1.0.0',
      description: '使用者、文章、標籤的 RESTful API 文件',
    },
    servers: [{ url: 'http://localhost:3000', description: '本機開發環境' }],
    components: {
      // 定義「怎麼傳 JWT token」，讓 Swagger UI 出現 Authorize 按鈕
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
      // 定義可重複引用的資料結構，避免每個端點都重寫一次
      schemas: {
        User: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '小明' },
            email: { type: 'string', example: 'ming@example.com' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Post: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            title: { type: 'string', example: '我的第一篇文章' },
            content: { type: 'string', example: '這是內文' },
            authorId: { type: 'integer', example: 1 },
          },
        },
        Tag: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            name: { type: 'string', example: '技術' },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: { type: 'string', example: 'error' },
            message: { type: 'string', example: '找不到資料' },
          },
        },
      },
    },
  },
  apis: ['./routes/*.js'], // 告訴 swagger-jsdoc 要去哪些檔案找註解
};

export const swaggerSpec = swaggerJsdoc(options);
```

## 掛上 Swagger UI

```
// server.js
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
```

啟動後打開 `<http://localhost:3000/api-docs>` 即可看到互動式文件。

---

## 註解寫法範例

### 基本 GET（帶 query 參數）

```
/**
 * @openapi
 * /users:
 *   get:
 *     summary: 取得使用者列表（分頁）
 *     tags: [Users]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer }
 *         description: 頁碼，預設 1
 *       - in: query
 *         name: limit
 *         schema: { type: integer }
 *         description: 每頁筆數，預設 10
 *     responses:
 *       200:
 *         description: 成功取得列表
 */
```

### 帶路徑參數 + 引用共用 schema

```
/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: 取得單一使用者
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: 成功取得使用者
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status: { type: string, example: success }
 *                 data:
 *                   $ref: '#/components/schemas/User'
 *       404:
 *         description: 找不到使用者
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
```

### 帶 Request Body

```
/**
 * @openapi
 * /users:
 *   post:
 *     summary: 新增使用者
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email]
 *             properties:
 *               name: { type: string, example: 小明 }
 *               email: { type: string, format: email, example: ming@example.com }
 *     responses:
 *       201:
 *         description: 新增成功
 *       400:
 *         description: 資料驗證失敗
 */
```

### 需要登入的端點（Bearer Token）

```
/**
 * @openapi
 * /posts:
 *   post:
 *     summary: 新增文章（需要登入）
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title]
 *             properties:
 *               title: { type: string, example: 我的第一篇文章 }
 *               content: { type: string, example: 這是內文 }
 *               tagIds:
 *                 type: array
 *                 items: { type: integer }
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: 新增成功
 *       401:
 *         description: 未登入
 */
```

`security: [{ bearerAuth: [] }]` 會讓這個端點在 Swagger UI 上出現**鎖頭圖示**。

---

## 在 Swagger UI 上測試需要登入的端點

1. 打開 `<http://localhost:3000/api-docs>`

2. 右上角點 **Authorize**

3. 貼上 token（**不用**加 `Bearer `前綴，UI 會自動組合），點 **Authorize** → **Close**

4. 授權過一次後，所有有鎖頭的端點都會自動帶上這個 token，不用每個端點重貼

---

## 實務注意事項

- **`$ref` 引用共用 schema**：避免每個端點都重寫一次完整的資料結構，改一次全部端點同步更新

- **YAML 縮排非常敏感**：建議複製既有範例再改內容，不要手動調整縮排層級，容易解析失敗

- **API 文件也能傳達設計意圖**：例如「標籤要先透過 `POST /tags` 建立才能被文章引用」這種業務規則，寫進 `description` 裡，前端就不用另外問

- **`apis` 路徑設定要涵蓋所有路由檔案**：`apis: ['./routes/*.js']` 若之後路由檔案位置改變，記得同步更新這個 glob pattern，否則新增的路由不會出現在文件裡