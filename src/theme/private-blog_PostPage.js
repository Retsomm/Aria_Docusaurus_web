import React from 'react';
import BlogPostSidebar from './BlogPostSidebar';
import BlogPostContent from '@theme/BlogPostContent';

export default function PrivateBlogPostPage(props) {
  const metadata = props.metadata || {};
  return (
    <div style={{ display: 'flex', gap: 32 }}>
      <main style={{ flex: 1 }}>
        <BlogPostContent {...props} />
      </main>
      <BlogPostSidebar currentPost={metadata.permalink || ''} />
    </div>
  );
}
