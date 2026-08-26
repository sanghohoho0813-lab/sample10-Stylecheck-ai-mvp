"use client";

import { useEffect, useState } from "react";
import type { ScoreSet } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/style-engine";

export default function ScoreBreakdown({ scores }: { scores: ScoreSet }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 150);
    return () => clearTimeout(t);
  }, []);

  const entries = Object.entries(scores) as [keyof ScoreSet, number][];

  return (
    <div className="space-y-4">
      {entries.map(([key, value]) => (
        <div key={key} className="flex items-center gap-3">
          <span className="w-24 shrink-0 text-[13px] font-medium text-ink-soft">{DIMENSION_LABELS[key]}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-blush-deep/60">
            <div
              className="bar-fill h-full rounded-full bg-gradient-to-r from-rose-soft to-rose"
              style={{ width: mounted ? `${value}%` : "0%" }}
            />
          </div>
          <span className="w-12 shrink-0 text-right text-[13px] font-semibold text-ink">
            {value}
            <span className="font-normal text-ink-faint">/100</span>
          </span>
        </div>
      ))}
    </div>
  );
}
