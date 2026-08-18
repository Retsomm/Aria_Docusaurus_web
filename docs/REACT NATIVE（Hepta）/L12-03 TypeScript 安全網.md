---
mdx:
  format: md
---

> 課程：RN 跨平台開發基礎
> 第 12 堂：APP 架構規劃

# TypeScript 安全網

想像你正在駕駛一輛高速行駛的賽車，而你的 APP 程式碼就是那台引擎。如果沒有 TypeScript，你就像是在黑暗中盲目換檔，祈禱齒輪能對得上。在 React Native 的世界裡，最讓人崩潰的閃退往往不是邏輯錯誤，而是那些「我以為這裡有資料，結果它是 undefined」的瞬間。特別是當你大量使用 AI 輔助開發時，AI 雖然寫得快，但它有時會瞎編欄位名稱。這堂課我們要建立一套「型別安全網」，讓 TypeScript 成為你的副駕駛，在錯誤發生前就幫你踩下煞車。

## Navigation 的型別安全：終結「導覽閃退」

在 Topic 3.5 中，我們討論過跨頁面傳遞 `params` 的原則：只傳 ID，不傳大型物件。但實務上，最常遇到的問題是：你在 A 頁面寫了 `navigation.navigate('Detail', { id: 123 })`，但在 B 頁面卻用 `route.params.productId` 來接收。

這種「名稱不對應」的錯誤，在純 JavaScript 環境下，只有在你點開頁面、看到螢幕變白或 APP 直接關閉的那一刻，你才會發現。

### 建立 RootStackParamList

要解決這個問題，我們需要定義一個「導覽地圖」，在 React Navigation 中這被稱為 `RootStackParamList`。這是一個單純的 TypeScript 型別，用來列出所有頁面及其對應的參數。

```typescript
// types/navigation.ts

export type RootStackParamList = {
  Home: undefined; // Home 頁面不需要參數
  BookDetail: { bookId: string; title: string }; // BookDetail 頁面需要書本 ID 與標題
  Reader: { chapterId: string; startOffset?: number }; // startOffset 是選填的
  Profile: { userId: string };
};
```

### 將型別注入 Hooks

定義好地圖後，我們需要告訴 React Navigation 的 hooks 該如何使用它。這能讓你獲得強大的自動補完功能。

```tsx
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from './types/navigation';

// 1. 為 navigation 對象定義型別
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

// 2. 為 route 對象定義型別（以 BookDetail 為例）
const route = useRoute<RouteProp<RootStackParamList, 'BookDetail'>>();

// 現在，當你輸入：
// navigation.navigate('...') -> AI 會自動跳出 Home, BookDetail, Reader 的選項
// route.params. -> AI 會自動告訴你這裡有 bookId 和 title
```

**為什麼這很重要？** 當你的 APP 規模增長到 20 個以上的頁面時，你不可能記得每個頁面需要什麼參數。有了這個安全網，如果你在某次重構中修改了 `BookDetail` 的參數名稱，TypeScript 會立刻在整個專案中紅字報錯，提醒你有哪些 `navigate` 呼叫端需要修正。這就是「可維護性」的起點。

---

## API Response 的型別防線：不要盲目相信後端

在 Topic 8.2 中，我們學會了如何封裝 API Layer。但有一個殘酷的現實：後端工程師（或是你自己寫的 API）可能會在不通知的情況下更改 JSON 的結構。

一般的做法是直接定義一個 `interface` 並斷言（Type Assertion）API 回傳的資料：

```typescript
interface Book {
  id: string;
  title: string;
  cover_url: string; // 假設原本是底線命名
}

const fetchBook = async (id: string): Promise<Book> => {
  const response = await axios.get(`/books/${id}`);
  return response.data as Book; // 這裡存在風險！
};
```

如果後端突然把 `cover_url` 改成了 `thumbnail`，TypeScript 在編譯時期**完全不會發現**，因為你用了 `as Book` 強制叫它閉嘴。結果就是你的 `Image` 元件收到了 `undefined`，導致圖片跑不出來。

### 進階：使用 Zod 進行 Runtime Validation

為了建立真正的安全網，我們應該在資料「進入」系統的那一刻進行檢查。這就是 **Zod** 這種工具大顯身手的時候。它不只是型別，它是一個「驗證器」。

```typescript
import { z } from 'zod';

// 定義一個「模式」（Schema）
const BookSchema = z.object({
  id: z.string(),
  title: z.string(),
  cover_url: z.string().url(), // 甚至可以驗證是不是正確的 URL 格式
});

// 自動從 Schema 導出 TypeScript 型別
type Book = z.infer<typeof BookSchema>;

const fetchBook = async (id: string): Promise<Book> => {
  const response = await axios.get(`/books/${id}`);
  
  // 這裡進行執行期驗證
  const result = BookSchema.safeParse(response.data);
  
  if (!result.success) {
    // 如果格式不對，這裡就攔截並報錯，而不是讓錯誤流向 UI 層
    console.error('API 格式錯誤:', result.error);
    throw new Error('資料格式毀損');
  }
  
  return result.data;
};
```

這種做法雖然多寫了幾行程式碼，但它將「API 結構變更」的爆炸半徑控制在了 API 層，而不會導致底層的 UI 元件莫名其妙地閃退。這對於內容類 APP 來說至關重要，因為你的內容資料來源可能非常複雜。

---

## 拒絕 any：TypeScript 的修養

如果你在程式碼中到處寫 `any`，那你其實是在寫「有加分號的 JavaScript」，完全浪費了 TypeScript 的保護力。

### 為什麼 any 是架構的毒藥？

`any` 會傳染。如果你把 API 回傳值設為 `any`，那麼接收它的元件 Props 就會變成了 `any`，接著內部的邏輯運算也會失去型別保護。當錯誤發生時，你會完全找不到來源。

### 使用 unknown 作為安全的替代方案

當你真的不確定資料型別時（例如從 AsyncStorage 讀取快取，或接收第三方套件的事件），請使用 `unknown`。

`unknown` 與 `any` 的差別在於：

- `any` 允許你做任何事（呼叫屬性、當成 function 執行）。
- `unknown` 強迫你必須先「檢查」它是什麼，否則不讓你用。

```typescript
const processData = (data: unknown) => {
  // data.id -> 報錯！TS 不知道 data 是什麼
  
  if (typeof data === 'object' && data !== null && 'id' in data) {
    // 經過檢查（Type Guard），現在 TS 知道 data 至少有個 id 屬性
    console.log((data as any).id); 
  }
};
```

---

## 型別驅動開發 (TDD) 與 AI 協作

這是這堂課最有價值的部分。當你使用 Cursor 或 Copilot 等 AI 工具時，**定義良好的型別是給 AI 最好的指令**。

### 案例：讓 AI 生成一個複雜的排序邏輯

如果你對 AI 說：「幫我寫一個排序書本列表的功能」，AI 可能會給你五花八門的寫法。

但如果你先定義好介面：

```typescript
type SortOption = 'recent' | 'rating' | 'title';

interface BookMetadata {
  id: string;
  title: string;
  rating: number;
  publishedAt: Date;
}

/**
 * 根據 SortOption 對 BookMetadata 陣列進行排序的函數
 */
export const sortBooks = (books: BookMetadata[], option: SortOption): BookMetadata[] => {
  // 這裡讓 AI 去實作
}
```

當你給出這個結構時，AI 幾乎不可能寫錯。因為：

1. 它知道輸入是什麼（`BookMetadata[]`）。
2. 它知道有哪些排序選項（`SortOption`）。
3. 它必須回傳一樣的結構。

**型別就是你與 AI 溝通的「契約」**。契約寫得越清楚，AI 生成的程式碼就越精準，Bug 就越少。

---

## 建立型別守衛 (Type Guards) 處理條件渲染

在內容類 APP 中，我們常有不同類型的內容，例如「文章」和「影片」。在 TypeScript 中，這稱為 **Discriminated Unions（可辨識聯集）**。

```typescript
type Content = 
  | { type: 'article'; body: string; author: string }
  | { type: 'video'; url: string; duration: number };

const ContentRenderer = ({ item }: { item: Content }) => {
  if (item.type === 'article') {
    // 在這個區塊內，TS 自動知道 item 只有 body 和 author
    return <Text>{item.body}</Text>;
  } else {
    // 在這個區塊內，TS 自動知道 item 有 url 和 duration
    return <VideoPlayer source={{ uri: item.url }} />;
  }
};
```

這種寫法能保證你不會在渲染影片時誤用了文章的 `author` 欄位。這就是利用型別系統來輔助業務邏輯。

## 讓型別成為你的安全防線

在 React Native 開發中，TypeScript 不應該被視為「多寫的負擔」，而應該被視為「自動化的文件」與「執行期的保險」。透過定義 `RootStackParamList`、建立 API 回傳模式、以及拒絕使用 `any`，你正在將 APP 的穩定性從「靠運氣」轉向「靠編譯」。

特別是當你在維護那兩款已經上架的 APP 時，你會發現，當你三個月後回來改程式碼，或是請 AI 幫你新增功能時，這些預先寫好的型別定義會幫你省下無數次 Debug 的夜晚。

### 重點回顧

- **導覽安全**：使用 `RootStackParamList` 確保跳頁參數正確。
- **資料防禦**：使用 Zod 驗證 API 回傳值，確保執行期資料符合預期。
- **純淨型別**：以 `unknown` 取代 `any`，強迫自己進行型別檢查。
- **AI 溝通**：先寫型別（Interface/Type），再讓 AI 寫實作邏輯。

有了專案結構、API 管線以及這套 TypeScript 安全網，你已經具備了專業 RN 開發者的基石。在下一部分，我們將直接進入實戰，拿你現有的 APP 程式碼進行「架構健診」，看看如何將這些理論落地到你的真實專案中。
