import type { DemoSample } from "./types";

/**
 * Generates an editorial flat-lay style SVG illustration for a demo sample
 * outfit and returns it as a data URL usable in <img src>.
 * Keeps the whole demo self-contained without external photo assets.
 */
export function sampleImageDataUrl(sample: DemoSample): string {
  const { top, bottom, outer, shoes, bg } = sample.palette;

  const outerLayer = outer
    ? `
    <!-- outer / jacket -->
    <g transform="translate(300 306)">
      <path d="M -128 -86 Q -128 -110 -100 -116 L -30 -132 Q 0 -122 30 -132 L 100 -116 Q 128 -110 128 -86 L 140 40 Q 140 58 122 58 L 96 58 L 96 -20 L 96 132 Q 96 148 80 148 L -80 148 Q -96 148 -96 132 L -96 -20 L -96 58 L -122 58 Q -140 58 -140 40 Z"
        fill="${outer}"/>
      <path d="M -30 -132 Q -12 -100 0 -96 Q 12 -100 30 -132 L 14 -78 L 0 132 L -14 -78 Z" fill="${top}"/>
      <path d="M -30 -132 L -64 -96 L -22 -64 L 0 -96 Z" fill="${shade(outer, -14)}"/>
      <path d="M 30 -132 L 64 -96 L 22 -64 L 0 -96 Z" fill="${shade(outer, -14)}"/>
    </g>`
    : `
    <!-- top -->
    <g transform="translate(300 306)">
      <path d="M -104 -92 Q -104 -116 -78 -122 L -28 -134 Q 0 -122 28 -134 L 78 -122 Q 104 -116 104 -92 L 122 22 Q 124 40 106 42 L 84 36 L 84 128 Q 84 146 66 146 L -66 146 Q -84 146 -84 128 L -84 36 L -106 42 Q -124 40 -122 22 Z"
        fill="${top}"/>
      <path d="M -28 -134 Q 0 -108 28 -134 Q 14 -96 0 -94 Q -14 -96 -28 -134 Z" fill="${shade(top, -16)}"/>
    </g>`;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${bg}"/>
      <stop offset="1" stop-color="${shade(bg, -6)}"/>
    </linearGradient>
  </defs>
  <rect width="600" height="800" fill="url(#g)"/>
  <path d="M 90 800 L 90 260 Q 90 120 300 120 Q 510 120 510 260 L 510 800 Z" fill="#ffffff" opacity="0.5"/>
  <!-- hanger -->
  <g stroke="${shade(bg, -38)}" stroke-width="7" fill="none" stroke-linecap="round">
    <path d="M 300 128 Q 322 128 322 148 Q 322 160 300 168"/>
    <path d="M 300 168 L 180 214 M 300 168 L 420 214"/>
  </g>
  ${outerLayer}
  <!-- bottom -->
  <g transform="translate(300 460)">
    <path d="M -62 -8 L 62 -8 L 76 218 Q 76 232 62 232 L 30 232 Q 18 232 16 218 L 0 66 L -16 218 Q -18 232 -30 232 L -62 232 Q -76 232 -76 218 Z" fill="${bottom}"/>
    <path d="M -62 -8 L 62 -8 L 64 22 L -64 22 Z" fill="${shade(bottom, -12)}"/>
  </g>
  <!-- shoes -->
  <g transform="translate(300 716)">
    <path d="M -86 8 Q -86 -12 -62 -12 L -38 -12 Q -20 -12 -16 6 Q -14 20 -30 20 L -74 20 Q -86 20 -86 8 Z" fill="${shoes}"/>
    <path d="M 86 8 Q 86 -12 62 -12 L 38 -12 Q 20 -12 16 6 Q 14 20 30 20 L 74 20 Q 86 20 86 8 Z" fill="${shoes}"/>
  </g>
  <text x="300" y="775" text-anchor="middle" font-family="Georgia, serif" font-size="21" fill="${shade(bg, -52)}" letter-spacing="1">${escapeXml(sample.outfit)}</text>
</svg>`;

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Lighten (positive) or darken (negative) a hex color by percent. */
function shade(hex: string, percent: number): string {
  const n = hex.replace("#", "");
  const num = parseInt(n, 16);
  const amt = Math.round(2.55 * percent);
  const r = Math.min(255, Math.max(0, (num >> 16) + amt));
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0xff) + amt));
  const b = Math.min(255, Math.max(0, (num & 0xff) + amt));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}
