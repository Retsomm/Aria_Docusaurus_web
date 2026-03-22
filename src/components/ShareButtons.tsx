import React from 'react';
import {useBlogPost} from '@docusaurus/plugin-content-blog/client';
import {useColorMode} from '@docusaurus/theme-common';
import styles from './ShareButtons.module.css';


const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const ThreadsIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.689-2.044 1.6-1.7 1.91-4.071 1.91-5.545l-.002-.08H12.19v-2.063h9.572l.028.562c.19 3.823-.602 6.791-2.35 8.833-1.604 1.867-3.955 2.809-6.94 2.816H12.186z"/>
  </svg>
);

export default function ShareButtons(): React.ReactNode {
  const {metadata} = useBlogPost();
  const {colorMode} = useColorMode();
  // 使用瀏覽器當前 URL，確保中文 slug 完整（避免 metadata.permalink 截斷問題）
  const pageUrl =
    typeof window !== 'undefined' ? window.location.href : metadata.permalink;
  const title = metadata.title;
  const monoColor = colorMode === 'dark' ? '#ffffff' : '#000000';

  const platforms = [
    {
      name: 'X',
      icon: <XIcon />,
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(title)}`,
      color: monoColor,
      mono: true,
    },
    {
      name: 'LinkedIn',
      icon: <LinkedInIcon />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`,
      color: '#0A66C2',
      mono: false,
    },
    {
      name: 'Threads',
      icon: <ThreadsIcon />,
      url: `https://www.threads.net/intent/post?text=${encodeURIComponent(`${title} ${pageUrl}`)}`,
      color: monoColor,
      mono: true,
    },
  ];

  return (
    <div className={styles.container}>
      <span className={styles.label}>分享這篇文章</span>
      <div className={styles.buttons}>
        {platforms.map(({name, icon, url, color, mono}) => (
          <a
            key={name}
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${styles.button}${mono ? ` ${styles['button--mono']}` : ''}`}
            style={{'--brand-color': color} as React.CSSProperties}
            aria-label={`分享到 ${name}`}
            title={`分享到 ${name}`}
          >
            {icon}
            <span>{name}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
