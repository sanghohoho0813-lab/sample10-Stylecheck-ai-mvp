const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

/** 9월 29일 (월) */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAYS[d.getDay()]})`;
}

/** 오늘 / 어제 / 3일 전 / 9월 2일 — for lists where recency matters more than the date */
export function formatRelativeDay(iso: string, now = new Date()): string {
  const d = new Date(iso);
  const startOf = (x: Date) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const days = Math.round((startOf(now) - startOf(d)) / 86400000);
  if (days <= 0) return "오늘";
  if (days === 1) return "어제";
  if (days < 7) return `${days}일 전`;
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export function isAcceptedImage(file: File): boolean {
  return ACCEPTED_TYPES.includes(file.type.toLowerCase());
}

/**
 * Reads an image file and returns a resized JPEG data URL (max 900px wide)
 * so uploaded photos preview instantly and fit in localStorage history.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("read-failed"));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("decode-failed"));
      img.onload = () => {
        const maxW = 900;
        const scale = Math.min(1, maxW / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(reader.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.82));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/** "으로"/"로" — 받침이 없거나 ㄹ 받침이면 "로" (블랙 로퍼로, 블랙 스트레이트팁으로). */
export function withEuro(word: string): string {
  const last = word.trim().charCodeAt(word.trim().length - 1);
  if (last < 0xac00 || last > 0xd7a3) return `${word}로`;
  const jong = (last - 0xac00) % 28;
  return `${word}${jong === 0 || jong === 8 ? "로" : "으로"}`;
}
