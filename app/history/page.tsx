"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Heart, Trash2 } from "lucide-react";
import { deleteAnalysis, listAnalyses, toggleFavorite } from "@/lib/storage";
import { OCCASION_MAP } from "@/lib/occasions";
import { formatShortDate } from "@/lib/utils";
import { useToast } from "@/components/Toast";
import type { AnalysisResult } from "@/lib/types";

type Filter = "all" | "favorite";

export default function HistoryPage() {
  const toast = useToast();
  const [items, setItems] = useState<AnalysisResult[] | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    setItems(listAnalyses());
  }, []);

  const visible = (items ?? []).filter((a) => (filter === "favorite" ? a.favorite : true));

  const onFavorite = (id: string) => {
    toggleFavorite(id);
    setItems(listAnalyses());
  };

  const onDelete = (id: string) => {
    deleteAnalysis(id);
    setItems(listAnalyses());
    toast("기록을 삭제했어요.", "info");
  };

  return (
    <div className="mx-auto max-w-4xl px-5 pb-16 pt-10 md:px-8 md:pt-14">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl font-semibold text-ink md:text-4xl">스타일 기록</h1>
          <p className="mt-2 text-sm text-ink-soft">확인했던 코디와 점수를 다시 볼 수 있어요.</p>
        </div>
      </div>

      <div className="mt-6 flex gap-2">
        {(
          [
            { id: "all", label: "전체" },
            { id: "favorite", label: "저장한 코디" },
          ] as { id: Filter; label: string }[]
        ).map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`rounded-full px-4 py-2 text-[0.8125rem] font-semibold transition-colors duration-200 ${
              filter === f.id ? "bg-ink text-white" : "border border-linen bg-white text-ink-soft hover:bg-blush/60"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {items === null ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div className="skeleton h-32 rounded-card" />
          <div className="skeleton h-32 rounded-card" />
        </div>
      ) : visible.length === 0 ? (
        <div className="mt-14 flex flex-col items-center text-center">
          <p className="text-5xl">🧥</p>
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">
            {filter === "favorite" ? "저장한 코디가 없어요" : "아직 확인한 코디가 없어요"}
          </h2>
          <p className="mt-2 text-sm text-ink-soft">
            {filter === "favorite"
              ? "마음에 드는 결과에서 저장하기를 눌러보세요."
              : "사진 한 장이면 1분 안에 확인할 수 있어요."}
          </p>
          <Link
            href="/check"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-semibold text-white shadow-rose transition-colors hover:bg-rose-deep"
          >
            오늘 코디 확인하기
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {visible.map((a, i) => {
            const occ = OCCASION_MAP[a.occasion];
            return (
              <div
                key={a.id}
                className="group animate-fade-up relative flex min-w-0 gap-3 rounded-card border border-linen bg-white p-3.5 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift sm:gap-4"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Link href={`/result/${a.id}`} className="absolute inset-0 z-0 rounded-card" aria-label={`${occ.label} 분석 결과 보기`} />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={a.image} alt="" className="aspect-[3/4] w-16 shrink-0 rounded-xl object-cover sm:w-20" />
                <div className="min-w-0 flex-1 py-1">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.6875rem] text-ink-faint">
                    <span>{formatShortDate(a.createdAt)}</span>
                    <span className="rounded-full bg-blush px-2 py-0.5 font-semibold text-rose-deep">
                      {occ.emoji} {occ.label}
                    </span>
                  </div>
                  <p className="mt-1.5 font-display text-2xl font-semibold text-ink">
                    {a.overallScore}
                    <span className="text-xs font-normal text-ink-faint">점</span>
                  </p>
                  <p className="mt-1 line-clamp-2 text-[0.75rem] leading-snug text-ink-soft">{a.summary}</p>
                </div>
                <div className="z-10 flex flex-col items-center justify-between py-1">
                  <button
                    type="button"
                    onClick={() => onFavorite(a.id)}
                    aria-label={a.favorite ? "저장 해제" : "저장하기"}
                    className="rounded-full p-1.5 transition-colors hover:bg-blush"
                  >
                    <Heart className={`h-4.5 w-4.5 ${a.favorite ? "fill-rose text-rose" : "text-ink-faint"}`} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(a.id)}
                    aria-label="기록 삭제"
                    className="rounded-full p-1.5 text-ink-faint opacity-0 transition-all hover:bg-blush hover:text-rose-deep group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
