const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 9월 29일 (월) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** 오늘 14:05 / 어제 09:30 / 3일 전 / 9월 2일 — for lists where recency matters more than the date */
export function formatRelativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86400000);
  const time = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  // Same-day checks are told apart by time
  if (days <= 0) return `오늘 ${time}`;
  if (days === 1) return `어제 ${time}`;
  if (days < 7) return `${days}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type.toLowerCase());
}

/** Phone photos are 2–12MB; anything far beyond that is not an outfit photo. */
export const MAX_UPLOAD_BYTES = 25 * 1024 * 1024;

/** What we can honestly tell about a photo from its pixels — no recognition involved. */
export interface PhotoInfo {
  width: number;
  height: number;
  /** Mean luminance 0–1 */
  brightness: number;
}

export interface PreparedImage {
  dataUrl: string;
  info: PhotoInfo;
}

/**
 * Reads an image file, fixes what would spoil it on screen and returns a
 * resized JPEG data URL (fits 800×1100) — small enough that dozens fit in
 * localStorage history.
 *
 * - Orientation: browsers apply EXIF rotation when decoding (image-orientation:
 *   from-image), so phone photos arrive upright.
 * - Transparency: JPEG has no alpha, so cut-outs are painted onto white.
 * - Brightness is measured on a 32px thumbnail for the "too dark" tip.
 */
export function prepareImage(file: File): Promise<PreparedImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        const scale = Math.min(1, 800 / img.width, 1100 / img.height);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("canvas-unavailable"));
          return;
        }
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({
          dataUrl: canvas.toDataURL("image/jpeg", 0.8),
          info: { width: img.width, height: img.height, brightness: measureBrightness(canvas) },
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

function measureBrightness(source: HTMLCanvasElement): number {
  const probe = document.createElement("canvas");
  probe.width = probe.height = 32;
  const ctx = probe.getContext("2d");
  if (!ctx) return 0.5;
  ctx.drawImage(source, 0, 0, 32, 32);
  const { data } = ctx.getImageData(0, 0, 32, 32);
  let sum = 0;
  for (let i = 0; i < data.length; i += 4) sum += 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2];
  return sum / (data.length / 4) / 255;
}

/** One practical tip about the photo, most useful first — or null when it looks fine. */
export function photoTip(info: PhotoInfo | null | undefined): string | null {
  if (!info) return null;
  if (info.brightness < 0.25) return "사진이 조금 어두워요. 밝은 곳에서 찍으면 색이 더 정확하게 보여요.";
  if (info.width > info.height * 1.1) return "가로 사진이에요. 전신이 세로로 담기면 코디가 더 잘 보여요.";
  if (Math.max(info.width, info.height) < 480) return "사진이 작아요. 더 큰 사진이면 결과 화면에서 더 선명해요.";
  return null;
}

function finalConsonant(word: string): number | null {
  const last = word.trim().charCodeAt(word.trim().length - 1);
  if (last < 0xac00 || last > 0xd7a3) return null;
  return (last - 0xac00) % 28;
}

/** "이"/"가" — 격식이, 자리 분위기가. */
export function withIGa(word: string): string {
  const jong = finalConsonant(word);
  return `${word}${jong === null || jong === 0 ? "가" : "이"}`;
}

/** "와"/"과" — 친구와, 가족과. */
export function withGwa(word: string): string {
  const jong = finalConsonant(word);
  return `${word}${jong === null || jong === 0 ? "와" : "과"}`;
}

/** "으로"/"로" — 받침이 없거나 ㄹ 받침이면 "로" (블랙 로퍼로, 블랙 스트레이트팁으로). */
export function withEuro(word: string): string {
  const jong = finalConsonant(word);
  return `${word}${jong === null || jong === 0 || jong === 8 ? "로" : "으로"}`;
}
