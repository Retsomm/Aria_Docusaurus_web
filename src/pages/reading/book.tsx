import React, { useEffect, useState } from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import styles from '../reading.module.css';

// 與列表頁相同的型別
type NotionBook = {
  id: string;
  title: string;
  author?: string;
  status?: string;
  rating?: number;
  notes?: string;
  cover?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  summary?: string | null;
  dateFinished?: string | null;
  category?: string[] | null;
  publisher?: string | null;
  url?: string | null;
  preference?: string | number | null;
};

const NETLIFY_FUNCTION_URL = '/.netlify/functions/notion-books';

// helper: 把 Notion rich_text array 轉成純文字
function richTextToString(richTextArray: any[] | undefined) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map((r) => r.plain_text || '').join('');
}

// slugify（用於 heading id）
function slugify(s: string) {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    // 保留 Unicode 文字（包含中文）與數字、連字號
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// render 單一 block
function renderBlock(block: any, idx: number) {
  const type = block.type;

  switch (type) {
    case 'paragraph':
      return <p key={block.id || idx}>{richTextToString(block.paragraph.rich_text)}</p>;
    case 'heading_1': {
      const txt = richTextToString(block.heading_1.rich_text);
      const id = `${slugify(txt)}-${(block.id || '').slice(0, 8)}`;
      return <h1 key={block.id || idx} id={id}>{txt}</h1>;
    }
    case 'heading_2': {
      const txt = richTextToString(block.heading_2.rich_text);
      const id = `${slugify(txt)}-${(block.id || '').slice(0, 8)}`;
      return <h2 key={block.id || idx} id={id}>{txt}</h2>;
    }
    case 'heading_3': {
      const txt = richTextToString(block.heading_3.rich_text);
      const id = `${slugify(txt)}-${(block.id || '').slice(0, 8)}`;
      return <h3 key={block.id || idx} id={id}>{txt}</h3>;
    }
    case 'quote':
      return (
        <blockquote key={block.id || idx} className={styles.notionQuote}>
          {richTextToString(block.quote.rich_text)}
        </blockquote>
      );
    case 'code':
      return (
        <pre key={block.id || idx} className={styles.notionCode}>
          <code>{richTextToString(block.code.rich_text)}</code>
        </pre>
      );
    case 'image': {
      const src = block.image?.file?.url || block.image?.external?.url || '';
      const caption = richTextToString(block.image?.caption || []);
      return (
        <figure key={block.id || idx} style={{ margin: '1rem 0' }}>
          <img src={src} alt={caption || 'image'} style={{ maxWidth: '100%', borderRadius: 8 }} />
          {caption && <figcaption style={{ fontSize: 13, color: 'var(--ifm-color-emphasis-600)' }}>{caption}</figcaption>}
        </figure>
      );
    }
    case 'callout': {
      const icon = block.callout?.icon?.emoji || '';
      return (
        <div key={block.id || idx} className={styles.notionCallout}>
          <span style={{ marginRight: 8 }}>{icon}</span>
          <div>{richTextToString(block.callout.rich_text)}</div>
        </div>
      );
    }
    case 'to_do':
      return (
        <label key={block.id || idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={!!block.to_do.checked} readOnly />
          <span>{richTextToString(block.to_do.rich_text)}</span>
        </label>
      );
    case 'divider':
      return <hr key={block.id || idx} />;
    case 'embed':
      return (
        <a key={block.id || idx} href={block.embed?.url} target="_blank" rel="noreferrer">
          {block.embed?.url}
        </a>
      );
    default:
      // fallback: 如果是 list item 之類的，外層會處理；其他未知 type 則顯示純文字（保守處理）
      const txt = richTextToString(block[type]?.rich_text || block.paragraph?.rich_text);
      if (txt) return <p key={block.id || idx}>{txt}</p>;
      return null;
  }
}

// render blocks 並把相鄰的 list item 合併成 <ul> 或 <ol>
function renderBlocks(blocks: any[]): React.ReactNode[] {
  const out: React.ReactNode[] = [];

  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];

    if (b.type === 'bulleted_list_item' || b.type === 'numbered_list_item') {
      const listType = b.type === 'bulleted_list_item' ? 'ul' : 'ol';
      const items: any[] = [];

      while (i < blocks.length && blocks[i].type === b.type) {
        items.push(blocks[i]);
        i++;
      }
      i--; // compensates the outer for-loop's i++

      out.push(
        React.createElement(
          listType,
          { key: `list-${i}` },
          items.map((it: any) => <li key={it.id}>{richTextToString(it[it.type].rich_text)}</li>),
        ),
      );
      continue;
    }

    const rendered = renderBlock(b, i);
    if (rendered) out.push(rendered);

    // 如果該 block 帶有 children（server 已抓回來），遞迴渲染子節點
    if (b.children && Array.isArray(b.children) && b.children.length > 0) {
      out.push(
        <div key={`${b.id || i}-children`} className={styles.notionChildren}>
          {renderBlocks(b.children)}
        </div>,
      );
    }
  }

  return out;
}

// 取出 headings（供右側 TOC 使用）
function extractHeadings(blocks: any[]) {
  const out: { id: string; text: string; level: number }[] = [];

  function walk(bs: any[]) {
    for (const b of bs || []) {
      if (!b) continue;
      if (/^heading_\d$/.test(b.type)) {
        const txt = richTextToString(b[b.type].rich_text || []);
        if (txt && txt.trim().length > 0) {
          out.push({ id: `${slugify(txt)}-${(b.id || '').slice(0, 8)}`, text: txt, level: Number((b.type || '').split('_')[1]) || 1 });
        }
      }

      if (b.children && Array.isArray(b.children) && b.children.length > 0) {
        walk(b.children);
      }
    }
  }

  walk(blocks || []);
  return out;
}

export default function BookDetail(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const LayoutAny = Layout as any;
  const [book, setBook] = useState<NotionBook | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('找不到書籍 ID');
      setLoading(false);
      return;
    }

    async function fetchBook() {
      try {
        setLoading(true);
        const res = await fetch(NETLIFY_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `API 錯誤: ${res.status}`);
        }

        const data = await res.json();
        const found: NotionBook | null = data.book || (data.books && data.books[0]) || null;
        const fetchedBlocks: any[] = data.blocks || [];

        if (!found) {
          throw new Error('未找到該書籍');
        }

        setBook(found);
        setBlocks(fetchedBlocks);
        setError(null);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('Error fetching book detail:', err);
        setError((err as Error).message || '載入失敗');
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, []);

  // 顯示返回頂部按鈕：滾動超過 100px 時顯示
  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 當 blocks 更新時，抽取 headings
  useEffect(() => {
    setHeadings(extractHeadings(blocks || []));
  }, [blocks]);

  return (
    <LayoutAny title={book ? book.title : '讀書 — 詳細'} description={`書籍詳情`}>
      <main>
        <div className={styles.container} style={{ padding: '2.5rem 1rem', textAlign: 'left' }}>
          {loading ? (
            <div className={styles.loading} style={{ paddingTop: 40 }}>
              <p>載入中...</p>
            </div>
          ) : error ? (
            <div className={styles.error} style={{ paddingTop: 40 }}>
              <h2>載入失敗</h2>
              <p>{error}</p>
            </div>
          ) : book ? (
            <div style={{ maxWidth: 900, margin: '2rem auto' }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                {book.cover && (
                  <div style={{ width: 220, borderRadius: 8, overflow: 'hidden' }}>
                    <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}

                <div style={{ flex: 1 }}>
                  <h1 style={{ marginTop: 0 }}>{book.title}</h1>

                  {/* 各欄位各自一行顯示 */}
                  <div className={styles.bookMeta} style={{ marginTop: 8 }}>
                    {book.author && (
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>作者：</span>
                        <span className={styles.metaValue}>{book.author}</span>
                      </div>
                    )}

                    {book.publisher && (
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>出版社：</span>
                        <span className={styles.metaValue}>{book.publisher}</span>
                      </div>
                    )}

                    {book.category && book.category.length > 0 && (
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>分類：</span>
                        <span className={styles.metaValue}>
                          {book.category.map((c, i) => (
                            <span key={i} className={styles.metaPlainTag} style={{ marginRight: 6 }}>{c}</span>
                          ))}
                        </span>
                      </div>
                    )}

                    {book.url && (
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>來源：</span>
                        <span className={styles.metaValue}>
                          <a href={book.url} target="_blank" rel="noreferrer" className={styles.link}>{book.url}</a>
                        </span>
                      </div>
                    )}

                    {book.preference != null && (
                      <div className={styles.metaRow}>
                        <span className={styles.metaLabel}>偏愛程度：</span>
                        <span className={styles.metaValue}>
                          {typeof book.preference === 'number' || !isNaN(Number(book.preference)) ? (
                            <span className={styles.rating}>{'⭐'.repeat(Math.max(0, Math.min(5, Math.round(Number(book.preference)))))}</span>
                          ) : (
                            <span className={styles.metaPlainTag}>{String(book.preference)}</span>
                          )}
                        </span>
                      </div>
                    )}

                    {/* 狀態 / 評分（保留單行顯示） */}
                    <div className={styles.metaRow}>
                      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                        {book.status && <span className={styles.badge}>{book.status}</span>}
                        {book.rating && <span className={styles.rating}>{'⭐'.repeat(book.rating)}</span>}
                      </div>
                    </div>

                    {(book.startDate || book.endDate) && (
                      <div className={styles.metaRow}>
                        {book.startDate && <div>開始：{book.startDate}</div>}
                        {book.endDate && <div>完成：{book.endDate}</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {book.notes && (
                <div style={{ marginTop: 24 }} className={styles.notes}>
                  <h3>筆記</h3>
                  <p>{book.notes}</p>
                </div>
              )}

              {/* Notion page blocks (如果有) */}
              {headings && headings.length > 0 && (
                <div className={styles.inlineToc}>
                  <strong>章節目錄</strong>
                  <div className={styles.inlineTocList}>
                    {headings.map((h) => (
                      <a key={h.id} href={`#${h.id}`} className={styles.inlineTocItem}>{h.text}</a>
                    ))}
                  </div>
                </div>
              )}

              {blocks && blocks.length > 0 && (
                <div className={styles.notionContent} style={{ marginTop: 24 }}>
                  {renderBlocks(blocks)}
                </div>
              )}

              {/* 返回頂部按鈕 */}
              <button
                className={`${styles.backToTop} ${showBackToTop ? '' : styles.backToTopHidden}`}
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                aria-label="返回頂部"
              >
                ↑
              </button>

              {/* 可收合浮動 TOC（右側） */}
              {headings && headings.length > 0 && (
                <>
                  {/* TOC toggle 隱藏行為：只在 panel 關閉時顯示按鈕；點擊 panel 的 X 或章節後會重新顯示 */}
                  {!tocOpen && (
                    <button
                      className={styles.tocToggle}
                      aria-expanded={tocOpen}
                      aria-label={tocOpen ? '關閉章節目錄' : '開啟章節目錄'}
                      onClick={() => setTocOpen(true)}
                    >
                      目錄
                    </button>
                  )}

                  <aside
                    className={`${styles.tocPanel} ${tocOpen ? styles.tocPanelOpen : styles.tocPanelHidden}`}
                    role="navigation"
                    aria-label="章節導覽"
                  >
                    <div className={styles.tocPanelHeader}>
                      <strong>章節目錄</strong>
                      <button
                        className={styles.tocPanelClose}
                        onClick={() => setTocOpen(false)}
                        aria-label="關閉目錄"
                      >
                        ✕
                      </button>
                    </div>

                    <div className={styles.tocPanelList}>
                      {headings.map((h) => (
                        <button
                          key={h.id}
                          className={styles.tocPanelItem}
                          onClick={() => {
                            const el = document.getElementById(h.id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                            // 在小螢幕操作時自動收合並讓 TOC toggle 重新顯示
                            setTocOpen(false);
                          }}
                        >
                          <span className={styles.tocDot} />
                          <span className={styles.tocLabel}>{h.text}</span>
                        </button>
                      ))}
                    </div>
                  </aside>
                </>
              )}
            </div>
          ) : null}
        </div>
      </main>
    </LayoutAny>
  );
}
