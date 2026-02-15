import React from 'react';
// 導入 Docusaurus 預設的 MDX 組件
import MDXComponents from '@theme-original/MDXComponents';
// 導入我們自定義的 CodePenEmbed 組件
import CodePenEmbed from '../CodePenEmbed';

export default {
  // 將原始 MDX 組件展開到這個物件中
  ...MDXComponents,
  // 添加我們自定義的組件
  CodePenEmbed,
};