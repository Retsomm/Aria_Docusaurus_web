import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import { usePluginData } from '@docusaurus/useGlobalData';
import styles from './index.module.css';

const FEATURES = [
  {
    kind: 'Note',
    href: '/docs',
    title: '把學程式的筆記整理在這',
    desc: 'React、TypeScript、CSS、瀏覽器原理、面試題庫——每一個踩過的坑都寫成可以重讀的長記憶。',
    count: '120+ 篇筆記',
    accent: '#CC785C',
    textAccent: '#8B4A2F',
  },
  {
    kind: 'Blog',
    href: '/blog',
    title: '記錄正在發生的生活',
    desc: '一週寫一到兩篇——讀書心得、工作雜想、感情、關於成為自己的種種猶豫。',
    count: '110+ 篇文章',
    accent: '#7A8C5C',
    textAccent: '#4A5C2A',
  },
  {
    kind: 'Projects',
    href: '/projects',
    title: '寫過、做過、上線過的東西',
    desc: '習慣追蹤、無障礙地圖、電子書閱讀器、番茄鐘⋯⋯一些用來練習與解決自己問題的小作品。',
    count: '14 個作品',
    accent: '#5C7A8C',
    textAccent: '#2A4A5C',
  },
  {
    kind: 'Reading',
    href: '/reading',
    title: '書單與閱讀筆記',
    desc: '讀完的書、正在讀的書、想讀的書——每一本都附上心得與重點摘錄，慢慢累積的閱讀軌跡。',
    count: '書單持續更新中',
    accent: '#8C5C7A',
    textAccent: '#5C2A4A',
  },
];


function Pill({ children }: { children: React.ReactNode }) {
  return <span className={styles.pill}>{children}</span>;
}

type RecentPost = { title: string; date: string; slug: string; permalink: string; tag: string };

function formatPostDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  return `${String(d.getUTCMonth() + 1).padStart(2, '0')} · ${String(d.getUTCDate()).padStart(2, '0')}`;
}

export default function Home(): React.ReactElement {
  const LayoutAny = Layout as any;
  const recentPostsData = usePluginData('recent-posts') as { blog?: RecentPost[] } | undefined;
  const recentPosts = recentPostsData?.blog || [];
  return (
    <LayoutAny description="Aria 的前端學習筆記與生活記錄。這裡有 React、JavaScript、CSS、TypeScript 等技術文章，也有讀書心得與生活感悟。">
      <main>

      {/* ── Hero ── */}
      <section className={styles.heroSection}>
        <div className={styles.heroGrid}>
          <div className={styles.heroLeft}>
            <div className={styles.statusBadge}>
              <span className={styles.statusDot} />
              現在 · 待業 / 自學 / 寫鐵人賽中
            </div>
            <h1 className={styles.heroTitle}>
              Hi, 我是 <em className={styles.heroEm}>Aria</em>。<br />
              一個活在自己時區裡的
              學習者。
            </h1>
            <p className={styles.heroDesc}>
              這裡是我的個人網站——程式學習筆記、技術分享、讀書心得，以及還在發生中的生活。
            </p>
            <div className={styles.heroCtas}>
              <Link to="/docs/intro" className={styles.ctaPrimary}>
                開始閱讀
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 5l7 7-7 7" /></svg>
              </Link>
              <Link to="/about" className={styles.ctaSecondary}>關於我</Link>
            </div>
          </div>

          {/* Astronaut — free-standing, no box */}
          <div className={styles.heroImageWrap}>
            <img
              src="/img/astronaut-animate.svg"
              alt="太空人插畫"
              className={styles.heroAstronaut}
              fetchPriority="high"
              width="480"
              height="480"
            />
          </div>
        </div>
      </section>

      {/* ── Three feature cards ── */}
      <section className={styles.featuresSection}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionEyebrow}>Sections</div>
          <h2 className={styles.sectionTitle}>四個你可以走進去的房間</h2>
        </div>
        <div className={styles.featuresGrid}>
          {FEATURES.map((f, i) => (
            <Link key={f.kind} to={f.href} className={styles.featureCard}>
              <div className={styles.featureAccentBar} style={{ background: f.accent }} />
              <div className={styles.featureCardTop}>
                <span className={styles.featureKind} style={{ color: f.textAccent }}>0{i + 1} · {f.kind}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2">
                  <path d="M7 17 17 7M9 7h8v8" />
                </svg>
              </div>
              <h3 className={styles.featureCardTitle}>{f.title}</h3>
              <p className={styles.featureCardDesc}>{f.desc}</p>
              <div className={styles.featureCardCount}>{f.count}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Recent writing (full width) ── */}
      <section className={styles.recentSection}>
        <div className={styles.recentHeader}>
          <h2 className={styles.recentTitle}>最近寫的</h2>
          <Link to="/blog" className={styles.recentMore}>所有文章 →</Link>
        </div>
        <div className={styles.recentList}>
          {(recentPosts || []).map((p) => (
            <Link key={p.slug} to={p.permalink} className={styles.recentItem}>
              <span className={styles.recentDate}>{formatPostDate(p.date)}</span>
              <Pill>{p.tag || '文章'}</Pill>
              <span className={styles.recentItemTitle}>{p.title}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-4)" strokeWidth="2">
                <path d="M5 12h14M13 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <div>
            <h2 className={styles.ctaTitle}>
              不想<em className={styles.heroEm}>錯過</em>新文章？
            </h2>
            <p className={styles.ctaDesc}>
              透過 RSS 訂閱，每當我發新文章你就會收到通知。支援所有 RSS 閱讀器（Feedly、Inoreader、NetNewsWire⋯⋯）。
            </p>
          </div>
          <div className={styles.ctaButtons}>
            <a href="/blog/rss.xml" target="_blank" rel="noreferrer" className={styles.ctaPrimary}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.18 15.64a2.18 2.18 0 0 1 2.18 2.18C8.36 19.01 7.38 20 6.18 20C4.98 20 4 19.01 4 17.82a2.18 2.18 0 0 1 2.18-2.18M4 4.44A15.56 15.56 0 0 1 19.56 20h-2.83A12.73 12.73 0 0 0 4 7.27V4.44m0 5.66a9.9 9.9 0 0 1 9.9 9.9h-2.83A7.07 7.07 0 0 0 4 12.93V10.1z"/>
              </svg>
              RSS 訂閱
            </a>
            <a href="https://github.com/Retsomm/Aria_Docusaurus_web" className={styles.ctaSecondary} target="_blank" rel="noreferrer">GitHub</a>
          </div>
        </div>
      </section>

      </main>
    </LayoutAny>
  );
}
