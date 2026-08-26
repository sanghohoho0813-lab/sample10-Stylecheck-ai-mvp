import { OCCASION_MAP } from "./occasions";
import type {
  AlternativeLook,
  AnalysisConditions,
  AnalysisResult,
  DemoSample,
  FeedbackItem,
  OccasionId,
  OutfitItemAnalysis,
  PrimaryRecommendation,
  ScoreSet,
  WardrobeSuggestion,
} from "./types";

/**
 * Demo Style Analysis Engine
 * --------------------------
 * Rule-based, deterministic engine that powers the full product flow
 * without a Vision/LLM API. The public functions mirror the shape of a
 * future AI integration:
 *
 *   analyzeOutfitImage()    → per-dimension raw scores
 *   evaluateOccasionFit()   → weighted overall score for the occasion
 *   generateStyleFeedback() → positives / improvements / summary
 *   generateAlternatives()  → alternative looks
 *
 * When AI_API_KEY (NEXT_PUBLIC_AI_API_KEY) is configured, runStyleAnalysis
 * can be swapped to call the real API while keeping the same result shape.
 */

export const HAS_AI_API = Boolean(process.env.NEXT_PUBLIC_AI_API_KEY);

function hashString(str: string): number {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v: number, min = 55, max = 97) => Math.round(Math.min(max, Math.max(min, v)));

/** Dimension scores — from sample metadata or a deterministic seed. */
export function analyzeOutfitImage(imageKey: string, occasion: OccasionId, sample?: DemoSample): ScoreSet {
  if (sample) return { ...sample.baseScores };
  const rand = mulberry32(hashString(imageKey + occasion));
  const base = 74 + rand() * 14; // 74~88 baseline: encouraging but with room to improve
  const jitter = () => (rand() - 0.5) * 18;
  return {
    occasion: clamp(base + jitter()),
    formality: clamp(base + jitter()),
    color: clamp(base + jitter()),
    silhouette: clamp(base + jitter()),
    seasonal: clamp(base + 4 + jitter()),
    detail: clamp(base - 6 + jitter(), 52, 92),
  };
}

/** Weighted overall score for the selected occasion. */
export function evaluateOccasionFit(scores: ScoreSet, occasion: OccasionId): number {
  const w = OCCASION_MAP[occasion].weights;
  const total =
    scores.occasion * w.occasion +
    scores.formality * w.formality +
    scores.color * w.color +
    scores.silhouette * w.silhouette +
    scores.seasonal * w.seasonal +
    scores.detail * w.detail;
  return Math.round(total);
}

const DIMENSION_LABELS: Record<keyof ScoreSet, string> = {
  occasion: "상황 적합도",
  formality: "격식",
  color: "컬러 조합",
  silhouette: "실루엣",
  seasonal: "계절 적합성",
  detail: "디테일 균형",
};

export { DIMENSION_LABELS };

const POSITIVE_POOL: Record<keyof ScoreSet, FeedbackItem[]> = {
  occasion: [
    { title: "장소와 잘 맞아요", body: "선택한 상황의 분위기에 비해 지나치게 캐주얼하거나 과하지 않은, 딱 좋은 균형이에요." },
    { title: "상황에 자연스럽게 어울려요", body: "전체적인 톤과 아이템 구성이 오늘의 자리에 잘 녹아드는 스타일이에요." },
  ],
  formality: [
    { title: "격식 수준이 적절해요", body: "너무 꾸미지 않으면서도 단정한 인상을 주는 격식 밸런스를 갖추고 있어요." },
    { title: "단정한 인상을 줘요", body: "포멀함과 편안함 사이의 균형이 좋아 신뢰감 있는 분위기를 만들어줍니다." },
  ],
  color: [
    { title: "컬러 조합이 좋아요", body: "메인 컬러와 서브 컬러의 조화가 안정적이라 세련된 분위기를 만들어줍니다." },
    { title: "톤 정리가 잘 되어 있어요", body: "전체 컬러 수가 절제되어 있어 차분하고 정돈된 인상을 줍니다." },
  ],
  silhouette: [
    { title: "전체 실루엣이 안정적이에요", body: "상의와 하의의 비율 균형이 자연스러워 전체 라인이 깔끔하게 떨어집니다." },
    { title: "핏 밸런스가 좋아요", body: "여유 있는 부분과 정돈된 부분의 대비가 좋아 스타일이 살아나요." },
  ],
  seasonal: [
    { title: "계절감이 잘 맞아요", body: "소재와 컬러 무드가 지금 계절 분위기와 잘 어울립니다." },
    { title: "시즌 무드를 잘 살렸어요", body: "계절에 맞는 레이어링과 톤 선택이 자연스러워요." },
  ],
  detail: [
    { title: "디테일 정리가 깔끔해요", body: "액세서리와 소품의 밸런스가 과하지 않아 전체 룩이 정돈되어 보여요." },
    { title: "포인트 사용이 좋아요", body: "포인트 아이템이 하나로 절제되어 있어 시선이 자연스럽게 정리됩니다." },
  ],
};

const IMPROVEMENT_POOL: Record<keyof ScoreSet, FeedbackItem[]> = {
  occasion: [
    { title: "한 끗만 상황에 맞춰보세요", body: "지금 구성도 좋지만, 장소의 격식 분위기에 맞춰 아이템 하나만 정리하면 더 자연스러워져요." },
  ],
  formality: [
    { title: "격식을 반 단계만 올려보세요", body: "재킷을 더하거나 신발을 정돈된 디자인으로 바꾸면 자리의 분위기에 한층 가까워집니다." },
  ],
  color: [
    { title: "컬러 수를 줄여도 좋아요", body: "포인트 컬러를 하나로 정리하면 전체 인상이 훨씬 정돈되어 보일 수 있어요." },
  ],
  silhouette: [
    { title: "비율을 살짝 정리해보세요", body: "상의를 가볍게 정리해 입거나 하의 라인을 다듬으면 전체 실루엣이 더 단정해 보일 수 있어요." },
  ],
  seasonal: [
    { title: "계절감을 조금 더해보세요", body: "지금 계절 무드에 맞는 소재나 레이어를 한 겹 더하면 룩의 완성도가 올라가요." },
  ],
  detail: [
    { title: "신발·소품을 조금 바꿔보세요", body: "현재 신발과 소품이 전체 착장보다 다소 캐주얼하게 느껴질 수 있어요. 하나만 정리해도 인상이 달라집니다." },
    { title: "액세서리는 줄여도 좋아요", body: "이미 착장에 포인트가 있어 액세서리를 하나 줄이면 더 정돈된 인상을 줄 수 있어요." },
  ],
};

interface RecTemplate {
  from: string;
  to: string;
  reason: string;
}

const REC_BY_DIMENSION: Record<keyof ScoreSet, RecTemplate> = {
  detail: {
    from: "화이트 스니커즈",
    to: "블랙 로퍼",
    reason: "신발만 정돈된 디자인으로 바꿔도 전체 격식 밸런스가 눈에 띄게 올라가요.",
  },
  formality: {
    from: "캐주얼 아우터",
    to: "미니멀 재킷",
    reason: "재킷 하나만 더해도 자리에 맞는 단정한 무드가 완성돼요.",
  },
  color: {
    from: "포인트 컬러 2개",
    to: "포인트 컬러 1개",
    reason: "컬러를 하나로 모으면 시선이 정리되어 훨씬 세련되어 보여요.",
  },
  silhouette: {
    from: "루즈한 상·하의",
    to: "상의 정리 + 와이드 하의",
    reason: "한쪽에만 볼륨을 주면 비율이 살아나 실루엣이 안정돼요.",
  },
  occasion: {
    from: "캐주얼 포인트 아이템",
    to: "차분한 베이식 아이템",
    reason: "튀는 아이템 하나만 바꾸면 장소 분위기와 자연스럽게 어울려요.",
  },
  seasonal: {
    from: "시즌 오프 소재",
    to: "계절감 있는 소재",
    reason: "계절에 맞는 소재로 바꾸면 룩 전체가 훨씬 신선해 보여요.",
  },
};

function summaryLine(overall: number, occasionLabel: string): string {
  if (overall >= 90) return `${occasionLabel}에 아주 잘 어울리는 코디예요. 지금 그대로 자신 있게 나가도 좋아요.`;
  if (overall >= 80) return `${occasionLabel}에 전반적으로 잘 어울리는 코디예요. 작은 디테일만 다듬으면 완벽해요.`;
  if (overall >= 70) return `${occasionLabel}에 무난하게 어울리는 코디예요. 한두 가지만 바꾸면 훨씬 좋아져요.`;
  return `${occasionLabel} 기준으로 몇 가지를 조정하면 좋겠어요. 아래 추천을 확인해보세요.`;
}

function sortDimensions(scores: ScoreSet): (keyof ScoreSet)[] {
  return (Object.keys(scores) as (keyof ScoreSet)[]).sort((a, b) => scores[b] - scores[a]);
}

/** Positives from top dimensions, improvements from bottom dimensions. */
export function generateStyleFeedback(scores: ScoreSet, seed: number) {
  const rand = mulberry32(seed);
  const sorted = sortDimensions(scores);
  const pick = <T,>(arr: T[]): T => arr[Math.floor(rand() * arr.length)];

  const positives = sorted.slice(0, 3).map((d) => pick(POSITIVE_POOL[d]));
  const improvements = sorted
    .slice(-2)
    .reverse()
    .map((d) => pick(IMPROVEMENT_POOL[d]));
  return { positives, improvements };
}

function buildPrimaryRecommendation(
  scores: ScoreSet,
  overall: number,
  items: { slot: string; name: string }[] | undefined
): PrimaryRecommendation {
  const weakest = sortDimensions(scores).at(-1)!;
  const t = REC_BY_DIMENSION[weakest];
  const shoeItem = items?.find((i) => i.slot === "신발");
  const from = weakest === "detail" && shoeItem ? shoeItem.name : t.from;
  const gain = Math.min(97 - overall, 5 + Math.round((97 - scores[weakest]) / 8));
  return {
    from,
    to: t.to,
    reason: t.reason,
    scoreBefore: overall,
    scoreAfter: overall + Math.max(gain, 3),
  };
}

const DEFAULT_SLOTS = ["상의", "하의", "아우터", "신발", "가방", "액세서리"];

const ITEM_COMMENTS = {
  good: ["지금 상황에 잘 맞는 선택이에요.", "전체 룩과 자연스럽게 어우러져요.", "톤과 무드가 잘 맞아요."],
  adjust: ["조금만 정돈하면 더 좋아질 아이템이에요.", "전체 격식보다 살짝 캐주얼하게 느껴질 수 있어요."],
  recommend: ["다른 옵션으로 바꾸면 적합도가 올라갈 수 있어요.", "아래 추천 아이템으로 교체를 고려해보세요."],
};

function buildItemAnalysis(
  seed: number,
  scores: ScoreSet,
  sampleItems?: { slot: string; name: string }[]
): OutfitItemAnalysis[] {
  const rand = mulberry32(seed + 7);
  const items =
    sampleItems ??
    DEFAULT_SLOTS.map((slot) => ({ slot, name: `${slot} 아이템` }));

  const weakest = sortDimensions(scores).at(-1)!;
  // detail/formality weakness maps to shoes+accessory; color to top; silhouette to bottom
  const focusSlot =
    weakest === "detail" || weakest === "formality"
      ? "신발"
      : weakest === "color"
        ? "상의"
        : weakest === "silhouette"
          ? "하의"
          : "액세서리";

  return items.map((item) => {
    let status: OutfitItemAnalysis["status"] = "good";
    if (item.slot === focusSlot) status = "recommend";
    else if (item.slot === "액세서리" && rand() > 0.5) status = "adjust";
    else if (rand() > 0.85) status = "adjust";
    const pool = ITEM_COMMENTS[status];
    return { slot: item.slot, name: item.name, status, comment: pool[Math.floor(rand() * pool.length)] };
  });
}

/** Alternatives keep the current outfit and change as little as possible. */
export function generateAlternatives(overall: number, primary: PrimaryRecommendation): AlternativeLook[] {
  return [
    {
      name: "Option A",
      summary: `현재 코디 유지 + ${primary.to}로 변경`,
      mood: "단정하고 정돈된 무드",
      fitScore: primary.scoreAfter,
      changedItems: 1,
    },
    {
      name: "Option B",
      summary: "미니멀 재킷을 레이어링",
      mood: "격식 있는 세미포멀 무드",
      fitScore: Math.min(96, overall + 4),
      changedItems: 1,
    },
    {
      name: "Option C",
      summary: "액세서리 최소화 + 톤 정리",
      mood: "차분하고 자연스러운 무드",
      fitScore: Math.min(95, overall + 2),
      changedItems: 2,
    },
  ];
}

const WARDROBE_DEMO: WardrobeSuggestion[] = [
  { itemName: "블랙 로퍼", slot: "신발", message: "내 옷장에 비슷한 신발이 있어요." },
  { itemName: "미니멀 재킷", slot: "아우터", message: "내 옷장의 재킷으로 바로 바꿀 수 있어요." },
  { itemName: "실버 미니 워치", slot: "액세서리", message: "내 옷장의 워치와 잘 어울려요." },
];

export interface AnalysisInput {
  imageKey: string;
  image: string;
  occasion: OccasionId;
  conditions: AnalysisConditions;
  sample?: DemoSample;
}

/** Full demo analysis — same result shape a future AI backend will return. */
export function runStyleAnalysis(input: AnalysisInput): Omit<AnalysisResult, "id" | "createdAt" | "favorite"> {
  const { imageKey, image, occasion, conditions, sample } = input;
  const seedStr =
    imageKey + occasion + (conditions.companion ?? "") + (conditions.place ?? "") + (conditions.mood ?? "");
  const seed = hashString(seedStr);

  const scores = analyzeOutfitImage(imageKey, occasion, sample);
  const overall = evaluateOccasionFit(scores, occasion);
  const occasionLabel = OCCASION_MAP[occasion].label;
  const { positives, improvements } = generateStyleFeedback(scores, seed);
  const primaryRecommendation = buildPrimaryRecommendation(scores, overall, sample?.items);
  const items = buildItemAnalysis(seed, scores, sample?.items);
  const alternatives = generateAlternatives(overall, primaryRecommendation);
  const wardrobeSuggestion = WARDROBE_DEMO[seed % WARDROBE_DEMO.length];

  return {
    image,
    isSample: Boolean(sample),
    sampleId: sample?.id,
    occasion,
    conditions,
    overallScore: overall,
    scores,
    summary: summaryLine(overall, occasionLabel),
    positives,
    improvements,
    primaryRecommendation,
    items,
    alternatives,
    wardrobeSuggestion,
  };
}
