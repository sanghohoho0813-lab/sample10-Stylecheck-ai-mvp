import Link from "next/link";
import { ArrowRight } from "lucide-react";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import { OccasionLabel } from "@/components/OccasionIcon";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import { OCCASIONS, OCCASION_MAP } from "@/lib/occasions";
import { evaluateOccasionFit, runStyleAnalysis, verdictFor } from "@/lib/style-engine";

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
const HERO_SLOT = HERO_RESULT.primaryRecommendation.slot;

const STEPS = [
  { title: "코디 사진 올리기", body: "오늘 입을 옷을 찍거나 앨범에서 골라요. 전신이 보일수록 좋아요." },
  { title: "어디에 가는지 고르기", body: "결혼식·면접·소개팅 등 12가지 상황과 만나는 사람, 장소를 알려주세요." },
  { title: "한 가지만 바꾸기", body: "적합도와 이유, 가장 효과적인 수정 한 가지를 바로 알려드려요." },
];

export default function HomePage() {
  return (
    <div>
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="bg-blush/50">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-14 pt-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:items-center lg:gap-16 md:px-8 md:pb-20 md:pt-16">
          <div className="animate-fade-up">
            <p className="text-meta font-semibold text-rose-deep">상황별 코디 적합도 체크</p>
            <h1 className="mt-3 font-display text-display font-semibold tracking-tight text-ink lg:text-hero">
              오늘 이 옷,
              <br />
              괜찮을까요?
            </h1>
            <p className="mt-5 max-w-md text-body text-ink-soft md:text-lead">
              사진과 가는 곳을 알려주면 지금 코디가 그 자리에 얼마나 잘 맞는지, 무엇 하나를 바꾸면 좋을지 알려드려요.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/check"
                className="btn btn-lg btn-primary"
              >
                코디 확인하기
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href={`/check?sample=${HERO_SAMPLE.id}`}
                className="btn btn-lg btn-secondary"
              >
                샘플로 체험하기
              </Link>
            </div>
            <p className="mt-5 text-meta text-ink-faint">외모가 아니라 옷차림과 자리의 궁합만 확인해요.</p>
          </div>

          {/* Product preview — built from the real wedding sample */}
          <Link
            href={`/check?sample=${HERO_SAMPLE.id}`}
            className="group block w-full max-w-md animate-fade-up rounded-lg bg-white p-4 shadow-raised lg:max-w-none"
            aria-label="결혼식 하객 룩 샘플로 체험하기"
          >
            <div className="flex gap-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={HERO_SAMPLE.image}
                alt="결혼식 하객 룩 샘플 코디"
                className="aspect-[3/4] w-[42%] rounded-md object-cover"
                fetchPriority="high"
              />
              <div className="flex min-w-0 flex-1 flex-col justify-center">
                <p className="text-caption font-semibold text-ink-faint">샘플 결과</p>
                <p className="mt-1 text-meta font-semibold text-rose-deep">결혼식 하객 룩</p>
                <p className="mt-2 font-display text-display font-semibold tabular-nums text-ink">
                  {HERO_SCORE}
                  <span className="ml-0.5 font-body text-body-sm font-normal text-ink-faint">/100</span>
                </p>
                <p className="mt-2 text-body-sm text-ink-soft">
                  {verdictFor(HERO_SCORE)}. {HERO_SLOT}만 바꾸면 더 좋아요.
                </p>
              </div>
            </div>
            <div className="mt-4 rounded-sm bg-blush px-4 py-3">
              <p className="text-caption font-semibold text-rose-deep">한 가지만 바꾼다면</p>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-body-sm font-semibold text-ink">
                <span className="text-ink-faint line-through decoration-ink-faint/40">{HERO_SAMPLE.recommendation.from}</span>
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-rose" />
                {HERO_SAMPLE.recommendation.to}
                <span className="ml-auto whitespace-nowrap tabular-nums text-rose-deep">
                  {HERO_SCORE} → {HERO_AFTER}
                </span>
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
          {DEMO_SAMPLES.map((s, i) => {
            const score = evaluateOccasionFit(s.baseScores, s.occasion);
            return (
              <Link key={s.id} href={`/check?sample=${s.id}`} className="group block">
                <div className="overflow-hidden rounded-md bg-blush">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.image}
                    alt={`${s.name} — ${s.outfit}`}
                    loading={i < 4 ? "eager" : "lazy"}
                    className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
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
