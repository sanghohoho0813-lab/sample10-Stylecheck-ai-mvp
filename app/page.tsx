import Link from "next/link";
import { ArrowRight } from "lucide-react";
import HeroQuickStart from "@/components/HeroQuickStart";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import { OccasionLabel } from "@/components/OccasionIcon";
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

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-blush/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-16 md:px-8 md:pb-20 md:pt-16">
          <HeroQuickStart sampleHref={SAMPLE_HREF} />

          {/* Product preview — built from the real wedding sample */}
          {/* What a result looks like — built from the real wedding sample, verdict first */}
          <Link
            href={SAMPLE_HREF}
            className="group block w-full max-w-md animate-fade-up rounded-lg bg-white p-4 shadow-raised lg:max-w-none"
            aria-label="결혼식 하객 룩 샘플로 체험하기"
          >
            <div className="flex gap-4">
              <LookImage
                src={HERO_SAMPLE.image}
                alt="결혼식 하객 룩 샘플 코디"
                sizes="(min-width: 1024px) 168px, 40vw"
                className="w-[42%] rounded-md"
                priority
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-caption font-semibold text-ink-faint">샘플 결과 · 결혼식</p>
                <p className="mt-2 font-display text-title font-semibold leading-snug text-ink">{HERO_ADVICE.headline}</p>
                <p className="mt-2 text-meta tabular-nums text-ink-soft">
                  적합도 <b className="font-semibold text-ink">{HERO_SCORE}</b>
                  <span className="text-ink-faint">/100</span>
                </p>
              </div>
            </div>
            <div className="mt-4 border-t border-linen pt-4">
              <p className="flex items-center justify-between gap-3 text-caption font-semibold text-rose-deep">
                한 가지만 바꾼다면
                <span className="tabular-nums">
                  {HERO_SCORE} → {HERO_AFTER}점
                </span>
              </p>
              <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm font-semibold text-ink">
                <span className="text-ink-faint line-through decoration-ink-faint/40">{HERO_SAMPLE.recommendation.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rose" />
                {HERO_SAMPLE.recommendation.to}
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Sample looks ─────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-section font-semibold text-ink md:text-page">이런 코디는 어때요?</h2>
            <p className="mt-2 text-body text-ink-soft">샘플을 눌러 판정 과정을 그대로 체험해보세요.</p>
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-7 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6">
          {DEMO_SAMPLES.map((s) => {
            const score = evaluateOccasionFit(s.baseScores, s.occasion);
            return (
              <Link key={s.id} href={`/check?sample=${s.id}`} className="group block">
                <div className="overflow-hidden rounded-md bg-blush">
                  <LookImage
                    src={s.image}
                    alt={`${s.name} — ${s.outfit}`}
                    sizes="(min-width: 1024px) 270px, (min-width: 640px) 33vw, 50vw"
                    className="w-full transition-transform duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <p className="mt-3 text-body-sm font-semibold text-ink">{s.name}</p>
                <p className="mt-0.5 flex items-center justify-between gap-2 text-meta text-ink-faint">
                  <span className="truncate">{OCCASION_MAP[s.occasion].label}</span>
                  <span className="shrink-0 whitespace-nowrap tabular-nums">
                    <span className="sr-only">적합도 </span>
                    <b className="font-semibold text-ink-soft">{score}</b>점
                  </span>
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────── */}
      <section className="border-t border-linen">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 md:py-20">
          <h2 className="font-display text-section font-semibold text-ink md:text-page">이렇게 확인해요</h2>
          <ol className="mt-8 grid gap-8 md:grid-cols-3 md:gap-10">
            {STEPS.map((step, i) => (
              <li key={step.title} className="border-t-2 border-ink pt-5">
                <span className="font-display text-body font-semibold tabular-nums text-rose-deep">0{i + 1}</span>
                <h3 className="mt-2 text-title font-semibold text-ink">{step.title}</h3>
                <p className="mt-2 text-body-sm text-ink-soft">{step.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── Occasions ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 pb-16 md:px-8 md:pb-20">
        <h2 className="font-display text-section font-semibold text-ink md:text-page">어떤 자리든 괜찮아요</h2>
        <p className="mt-2 text-body text-ink-soft">상황을 누르면 바로 그 자리 기준으로 확인을 시작해요.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {OCCASIONS.map((o) => (
            <Link
              key={o.id}
              href={`/check?occasion=${o.id}`}
              className="chip chip-off text-ink hover:text-rose-deep"
            >
              <OccasionLabel label={o.label} />
            </Link>
          ))}
        </div>
      </section>

      <SampleBridgeCTA maxWidthClass="max-w-6xl" />
    </div>
  );
}
