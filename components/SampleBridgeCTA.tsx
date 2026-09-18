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
  body: "이 샘플은 미래AI랩이 기획·제작했습니다. 평범한 회사를 기술·데이터·AI 기반의 성장형 기업으로 바꾸는 AX / MVP / 플랫폼 기획·개발을 진행합니다.",
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
 * 핵심 콘텐츠를 다 본 뒤 상담(메인) · 다른 샘플 · 홈페이지로 이어주는 섹션입니다.
 * 샘플 페이지마다 로고가 이미 노출되므로 여기서는 로고 대신 브랜드명과
 * 짧은 소개 문구만 사용합니다.
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
      className={`mx-auto w-full ${maxWidthClass} px-5 pb-14 pt-2 md:px-8 md:pb-20`}
    >
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-[#4a393c] via-ink to-[#2e2326] px-5 py-8 shadow-lift sm:px-7 md:px-12 md:py-12">
        {/* 은은한 앰비언트 글로우 — 배너가 아니라 조명처럼 보이도록 아주 약하게 */}
        <div
          className="pointer-events-none absolute -right-24 -top-28 h-64 w-64 animate-glow-soft rounded-full bg-rose/25 blur-3xl motion-reduce:animate-none"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -bottom-28 -left-20 h-56 w-56 rounded-full bg-lab-cyan/15 blur-3xl"
          aria-hidden
        />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[0.6875rem] font-bold tracking-[0.18em] text-white/90 backdrop-blur-sm">
            <span
              className="h-1.5 w-1.5 animate-glow-soft rounded-full bg-lab-cyan motion-reduce:animate-none"
              aria-hidden
            />
            {CTA_COPY.badge}
          </span>

          <h2
            id="mirae-bridge-title"
            className="mt-5 max-w-2xl font-display text-[1.3rem] font-semibold leading-snug text-white sm:text-[1.55rem] md:text-[2rem]"
          >
            {CTA_COPY.headline[0]}
            <br className="hidden sm:block" />{" "}
            {CTA_COPY.headline[1]}
          </h2>

          <p className="mt-4 max-w-xl text-[0.9375rem] leading-relaxed text-white/70">
            이 샘플은 <b className="font-semibold text-white">{CTA_COPY.brand}</b>이 기획·제작했습니다. 평범한 회사를
            기술·데이터·AI 기반의 성장형 기업으로 바꾸는 AX / MVP / 플랫폼 기획·개발을 진행합니다.
          </p>

          <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:gap-6">
            <a
              href={consultHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative inline-flex w-full items-center justify-center gap-2 overflow-hidden rounded-full bg-gradient-to-r from-rose to-rose-deep px-4 py-4 text-[0.875rem] font-bold text-white sm:w-auto sm:px-7 sm:text-[0.9375rem] shadow-rose transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_20px_45px_-14px_rgba(210,105,127,0.75)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-soft active:translate-y-0 motion-reduce:transition-none"
            >
              {/* 6초에 한 번 지나가는 아주 약한 light sweep */}
              <span
                className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-light-sweep bg-gradient-to-r from-transparent via-white/35 to-transparent motion-reduce:hidden"
                aria-hidden
              />
              <span className="relative whitespace-nowrap">{CTA_COPY.primary}</span>
              <ArrowUpRight className="relative h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transition-none" />
              <span className="sr-only">(새 창에서 열림)</span>
            </a>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
              {[
                { href: samplesHref, label: CTA_COPY.samples },
                { href: homeHref, label: CTA_COPY.home },
              ].map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 py-1 text-[0.875rem] font-semibold text-white/75 underline-offset-4 transition-colors duration-200 hover:text-white hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/40"
                >
                  {link.label}
                  <ArrowUpRight className="h-4 w-4 shrink-0" />
                  <span className="sr-only">(새 창에서 열림)</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
