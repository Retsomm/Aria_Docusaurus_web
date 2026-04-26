import React, {type ReactNode, useState} from 'react';
import {
  PageMetadata,
  HtmlClassNameProvider,
  ThemeClassNames,
  translateTagsPageTitle,
} from '@docusaurus/theme-common';
import BlogLayout from '@theme/BlogLayout';
import type {Props} from '@theme/BlogTagsListPage';
import type {TagsListItem} from '@docusaurus/utils';
import SearchMetadata from '@theme/SearchMetadata';
import Link from '@docusaurus/Link';
import styles from './styles.module.css';

// ── Tag sizing helpers ──────────────────────────────────
type TagSize = 'xl' | 'lg' | 'md' | 'sm';
type TagTone = 'accent' | 'ink' | 'soft' | 'ghost';

function sizeFor(n: number): TagSize {
  if (n >= 12) return 'xl';
  if (n >= 7) return 'lg';
  if (n >= 3) return 'md';
  return 'sm';
}

function toneFor(n: number): TagTone {
  if (n >= 12) return 'accent';
  if (n >= 7) return 'ink';
  if (n >= 3) return 'soft';
  return 'ghost';
}

// ── Group definitions ───────────────────────────────────
const GROUP_MAP: Record<string, string> = {
  '生活': 'life', '心得': 'life', '寫作練習': 'life', '情緒抒發': 'life', '推薦': 'life',
  '筆記': 'tech', '前端': 'tech', '後端': 'tech', '開發': 'tech', '面試': 'tech', '學習': 'tech',
  '動畫': 'media', '電影': 'media', '影集': 'media', '閱讀': 'media',
  'Heptabase': 'tool', '超級個體': 'tool', '理財': 'tool',
};

type GroupKey = 'life' | 'tech' | 'media' | 'tool';

const GROUP_META: Record<GroupKey, {label: string; desc: string; color: string}> = {
  life:  {label: '生活', desc: '日常觀察、心情雜想、寫作練習與其他', color: '#CC785C'},
  tech:  {label: '技術', desc: '前端、後端、學習筆記', color: '#5C8C7A'},
  media: {label: '影音書', desc: '動畫、電影、影集、閱讀心得', color: '#A07AB8'},
  tool:  {label: '工具', desc: '日常使用的軟體與方法論', color: '#B89A5C'},
};

// ── Pill component ──────────────────────────────────────
function TagPill({
  tag,
  size = 'md',
  tone = 'soft',
}: {
  tag: TagsListItem;
  size?: TagSize;
  tone?: TagTone;
}) {
  const sizeClass: Record<TagSize, string> = {
    xl: styles.pillXl,
    lg: styles.pillLg,
    md: styles.pillMd,
    sm: styles.pillSm,
  };
  const toneClass: Record<TagTone, string> = {
    accent: styles.toneAccent,
    ink:    styles.toneInk,
    soft:   styles.toneSoft,
    ghost:  styles.toneGhost,
  };

  return (
    <Link
      to={tag.permalink}
      className={`${styles.tagPill} ${sizeClass[size]} ${toneClass[tone]}`}
    >
      {tag.label}
      <span className={styles.tagCount}>{tag.count}</span>
    </Link>
  );
}

// ── Cloud variant (Variant A) ────────────────────────────
function TagsCloud({tags}: {tags: TagsListItem[]}) {
  const total = tags.reduce((a, b) => a + b.count, 0);
  const sorted = [...tags].sort((a, b) => b.count - a.count);

  const groups = (Object.keys(GROUP_META) as GroupKey[]).map((key) => {
    const groupTags = sorted.filter((t) => (GROUP_MAP[t.label] ?? 'life') === key);
    return {key, ...GROUP_META[key], tags: groupTags};
  }).filter((g) => g.tags.length > 0);

  return (
    <div className={styles.page}>
      {/* ── Eyebrow ── */}
      <div className={styles.eyebrow}>Blog / Tags · 標籤地圖</div>

      {/* ── Hero ── */}
      <h1 className={styles.heroTitle}>
        按主題<br />
        <em className={styles.heroItalic}>探索</em> 我寫過的字。
      </h1>
      <p className={styles.heroSub}>
        一共 <strong>{tags.length}</strong> 個標籤、
        <strong> {total}</strong> 篇文章。
        字越大，代表寫得越多。
      </p>

      {/* ── Stats strip ── */}
      <div className={styles.statsStrip}>
        {[
          {v: tags.length, l: '個標籤'},
          {v: total, l: '篇文章'},
          {v: sorted[0]?.label ?? '—', l: `最大宗（${sorted[0]?.count ?? 0} 篇）`},
        ].map((s, i) => (
          <div key={i} className={styles.statCell}>
            <div className={styles.statValue}>{s.v}</div>
            <div className={styles.statLabel}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* ── Cloud ── */}
      <section className={styles.cloudSection}>
        <div className={styles.cloudLabel}>The Tag Cloud</div>
        <div className={styles.cloud}>
          {[...tags].sort(() => Math.random() - 0.49).map((t) => (
            <TagPill key={t.label} tag={t} size={sizeFor(t.count)} tone={toneFor(t.count)} />
          ))}
        </div>
      </section>

      {/* ── By theme ── */}
      <div className={styles.themeLabel}>By theme</div>
      <div className={styles.themeGrid}>
        {groups.map((g) => (
          <div key={g.key} className={styles.themeCard}>
            <div className={styles.themeCardBar} style={{background: g.color}} />
            <div className={styles.themeCardHead}>
              <h3 className={styles.themeCardTitle}>{g.label}</h3>
              <span className={styles.themeCardMeta}>{g.tags.length} tags · {g.tags.reduce((a,b)=>a+b.count,0)} posts</span>
            </div>
            <p className={styles.themeCardDesc}>{g.desc}</p>
            <div className={styles.themeCardTags}>
              {g.tags.map((t) => (
                <TagPill key={t.label} tag={t} size="sm" tone="ghost" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Index variant (Variant B) ────────────────────────────
function TagsIndex({tags}: {tags: TagsListItem[]}) {
  const sorted = [...tags].sort((a, b) => b.count - a.count);
  const top5 = sorted.slice(0, 5);

  // Group by first character
  const sectionMap = new Map<string, TagsListItem[]>();
  for (const tag of [...tags].sort((a, b) => a.label.localeCompare(b.label, 'zh-TW'))) {
    const key = tag.label.charAt(0).toUpperCase();
    if (!sectionMap.has(key)) sectionMap.set(key, []);
    sectionMap.get(key)!.push(tag);
  }
  const sections = Array.from(sectionMap.entries());
  const letters = sections.map(([k]) => k);

  return (
    <div className={styles.indexLayout}>
      {/* Letter rail */}
      <aside className={styles.letterRail}>
        <div className={styles.letterRailLabel}>Index</div>
        {letters.map((L, i) => (
          <a key={i} href={`#idx-${L}`} className={styles.letterBtn}>
            {L}
          </a>
        ))}
      </aside>

      {/* Main */}
      <main className={styles.indexMain}>
        <div className={styles.eyebrow}>Blog · Tags index</div>
        <h1 className={styles.indexTitle}>
          標籤<em className={styles.heroItalic}>索引</em>
        </h1>
        <p className={styles.indexSub}>
          沿著文章的標籤往下挖，通常還能找到三五篇相近的。
        </p>

        {sections.map(([letter, sectionTags], i) => (
          <section key={i} id={`idx-${letter}`} className={styles.section}>
            <div className={styles.sectionHead}>
              <span className={styles.sectionLetter}>{letter}</span>
              <span className={styles.sectionMeta}>{sectionTags.length} tag{sectionTags.length > 1 ? 's' : ''} · {sectionTags.reduce((a,b)=>a+b.count,0)} posts</span>
            </div>
            {sectionTags.map((t) => (
              <div key={t.label} className={styles.tagCard}>
                <div className={styles.tagCardHead}>
                  <TagPill tag={t} size="md" tone="accent" />
                  <Link to={t.permalink} className={styles.tagCardAll}>看全部 →</Link>
                </div>
                {t.description && (
                  <p className={styles.tagCardDesc}>{t.description}</p>
                )}
              </div>
            ))}
          </section>
        ))}
      </main>

      {/* Right rail — top 5 */}
      <aside className={styles.rightRail}>
        <div className={styles.top5Card}>
          <div className={styles.top5Label}>熱門 Top 5</div>
          {top5.map((t, i) => (
            <Link key={t.label} to={t.permalink} className={styles.top5Item}>
              <span className={styles.top5Row}>
                <span className={styles.top5Num}>{String(i + 1).padStart(2, '0')}</span>
                <span className={styles.top5Name}>{t.label}</span>
              </span>
              <span className={styles.top5Count}>{t.count}</span>
            </Link>
          ))}
        </div>
      </aside>
    </div>
  );
}

// ── Tab toggle ──────────────────────────────────────────
type Variant = 'cloud' | 'index';

export default function BlogTagsListPage({tags, sidebar}: Props): ReactNode {
  const title = translateTagsPageTitle();
  const [variant, setVariant] = useState<Variant>('cloud');

  return (
    <HtmlClassNameProvider
      className={`${ThemeClassNames.wrapper.blogPages} ${ThemeClassNames.page.blogTagsListPage}`}>
      <PageMetadata title={title} />
      <SearchMetadata tag="blog_tags_list" />
      <BlogLayout sidebar={sidebar}>
        {/* Variant toggle */}
        <div className={styles.variantToggle}>
          <button
            className={`${styles.variantBtn} ${variant === 'cloud' ? styles.variantBtnActive : ''}`}
            onClick={() => setVariant('cloud')}
          >
            標籤雲
          </button>
          <button
            className={`${styles.variantBtn} ${variant === 'index' ? styles.variantBtnActive : ''}`}
            onClick={() => setVariant('index')}
          >
            字母索引
          </button>
        </div>

        {variant === 'cloud' ? (
          <TagsCloud tags={tags} />
        ) : (
          <TagsIndex tags={tags} />
        )}
      </BlogLayout>
    </HtmlClassNameProvider>
  );
}
