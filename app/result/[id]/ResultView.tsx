"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  CircleAlert,
  Heart,
  RefreshCw,
  Share2,
  Shirt,
  Sparkles,
  ThumbsUp,
  Wand2,
} from "lucide-react";
import LabLogo from "@/components/LabLogo";
import ScoreRing from "@/components/ScoreRing";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { useToast } from "@/components/Toast";
import { getAnalysis, toggleFavorite } from "@/lib/storage";
import { OCCASION_MAP } from "@/lib/occasions";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult, ItemStatus } from "@/lib/types";

const STATUS_META: Record<ItemStatus, { label: string; cls: string }> = {
  good: { label: "잘 맞음", cls: "bg-sage/15 text-sage" },
  adjust: { label: "조금 수정", cls: "bg-gold/15 text-gold" },
  recommend: { label: "추천", cls: "bg-rose-soft text-rose-deep" },
};

export default function ResultView({ id }: { id: string }) {
  const router = useRouter();
  const toast = useToast();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [swapped, setSwapped] = useState(false);

  useEffect(() => {
    setResult(getAnalysis(id));
    setLoaded(true);
  }, [id]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 px-5 pt-10">
        <div className="skeleton h-64 rounded-photo" />
        <div className="skeleton h-32 rounded-card" />
        <div className="skeleton h-32 rounded-card" />
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md px-5 pb-16 pt-20 text-center">
        <p className="text-4xl">🔍</p>
        <h1 className="mt-4 font-display text-2xl font-semibold text-ink">결과를 찾을 수 없어요</h1>
        <p className="mt-2 text-sm text-ink-soft">기록이 삭제되었거나 다른 기기에서 확인한 결과일 수 있어요.</p>
        <Link
          href="/check"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-rose"
        >
          새로 코디 확인하기
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  const occ = OCCASION_MAP[result.occasion];
  const rec = result.primaryRecommendation;

  const onFavorite = () => {
    const nowFav = toggleFavorite(result.id);
    setResult({ ...result, favorite: nowFav });
    toast(nowFav ? "저장한 코디에 추가했어요." : "저장한 코디에서 뺐어요.", nowFav ? "success" : "info");
  };

  const onShare = async () => {
    const text = `[StyleCheck AI] ${occ.label} 코디 적합도 ${result.overallScore}점 — ${result.summary}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "StyleCheck AI 코디 판정", text, url: window.location.href });
        toast("공유를 완료했어요.");
        return;
      }
      throw new Error("no-share");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(`${text}\n${window.location.href}`);
        toast("결과 링크를 복사했어요. 친구에게 붙여넣어 보세요!");
      } catch {
        toast("공유를 지원하지 않는 환경이에요.", "info");
      }
    }
  };

  const conditionChips = [
    result.conditions.companion,
    result.conditions.place,
    result.conditions.mood,
    { spring: "봄", summer: "여름", autumn: "가을", winter: "겨울" }[result.conditions.season],
  ].filter(Boolean) as string[];

  return (
    <div className="mx-auto max-w-6xl px-5 pb-20 pt-8 md:px-8 md:pt-12">
      <div className="md:grid md:grid-cols-[38%_1fr] md:gap-8 xl:gap-10">
        {/* Left: outfit image (sticky on desktop) */}
        <div className="min-w-0 md:sticky md:top-[8.5rem] md:self-start">
          <div className="animate-fade-up relative mx-auto max-w-xs overflow-hidden rounded-photo border border-linen bg-white p-2.5 shadow-lift md:max-w-none">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={result.image} alt="분석한 코디 사진" className="aspect-[3/4] w-full rounded-[1.35rem] object-cover" />
            <div className="absolute left-5 top-5 flex gap-2">
              <span className="rounded-full bg-ink/75 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur">
                {occ.emoji} {occ.label}
              </span>
              {result.isSample && (
                <span className="rounded-full bg-white/85 px-2.5 py-1.5 text-[0.6875rem] font-semibold text-ink-soft backdrop-blur">
                  샘플
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-1.5 md:justify-start">
            <span className="text-xs text-ink-faint">{formatDate(result.createdAt)}</span>
            {conditionChips.map((c) => (
              <span key={c} className="rounded-full border border-linen bg-white px-2.5 py-1 text-[0.6875rem] font-medium text-ink-soft">
                {c}
              </span>
            ))}
          </div>

          {/* Desktop actions under photo */}
          <div className="mt-5 hidden gap-2.5 md:flex">
            <ActionButtons result={result} onFavorite={onFavorite} onShare={onShare} />
          </div>
        </div>

        {/* Right: analysis */}
        <div className="mt-8 min-w-0 space-y-5 md:mt-0">
          {/* Overall score */}
          <section className="animate-fade-up rounded-card border border-linen bg-white p-6 shadow-soft md:p-8">
            <div className="flex flex-col items-center gap-5 text-center md:flex-row md:text-left">
              <ScoreRing score={result.overallScore} size={152} />
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wider text-rose">코디 적합도</p>
                <h1 className="mt-1.5 font-display text-xl font-semibold leading-snug text-ink md:text-2xl">
                  {result.overallScore >= 85
                    ? "전체적으로 아주 좋은 코디예요!"
                    : result.overallScore >= 75
                      ? "전반적으로 잘 어울리는 코디예요"
                      : "조금만 다듬으면 좋아질 코디예요"}
                </h1>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">{result.summary}</p>
              </div>
            </div>
          </section>

          {/* Primary recommendation — 한 가지만 바꾼다면 */}
          <section className="animate-fade-up rounded-card border border-rose-soft bg-blush p-6 shadow-soft" style={{ animationDelay: "80ms" }}>
            <p className="flex items-center gap-2 text-sm font-bold text-rose-deep">
              <Wand2 className="h-4 w-4" />
              한 가지만 바꾼다면
            </p>
            <div className="mt-4 rounded-2xl bg-white p-4.5">
              <div className="flex flex-wrap items-center gap-2.5 text-[0.9375rem] font-semibold text-ink">
                <span className="rounded-xl bg-blush px-3 py-1.5 line-through decoration-rose/60">{rec.from}</span>
                <ArrowRight className="h-4 w-4 text-rose" />
                <span className="rounded-xl bg-rose px-3 py-1.5 text-white">{rec.to}</span>
              </div>
              <p className="mt-3 text-[0.8125rem] leading-relaxed text-ink-soft">{rec.reason}</p>
              <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-linen pt-4">
                <span className="text-xs font-medium text-ink-faint">예상 적합도</span>
                <span className="font-display text-lg text-ink-faint">{rec.scoreBefore}</span>
                <ArrowRight className="h-4 w-4 text-rose" />
                <span className="font-display text-2xl font-semibold text-rose-deep">{rec.scoreAfter}</span>
                <span className="ml-auto rounded-full bg-rose-soft px-2.5 py-1 text-xs font-bold text-rose-deep">
                  +{rec.scoreAfter - rec.scoreBefore}점
                </span>
              </div>
            </div>
          </section>

          {/* Positives */}
          <section className="animate-fade-up rounded-card border border-linen bg-white p-6 shadow-soft" style={{ animationDelay: "120ms" }}>
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <ThumbsUp className="h-4 w-4 text-sage" />
              잘한 부분
            </p>
            <ul className="mt-4 space-y-3.5">
              {result.positives.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-sage/15">
                    <Check className="h-3 w-3 text-sage" strokeWidth={3} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-soft">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Improvements */}
          <section className="animate-fade-up rounded-card border border-linen bg-white p-6 shadow-soft" style={{ animationDelay: "160ms" }}>
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <CircleAlert className="h-4 w-4 text-gold" />
              아쉬운 부분
            </p>
            <ul className="mt-4 space-y-3.5">
              {result.improvements.map((p) => (
                <li key={p.title} className="flex gap-3">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-gold/15 text-[0.6875rem] font-bold text-gold">
                    !
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-ink">{p.title}</p>
                    <p className="mt-0.5 text-[0.8125rem] leading-relaxed text-ink-soft">{p.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          {/* Score breakdown */}
          <section className="animate-fade-up rounded-card border border-linen bg-white p-6 shadow-soft" style={{ animationDelay: "200ms" }}>
            <p className="text-sm font-bold text-ink">세부 점수</p>
            <div className="mt-5">
              <ScoreBreakdown scores={result.scores} />
            </div>
          </section>

          {/* Item analysis */}
          <section className="animate-fade-up rounded-card border border-linen bg-white p-6 shadow-soft" style={{ animationDelay: "240ms" }}>
            <p className="flex items-center gap-2 text-sm font-bold text-ink">
              <Shirt className="h-4 w-4 text-rose" />
              아이템별 분석
            </p>
            <ul className="mt-4 divide-y divide-linen/70">
              {result.items.map((item) => (
                <li key={item.slot} className="flex items-center gap-3 py-3">
                  <span className="w-12 shrink-0 text-xs font-medium text-ink-faint sm:w-16">{item.slot}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium leading-tight text-ink">{item.name}</p>
                    <p className="mt-0.5 truncate text-[0.75rem] text-ink-soft">{item.comment}</p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2.5 py-1 text-[0.6875rem] font-bold ${STATUS_META[item.status].cls}`}>
                    {STATUS_META[item.status].label}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          {/* Alternatives */}
          <section className="animate-fade-up" style={{ animationDelay: "280ms" }}>
            <p className="flex items-center gap-2 px-1 text-sm font-bold text-ink">
              <Sparkles className="h-4 w-4 text-rose" />
              대안 코디
            </p>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {result.alternatives.map((alt) => (
                <div
                  key={alt.name}
                  className="rounded-card border border-linen bg-white p-5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="whitespace-nowrap font-display text-sm font-semibold text-rose">{alt.name}</span>
                    <span className="font-display text-xl font-semibold text-ink">
                      {alt.fitScore}
                      <span className="text-xs font-normal text-ink-faint">점</span>
                    </span>
                  </div>
                  <p className="mt-2.5 text-[0.8125rem] font-semibold leading-snug text-ink">{alt.summary}</p>
                  <p className="mt-1.5 text-[0.75rem] text-ink-soft">{alt.mood}</p>
                  <p className="mt-3 inline-flex rounded-full bg-blush px-2.5 py-1 text-[0.6875rem] font-semibold text-rose-deep">
                    아이템 {alt.changedItems}개 변경
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Wardrobe swap demo */}
          {result.wardrobeSuggestion && (
            <section className="animate-fade-up rounded-card border border-linen bg-ivory p-6 shadow-soft" style={{ animationDelay: "320ms" }}>
              <p className="text-sm font-bold text-ink">👗 {result.wardrobeSuggestion.message}</p>
              <p className="mt-1.5 text-[0.8125rem] text-ink-soft">
                옷장에 등록된 <b className="font-semibold text-ink">{result.wardrobeSuggestion.itemName}</b>
                {`(${result.wardrobeSuggestion.slot})`}로 바꾸면 지금 추천과 거의 같은 효과를 낼 수 있어요.
              </p>
              <button
                type="button"
                disabled={swapped}
                onClick={() => {
                  setSwapped(true);
                  toast("내 옷장 아이템으로 대체했어요. 예상 적합도가 반영됐어요.");
                }}
                className={`mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[0.8125rem] font-semibold transition-all duration-200 ${
                  swapped
                    ? "bg-sage/15 text-sage"
                    : "bg-ink text-white hover:bg-ink/85 active:scale-[0.98]"
                }`}
              >
                {swapped ? (
                  <>
                    <Check className="h-4 w-4" strokeWidth={3} />
                    내 옷으로 대체 완료
                  </>
                ) : (
                  "내 옷으로 대체하기"
                )}
              </button>
            </section>
          )}

          {/* Mobile actions */}
          <div className="flex flex-col gap-2.5 md:hidden">
            <ActionButtons result={result} onFavorite={onFavorite} onShare={onShare} />
          </div>

          {/* Next steps */}
          <div className="flex flex-col gap-2.5 pt-1 md:flex-row">
            <Link
              href={`/guide#${result.occasion}`}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-linen bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-blush/60"
            >
              <BookOpen className="h-4 w-4 text-rose" />
              {occ.label} 스타일 가이드 보기
            </Link>
            <button
              type="button"
              onClick={() => router.push("/check")}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-linen bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-blush/60"
            >
              <RefreshCw className="h-4 w-4 text-rose" />
              다른 코디 확인하기
            </button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-center">
            <LabLogo className="h-7 w-auto" />
            <span className="text-[0.6875rem] text-ink-faint">AI 스타일 엔진으로 분석했어요</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionButtons({
  result,
  onFavorite,
  onShare,
}: {
  result: AnalysisResult;
  onFavorite: () => void;
  onShare: () => void;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onFavorite}
        aria-pressed={result.favorite}
        className={`inline-flex flex-1 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-all duration-200 ${
          result.favorite
            ? "bg-rose-soft text-rose-deep"
            : "border border-linen bg-white text-ink hover:bg-blush/60"
        }`}
      >
        <Heart className={`h-4 w-4 ${result.favorite ? "animate-heart-pop fill-rose text-rose" : "text-rose"}`} />
        {result.favorite ? "저장됨" : "저장하기"}
      </button>
      <button
        type="button"
        onClick={onShare}
        className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-linen bg-white px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-blush/60"
      >
        <Share2 className="h-4 w-4 text-rose" />
        친구에게 물어보기
      </button>
    </>
  );
}
