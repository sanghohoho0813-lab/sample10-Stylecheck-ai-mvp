/**
 * 미래AI랩 브릿지 링크.
 *
 * 샘플 페이지 하단 CTA(`components/SampleBridgeCTA.tsx`)가 사용하는 이동 경로입니다.
 * 주소가 바뀌면 이 파일의 세 값만 수정하면 모든 페이지에 한 번에 반영됩니다.
 */
export const MIRAE_LINKS = {
  /** 메인 CTA — "우리 회사도 만들어보기" */
  consult: "https://miraeailab.com/business-diagnosis",
  /** 서브 링크 — "다른 샘플 보기" */
  samples: "https://miraeailab.com/business-services",
  /** 서브 링크 — "미래AI랩 홈페이지" */
  home: "https://miraeailab.com/",
} as const;
