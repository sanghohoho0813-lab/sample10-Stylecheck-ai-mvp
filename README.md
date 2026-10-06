# StyleCheck AI — 상황별 코디 적합도 판정 MVP

[![CI](https://github.com/sanghohoho0813-lab/sample10-Stylecheck-ai-mvp/actions/workflows/ci.yml/badge.svg)](https://github.com/sanghohoho0813-lab/sample10-Stylecheck-ai-mvp/actions/workflows/ci.yml)

> **미래에이아이랩 MVP 샘플 프로젝트**
> "오늘 이 옷, 괜찮을까요?" — 사진과 가는 곳을 알려주면 지금 코디가 그 자리에 얼마나 잘 맞는지,
> 무엇 하나를 바꾸면 좋을지 알려주는 스타일 도우미.

Next.js 15 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · Vitest · Playwright

```bash
npm ci
npm run dev            # http://localhost:3000
npm run check          # lint + typecheck + unit tests
npm run build && npm run test:e2e   # 프로덕션 빌드로 E2E (phone + desktop)
```

---

## 핵심 흐름

사진 → 상황(12종) → 조건(만나는 사람·장소·느낌·계절) → **결론**(적합도·판정) → **이유** →
**한 가지만 바꾼다면** → **추천대로 바꿔 입기**(완료 이벤트) → 저장·공유 → 기록

| 행동 | 바뀌는 상태 | 다시 확인하는 곳 |
|---|---|---|
| 코디 판정 | 기록 1건 생성 | 기록 · 마이 통계 |
| 조건 선택 | 점수 가감 + 이유(`ConditionNote`) | 결과 "핵심 이유" · 자세히 보기 "고른 조건이 바꾼 점수" |
| 추천대로 바꿔 입기 / 되돌리기 | `appliedAt` | 결과 · 기록 "추천 적용" 필터 · 마이 통계 |
| 저장 | `favorite` | 기록 "저장한 코디" 필터 · 마이 통계 |
| 친구에게 물어보기 | 공유 링크 (사진 제외) | 다른 기기에서 같은 판정 + 링크 미리보기 이미지 |
| 기록 삭제 / 되돌리기 | 제거 · 같은 위치로 복원 | 기록 · 마이 통계 |
| 선호 스타일 | 선호 무드 | 코디 확인 "원하는 느낌" 기본값 |
| 데모 데이터 초기화 | 전체 초기화 + 샘플 기록 재생성 | 기록 · 마이 |

## 설계 결정

**결과 데이터는 기기에 남는다.** 로그인 없는 MVP라 기록은 `localStorage`(`lib/storage.ts`)에 두고,
구조는 `supabase/schema.sql`과 맞춰 두었습니다. 저장 계층은 실패를 전제로 짰습니다.

- 저장 공간이 차면 오래된 기록의 *사진만* 먼저 비우고(기록·점수는 유지) 사용자에게 알립니다.
- `localStorage`가 막힌 환경(쿠키 차단 등)에서는 탭 메모리로 계속 동작합니다.
- 이전 빌드가 쓴 기록은 검증해서 화면에 그릴 수 없는 항목만 건너뜁니다. 데모 시드는 현재 엔진으로 다시 만듭니다.

**공유는 서버 없이 동작한다.** 기록이 기기에만 있으니 `/result/<id>`만 보내면 친구 화면은 비어 있습니다.
공유 링크(`lib/share.ts`)는 엔진 입력(샘플 id 또는 이미지 키·상황·조건)과 숫자만 base64url로 담습니다.
받는 쪽은 같은 결정적 엔진으로 문구를 다시 만들고 숫자는 고정해 두 사람이 같은 판정을 봅니다.
사진은 링크에 들어가지 않습니다. 변조된 코드는 거부하고 안내 화면을 보여줍니다.
링크를 채팅에 붙이면 `/og/result`가 점수·판정·바꿀 한 가지가 담긴 미리보기 이미지를 그립니다(`lib/og.tsx`).

**엔진은 정직한 데모다.** `lib/style-engine.ts`는 규칙 기반·결정적 엔진입니다. 업로드 사진을 인식하지 않으며
화면에 "데모 분석"으로 표기합니다. 조건은 명시적 규칙으로만 점수를 움직이고, 움직인 만큼을 문장과 점수로 돌려줍니다.
예를 들어 계절이 맞지 않으면 −3/−6, 격식을 요구하는 자리인데 격식이 낮으면 −3~−5입니다.
결과 스키마가 실제 Vision/LLM 연동 때와 같아서, `analyzeOutfitImage`만 바꾸면 화면·저장·공유를 그대로 씁니다.

**흐름은 브라우저처럼 움직인다.** 코디 확인의 각 단계는 history 항목이라 휴대폰 뒤로가기가 한 단계씩 돌아갑니다.
진행 중 입력은 `sessionStorage` 초안으로 새로고침 뒤에도 이어집니다. 결과가 나오면 단계 기록을 걷어내고
결과로 교체하므로, 결과에서 뒤로가면 확인을 시작한 화면(홈·기록·가이드)으로 갑니다.

## 품질

| 영역 | 내용 |
|---|---|
| 단위 테스트 (57) | `lib/__tests__` — 모든 샘플 × 계절 × 조건 조합에서 점수 범위, "바꾸면 좋아진다", 대안 < 추천, 조건 점수 = 설명된 점수 합. 공유 링크 왕복·변조 거부. 저장 계층의 마이그레이션·용량 초과·차단 대응. 한국어 조사·날짜 |
| E2E (42) | `e2e/` — phone(390, 터치)·desktop(1280) 프로젝트. 전체 흐름, 뒤로/앞으로/새로고침, 완료 이벤트 영속성, 깨끗한 기기에서 공유 링크, 빈·오류 상태, 키보드 경로 |
| CI | `.github/workflows/ci.yml` — lint · typecheck · unit → build · E2E (실패 시 리포트 업로드) |
| 접근성 | 본문 바로가기, 상황 선택의 WAI-ARIA radio 키보드 패턴(화살표·Home·End), 단계 전환 시 제목으로 포커스, `aria-live` 로딩·토스트, 텍스트 색 대비 4.5:1 이상, `prefers-reduced-motion` |
| 성능 | 샘플 사진은 `next/image`(AVIF/WebP, 크기별 srcset, 접힘 위만 priority), 기기 사진은 data URL 그대로. 클라이언트 로딩 화면의 스켈레톤이 실제 레이아웃과 같아 CLS ≈ 0 |
| 안정성 | 라우트·전역 에러 경계, 친절한 404·결과 없음·공유 링크 손상 화면, 파일 형식·용량 검증, 투명 PNG 처리 |
| 보안 | `nosniff` · `Referrer-Policy` · `Permissions-Policy` · HSTS, `X-Powered-By` 제거. 미래에이아이랩 사이트가 데모를 iframe으로 보여주므로 frame 제한은 두지 않음. 프로덕션 의존성 취약점 0 (`npm audit --omit=dev`) |

## 구조

```
app/
  page.tsx · check/ · result/[id]/ · history/ · mypage/ · guide/   화면
  og/result/route.ts · opengraph-image.tsx · apple-icon.tsx · manifest.ts
  error.tsx · global-error.tsx · not-found.tsx
components/          UI (LookImage, OccasionGrid, ConditionForm, GuideNav, Toast, SampleBridgeCTA …)
lib/
  style-engine.ts    데모 분석 엔진 (조건 규칙 applyConditions)
  storage.ts         기록 · 설정 · 흐름 초안 저장 계층
  share.ts           기기 간 공유 링크
  og.tsx             링크 미리보기 이미지 (서버 전용)
  demo-samples.ts · occasions.ts · guides.ts · wardrobe.ts   데이터
assets/              미리보기용 폰트 서브셋(OFL) · 사진 JPEG — scripts/subset-og-font.py 로 재생성
e2e/ · lib/__tests__/   테스트
```

### 디자인 시스템 (`app/globals.css`)

- **Type** — 역할 기반 스케일 `caption 13 · meta 14 · body-sm 15 · body 17 · lead 18 · title 20 · section 26 · page 32 · display 40 · hero 56`.
  Tailwind 기본 크기는 꺼 두어 이 스케일만 쓸 수 있습니다.
- **Color** — rose 한 계열 + cream→ink 중립 + 상태색(sage·gold·danger). 글자·채움 색은 4.5:1 이상이고 `rose`는 장식용입니다.
- **Radius** `sm 12 · md 20 · lg 28` · **Shadow** `subtle · raised · overlay · cta`
- **Components** — `btn` + `btn-lg/md/sm/xs` + `btn-primary/secondary/quiet`, 선택형 `chip` + `chip-on/off`

### 미래AI랩 브랜딩

상단 브랜드 바 · 푸터 · 흐름을 마친 뒤의 브릿지 CTA 세 곳에만 둡니다. 코디 확인 도중에는 노출하지 않습니다.
링크는 `lib/mirae-links.ts`, 문구는 `components/SampleBridgeCTA.tsx`의 `CTA_COPY`에서 바꿉니다.
`public/mirae-history-nav.js`는 미래AI랩 데모 공용 뒤로·앞으로 버튼입니다(공용 파일이라 lint 제외).

## 환경 변수

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 링크 미리보기의 절대 URL. Vercel에서는 `VERCEL_PROJECT_PRODUCTION_URL`을 자동 사용 |
| `PW_CHROMIUM_PATH` | (선택) E2E에 이미 설치된 Chromium 사용 |
