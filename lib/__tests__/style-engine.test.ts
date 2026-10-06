import { describe, expect, it } from "vitest";
import { DEMO_SAMPLES, SAMPLE_MAP } from "../demo-samples";
import { COMPANIONS, MOODS, PLACES, SEASONS } from "../occasions";
import { applyConditions, evaluateOccasionFit, runStyleAnalysis, verdictFor } from "../style-engine";
import type { AnalysisConditions, DemoSample, Season } from "../types";

const none: AnalysisConditions = { companion: null, place: null, mood: null, season: "autumn", note: "" };

const analyse = (sample: DemoSample, conditions: Partial<AnalysisConditions> = {}) =>
  runStyleAnalysis({
    imageKey: sample.id,
    image: sample.image,
    occasion: sample.occasion,
    conditions: { ...none, ...conditions },
    sample,
  });

const upload = (conditions: Partial<AnalysisConditions> = {}) =>
  runStyleAnalysis({
    imageKey: "upload-48213-Zm9vYmFyYmF6cXV4",
    image: "data:image/jpeg;base64,AAAA",
    occasion: "interview",
    conditions: { ...none, ...conditions },
  });

/** Every sample × season × a spread of company / place / mood answers. */
function* everyCase() {
  const pick = <T,>(list: readonly T[]) => [null, ...list.filter((_, i) => i % 2 === 0)];
  for (const sample of DEMO_SAMPLES)
    for (const { id: season } of SEASONS)
      for (const companion of pick(COMPANIONS))
        for (const place of pick(PLACES))
          for (const mood of pick(MOODS)) yield { sample, conditions: { season: season as Season, companion, place, mood } };
}

describe("runStyleAnalysis", () => {
  it("is deterministic — the same input always gives the same result", () => {
    const sample = SAMPLE_MAP["wedding-navy"];
    expect(analyse(sample, { companion: "상사", season: "summer" })).toEqual(
      analyse(sample, { companion: "상사", season: "summer" })
    );
    expect(upload({ mood: "편안한" })).toEqual(upload({ mood: "편안한" }));
  });

  it("matches the score shown on the home page when no conditions are chosen", () => {
    for (const sample of DEMO_SAMPLES) {
      if (!sample.seasons.includes("autumn")) continue;
      expect(analyse(sample).overallScore).toBe(evaluateOccasionFit(sample.baseScores, sample.occasion));
    }
  });

  it("keeps every score in range and the fix always an improvement", () => {
    for (const { sample, conditions } of everyCase()) {
      const r = analyse(sample, conditions);
      expect(r.overallScore).toBeGreaterThanOrEqual(50);
      expect(r.overallScore).toBeLessThanOrEqual(97);
      expect(r.primaryRecommendation.scoreBefore).toBe(r.overallScore);
      expect(r.primaryRecommendation.scoreAfter).toBeGreaterThan(r.overallScore);
      expect(r.primaryRecommendation.scoreAfter).toBeLessThanOrEqual(100);
      Object.values(r.scores).forEach((s) => expect(s).toBeGreaterThanOrEqual(50));
    }
  });

  it("never ranks an alternative above the recommended change", () => {
    for (const { sample, conditions } of everyCase()) {
      const r = analyse(sample, conditions);
      const [primary, ...others] = r.alternatives;
      expect(primary.fitScore).toBe(r.primaryRecommendation.scoreAfter);
      others.forEach((alt) => {
        expect(alt.fitScore).toBeLessThan(r.primaryRecommendation.scoreAfter);
        expect(alt.fitScore).toBeGreaterThan(r.overallScore);
      });
    }
  });

  it("explains every point the conditions moved", () => {
    for (const { sample, conditions } of everyCase()) {
      const base = evaluateOccasionFit(sample.baseScores, sample.occasion);
      const r = analyse(sample, conditions);
      const explained = (r.conditionNotes ?? []).reduce((sum, n) => sum + n.impact, 0);
      // Equal unless the total hit the 50…97 clamp
      if (base + explained >= 50 && base + explained <= 97) expect(r.overallScore).toBe(base + explained);
    }
  });

  it("only flags a recommendation slot item when it is part of the look", () => {
    const r = analyse(SAMPLE_MAP["friends-casual"]);
    const focus = r.items.filter((i) => i.status === "recommend");
    expect(focus).toHaveLength(1);
    expect(focus[0].slot).toBe(r.primaryRecommendation.slot);
  });
});

describe("applyConditions", () => {
  const wedding = SAMPLE_MAP["wedding-navy"]; // dressed for spring / autumn

  it("lowers the score out of season and says why", () => {
    const summer = applyConditions(wedding.baseScores, { ...none, season: "summer" }, wedding);
    expect(summer.delta).toBe(-3);
    expect(summer.notes[0]).toMatchObject({ tone: "adjust", text: "여름에 입기엔 조금 더워 보여요" });

    const winter = applyConditions(wedding.baseScores, { ...none, season: "winter" }, wedding);
    expect(winter.notes[0].text).toBe("겨울에 입기엔 조금 가벼워 보여요");
  });

  it("does not guess the season of an uploaded photo", () => {
    const r = upload({ season: "summer" });
    expect(r.conditionNotes?.some((n) => n.text.includes("여름"))).toBe(false);
  });

  it("names the setting with the right Korean particles", () => {
    const casual = SAMPLE_MAP["friends-casual"];
    const { notes } = applyConditions(casual.baseScores, { ...none, companion: "상사", place: "호텔" }, casual);
    expect(notes.map((n) => n.text)).toContain("호텔에서 상사와 만나는 자리라 격식을 한 단계 높게 봤어요");

    const { notes: family } = applyConditions(casual.baseScores, { ...none, companion: "가족" }, casual);
    expect(family).toEqual([]); // 가족 alone (+0.5) is not a strong enough signal
  });

  it("puts what to fix before what went well", () => {
    const casual = SAMPLE_MAP["friends-casual"];
    const { notes } = applyConditions(casual.baseScores, { ...none, season: "summer", mood: "편안한" }, casual);
    expect(notes.map((n) => n.tone)).toEqual(["adjust", "good"]);
  });
});

describe("verdictFor", () => {
  it.each([
    [97, "이대로 나가도 좋아요"],
    [90, "이대로 나가도 좋아요"],
    [89, "아주 잘 어울리는 코디예요"],
    [85, "아주 잘 어울리는 코디예요"],
    [84, "전반적으로 잘 어울려요"],
    [75, "전반적으로 잘 어울려요"],
    [74, "조금만 다듬으면 좋아져요"],
  ])("%i → %s", (score, verdict) => {
    expect(verdictFor(score)).toBe(verdict);
  });
});
