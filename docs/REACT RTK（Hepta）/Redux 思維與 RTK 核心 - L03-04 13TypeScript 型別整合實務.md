---
mdx:
  format: md
---

> 課程：Redux 思維與 RTK 核心
> 第 3 堂：createSlice 核心機制與型別實作

# 13TypeScript 型別整合實務

在上一部分中，我們揭開了 Immer 的神祕面紗，理解了為什麼在 Redux Toolkit (RTK) 中可以「直接修改」狀態而不會破壞不可變性。然而，身為一名進階開發者，你一定會問：**「即便我可以自由修改狀態，但我該如何確保我修改的屬性名稱沒寫錯？或者我傳入 Action 的資料型別是正確的？」**

這就是 TypeScript 大顯身手的地方。在傳統 Redux 中，型別定義往往分散在 Action Types、Action Creators 與 Reducer 中，導致改一個欄位就要動全身。但在 RTK 中，型別整合變得異常優雅——你只需要定義一次，TypeScript 就能幫你完成整條資料流的型別推導。

這一節，我們將深入探討如何將 TypeScript 完美融入 `createSlice`，讓編譯器成為你最強大的開發夥伴。

## 從預測開始：當型別缺失時會發生什麼？

在深入語法之前，我們先做一個思考實驗。假設你有一個管理使用者設定的 Slice：

```typescript
const userSlice = createSlice({
  name: 'user',
  initialState: {
    theme: 'light',
    fontSize: 16
  },
  reducers: {
    setTheme: (state, action) => {
      state.theme = action.payload; // payload 是什麼型別？
    }
  }
});
```

請試著預測：

1. `state.theme` 的型別是什麼？
2. `action.payload` 的型別是什麼？
3. 如果你在元件中呼叫 `dispatch(setTheme({ color: 'red' }))`，TypeScript 會噴錯嗎？

**揭曉答案：**

1. `state.theme` 會被推導為 `string`。
2. `action.payload` 會被推導為 `any`（這在 TypeScript 中是萬惡之源）。
3. TypeScript **不會**噴錯，因為 `any` 可以賦值給任何東西，這會導致你的應用程式在執行時悄悄崩潰。

這就是為什麼我們需要主動定義型別。

---

## 1. 定義 State Interface：建立單一事實來源

雖然 RTK 可以從 `initialState` 自動推導型別，但在實務中，我們強烈建議**先定義一個介面 (interface) 或型別 (type)**。

### 為什麼不依賴自動推導？

自動推導（Type Inference）雖然方便，但在以下三種情境會失效：

- **聯集型別 (Union Types)**：例如 `status` 只能是 `'idle' | 'loading' | 'success'`，自動推導會將其視為通用的 `string`。
- **可選屬性 (Optional Properties)**：初始狀態可能為 `null`，但稍後會存入物件。
- **複雜陣列**：初始值為空陣列 `[]` 時，TS 會將其推導為 `never[]`，導致你以後什麼都塞不進去。

### 實作範例

讓我們定義一個標準的 `UserState`：

```typescript
interface UserState {
  theme: 'light' | 'dark'; // 精確的聯集型別
  fontSize: number;
  lastLogin: number | null; // 允許為空
  preferences: {
    notifications: boolean;
    language: string;
  };
}

const initialState: UserState = {
  theme: 'light',
  fontSize: 16,
  lastLogin: null,
  preferences: {
    notifications: true,
    language: 'zh-TW',
  },
};
```

**關鍵點**：當我們將 `initialState` 標記為 `UserState` 型別時，底下的 `createSlice` 就會自動繼承這個型別定義。這就是「單一事實來源」的體現。

---

## 2. PayloadAction<T> 泛型：約束 Action 的載荷

在 `reducers` 中，最常出錯的地方就是 `action.payload`。RTK 提供了一個內建的泛型 `PayloadAction<T>`，專門用來解決這個問題。

### 什麼是 PayloadAction？

`PayloadAction` 是一個介面，它定義了標準 Redux Action 的結構（包含 `type` 和 `payload`）。透過傳入泛型參數 `<T>`，你可以精確指定 `payload` 的資料結構。

### 實作細節

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// ... 上述的 UserState 定義 ...

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // 1. 不需要 payload 的 reducer
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
    
    // 2. 傳入單一基本型別
    setFontSize: (state, action: PayloadAction<number>) => {
      // 此時 TS 知道 action.payload 必定是 number
      state.fontSize = action.payload;
    },
    
    // 3. 傳入複雜物件
    updateLanguage: (state, action: PayloadAction<string>) => {
      state.preferences.language = action.payload;
    }
  }
});
```

### 為什麼這很重要？

當你使用了 `PayloadAction<number>` 後，TypeScript 會在兩個地方保護你：

1. **Reducer 內部**：如果你試圖把 `action.payload` 當成字串來呼叫 `.toUpperCase()`，編譯器會立即報錯。
2. **Dispatch 時**：當你在元件中使用自動生成的 Action Creator，例如 `dispatch(setFontSize('18'))`，TypeScript 會提醒你：「不對，這應該是個 `number`，不是 `string`。」

---

## 3. Slice 的型別推導機制：全自動化的威力

RTK 的 `createSlice` 在設計上利用了 TypeScript 的「反向推導」。這意味著：

1. **State 的自動繼承**：
因為你定義了 `initialState: UserState`，所以你在任何一個 reducer 中寫 `(state, action) => { ... }` 時，滑鼠移到 `state` 上，你會發現它已經自動被標記為 `UserState` 了。**你完全不需要在每個 reducer 的參數裡重複寫 state 的型別。**
2. **Action Creators 的自動生成**：
當你定義了 `setFontSize: (state, action: PayloadAction<number>)`，RTK 產出的 `userSlice.actions.setFontSize` 就會自動變成一個「接收 `number` 參數並回傳 Action 物件」的函數。

這形成了一個完美的閉環：
**定義 InitialState** $\rightarrow$ **影響 Reducer 內部型別** $\rightarrow$ **影響 Action Creator 外部介面**。

---

## 4. 實作技巧：檔案結構與型別放置

在開發鐵人賽範例或實際專案時，型別該放哪裡也是一門學問。對於 Slice 而言，我們推薦 **"Colocation" (同地協作)** 原則。

### 推薦的 Slice 檔案結構

建議將型別定義直接放在 Slice 檔案的頂部，除非該型別需要在多個 Slice 之間共享。

```typescript
// features/user/userSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// 1. 這裡定義該功能模組專用的介面
export interface UserState {
  name: string;
  isLoggedIn: boolean;
}

const initialState: UserState = {
  name: '',
  isLoggedIn: false,
};

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    login: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
      state.isLoggedIn = true;
    },
    logout: (state) => {
      state.name = '';
      state.isLoggedIn = false;
    }
  }
});

export const { login, logout } = userSlice.actions;
export default userSlice.reducer;
```

### 小撇步：如何處理多個參數？

有時候你的 Reducer 需要多個資料，例如更新使用者的名稱與語言。這時候請記得：**Action 的 payload 永遠只有一個。** 你應該傳入一個物件：

```typescript
// 定義 Payload 的型別
interface UpdateProfilePayload {
  name: string;
  language: string;
}

// 在 reducer 中使用
updateProfile: (state, action: PayloadAction<UpdateProfilePayload>) => {
  const { name, language } = action.payload; // 解構出所需的資料
  state.name = name;
  state.preferences.language = language;
}
```

---

## 深入探討：型別安全的邊界

雖然 TypeScript 很強大，但有些開發者會過度使用型別導致程式碼變得難以閱讀。在 RTK 中，請記住以下兩個原則，能讓你事半功倍：

1. **優先使用 **`**PayloadAction**`** 標記 Action**：
這是確保 dispatch 正確性的關鍵。如果你不寫，`action.payload` 就會變回 `any`，這等於放棄了 TS 的防禦力。
2. **不要手動去標記 **`**createSlice**`** 的泛型參數**：
雖然 `createSlice` 可以寫成 `createSlice<State, CaseReducers, Name>(...)`，但這會讓語法變得極度複雜。正確做法是透過定義 `initialState` 的型別，讓 TS 透過「推導」來幫你完成剩下的工作。

### 常見問題：為什麼我的 Action 沒有 Payload 型別？

這通常發生在你的 `initialState` 是直接寫死的，例如：

```typescript
const initialState = { count: 0 }; // TS 推導為 { count: number }
```

這雖然看起來沒問題，但如果你稍後在 `reducers` 裡寫了一個需要 `string` payload 的 function，TS 雖然能推導出 `action.payload`，但它無法驗證這個 payload 是否對整個狀態機的邏輯一致。因此，養成定義 `interface` 的習慣是進階開發者的基本功。

---

## 總結與連接

現在，我們已經掌握了 `createSlice` 的所有武功祕籍：

- **三大要素**：理解了其結構。
- **自動生成機制**：明白了 Action 與 Reducer 如何自動掛鉤。
- **Immer 魔法**：學會了如何直觀地更新狀態。
- **TypeScript 整合**：學會了如何透過 `interface` 與 `PayloadAction` 建立嚴密的保護網。

有了這些理論武裝，你已經準備好進入實戰階段了。下一部分，我們將整合這一切知識，從零到一實作一個完整的 **Counter Slice**。我們將不再只是談論零碎的語法，而是會寫出一個真正的、可用於專案的邏輯模組，這也將是你鐵人賽系列中第一個完整的實作範例。

讓我們開始動手實作 Counter Slice 吧！
