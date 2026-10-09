// GET /api/og?type=<system>&<params> → the 1200×630 share card for that exact studio link.
// Every spelling of a render is redirected to one canonical query, so the CDN keeps one
// image per render and junk parameters cannot force fresh renders.
import { parseShareParams, shareQuery } from "../seo/ogParams";
import { renderShareImage } from "../seo/ogRender";

const IMMUTABLE = "public, max-age=31536000, s-maxage=31536000, immutable";

export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const share = parseShareParams(url.searchParams);
  if (!share) return new Response("Unknown system", { status: 404, headers: { "Content-Type": "text/plain" } });

  const canonical = shareQuery(share);
  if (url.search.slice(1) !== canonical) {
    return new Response(null, {
      status: 308,
      headers: { Location: new URL(`/api/og?${canonical}`, url).toString(), "Cache-Control": IMMUTABLE },
    });
  }

  const png = await renderShareImage(share.meta, share.params);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": IMMUTABLE,
    },
  });
}
