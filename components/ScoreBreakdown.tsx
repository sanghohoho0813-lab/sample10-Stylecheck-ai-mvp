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
        // Phones stack the caption above a full-width bar; from sm up the
        // label / bar / value sit on one line as in the reference layout.
        <div key={key} className="sm:flex sm:items-center sm:gap-3">
          <div className="flex items-baseline justify-between gap-2 sm:contents">
            <span className="text-[0.8125rem] font-medium text-ink-soft sm:w-24 sm:shrink-0">
              {DIMENSION_LABELS[key]}
            </span>
            <span className="text-[0.8125rem] font-semibold text-ink sm:order-last sm:w-12 sm:shrink-0 sm:text-right">
              {value}
              <span className="font-normal text-ink-faint">/100</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-blush-deep/60 sm:mt-0 sm:flex-1">
            <div
              className="bar-fill h-full rounded-full bg-gradient-to-r from-rose-soft to-rose"
              style={{ width: mounted ? `${value}%` : "0%" }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
