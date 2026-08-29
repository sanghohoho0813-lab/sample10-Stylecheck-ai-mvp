import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Camera, MapPin, Sparkles, ShieldCheck, Heart } from "lucide-react";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import { OCCASIONS, OCCASION_MAP } from "@/lib/occasions";

const HERO_SAMPLE = DEMO_SAMPLES[0];

const STEPS = [
  { icon: Camera, title: "코디 사진 업로드", body: "오늘 입을 옷 사진을 올려주세요. 전신이 보일수록 좋아요." },
  { icon: MapPin, title: "상황 선택", body: "결혼식, 면접, 소개팅… 어디에 입고 가는지 알려주세요." },
  { icon: Sparkles, title: "적합도 확인 & 추천", body: "점수와 함께 무엇을 바꾸면 좋을지 바로 알려드려요." },
];

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-blush/70 via-cream to-cream"
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-12 md:grid-cols-2 md:items-center md:gap-8 md:px-8 md:pb-24 md:pt-20">
          <div className="animate-fade-up">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-rose-soft bg-white/80 px-3.5 py-1.5 text-xs font-semibold text-rose-deep">
              <Sparkles className="h-3.5 w-3.5" />
              상황별 AI 코디 판정
            </p>
            <h1 className="font-display text-[2.35rem] font-semibold leading-[1.18] tracking-tight text-ink md:text-[3.2rem]">
              오늘 이 옷,
              <br />
              괜찮을까요?
            </h1>
            <p className="mt-5 max-w-md text-[15px] leading-relaxed text-ink-soft md:text-base">
              사진과 상황을 알려주면 지금 코디가 얼마나 잘 맞는지 확인해드려요.
              결혼식·면접·소개팅, 중요한 약속 전 1분이면 충분해요.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/check"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-rose px-7 py-3.5 text-[15px] font-semibold text-white shadow-rose transition-all duration-200 hover:bg-rose-deep hover:shadow-lift active:scale-[0.98]"
              >
                코디 확인하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/check?sample=${HERO_SAMPLE.id}`}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-linen bg-white/90 px-7 py-3.5 text-[15px] font-semibold text-ink transition-all duration-200 hover:border-rose-soft hover:bg-blush/60 active:scale-[0.98]"
              >
                샘플로 체험하기
              </Link>
            </div>
            <p className="mt-6 flex items-center gap-1.5 text-xs text-ink-faint">
              <ShieldCheck className="h-3.5 w-3.5" />
              업로드한 사진은 코디 분석에만 사용되며, 외모가 아닌 착장만 평가해요.
            </p>
          </div>

          {/* Hero visual — mock result card */}
          <div className="animate-fade-up mx-auto w-full max-w-sm md:max-w-md" style={{ animationDelay: "120ms" }}>
            <div className="relative">
              <div className="absolute -inset-6 rounded-[2.5rem] bg-rose-soft/40 blur-2xl" aria-hidden />
              <div className="relative rounded-photo border border-linen bg-white p-4 shadow-lift">
                <div className="flex gap-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={HERO_SAMPLE.image}
                    alt="결혼식 하객 룩 샘플 코디"
                    className="aspect-[3/4] w-[44%] rounded-2xl object-cover"
                    fetchPriority="high"
                  />
                  <div className="flex flex-1 flex-col justify-center">
                    <p className="text-xs font-semibold text-rose-deep">
                      {OCCASION_MAP[HERO_SAMPLE.occasion].emoji} 결혼식 하객 룩
                    </p>
                    <p className="mt-1 font-display text-5xl font-semibold text-ink">
                      84<span className="text-lg text-ink-faint">/100</span>
                    </p>
                    <p className="mt-2 text-[13px] leading-snug text-ink-soft">
                      전반적으로 잘 어울리는 코디예요. 신발만 바꾸면 더 좋아요.
                    </p>
                  </div>
                </div>
                <div className="mt-4 rounded-2xl bg-blush px-4 py-3">
                  <p className="text-xs font-semibold text-rose-deep">한 가지만 바꾼다면</p>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-ink">
                    {HERO_SAMPLE.recommendation.from}
                    <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rose" />
                    {HERO_SAMPLE.recommendation.to}
                    <span className="ml-auto rounded-full bg-white px-2 py-0.5 text-xs font-bold text-rose-deep">
                      84 → 92
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">이렇게 확인해요</h2>
        <div className="mt-7 grid gap-4 md:grid-cols-3 md:gap-6">
          {STEPS.map(({ icon: Icon, title, body }, i) => (
            <div key={title} className="rounded-card border border-linen bg-white p-6 shadow-soft">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush text-rose-deep">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="font-display text-sm text-ink-faint">0{i + 1}</span>
              </div>
              <h3 className="mt-4 text-[15px] font-semibold text-ink">{title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-soft">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Occasions */}
      <section className="mx-auto max-w-6xl px-5 py-6 md:px-8 md:py-10">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">어떤 자리든 괜찮아요</h2>
            <p className="mt-2 text-sm text-ink-soft">12가지 상황에 맞춰 격식과 스타일 균형을 확인해드려요.</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-2.5">
          {OCCASIONS.map((o) => (
            <Link
              key={o.id}
              href={`/check?occasion=${o.id}`}
              className="rounded-full border border-linen bg-white px-4 py-2.5 text-sm font-medium text-ink transition-all duration-200 hover:border-rose-soft hover:bg-blush/70 hover:text-rose-deep"
            >
              {o.emoji} {o.label}
            </Link>
          ))}
        </div>
      </section>

      {/* Sample looks */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-16">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold text-ink md:text-3xl">이런 코디는 어때요?</h2>
            <p className="mt-2 text-sm text-ink-soft">샘플 코디를 눌러 분석 과정을 바로 체험해보세요.</p>
          </div>
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {DEMO_SAMPLES.map((s, i) => (
            <Link
              key={s.id}
              href={`/check?sample=${s.id}`}
              className="group animate-fade-up overflow-hidden rounded-card border border-linen bg-white shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              <div className="overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={s.image}
                  alt={`${s.name} — ${s.outfit}`}
                  loading="lazy"
                  className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex items-center justify-between px-3.5 py-3">
                <div className="min-w-0">
                  <p className="truncate text-[13px] font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 text-[11px] text-ink-faint">
                    {OCCASION_MAP[s.occasion].emoji} {OCCASION_MAP[s.occasion].label}
                  </p>
                </div>
                <span className="flex items-center gap-1 text-[11px] font-medium text-rose">
                  <Heart className="h-3 w-3 fill-current" />
                  {80 + ((i * 17) % 60)}
                </span>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link
            href="/check"
            className="inline-flex items-center gap-2 rounded-full border border-linen bg-white px-6 py-3 text-sm font-semibold text-ink transition-all hover:border-rose-soft hover:bg-blush/60"
          >
            내 코디로 확인해보기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-linen bg-ivory">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-5 py-10 text-center md:flex-row md:justify-between md:px-8 md:text-left">
          <div>
            <p className="font-display text-lg font-semibold text-ink">
              StyleCheck <em className="not-italic text-rose">AI</em>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-ink-faint">
              점수는 착장과 상황의 적합성만 평가하며, 외모·체형은 평가하지 않아요.
              <br />
              업로드한 사진은 코디 분석을 위해서만 사용됩니다.
            </p>
          </div>
          <div className="flex items-center gap-2.5 rounded-2xl border border-linen bg-white px-4 py-3">
            <Image
              src="/mirae-ai-lab-logo.jpg"
              alt="미래에이아이랩 로고"
              width={110}
              height={33}
              className="h-7 w-auto rounded"
            />
            <span className="text-left text-[11px] leading-tight text-ink-soft">
              미래에이아이랩
              <br />
              MVP 샘플 프로젝트
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
