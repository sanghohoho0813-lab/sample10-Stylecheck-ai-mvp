import type { Occasion, OccasionId } from "./types";

export const OCCASIONS: Occasion[] = [
  {
    id: "wedding",
    label: "결혼식",
    emoji: "💐",
    description: "하객으로 참석하는 예식",
    weights: { occasion: 0.3, formality: 0.25, color: 0.2, silhouette: 0.1, seasonal: 0.05, detail: 0.1 },
  },
  {
    id: "interview",
    label: "면접",
    emoji: "💼",
    description: "채용 면접, 중요한 자리",
    weights: { occasion: 0.15, formality: 0.3, color: 0.2, silhouette: 0.2, seasonal: 0.05, detail: 0.1 },
  },
  {
    id: "first-day",
    label: "첫 출근",
    emoji: "🏢",
    description: "새 직장의 첫날",
    weights: { occasion: 0.2, formality: 0.25, color: 0.2, silhouette: 0.15, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "blind-date",
    label: "소개팅",
    emoji: "🌷",
    description: "처음 만나는 설레는 자리",
    weights: { occasion: 0.2, formality: 0.1, color: 0.25, silhouette: 0.2, seasonal: 0.1, detail: 0.15 },
  },
  {
    id: "family-meeting",
    label: "상견례",
    emoji: "🤝",
    description: "양가 가족이 만나는 자리",
    weights: { occasion: 0.25, formality: 0.25, color: 0.2, silhouette: 0.1, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "business",
    label: "비즈니스 미팅",
    emoji: "📊",
    description: "거래처, 업무 미팅",
    weights: { occasion: 0.2, formality: 0.25, color: 0.15, silhouette: 0.2, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "date",
    label: "데이트",
    emoji: "💕",
    description: "연인과의 시간",
    weights: { occasion: 0.2, formality: 0.15, color: 0.25, silhouette: 0.25, seasonal: 0.05, detail: 0.1 },
  },
  {
    id: "friends",
    label: "친구 모임",
    emoji: "🥂",
    description: "편안한 모임, 동창회",
    weights: { occasion: 0.2, formality: 0.1, color: 0.25, silhouette: 0.25, seasonal: 0.1, detail: 0.1 },
  },
  {
    id: "restaurant",
    label: "호텔/레스토랑",
    emoji: "🍽️",
    description: "파인다이닝, 호텔 방문",
    weights: { occasion: 0.25, formality: 0.25, color: 0.15, silhouette: 0.15, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "travel",
    label: "여행",
    emoji: "✈️",
    description: "여행지에서의 하루",
    weights: { occasion: 0.15, formality: 0.05, color: 0.25, silhouette: 0.25, seasonal: 0.2, detail: 0.1 },
  },
  {
    id: "party",
    label: "행사/파티",
    emoji: "🎉",
    description: "파티, 브랜드 행사",
    weights: { occasion: 0.25, formality: 0.15, color: 0.25, silhouette: 0.15, seasonal: 0.05, detail: 0.15 },
  },
  {
    id: "funeral",
    label: "장례식",
    emoji: "🕊️",
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

export const SEASONS: { id: "spring" | "summer" | "autumn" | "winter"; label: string; emoji: string }[] = [
  { id: "spring", label: "봄", emoji: "🌸" },
  { id: "summer", label: "여름", emoji: "☀️" },
  { id: "autumn", label: "가을", emoji: "🍂" },
  { id: "winter", label: "겨울", emoji: "❄️" },
];

export function currentSeason(): "spring" | "summer" | "autumn" | "winter" {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return "spring";
  if (m >= 6 && m <= 8) return "summer";
  if (m >= 9 && m <= 11) return "autumn";
  return "winter";
}
