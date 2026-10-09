// GET /api/og?type=<system>&<params> → the 1200×630 share card for that exact studio link.
// The output is a pure function of the query, so the CDN may keep it forever.
import { parseShareParams } from "../src/seo/ogParams";
import { renderShareImage } from "../src/seo/ogRender";

export async function GET(request: Request): Promise<Response> {
  const share = parseShareParams(new URL(request.url).searchParams);
  if (!share) return new Response("Unknown system", { status: 404, headers: { "Content-Type": "text/plain" } });

  const png = await renderShareImage(share.meta, share.params);
  return new Response(new Uint8Array(png), {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "public, max-age=31536000, s-maxage=31536000, immutable",
    },
  });
}
