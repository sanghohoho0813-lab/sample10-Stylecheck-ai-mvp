"use client";

import { usePathname } from "next/navigation";
import LabLogo from "./LabLogo";

/** Quiet site footer — hidden inside the focused check flow. */
export default function SiteFooter() {
  const pathname = usePathname() ?? "/";
  if (pathname.startsWith("/check")) return null;

  return (
    <footer className="border-t border-linen bg-ivory">
      <div className="mx-auto flex max-w-6xl flex-col gap-5 px-5 py-10 md:flex-row md:items-end md:justify-between md:px-8">
        <div>
          <p className="font-display text-title font-semibold text-ink">
            StyleCheck <em className="not-italic text-rose">AI</em>
          </p>
          <p className="mt-2 max-w-md text-meta text-ink-faint">
            착장과 상황의 적합성만 확인하며, 얼굴·체형 등 외모는 평가하지 않아요. 업로드한 사진은 이 기기 안에서만
            보관됩니다.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <LabLogo className="h-7 w-auto" />
          <p className="text-caption text-ink-faint">© 2026 미래에이아이랩 · MVP 샘플</p>
        </div>
      </div>
    </footer>
  );
}
