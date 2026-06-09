// Markdown for Agents
// Serve a text/markdown representation of a page when the client asks for it
// with `Accept: text/markdown`. Browsers send `Accept: text/html,...` and never
// match, so they keep getting HTML untouched. The markdown variants are the
// `index.md` files emitted by Hugo's `markdown` output format.

export default async function handler(request: Request) {
  const accept = request.headers.get("accept") ?? "";
  // Only act when markdown is explicitly requested.
  if (!accept.includes("text/markdown")) return;

  const url = new URL(request.url);
  let path = url.pathname;

  // Already markdown, or an asset with a file extension → leave it alone.
  if (path.endsWith(".md")) return;
  const last = path.split("/").pop() ?? "";
  if (last.includes(".")) return;

  // Pretty URLs end in "/"; the page bundle's markdown lives at <path>index.md.
  if (!path.endsWith("/")) path += "/";
  const mdURL = new URL(`${path}index.md`, url.origin);

  const res = await fetch(mdURL.toString());
  if (!res.ok) return; // no markdown variant for this page → fall back to HTML

  return new Response(await res.text(), {
    status: 200,
    headers: {
      "content-type": "text/markdown; charset=utf-8",
      "x-content-type-options": "nosniff",
      "vary": "Accept",
      "cache-control": "public, max-age=0, must-revalidate",
    },
  });
}

export const config = {
  path: "/*",
  // Don't even run on static assets — only HTML page paths can have markdown.
  excludedPath: [
    "/*.css", "/*.js", "/*.mjs", "/*.json", "/*.xml", "/*.txt",
    "/*.png", "/*.jpg", "/*.jpeg", "/*.gif", "/*.svg", "/*.webp",
    "/*.avif", "/*.ico", "/*.woff", "/*.woff2", "/*.ttf", "/*.map",
  ],
};
