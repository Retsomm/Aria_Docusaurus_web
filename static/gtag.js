// 確保 dataLayer 存在
window.dataLayer = window.dataLayer || [];

// 定義全域 gtag 函數
window.gtag = function() { 
  window.dataLayer.push(arguments); 
}

// 初始化 gtag
window.gtag('js', new Date());
window.gtag('config', 'G-7KJZMT5GD8');