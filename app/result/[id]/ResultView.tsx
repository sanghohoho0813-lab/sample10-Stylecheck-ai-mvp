"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Camera,
  Check,
  ChevronDown,
  Heart,
  Share2,
  Shirt,
  SlidersHorizontal,
} from "lucide-react";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import ScoreRing from "@/components/ScoreRing";
import ScoreBreakdown from "@/components/ScoreBreakdown";
import { useToast } from "@/components/Toast";
import { adviceFor, changeClauses, shareMessage } from "@/lib/advice";
import { resultFromShare, shareUrl } from "@/lib/share";
import { getAnalysis, setDraft, setRecommendationApplied, toggleFavorite } from "@/lib/storage";
import { OCCASION_MAP, SEASONS } from "@/lib/occasions";
import { formatDate, withEuro } from "@/lib/utils";
import type { AnalysisResult, ItemStatus } from "@/lib/types";
import LookImage from "@/components/LookImage";

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
      // Mirrors the result layout and holds the footer below the fold, so the
      // page does not jump when the record arrives from storage.
      <div key="loading" className="mx-auto min-h-[100svh] max-w-6xl px-5 pb-10 pt-6 md:px-8 md:pt-10" aria-busy="true">
        <div className="md:grid md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 lg:gap-16">
          <div className="skeleton hidden aspect-[3/4] rounded-lg md:block" />
          <div>
            <div className="flex gap-4 md:block">
              <div className="skeleton aspect-[3/4] w-[38%] max-w-[10rem] shrink-0 rounded-md md:hidden" />
              <div className="flex-1 space-y-3 pt-1">
                <div className="skeleton h-4 w-32 rounded-full" />
                <div className="skeleton h-8 w-full max-w-sm rounded-full" />
                <div className="skeleton h-14 w-14 rounded-full" />
              </div>
            </div>
            <div className="mt-5 space-y-2.5">
              <div className="skeleton h-5 w-full max-w-md rounded-full" />
              <div className="skeleton h-5 w-2/3 rounded-full" />
            </div>
            <div className="mt-8 space-y-3">
              <div className="skeleton h-5 w-56 rounded-full" />
              <div className="skeleton h-5 w-48 rounded-full" />
            </div>
            <div className="skeleton mt-8 h-80 rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      // Same reserved height as the loading state — the footer does not jump up.
      // Its own key: a new box, not the skeleton's box resized (which reads as a layout shift).
      <div key="missing" className="mx-auto min-h-[100svh] max-w-md px-5 pb-20 pt-20 text-center">
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
  const advice = adviceFor(result);
  const { effect } = changeClauses(rec);
  const gain = rec.scoreAfter - rec.scoreBefore;
  const notes = result.conditionNotes ?? [];
  const keyNote = notes[0];
  // Reasons are strengths (+ how the user's conditions counted). What to
  // change is the card right below — a generic "바꾸면 좋은 점" line here could
  // only repeat or contradict it.
  const strengths = result.positives.slice(0, keyNote ? 1 : 2);
  const wardrobe = result.wardrobeSuggestion;
  // The first alternative is the primary recommendation itself
  const otherWays = result.alternatives.slice(1);
  const shownScore = applied ? rec.scoreAfter : result.overallScore;

  const onFavorite = () => {
    const nowFav = toggleFavorite(result.id);
    setResult({ ...result, favorite: nowFav });
    toast(nowFav ? "저장한 코디에 담았어요" : "저장한 코디에서 뺐어요", nowFav ? "success" : "info");
  };

  const onApply = (next: boolean) => {
    const updated = setRecommendationApplied(result.id, next);
    if (!updated) return;
    setResult({ ...updated });
    if (!next) toast("바꿔 입기를 취소했어요", "info");
  };

  const onShare = async () => {
    const url = shareUrl(result, window.location.origin);
    const text = shareMessage(result);
    try {
      if (navigator.share) {
        await navigator.share({ title: "이 코디 어때?", text, url });
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

  /** Same situation and answers, new photo — the before-going-out loop. */
  const checkAgain = () => {
    setDraft({
      image: null,
      photo: null,
      sampleId: null,
      occasion: result.occasion,
      conditions: result.conditions,
      moodFromPrefs: false,
    });
    router.push("/check?from=again");
  };

  const seasonLabel = SEASONS.find((s) => s.id === result.conditions.season)?.label;
  const context = [occ.label, result.conditions.companion, result.conditions.place, result.conditions.mood, seasonLabel]
    .filter(Boolean)
    .join(" · ");
  const photoAlt = shared ? "공유된 코디" : "확인한 코디 사진";
  const isUpload = !result.isSample;

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
          {/* ── Photo (desktop) — the outfit is the biggest thing on the page ── */}
          <aside className="hidden md:sticky md:top-24 md:block md:self-start">
            <div className="relative">
              <LookImage
                src={result.image}
                alt={photoAlt}
                sizes="(min-width: 1280px) 430px, 38vw"
                className="w-full rounded-lg"
                priority
              />
              {result.isSample && (
                <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-caption font-semibold text-ink-soft">
                  샘플 코디
                </span>
              )}
            </div>
            <p className="mt-4 text-meta text-ink-faint">{formatDate(result.createdAt)}</p>
          </aside>

          <div className="min-w-0">
            {/* ── 1. 괜찮은가 ───────────────────────────────────────────── */}
            <section aria-labelledby="verdict" className="animate-fade-up">
              <div className="flex gap-4 md:block">
                <LookImage
                  src={result.image}
                  alt={photoAlt}
                  sizes="160px"
                  className="w-[38%] max-w-[10rem] shrink-0 self-start rounded-md md:hidden"
                  priority
                />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-ink-soft">
                    <span className="font-semibold text-rose-deep">{occ.label}</span>
                    <span className="rounded-full border border-linen px-2 py-px text-caption font-medium text-ink-faint">
                      데모 분석
                    </span>
                  </p>
                  <h1
                    id="verdict"
                    className="mt-2 font-display text-section font-semibold leading-tight text-ink md:text-page"
                  >
                    {advice.headline}
                  </h1>
                  <div className="mt-4 flex items-center gap-3">
                    <ScoreRing score={shownScore} size={60} stroke={6} />
                    <p className="text-meta leading-snug text-ink-soft">
                      {applied ? (
                        <>
                          바꿔 입은 후 적합도
                          <br />
                          <span className="tabular-nums text-ink-faint">처음 {rec.scoreBefore}점에서 +{gain}</span>
                        </>
                      ) : (
                        <>
                          {occ.label} 적합도
                          <br />
                          <span className="tabular-nums text-ink-faint">한 가지 바꾸면 {rec.scoreAfter}점</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              {/* ── 2. 왜 · 3. 뭘 바꾸면 — said the way a friend would ── */}
              <p className="mt-5 text-lead text-ink">{advice.advice}</p>
              <p className="mt-2 text-meta text-ink-faint">
                {context}
                {isUpload && " · 사진을 인식하지 않은 규칙 기반 예시예요"}
              </p>

              <h2 className="sr-only">판단 이유</h2>
              <ul className="mt-6 space-y-2.5 border-t border-linen pt-5" aria-label="핵심 이유">
                {strengths.map((p) => (
                  <li key={p.title} className="flex items-start gap-3 text-body text-ink">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                    {p.title}
                  </li>
                ))}
                {keyNote && (
                  <li className="flex items-start gap-3 text-body text-ink">
                    <SlidersHorizontal
                      className={`mt-1 h-4 w-4 shrink-0 ${keyNote.impact > 0 ? "text-sage" : "text-gold"}`}
                    />
                    <span>
                      {keyNote.text}
                      <span className="sr-only"> (조건 반영 {signed(keyNote.impact)}점)</span>
                    </span>
                  </li>
                )}
              </ul>
            </section>

            {/* ── 한 가지만 바꾼다면 — the product's point ─────────────────── */}
            <section
              aria-labelledby="next-action"
              className={`mt-8 animate-fade-up rounded-lg border bg-white p-5 shadow-subtle transition-colors duration-300 md:p-6 ${
                applied ? "border-sage/40" : "border-linen"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 id="next-action" className="text-meta font-semibold text-rose-deep">
                  {applied ? (shared ? "친구가 바꾼 한 가지" : "바꿔 입은 한 가지") : "한 가지만 바꾼다면"}
                </h2>
                <span className="rounded-full bg-blush px-2.5 py-0.5 text-meta font-semibold tabular-nums text-rose-deep">
                  {rec.scoreBefore} → {rec.scoreAfter}점
                </span>
              </div>

              {/* 지금 → 바꿀 것 */}
              <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-2">
                <div className="rounded-md bg-cream px-3.5 py-3">
                  <p className="text-caption text-ink-faint">지금{rec.slot && ` · ${rec.slot}`}</p>
                  <p
                    className={`mt-1 text-body font-semibold ${
                      applied ? "text-ink-faint line-through decoration-ink-faint/50" : "text-ink-soft"
                    }`}
                  >
                    {rec.from}
                  </p>
                </div>
                <ArrowRight className="h-4 w-4 self-center text-rose" aria-label="에서" />
                <div className={`rounded-md px-3.5 py-3 ${applied ? "bg-sage/10" : "bg-blush"}`}>
                  <p className={`flex items-center gap-1 text-caption ${applied ? "text-sage" : "text-rose-deep"}`}>
                    {applied && <Check className="h-3.5 w-3.5" strokeWidth={2.75} />}
                    {applied ? "바꿔 입음" : "바꿀 것"}
                  </p>
                  <p className="mt-1 text-body font-semibold text-ink">{rec.to}</p>
                </div>
              </div>

              <dl className="mt-5 space-y-3 text-body-sm">
                <div className="grid gap-0.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                  <dt className="font-semibold text-ink">왜</dt>
                  <dd className="text-ink-soft">{rec.reason}</dd>
                </div>
                <div className="grid gap-0.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                  <dt className="font-semibold text-ink">달라지는 점</dt>
                  <dd className="text-ink-soft">
                    {effect}. 적합도가 <b className="font-semibold tabular-nums text-ink">+{gain}점</b> 올라가요.
                  </dd>
                </div>
                {wardrobe && (
                  <div className="grid gap-0.5 sm:grid-cols-[5.5rem_minmax(0,1fr)] sm:gap-3">
                    <dt className="font-semibold text-ink">{shared ? "옷장" : "내 옷장"}</dt>
                    <dd className="flex items-start gap-1.5 text-ink-soft">
                      <Shirt className="mt-0.5 h-4 w-4 shrink-0 text-rose-deep" />
                      <span>
                        <b className="font-semibold text-ink">{withEuro(wardrobe.itemName)}</b> 바로 바꿀 수 있어요
                      </span>
                    </dd>
                  </div>
                )}
              </dl>

              {shared ? (
                applied && (
                  <p className="mt-5 flex items-center gap-2 rounded-md bg-sage/10 px-4 py-3 text-body-sm font-semibold text-ink">
                    <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
                    친구는 추천대로 바꿔 입었어요
                  </p>
                )
              ) : applied ? (
                <div className="mt-5 animate-fade-up rounded-md bg-sage/10 px-4 py-4" role="status">
                  <p className="flex items-center gap-2 text-body font-semibold text-ink">
                    <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={2.75} />
                    추천대로 바꿔 입었어요
                  </p>
                  <p className="mt-1 text-body-sm text-ink-soft">
                    오늘 {occ.label} 코디를 <b className="font-semibold tabular-nums text-ink">{rec.scoreAfter}점</b>으로
                    기록에 남겼어요.
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-meta font-semibold">
                    <Link href="/history?filter=applied" className="text-rose-deep underline-offset-4 hover:underline">
                      기록에서 보기
                    </Link>
                    <button
                      type="button"
                      onClick={() => onApply(false)}
                      className="text-ink-soft underline underline-offset-4 hover:text-ink"
                    >
                      되돌리기
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <button type="button" onClick={() => onApply(true)} className="btn btn-md btn-primary mt-5 w-full">
                    추천대로 바꿔 입기
                  </button>
                  <p className="mt-2 text-center text-meta text-ink-faint">누르면 오늘 코디가 {rec.scoreAfter}점으로 기록돼요</p>
                </>
              )}

              {otherWays.length > 0 && !applied && (
                <details className="group mt-5 border-t border-linen pt-1">
                  <summary className="flex cursor-pointer list-none items-center justify-between py-3 text-body-sm font-semibold text-ink [&::-webkit-details-marker]:hidden">
                    <span>
                      {wardrobe ? "이게 없다면" : "다른 방법"} <span className="font-normal text-ink-faint">· {otherWays.length}가지</span>
                    </span>
                    <ChevronDown className="h-4 w-4 text-ink-soft transition-transform duration-200 group-open:rotate-180" />
                  </summary>
                  <ul className="divide-y divide-linen">
                    {otherWays.map((alt) => (
                      <li key={alt.name} className="flex items-center gap-4 py-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-body-sm font-semibold text-ink">{alt.summary}</p>
                          <p className="mt-0.5 text-meta text-ink-soft">
                            {alt.mood} · 아이템 {alt.changedItems}개 변경
                          </p>
                        </div>
                        <span className="shrink-0 whitespace-nowrap text-body-sm font-semibold tabular-nums text-ink-soft">
                          {alt.fitScore}점
                        </span>
                      </li>
                    ))}
                  </ul>
                </details>
              )}
            </section>

            {shared ? (
              <div className="mt-4 flex flex-col gap-2 lg:flex-row">
                <Link href="/check" className="btn btn-md btn-primary lg:flex-1">
                  내 코디도 확인하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                {result.sampleId && (
                  <Link href={`/check?sample=${result.sampleId}`} className="btn btn-md btn-secondary lg:flex-1">
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

            {/* ── DETAIL (progressive disclosure) ─────────────────────── */}
            <section className="mt-10 border-t border-linen">
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
                      <h3 className="text-meta font-semibold text-gold">더 다듬어 볼 점</h3>
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
            <div className="flex flex-col gap-2 border-t border-linen pt-8 lg:flex-row">
              {!shared && (
                // Once the change is made, checking the new look is the next thing to do
                <button
                  type="button"
                  onClick={checkAgain}
                  className={`btn lg:flex-1 ${applied ? "btn-md btn-primary" : "btn-sm btn-secondary"}`}
                >
                  <Camera className={`h-4 w-4 ${applied ? "" : "text-ink-soft"}`} />
                  바꿔 입고 다시 확인하기
                </button>
              )}
              <Link
                href={`/guide#${result.occasion}`}
                className={`btn btn-secondary lg:flex-1 ${applied && !shared ? "btn-md" : "btn-sm"}`}
              >
                <BookOpen className="h-4 w-4 text-ink-soft" />
                {occ.label} 스타일 가이드
              </Link>
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
