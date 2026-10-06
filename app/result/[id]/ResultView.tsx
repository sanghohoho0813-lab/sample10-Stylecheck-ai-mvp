"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Heart,
  RefreshCw,
  Share2,
  Shirt,
  SlidersHorizontal,
} from "lucide-react";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import ScoreRing from "@/components/ScoreRing";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { useToast } from "@/components/Toast";
import { resultFromShare, shareUrl } from "@/lib/share";
import { getAnalysis, setRecommendationApplied, toggleFavorite } from "@/lib/storage";
import { OCCASION_MAP, SEASONS } from "@/lib/occasions";
import { verdictFor } from "@/lib/style-engine";
import { formatDate, withEuro } from "@/lib/utils";
import type { AnalysisResult, ItemStatus } from "@/lib/types";

const STATUS_META: Record<ItemStatus, { label: string; cls: string }> = {
  good: { label: "잘 맞음", cls: "text-sage" },
  adjust: { label: "조금 수정", cls: "text-gold" },
  recommend: { label: "바꾸면 좋아요", cls: "text-rose-deep" },
};

const signed = (n: number) => (n > 0 ? `+${n}` : `−${Math.abs(n)}`);

export default function ResultView({ id, share }: { id: string; share?: string }) {
  const router = useRouter();
  const toast = useToast();
  const [result, setResult] = useState<AnalysisResult | null>(null);
  /** Opened from a friend's share link — read-only, nothing is stored. */
  const [shared, setShared] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);

  useEffect(() => {
    const own = getAnalysis(id);
    const fromLink = !own && share ? resultFromShare(share, id) : null;
    setResult(own ?? fromLink);
    setShared(Boolean(fromLink));
    setLoaded(true);
    // Land on the answer, not under the sticky header, and open the detail
    // section by default where there is room for it.
    window.scrollTo({ top: 0 });
    setDetailsOpen(window.matchMedia("(min-width: 768px)").matches);
  }, [id, share]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-10" aria-busy="true">
        <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
          <div className="skeleton hidden aspect-[3/4] rounded-lg md:block" />
          <div className="space-y-4">
            <div className="skeleton h-32 rounded-md" />
            <div className="skeleton h-56 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="mx-auto max-w-md px-5 pb-20 pt-20 text-center">
        <h1 className="font-display text-section font-semibold text-ink">결과를 찾을 수 없어요</h1>
        <p className="mt-3 text-body text-ink-soft">
          {share
            ? "공유 링크가 잘렸거나 올바르지 않아요. 보낸 사람에게 링크를 다시 받아주세요."
            : "기록이 삭제되었거나 다른 기기에서 확인한 결과일 수 있어요. 결과는 확인한 기기에만 저장돼요."}
        </p>
        <div className="mt-8 flex flex-col items-center gap-3">
          <Link href="/check" className="btn btn-md btn-primary">
            코디 확인하기
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/history" className="text-body-sm font-semibold text-ink-soft underline underline-offset-4">
            기록 보기
          </Link>
        </div>
      </div>
    );
  }

  const occ = OCCASION_MAP[result.occasion];
  const rec = result.primaryRecommendation;
  const applied = Boolean(result.appliedAt);
  const verdict = verdictFor(result.overallScore);
  const keyGood = result.positives[0];
  const keyFix = result.improvements[0];
  const notes = result.conditionNotes ?? [];
  const keyNote = notes[0];
  const wardrobe = result.wardrobeSuggestion;
  // The first alternative is the primary recommendation itself — list only the others.
  const otherWays = result.alternatives.slice(1);

  const onFavorite = () => {
    const nowFav = toggleFavorite(result.id);
    setResult({ ...result, favorite: nowFav });
    toast(nowFav ? "저장한 코디에 담았어요" : "저장한 코디에서 뺐어요", nowFav ? "success" : "info");
  };

  const onApply = (next: boolean) => {
    const updated = setRecommendationApplied(result.id, next);
    if (!updated) return;
    setResult({ ...updated });
    if (next) {
      toast(`오늘 코디를 ${rec.scoreAfter}점으로 기록했어요`, "success", {
        label: "기록 보기",
        onClick: () => router.push("/history?filter=applied"),
      });
    } else {
      toast("추천 적용을 취소했어요", "info");
    }
  };

  const onShare = async () => {
    const url = shareUrl(result, window.location.origin);
    const text = `[StyleCheck AI] ${occ.label} 코디 적합도 ${result.overallScore}점 — ${verdict}. 이 코디 어때 보여?`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "StyleCheck AI 코디 판정", text, url });
        return;
      }
      throw new Error("no-share");
    } catch (e) {
      if ((e as Error).name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(`${text}\n${url}`);
        toast("공유 링크를 복사했어요. 사진은 공유되지 않아요");
      } catch {
        toast("이 브라우저에서는 공유를 지원하지 않아요", "info");
      }
    }
  };

  const seasonLabel = SEASONS.find((s) => s.id === result.conditions.season)?.label;
  const conditionChips = [result.conditions.companion, result.conditions.place, result.conditions.mood, seasonLabel].filter(
    Boolean
  ) as string[];
  const photoAlt = shared ? "공유된 코디" : "확인한 코디 사진";

  return (
    <>
      <div className="mx-auto max-w-6xl px-5 pb-10 pt-6 md:px-8 md:pt-10">
        {shared && (
          <p className="mb-6 flex items-center gap-2.5 rounded-sm bg-white px-4 py-3 text-body-sm text-ink-soft shadow-subtle">
            <Share2 className="h-4 w-4 shrink-0 text-rose-deep" />
            <span>
              <b className="font-semibold text-ink">친구가 공유한 코디 판정</b>이에요. 사진은 공유되지 않아요.
            </span>
          </p>
        )}

        <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-16">
          {/* ── Photo (desktop) ─────────────────────────────────────────── */}
          <aside className="hidden md:sticky md:top-24 md:block md:self-start">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={result.image} alt={photoAlt} className="aspect-[3/4] w-full rounded-lg object-cover" />
              {result.isSample && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-caption font-semibold text-ink-soft">
                  샘플 코디
                </span>
              )}
            </div>
            <p className="mt-4 text-meta text-ink-faint">{formatDate(result.createdAt)}</p>
            {conditionChips.length > 0 && <p className="mt-1 text-meta text-ink-soft">{conditionChips.join(" · ")}</p>}
          </aside>

          <div className="min-w-0">
            {/* ── ANSWER ──────────────────────────────────────────────── */}
            <section aria-labelledby="verdict" className="animate-fade-up">
              <div className="grid grid-cols-[auto_1fr] items-center gap-x-5 gap-y-5 md:gap-x-8">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.image} alt={photoAlt} className="aspect-[3/4] w-24 rounded-sm object-cover md:hidden" />
                <ScoreRing score={result.overallScore} size={120} />
                <div className="col-span-2 md:col-span-1 md:col-start-2 md:row-start-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta font-semibold text-rose-deep">
                    {occ.label} 코디 적합도
                    <span className="rounded-full border border-linen px-2 py-px text-caption font-medium text-ink-faint">
                      데모 분석
                    </span>
                  </p>
                  <h1 id="verdict" className="mt-1.5 font-display text-section font-semibold text-ink md:text-page">
                    {verdict}
                  </h1>
                  <p className="mt-1 text-meta text-ink-faint md:hidden">
                    {formatDate(result.createdAt)}
                    {conditionChips.length > 0 && ` · ${conditionChips.join(" · ")}`}
                  </p>
                </div>
              </div>

              {/* ── WHY ───────────────────────────────────────────────── */}
              <ul className="mt-6 space-y-2.5 border-t border-linen pt-5" aria-label="핵심 이유">
                <li className="flex items-start gap-3 text-body text-ink">
                  <Check className="mt-1 h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                  {keyGood.title}
                </li>
                <li className="flex items-start gap-3 text-body text-ink">
                  <span className="mt-[0.45rem] h-2 w-2 shrink-0 rounded-full bg-gold" aria-hidden />
                  {keyFix.title}
                </li>
                {keyNote && (
                  <li className="flex items-start gap-3 text-body text-ink">
                    <SlidersHorizontal className="mt-1 h-4 w-4 shrink-0 text-ink-faint" />
                    <span>
                      {keyNote.text}
                      <span className="sr-only"> (조건 반영 {signed(keyNote.impact)}점)</span>
                    </span>
                  </li>
                )}
              </ul>
            </section>

            {/* ── NEXT ACTION ─────────────────────────────────────────── */}
            <section
              aria-labelledby="next-action"
              className="mt-7 animate-fade-up rounded-md border border-rose-soft bg-blush p-5 md:p-6"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="next-action" className="text-meta font-semibold text-rose-deep">
                  한 가지만 바꾼다면
                </h2>
                <p className="whitespace-nowrap text-meta tabular-nums text-ink-soft">
                  {rec.scoreBefore}
                  <span className="mx-1 text-ink-faint" aria-label="에서">
                    →
                  </span>
                  <b className="font-display text-title font-semibold text-rose-deep">{rec.scoreAfter}</b>점
                </p>
              </div>
              <p className="mt-2 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-lead font-semibold">
                <span className="text-ink-faint line-through decoration-ink-faint/40">{rec.from}</span>
                <ArrowRight className="h-4 w-4 shrink-0 text-rose" aria-label="에서" />
                <span className="text-ink">{rec.to}</span>
              </p>
              <p className="mt-2 text-body-sm text-ink-soft">{rec.reason}</p>
              {wardrobe && (
                <p className="mt-3 flex items-center gap-2 text-meta text-ink-soft">
                  <Shirt className="h-4 w-4 shrink-0 text-rose-deep" />
                  <span>
                    {shared ? "옷장의 " : "내 옷장의 "}
                    <b className="font-semibold text-ink">{withEuro(wardrobe.itemName)}</b> 바로 바꿀 수 있어요
                  </span>
                </p>
              )}

              {shared ? (
                applied && (
                  <p className="mt-5 flex items-center gap-2 rounded-sm bg-white px-4 py-3 text-body-sm font-semibold text-ink">
                    <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                    추천대로 바꿔 입기로 했대요
                  </p>
                )
              ) : applied ? (
                <div className="mt-5 flex items-center justify-between gap-3 rounded-sm bg-white px-4 py-3" role="status">
                  <p className="flex items-center gap-2 text-body-sm font-semibold text-ink">
                    <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                    추천대로 바꿔 입기로 했어요
                  </p>
                  <button
                    type="button"
                    onClick={() => onApply(false)}
                    className="shrink-0 text-meta font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
                  >
                    되돌리기
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => onApply(true)} className="btn btn-md btn-primary mt-5 w-full">
                  추천대로 바꿔 입기
                </button>
              )}
            </section>

            {shared ? (
              <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                <Link href="/check" className="btn btn-md btn-primary sm:flex-1">
                  내 코디도 확인하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {result.sampleId && (
                  <Link href={`/check?sample=${result.sampleId}`} className="btn btn-md btn-secondary sm:flex-1">
                    같은 샘플로 해보기
                  </Link>
                )}
              </div>
            ) : (
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  onClick={onFavorite}
                  aria-pressed={result.favorite}
                  className={`btn btn-sm btn-secondary flex-1 ${result.favorite ? "border-rose-soft text-rose-deep" : ""}`}
                >
                  <Heart
                    className={`h-4 w-4 ${result.favorite ? "animate-heart-pop fill-rose text-rose" : "text-ink-soft"}`}
                  />
                  {result.favorite ? "저장됨" : "저장"}
                </button>
                <button type="button" onClick={onShare} className="btn btn-sm btn-secondary flex-1">
                  <Share2 className="h-4 w-4 text-ink-soft" />
                  친구에게 물어보기
                </button>
              </div>
            )}

            {/* ── OTHER WAYS ──────────────────────────────────────────── */}
            {otherWays.length > 0 && (
              <section aria-labelledby="alternatives" className="mt-12 border-t border-linen pt-8">
                <h2 id="alternatives" className="font-display text-title font-semibold text-ink">
                  다른 방법도 있어요
                </h2>
                <ul className="mt-3 divide-y divide-linen">
                  {otherWays.map((alt) => (
                    <li key={alt.name} className="flex items-center gap-4 py-4">
                      <div className="min-w-0 flex-1">
                        <p className="text-body font-semibold text-ink">{alt.summary}</p>
                        <p className="mt-0.5 text-meta text-ink-soft">
                          {alt.mood} · 아이템 {alt.changedItems}개 변경
                        </p>
                      </div>
                      <span className="shrink-0 whitespace-nowrap font-display text-title font-semibold tabular-nums text-ink">
                        {alt.fitScore}
                        <span className="ml-0.5 font-body text-meta font-normal text-ink-faint">점</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* ── DETAIL (progressive disclosure) ─────────────────────── */}
            <section className="mt-8 border-t border-linen">
              <button
                type="button"
                onClick={() => setDetailsOpen((o) => !o)}
                aria-expanded={detailsOpen}
                aria-controls="detail-panel"
                className="flex w-full items-center justify-between gap-4 py-5 text-left"
              >
                <span className="font-display text-title font-semibold text-ink">자세히 보기</span>
                <span className="flex items-center gap-1.5 text-meta font-semibold text-ink-soft">
                  <span className="hidden sm:inline">판정 근거 · 세부 점수 · 아이템별</span>
                  <span className="sm:hidden">{detailsOpen ? "접기" : "펼치기"}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${detailsOpen ? "rotate-180" : ""}`} />
                </span>
              </button>
              {detailsOpen && (
                <div id="detail-panel" className="animate-fade-in space-y-10 pb-4">
                  <div className="grid gap-8 lg:grid-cols-2">
                    <div>
                      <h3 className="text-meta font-semibold text-sage">잘 맞는 점</h3>
                      <ul className="mt-3 space-y-4">
                        {result.positives.map((p) => (
                          <li key={p.title}>
                            <p className="text-body font-semibold text-ink">{p.title}</p>
                            <p className="mt-1 text-body-sm text-ink-soft">{p.body}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <h3 className="text-meta font-semibold text-gold">바꾸면 좋은 점</h3>
                      <ul className="mt-3 space-y-4">
                        {result.improvements.map((p) => (
                          <li key={p.title}>
                            <p className="text-body font-semibold text-ink">{p.title}</p>
                            <p className="mt-1 text-body-sm text-ink-soft">{p.body}</p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {notes.length > 0 && (
                    <div>
                      <h3 className="text-meta font-semibold text-ink-soft">고른 조건이 바꾼 점수</h3>
                      <ul className="mt-3 divide-y divide-linen border-y border-linen">
                        {notes.map((n) => (
                          <li key={n.text} className="flex items-start justify-between gap-4 py-3">
                            <span className="text-body-sm text-ink">{n.text}</span>
                            <span
                              className={`shrink-0 whitespace-nowrap text-body-sm font-semibold tabular-nums ${
                                n.impact > 0 ? "text-sage" : "text-rose-deep"
                              }`}
                            >
                              {signed(n.impact)}점
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div>
                    <h3 className="mb-4 text-meta font-semibold text-ink-soft">세부 점수</h3>
                    <ScoreBreakdown scores={result.scores} />
                  </div>

                  <div>
                    <h3 className="text-meta font-semibold text-ink-soft">아이템별</h3>
                    <ul className="mt-2 divide-y divide-linen border-t border-linen">
                      {result.items.map((item) => {
                        const meta = STATUS_META[item.status];
                        const nameIsSlot = item.name === item.slot;
                        return (
                          <li key={item.slot} className="flex items-start gap-4 py-4">
                            <span className="w-16 shrink-0 pt-0.5 text-meta text-ink-faint">{item.slot}</span>
                            <div className="min-w-0 flex-1">
                              <p className="text-body-sm font-semibold text-ink">{nameIsSlot ? item.comment : item.name}</p>
                              {!nameIsSlot && <p className="mt-0.5 text-meta text-ink-soft">{item.comment}</p>}
                            </div>
                            <span className={`shrink-0 whitespace-nowrap pt-0.5 text-meta font-semibold ${meta.cls}`}>
                              {meta.label}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>
              )}
            </section>

            {/* ── NEXT STEPS ──────────────────────────────────────────── */}
            <div className="flex flex-col gap-2 border-t border-linen pt-8 sm:flex-row">
              <Link href={`/guide#${result.occasion}`} className="btn btn-sm btn-secondary sm:flex-1">
                <BookOpen className="h-4 w-4 text-ink-soft" />
                {occ.label} 스타일 가이드
              </Link>
              {!shared && (
                <Link href="/check" className="btn btn-sm btn-secondary sm:flex-1">
                  <RefreshCw className="h-4 w-4 text-ink-soft" />
                  다른 코디 확인하기
                </Link>
              )}
            </div>

            <p className="mt-8 text-meta text-ink-faint">
              규칙 기반 데모 엔진이 만든 예시 결과예요. 사진을 실제로 인식하지 않으며, 이미지 인식 AI를 연동하면 같은
              화면 구조로 실제 분석 결과를 보여줘요.
            </p>
          </div>
        </div>
      </div>

      <SampleBridgeCTA maxWidthClass="max-w-6xl" />
    </>
  );
}
