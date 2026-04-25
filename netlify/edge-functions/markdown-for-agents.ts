import type { Config } from "@netlify/edge-functions";

export default async (request: Request, context: any) => {
  const accept = request.headers.get("Accept") ?? "";

  if (!accept.includes("text/markdown")) {
    return context.next();
  }

  const response = await context.next();
  const contentType = response.headers.get("Content-Type") ?? "";

  if (!contentType.includes("text/html")) {
    return response;
  }

  const html = await response.text();
  const markdown = htmlToMarkdown(html);
  const tokens = markdown.split(/\s+/).filter(Boolean).length;

  const headers = new Headers({
    "Content-Type": "text/markdown; charset=utf-8",
    "Vary": "Accept",
    "x-markdown-tokens": String(tokens),
  });

  return new Response(markdown, { status: response.status, headers });
};

function htmlToMarkdown(html: string): string {
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<nav\b[^<]*(?:(?!<\/nav>)<[^<]*)*<\/nav>/gi, "")
    .replace(/<footer\b[^<]*(?:(?!<\/footer>)<[^<]*)*<\/footer>/gi, "")
    .replace(/<h1[^>]*>(.*?)<\/h1>/gis, "\n# $1\n\n")
    .replace(/<h2[^>]*>(.*?)<\/h2>/gis, "\n## $1\n\n")
    .replace(/<h3[^>]*>(.*?)<\/h3>/gis, "\n### $1\n\n")
    .replace(/<h4[^>]*>(.*?)<\/h4>/gis, "\n#### $1\n\n")
    .replace(/<h5[^>]*>(.*?)<\/h5>/gis, "\n##### $1\n\n")
    .replace(/<h6[^>]*>(.*?)<\/h6>/gis, "\n###### $1\n\n")
    .replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gis, "[$2]($1)")
    .replace(/<strong[^>]*>(.*?)<\/strong>/gis, "**$1**")
    .replace(/<b[^>]*>(.*?)<\/b>/gis, "**$1**")
    .replace(/<em[^>]*>(.*?)<\/em>/gis, "*$1*")
    .replace(/<i[^>]*>(.*?)<\/i>/gis, "*$1*")
    .replace(/<code[^>]*>(.*?)<\/code>/gis, "`$1`")
    .replace(/<pre[^>]*>(.*?)<\/pre>/gis, "\n```\n$1\n```\n")
    .replace(/<li[^>]*>(.*?)<\/li>/gis, "- $1\n")
    .replace(/<\/[uo]l>/gi, "\n")
    .replace(/<p[^>]*>(.*?)<\/p>/gis, "$1\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export const config: Config = {
  path: "/*",
};
