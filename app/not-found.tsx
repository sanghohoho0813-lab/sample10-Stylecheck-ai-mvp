import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-20 text-center">
      <p className="font-display text-display font-semibold text-rose-deep">404</p>
      <h1 className="mt-3 font-display text-section font-semibold text-ink">페이지를 찾을 수 없어요</h1>
      <p className="mt-3 text-body text-ink-soft">주소가 바뀌었거나 삭제된 페이지예요.</p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link
          href="/check"
          className="inline-flex h-12 items-center gap-2 rounded-full bg-rose px-6 text-body font-semibold text-white transition-colors hover:bg-rose-deep"
        >
          코디 확인하기
          <ArrowRight className="h-4 w-4" />
        </Link>
        <Link href="/" className="text-body-sm font-semibold text-ink-soft underline underline-offset-4">
          홈으로
        </Link>
      </div>
    </div>
  );
}
