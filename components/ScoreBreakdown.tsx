"use client";

import { useEffect, useState } from "react";
import type { ScoreSet } from "@/lib/types";
import { DIMENSION_LABELS } from "@/lib/style-engine";

interface Props {
  scores: ScoreSet;
  /** The dimension the one change improves — tied back to the card above */
  focus?: keyof ScoreSet;
}

export default function ScoreBreakdown({ scores, focus }: Props) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 120);
    return () => clearTimeout(t);
  }, []);

  const entries = Object.entries(scores) as [keyof ScoreSet, number][];

  return (
    <ul className="space-y-4">
      {entries.map(([key, value]) => {
        const focused = key === focus;
        return (
          // Phones stack the caption above a full-width bar; from sm up the
          // label / bar / value sit on one line.
          <li key={key} className="sm:flex sm:items-center sm:gap-4">
            <div className="flex items-baseline justify-between gap-2 sm:contents">
              <span className={`text-body-sm sm:w-28 sm:shrink-0 ${focused ? "font-semibold text-ink" : "text-ink-soft"}`}>
                {DIMENSION_LABELS[key]}
                {focused && (
                  <span className="mt-0.5 block text-caption font-semibold text-rose-deep">추천이 올려주는 항목</span>
                )}
              </span>
              <span className="whitespace-nowrap text-body-sm font-semibold tabular-nums text-ink sm:order-last sm:w-14 sm:shrink-0 sm:text-right">
                {value}
                <span className="font-normal text-ink-faint">/100</span>
              </span>
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-blush-deep sm:mt-0 sm:flex-1" aria-hidden>
              <div
                className={`bar-fill h-full rounded-full ${focus && !focused ? "bg-rose/45" : "bg-rose"}`}
                style={{ width: mounted ? `${value}%` : "0%" }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
