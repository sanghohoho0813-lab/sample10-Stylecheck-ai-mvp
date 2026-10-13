import { describe, expect, it } from "vitest";
import { adviceFor, changeClauses, shareMessage, toneFor } from "../advice";
import { DEMO_SAMPLES, SAMPLE_MAP } from "../demo-samples";
import { conditionsFor, OCCASION_QUESTIONS, OCCASIONS } from "../occasions";
import { runStyleAnalysis } from "../style-engine";
import type { OccasionId } from "../types";

const none = { companion: null, place: null, mood: null, season: "autumn" as const, note: "" };

const sample = (id: string) => {
  const s = SAMPLE_MAP[id];
  return runStyleAnalysis({ imageKey: s.id, image: s.image, occasion: s.occasion, conditions: none, sample: s });
};

describe("adviceFor", () => {
  it("leads with the verdict and names one concrete change", () => {
    const a = adviceFor(sample("interview-black")); // 91
    expect(a.tone).toBe("go");
    expect(a.headline).toBe("지금 그대로도 충분히 좋아요");
    expect(a.advice).toBe("지금도 좋지만, 재킷만 차콜 톤으로 바꾸면 격식은 그대로, 인상은 한결 부드러워져요.");
  });

  it("names the situation when the outfit fits it", () => {
    const a = adviceFor(sample("wedding-navy")); // 84
    expect(a.headline).toBe("결혼식에 잘 맞는 코디예요");
    expect(a.advice).toBe("다만 구두만 블랙 스트레이트팁으로 바꾸면 재킷과 톤이 이어져 격식이 한 단계 올라가요.");
  });

  it("turns into a confirmation once the change is applied", () => {
    const r = sample("wedding-navy");
    const a = adviceFor({ ...r, appliedAt: "2026-10-13T00:00:00.000Z" });
    expect(a.headline).toBe("이제 결혼식에 딱 맞아요");
    expect(a.advice).toBe(`블랙 스트레이트팁으로 바꿔 입었어요. 오늘 코디는 ${r.primaryRecommendation.scoreAfter}점으로 기록했어요.`);
  });

  it("reads as one finished sentence for every sample and upload template", () => {
    const results = [
      ...DEMO_SAMPLES.map((s) => sample(s.id)),
      ...["a", "b", "c", "d", "e", "f", "g", "h"].map((k) =>
        runStyleAnalysis({ imageKey: `upload-${k}`, image: "data:", occasion: "business", conditions: none })
      ),
    ];
    for (const r of results) {
      const { headline, advice } = adviceFor(r);
      expect(headline).not.toMatch(/undefined|null/);
      expect(advice).toMatch(/^[^.]+요\.$/); // one sentence ending in -요.
      expect(advice).toContain(changeClauses(r.primaryRecommendation).action);
    }
  });

  it("falls back gracefully for records saved before the advice copy existed", () => {
    const r = sample("wedding-navy");
    const legacy = { ...r, primaryRecommendation: { ...r.primaryRecommendation, action: undefined, effect: undefined } };
    expect(adviceFor(legacy).advice).toBe("다만 신발만 블랙 스트레이트팁으로 바꾸면 더 잘 어울려요.");
  });

  it.each([
    [95, "go"],
    [90, "go"],
    [89, "good"],
    [82, "good"],
    [81, "tweak"],
    [72, "tweak"],
    [71, "fix"],
  ])("tone for %i is %s", (score, tone) => {
    expect(toneFor(score)).toBe(tone);
  });

  it("writes a share message that stands on its own without the photo", () => {
    const msg = shareMessage(sample("wedding-navy"));
    expect(msg).toBe(
      "결혼식 코디 판정: 결혼식에 잘 맞는 코디예요. 다만 구두만 블랙 스트레이트팁으로 바꾸면 재킷과 톤이 이어져 격식이 한 단계 올라가요. 어떻게 생각해?"
    );
  });
});

describe("occasion questions", () => {
  it("covers every situation and never asks what the situation already says", () => {
    for (const o of OCCASIONS) {
      const q = OCCASION_QUESTIONS[o.id];
      expect(q).toBeDefined();
      // A situation either explains what it implies or asks about it
      expect(Boolean(q.implied || q.companion || q.place)).toBe(true);
    }
    expect(OCCASION_QUESTIONS.interview.companion).toBeUndefined();
    expect(OCCASION_QUESTIONS.interview.place).toBeUndefined();
    expect(OCCASION_QUESTIONS.date.companion).toBeUndefined(); // 데이트 = 연인
  });

  it("drops answers the new situation does not ask about", () => {
    const c = { ...none, companion: "거래처", place: "카페" };
    expect(conditionsFor("business" as OccasionId, c)).toMatchObject({ companion: "거래처", place: "카페" });
    expect(conditionsFor("interview" as OccasionId, c)).toMatchObject({ companion: null, place: null });
    expect(conditionsFor("date" as OccasionId, c)).toMatchObject({ companion: null, place: "카페" });
  });
});
