import React, { useEffect, useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import styles from './reading.module.css';

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
  createdAt?: string | null;
  category?: string[] | null;
  publisher?: string | null;
  url?: string | null;
  preference?: string | number | null;
};

const NETLIFY_FUNCTION_URL = '/.netlify/functions/notion-books';
const BOOKS_CACHE_KEY = 'notion_books_list_v1';
const BOOKS_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

function getCachedBooks(): NotionBook[] | null {
  try {
    const raw = localStorage.getItem(BOOKS_CACHE_KEY);
    if (!raw) return null;
    const { data, expiresAt } = JSON.parse(raw);
    if (Date.now() > expiresAt) return null;
    return data as NotionBook[];
  } catch {
    return null;
  }
}

function setCachedBooks(books: NotionBook[]): void {
  try {
    localStorage.setItem(
      BOOKS_CACHE_KEY,
      JSON.stringify({ data: books, expiresAt: Date.now() + BOOKS_CACHE_TTL }),
    );
  } catch {}
}

function titleToHue(title: string): string {
  const PALETTES = [
    ['#2C5F4F', '#0F2A22'],
    ['#1F1E1C', '#3D3D3A'],
    ['#5C7A8C', '#2A4050'],
    ['#CC785C', '#8B4A2F'],
    ['#3D5A7A', '#1A2A40'],
    ['#7A5C3D', '#4A3A20'],
    ['#5C8C8C', '#3A5050'],
    ['#8C5C7A', '#5A3A50'],
    ['#7A8C5C', '#4A5A38'],
    ['#8C5C5C', '#5A3838'],
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = (hash * 31 + title.charCodeAt(i)) & 0xffffffff;
  const [a, b] = PALETTES[Math.abs(hash) % PALETTES.length];
  return `linear-gradient(135deg, ${a}, ${b})`;
}

function Pill({ children, tone = 'default' }: { children: React.ReactNode; tone?: 'default' | 'accent' | 'dark' }) {
  return (
    <span className={[styles.pill, styles[`pill_${tone}`]].join(' ')}>
      {children}
    </span>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {'★'.repeat(rating)}<span className={styles.starsEmpty}>{'★'.repeat(5 - rating)}</span>
    </span>
  );
}

function BookSpine({ title, cover, w = 56, h = 80 }: { title: string; cover?: string; w?: number; h?: number }) {
  if (cover) {
    return (
      <div className={styles.bookSpine} style={{ width: w, height: h }}>
        <img src={cover} alt={title} className={styles.bookSpineImg} />
      </div>
    );
  }
  const shortTitle = title.length > 8 ? title.slice(0, 8) + '⋯' : title;
  return (
    <div
      className={styles.bookSpine}
      style={{ width: w, height: h, background: titleToHue(title) }}
    >
      <span className={styles.bookSpineText} style={{ fontSize: w > 60 ? 11 : 9 }}>{shortTitle}</span>
    </div>
  );
}

function BookCard({ book, onTagClick }: { book: NotionBook; onTagClick?: (tag: string) => void }) {
  const isReading = book.status === '閱讀中';
  const isWant = book.status === '想讀';
  const tone = isReading ? 'accent' : isWant ? 'default' : 'dark';

  return (
    <Link to={`/reading/book?id=${encodeURIComponent(book.id)}`} className={styles.cardLink} aria-label={`查看 ${book.title} 詳細`}>
      <article className={styles.card}>
        <BookSpine title={book.title} cover={book.cover} w={84} h={120} />
        <div className={styles.cardInfo}>
          <div className={styles.cardTop}>
            <h3 className={styles.cardTitle}>{book.title}</h3>
            {book.status && <Pill tone={tone}>{book.status}</Pill>}
          </div>
          <div className={styles.cardAuthLine}>
            {book.author && <span className={styles.cardAuthor}>{book.author}</span>}
            {book.publisher && (
              <>
                <span className={styles.cardDot}>·</span>
                <span>{book.publisher}</span>
              </>
            )}
          </div>
          <div className={styles.cardMeta}>
            {book.rating ? <Stars rating={book.rating} /> : null}
            {book.category && book.category.length > 0 && (
              <span className={styles.cardCat}>· {book.category[0]}</span>
            )}
          </div>
          {book.tags && book.tags.length > 0 && (
            <div className={styles.cardTags}>
              {book.tags.map((tag, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={styles.cardTagBtn}
                  onClick={e => { e.stopPropagation(); e.preventDefault(); onTagClick?.(tag); }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); onTagClick?.(tag); } }}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          {(book.startDate || book.endDate) && (
            <div className={styles.cardDates}>
              {book.startDate && <span>開始 {book.startDate}</span>}
              {book.endDate && <span>· 完成 {book.endDate}</span>}
              {!book.startDate && <span className={styles.cardDatesItalic}>排隊中</span>}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}

export default function Reading(): React.ReactElement {
  const [books, setBooks] = useState<NotionBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks(isBackground = false) {
      try {
        if (!isBackground) setLoading(true);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000);
        const response = await fetch(NETLIFY_FUNCTION_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (!response.ok) throw new Error(`API 錯誤: ${response.status}`);
        const data = await response.json();
        if (data.error) throw new Error(data.message || '無法載入資料');
        const fetched = data.books || [];
        setBooks(fetched);
        setCachedBooks(fetched);
        setError(null);
      } catch (err) {
        if (!isBackground) {
          console.error('Error fetching books:', err);
          setError('無法載入讀書筆記，請稍後再試');
        }
      } finally {
        if (!isBackground) setLoading(false);
      }
    }

    const cached = getCachedBooks();
    if (cached) {
      setBooks(cached);
      setLoading(false);
      fetchBooks(true);
    } else {
      fetchBooks(false);
    }
  }, []);

  const allTags = useMemo(() => {
    const set = new Set<string>();
    books.forEach(b => {
      (b.tags || []).forEach(t => t && set.add(String(t).trim()));
      (b.category || []).forEach(c => c && set.add(String(c).trim()));
    });
    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, [books]);

  const displayed = useMemo(() => {
    const norm = selectedTag ? selectedTag.trim().toLowerCase() : null;
    return books
      .filter(b => {
        if (!norm) return true;
        const tags = (b.tags || []).map(t => t.trim().toLowerCase());
        const cats = (b.category || []).map(c => c.trim().toLowerCase());
        return tags.includes(norm) || cats.includes(norm);
      })
      .sort((a, b) => {
        const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
        const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
        return tb - ta;
      });
  }, [books, selectedTag]);

  const LayoutAny = Layout as any;

  if (error) {
    return (
      <LayoutAny title="讀書筆記" description="我的讀書筆記與心得">
        <main className={styles.errorWrap}>
          <h2>載入失敗</h2>
          <p>{error}</p>
        </main>
      </LayoutAny>
    );
  }

  return (
    <LayoutAny title="Reading · 讀書筆記" description="我的讀書筆記與心得">

      <section className={styles.listSection}>
        {/* Page heading */}
        <div className={styles.pageHeader}>
          <div className={styles.pageEyebrow}>Reading · 讀書筆記</div>
          <h1 className={styles.pageTitle}>書單</h1>
        </div>

        {loading ? (
          <div className={styles.loadingCenter}>
            <div className={styles.spinner} />
          </div>
        ) : (
          <>
            {/* Tag filter */}
            {allTags.length > 0 && (
              <div className={styles.tagFilter}>
                <button
                  onClick={() => setSelectedTag(null)}
                  className={!selectedTag ? styles.tagBtnActive : styles.tagBtn}
                >
                  全部
                </button>
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={selectedTag === tag ? styles.tagBtnActive : styles.tagBtn}
                  >
                    {tag}
                  </button>
                ))}
                {selectedTag && (
                  <button onClick={() => setSelectedTag(null)} className={styles.clearBtn}>
                    清除篩選 ×
                  </button>
                )}
              </div>
            )}

            {displayed.length === 0 ? (
              <div className={styles.empty}><p>沒有符合條件的書籍</p></div>
            ) : (
              <div className={styles.booksGrid}>
                {displayed.map(b => (
                  <BookCard
                    key={b.id}
                    book={b}
                    onTagClick={tag => setSelectedTag(selectedTag === tag ? null : tag)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </section>

    </LayoutAny>
  );
}
