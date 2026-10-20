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

**사진** → **상황** → **판정**. 필수 입력은 사진 한 장과 상황 하나뿐이에요.

- 첫 화면에서 바로 촬영하거나 앨범에서 고르면, 사진 단계는 끝난 상태로 코디 확인이 '상황'에서 시작돼요.
- 상황을 고르면 그 상황이 이미 말해주는 것(면접 = 회사·처음 만나는 사람)은 다시 묻지 않아요.
  남은 질문만 '선택 사항'으로 보여주고, 계절은 오늘 날짜로 채워요.
- 결과는 **괜찮은가 → 왜 → 무엇 하나를 바꾸면 되는가** 순서예요. 점수는 보조 정보로 작게 보여줘요.
- **한 가지만 바꾼다면** 카드에는 지금 → 바꿀 것, 왜, 달라지는 점, 내 옷장, 그리고 '이게 없다면' 대안이 들어 있어요.
- **추천대로 바꿔 입기**를 누르면 화면이 적용 후 상태(적합도 84 → 92, "이제 결혼식에 딱 맞아요")로 바뀌고 기록에 남아요.
- 결과에서 **바꿔 입고 다시 확인하기**를 누르면 같은 상황·답변으로 새 사진만 받아요. 외출 직전에 다시 확인하는 흐름이에요.

| 행동 | 바뀌는 상태 | 다시 확인하는 곳 |
|---|---|---|
| 코디 판정 | 기록 1건 생성 | 기록 · 마이 통계 |
| 세부 조건 선택(선택 사항) | 점수 가감 + 이유(`ConditionNote`) | 결과 "핵심 이유" · 자세히 보기 "고른 조건이 바꾼 점수" |
| 추천대로 바꿔 입기 / 되돌리기 | `appliedAt` | 결과(적용 전/후) · 기록 "바꿔 입음" 필터·카드 · 마이 통계 · 스타일 패턴 |
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

**판정은 친구의 말투로, 점수보다 먼저.** `lib/advice.ts`가 점수 구간별 판정 한 줄과 조언 한 문장을 만들어요
(예: "결혼식에 잘 맞는 코디예요." / "다만 구두만 블랙 스트레이트팁으로 바꾸면 재킷과 톤이 이어져 격식이 한 단계 올라가요.").
추천마다 `action`(무엇을 어떻게)과 `effect`(무엇이 달라지는지)를 따로 두어 문장이 자연스럽게 이어져요.
결과 화면, 공유받은 화면, 공유 메시지, 링크 미리보기가 모두 같은 문장을 써요.

**스타일 패턴은 데이터가 말하는 만큼만.** `lib/insights.ts`는 기록이 3개 이상일 때만 패턴을 보여주고,
모든 문장에 근거 숫자를 붙여요("최근 4번 중 2번, 신발·소품이 가장 아쉬웠어요", "추천 4번 중 2번을 실제로 바꿔 입었어요").
조건을 채우지 못하는 패턴은 아예 만들지 않아요.

**사진을 가장 먼저 존중한다.** 업로드 사진은 3:4로 자르지 않고 전체를 보여줘요. 잘라내면 조언의 대상인 신발이나 가방이 잘릴 수 있어서예요.
EXIF 회전은 브라우저 디코딩에 맡기고, 투명 PNG는 흰 배경 위에 그려요.
어두운 사진·가로 사진·작은 사진은 픽셀 정보만으로 판단해 다시 찍기 팁을 줘요(옷을 인식하지는 않아요).

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
| 단위 테스트 (78) | `lib/__tests__` — 모든 샘플 × 계절 × 조건 조합에서 점수 범위, "바꾸면 좋아진다", 대안 < 추천, 조건 점수 = 설명된 점수 합. 판정·조언 문장(모든 샘플·업로드 템플릿에서 한 문장으로 끝나는지), 상황별 질문, 스타일 패턴의 데이터 기준. 공유 링크 왕복·변조 거부. 저장 계층의 마이그레이션·용량 초과·차단 대응. 한국어 조사·날짜 |
| E2E (56) | `e2e/` — phone(390, 터치)·desktop(1280) 프로젝트. 첫 화면 사진 → 상황 → 판정 → 바꿔 입기 → 저장 → 공유 → 기록 전체 여정, 휴대폰 결과 화면의 하단 실행 바, 상황별 질문, 사진 팁, 뒤로/앞으로/새로고침, 다시 확인하기, 깨끗한 기기에서 공유 링크·미리보기, 빈·오류 상태, 키보드 경로, 휴대폰에서 화면이 옆으로 넓어지지 않는지(레이아웃 뷰포트 폭) |
| CI | `.github/workflows/ci.yml` — lint · typecheck · unit → build · E2E (실패 시 리포트 업로드) |
| 접근성 | 본문 바로가기, 상황 선택의 WAI-ARIA radio 키보드 패턴(화살표·Home·End), 단계 전환 시 제목으로 포커스, `aria-live` 로딩·토스트, 텍스트 색 대비 4.5:1 이상, `prefers-reduced-motion` |
| 성능 | 샘플 사진은 `next/image`(AVIF/WebP, 크기별 srcset, 접힘 위만 priority)이고 불러오는 동안 사진마다의 배경색(`lib/look-tints.ts`)을 먼저 칠함. 기기 사진은 data URL 그대로. 클라이언트 로딩 화면의 스켈레톤이 실제 레이아웃과 같아 CLS ≈ 0 |
| 안정성 | 라우트·전역 에러 경계, 친절한 404·결과 없음·공유 링크 손상 화면, 파일 형식·용량 검증, 투명 PNG 처리 |
| 보안 | `nosniff` · `Referrer-Policy` · `Permissions-Policy` · HSTS, `X-Powered-By` 제거. 미래에이아이랩 사이트가 데모를 iframe으로 보여주므로 frame 제한은 두지 않음. 프로덕션 의존성 취약점 0 (`npm audit --omit=dev`) |

## 구조

```
app/
  page.tsx · check/ · result/[id]/ · history/ · mypage/ · guide/   화면
  og/result/route.ts · opengraph-image.tsx · apple-icon.tsx · manifest.ts
  error.tsx · global-error.tsx · not-found.tsx
components/          UI (LookImage, OccasionGrid, SituationStep, HeroQuickStart, GuideNav, Toast, SampleBridgeCTA …)
lib/
  style-engine.ts    데모 분석 엔진 (조건 규칙 applyConditions)
  advice.ts          판정 한 줄 · 조언 한 문장 · 공유 메시지
  insights.ts        기록 기반 스타일 패턴 (데이터 기준 충족 시에만)
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

### 화면별 방향

화면마다 역할이 달라 레이아웃 원칙도 나눴습니다. 모두 같은 토큰·컴포넌트를 씁니다.

| 화면 | 방향 | 핵심 |
|---|---|---|
| 홈 | 비주얼 + 행동 | 첫 화면에 촬영 버튼과 실제 판정 결과 카드. 데스크톱은 코디 사진 위에 판정 카드를 겹친 구성. 샘플은 휴대폰에서 가로로 넘기는 선반, 태블릿부터 그리드. 상황은 아이콘 그리드 |
| 코디 확인 | 기능 | 한 화면에 한 가지 결정. 휴대폰은 하단 고정 버튼, 데스크톱 상황 단계는 판정할 사진을 옆에 크게 고정 |
| 결과 | 하이브리드 | 판정 → 이유 → 바꿀 한 가지 순서. 휴대폰은 탭 바 대신 저장 · 물어보기 · 주 행동이 있는 하단 실행 바(상세 화면 패턴). 바꿔 입은 뒤에는 "다시 확인하기"가 주 행동이 됨 |
| 기록 | 비주얼 | 휴대폰은 읽기 쉬운 목록, 태블릿부터 사진이 먼저 보이는 룩북 카드 |
| 가이드 · 마이 | 정보 | 텍스트 위계와 여백 중심, 장식 없음 |

### 미래AI랩 브랜딩

상단 브랜드 바 · 푸터 · 흐름을 마친 뒤의 브릿지 CTA 세 곳에만 둡니다. 코디 확인 도중에는 노출하지 않습니다.
링크는 `lib/mirae-links.ts`, 문구는 `components/SampleBridgeCTA.tsx`의 `CTA_COPY`에서 바꿉니다.
`public/mirae-history-nav.js`는 미래AI랩 데모 공용 뒤로·앞으로 버튼입니다(공용 파일이라 lint 제외).

## 환경 변수

| 이름 | 용도 |
|---|---|
| `NEXT_PUBLIC_SITE_URL` | 링크 미리보기의 절대 URL. Vercel에서는 `VERCEL_PROJECT_PRODUCTION_URL`을 자동 사용 |
| `PW_CHROMIUM_PATH` | (선택) E2E에 이미 설치된 Chromium 사용 |
