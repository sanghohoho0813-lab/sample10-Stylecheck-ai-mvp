import { ArrowUpRight } from "lucide-react";
import { MIRAE_LINKS } from "@/lib/mirae-links";

/**
 * CTA 문구는 모두 이 상수에 모여 있습니다. 문구만 바꾸려면 여기만 수정하세요.
 * (이동 주소는 `lib/mirae-links.ts`에서 관리합니다.)
 */
const CTA_COPY = {
  badge: "MIRAE AI LAB",
  headline: ["이 샘플이 마음에 드셨다면,", "대표님 회사도 이렇게 설계해볼 수 있습니다."],
  brand: "미래AI랩",
  body: "평범한 회사를 기술·데이터·AI 기반의 성장형 기업으로 바꾸는 AX / MVP / 플랫폼 기획·개발을 진행합니다.",
  primary: "우리 회사도 만들어보기",
  samples: "다른 샘플 보기",
  home: "미래AI랩 홈페이지",
} as const;

interface Props {
  /** 메인 CTA 이동 주소 */
  consultHref?: string;
  /** "다른 샘플 보기" 이동 주소 */
  samplesHref?: string;
  /** "미래AI랩 홈페이지" 이동 주소 */
  homeHref?: string;
  /** 페이지 본문 폭에 맞추기 위한 max-width 유틸리티 클래스 */
  maxWidthClass?: string;
}

/**
 * 샘플 페이지 공통 브릿지 CTA.
 *
 * 핵심 콘텐츠(또는 핵심 흐름)를 끝낸 뒤에만 배치합니다 — 코디 확인 흐름 도중에는
 * 노출하지 않습니다. 로고는 상단 바에 이미 있으므로 여기서는 브랜드명만 씁니다.
 */
export default function SampleBridgeCTA({
  consultHref = MIRAE_LINKS.consult,
  samplesHref = MIRAE_LINKS.samples,
  homeHref = MIRAE_LINKS.home,
  maxWidthClass = "max-w-5xl",
}: Props) {
  return (
    <section
      aria-labelledby="mirae-bridge-title"
      className={`mx-auto w-full ${maxWidthClass} px-5 pb-16 pt-4 md:px-8 md:pb-20`}
    >
      <div className="rounded-lg bg-gradient-to-br from-[#4a393c] to-[#2e2326] px-6 py-9 md:px-12 md:py-12">
        <span className="inline-flex items-center rounded-full border border-white/15 px-3 py-1 text-caption font-semibold tracking-[0.16em] text-white/80">
          {CTA_COPY.badge}
        </span>

        <h2
          id="mirae-bridge-title"
          className="mt-5 max-w-2xl font-display text-title font-semibold text-white sm:text-section md:text-page"
        >
          {CTA_COPY.headline[0]}
          <br className="hidden sm:block" /> {CTA_COPY.headline[1]}
        </h2>

        <p className="mt-4 max-w-xl text-body-sm text-white/70">
          이 샘플은 <b className="font-semibold text-white">{CTA_COPY.brand}</b>이 기획·제작했습니다. {CTA_COPY.body}
        </p>

        <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-7">
          <a
            href={consultHref}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative inline-flex h-13 w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-rose px-7 text-body font-semibold text-white shadow-cta transition-[transform,background-color] duration-200 hover:-translate-y-0.5 hover:bg-rose-deep sm:w-auto"
          >
            {/* One slow, faint light sweep every 6s — the only motion in this section */}
            <span
              className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-light-sweep bg-gradient-to-r from-transparent via-white/30 to-transparent"
              aria-hidden
            />
            <span className="relative whitespace-nowrap">{CTA_COPY.primary}</span>
            <ArrowUpRight className="relative h-5 w-5 shrink-0" />
            <span className="sr-only">(새 창에서 열림)</span>
          </a>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {[
              { href: samplesHref, label: CTA_COPY.samples },
              { href: homeHref, label: CTA_COPY.home },
            ].map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-1.5 text-body-sm font-semibold text-white/75 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline"
              >
                {link.label}
                <ArrowUpRight className="h-4 w-4 shrink-0" />
                <span className="sr-only">(새 창에서 열림)</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
