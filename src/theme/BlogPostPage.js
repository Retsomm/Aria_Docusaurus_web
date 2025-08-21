import React from 'react';
import BlogPostSidebar from './BlogPostSidebar';

export default function BlogPostPage({ children, metadata }) {
  const safeMetadata = metadata || {};
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <BlogPostSidebar currentPost={safeMetadata.permalink || ''} />
    </div>
  );
}
