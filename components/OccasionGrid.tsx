"use client";

import { Check } from "lucide-react";
import { OCCASIONS } from "@/lib/occasions";
import type { OccasionId } from "@/lib/types";

interface Props {
  selected: OccasionId | null;
  onSelect: (id: OccasionId) => void;
  error: string | null;
}

export default function OccasionGrid({ selected, onSelect, error }: Props) {
  return (
    <div className="animate-fade-up">
      <h2 className="font-display text-[1.6rem] font-semibold leading-snug text-ink md:text-3xl">
        어디에 입고 가시나요?
      </h2>
      <p className="mt-2 text-sm text-ink-soft">상황에 따라 격식과 스타일 기준이 달라져요.</p>

      <div className="mt-6 grid grid-cols-3 gap-2.5 md:grid-cols-4 md:gap-3.5">
        {OCCASIONS.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onSelect(o.id)}
              aria-pressed={active}
              className={`relative flex flex-col items-center justify-center gap-1.5 rounded-card border py-4.5 transition-all duration-200 md:py-6 ${
                active
                  ? "border-rose bg-blush shadow-rose/40 shadow-md scale-[1.02]"
                  : "border-linen bg-white hover:border-rose-soft hover:bg-blush/40"
              }`}
            >
              {active && (
                <span className="absolute right-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
              <span className="text-2xl md:text-[1.7rem]">{o.emoji}</span>
              <span className={`text-[13px] font-semibold md:text-sm ${active ? "text-rose-deep" : "text-ink"}`}>
                {o.label}
              </span>
            </button>
          );
        })}
      </div>

      {selected && (
        <p className="mt-4 animate-fade-in rounded-2xl bg-white px-4 py-3 text-center text-[13px] text-ink-soft border border-linen">
          {OCCASIONS.find((o) => o.id === selected)?.description}
        </p>
      )}
      {error && (
        <p className="mt-3 rounded-2xl bg-rose-soft/60 px-4 py-2.5 text-center text-[13px] font-medium text-rose-deep">
          {error}
        </p>
      )}
    </div>
  );
}
