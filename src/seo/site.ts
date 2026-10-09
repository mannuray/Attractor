// Site-wide constants for SEO. Pure data: safe to import from server code (api/, proxy.ts).
export const SITE_ORIGIN = "https://chaos-iterator.vercel.app";
export const SITE_NAME = "Chaos Iterator";
export const DEFAULT_IMAGE = "/og-image.png";
export const HOME_DESCRIPTION =
  "Create stunning mathematical art with strange attractors and fractals. Generate Mandelbrot, Julia, Clifford, De Jong and 20+ other systems in your browser. Free.";

export const absolute = (path: string) => (/^https?:\/\//.test(path) ? path : `${SITE_ORIGIN}${path}`);
