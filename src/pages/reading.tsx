import React, { useEffect, useState, useMemo } from 'react';
import Link from '@docusaurus/Link';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './reading.module.css';

// Notion 書籍資料型別
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

// Netlify Function endpoint
const NETLIFY_FUNCTION_URL = '/.netlify/functions/notion-books';

function BookCard({ book, onTagClick }: { book: NotionBook; onTagClick?: (tag: string) => void }) {
  return (
    <Link to={`/reading/book?id=${encodeURIComponent(book.id)}`} aria-label={`查看 ${book.title} 詳細`}>
      <div className={styles.card}>
        <div className={styles.cardContent}>
          {book.cover && (
            <div className={styles.coverContainer}>
              <img src={book.cover} alt={book.title} className={styles.cover} />
            </div>
          )}
          <div className={styles.info}>
            <h3 className={styles.bookTitle}>{book.title}</h3>
            {book.author && <p className={styles.author}>作者：{book.author}</p>}

            <div className={styles.metadata}>
              {book.status && (
                <span className={clsx(styles.badge, styles[`status-${book.status.toLowerCase().replace(/\s/g, '-')}`])}>
                  {book.status}
                </span>
              )}
              {book.rating && (
                <span className={styles.rating}>
                  {'⭐'.repeat(book.rating)}
                </span>
              )}
            </div>

            {book.tags && book.tags.length > 0 && (
              <div className={styles.tags}>
                {book.tags.map((tag, index) => (
                  // stopPropagation so clicking tag won't follow the card link
                  <button
                    key={index}
                    type="button"
                    className={styles.tag}
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      onTagClick?.(tag);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.stopPropagation();
                        onTagClick?.(tag);
                      }
                    }}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {book.notes && (
              <div className={styles.notes}>
                <p>{book.notes}</p>
              </div>
            )}

            {(book.startDate || book.endDate) && (
              <div className={styles.dates}>
                {book.startDate && <span>開始：{book.startDate}</span>}
                {book.endDate && <span>完成：{book.endDate}</span>}
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ReadingHeader({
  books,
  loading,
  selectedTag,
  setSelectedTag,
}: {
  books: NotionBook[];
  loading: boolean;
  selectedTag: string | null;
  setSelectedTag: (tag: string | null) => void;
}) {
  const allTags = useMemo(() => {
    const set = new Set<string>();
    books.forEach((b) => {
      // primary tags field
      (b.tags || []).forEach((t) => t && set.add(String(t).trim()));
      // also include category values as filterable tags (some DBs put labels there)
      (b.category || []).forEach((c) => c && set.add(String(c).trim()));
    });

    return Array.from(set).filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-Hant'));
  }, [books]);

  // filter by tag OR category then sort by createdAt (newest first)
  const displayed = useMemo(() => {
    const normalizedSelected = selectedTag ? String(selectedTag).trim().toLowerCase() : null;

    const filtered = books.filter((b) => {
      if (!normalizedSelected) return true;
      const tags = (b.tags || []).map((t) => String(t).trim().toLowerCase());
      const cats = (b.category || []).map((c) => String(c).trim().toLowerCase());
      return tags.includes(normalizedSelected) || cats.includes(normalizedSelected);
    });

    return filtered.sort((a, b) => {
      const ta = a.createdAt ? Date.parse(a.createdAt) : 0;
      const tb = b.createdAt ? Date.parse(b.createdAt) : 0;
      return tb - ta; // newest first
    });
  }, [books, selectedTag]);

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className={styles.container}>
        <h1 className={styles.title}>📚 讀書筆記</h1>
        <p className={styles.subtitle}>How to travel in time？READ</p>

        {loading ? (
          <div className={styles.loading}>
            <p>載入中...</p>
          </div>
        ) : books.length === 0 ? (
          <div className={styles.empty}>
            <p>目前還沒有讀書筆記</p>
          </div>
        ) : (
          <>
            {/* Tag filter bar */}
            {allTags.length > 0 && (
              <div className={styles.filterBar}>
                <button
                  className={clsx(styles.tag, !selectedTag && styles.filterTagActive)}
                  onClick={() => setSelectedTag(null)}
                >
                  全部
                </button>

                {allTags.map((tag) => (
                  <button
                    key={tag}
                    className={clsx(styles.tag, selectedTag === tag && styles.filterTagActive)}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                  >
                    {tag}
                  </button>
                ))}

                {selectedTag && (
                  <button className={styles.clearFilter} onClick={() => setSelectedTag(null)}>
                    清除篩選
                  </button>
                )}
              </div>
            )}

            <div className={styles.booksGrid}>
              {displayed.map((book) => (
                <BookCard
                  key={book.id}
                  book={book}
                  onTagClick={(tag) => setSelectedTag(selectedTag === tag ? null : tag)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </header>
  );
}

export default function Reading(): React.ReactElement {
  const { siteConfig } = useDocusaurusContext();
  const [books, setBooks] = useState<NotionBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBooks() {
      try {
        setLoading(true);

        // 調用 Netlify Function
        const response = await fetch(NETLIFY_FUNCTION_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`API 錯誤: ${response.status}`);
        }

        const data = await response.json();

        if (data.error) {
          throw new Error(data.message || '無法載入資料');
        }

        setBooks(data.books || []);
        setError(null);
      } catch (err) {
        console.error('Error fetching books:', err);
        setError('無法載入讀書筆記，請稍後再試');
      } finally {
        setLoading(false);
      }
    }

    fetchBooks();
  }, []);

  const LayoutAny = Layout as any;

  if (error) {
    return (
      <LayoutAny title="讀書筆記" description="我的讀書筆記與心得">
        <main>
          <div className={styles.error}>
            <h2>載入失敗</h2>
            <p>{error}</p>
          </div>
        </main>
      </LayoutAny>
    );
  }

  return (
    <LayoutAny title="讀書筆記" description="我的讀書筆記與心得">
      <main>
        <ReadingHeader books={books} loading={loading} selectedTag={selectedTag} setSelectedTag={setSelectedTag} />
      </main>
    </LayoutAny>
  );
}
