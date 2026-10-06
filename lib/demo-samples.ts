import type { DemoSample } from "./types";

/**
 * 8 curated demo outfits. Items, scores and recommendations are written to
 * match what is actually visible in each look photo.
 */
export const DEMO_SAMPLES: DemoSample[] = [
  {
    id: "wedding-navy",
    name: "클래식 하객 룩",
    occasion: "wedding",
    outfit: "Navy Jacket · White Shirt · Beige Pants",
    image: "/looks/wedding-navy.webp",
    baseScores: { occasion: 84, formality: 85, color: 88, silhouette: 82, seasonal: 94, detail: 71 },
    seasons: ["spring", "autumn"],
    items: [
      { slot: "아우터", name: "네이비 재킷" },
      { slot: "상의", name: "화이트 셔츠" },
      { slot: "하의", name: "베이지 슬랙스" },
      { slot: "신발", name: "브라운 로퍼" },
    ],
    recommendation: {
      from: "브라운 로퍼",
      to: "블랙 스트레이트팁",
      reason: "브라운 로퍼도 좋지만, 예식장에서는 어두운 톤의 구두가 재킷과 이어지며 격식을 한 단계 올려줘요.",
    },
    wardrobe: { itemName: "블랙 스트레이트팁", slot: "신발", message: "내 옷장에 어울리는 구두가 있어요." },
  },
  {
    id: "interview-black",
    name: "미니멀 면접 룩",
    occasion: "interview",
    outfit: "Black Jacket · White Shirt · Black Slacks",
    image: "/looks/interview-black.webp",
    baseScores: { occasion: 90, formality: 94, color: 89, silhouette: 90, seasonal: 88, detail: 86 },
    seasons: ["spring", "autumn", "winter"],
    items: [
      { slot: "아우터", name: "블랙 재킷" },
      { slot: "상의", name: "화이트 셔츠" },
      { slot: "하의", name: "블랙 슬랙스" },
      { slot: "신발", name: "블랙 더비" },
    ],
    recommendation: {
      from: "올 블랙 톤",
      to: "차콜 톤 재킷",
      reason: "지금도 아주 단정하지만, 재킷만 차콜로 바꾸면 딱딱한 인상을 덜면서 격식은 그대로 유지돼요.",
    },
    wardrobe: { itemName: "차콜 재킷", slot: "아우터", message: "내 옷장에 비슷한 재킷이 있어요." },
  },
  {
    id: "blind-date-knit",
    name: "러블리 캐주얼 룩",
    occasion: "blind-date",
    outfit: "Lavender Knit · Light Denim",
    image: "/looks/blind-date-knit.webp",
    baseScores: { occasion: 88, formality: 78, color: 90, silhouette: 87, seasonal: 90, detail: 82 },
    seasons: ["spring", "autumn", "winter"],
    items: [
      { slot: "상의", name: "라벤더 케이블 니트" },
      { slot: "하의", name: "라이트 데님" },
      { slot: "신발", name: "아이보리 스니커즈" },
    ],
    recommendation: {
      from: "아이보리 스니커즈",
      to: "베이지 로퍼",
      reason: "니트의 부드러운 톤에 로퍼를 매치하면 편안함은 그대로 두고 조금 더 정돈된 인상을 줄 수 있어요.",
    },
    wardrobe: { itemName: "베이지 로퍼", slot: "신발", message: "내 옷장에 비슷한 신발이 있어요." },
  },
  {
    id: "family-cream",
    name: "포멀 상견례 룩",
    occasion: "family-meeting",
    outfit: "Cream Tweed Jacket · Dark Pants",
    image: "/looks/family-cream.webp",
    baseScores: { occasion: 89, formality: 88, color: 87, silhouette: 84, seasonal: 86, detail: 83 },
    seasons: ["spring", "autumn", "winter"],
    items: [
      { slot: "아우터", name: "크림 트위드 재킷" },
      { slot: "상의", name: "아이보리 블라우스" },
      { slot: "하의", name: "차콜 슬랙스" },
      { slot: "신발", name: "블랙 로퍼" },
    ],
    recommendation: {
      from: "포인트 없는 목선",
      to: "진주 이어링 한 쌍",
      reason: "차분한 톤이 잘 잡혀 있어, 작은 진주 포인트 하나만 더하면 자리에 어울리는 단정한 격식이 완성돼요.",
    },
    wardrobe: { itemName: "진주 이어링", slot: "액세서리", message: "내 옷장에 어울리는 액세서리가 있어요." },
  },
  {
    id: "first-day-oxford",
    name: "단정한 첫 출근 룩",
    occasion: "first-day",
    outfit: "Oxford Shirt · Charcoal Slacks",
    image: "/looks/first-day-oxford.webp",
    baseScores: { occasion: 86, formality: 84, color: 85, silhouette: 85, seasonal: 87, detail: 80 },
    seasons: ["spring", "summer", "autumn"],
    items: [
      { slot: "상의", name: "라이트블루 옥스포드 셔츠" },
      { slot: "하의", name: "차콜 슬랙스" },
      { slot: "신발", name: "브라운 로퍼" },
    ],
    recommendation: {
      from: "셔츠만 입은 상의",
      to: "네이비 니트 베스트 레이어",
      reason: "첫날에는 반 단계 더 단정한 쪽이 안전해요. 베스트를 겹치면 셔츠 핏도 정리되어 보여요.",
    },
    wardrobe: { itemName: "네이비 니트 베스트", slot: "아우터", message: "내 옷장에 비슷한 아이템이 있어요." },
  },
  {
    id: "date-feminine",
    name: "페미닌 데이트 룩",
    occasion: "date",
    outfit: "Pink Cardigan · Ivory Wide Pants",
    image: "/looks/date-feminine.webp",
    baseScores: { occasion: 90, formality: 82, color: 85, silhouette: 84, seasonal: 85, detail: 86 },
    seasons: ["spring", "autumn"],
    items: [
      { slot: "상의", name: "핑크 가디건" },
      { slot: "하의", name: "아이보리 와이드 팬츠" },
      { slot: "신발", name: "아이보리 플랫슈즈" },
    ],
    recommendation: {
      from: "가방 없는 구성",
      to: "미니 크로스백",
      reason: "부드러운 톤이 잘 맞아요. 작은 가방 하나로 시선을 모아주면 전체 실루엣이 더 또렷해져요.",
    },
    wardrobe: { itemName: "아이보리 미니백", slot: "가방", message: "내 옷장에 어울리는 가방이 있어요." },
  },
  {
    id: "restaurant-charcoal",
    name: "다이닝 시크 룩",
    occasion: "restaurant",
    outfit: "Charcoal Blazer · Black Turtleneck",
    image: "/looks/restaurant-charcoal.webp",
    baseScores: { occasion: 87, formality: 89, color: 84, silhouette: 88, seasonal: 82, detail: 85 },
    seasons: ["autumn", "winter"],
    items: [
      { slot: "아우터", name: "차콜 블레이저" },
      { slot: "상의", name: "블랙 터틀넥" },
      { slot: "하의", name: "블랙 슬랙스" },
      { slot: "신발", name: "블랙 더비" },
    ],
    recommendation: {
      from: "무채색만으로 구성",
      to: "실버 미니 액세서리",
      reason: "톤이 잘 정리되어 있어, 작은 금속 포인트 하나면 다이닝 자리에 어울리는 세련미가 살아나요.",
    },
    wardrobe: { itemName: "실버 미니 워치", slot: "액세서리", message: "내 옷장에 어울리는 워치가 있어요." },
  },
  {
    id: "friends-casual",
    name: "릴렉스 주말 룩",
    occasion: "friends",
    outfit: "Sage Sweatshirt · Wide Denim",
    image: "/looks/friends-casual.webp",
    baseScores: { occasion: 91, formality: 70, color: 86, silhouette: 84, seasonal: 88, detail: 78 },
    seasons: ["spring", "autumn", "winter"],
    items: [
      { slot: "상의", name: "세이지 스웨트셔츠" },
      { slot: "하의", name: "와이드 데님" },
      { slot: "신발", name: "화이트 스니커즈" },
    ],
    recommendation: {
      from: "스웨트셔츠만 입은 상의",
      to: "가벼운 셔츠 레이어",
      reason: "편안한 무드는 그대로 두고 셔츠를 한 겹 겹치면 모임 자리에 어울리는 정돈된 느낌이 더해져요.",
    },
    wardrobe: { itemName: "라이트 셔츠", slot: "아우터", message: "내 옷장에 겹쳐 입기 좋은 셔츠가 있어요." },
  },
];

export const SAMPLE_MAP: Record<string, DemoSample> = Object.fromEntries(
  DEMO_SAMPLES.map((s) => [s.id, s])
);
