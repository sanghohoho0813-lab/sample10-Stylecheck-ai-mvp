"use client";

import { useEffect, useState } from "react";
import type { ScoreSet } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/style-engine";

export default function ScoreBreakdown({ scores }: { scores: ScoreSet }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const entries = Object.entries(scores) as [keyof ScoreSet, number][];

  return (
    <dl className="space-y-4">
      {entries.map(([key, value]) => (
        // Phones stack the caption above a full-width bar; from sm up the
        // label / bar / value sit on one line.
        <div key={key} className="sm:flex sm:items-center sm:gap-4">
          <div className="flex items-baseline justify-between gap-2 sm:contents">
            <dt className="text-body-sm text-ink-soft sm:w-28 sm:shrink-0">{DIMENSION_LABELS[key]}</dt>
            <dd className="whitespace-nowrap text-body-sm font-semibold tabular-nums text-ink sm:order-last sm:w-14 sm:shrink-0 sm:text-right">
              {value}
              <span className="font-normal text-ink-faint">/100</span>
            </dd>
          </div>
          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blush-deep sm:mt-0 sm:flex-1" aria-hidden>
            <div className="bar-fill h-full rounded-full bg-rose" style={{ width: mounted ? `${value}%` : "0%" }} />
          </div>
        </div>
      ))}
    </dl>
  );
}
