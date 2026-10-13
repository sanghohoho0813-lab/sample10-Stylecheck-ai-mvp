import { OCCASION_MAP } from "./occasions";
import type { AnalysisResult, PrimaryRecommendation } from "./types";
import { withEuro } from "./utils";

/**
 * What a friend would say first — the verdict and the one thing to change —
 * before any score. Pure and deterministic, so the result page, the shared
 * view, the share text and the link preview all say the same thing.
 */

export type VerdictTone = "go" | "good" | "tweak" | "fix";

export function toneFor(score: number): VerdictTone {
  if (score >= 90) return "go";
  if (score >= 82) return "good";
  if (score >= 72) return "tweak";
  return "fix";
}

/** "구두만 블랙 스트레이트팁으로 바꾸면" / "격식이 한 단계 올라가요" — with a fallback for older records. */
export function changeClauses(rec: PrimaryRecommendation): { action: string; effect: string } {
  return {
    action: rec.action ?? `${rec.slot ? `${rec.slot}만 ` : ""}${withEuro(rec.to)} 바꾸면`,
    effect: rec.effect ?? "더 잘 어울려요",
  };
}

export interface Advice {
  tone: VerdictTone;
  /** One short line: is it okay? */
  headline: string;
  /** One sentence: what single change, and what it does. */
  advice: string;
}

type AdviceInput = Pick<AnalysisResult, "occasion" | "overallScore" | "primaryRecommendation" | "appliedAt">;

export function adviceFor(result: AdviceInput): Advice {
  const occasion = OCCASION_MAP[result.occasion].label;
  const rec = result.primaryRecommendation;
  const tone = toneFor(result.overallScore);
  const { action, effect } = changeClauses(rec);

  if (result.appliedAt) {
    return {
      tone: toneFor(rec.scoreAfter),
      headline: `이제 ${occasion}에 딱 맞아요`,
      advice: `${withEuro(rec.to)} 바꿔 입었어요. 오늘 코디는 ${rec.scoreAfter}점으로 기록했어요.`,
    };
  }

  const headline = {
    go: "지금 그대로도 충분히 좋아요",
    good: `${occasion}에 잘 맞는 코디예요`,
    tweak: "전반적으로 괜찮아요",
    fix: "한 가지만 손보면 좋아져요",
  }[tone];
  const lead = { go: "지금도 좋지만, ", good: "다만 ", tweak: "다만 ", fix: "" }[tone];
  return { tone, headline, advice: `${lead}${action} ${effect}.` };
}

/** The message a friend receives with the share link — no photo, just the situation and the advice. */
export function shareMessage(result: AdviceInput): string {
  const occasion = OCCASION_MAP[result.occasion].label;
  const { headline, advice } = adviceFor({ ...result, appliedAt: null });
  return `${occasion} 코디 판정: ${headline}. ${advice} 어떻게 생각해?`;
}
