"use client";

import { COMPANIONS, MOODS, PLACES, SEASONS } from "@/lib/occasions";
import type { AnalysisConditions, Season } from "@/lib/types";

interface Props {
  conditions: AnalysisConditions;
  onChange: (next: AnalysisConditions) => void;
}

function ChipRow<T extends string>({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  value: T | null;
  onSelect: (v: T | null) => void;
}) {
  return (
    <div>
      <p className="text-[0.8125rem] font-semibold text-ink">{label}</p>
      <div className="mt-2.5 flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value === opt;
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onSelect(active ? null : opt)}
              aria-pressed={active}
              className={`rounded-full border px-3.5 py-2 text-[0.8125rem] font-medium transition-all duration-200 ${
                active
                  ? "border-rose bg-rose text-white shadow-rose/40 shadow-sm"
                  : "border-linen bg-white text-ink-soft hover:border-rose-soft hover:text-ink"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function ConditionForm({ conditions, onChange }: Props) {
  const set = (patch: Partial<AnalysisConditions>) => onChange({ ...conditions, ...patch });

  return (
    <div className="animate-fade-up space-y-7">
      <div>
        <h2 className="font-display text-[1.35rem] font-semibold leading-snug text-ink sm:text-[1.6rem] md:text-2xl">
          조금 더 알려주세요
        </h2>
        <p className="mt-2 text-sm text-ink-soft">선택할수록 판정이 더 정확해져요. 건너뛰어도 괜찮아요.</p>
      </div>

      <ChipRow label="누구를 만나나요?" options={COMPANIONS} value={conditions.companion} onSelect={(v) => set({ companion: v })} />
      <ChipRow label="장소는 어디인가요?" options={PLACES} value={conditions.place} onSelect={(v) => set({ place: v })} />
      <ChipRow label="원하는 느낌" options={MOODS} value={conditions.mood} onSelect={(v) => set({ mood: v })} />

      <div>
        <p className="text-[0.8125rem] font-semibold text-ink">계절</p>
        <div className="mt-2.5 grid grid-cols-4 gap-2">
          {SEASONS.map((s) => {
            const active = conditions.season === s.id;
            return (
              <button
                key={s.id}
                type="button"
                onClick={() => set({ season: s.id as Season })}
                aria-pressed={active}
                className={`flex flex-col items-center gap-1 rounded-2xl border py-3 transition-all duration-200 ${
                  active ? "border-rose bg-blush" : "border-linen bg-white hover:border-rose-soft"
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className={`text-xs font-semibold ${active ? "text-rose-deep" : "text-ink-soft"}`}>{s.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor="extra-note" className="text-[0.8125rem] font-semibold text-ink">
          추가 정보 <span className="font-normal text-ink-faint">(선택)</span>
        </label>
        <textarea
          id="extra-note"
          value={conditions.note}
          maxLength={100}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="ex) 저녁 시간, 실내 가벼운 모임 등"
          rows={2}
          className="mt-2.5 w-full resize-none rounded-2xl border border-linen bg-white px-4 py-3 text-sm text-ink placeholder:text-ink-faint focus:border-rose focus:outline-none"
        />
        <p className="mt-1 text-right text-[0.6875rem] text-ink-faint">{conditions.note.length}/100</p>
      </div>
    </div>
  );
}
