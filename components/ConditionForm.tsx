"use client";

import { COMPANIONS, MOODS, PLACES, SEASONS } from "@/lib/occasions";
import type { AnalysisConditions, Season } from "@/lib/types";

interface Props {
  conditions: AnalysisConditions;
  onChange: (next: AnalysisConditions) => void;
  /** True when "원하는 느낌" was pre-filled from 마이페이지 선호 스타일 */
  moodFromPrefs?: boolean;
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onSelect,
  hint,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onSelect: (v: T | null) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="text-body-sm font-semibold text-ink">
        {label}
        {hint && <span className="ml-2 text-caption font-normal text-rose-deep">{hint}</span>}
      </legend>
      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(active ? null : opt)}
              aria-pressed={active}
              className={`chip ${active ? "chip-on" : "chip-off"}`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export default function ConditionForm({ conditions, onChange, moodFromPrefs }: Props) {
  const set = (patch: Partial<AnalysisConditions>) => onChange({ ...conditions, ...patch });

  return (
    <div className="animate-fade-up space-y-8">
      <div>
        <h1 id="step-title" tabIndex={-1} className="outline-none font-display text-section font-semibold text-ink md:text-page">조금 더 알려주세요</h1>
        <p className="mt-2 text-body text-ink-soft">고를수록 판정에 반영돼요. 건너뛰어도 괜찮아요.</p>
      </div>

      <ChipRow label="누구를 만나나요?" options={COMPANIONS} value={conditions.companion} onSelect={(v) => set({ companion: v })} />
      <ChipRow label="장소는 어디인가요?" options={PLACES} value={conditions.place} onSelect={(v) => set({ place: v })} />
      <ChipRow
        label="원하는 느낌"
        options={MOODS}
        value={conditions.mood}
        onSelect={(v) => set({ mood: v })}
        hint={moodFromPrefs && conditions.mood ? "선호 스타일에서 불러왔어요" : undefined}
      />

      <fieldset>
        <legend className="text-body-sm font-semibold text-ink">계절</legend>
        <div className="mt-3 grid grid-cols-4 gap-1 rounded-full border border-linen bg-white p-1">
          {SEASONS.map((s) => {
            const active = conditions.season === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => set({ season: s.id as Season })}
                aria-pressed={active}
                className={`h-10 rounded-full text-body-sm font-semibold transition-colors duration-150 ${
                  active ? "bg-ink text-white" : "text-ink-soft hover:text-ink"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
