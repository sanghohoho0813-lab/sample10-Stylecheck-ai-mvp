"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, Check, Heart, Lightbulb, Trash2 } from "lucide-react";
import { DEMO_SAMPLES } from "@/lib/demo-samples";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import { useToast } from "@/components/Toast";
import { deleteAnalysis, listAnalyses, restoreAnalysis, toggleFavorite } from "@/lib/storage";
import { OCCASION_MAP } from "@/lib/occasions";
import { MIN_RECORDS, styleInsights } from "@/lib/insights";
import { verdictFor } from "@/lib/style-engine";
import { formatRelativeDay } from "@/lib/utils";
import type { AnalysisResult } from "@/lib/types";
import LookImage from "@/components/LookImage";

type Filter = "all" | "favorite" | "applied";

const FILTERS: { id: Filter; label: string; empty: { title: string; body: string } }[] = [
  { id: "all", label: "전체", empty: { title: "아직 확인한 코디가 없어요", body: "사진 한 장이면 1분 안에 확인할 수 있어요." } },
  {
    id: "favorite",
    label: "저장한 코디",
    empty: { title: "저장한 코디가 없어요", body: "결과 화면에서 ‘저장’을 누르면 여기에 모여요." },
  },
  {
    id: "applied",
    label: "바꿔 입음",
    empty: { title: "아직 바꿔 입은 코디가 없어요", body: "결과 화면에서 ‘추천대로 바꿔 입기’를 누르면 여기에 남아요." },
  },
];

const matches = (a: AnalysisResult, f: Filter) =>
  f === "favorite" ? a.favorite : f === "applied" ? Boolean(a.appliedAt) : true;

export default function HistoryView() {
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();
  const initial = params.get("filter");
  const [filter, setFilter] = useState<Filter>(initial === "favorite" || initial === "applied" ? initial : "all");
  const [items, setItems] = useState<AnalysisResult[] | null>(null);

  useEffect(() => {
    setItems(listAnalyses());
  }, []);

  const changeFilter = (f: Filter) => {
    setFilter(f);
    // Keep the URL shareable / back-button friendly without adding history entries
    router.replace(f === "all" ? "/history" : `/history?filter=${f}`, { scroll: false });
  };

  const onFavorite = (id: string) => {
    toggleFavorite(id);
    setItems(listAnalyses());
  };

  const onDelete = (id: string) => {
    const removed = deleteAnalysis(id);
    setItems(listAnalyses());
    if (!removed) return;
    toast("기록을 삭제했어요", "info", {
      label: "되돌리기",
      onClick: () => {
        restoreAnalysis(removed.record, removed.index);
        setItems(listAnalyses());
      },
    });
  };

  const visible = (items ?? []).filter((a) => matches(a, filter));
  const active = FILTERS.find((f) => f.id === filter)!;
  const total = items?.length ?? 0;
  const insights = items ? styleInsights(items) : [];

  return (
    <>
      <div className="mx-auto max-w-4xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
        <h1 className="font-display text-page font-semibold text-ink">스타일 기록</h1>
        <p className="mt-2 text-body text-ink-soft">어디에 입고 갔고, 무엇을 바꿨는지 모아뒀어요.</p>

        {(items === null || total > 0) && (
          <div role="tablist" aria-label="기록 필터" className="no-scrollbar -mx-5 mt-6 flex gap-2 overflow-x-auto px-5">
            {FILTERS.map((f) => {
              const count = (items ?? []).filter((a) => matches(a, f.id)).length;
              const on = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => changeFilter(f.id)}
                  className={`inline-flex h-10 shrink-0 items-center gap-1.5 rounded-full px-4 text-body-sm font-semibold transition-colors duration-150 ${
                    on ? "bg-ink text-white" : "border border-linen bg-white text-ink-soft hover:text-ink"
                  }`}
                >
                  {f.label}
                  {items && <span className={`tabular-nums ${on ? "text-white/70" : "text-ink-faint"}`}>{count}</span>}
                </button>
              );
            })}
          </div>
        )}

        {items === null ? (
          <div className="mt-6 grid min-h-[100svh] content-start gap-3 sm:grid-cols-2" aria-busy="true">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton h-[8.5rem] rounded-md" />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="mt-16 flex flex-col items-center text-center">
            <h2 className="font-display text-title font-semibold text-ink">{active.empty.title}</h2>
            <p className="mt-2 text-body-sm text-ink-soft">{active.empty.body}</p>
            {total > 0 ? (
              // Records exist, just not under this filter — the useful next step is to see them.
              <button type="button" onClick={() => changeFilter("all")} className="btn btn-md btn-secondary mt-7">
                전체 기록 보기
              </button>
            ) : (
              <div className="mt-7 flex flex-col items-center gap-3">
                <Link href="/check" className="btn btn-md btn-primary">
                  오늘 코디 확인하기
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href={`/check?sample=${DEMO_SAMPLES[0].id}`}
                  className="text-body-sm font-semibold text-ink-soft underline underline-offset-4 hover:text-ink"
                >
                  사진이 없다면 샘플로 체험하기
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {filter === "all" &&
              (insights.length > 0 ? (
                <section aria-labelledby="patterns" className="mt-6 rounded-md border border-linen bg-white px-5 py-4">
                  <h2 id="patterns" className="flex items-center gap-2 text-meta font-semibold text-ink">
                    <Lightbulb className="h-4 w-4 text-gold" />내 스타일 패턴
                  </h2>
                  <ul className="mt-2 space-y-1.5">
                    {insights.map((i) => (
                      <li key={i.id} className="text-body-sm text-ink-soft">
                        {i.text}
                      </li>
                    ))}
                  </ul>
                </section>
              ) : (
                total < MIN_RECORDS && (
                  <p className="mt-6 text-meta text-ink-faint">
                    기록이 {MIN_RECORDS}개 이상 쌓이면 자주 보이는 패턴을 알려드려요. (지금 {total}개)
                  </p>
                )
              ))}
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {visible.map((a, index) => {
                const occ = OCCASION_MAP[a.occasion];
                const applied = Boolean(a.appliedAt);
                return (
                  <li
                    key={a.id}
                    className="group relative flex gap-4 rounded-md border border-linen bg-white p-3 transition-colors duration-150 hover:border-rose-soft"
                  >
                    <Link
                      href={`/result/${a.id}`}
                      className="absolute inset-0 z-0 rounded-md"
                      aria-label={`${formatRelativeDay(a.createdAt)} ${occ.label} 판정 결과 보기`}
                    />
                    <LookImage src={a.image} alt="" sizes="80px" className="w-20 shrink-0 rounded-sm" priority={index < 2} />
                    <div className="min-w-0 flex-1 py-0.5">
                      <p className="text-meta text-ink-faint">
                        {formatRelativeDay(a.createdAt)} · <span className="font-semibold text-rose-deep">{occ.label}</span>
                        <span className="tabular-nums"> · {a.overallScore}점</span>
                      </p>
                      <p className="mt-1 text-body font-semibold text-ink">{verdictFor(a.overallScore)}</p>
                      <p className="mt-1 line-clamp-2 text-meta text-ink-soft">
                        <span className="text-ink-faint">한 가지 </span>
                        {a.primaryRecommendation.from} → {a.primaryRecommendation.to}
                      </p>
                      {applied && (
                        <p className="mt-2 inline-flex items-center gap-1 whitespace-nowrap rounded-full bg-sage/10 px-2.5 py-0.5 text-meta font-semibold tabular-nums text-sage">
                          <Check className="h-3.5 w-3.5" strokeWidth={2.75} />
                          바꿔 입음 {a.primaryRecommendation.scoreBefore}→{a.primaryRecommendation.scoreAfter}
                        </p>
                      )}
                    </div>
                    <div className="relative z-10 flex flex-col items-center justify-between">
                      <button
                        type="button"
                        onClick={() => onFavorite(a.id)}
                        aria-pressed={a.favorite}
                        aria-label={a.favorite ? "저장 해제" : "저장하기"}
                        className="flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-blush"
                      >
                        <Heart className={`h-[1.15rem] w-[1.15rem] ${a.favorite ? "fill-rose text-rose" : "text-ink-faint"}`} />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(a.id)}
                        aria-label="기록 삭제"
                        className="flex h-10 w-10 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-blush hover:text-danger md:opacity-0 md:focus-visible:opacity-100 md:group-hover:opacity-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>

      {/* Only once records are in, so loading never pushes it around */}
      {items !== null && <SampleBridgeCTA maxWidthClass="max-w-4xl" />}
    </>
  );
}
