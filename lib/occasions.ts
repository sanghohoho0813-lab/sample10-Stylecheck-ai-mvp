import type { Occasion, OccasionId } from "./types";

export const OCCASIONS: Occasion[] = [
  {
    id: "wedding",
    label: "결혼식",
    description: "하객으로 참석하는 예식",
    weights: { occasion: 0.3, formality: 0.25, color: 0.2, silhouette: 0.1, seasonal: 0.05, detail: 0.1 },
  },
  {
    id: "interview",
    label: "면접",
    description: "채용 면접, 중요한 자리",
    weights: { occasion: 0.15, formality: 0.3, color: 0.2, silhouette: 0.2, seasonal: 0.05, detail: 0.1 },
  },
  {
    id: "first-day",
    label: "첫 출근",
    description: "새 직장의 첫날",
    weights: { occasion: 0.2, formality: 0.25, color: 0.2, silhouette: 0.15, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "blind-date",
    label: "소개팅",
    description: "처음 만나는 설레는 자리",
    weights: { occasion: 0.2, formality: 0.1, color: 0.25, silhouette: 0.2, seasonal: 0.1, detail: 0.15 },
  },
  {
    id: "family-meeting",
    label: "상견례",
    description: "양가 가족이 만나는 자리",
    weights: { occasion: 0.25, formality: 0.25, color: 0.2, silhouette: 0.1, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "business",
    label: "비즈니스 미팅",
    description: "거래처, 업무 미팅",
    weights: { occasion: 0.2, formality: 0.25, color: 0.15, silhouette: 0.2, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "date",
    label: "데이트",
    description: "연인과의 시간",
    weights: { occasion: 0.2, formality: 0.15, color: 0.25, silhouette: 0.25, seasonal: 0.05, detail: 0.1 },
  },
  {
    id: "friends",
    label: "친구 모임",
    description: "편안한 모임, 동창회",
    weights: { occasion: 0.2, formality: 0.1, color: 0.25, silhouette: 0.25, seasonal: 0.1, detail: 0.1 },
  },
  {
    id: "restaurant",
    label: "호텔·레스토랑",
    description: "파인다이닝, 호텔 방문",
    weights: { occasion: 0.25, formality: 0.25, color: 0.15, silhouette: 0.15, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "travel",
    label: "여행",
    description: "여행지에서의 하루",
    weights: { occasion: 0.15, formality: 0.05, color: 0.25, silhouette: 0.25, seasonal: 0.2, detail: 0.1 },
  },
  {
    id: "party",
    label: "행사·파티",
    description: "파티, 브랜드 행사",
    weights: { occasion: 0.25, formality: 0.15, color: 0.25, silhouette: 0.15, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "funeral",
    label: "장례식",
    description: "조문, 추모의 자리",
    weights: { occasion: 0.3, formality: 0.3, color: 0.2, silhouette: 0.1, seasonal: 0.05, detail: 0.05 },
  },
];

export const OCCASION_MAP: Record<OccasionId, Occasion> = Object.fromEntries(
  OCCASIONS.map((o) => [o.id, o])
) as Record<OccasionId, Occasion>;

export const COMPANIONS = ["직장동료", "상사", "처음 만나는 사람", "연인", "가족", "친구", "거래처"];

export const PLACES = ["호텔", "회사", "식당", "카페", "야외", "예식장", "행사장"];

export const MOODS = ["단정한", "세련된", "편안한", "격식 있는", "자연스러운", "개성 있는"];

export const SEASONS: { id: "spring" | "summer" | "autumn" | "winter"; label: string }[] = [
  { id: "spring", label: "봄" },
  { id: "summer", label: "여름" },
  { id: "autumn", label: "가을" },
  { id: "winter", label: "겨울" },
];

export function currentSeason(): "spring" | "summer" | "autumn" | "winter" {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}

/* ── What each situation still needs to know ─────────────────────────────
   The situation already answers most questions (a 면접 is at a company, with
   people you meet for the first time). Only what it leaves open is asked —
   with options that make sense for it — and everything is optional. The
   implied part is shown, not asked, so the user sees it was considered. */

export interface ConditionQuestion {
  label: string;
  options: string[];
}

export interface OccasionQuestions {
  /** Shown as already understood, e.g. "회사 · 처음 만나는 면접관 기준" */
  implied?: string;
  companion?: ConditionQuestion;
  place?: ConditionQuestion;
}

export const OCCASION_QUESTIONS: Record<OccasionId, OccasionQuestions> = {
  wedding: { implied: "하객 기준", place: { label: "예식은 어디서 하나요?", options: ["호텔", "예식장", "야외"] } },
  interview: { implied: "회사 · 처음 만나는 면접관 기준" },
  "first-day": { implied: "회사 · 새 동료 기준" },
  "blind-date": { implied: "처음 만나는 사람 기준", place: { label: "어디서 만나나요?", options: ["카페", "식당", "야외"] } },
  "family-meeting": { implied: "양가 가족 기준", place: { label: "어디서 만나나요?", options: ["호텔", "식당"] } },
  business: {
    companion: { label: "누구를 만나나요?", options: ["거래처", "상사", "직장동료"] },
    place: { label: "어디서 만나나요?", options: ["회사", "카페", "식당", "호텔"] },
  },
  date: { implied: "연인 기준", place: { label: "어디로 가나요?", options: ["카페", "식당", "야외", "호텔"] } },
  friends: { implied: "친구 기준", place: { label: "어디서 모이나요?", options: ["카페", "식당", "야외"] } },
  restaurant: {
    implied: "호텔 · 파인다이닝 기준",
    companion: { label: "누구와 함께인가요?", options: ["연인", "가족", "친구", "거래처"] },
  },
  travel: { implied: "야외 활동 기준", companion: { label: "누구와 떠나나요?", options: ["연인", "친구", "가족"] } },
  party: { place: { label: "어디서 열리나요?", options: ["호텔", "행사장", "야외"] } },
  funeral: { implied: "조문 기준" },
};

/** Drop answers the newly chosen situation doesn't ask about (they would silently change the score). */
export function conditionsFor<T extends { companion: string | null; place: string | null }>(occasion: OccasionId, c: T): T {
  const q = OCCASION_QUESTIONS[occasion];
  return {
    ...c,
    companion: c.companion && q.companion?.options.includes(c.companion) ? c.companion : null,
    place: c.place && q.place?.options.includes(c.place) ? c.place : null,
  };
}
