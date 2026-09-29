# StyleCheck AI — 상황별 코디 적합도 판정 MVP

> **미래에이아이랩 MVP 샘플 프로젝트**
> "오늘 이 옷, 괜찮을까요?" — 사진과 가는 곳을 알려주면 지금 코디가 그 자리에 얼마나 잘 맞는지,
> 무엇 하나를 바꾸면 좋을지 알려주는 스타일 도우미.

## 핵심 흐름 (Golden Path)

사진 → 상황(12종) → 조건(만나는 사람·장소·무드·계절) → 판정
→ **결론**(적합도·판정) → **이유**(잘 맞는 점 / 바꿀 점) → **다음 행동**(한 가지만 바꾼다면)
→ **추천대로 바꿔 입기**(완료 이벤트) → 저장·공유 → 기록에서 다시 확인

완료 이벤트는 실제 상태를 바꿉니다.

| 행동 | 바뀌는 상태 | 다시 확인하는 곳 |
|---|---|---|
| 코디 판정 | 기록 1건 생성 | 기록 · 마이 통계 |
| 추천대로 바꿔 입기 / 되돌리기 | `appliedAt` 저장 | 결과 화면 · 기록 "추천 적용" 필터 · 마이 통계 |
| 저장 | `favorite` | 기록 "저장한 코디" 필터 · 마이 통계 |
| 기록 삭제 / 되돌리기 | 기록 제거 · 복원 | 기록 · 마이 통계 |
| 선호 스타일 선택 | 선호 무드 저장 | 코디 확인의 "원하는 느낌" 기본값 |
| 데모 데이터 초기화 | 전체 초기화 후 샘플 기록 재생성 | 기록 · 마이 |

모든 상태는 브라우저 localStorage에 저장되어 새로고침 후에도 유지됩니다.
처음 방문하면 오늘 기준 2·5·9일 전 샘플 기록 3건이 채워진 상태로 시작합니다.

## 정직한 데모 표기

- 판정은 **규칙 기반 데모 엔진**(`lib/style-engine.ts`)이 만듭니다. 업로드한 사진을 실제로 인식하지 않으며,
  같은 사진·같은 조건이면 항상 같은 결과가 나옵니다. 업로드 단계와 결과 화면에 이를 안내합니다.
- 엔진 함수(`analyzeOutfitImage` / `evaluateOccasionFit` / `generateStyleFeedback` / `generateAlternatives`)는
  실제 Vision/LLM API와 같은 결과 스키마를 쓰도록 분리되어 있어, 연동 시 화면 구조를 그대로 재사용합니다.
- 점수는 착장과 상황의 적합성만 평가하며 얼굴·체형 등 외모는 평가하지 않습니다.

## 구조

```
app/                 페이지 (홈, 코디 확인, 판정 결과, 가이드, 기록, 마이, 404)
components/          공용 UI (BrandBar, Header, MobileNav, SiteFooter, SampleBridgeCTA …)
lib/style-engine.ts  데모 분석 엔진
lib/storage.ts       로컬 저장 · 데모 시드 · 초기화 (supabase/schema.sql 과 같은 구조)
lib/wardrobe.ts      데모 옷장 — 엔진·결과·마이페이지가 함께 참조
lib/guides.ts        12개 상황 스타일 가이드
lib/mirae-links.ts   미래AI랩 브릿지 CTA 링크
```

### 디자인 토큰 (`app/globals.css`)

- **Type scale** — 역할 기반: `text-caption`(13) `meta`(14) `body-sm`(15) `body`(17) `lead`(18) `title`(20)
  `section`(26) `page`(32) `display`(40) `hero`(56). 기본 Tailwind 크기는 비활성화되어 있어 이 스케일만 쓸 수 있습니다.
- **Radius** — `rounded-sm`(12) `md`(20) `lg`(28) · **Shadow** — `subtle` `raised` `overlay` `cta`
- **Color** — rose 브랜드 한 계열 + cream→ink 중립 + 상태색(sage 좋음 / gold 조정 / danger 삭제)

### 미래AI랩 브랜딩 위치

상단 브랜드 바 · 푸터 · 핵심 흐름을 마친 뒤의 브릿지 CTA — 세 곳으로 한정합니다.
코디 확인 흐름(`/check`) 도중에는 브릿지 CTA와 푸터를 노출하지 않습니다.
링크는 `lib/mirae-links.ts`, 문구는 `components/SampleBridgeCTA.tsx`의 `CTA_COPY`에서 수정합니다.

## 실행 · 검사

```bash
npm install
npm run dev        # http://localhost:3000
npm run lint       # ESLint (next/core-web-vitals + typescript)
npm run typecheck  # tsc --noEmit
npm run build      # 프로덕션 빌드 (Vercel 배포 가능)
```

기술 스택: Next.js 15 (App Router) · TypeScript · Tailwind CSS v4 · Lucide Icons
