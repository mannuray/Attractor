import { useEffect } from "react";
import { metaTags, PageMeta, HeadTag } from "./meta";

// Selector for "the same tag" so a new value replaces (never duplicates) static or prerendered tags.
function selectorFor(t: HeadTag): string {
  if (t.tag === "script") return 'script[type="application/ld+json"]';
  if (t.tag === "link") return `link[rel="${t.attrs.rel}"]`;
  if (t.attrs.name) return `meta[name="${t.attrs.name}"]`;
  return `meta[property="${t.attrs.property}"]`;
}

/** Keeps <title>, description, canonical, OG/Twitter and JSON-LD in sync with the current page. */
export function useDocumentMeta(meta: PageMeta) {
  const key = JSON.stringify(meta);
  useEffect(() => {
    const { title, tags } = metaTags(meta);
    document.title = title;
    const selectors = Array.from(new Set(tags.map(selectorFor).concat('meta[name="robots"]')));
    selectors.forEach(sel => document.head.querySelectorAll(sel).forEach(el => el.remove()));
    for (const t of tags) {
      const el = document.createElement(t.tag);
      Object.entries(t.attrs).forEach(([k, v]) => el.setAttribute(k, v));
      if (t.text) el.textContent = t.text;
      document.head.appendChild(el);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
}
