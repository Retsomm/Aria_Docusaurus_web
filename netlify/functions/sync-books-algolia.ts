/**
 * sync-books-algolia
 * 從 Notion 抓取所有書籍，推送到 Algolia 索引供搜尋使用。
 *
 * 觸發方式（擇一）：
 *  1. 手動 POST 請求（帶 Authorization: Bearer $SYNC_SECRET）
 *  2. Netlify Scheduled Function（在 netlify.toml 設定 schedule）
 *
 * 必要環境變數：
 *  - NOTION_API_KEY
 *  - NOTION_DATABASE_ID
 *  - ALGOLIA_ADMIN_API_KEY   ← 需在 Algolia Dashboard > API Keys 取得 Write 權限的 Admin Key
 *  - ALGOLIA_APP_ID          （預設 KOYF7XQ73V）
 *  - ALGOLIA_INDEX_NAME      （預設 ariadocusauruswed_netlify_app_pages）
 *  - SITE_URL                （預設 https://ariadocusauruswed.netlify.app）
 *  - SYNC_SECRET             （選用，防止未授權觸發）
 */

// Environment variable validation function
function validateEnvironment() {
  const missing: string[] = [];

  if (!process.env.ALGOLIA_ADMIN_API_KEY) missing.push('ALGOLIA_ADMIN_API_KEY');
  if (!process.env.NOTION_API_KEY) missing.push('NOTION_API_KEY');
  if (!process.env.NOTION_DATABASE_ID) missing.push('NOTION_DATABASE_ID');

  if (missing.length > 0) {
    throw new Error(`❌ Missing critical environment variables: ${missing.join(', ')}. Sync-books-algolia function cannot start.`);
  }
}

// Validate on module load
try {
  validateEnvironment();
} catch (e) {
  console.error((e as Error).message);
}

const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || 'KOYF7XQ73V';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_API_KEY!;
const ALGOLIA_INDEX = process.env.ALGOLIA_INDEX_NAME || 'ariadocusauruswed_netlify_app_pages';
const NOTION_API_KEY = process.env.NOTION_API_KEY!;
const DATABASE_ID = process.env.NOTION_DATABASE_ID!;
const SITE_URL = (process.env.SITE_URL || 'https://ariadocusauruswed.netlify.app').replace(/\/$/, '');
const SYNC_SECRET = process.env.SYNC_SECRET || '';

// ── Notion 原始欄位解析 ─────────────────────────────────────────────────────

const parseBook = (page: any) => {
  const p = page.properties || {};

  const title =
    p.Name?.title?.[0]?.plain_text ||
    p['書名']?.title?.[0]?.plain_text ||
    '未命名';

  const author =
    (p.Author?.rich_text || p['作者']?.rich_text || []).map((r: any) => r.plain_text).filter(Boolean).join(' ') ||
    (p.Author?.people || p['作者']?.people || []).map((p: any) => p.name).join(', ') ||
    p.Author?.select?.name || p['作者']?.select?.name || '';

  const notes =
    (p.Notes?.rich_text || p['筆記']?.rich_text || []).map((r: any) => r.plain_text).join('') || '';

  const summary =
    (p.Summary?.rich_text || p['摘要']?.rich_text || []).map((r: any) => r.plain_text).join('') || '';

  const category: string[] =
    p.Category?.multi_select?.map((t: any) => t.name) ||
    p['分類']?.multi_select?.map((t: any) => t.name) ||
    (p.Category?.select?.name ? [p.Category.select.name] : []) ||
    [];

  const tags: string[] =
    (p.Tags?.multi_select || p.Tag?.multi_select || p['標籤']?.multi_select || []).map((t: any) => t.name);

  const status = p.Status?.select?.name || p['狀態']?.select?.name || '';

  return { id: page.id, title, author, notes, summary, category, tags, status };
};

// ── Algolia 推送（使用原生 fetch，不依賴 algoliasearch 套件）────────────────

const algoliaRequest = async (method: string, path: string, body?: object) => {
  const res = await fetch(`https://${ALGOLIA_APP_ID}.algolia.net${path}`, {
    method,
    headers: {
      'X-Algolia-Application-Id': ALGOLIA_APP_ID,
      'X-Algolia-API-Key': ALGOLIA_ADMIN_KEY,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Algolia API ${method} ${path} failed (${res.status}): ${err}`);
  }

  return res.json();
};

// ── Netlify Function handler ────────────────────────────────────────────────

export const handler = async (event: any) => {
  // Scheduled function 不會有 httpMethod，直接通過
  if (event.httpMethod && event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  // 簡單的 secret 驗證（SYNC_SECRET 未設定時略過）
  if (SYNC_SECRET) {
    const auth = event.headers?.authorization || '';
    if (auth !== `Bearer ${SYNC_SECRET}`) {
      return { statusCode: 401, body: 'Unauthorized' };
    }
  }

  if (!ALGOLIA_ADMIN_KEY) {
    return { statusCode: 500, body: 'Missing ALGOLIA_ADMIN_API_KEY' };
  }
  if (!NOTION_API_KEY || !DATABASE_ID) {
    return { statusCode: 500, body: 'Missing Notion credentials' };
  }

  // 1. 從 Notion 抓取所有書籍
  const notionRes = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${NOTION_API_KEY}`,
      'Notion-Version': '2022-06-28',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });

  if (!notionRes.ok) {
    const err = await notionRes.text();
    return { statusCode: 502, body: `Notion API error: ${err}` };
  }

  const notionData = await notionRes.json();
  const books = (notionData.results || []).map(parseBook);

  // 2. 轉換為 Algolia records（格式與 docsearch 相容）
  const records = books.map((book: ReturnType<typeof parseBook>) => {
    const url = `${SITE_URL}/reading/book/?id=${encodeURIComponent(book.id)}`;
    const contentParts = [book.author, book.notes, book.summary, ...book.tags, ...book.category]
      .filter(Boolean)
      .join(' ');

    return {
      objectID: `book-${book.id}`,
      url,
      url_without_anchor: url,
      anchor: null,
      type: 'lvl1',
      hierarchy: {
        lvl0: '閱讀書單',
        lvl1: book.title,
        lvl2: book.author || null,
        lvl3: null,
        lvl4: null,
        lvl5: null,
        lvl6: null,
      },
      content: contentParts || null,
      weight: {
        pageRank: 0,
        level: 50,
        position: 0,
      },
      lang: 'zh-TW',
    };
  });

  // 3. 批次推送到 Algolia（每批最多 1000 筆）
  const BATCH_SIZE = 1000;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await algoliaRequest('POST', `/1/indexes/${ALGOLIA_INDEX}/batch`, {
      requests: batch.map((r: any) => ({ action: 'updateObject', body: r })),
    });
  }

  const message = `成功同步 ${records.length} 本書籍到 Algolia 索引 [${ALGOLIA_INDEX}]`;
  console.log(message);

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ success: true, synced: records.length, index: ALGOLIA_INDEX }),
  };
};

