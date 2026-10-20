"use client";

import type { KeyboardEvent } from "react";
import { Check } from "lucide-react";
import { OCCASIONS } from "@/lib/occasions";
import type { OccasionId } from "@/lib/types";
import { OccasionIcon, OccasionLabel } from "./OccasionIcon";

interface Props {
  selected: OccasionId | null;
  /** `commit` is false while moving with the arrow keys, true on a tap / Enter. */
  onSelect: (id: OccasionId, commit: boolean) => void;
}

/** The 12 situations as one WAI-ARIA radio group. */
export default function OccasionGrid({ selected, onSelect }: Props) {
  const selectedIndex = OCCASIONS.findIndex((o) => o.id === selected);
  const focusIndex = selectedIndex >= 0 ? selectedIndex : 0;

  // Arrow keys move and select, Home / End jump to the ends.
  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const keys: Record<string, number> = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 };
    let next: number;
    if (e.key in keys) next = (focusIndex + keys[e.key] + OCCASIONS.length) % OCCASIONS.length;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = OCCASIONS.length - 1;
    else return;
    e.preventDefault();
    onSelect(OCCASIONS[next].id, false);
    e.currentTarget.querySelector<HTMLButtonElement>(`[data-index="${next}"]`)?.focus();
  };

  return (
    <div
      role="radiogroup"
      aria-label="상황 선택"
      onKeyDown={onKeyDown}
      className="grid grid-cols-3 gap-2 md:grid-cols-4 md:gap-3"
    >
      {OCCASIONS.map((o, i) => {
        const active = selected === o.id;
        return (
          <button
            key={o.id}
            type="button"
            role="radio"
            aria-checked={active}
            // One tab stop for the whole group (WAI-ARIA radio pattern)
            tabIndex={i === focusIndex ? 0 : -1}
            data-index={i}
            onClick={() => onSelect(o.id, true)}
            className={`relative flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border px-2 py-4 text-center transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97] ${
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
  );
}
