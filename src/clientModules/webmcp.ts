export function onRouteDidUpdate(): void {
  if (typeof navigator === "undefined" || !("modelContext" in navigator)) return;

  (navigator as any).modelContext.provideContext({
    tools: [
      {
        name: "get_page_as_markdown",
        description:
          "Fetch the current page content as Markdown (uses server-side content negotiation)",
        inputSchema: {
          type: "object",
          properties: {},
        },
        execute: async () => {
          const res = await fetch(window.location.href, {
            headers: { Accept: "text/markdown" },
          });
          if (res.ok) return { content: await res.text() };
          return { content: document.body.innerText };
        },
      },
      {
        name: "search_site",
        description: "Search Retsnom's docs and blog",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query" },
          },
          required: ["query"],
        },
        execute: async ({ query }: { query: string }) => ({
          url: `https://ariadocusauruswed.netlify.app/search?q=${encodeURIComponent(query)}`,
        }),
      },
    ],
  });
}
