---
title: 替代class寫法的react-error-boundary套件
draft: false
date: 2025-12-06T14:00:00.000+08:00
tags:
  - 前端
image_position: top
---
<!--truncate-->

要不是同事提醒有套件可以用，我還在使用class寫法的error boundary，相比之下，程式碼少很多，步驟變成不需要另外新增一個errorBoundary檔案，只需要新增一個errorPage，然後在App檔案內引入react-error-boundary套件後就可以輕鬆使用，在設定fallback為errorPage就可以！

原本寫法：

```typescript
//ErrorBoundary.tsx
import React, { ErrorInfo, ReactNode } from "react";

// 定義 ErrorBoundary 的 props 型別
interface ErrorBoundaryProps {
  children: ReactNode;
}

// 定義 ErrorBoundary 的 state 型別
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * 錯誤邊界組件
 * 捕獲子組件樹中的JavaScript錯誤，記錄並顯示後備UI
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    // 初始化組件狀態
    // hasError: 標記是否捕獲到錯誤
    // error: 存儲捕獲的錯誤物件
    this.state = { hasError: false, error: null };
  }

  /**
   * 靜態方法，當子組件拋出錯誤時觸發
   * 用於更新狀態並觸發重新渲染
   * @param {Error} error - 捕獲到的錯誤物件
   * @returns {Object} 更新後的狀態物件
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // 更新狀態，標記有錯誤發生並存儲錯誤資訊
    return { hasError: true, error };
  }

  /**
   * 當捕獲到子組件的錯誤時調用
   * 可用於記錄錯誤信息和來源
   * @param {Error} error - 捕獲到的錯誤物件
   * @param {Object} errorInfo - 包含componentStack等錯誤詳情
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary 捕捉到錯誤:", error, errorInfo);

    // 特殊處理：模組動態載入錯誤時自動重新載入頁面
    // 檢查錯誤訊息中是否包含特定字串
    if (error.message.includes("Failed to fetch dynamically imported module")) {
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  }

  render(): ReactNode {
    // 當發生錯誤時顯示錯誤畫面
    if (this.state.hasError) {
      return (
        <div className="p-4 text-center m-4">
          <h2>哎呀！出了點問題</h2>
          <p>頁面載入時發生錯誤，正在自動重新載入...</p>
          <button
            onClick={() => window.location.reload()}
            className="p-4 text-center m-4 cursor-pointer border-2 rounded-lg "
          >
            手動重新載入
          </button>
        </div>
      );
    }
    // 沒有錯誤時正常渲染子組件
    return this.props.children;
  }
}

export default ErrorBoundary;
```

替代寫法：

```bash
yarn add react-error-boundary
```

```typescript
//ErrorPage.tsx
import React from 'react';
import type { FallbackProps } from 'react-error-boundary';

const ErrorPage: React.FC<FallbackProps> = ({ error, resetErrorBoundary }) => {
  const message = (error && (error as Error).message) ? (error as Error).message : String(error);

  return (
    <div className="p-4 text-center m-4">
      <h2>哎呀！出了點問題</h2>
      <p className="mb-4">頁面載入時發生錯誤。</p>
      {message && (
        <div className="text-sm text-red-500 mb-4 break-words">{message}</div>
      )}
      <div className="flex justify-center gap-3">
        <button
          onClick={resetErrorBoundary}
          className="p-2 px-4 bg-blue-500 text-white rounded"
          type="button"
        >
          嘗試重新整理元件
        </button>
        <button
          onClick={() => window.location.reload()}
          className="p-2 px-4 border rounded"
          type="button"
        >
          手動重新載入
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;
```

```typescript
// src/App.tsx
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import ErrorPage from 'components/ErrorPage';

// ...

const App: FC = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ReactErrorBoundary FallbackComponent={ErrorPage}>
        {/* ... */}
      </ReactErrorBoundary>
    </Suspense>
  );
};

export default App;
```

輕鬆搞定。
