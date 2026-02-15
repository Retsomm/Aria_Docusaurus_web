import React from 'react';
import MDXComponents from '@theme-original/MDXComponents';
import CodePenEmbed from '../CodePenEmbed';

// Merge original MDX components with our custom components.
// Keep typing permissive to match Docusaurus MDX component map shape.
const CustomMDXComponents = {
  ...MDXComponents,
  CodePenEmbed,
} as unknown as Record<string, any>;

export default CustomMDXComponents;
