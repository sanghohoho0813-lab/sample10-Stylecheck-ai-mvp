/** Neutral hanger illustration shown wherever a photo is intentionally absent. */
export function photoPlaceholder(label: string): string {
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#f9edef"/><g stroke="#cf6680" stroke-width="10" fill="none" stroke-linecap="round"><path d="M 300 300 Q 326 300 326 324 Q 326 340 300 350"/><path d="M 300 350 L 160 420 Q 148 428 160 436 L 440 436 Q 452 428 440 420 Z"/></g><text x="300" y="520" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#7d6a6d">${label}</text></svg>`
  )}`;
}

/** Stored instead of the photo when 마이페이지 "분석 사진을 기록에 저장" is off (or storage is full). */
export const PHOTO_PLACEHOLDER = photoPlaceholder("사진 저장 안 함");

/** Shown on a shared result — photos never leave the owner's device. */
export const SHARED_PLACEHOLDER = photoPlaceholder("사진은 공유되지 않아요");

/** True for an uploaded photo kept in history (large data URL), not a sample path or a placeholder. */
export function isStoredPhoto(image: string): boolean {
  return image.startsWith("data:image/") && !image.startsWith("data:image/svg+xml");
}
