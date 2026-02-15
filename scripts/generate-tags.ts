#!/usr/bin/env ts-node
import * as fs from 'fs';
import * as path from 'path';

const root: string = process.cwd();
const searchDirs: string[] = ['blog', 'blog-private', 'docs'];
const exts: string[] = ['.md', '.mdx', '.markdown'];

const readFilesRecursive = (dir: string): string[] => {
  const results: string[] = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  for (const file of list) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      results.push(...readFilesRecursive(filePath));
    } else if (exts.includes(path.extname(file))) {
      results.push(filePath);
    }
  }
  return results;
};

const extractTagsFromFrontmatter = (content: string): string[] => {
  const fmMatch = content.match(/^---\n([\s\S]*?)\n---/);
  if (!fmMatch) return [];
  const fm = fmMatch[1];

  // 1) inline array: tags: ["a", "b"]
  const inline = fm.match(/tags:\s*\[(.*?)\]/s);
  if (inline) {
    return inline[1]
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  // 2) block list:
  const block = fm.match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/);
  if (block) {
    return block[1]
      .split(/\n/)
      .map((l) => l.replace(/^\s*-\s*/, '').trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  // 3) single-line string: tags: tag1, tag2
  const single = fm.match(/tags:\s*(.+)/);
  if (single) {
    const val = single[1].trim();
    if (val.startsWith('{') || val.startsWith('[')) return [];
    return val
      .split(',')
      .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
      .filter(Boolean);
  }

  return [];
};

const collectTags = (): string[] => {
  const tags = new Set<string>();
  for (const dir of searchDirs) {
    const abs = path.join(root, dir);
    const files = readFilesRecursive(abs);
    for (const f of files) {
      try {
        const content = fs.readFileSync(f, 'utf8');
        const t = extractTagsFromFrontmatter(content);
        t.forEach((tag) => tags.add(tag));
      } catch (e) {
        /* ignore */
      }
    }
  }
  return Array.from(tags).filter(Boolean).sort((a, b) => a.localeCompare(b, 'zh-Hant-u-co-pinyin'));
};

const updateConfigYaml = (tags: string[]): string => {
  const cfgPath = path.join(root, 'static', 'admin', 'config.yml');
  let cfg = fs.readFileSync(cfgPath, 'utf8');
  const yamlArray = tags.map((t) => `"${t.replace(/"/g, '\\"') }"`).join(', ');
  cfg = cfg.replace(/suggestions:\s*\[[^\]]*\]/g, `suggestions: [${yamlArray}]`);
  fs.writeFileSync(cfgPath, cfg, 'utf8');
  return cfgPath;
};

const main = (): void => {
  const tags = collectTags();
  console.log('Found tags:', tags);
  const out = updateConfigYaml(tags);
  console.log('Updated', out);
};

main();
