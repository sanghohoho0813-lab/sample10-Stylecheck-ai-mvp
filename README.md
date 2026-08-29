# StyleCheck AI — 상황별 코디 적합도 판정 MVP

> **미래에이아이랩 MVP 샘플 프로젝트**
> "오늘 이 옷, 괜찮을까요?" — 사진과 상황을 알려주면 지금 코디가 얼마나 잘 맞는지 확인해주는 AI 스타일 도우미.

## 주요 기능

- **코디 사진 업로드** — JPG/PNG/WEBP, 드래그&드롭(데스크톱), 촬영/앨범 선택(모바일), 미리보기·다시 선택·삭제
- **상황 선택** — 결혼식·면접·첫 출근·소개팅·상견례·비즈니스 미팅·데이트·친구 모임·호텔/레스토랑·여행·행사/파티·장례식 (12종)
- **추가 조건** — 만나는 사람, 장소, 원하는 느낌, 계절(자동 감지), 메모
- **AI 분석 결과** — 종합 적합도 점수(카운트업 게이지), 6개 세부 점수, 잘한 부분 / 아쉬운 부분
- **한 가지만 바꾼다면** — 가장 효과적인 수정 1개 + Before/After 예상 점수
- **아이템별 분석** — 상의/하의/아우터/신발/가방/액세서리 상태 배지
- **대안 코디** — 현재 옷을 최대한 활용하는 Option A/B/C
- **내 옷장 데모** — 옷장 아이템으로 대체하기 체험
- **기록 / 저장 / 공유** — 분석 히스토리, 즐겨찾기, Web Share API(클립보드 폴백)
- **샘플 체험 모드** — 사진이 없어도 8개 샘플 코디(실사 플랫레이 사진, `public/looks/`)로 전체 플로우 체험.
  각 샘플의 아이템·점수·추천 문구는 사진에 실제로 보이는 착장에 맞춰 작성되어 있습니다.
- **상황별 스타일 가이드** — 8개 상황의 추천/주의 포인트

## 기술 스택

- Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Lucide Icons
- **Demo Style Analysis Engine** — Vision/LLM API 없이 전체 플로우가 작동하는 결정적 룰 기반 엔진
  (`lib/style-engine.ts`: `analyzeOutfitImage` / `evaluateOccasionFit` / `generateStyleFeedback` / `generateAlternatives`)
- `NEXT_PUBLIC_AI_API_KEY` 설정 시 동일한 결과 스키마로 실제 AI 백엔드 연결 가능하도록 레이어 분리
- 기록 저장: localStorage (Supabase 전환용 스키마: `supabase/schema.sql`)

## 실행

```bash
npm install
npm run dev   # http://localhost:3000
npm run build # 프로덕션 빌드 (Vercel 배포 가능)
```

## 원칙

- 점수는 **착장과 상황의 적합성만** 평가하며 얼굴·체형·외모는 평가하지 않습니다.
- 업로드한 사진은 코디 분석에만 사용되며, 기록 저장은 기기(localStorage) 안에서만 이루어집니다.
  사진 저장 여부는 마이페이지에서 끌 수 있습니다.
