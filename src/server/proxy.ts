// Vercel Routing Middleware for "/" (see vercel.json "proxy"). A shared studio link such as
// /?type=clifford&alpha=1.2 gets the static home page with that render's preview card;
// everything else, and any failure, falls through to the static page untouched.
import { next } from "@vercel/functions";
import { injectShareMeta } from "../seo/injectShareMeta";
import { parseShareParams } from "../seo/ogParams";

export default async function proxy(request: Request): Promise<Response> {
  const url = new URL(request.url);
  if (!parseShareParams(url.searchParams)) return next();
  try {
    // No query string, so this request passes straight through the proxy.
    const page = await fetch(new URL("/", url));
    if (!page.ok) return next();
    const html = injectShareMeta(await page.text(), url);
    if (!html) return next();
    return new Response(html, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=0, s-maxage=3600",
      },
    });
  } catch {
    return next();
  }
}
