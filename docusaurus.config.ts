import type {Config} from '@docusaurus/types';
import {themes as prismThemes} from 'prism-react-renderer';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';

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
    // Webpack alias: @ → src/
    function webpackAliasPlugin() {
      return {
        name: 'webpack-alias',
        configureWebpack() {
          return {
            resolve: {
              alias: {
                '@': path.resolve(__dirname, 'src'),
              },
            },
          };
        },
      };
    },
    // Local plugin: expose latest blog and docs entries via usePluginData('recent-posts')
    function recentPostsPlugin() {
      const parseDateToTime = (value: string | undefined): number | null => {
        if (!value) return null;
        const normalized = String(value).trim();
        if (!normalized) return null;

        const directDate = new Date(normalized);
        if (!Number.isNaN(directDate.getTime())) {
          return directDate.getTime();
        }

        const compactMatch = normalized.match(/^(\d{4})[-/](\d{1,2})(?:[-/](\d{1,2}))?/);
        if (compactMatch) {
          const [, year, month, day] = compactMatch;
          const fallback = new Date(`${year}-${month.padStart(2, '0')}-${(day || '01').padStart(2, '0')}T00:00:00`);
          if (!Number.isNaN(fallback.getTime())) {
            return fallback.getTime();
          }
        }

        return null;
      };

      const readMarkdownItems = (baseDir: string, type: 'blog' | 'docs') => {
        const collectFiles = (dir: string): string[] => {
          const entries = fs.readdirSync(dir, {withFileTypes: true});
          const files: string[] = [];
          entries.forEach((entry) => {
            const fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              files.push(...collectFiles(fullPath));
            } else if (entry.isFile() && /\.mdx?$/.test(entry.name)) {
              files.push(fullPath);
            }
          });
          return files;
        };

        return collectFiles(baseDir)
          .filter((filePath) => {
            const fileName = path.basename(filePath);
            return fileName !== 'tags.yml' && fileName !== 'intro.md' && fileName !== 'intro.mdx';
          })
          .map((filePath) => {
            const raw = fs.readFileSync(filePath, 'utf-8');
            const {data, content} = matter(raw);
            const relativePath = path.relative(baseDir, filePath).replace(/\\/g, '/');
            const slugFromPath = relativePath.replace(/\.mdx?$/, '');
            const slug = String(data.slug || slugFromPath);
            const tag = Array.isArray(data.tags) ? String(data.tags[0] || '') : '';
            const stats = fs.statSync(filePath);
            const dateValue = String(data.date || data.updated || data.modified || '');
            const sortTime = parseDateToTime(dateValue) ?? stats.mtime.getTime();
            const headingMatch = content.match(/^#\s+(.+)$/m);
            const title = String(data.title || headingMatch?.[1] || path.basename(filePath, path.extname(filePath)));
            const permalink = type === 'blog'
              ? `/blog/${slug}`
              : slug.startsWith('/')
                ? `/docs${slug}`
                : `/docs/${slug}`;

            return {
              title,
              description: String(data.description || ''),
              date: new Date(sortTime).toISOString(),
              sortTime,
              slug,
              permalink,
              tag,
            };
          })
          .filter((item) => item.title && Number.isFinite(item.sortTime))
          .sort((a, b) => b.sortTime - a.sortTime)
          .slice(0, 5);
      };

      return {
        name: 'recent-posts',
        async loadContent() {
          const blogDir = path.join(__dirname, 'blog');
          const docsDir = path.join(__dirname, 'docs');
          return {
            blog: readMarkdownItems(blogDir, 'blog'),
            docs: readMarkdownItems(docsDir, 'docs'),
          };
        },
        async contentLoaded({ content, actions }) {
          actions.setGlobalData(content);
        },
      };
    },
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

  stylesheets: [
    {
      href: 'https://fonts.googleapis.com/css2?family=Newsreader:ital,opsz,wght@0,6..72,400;0,6..72,500;0,6..72,600;1,6..72,400;1,6..72,500&family=Inter+Tight:wght@400;500;600;700&family=Noto+Serif+TC:wght@400;500;600;700&family=Noto+Sans+TC:wght@400;500;600;700&display=swap',
      type: 'text/css',
    },
  ],

  headTags: [
    {tagName: 'link', attributes: {rel: 'preload', href: '/img/astronaut-animate.svg', as: 'image'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.googleapis.com'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: 'anonymous'}},
    {tagName: 'link', attributes: {rel: 'preconnect', href: 'https://KOYF7XQ73V-dsn.algolia.net', crossorigin: 'anonymous'}},
  ],

  clientModules: ['./src/clientModules/analytics.ts', './src/clientModules/webmcp.ts'],

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
        {to: '/about', label: 'About', position: 'right'},
      ],
    },
    footer: {
      style: 'light',
      links: [
        {
          title: 'Docs',
          items: [
            {label: 'Note', to: '/docs/intro'},
            {label: 'Blog', to: '/blog/intro'},
            {label: 'Projects', to: '/projects'},
            {label: 'Reading', to: '/reading'},
            {label: 'About', to: '/about'},
          ],
        },
        {
          title: 'Community',
          items: [
            {label: 'LinkedIn', href: 'https://www.linkedin.com/in/chan-yuting-b80218366/'},
            {label: 'GitHub', href: 'https://github.com/Retsomm'},
            {label: 'Threads', href: 'https://www.threads.com/@aria____1214'},
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
