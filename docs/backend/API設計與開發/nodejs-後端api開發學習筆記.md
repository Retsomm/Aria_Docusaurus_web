---
date: 2026-08-11T14:43:31.000+08:00
---

# Node.js 後端 API 開發學習筆記

> 學習路徑：Node.js 核心 → Express.js 框架 → RESTful API 設計 → PostgreSQL 與 Prisma

---

## 第一階段：Node.js 核心觀念

### 事件迴圈（Event Loop）

JavaScript 是**單執行緒**，同一時間只能做一件事。Node.js 能同時應付大量請求，靠的是「事件迴圈」機制：

1. **呼叫堆疊（Call Stack）**：同步程式碼依序執行

2. **遇到非同步任務**（setTimeout、讀檔、資料庫查詢）：丟給背景（libuv / Web APIs）處理，呼叫堆疊繼續往下跑

3. **任務完成**：結果進入\*\*回呼佇列（Callback Queue）\*\*排隊

4. **事件迴圈**：不斷檢查呼叫堆疊是否清空，清空後才把回呼佇列的任務搬進來執行

**驗證範例：**

```
console.log('1. 同步，最先印出');

setTimeout(() => {
  console.log('4. 非同步，最後印出');
}, 0);

console.log('2. 同步，第二個印出');
console.log('3. 同步跑完了');
```

輸出順序：`1 → 2 → 3 → 4`。即使 `setTimeout` 延遲設 0 毫秒，也一定排在所有同步程式碼之後，因為它必須先進回呼佇列排隊。

---

## 第二階段：Express.js 框架

### 基本架構：Router 與 Middleware

- **Router**：決定「什麼樣的請求」對應「哪個處理函式」

- **Middleware**：請求進來到回應送出之間的處理站，每一層可以檢查、修改資料，或決定要不要呼叫 `next()` 繼續往下傳

**請求生命週期**：請求 → CORS 檢查 → 解析 Body → 路由處理 →（若出錯）錯誤處理 middleware → 送出回應

**基本伺服器範例：**

```
import express from 'express';

const app = express();
const PORT = 3000;

// 自訂 middleware：一定要呼叫 next()，否則請求會卡住
app.use((req, res, next) => {
  console.log(`收到請求：${req.method} ${req.url}`);
  next();
});

app.use(express.json()); // 解析 JSON body，一定要寫在路由「之前」

app.get('/users', (req, res) => {
  res.json({ message: '使用者列表' });
});

app.listen(PORT, () => {
  console.log(`伺服器已啟動：http://localhost:${PORT}`);
});
```

### Router 模組化拆分

把不同資源的路由拆成獨立檔案，用 `express.Router()` 建立，最後在 `server.js` 用 `app.use('/前綴', router)` 掛載。這是「職責分離」原則的實踐，避免單一檔案過度肥大。

### 錯誤處理機制

**重點：Express 預設抓不到 async 函式裡的錯誤**，需要包裝函式來處理。

```
// utils/catchAsync.js —— 用 .catch(next) 統一接住 async 路由裡的錯誤
const catchAsync = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // fn 必須是 async 函式，才有 .catch() 可用
  };
};
export default catchAsync;
```

```
// errors/AppError.js —— 用工廠函式（不用 class）建立帶狀態碼的錯誤物件
function createAppError(message, statusCode) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}
export default createAppError;
```

```
// server.js 錯誤處理 middleware，一定要放最後面，且必須有 4 個參數 (err, req, res, next)
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.isOperational ? err.message : '伺服器發生未預期的錯誤';
  res.status(statusCode).json({ status: 'error', message });
});
```

### 環境變數管理（dotenv）

```
npm install dotenv
```

```
import 'dotenv/config'; // 放檔案最上方
const PORT = process.env.PORT || 3000;
```

- `.env` 存放敏感/會變動的設定值（連線字串、金鑰）

- 一定要把 `.env` 加進 `.gitignore`，避免上傳到 GitHub

---

## 第三階段：RESTful API 設計

### REST 核心原則

用**網址代表資源**，用 **HTTP 動詞代表動作**：

| 動作 | 正確寫法 | 
|---|---|
| 取得列表 | `GET /users` | 
| 取得單筆 | `GET /users/5` | 
| 新增 | `POST /users` | 
| 整包替換 | `PUT /users/5` | 
| 部分更新 | `PATCH /users/5` | 
| 刪除 | `DELETE /users/5` | 

`PUT` = 整包替換（沒傳的欄位視為清空）；`PATCH` = 部分更新（只改有傳的欄位）。

### 請求驗證（Zod）

後端一定要自己驗證資料，不能只信任前端：

```
import { z } from 'zod';

export const createUserSchema = z.object({
  name: z.string().min(1, '姓名不能為空').max(50),
  email: z.string().email('email 格式不正確'),
});
export const updateUserSchema = createUserSchema.partial(); // 所有欄位變選填
```

```
// middlewares/validate.js
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => issue.message);
    return res.status(400).json({ status: 'error', message: '請求資料驗證失敗', errors });
  }
  req.body = result.data;
  next();
};
export default validate;
```

用法：`[router.post](router.post)``('/', validate(createUserSchema), handler)`

### 統一回應格式

```
// utils/response.js
export const successResponse = (res, statusCode, data, meta = null) => {
  const body = { status: 'success', data };
  if (meta) body.meta = meta;
  res.status(statusCode).json(body);
};
```

> **注意**：`204 No Content`（例如 DELETE 成功）語意上**不該有 body**，不要套用 `successResponse`，直接用 `res.status(204).send()`。

### 分頁：Offset vs Cursor

**Offset 分頁**（`skip`/`take`）：資料若持續高頻寫入，翻頁之間可能出現**重複或遺漏**。

**Cursor 分頁**（游標分頁）：用穩定遞增欄位（如 `id`，或 `timestamp + id` 組合）當游標，查詢「上次看到的位置之後」的資料：

```
SELECT * FROM readings WHERE id > 87 ORDER BY id LIMIT 10;
```

高頻寫入的資料（如即時感測數據）建議用 cursor 分頁，避免 offset 分頁的重複/遺漏問題。

### API 文件化（Swagger / OpenAPI）

用標準格式描述 API，搭配 `swagger-jsdoc` + `swagger-ui-express` 可自動產生互動式文件網頁。建議等 API 形狀穩定後再導入。

---

## 第四階段：PostgreSQL 與 Prisma

### 正規化（Normalization）

同一份資料只存一個地方，不重複存。用\*\*外鍵（Foreign Key）\*\*指向另一張表的主鍵，而不是把整包資料複製過去。

### 一對多關聯（One-to-Many）

範例：一個 User 對應多篇 Post。

```
model User {
  id    Int    @id @default(autoincrement())
  name  String
  email String @unique
  posts Post[] // 反向關聯，不會產生實體欄位
}

model Post {
  id       Int     @id @default(autoincrement())
  title    String
  content  String?
  author   User    @relation(fields: [authorId], references: [id])
  authorId Int     // 真正的外鍵欄位

  @@index([authorId])
}
```

查詢時用 `include` 把關聯資料一起撈出來：

```
prisma.post.findMany({ include: { author: true } });
prisma.user.findUnique({ where: { id }, include: { posts: true } }); // 反向查詢
```

### 多對多關聯（Many-to-Many）

範例：Post 與 Tag 互相對應多筆。

```
model Tag {
  id    Int    @id @default(autoincrement())
  name  String @unique
  posts Post[]
}

model Post {
  // ...其他欄位
  tags Tag[] // 兩邊都用陣列，Prisma 自動建立隱形的中間關聯表
}
```

新增時用 `connect` 建立關聯：

```
prisma.post.create({
  data: {
    title, content, authorId,
    tags: { connect: tagIds.map((id) => ({ id })) },
  },
  include: { tags: true, author: true },
});
```

### N+1 查詢問題

**錯誤示範**（在迴圈裡一筆一筆查）：

```
const posts = await prisma.post.findMany(); // 1 次查詢
const result = await Promise.all(
  posts.map(async (post) => {
    const author = await prisma.user.findUnique({ where: { id: post.authorId } }); // N 次查詢！
    return { ...post, author };
  })
);
```

100 篇文章 = 101 次資料庫查詢。**正確做法：一律用 `include`**，讓 Prisma 優化成 1\~2 次查詢。

### 索引（Index）

針對**常拿來查詢/排序/過濾**的欄位加索引，加快查詢速度：

```
@@index([authorId])
@@index([createdAt])
```

用 `EXPLAIN ANALYZE` 驗證是否有用到索引：

```
EXPLAIN ANALYZE SELECT * FROM "Post" WHERE "authorId" = 1;
```

- `Seq Scan` = 全表掃描（沒用到索引）

- `Index Scan` = 有用到索引

**注意**：索引會加快查詢，但會拖慢寫入（INSERT/UPDATE），不要每個欄位都加。

### Migration 常用指令

```
npx prisma init                          # 初始化 Prisma
npx prisma migrate dev --name 描述文字    # 修改 schema 後，建立並套用 migration
npx prisma generate                      # 重新產生 Prisma Client
npx prisma studio                        # 開啟視覺化資料庫管理介面
```

---

## 整合練習：身分驗證（Authentication）與授權（Authorization）

> 把前四階段的知識整合進「部落格系統」小專案，額外補充密碼加密、JWT、路由保護、權限控管。

### 密碼加密（bcrypt）

**絕對不能把密碼存成明文**。用雜湊（Hash）演算法把密碼轉成不可逆亂碼，驗證時重新雜湊比對，而非比對原文。

```
npm install bcrypt jsonwebtoken
```

```
model User {
  id       Int    @id @default(autoincrement())
  name     String
  email    String @unique
  password String // 存雜湊過的密碼
  posts    Post[]
}
```

### 註冊（Register）

```
const hashedPassword = await bcrypt.hash(password, 10); // 10 = 雜湊複雜度
const newUser = await prisma.user.create({ data: { name, email, password: hashedPassword } });

// 絕對不要把密碼回傳給前端，用解構排除掉
const { password: _, ...userWithoutPassword } = newUser;
```

email 若已存在，回傳 `409 Conflict`。

### 登入（Login）與 JWT

```
const isPasswordValid = await bcrypt.compare(password, user.password); // 重新雜湊比對

const token = jwt.sign(
  { userId: user.id },
  process.env.JWT_SECRET,
  { expiresIn: '7d' }
);
```

- `.env` 需加上 `JWT_SECRET`（簽署 token 用的密鑰，只有伺服器知道）

- email 不存在 或 密碼錯誤，**回傳同一句錯誤訊息**（`401`），避免洩漏「這個 email 是否存在」給攻擊者

### 保護路由（Authentication Middleware）

前端需在 header 帶上 `Authorization: Bearer <token>`。

```
// middlewares/authenticate.js
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(createAppError('請先登入才能執行這個動作', 401));
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId; // 掛在 req 上，後續路由可直接使用
    next();
  } catch (err) {
    next(createAppError('token 無效或已過期，請重新登入', 401));
  }
};
```

用法：`[router.post](router.post)``('/', authenticate, validate(schema), handler)`

**重點**：新增文章時，`authorId` 不再由前端傳入，而是從 `req.userId`（token 解出來的）取得，避免前端偽造身分冒充他人發文。

### 授權（Authorization）：只有本人能編輯/刪除

**驗證（Authentication）** = 確認你是誰；**授權（Authorization）** = 確認你有沒有權限做這件事。

```
const post = await prisma.post.findUnique({ where: { id: postId } });
if (!post) throw createAppError('找不到文章', 404);

if (post.authorId !== req.userId) {
  throw createAppError('你沒有權限編輯這篇文章', 403); // 知道你是誰，但沒權限
}
```

### 401 vs 403 差異

| 狀態碼 | 意義 | 
|---|---|
| `401 Unauthorized` | 不知道你是誰（沒登入、token 無效/過期） | 
| `403 Forbidden` | 知道你是誰，但你沒有權限做這件事 | 

---

## 常見錯誤排查筆記

- **`PrismaClient` 不要每個檔案各自 `new`**：整個專案共用一個實例（`lib/prisma.js`），否則連線池會被重複建立，正式環境容易把資料庫連線數用光

- **`Promise.all` 平行處理不相依的查詢**：例如同時查資料 + 算總筆數，縮短回應時間

- **Prisma 找不到資料時**（`update`/`delete`）會丟出 `P2025` 錯誤，記得用 `.catch()` 轉換成自訂的錯誤格式

- \*\*外鍵限制（Foreign Key Constraint）\*\*是資料庫層級的安全網：就算 API 驗證沒做好，資料庫也會擋下無效的關聯資料