"use client";

import { useState } from "react";
import { currentSeason, MOODS, OCCASION_MAP, OCCASION_QUESTIONS, SEASONS, type ConditionQuestion } from "@/lib/occasions";
import type { AnalysisConditions, OccasionId, Season } from "@/lib/types";
import OccasionGrid from "./OccasionGrid";
import { OccasionIcon } from "./OccasionIcon";

interface Props {
  occasion: OccasionId | null;
  onOccasion: (id: OccasionId) => void;
  conditions: AnalysisConditions;
  onConditions: (next: AnalysisConditions) => void;
  /** True when "원하는 느낌" was pre-filled from 마이페이지 선호 스타일 */
  moodFromPrefs?: boolean;
  error: string | null;
}

function Chips({
  legend,
  options,
  value,
  onSelect,
  hint,
}: {
  legend: string;
  options: readonly string[];
  value: string | null;
  onSelect: (v: string | null) => void;
  hint?: string;
}) {
  return (
    <fieldset>
      <legend className="text-body-sm font-semibold text-ink">
        {legend}
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

/**
 * 상황 — the one required answer — and, once it is chosen, only the details
 * that situation leaves open. The grid folds into a single line so the
 * optional part reads as optional, and "코디 판정하기" works at any point.
 */
export default function SituationStep({ occasion, onOccasion, conditions, onConditions, moodFromPrefs, error }: Props) {
  const [choosing, setChoosing] = useState(!occasion);
  // Open from the start only if the user already picked a different season
  const [seasonOpen, setSeasonOpen] = useState(() => conditions.season !== currentSeason());
  const set = (patch: Partial<AnalysisConditions>) => onConditions({ ...conditions, ...patch });

  const questions = occasion ? OCCASION_QUESTIONS[occasion] : null;
  const seasonLabel = SEASONS.find((s) => s.id === conditions.season)?.label;
  const showGrid = choosing || !occasion;

  const question = (q: ConditionQuestion | undefined, key: "companion" | "place") =>
    q && <Chips legend={q.label} options={q.options} value={conditions[key]} onSelect={(v) => set({ [key]: v })} />;

  return (
    <div className="animate-fade-up">
      <h1
        id="step-title"
        tabIndex={-1}
        className="font-display text-section font-semibold text-ink outline-none md:text-page"
      >
        어디에 입고 가시나요?
      </h1>

      {showGrid ? (
        <>
          <p className="mt-2 text-body text-ink-soft">하나만 고르면 바로 판정할 수 있어요.</p>
          <div className="mt-6">
            <OccasionGrid
              selected={occasion}
              onSelect={(id, commit) => {
                onOccasion(id);
                if (commit) setChoosing(false);
              }}
            />
          </div>
          {error && (
            <p role="alert" className="mt-4 rounded-sm bg-blush px-4 py-3 text-center text-body-sm font-medium text-rose-deep">
              {error}
            </p>
          )}
        </>
      ) : (
        occasion &&
        questions && (
          <>
            <div className="mt-5 flex items-center gap-3 rounded-md border border-linen bg-white px-4 py-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep">
                <OccasionIcon id={occasion} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-body font-semibold text-ink">{OCCASION_MAP[occasion].label}</p>
                <p className="text-meta text-ink-faint">{questions.implied ?? OCCASION_MAP[occasion].description}</p>
              </div>
              <button
                type="button"
                onClick={() => setChoosing(true)}
                className="btn btn-xs btn-quiet px-3"
                aria-label="상황 다시 고르기"
              >
                변경
              </button>
            </div>

            <section aria-labelledby="details-title" className="mt-9">
              <div className="flex items-baseline justify-between gap-3">
                <h2 id="details-title" className="text-title font-semibold text-ink">
                  더 정확하게
                </h2>
                <span className="text-meta text-ink-faint">모두 선택 사항</span>
              </div>
              <p className="mt-1 text-body-sm text-ink-soft">고른 만큼 판정에 반영하고, 결과에서 무엇이 달라졌는지 알려드려요.</p>

              <div className="mt-6 space-y-7">
                {question(questions.companion, "companion")}
                {question(questions.place, "place")}
                <Chips
                  legend="원하는 느낌"
                  options={MOODS}
                  value={conditions.mood}
                  onSelect={(v) => set({ mood: v })}
                  hint={moodFromPrefs && conditions.mood ? "선호 스타일에서 불러왔어요" : undefined}
                />

                {/* Season is known from today's date — shown, changeable, not asked */}
                <div>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-body-sm text-ink">
                      <span className="font-semibold">계절</span>
                      <span className="ml-2 text-ink-soft">
                        {seasonLabel} · {seasonOpen ? "직접 선택" : "오늘 날짜 기준"}
                      </span>
                    </p>
                    {!seasonOpen && (
                      <button type="button" onClick={() => setSeasonOpen(true)} className="btn btn-xs btn-quiet px-3">
                        바꾸기
                      </button>
                    )}
                  </div>
                  {seasonOpen && (
                    <div
                      role="group"
                      aria-label="계절"
                      className="mt-3 grid grid-cols-4 gap-1 rounded-full border border-linen bg-white p-1"
                    >
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
                  )}
                </div>
              </div>
            </section>
          </>
        )
      )}
    </div>
  );
}
