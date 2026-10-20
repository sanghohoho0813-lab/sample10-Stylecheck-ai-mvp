/**
 * Backdrop colour of each sample photo — the mean of its outer 6% frame —
 * painted behind the image while it loads, so a card arrives as its own
 * colour rather than a blank box. Recompute if a photo in public/looks changes.
 */
export const LOOK_TINTS: Record<string, string> = {
  "/looks/blind-date-knit.webp": "#e2d3db",
  "/looks/date-feminine.webp": "#f2d8cf",
  "/looks/family-cream.webp": "#e5d2bd",
  "/looks/first-day-oxford.webp": "#cfd6da",
  "/looks/friends-casual.webp": "#c8c8bd",
  "/looks/interview-black.webp": "#ded6ce",
  "/looks/restaurant-charcoal.webp": "#bfb4a8",
  "/looks/wedding-navy.webp": "#f1ded9",
};
