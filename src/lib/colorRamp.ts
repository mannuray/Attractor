// Pure helpers for editing a palette's color ramp (stops at positions 0..1).

export interface RGB { red: number; green: number; blue: number }
export interface Stop extends RGB { position: number }

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const hex2 = (n: number) => clamp(Math.round(n), 0, 255).toString(16).padStart(2, "0").toUpperCase();

export const toHex = (c: RGB) => `#${hex2(c.red)}${hex2(c.green)}${hex2(c.blue)}`;

export function fromHex(input: string): RGB | null {
  let h = input.trim().replace(/^#/, "");
  if (/^[0-9a-f]{3}$/i.test(h)) h = h.split("").map(ch => ch + ch).join("");
  if (!/^[0-9a-f]{6}$/i.test(h)) return null;
  return { red: parseInt(h.slice(0, 2), 16), green: parseInt(h.slice(2, 4), 16), blue: parseInt(h.slice(4, 6), 16) };
}

/** h in [0, 360), s and v in [0, 1] */
export function rgbToHsv({ red, green, blue }: RGB) {
  const r = red / 255, g = green / 255, b = blue / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === r) h = ((g - b) / d) % 6;
    else if (max === g) h = (b - r) / d + 2;
    else h = (r - g) / d + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s: max === 0 ? 0 : d / max, v: max };
}

export function hsvToRgb(h: number, s: number, v: number): RGB {
  const c = v * s, x = c * (1 - Math.abs(((h / 60) % 2) - 1)), m = v - c;
  const [r, g, b] =
    h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] :
    h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return { red: Math.round((r + m) * 255), green: Math.round((g + m) * 255), blue: Math.round((b + m) * 255) };
}

const sorted = (stops: Stop[]) => [...stops].sort((a, b) => a.position - b.position);

export function interpolateAt(stops: Stop[], position: number): RGB {
  const s = sorted(stops);
  if (position <= s[0].position) return { red: s[0].red, green: s[0].green, blue: s[0].blue };
  const last = s[s.length - 1];
  if (position >= last.position) return { red: last.red, green: last.green, blue: last.blue };
  const i = s.findIndex(st => st.position >= position);
  const a = s[i - 1], b = s[i];
  const t = b.position === a.position ? 0 : (position - a.position) / (b.position - a.position);
  const lerp = (x: number, y: number) => Math.round(x + (y - x) * t);
  return { red: lerp(a.red, b.red), green: lerp(a.green, b.green), blue: lerp(a.blue, b.blue) };
}

export const isEndStop = (stops: Stop[], index: number) => index === 0 || index === stops.length - 1;

export function addStop(stops: Stop[], position: number): { stops: Stop[]; index: number } {
  const pos = clamp(position, 0, 1);
  const stop: Stop = { position: pos, ...interpolateAt(stops, pos) };
  const next = sorted([...stops, stop]);
  return { stops: next, index: next.indexOf(stop) };
}

export function removeStop(stops: Stop[], index: number): Stop[] {
  if (stops.length <= 2 || isEndStop(stops, index)) return stops;
  return stops.filter((_, i) => i !== index);
}

export function moveStop(stops: Stop[], index: number, position: number): Stop[] {
  if (isEndStop(stops, index)) return stops;
  const lo = stops[index - 1].position + 0.01;
  const hi = stops[index + 1].position - 0.01;
  const pos = lo > hi ? (lo + hi) / 2 : clamp(position, lo, hi);
  return stops.map((s, i) => (i === index ? { ...s, position: pos } : s));
}

export function setStopColor(stops: Stop[], index: number, color: RGB): Stop[] {
  return stops.map((s, i) => (i === index ? { ...s, ...color } : s));
}
