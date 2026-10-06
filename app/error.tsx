"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

/**
 * Route-level error screen. Keeps the header, tab bar and footer (the layout)
 * so the user is never stranded, and offers a retry before anything else.
 */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-20 text-center" role="alert">
      <h1 className="font-display text-section font-semibold text-ink">화면을 불러오지 못했어요</h1>
      <p className="mt-3 text-body text-ink-soft">
        잠시 후 다시 시도해주세요. 확인한 코디 기록은 이 기기에 그대로 남아 있어요.
      </p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <button type="button" onClick={reset} className="btn btn-md btn-primary">
          <RotateCcw className="h-4 w-4" />
          다시 시도
        </button>
        <Link href="/" className="text-body-sm font-semibold text-ink-soft underline underline-offset-4">
          홈으로
        </Link>
      </div>
      {error.digest && <p className="mt-10 text-meta tabular-nums text-ink-faint">오류 코드 {error.digest}</p>}
    </div>
  );
}
