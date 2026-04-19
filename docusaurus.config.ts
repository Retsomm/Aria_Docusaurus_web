import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';

const config: Config = {
  title: 'Retsnom | 前端學習筆記',
  tagline: 'Aria 的程式學習筆記、技術分享與生活記錄',
  favicon: 'img/retsnom-favion.PNG',

  url: 'https://ariadocusauruswed.netlify.app',
  baseUrl: '/',
  trailingSlash: false,

  organizationName: 'Retsomm',
  projectName: 'Retsnom',

  onBrokenLinks: 'warn',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
    mermaid: true, 
  },

  i18n: {
    defaultLocale: 'zh-TW',
    locales: ['zh-TW'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.ts'),
        },
        blog: {
          showReadingTime: true,
          truncateMarker: /<!--\s*(truncate)\s*-->/,
          postsPerPage: 5,
          blogSidebarCount: 10,
          blogTitle: 'Retsnom Blog',
          blogDescription: 'Aria 的生活記錄、讀書心得與技術分享',
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Retsnom Blog',
            description: 'Aria 的生活記錄、讀書心得與技術分享',
            copyright: `Copyright © ${new Date().getFullYear()} Retsnom`,
          },
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          lastmod: 'date',
          changefreq: 'monthly',
          priority: 0.5,
          ignorePatterns: [
            '/tags/**',
            '/private-blog/**',
            '/blog/tags/**',
            '/docs/tags/**',
            '/blog/archive',
            '/blog/authors/**',
            '/markdown-page',
          ],
          filename: 'sitemap.xml',
        },
      } as any),
    ],
  ],

  plugins: [
    [
      '@docusaurus/plugin-content-blog',
      {
        id: 'private-blog',
        routeBasePath: 'private-blog',
        path: './blog-private',
        showReadingTime: false,
        postsPerPage: 10,
        blogSidebarCount: 10,
        blogSidebarTitle: 'Private Blog',
        feedOptions: {type: []},
      },
    ],
    [
      '@docusaurus/plugin-google-gtag',
      {
        trackingID: 'G-7KJZMT5GD8',
        anonymizeIP: true,
      },
    ],
    [
      '@docusaurus/plugin-pwa',
      {
        debug: process.env.NODE_ENV === 'development',
        offlineModeActivationStrategies: ['appInstalled', 'standalone', 'queryString'],
        pwaHead: [
          {tagName: 'link', rel: 'icon', href: '/img/retsnom-logo.PNG'},
          {tagName: 'link', rel: 'manifest', href: '/manifest.json'},
          {tagName: 'meta', name: 'theme-color', content: 'rgb(37, 194, 160)'},
          {tagName: 'meta', name: 'mobile-web-app-capable', content: 'yes'},
          {tagName: 'meta', name: 'apple-mobile-web-app-capable', content: 'yes'},
          {tagName: 'meta', name: 'apple-mobile-web-app-status-bar-style', content: '#000'},
          {tagName: 'link', rel: 'apple-touch-icon', sizes: '180x180', href: '/img/retsnom-logo.PNG'},
          {tagName: 'link', rel: 'mask-icon', href: '/img/retsnom-logo.PNG', color: 'rgb(37, 194, 160)'},
          {tagName: 'meta', name: 'msapplication-TileImage', content: '/img/retsnom-logo.PNG'},
          {tagName: 'meta', name: 'msapplication-TileColor', content: '#000'},
        ],
      },
    ],
  ],

  headTags: [
    {tagName: 'link', attributes: {rel: 'preload', href: '/img/astronaut-animate.svg', as: 'image'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://KOYF7XQ73V-dsn.algolia.net', crossorigin: 'anonymous'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://www.googletagmanager.com'}},
    {tagName: 'link', attributes: {rel: 'dns-prefetch', href: 'https://giscus.app'}},
  ],

  scripts: [],

  themeConfig: {
    metadata: [
      {name: 'keywords', content: '前端開發, React, JavaScript, CSS, TypeScript, 程式學習, 技術筆記, Aria, Retsnom'},
      {name: 'twitter:card', content: 'summary_large_image'},
      {name: 'twitter:site', content: '@Retsnom'},
      {property: 'og:type', content: 'website'},
      {property: 'og:locale', content: 'zh_TW'},
      {property: 'og:site_name', content: 'Retsnom | 前端學習筆記'},
      {property: 'og:image', content: 'https://ariadocusauruswed.netlify.app/img/docusaurus-social-card.jpg'},
      {property: 'og:image:width', content: '1200'},
      {property: 'og:image:height', content: '630'},
      {name: 'author', content: 'Aria'},
      {name: 'algolia-site-verification', content: '8F1F53B72A9A2D51'},
    ],
    algolia: {
      appId: 'KOYF7XQ73V',
      apiKey: 'd3374679dcf92f236a4e93f8277d4a56',
      indexName: 'ariadocusauruswed_netlify_app_pages',
      contextualSearch: false,
      debug: false,
    },
    image: 'img/docusaurus-social-card.jpg',
    navbar: {
      logo: {alt: 'Retsnom Logo', src: 'img/retsnom-logo.webp'},
      items: [
        {to: '/docs/intro', position: 'left', label: 'Note'},
        {to: '/blog/intro', label: 'Blog', position: 'left'},
        {to: '/projects', label: 'Projects', position: 'left'},
        {to: '/reading', label: 'Reading', position: 'left'},
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Note', to: '/docs/intro'},
            {label: 'Blog', to: '/blog/intro'},
            {label: 'Projects', to: '/projects'},
            {label: 'Reading', to: '/reading'},
            {label: 'Private Blog', to: '/private-blog', className: 'footer-hidden-link'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'LinkedIn', href: 'https://www.linkedin.com/in/chan-yuting-b80218366/'},
            {label: 'GitHub', href: 'https://github.com/Retsomm'},
          ],
        },
        {title: 'More', items: [{label: 'Docusaurus GitHub', href: 'https://github.com/facebook/docusaurus'}]},
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Retsnom, Inc. Built with Docusaurus.`,
    },
    prism: {theme: prismThemes.github, darkTheme: prismThemes.dracula, additionalLanguages: ['sass']},
  },
};

export default config;
