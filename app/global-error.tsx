"use client";

/**
 * Last-resort screen when the root layout itself fails. It replaces the whole
 * document, so it carries its own minimal styling instead of the app's CSS.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#fbf7f4",
          color: "#3f3134",
          fontFamily: "system-ui, -apple-system, 'Apple SD Gothic Neo', 'Noto Sans KR', sans-serif",
        }}
      >
        <main style={{ maxWidth: 360, padding: 24, textAlign: "center" }}>
          <h1 style={{ fontSize: 24, margin: 0 }}>잠시 문제가 생겼어요</h1>
          <p style={{ color: "#6a585c", lineHeight: 1.6 }}>새로고침하면 대부분 해결돼요. 기록은 이 기기에 그대로 남아 있어요.</p>
          <button
            type="button"
            onClick={reset}
            style={{
              marginTop: 16,
              height: 48,
              padding: "0 24px",
              border: 0,
              borderRadius: 999,
              background: "#b04a64",
              color: "#fff",
              fontSize: 16,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            다시 시도
          </button>
        </main>
      </body>
    </html>
  );
}
