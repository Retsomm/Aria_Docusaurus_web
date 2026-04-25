# Markdown Negotiation Skill

This site returns HTML pages as Markdown when the request includes `Accept: text/markdown`.

## How It Works

Send any request with `Accept: text/markdown` to receive a Markdown version of the page:

```
GET /docs/intro HTTP/1.1
Accept: text/markdown
```

The response will have `Content-Type: text/markdown` and an optional `x-markdown-tokens` header with the approximate token count.

## Reference

- Cloudflare Markdown for Agents: https://developers.cloudflare.com/fundamentals/reference/markdown-for-agents/
