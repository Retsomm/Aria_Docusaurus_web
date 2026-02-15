// Simple in-memory cache (persists for the lifetime of the serverless instance)
// Structure: { allBooks: { data, expiresAt }, byId: { [id]: { book, blocks, expiresAt } } }
const CACHE_TTL_MS: number = (Number(process.env.NOTION_CACHE_TTL_SECONDS) || 300) * 1000; // default 5 minutes

type NotionPage = any; // keep broad — specific typing can be added later
type Block = any;

interface CacheByIdEntry {
  book: any | null;
  blocks: Block[];
  expiresAt: number;
}

interface CacheStructure {
  allBooks: { data: any[] | null; expiresAt: number };
  byId: Record<string, CacheByIdEntry>;
}

const __cache: CacheStructure = { allBooks: { data: null, expiresAt: 0 }, byId: {} };

export const handler = async (event: any, context: any): Promise<any> => {
  // 處理 CORS preflight 請求
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: '',
    };
  }

  // 只允許 POST 請求
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  // parse request body early so we can check cache before hitting Notion
  let requestBody: Record<string, any> = {};
  try {
    requestBody = JSON.parse(event.body || '{}');
  } catch (e) {
    requestBody = {};
  }

  // 如果有快取可以直接回傳（減少對 Notion 的重複呼叫）
  try {
    if (requestBody.id) {
      const cached = __cache.byId[requestBody.id];
      if (cached && cached.expiresAt > Date.now()) {
        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'X-Cache': 'HIT',
          },
          body: JSON.stringify({ book: cached.book, blocks: cached.blocks, cached: true }),
        };
      }
    } else if (__cache.allBooks.expiresAt > Date.now() && __cache.allBooks.data) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'X-Cache': 'HIT',
        },
        body: JSON.stringify({ books: __cache.allBooks.data, cached: true }),
      };
    }
  } catch (e) {
    // ignore cache check errors and continue to fetch fresh data
  }

  try {
    // 從環境變數讀取 API Key 和 Database ID
    const NOTION_API_KEY = process.env.NOTION_API_KEY as string | undefined;
    const DATABASE_ID = process.env.NOTION_DATABASE_ID as string | undefined;

    if (!NOTION_API_KEY || !DATABASE_ID) {
      throw new Error('Missing Notion API credentials');
    }

    // 使用原生 fetch 調用 Notion API
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_API_KEY}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}), // 不使用排序，直接抓取所有資料
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Notion API error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();

    // 處理資料
    const books = (data.results || []).map((page: any) => {
      const properties = page.properties || {};

      return {
        id: page.id,
        // page create time（用於排序）
        createdAt: page.created_time || page.last_edited_time || null,
        title: properties.Name?.title?.[0]?.plain_text || properties.書名?.title?.[0]?.plain_text || '未命名',
        // author：支援多種 Notion 屬性型別（rich_text / people / multi_select / select / title）
        author:
          ((properties.Author?.rich_text || properties.作者?.rich_text || []).map?.((r: any) => r.plain_text).filter(Boolean).join(' ') ||
            (properties.Author?.people || properties.作者?.people || []).map?.((p: any) => p.name).filter(Boolean).join(', ') ||
            (properties.Author?.multi_select || properties.作者?.multi_select || []).map?.((t: any) => t.name).filter(Boolean).join(', ') ||
            properties.Author?.select?.name || properties.作者?.select?.name ||
            properties.Author?.title?.[0]?.plain_text || properties.作者?.title?.[0]?.plain_text ||
            null),
        // 分類：支援 select 或 multi_select
        category:
          properties.Category?.multi_select?.map((t: any) => t.name) ||
          properties.分類?.multi_select?.map((t: any) => t.name) ||
          (properties.Category?.select?.name ? [properties.Category.select.name] : null) ||
          (properties.分類?.select?.name ? [properties.分類.select.name] : []),
        // 出版社
        publisher: properties.Publisher?.rich_text?.[0]?.plain_text || properties.出版社?.rich_text?.[0]?.plain_text || null,
        // URL（Notion URL property 或常見命名）
        url: properties.URL?.url || properties.Link?.url || properties.網址?.url || properties['Source URL']?.url || null,
        // 偏愛程度（支援 select.name 或 number）
        preference: properties.Preference?.select?.name || properties.偏愛程度?.select?.name || properties.Preference?.number || properties.偏愛程度?.number || null,
        status: properties.Status?.select?.name || properties.狀態?.select?.name,
        rating: properties.Rating?.number || properties.評分?.number,
        notes: properties.Notes?.rich_text?.[0]?.plain_text || properties.筆記?.rich_text?.[0]?.plain_text,
        // 額外建議欄位
        summary: (properties.Summary?.rich_text || properties.摘要?.rich_text || []).map((r: any) => r.plain_text).join('') || null,
        dateFinished: properties['Date Finished']?.date?.start || properties.讀完日期?.date?.start || properties.完成日期?.date?.start || null,
        cover:
          properties.Cover?.files?.[0]?.file?.url || properties.封面?.files?.[0]?.file?.url || page.cover?.file?.url || page.cover?.external?.url,
        // tags：支援多種命名與資料型別（multi_select, select, rich_text, single select under different names）
        tags: ((properties.Tags?.multi_select || properties.Tag?.multi_select || properties.tags?.multi_select || properties.標籤?.multi_select || []).map((tag: any) => tag.name).filter(Boolean)).length > 0
          ? (properties.Tags?.multi_select || properties.Tag?.multi_select || properties.tags?.multi_select || properties.標籤?.multi_select || []).map((t: any) => t.name)
          : (properties.Tags?.select?.name || properties.Tag?.select?.name || properties.tags?.select?.name || properties.標籤?.select?.name)
          ? [(properties.Tags?.select?.name || properties.Tag?.select?.name || properties.tags?.select?.name || properties.標籤?.select?.name)]
          : ((properties.Tags?.rich_text || properties.Tag?.rich_text || properties.tags?.rich_text || properties.標籤?.rich_text || []).map?.((r: any) => r.plain_text).join(',').split(',').map((s: string) => s.trim()).filter(Boolean)) || [],
        startDate: properties['Start Date']?.date?.start || properties.開始日期?.date?.start,
        endDate: properties['End Date']?.date?.start || properties.完成日期?.date?.start,
      } as NotionPage;
    });

    // cache the full list (短暫快取，避免頻繁查詢 Notion)
    try {
      __cache.allBooks = { data: books, expiresAt: Date.now() + CACHE_TTL_MS };
    } catch (e) {
      /* ignore cache set errors */
    }

    if (requestBody.id) {
      const found = books.find((b) => b.id === requestBody.id);

      if (!found) {
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
          body: JSON.stringify({ error: 'Book not found' }),
        };
      }

      // 嘗試抓取該 page 的 block children（遞迴到第一層以下的 children）
      const fetchBlockChildren = async (blockId: string): Promise<Block[]> => {
        const res = await fetch(`https://api.notion.com/v1/blocks/${blockId}/children?page_size=100`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${NOTION_API_KEY}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
          },
        });

        if (!res.ok) {
          return [];
        }

        const json = await res.json();
        const results = json.results || [];

        return Promise.all(
          results.map(async (blk: any) => {
            if (blk.has_children) {
              try {
                const childRes = await fetch(`https://api.notion.com/v1/blocks/${blk.id}/children?page_size=100`, {
                  method: 'GET',
                  headers: {
                    'Authorization': `Bearer ${NOTION_API_KEY}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json',
                  },
                });

                if (childRes.ok) {
                  const childJson = await childRes.json();
                  blk.children = childJson.results || [];
                }
              } catch (e) {
                blk.children = [];
              }
            }

            return blk;
          }),
        );
      };

      let blocks: Block[] = [];
      try {
        blocks = await fetchBlockChildren(requestBody.id);
      } catch (e) {
        blocks = [];
      }

      // cache single page result
      try {
        __cache.byId[requestBody.id] = { book: found, blocks, expiresAt: Date.now() + CACHE_TTL_MS };
      } catch (e) {
        /* ignore cache set errors */
      }

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({ book: found, blocks }),
      };
    }

    // 預設回傳所有書籍
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
      body: JSON.stringify({ books }),
    };
  } catch (error: any) {
    console.error('Error fetching from Notion:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
      body: JSON.stringify({
        error: 'Failed to fetch books',
        message: error?.message,
      }),
    };
  }
};

// keep CommonJS consumers (Netlify) happy
(exports as any).handler = handler;
