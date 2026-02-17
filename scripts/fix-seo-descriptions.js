/**
 * SEO Description Fixer
 *
 * - Docs: replaces `description: ""` with a description extracted from first paragraph
 * - Blog: adds `description:` to posts that are missing it entirely
 *
 * Run: node scripts/fix-seo-descriptions.js
 */

const fs = require('fs');
const path = require('path');
const {glob} = require('glob');

const MAX_DESC_LENGTH = 160;

/**
 * Extract a plain-text description from markdown content (after the frontmatter).
 * Returns at most MAX_DESC_LENGTH characters.
 */
function extractDescription(rawContent) {
  // Strip frontmatter block
  const body = rawContent.replace(/^---[\s\S]*?---\s*/m, '');

  const cleanText = body
    .replace(/<!--[\s\S]*?-->/g, '')           // HTML comments / truncate markers
    .replace(/```[\s\S]*?```/gm, '')            // fenced code blocks
    .replace(/`[^`]+`/g, '')                    // inline code
    .replace(/!\[.*?\]\(.*?\)/g, '')            // images
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')   // links → anchor text
    .replace(/^#{1,6}\s+.*$/gm, '')             // headings
    .replace(/^[>*\-+]\s+/gm, '')              // blockquotes / list bullets
    .replace(/[*_~]/g, '')                      // bold/italic/strike
    .replace(/\n{2,}/g, '\n')                   // collapse blank lines
    .trim();

  // Pick the first non-empty line (paragraph)
  const firstLine = cleanText.split('\n').find((l) => l.trim().length > 5);
  if (!firstLine) return '';

  const desc = firstLine.trim();
  return desc.length > MAX_DESC_LENGTH ? desc.slice(0, MAX_DESC_LENGTH - 3) + '...' : desc;
}

/**
 * Inject or replace `description:` inside YAML frontmatter.
 */
function patchFrontmatter(content, description) {
  if (!description) return content;

  // Escape YAML special chars in description
  const safeDesc = description.replace(/"/g, '\\"');

  // Already has description field → replace empty value
  if (/^description:\s*["']?["']?\s*$/m.test(content)) {
    return content.replace(/^(description:\s*)["']?["']?\s*$/m, `$1"${safeDesc}"`);
  }

  // No description field → insert after `title:` line (or after first `---`)
  if (/^title:/m.test(content)) {
    return content.replace(/^(title:.*)/m, `$1\ndescription: "${safeDesc}"`);
  }

  // Fallback: insert right before closing ---
  return content.replace(/^(---\s*)$/m, `description: "${safeDesc}"\n$1`);
}

async function run() {
  const root = path.resolve(__dirname, '..');

  // 1. Fix docs with `description: ""`
  const docFiles = await glob('docs/**/*.md', {cwd: root, absolute: true});
  let docsFixed = 0;
  for (const file of docFiles) {
    const content = fs.readFileSync(file, 'utf8');
    if (!/^description:\s*["']?["']?\s*$/m.test(content)) continue; // skip if already has value

    const desc = extractDescription(content);
    if (!desc) continue;

    const patched = patchFrontmatter(content, desc);
    if (patched !== content) {
      fs.writeFileSync(file, patched, 'utf8');
      console.log(`[docs] fixed: ${path.relative(root, file)}`);
      docsFixed++;
    }
  }

  // 2. Fix blog posts that are missing `description:` entirely
  const blogFiles = await glob('blog/**/*.md', {cwd: root, absolute: true});
  let blogFixed = 0;
  for (const file of blogFiles) {
    const content = fs.readFileSync(file, 'utf8');
    // Skip authors.yml and files that already have description
    if (file.endsWith('.yml') || /^description:/m.test(content)) continue;

    const desc = extractDescription(content);
    if (!desc) continue;

    const patched = patchFrontmatter(content, desc);
    if (patched !== content) {
      fs.writeFileSync(file, patched, 'utf8');
      console.log(`[blog] fixed: ${path.relative(root, file)}`);
      blogFixed++;
    }
  }

  console.log(`\nDone. Fixed ${docsFixed} doc(s) and ${blogFixed} blog post(s).`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
