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
              className={`h-10 rounded-full border px-4 text-body-sm font-medium transition-colors duration-150 ${
                active
                  ? "border-rose bg-rose text-white"
                  : "border-linen bg-white text-ink-soft hover:border-rose-soft hover:text-ink"
              }`}
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
        <h1 className="font-display text-section font-semibold text-ink md:text-page">조금 더 알려주세요</h1>
        <p className="mt-2 text-body text-ink-soft">선택할수록 판정이 정확해져요. 건너뛰어도 괜찮아요.</p>
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

      <div>
        <label htmlFor="extra-note" className="text-body-sm font-semibold text-ink">
          추가 정보 <span className="font-normal text-ink-faint">(선택)</span>
        </label>
        <textarea
          id="extra-note"
          value={conditions.note}
          maxLength={100}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="예) 저녁 시간, 실내에서 가볍게 모이는 자리"
          rows={2}
          className="mt-3 w-full resize-none rounded-sm border border-linen bg-white px-4 py-3 text-body text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none"
        />
        <p className="mt-1 text-right text-caption tabular-nums text-ink-faint">{conditions.note.length}/100</p>
      </div>
    </div>
  );
}
