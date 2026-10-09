import { getSystemPage } from "../content/systemPages";
import { getSystemMeta } from "../attractors/catalog";
import { SITE_NAME, DEFAULT_IMAGE, HOME_DESCRIPTION, absolute } from "./site";

export interface PageMeta {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: "website" | "article";
  jsonLd: Record<string, any>[];
  noindex?: boolean;
}

export interface HeadTag {
  tag: "meta" | "link" | "script";
  attrs: Record<string, string>;
  text?: string;
}

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: absolute(it.path) })),
});

const notFound = (path: string): PageMeta => ({
  title: `Page not found — ${SITE_NAME}`,
  description: HOME_DESCRIPTION,
  canonical: absolute(path),
  image: absolute(DEFAULT_IMAGE),
  type: "website",
  jsonLd: [],
  noindex: true,
});

/** Title, description, canonical, share image and structured data for a site path. */
export function pageMetaFor(path: string): PageMeta {
  if (path === "/") {
    return {
      title: `${SITE_NAME} — Strange Attractor & Fractal Generator`,
      description: HOME_DESCRIPTION,
      canonical: absolute("/"),
      image: absolute(DEFAULT_IMAGE),
      type: "website",
      jsonLd: [{
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: SITE_NAME,
        url: absolute("/"),
        description: HOME_DESCRIPTION,
        image: absolute(DEFAULT_IMAGE),
        applicationCategory: "DesignApplication",
        operatingSystem: "Any (web browser)",
        browserRequirements: "Requires JavaScript",
        offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
      }],
    };
  }
  if (path === "/info") {
    const description = "How to use Chaos Iterator, the mathematics behind every strange attractor, IFS and fractal it draws, a gallery of renders, and credits.";
    return {
      title: `Help & About — ${SITE_NAME}`,
      description,
      canonical: absolute("/info"),
      image: absolute(DEFAULT_IMAGE),
      type: "website",
      jsonLd: [
        { "@context": "https://schema.org", "@type": "WebPage", name: "Help & About", url: absolute("/info"), description },
        breadcrumbs([{ name: SITE_NAME, path: "/" }, { name: "Help & About", path: "/info" }]),
      ],
    };
  }
  const m = /^\/systems\/([a-z0-9-]+)$/.exec(path);
  const page = m ? getSystemPage(m[1]) : undefined;
  if (!page) return notFound(path);

  const url = absolute(path);
  const image = absolute(page.image ?? DEFAULT_IMAGE);
  return {
    title: `${page.title} — Generator & Explanation | ${SITE_NAME}`,
    description: page.description,
    canonical: url,
    image,
    type: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "TechArticle",
        headline: page.title,
        description: page.description,
        url,
        image: [image],
        about: page.systemIds.map(id => getSystemMeta(id)?.label ?? id),
        isPartOf: { "@type": "WebSite", name: SITE_NAME, url: absolute("/") },
        publisher: { "@type": "Organization", name: SITE_NAME, url: absolute("/") },
      },
      breadcrumbs([
        { name: SITE_NAME, path: "/" },
        { name: "Help & About", path: "/info" },
        { name: page.title, path },
      ]),
    ],
  };
}

/** The head tags for a page (used by the client hook and the prerender step). */
export function metaTags(meta: PageMeta): { title: string; tags: HeadTag[] } {
  const named = (name: string, content: string): HeadTag => ({ tag: "meta", attrs: { name, content } });
  const prop = (property: string, content: string): HeadTag => ({ tag: "meta", attrs: { property, content } });
  const tags: HeadTag[] = [
    named("description", meta.description),
    { tag: "link", attrs: { rel: "canonical", href: meta.canonical } },
    prop("og:type", meta.type),
    prop("og:url", meta.canonical),
    prop("og:title", meta.title),
    prop("og:description", meta.description),
    prop("og:image", meta.image),
    prop("og:site_name", SITE_NAME),
    named("twitter:card", "summary_large_image"),
    named("twitter:title", meta.title),
    named("twitter:description", meta.description),
    named("twitter:image", meta.image),
  ];
  if (meta.noindex) tags.push(named("robots", "noindex, follow"));
  for (const ld of meta.jsonLd) {
    tags.push({ tag: "script", attrs: { type: "application/ld+json" }, text: JSON.stringify(ld) });
  }
  return { title: meta.title, tags };
}
