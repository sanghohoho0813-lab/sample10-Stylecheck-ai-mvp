import { OCCASION_MAP } from "./occasions";
import type { AnalysisResult, OccasionId, ScoreSet } from "./types";
import { withIGa } from "./utils";

/**
 * Small, honest patterns from the user's own history.
 *
 * Rules: nothing below MIN_RECORDS; every line states its counts ("최근 4번 중
 * 3번") so it never claims more than the data shows; at most two lines, the
 * most specific first. Pure — the history page renders whatever comes back,
 * including nothing.
 */

export const MIN_RECORDS = 3;

const PLAIN: Record<keyof ScoreSet, string> = {
  formality: "격식",
  detail: "신발·소품",
  color: "컬러 조합",
  silhouette: "실루엣",
  seasonal: "계절감",
  occasion: "자리 분위기",
};

/** Situations where looking put-together is the point. */
const FORMAL: OccasionId[] = ["interview", "first-day", "business", "family-meeting", "wedding", "funeral"];

export interface Insight {
  id: "formal-gap" | "weak-point" | "follow-through" | "steady";
  text: string;
}

const weakest = (s: ScoreSet) =>
  (Object.keys(s) as (keyof ScoreSet)[]).reduce((min, k) => (s[k] < s[min] ? k : min));

const avg = (xs: number[]) => Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);

export function styleInsights(records: AnalysisResult[], limit = 2): Insight[] {
  const n = records.length;
  if (n < MIN_RECORDS) return [];
  const out: Insight[] = [];

  // 1. Formal situations falling short on formality
  const formal = records.filter((r) => FORMAL.includes(r.occasion));
  const formalAvg = formal.length >= 2 ? avg(formal.map((r) => r.scores.formality)) : null;
  if (formalAvg !== null && formalAvg < 86) {
    const labels = [...new Set(formal.map((r) => OCCASION_MAP[r.occasion].label))].slice(0, 2).join("·");
    out.push({
      id: "formal-gap",
      text: `격식 있는 자리(${labels})에서 격식 점수가 평균 ${formalAvg}점이었어요. 재킷이나 구두 하나가 가장 효과적이에요.`,
    });
  }

  // 2. The same weak point again and again
  const counts = new Map<keyof ScoreSet, number>();
  records.forEach((r) => {
    const w = weakest(r.scores);
    counts.set(w, (counts.get(w) ?? 0) + 1);
  });
  const [dim, k] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const coveredByFormal = dim === "formality" && out.some((i) => i.id === "formal-gap");
  if (k >= 2 && k / n >= 0.5 && !coveredByFormal) {
    out.push({ id: "weak-point", text: `최근 ${n}번 중 ${k}번, ${withIGa(PLAIN[dim])} 가장 아쉬웠어요.` });
  }

  // 3. Following the advice — only when it actually happened
  const applied = records.filter((r) => r.appliedAt);
  if (applied.length > 0) {
    const gain = avg(applied.map((r) => r.primaryRecommendation.scoreAfter - r.primaryRecommendation.scoreBefore));
    out.push({
      id: "follow-through",
      text: `추천 ${n}번 중 ${applied.length}번을 실제로 바꿔 입었어요. 바꿔 입은 날은 평균 ${gain}점 올랐어요.`,
    });
  }

  // 4. Where the user is already consistently good
  const byOccasion = new Map<OccasionId, number[]>();
  records.forEach((r) => byOccasion.set(r.occasion, [...(byOccasion.get(r.occasion) ?? []), r.overallScore]));
  const steady = [...byOccasion.entries()]
    .filter(([, s]) => s.length >= 2 && s.every((x) => x >= 82)) // "모두" must be true of every one
    .map(([o, s]) => ({ o, mean: avg(s), count: s.length }))
    .sort((a, b) => b.mean - a.mean)[0];
  if (steady && steady.mean >= 85) {
    out.push({
      id: "steady",
      text: `${OCCASION_MAP[steady.o].label} 코디는 ${steady.count}번 모두 안정적이었어요(평균 ${steady.mean}점).`,
    });
  }

  return out.slice(0, limit);
}
