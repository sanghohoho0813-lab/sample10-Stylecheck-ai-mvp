import type { OccasionId } from "./types";

export interface OccasionGuide {
  points: string[];
  avoid: string[];
}

/**
 * Style guidance for every occasion the check flow offers, so the result
 * page's "스타일 가이드 보기" link always lands on real content.
 * Only clothing and styling are discussed — never the wearer's body or looks.
 */
export const GUIDES: Record<OccasionId, OccasionGuide> = {
  wedding: {
    points: ["적당한 격식의 세미포멀 룩", "차분한 톤의 재킷·원피스", "정돈된 구두나 로퍼"],
    avoid: ["신부·신랑보다 돋보이는 과도한 화이트", "지나치게 캐주얼한 운동복·슬리퍼", "과한 반짝이 소재"],
  },
  interview: {
    points: ["단정함이 최우선", "네이비·차콜·블랙 등 절제된 컬러", "직무 분위기에 맞는 격식 수준"],
    avoid: ["과한 포인트 컬러", "구겨진 셔츠·관리 안 된 신발", "지나치게 트렌디한 실루엣"],
  },
  "first-day": {
    points: ["회사 분위기보다 반 단계 더 단정하게", "베이식한 셔츠·슬랙스 조합", "심플한 가방과 신발"],
    avoid: ["첫날부터 과한 개성 표현", "지나치게 편한 차림", "요란한 액세서리"],
  },
  "blind-date": {
    points: ["나다움이 느껴지는 자연스러운 스타일", "부드러운 컬러의 니트·셔츠", "깔끔하게 관리된 신발"],
    avoid: ["과하게 꾸민 인상", "관리 안 된 신발", "지나친 로고 플레이"],
  },
  "family-meeting": {
    points: ["과하지 않은 격식", "차분한 컬러 톤", "편안하면서 정돈된 느낌"],
    avoid: ["지나치게 화려한 액세서리", "너무 캐주얼한 데님·후드", "노출이 많은 디자인"],
  },
  business: {
    points: ["신뢰감을 주는 셔츠·재킷", "로고 없는 차분한 컬러", "관리된 신발과 가방"],
    avoid: ["트레이닝·후드 등 캐주얼 웨어", "소리 나는 액세서리", "구김이 많은 소재"],
  },
  date: {
    points: ["평소보다 한 단계 정돈된 스타일", "부드러운 톤의 포인트 아이템 하나", "오래 걸어도 편한 신발"],
    avoid: ["처음 신는 불편한 신발", "액세서리를 여러 개 겹치기", "장소와 동떨어진 과한 격식"],
  },
  friends: {
    points: ["편안하면서 깔끔한 캐주얼", "톤을 맞춘 데님·니트 조합", "깨끗한 스니커즈"],
    avoid: ["늘어난 홈웨어 느낌", "관리 안 된 신발", "모임 성격에 비해 과한 격식"],
  },
  restaurant: {
    points: ["스마트 캐주얼 이상", "어두운 톤의 재킷이나 블라우스", "정돈된 구두"],
    avoid: ["운동복·트레이닝 팬츠", "슬리퍼·샌들", "큰 백팩"],
  },
  travel: {
    points: ["활동성이 좋은 편안한 착장", "사진에 잘 담기는 컬러 조합", "날씨 변화에 대비한 레이어"],
    avoid: ["불편한 새 신발", "과한 격식", "짐이 되는 무거운 아이템"],
  },
  party: {
    points: ["드레스코드부터 먼저 확인", "포인트 아이템 하나로 분위기 연출", "조명 아래에서 살아나는 소재"],
    avoid: ["드레스코드와 반대되는 차림", "포인트를 여러 개 겹치기", "움직이기 불편한 착장"],
  },
  funeral: {
    points: ["블랙·다크 톤으로 통일", "무늬 없는 단정한 정장", "어두운 색 신발과 가방"],
    avoid: ["밝은 컬러·화려한 패턴", "반짝이는 액세서리", "캐주얼한 운동화"],
  },
};
