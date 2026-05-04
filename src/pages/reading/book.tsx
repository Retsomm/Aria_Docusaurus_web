import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import Layout from '@theme/Layout';
import styles from '@/pages/reading.module.css';

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
const BOOK_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function getCachedBook(id: string): { book: NotionBook; blocks: any[] } | null {
  try {
    const raw = localStorage.getItem(`notion_book_v1_${id}`);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) return null;
    return data as { book: NotionBook; blocks: any[] };
  } catch {
    return null;
  }
}

function setCachedBook(id: string, book: NotionBook, blocks: any[]): void {
  try {
    localStorage.setItem(
      `notion_book_v1_${id}`,
      JSON.stringify({ data: { book, blocks }, expiresAt: Date.now() + BOOK_CACHE_TTL }),
    );
  } catch {}
}

function richTextToString(richTextArray: any[] | undefined) {
  if (!richTextArray || !Array.isArray(richTextArray)) return '';
  return richTextArray.map((r) => r.plain_text || '').join('');
}

function richTextToReact(richTextArray: any[] | undefined): React.ReactNode {
  if (!richTextArray || !Array.isArray(richTextArray)) return null;
  return richTextArray.map((r, i) => {
    const text = r.plain_text || '';
    const a = r.annotations || {};
    let inner: React.ReactNode = text;
    if (a.code) inner = <code>{inner}</code>;
    if (a.bold) inner = <strong>{inner}</strong>;
    if (a.italic) inner = <em>{inner}</em>;
    if (a.strikethrough) inner = <s>{inner}</s>;
    if (a.underline) inner = <u>{inner}</u>;
    if (r.href) inner = <a href={r.href} target="_blank" rel="noreferrer">{inner}</a>;
    return <React.Fragment key={i}>{inner}</React.Fragment>;
  });
}

function slugify(s: string) {
  return s
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\p{L}\p{N}-]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function renderBlock(block: any, idx: number) {
  const type = block.type;
  switch (type) {
    case 'paragraph':
      return <p key={block.id || idx}>{richTextToReact(block.paragraph.rich_text)}</p>;
    case 'heading_1': {
      const txt = richTextToString(block.heading_1.rich_text);
      const id = `${slugify(txt)}-${(block.id || '').slice(0, 8)}`;
      return <h1 key={block.id || idx} id={id}>{richTextToReact(block.heading_1.rich_text)}</h1>;
    }
    case 'heading_2': {
      const txt = richTextToString(block.heading_2.rich_text);
      const id = `${slugify(txt)}-${(block.id || '').slice(0, 8)}`;
      return <h2 key={block.id || idx} id={id}>{richTextToReact(block.heading_2.rich_text)}</h2>;
    }
    case 'heading_3': {
      const txt = richTextToString(block.heading_3.rich_text);
      const id = `${slugify(txt)}-${(block.id || '').slice(0, 8)}`;
      return <h3 key={block.id || idx} id={id}>{richTextToReact(block.heading_3.rich_text)}</h3>;
    }
    case 'quote':
      return (
        <blockquote key={block.id || idx} className={styles.notionQuote}>
          {richTextToReact(block.quote.rich_text)}
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
          <div>{richTextToReact(block.callout.rich_text)}</div>
        </div>
      );
    }
    case 'to_do':
      return (
        <label key={block.id || idx} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <input type="checkbox" checked={!!block.to_do.checked} readOnly />
          <span>{richTextToReact(block.to_do.rich_text)}</span>
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
    default: {
      const txt = richTextToString(block[type]?.rich_text || block.paragraph?.rich_text);
      if (txt) return <p key={block.id || idx}>{txt}</p>;
      return null;
    }
  }
}

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
      i--;
      out.push(
        React.createElement(
          listType,
          { key: `list-${i}` },
          items.map((it: any) => (
            <li key={it.id}>
              {richTextToReact(it[it.type].rich_text)}
              {it.children && it.children.length > 0 && renderBlocks(it.children)}
            </li>
          )),
        ),
      );
      continue;
    }
    const rendered = renderBlock(b, i);
    if (rendered) out.push(rendered);
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
      if (b.children && Array.isArray(b.children) && b.children.length > 0) walk(b.children);
    }
  }
  walk(blocks || []);
  return out;
}

export default function BookDetail(): React.ReactElement {
  const LayoutAny = Layout as any;
  const [book, setBook] = useState<NotionBook | null>(null);
  const [blocks, setBlocks] = useState<any[]>([]);
  const [headings, setHeadings] = useState<{ id: string; text: string; level: number }[]>([]);
  const [tocOpen, setTocOpen] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
      setError('找不到書籍 ID');
      setLoading(false);
      return;
    }

    async function fetchBook(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const res = await fetch(NETLIFY_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.message || `API 錯誤: ${res.status}`);
        }
        const data = await res.json();
        const found: NotionBook | null = data.book || (data.books && data.books[0]) || null;
        const fetchedBlocks: any[] = data.blocks || [];
        if (!found) throw new Error('未找到該書籍');
        setBook(found);
        setBlocks(fetchedBlocks);
        setCachedBook(id, found, fetchedBlocks);
        setError(null);
      } catch (err) {
        if (!isBackground) {
          console.error('Error fetching book detail:', err);
          setError((err as Error).message || '載入失敗');
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    }

    const cached = getCachedBook(id);
    if (cached) {
      setBook(cached.book);
      setBlocks(cached.blocks);
      setLoading(false);
      fetchBook(true);
    } else {
      fetchBook(false);
    }
  }, []);

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 100);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setHeadings(extractHeadings(blocks || []));
  }, [blocks]);

  // Floating buttons rendered via portal to escape any transform-containing parent
  const floatingButtons = isMounted && book ? ReactDOM.createPortal(
    <>
      <button
        className={`${styles.backToTop} ${showBackToTop ? '' : styles.backToTopHidden}`}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        aria-label="返回頂部"
      >
        ↑
      </button>

      {headings && headings.length > 0 && (
        <>
          {!tocOpen && (
            <button
              className={styles.tocToggle}
              aria-expanded={false}
              aria-label="開啟章節目錄"
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
    </>,
    document.body,
  ) : null;

  return (
    <LayoutAny title={book ? book.title : '讀書 — 詳細'} description="書籍詳情">
      <main>
        {loading ? (
          <div className={styles.bookDetailLoading}>
            <div className={styles.spinner} />
          </div>
        ) : error ? (
          <div className={styles.errorWrap}>
            <h2>載入失敗</h2>
            <p>{error}</p>
          </div>
        ) : book ? (
          <div className={styles.bookDetailWrap}>
            <div className={styles.bookLayout}>
              {book.cover && (
                <div style={{ width: 220, flexShrink: 0, overflow: 'hidden', borderRadius: 8 }}>
                  <img src={book.cover} alt={book.title} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                </div>
              )}

              <div style={{ flex: 1 }}>
                <h1 style={{ marginTop: 0 }}>{book.title}</h1>

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
                      <a href={book.url} target="_blank" rel="noreferrer" className={styles.link}>{book.url}</a>
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
          </div>
        ) : null}
      </main>

      {floatingButtons}
    </LayoutAny>
  );
}
