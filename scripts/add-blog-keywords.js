/**
 * Add targeted SEO keywords to blog posts that are missing them.
 *
 * Run: node scripts/add-blog-keywords.js
 */

const fs = require('fs');
const path = require('path');

const BLOG_DIR = path.resolve(__dirname, '../blog');

// Keyword map: filename (without .md) → keywords array
const KEYWORD_MAP = {
  '20200509': ['生活記錄', '日記', '感冒', '母親節', 'Aria', '學生生活'],
  '20220428': ['面試', '工程師求職', '求職心得', '日記', '前端面試', '生活記錄'],
  '2026-02-15-2026年假的todo-list': ['2026目標', 'Todo List', '年度計畫', 'Netlify CMS', 'Docusaurus', '部落格'],
  '2026-02-15-在docusaurus新增netlify-cms': ['Docusaurus', 'Netlify CMS', 'Git-based CMS', '靜態網站', '部落格架設', '前端工具'],
  'Adolescence': ['混沌少年時', 'Adolescence', '影集觀後感', '青少年霸凌', '英國影集', 'Netflix', '社群媒體'],
  'The-Arcof-Life': ['她們創業的那些鳥事', '台灣偶像劇', '職場劇', '女性創業', '電視劇觀後感', '台劇'],
  'aboutdead': ['喪禮', '阿公', '生命教育', '失業', '家人', '生活記錄', '人生感悟'],
  'after-reading-knowledge-compound-notetaking': ['知識複利筆記術', '卡片盒筆記', '讀書心得', '筆記術', '朱騏', 'heptabase', '永久卡片', 'Zettelkasten'],
  'cyberpunked-gerunners': ['電馭叛客邊緣行者', 'Cyberpunk Edgerunners', '動畫觀後感', '賽博朋克', 'Netflix動畫', '科幻動畫'],
  'doing-a-low-paid-job': ['低薪工作', '打工經驗', '公股銀行考試', '生活記錄', '求職', '薪資'],
  'first-parttime-job': ['打工', '兼職', '大學生打工', '餐飲業', '生活記錄', '第一份工作'],
  'ghosts-in-summer': ['夏日幽靈', '電影觀後感', '日本電影', '生命意義', '孤獨', '死亡'],
  'i-decide-my-value': ['小婦人', 'Little Women', '電影觀後感', '女性意識', '獨立女性', '自我價值'],
  'i-dont-want-to-work': ['職場焦慮', '上班族', '失業', '心態調整', '厭世', '生活記錄'],
  'interviewing': ['求職面試', '找工作', '現實妥協', '職場壓力', '會計', '生活記錄'],
  'intro': ['部落格介紹', '動漫', '電影', '影集', '閱讀', '生活記錄', 'Aria', 'Retsnom'],
  'jiminisugoi': ['校對女王', 'Jimi ni Sugoi', '日劇觀後感', '天職', '職場成長', '雜誌編輯'],
  'manage-Money': ['理財', '財商', '理財課程', '投資理財', '個人財務', '奶雞money', '心得筆記'],
  'mobpsycho100s3': ['路人超能100', 'Mob Psycho 100', '動畫觀後感', '第三季', '超能力動畫', '日本動畫'],
  'my-unique-lover': ['怪胎', '台灣電影', '電影觀後感', '強迫症', 'OCD', '愛情電影', '台灣獨立電影'],
  'nothing-butthirty': ['三十而已', '中國電視劇', '影集觀後感', '三十歲', '女性成長', '人生階段'],
  'ourdearestsakura': ['同期的櫻', '日劇觀後感', '職場劇', '勇氣', '夢想', '同伴'],
  'recovery-of-an-MMO': ['網路勝利組', 'Recovery of an MMO Junkie', '動畫觀後感', '線上遊戲', 'NEET', '御宅族'],
  'self-exploration': ['自我探索', '成長記錄', '心靈成長', '個人反思', '生活記錄', '身份認同'],
  'six-lying-college-students': ['六個說謊的大學生', '小說讀後感', '求職壓力', '謊言', '日本推理小說'],
  'thank-you-for-finding-me': ['謝謝你在世界的角落找到我', '動畫電影', '二戰日本', '電影觀後感', '治癒系', '廣島'],
  'the-bear': ['大熊餐廳', 'The Bear', '美劇觀後感', '餐廳職場', '自我成長', '兄弟情'],
  'the-doll-game': ['玩偶遊戲', '少女漫畫改編', '動畫觀後感', '90年代動畫', '日本動畫', '愛情'],
  'the-first-slamdunk': ['灌籃高手', 'The First Slam Dunk', '電影觀後感', '籃球動畫', '井上雄彥', '熱血運動'],
  'the-makanai': ['舞伎家的料理人', 'Makanai', 'Netflix日劇', '京都舞伎', '料理', '是枝裕和'],
  'thehidingthing': ['隱瞞之事', '動畫觀後感', '善意謊言', '家庭', '秘密', '日本動畫'],
  'what-god-does-in-a-world-without-gods': ['在無神世界裡進行傳教活動', '動畫觀後感', '宗教', '輕小說改編', '日本動畫'],
  'who-kill-the-good-man': ['大債時代', '台灣偶像劇', '電視劇觀後感', '債務', '年輕世代', '台灣社會'],
};

function insertKeywords(content, keywords) {
  const yamlKeywords = `keywords: [${keywords.map((k) => `"${k}"`).join(', ')}]`;

  // Already has keywords — skip
  if (/^keywords:/m.test(content)) return content;

  // Handle block-list tags (tags:\n  - item) — insert after the last list item
  const blockTagsMatch = content.match(/^(tags:\s*\n(?:[ \t]+-[^\n]*\n)+)/m);
  if (blockTagsMatch) {
    const end = blockTagsMatch.index + blockTagsMatch[0].length;
    return content.slice(0, end) + yamlKeywords + '\n' + content.slice(end);
  }

  // Insert after inline tags: [...] or date: or title: line
  for (const anchor of ['tags:', 'date:', 'title:']) {
    if (new RegExp(`^${anchor}`, 'm').test(content)) {
      return content.replace(new RegExp(`(^${anchor}.*$)`, 'm'), `$1\n${yamlKeywords}`);
    }
  }

  return content;
}

let fixed = 0;
for (const [slug, keywords] of Object.entries(KEYWORD_MAP)) {
  const filePath = path.join(BLOG_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) {
    console.warn(`[skip] file not found: ${slug}.md`);
    continue;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  if (/^keywords:/m.test(content)) {
    console.log(`[skip] already has keywords: ${slug}.md`);
    continue;
  }

  const patched = insertKeywords(content, keywords);
  if (patched !== content) {
    fs.writeFileSync(filePath, patched, 'utf8');
    console.log(`[done] ${slug}.md`);
    fixed++;
  }
}

console.log(`\nAdded keywords to ${fixed} blog post(s).`);
