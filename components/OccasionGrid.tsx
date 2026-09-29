"use client";

import { Check } from "lucide-react";
import { OCCASIONS, OCCASION_MAP } from "@/lib/occasions";
import type { OccasionId } from "@/lib/types";
import { OccasionIcon, OccasionLabel } from "./OccasionIcon";

interface Props {
  selected: OccasionId | null;
  onSelect: (id: OccasionId) => void;
  error: string | null;
}

export default function OccasionGrid({ selected, onSelect, error }: Props) {
  return (
    <div className="animate-fade-up">
      <h1 className="font-display text-section font-semibold text-ink md:text-page">어디에 입고 가시나요?</h1>
      <p className="mt-2 text-body text-ink-soft">자리마다 적절한 격식과 분위기가 달라요.</p>

      <div role="radiogroup" aria-label="상황 선택" className="mt-7 grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3">
        {OCCASIONS.map((o) => {
          const active = selected === o.id;
          return (
            <button
              key={o.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onSelect(o.id)}
              className={`relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border px-2 py-4 text-center transition-colors duration-150 ${
                active
                  ? "border-rose bg-blush text-rose-deep"
                  : "border-linen bg-white text-ink hover:border-rose-soft"
              }`}
            >
              {active && (
                <span className="absolute right-2 top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-rose">
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                </span>
              )}
              <OccasionIcon id={o.id} className={`h-6 w-6 ${active ? "text-rose-deep" : "text-ink-soft"}`} />
              <span className="text-body-sm font-semibold leading-snug">
                <OccasionLabel label={o.label} />
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-4 min-h-6 text-center text-body-sm text-ink-soft" aria-live="polite">
        {selected ? OCCASION_MAP[selected].description : ""}
      </p>
      {error && (
        <p role="alert" className="mt-2 rounded-sm bg-blush px-4 py-3 text-center text-body-sm font-medium text-rose-deep">
          {error}
        </p>
      )}
    </div>
  );
}
