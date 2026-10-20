import Link from "next/link";
import { ArrowRight } from "lucide-react";
import LookTrio from "@/components/LookTrio";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-5 pb-24 pt-16 text-center">
      <LookTrio className="mb-8" />
      <p className="text-meta font-semibold tabular-nums tracking-wide text-rose-deep">404</p>
      <h1 className="mt-2 font-display text-section font-semibold text-ink">페이지를 찾을 수 없어요</h1>
      <p className="mt-3 text-body text-ink-soft">주소가 바뀌었거나 삭제된 페이지예요.</p>
      <div className="mt-8 flex flex-col items-center gap-3">
        <Link href="/check" className="btn btn-md btn-primary">
          코디 확인하기
          <ArrowRight className="h-4 w-4" />
        </Link>
        <div className="flex items-center gap-5 text-body-sm font-semibold text-ink-soft">
          <Link href="/" className="underline underline-offset-4 hover:text-ink">
            홈으로
          </Link>
          <Link href="/history" className="underline underline-offset-4 hover:text-ink">
            기록 보기
          </Link>
        </div>
      </div>
    </div>
  );
}
