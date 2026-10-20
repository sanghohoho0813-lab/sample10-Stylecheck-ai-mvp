import Link from "next/link";
import { ArrowRight, Camera } from "lucide-react";
import HeroQuickStart from "@/components/HeroQuickStart";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import { OccasionIcon, OccasionLabel } from "@/components/OccasionIcon";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import { OCCASIONS, OCCASION_MAP } from "@/lib/occasions";
import { adviceFor } from "@/lib/advice";
import { evaluateOccasionFit, runStyleAnalysis } from "@/lib/style-engine";
import LookImage from "@/components/LookImage";

const HERO_SAMPLE = DEMO_SAMPLES[0];
// Run the real engine so the preview shows exactly what the result page will.
const HERO_RESULT = runStyleAnalysis({
  imageKey: HERO_SAMPLE.id,
  image: HERO_SAMPLE.image,
  occasion: HERO_SAMPLE.occasion,
  conditions: { companion: null, place: null, mood: null, season: "autumn", note: "" },
  sample: HERO_SAMPLE,
});
const HERO_SCORE = HERO_RESULT.overallScore;
const HERO_AFTER = HERO_RESULT.primaryRecommendation.scoreAfter;
const HERO_ADVICE = adviceFor(HERO_RESULT);
const SAMPLE_HREF = `/check?sample=${HERO_SAMPLE.id}`;

const STEPS = [
  { title: "사진 한 장", body: "오늘 입은 옷을 찍거나 앨범에서 골라요. 전신이 보이면 가장 좋아요." },
  { title: "가는 곳 하나", body: "결혼식·면접·소개팅 등 12가지 중 하나만 고르면 돼요. 나머지는 선택이에요." },
  { title: "한 가지만 바꾸기", body: "괜찮은지, 그리고 가장 효과가 큰 한 가지를 친구처럼 바로 알려드려요." },
];

const STEP_VISUALS = [
  // 사진 한 장
  <div key="photo" className="relative">
    <LookImage src={DEMO_SAMPLES[1].image} alt="" sizes="56px" className="w-11 rounded-[0.4rem] md:w-[4.5rem] md:rounded-sm" />
    <span className="absolute -bottom-1.5 -right-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-rose-deep text-white shadow-subtle md:-bottom-2 md:-right-3 md:h-9 md:w-9">
      <Camera className="h-3.5 w-3.5 md:h-4.5 md:w-4.5" />
    </span>
  </div>,
  // 가는 곳 하나
  <span
    key="place"
    className="inline-flex h-8 items-center gap-1.5 rounded-full bg-rose-deep px-3 text-meta font-semibold text-white shadow-cta md:h-12 md:gap-2 md:px-5 md:text-body"
  >
    <OccasionIcon id={HERO_SAMPLE.occasion} className="h-4 w-4 md:h-5 md:w-5" />
    {OCCASION_MAP[HERO_SAMPLE.occasion].label}
  </span>,
  // 한 가지만 바꾸기
  <div key="change" className="px-2 text-center">
    <span className="rounded-full bg-blush px-2.5 py-0.5 text-caption font-semibold tabular-nums text-rose-deep md:px-3.5 md:py-1 md:text-body-sm">
      {HERO_SCORE} → {HERO_AFTER}점
    </span>
    <p className="mt-2 text-caption font-semibold leading-snug text-ink md:mt-3 md:text-lead">{HERO_SAMPLE.recommendation.to}</p>
  </div>,
];

function SectionHeading({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h2 className="font-display text-section font-semibold text-ink md:text-page">{title}</h2>
      <p className="mt-2 text-body-sm text-ink-soft md:text-body">{sub}</p>
    </div>
  );
}

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-[linear-gradient(180deg,var(--color-blush)_0%,color-mix(in_srgb,var(--color-blush)_45%,var(--color-cream))_70%,var(--color-cream)_100%)]">
        <div className="mx-auto grid max-w-6xl gap-6 px-5 pb-10 pt-7 md:grid-cols-[minmax(0,1fr)_20rem] md:items-center md:px-8 md:pb-16 md:pt-14 lg:grid-cols-[minmax(0,1fr)_30rem] lg:gap-12 lg:pb-20">
          <HeroQuickStart sampleHref={SAMPLE_HREF} />

          {/* What a result looks like — the real wedding sample, verdict first.
              Phones: one compact result card. Desktop: the look itself, with
              the verdict laid over it. One image either way. */}
          <Link
            href={SAMPLE_HREF}
            aria-label="결혼식 하객 룩 샘플로 체험하기"
            className="group relative grid animate-fade-up grid-cols-[34%_minmax(0,1fr)] gap-4 rounded-lg bg-white p-3 shadow-raised sm:max-w-md lg:block lg:max-w-none lg:bg-transparent lg:p-0 lg:shadow-none"
          >
            <div className="overflow-hidden rounded-md lg:ml-auto lg:w-[21rem] lg:rounded-lg lg:shadow-raised">
              <LookImage
                src={HERO_SAMPLE.image}
                alt="결혼식 하객 룩 샘플 코디"
                sizes="(min-width: 1024px) 336px, 34vw"
                className="w-full transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </div>
            <div className="flex min-w-0 flex-col py-1 lg:absolute lg:bottom-10 lg:left-0 lg:w-[17.5rem] lg:rounded-md lg:bg-white lg:p-5 lg:shadow-overlay">
              <p className="text-caption font-semibold text-ink-faint">샘플 결과 · 결혼식</p>
              <p className="mt-1.5 font-display text-title font-semibold leading-snug text-ink">{HERO_ADVICE.headline}</p>
              <p className="mt-1.5 text-meta tabular-nums text-ink-soft">
                적합도 <b className="font-semibold text-ink">{HERO_SCORE}</b>
                <span className="text-ink-faint">/100</span>
              </p>
              <div className="mt-auto border-t border-linen pt-3 lg:mt-4 lg:pt-4">
                <p className="flex items-center justify-between gap-2 text-caption font-semibold text-rose-deep">
                  한 가지만 바꾼다면
                  <span className="tabular-nums">
                    {HERO_SCORE} → {HERO_AFTER}점
                  </span>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-body-sm font-semibold text-ink">
                  <span className="text-ink-faint line-through decoration-ink-faint/40">{HERO_SAMPLE.recommendation.from}</span>
                  <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rose" aria-hidden />
                  {HERO_SAMPLE.recommendation.to}
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Sample looks — a swipeable shelf on phones, a grid from tablets ── */}
      <section className="py-10 md:py-20">
        <div className="mx-auto max-w-6xl px-5 md:px-8">
          <SectionHeading title="이런 코디는 어때요?" sub="샘플을 눌러 판정 과정을 그대로 체험해보세요." />
        </div>
        {/* `relative` keeps the sr-only labels inside the scroller — absolutely
            positioned, they would otherwise widen the page on phones */}
        <ul
          aria-label="샘플 코디"
          className="no-scrollbar relative mx-auto mt-6 flex max-w-6xl snap-x snap-mandatory scroll-px-5 gap-3 overflow-x-auto px-5 pb-2 md:mt-8 md:grid md:snap-none md:grid-cols-4 md:gap-x-5 md:gap-y-8 md:overflow-visible md:px-8 md:pb-0 lg:gap-x-6"
        >
          {DEMO_SAMPLES.map((s) => {
            const score = evaluateOccasionFit(s.baseScores, s.occasion);
            return (
              <li key={s.id} className="w-[42%] shrink-0 snap-start sm:w-[30%] md:w-auto">
                <Link href={`/check?sample=${s.id}`} className="group block transition-transform duration-150 active:scale-[0.98]">
                  <div className="overflow-hidden rounded-md bg-blush">
                    <LookImage
                      src={s.image}
                      alt={`${s.name} — ${s.outfit}`}
                      sizes="(min-width: 1024px) 270px, (min-width: 768px) 25vw, (min-width: 640px) 30vw, 42vw"
                      className="w-full transition-transform duration-500 group-hover:scale-[1.03]"
                      // Same photo as the hero (already loading) — and Next.js tracks
                      // LCP per URL, so it must not be the one marked lazy
                      priority={s.id === HERO_SAMPLE.id}
                    />
                  </div>
                  <p className="mt-2.5 truncate text-body-sm font-semibold text-ink">{s.name}</p>
                  <p className="mt-0.5 flex items-center justify-between gap-2 text-meta text-ink-faint">
                    <span className="truncate">{OCCASION_MAP[s.occasion].label}</span>
                    <span className="shrink-0 whitespace-nowrap tabular-nums">
                      <span className="sr-only">적합도 </span>
                      <b className="font-semibold text-ink-soft">{score}</b>점
                    </span>
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* ── Occasions — start from the place ─────────────────────────── */}
      <section className="border-y border-linen bg-white">
        <div className="mx-auto max-w-6xl px-5 py-10 md:px-8 md:py-16">
          <SectionHeading title="어디에 입고 가시나요?" sub="고르면 그 자리 기준으로 바로 확인을 시작해요." />
          <ul className="mt-7 grid grid-cols-4 gap-x-2 gap-y-5 sm:grid-cols-6 md:mt-8 lg:grid-cols-4 lg:gap-3">
            {OCCASIONS.map((o) => (
              <li key={o.id}>
                <Link
                  href={`/check?occasion=${o.id}`}
                  className="group flex flex-col items-center gap-2 rounded-md text-center transition-[transform,background-color,border-color] duration-150 active:scale-[0.96] lg:flex-row lg:gap-4 lg:border lg:border-linen lg:p-4 lg:text-left lg:hover:border-rose-soft lg:hover:bg-blush/40 lg:active:scale-[0.98]"
                >
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep transition-colors group-hover:bg-blush-deep lg:h-12 lg:w-12">
                    <OccasionIcon id={o.id} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-meta font-medium leading-snug text-ink lg:text-body-sm lg:font-semibold">
                      <OccasionLabel label={o.label} />
                    </span>
                    <span className="mt-0.5 hidden truncate text-meta text-ink-faint lg:block">{o.description}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
        <h2 className="font-display text-section font-semibold text-ink md:text-page">이렇게 확인해요</h2>
        <ol className="mt-6 grid gap-4 md:mt-8 md:grid-cols-3 md:gap-6 lg:gap-8">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex items-center gap-4 md:block">
              {/* Each step pictured with the real piece of UI it produces */}
              <div
                className="flex h-24 w-26 shrink-0 items-center justify-center rounded-md border border-linen bg-white md:h-40 md:w-full md:rounded-lg"
                aria-hidden
              >
                {STEP_VISUALS[i]}
              </div>
              <div className="min-w-0 md:mt-5">
                <span className="font-display text-body font-semibold tabular-nums text-rose-deep">0{i + 1}</span>
                <h3 className="mt-0.5 text-title font-semibold text-ink md:mt-1">{step.title}</h3>
                <p className="mt-1 text-body-sm text-ink-soft md:mt-2">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <SampleBridgeCTA maxWidthClass="max-w-6xl" />
    </div>
  );
}
