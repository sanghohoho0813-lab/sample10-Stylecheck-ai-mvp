import { describe, expect, it } from "vitest";
import { SAMPLE_MAP } from "../demo-samples";
import { MIN_RECORDS, styleInsights } from "../insights";
import { runStyleAnalysis } from "../style-engine";
import type { AnalysisResult, ScoreSet } from "../types";

let n = 0;
function record(sampleId: string, opts: { applied?: boolean; scores?: Partial<ScoreSet> } = {}): AnalysisResult {
  const s = SAMPLE_MAP[sampleId];
  const r = runStyleAnalysis({
    imageKey: s.id,
    image: s.image,
    occasion: s.occasion,
    conditions: { companion: null, place: null, mood: null, season: "autumn", note: "" },
    sample: s,
  });
  return {
    ...r,
    scores: { ...r.scores, ...opts.scores },
    id: `r${++n}`,
    createdAt: "2026-10-01T00:00:00.000Z",
    favorite: false,
    appliedAt: opts.applied ? "2026-10-01T01:00:00.000Z" : null,
  };
}

describe("styleInsights", () => {
  it(`says nothing with fewer than ${MIN_RECORDS} records`, () => {
    expect(styleInsights([record("wedding-navy"), record("interview-black", { applied: true })])).toEqual([]);
  });

  it("names a repeated weak point with its counts", () => {
    const list = [record("wedding-navy"), record("wedding-navy"), record("date-feminine")]; // detail, detail, formality
    expect(styleInsights(list).map((i) => i.text)).toContain("최근 3번 중 2번, 신발·소품이 가장 아쉬웠어요.");
  });

  it("flags formality in formal situations only when it is actually low", () => {
    const low = [
      record("interview-black", { scores: { formality: 80 } }),
      record("first-day-oxford", { scores: { formality: 82 } }),
      record("friends-casual"),
    ];
    expect(styleInsights(low)[0].text).toBe(
      "격식 있는 자리(면접·첫 출근)에서 격식 점수가 평균 81점이었어요. 재킷이나 구두 하나가 가장 효과적이에요."
    );
    const fine = [record("interview-black"), record("family-cream"), record("friends-casual")];
    expect(styleInsights(fine).some((i) => i.id === "formal-gap")).toBe(false);
  });

  it("reports follow-through only when advice was applied", () => {
    const none = [record("wedding-navy"), record("date-feminine"), record("friends-casual")];
    expect(styleInsights(none, 5).some((i) => i.id === "follow-through")).toBe(false);
    const some = [record("wedding-navy", { applied: true }), record("date-feminine"), record("friends-casual")];
    const text = styleInsights(some, 5).find((i) => i.id === "follow-through")?.text;
    expect(text).toMatch(/^추천 3번 중 1번을 실제로 바꿔 입었어요\. 바꿔 입은 날은 평균 \d+점 올랐어요\.$/);
  });

  it("does not repeat the same finding twice and caps at two lines", () => {
    const list = [
      record("interview-black", { scores: { formality: 70 } }),
      record("first-day-oxford", { scores: { formality: 72 } }),
      record("friends-casual", { applied: true }),
      record("wedding-navy", { applied: true }),
    ];
    const ids = styleInsights(list).map((i) => i.id);
    expect(ids.length).toBeLessThanOrEqual(2);
    expect(ids).toContain("formal-gap");
    expect(ids).not.toContain("weak-point"); // formality already covered
  });
});
