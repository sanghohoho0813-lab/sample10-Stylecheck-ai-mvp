/**
 * 데모 옷장 — 추천 엔진, 결과 화면, 마이페이지가 모두 이 목록 하나를 참조합니다.
 * 추천의 "바꿀 아이템"이 여기 있으면 "내 옷장에 있어요"로 안내하고,
 * 없으면 옷장 안내를 생략합니다.
 */
export interface WardrobeItem {
  id: string;
  slot: string;
  name: string;
  /** Swatch colour for the demo tile */
  color: string;
}

export const WARDROBE: WardrobeItem[] = [
  { id: "shoes-straight-tip", slot: "신발", name: "블랙 스트레이트팁", color: "#262224" },
  { id: "shoes-black-loafer", slot: "신발", name: "블랙 로퍼", color: "#2f2a2b" },
  { id: "shoes-beige-loafer", slot: "신발", name: "베이지 로퍼", color: "#c9b294" },
  { id: "outer-charcoal", slot: "아우터", name: "차콜 재킷", color: "#4b4649" },
  { id: "outer-minimal", slot: "아우터", name: "미니멀 재킷", color: "#6b6466" },
  { id: "outer-vest", slot: "아우터", name: "네이비 니트 베스트", color: "#2c3a55" },
  { id: "outer-light-shirt", slot: "아우터", name: "라이트 셔츠", color: "#dbe4ee" },
  { id: "bag-ivory-mini", slot: "가방", name: "아이보리 미니백", color: "#efe7db" },
  { id: "acc-pearl", slot: "액세서리", name: "진주 이어링", color: "#f3ece2" },
  { id: "acc-silver-watch", slot: "액세서리", name: "실버 미니 워치", color: "#c8c8cc" },
];

export function findWardrobeItem(name: string): WardrobeItem | undefined {
  return WARDROBE.find((w) => w.name === name);
}
