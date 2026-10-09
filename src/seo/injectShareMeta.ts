// Turns the static home page into a link preview for one shared studio render: the card
// image becomes /api/og for that render and the title names the system. The canonical URL
// is left alone so parameter variants never compete with the home page in search.
import { parseShareParams, shareQuery } from "./ogParams";
import { SITE_NAME, absolute } from "./site";

const escapeAttr = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function setMeta(html: string, key: "property" | "name", name: string, value: string) {
  const tag = new RegExp(`<meta\\s[^>]*${key}="${name.replace(/[.:]/g, "\\$&")}"[^>]*>`);
  const content = `content="${escapeAttr(value)}"`;
  if (tag.test(html)) return html.replace(tag, t => t.replace(/content="[^"]*"/, content));
  return html.replace("</head>", `<meta ${key}="${name}" ${content} />\n</head>`);
}

/** The share-card URL for a render, with a normalised query (one cache entry per render). */
export function shareImageUrl(search: URLSearchParams): string | null {
  const share = parseShareParams(search);
  return share ? absolute(`/api/og?${shareQuery(share)}`) : null;
}

/** The page with share meta for `url`, or null when `url` is not a studio share link. */
export function injectShareMeta(html: string, url: URL): string | null {
  const share = parseShareParams(url.searchParams);
  const image = shareImageUrl(url.searchParams);
  if (!share || !image) return null;

  const title = `${share.meta.label} — ${SITE_NAME}`;
  let out = html;
  out = setMeta(out, "property", "og:image", image);
  out = setMeta(out, "name", "twitter:image", image);
  out = setMeta(out, "property", "og:title", title);
  out = setMeta(out, "name", "twitter:title", title);
  out = setMeta(out, "property", "og:url", url.toString());
  return out;
}
