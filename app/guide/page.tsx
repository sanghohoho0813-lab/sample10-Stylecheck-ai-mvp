import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import { OccasionIcon, OccasionLabel } from "@/components/OccasionIcon";
import { GUIDES } from "@/lib/guides";
import { OCCASIONS } from "@/lib/occasions";

export const metadata: Metadata = {
  title: "상황별 스타일 가이드",
};

export default function GuidePage() {
  return (
    <>
      <div className="mx-auto max-w-4xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <h1 className="font-display text-page font-semibold text-ink">상황별 스타일 가이드</h1>
        <p className="mt-3 max-w-xl text-body text-ink-soft">
          자리마다 어울리는 격식과 분위기를 정리했어요. 문화와 모임 성격에 따라 기준은 달라질 수 있으니 참고용으로
          활용해주세요.
        </p>

        <nav aria-label="상황 바로가기" className="mt-7 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <a
              key={o.id}
              href={`#${o.id}`}
              className="inline-flex h-9 items-center rounded-full border border-linen bg-white px-3.5 text-body-sm font-medium text-ink-soft transition-colors hover:border-rose-soft hover:text-rose-deep"
            >
              <OccasionLabel label={o.label} />
            </a>
          ))}
        </nav>

        <div className="mt-10 divide-y divide-linen border-t border-linen">
          {OCCASIONS.map((o) => {
            const guide = GUIDES[o.id];
            return (
              <section key={o.id} id={o.id} aria-labelledby={`${o.id}-title`} className="py-8">
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep">
                    <OccasionIcon id={o.id} className="h-5 w-5" />
                  </span>
                  <div>
                    <h2 id={`${o.id}-title`} className="font-display text-title font-semibold text-ink">
                      {o.label}
                    </h2>
                    <p className="text-meta text-ink-faint">{o.description}</p>
                  </div>
                </div>

                <div className="mt-5 grid gap-6 sm:grid-cols-2 sm:gap-10">
                  <div>
                    <h3 className="text-meta font-semibold text-sage">이렇게 입으면 좋아요</h3>
                    <ul className="mt-2.5 space-y-2">
                      {guide.points.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-body-sm text-ink">
                          <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-sage" strokeWidth={2.5} />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-meta font-semibold text-rose-deep">피하면 좋은 것</h3>
                    <ul className="mt-2.5 space-y-2">
                      {guide.avoid.map((p) => (
                        <li key={p} className="flex items-start gap-2.5 text-body-sm text-ink">
                          <span className="mt-[0.6rem] h-1 w-2.5 shrink-0 rounded-full bg-rose-soft" aria-hidden />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link
                  href={`/check?occasion=${o.id}`}
                  className="mt-5 inline-flex min-h-10 items-center gap-1.5 text-body-sm font-semibold text-rose-deep hover:underline hover:underline-offset-4"
                >
                  이 상황으로 코디 확인하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </section>
            );
          })}
        </div>

        <p className="mt-2 border-t border-linen pt-6 text-caption text-ink-faint">
          이 가이드는 일반적인 기준을 안내할 뿐 정답은 아니에요. 지역·문화·모임 성격에 따라 어울리는 스타일은 얼마든지
          달라질 수 있어요.
        </p>
      </div>

      <SampleBridgeCTA maxWidthClass="max-w-4xl" />
    </>
  );
}
