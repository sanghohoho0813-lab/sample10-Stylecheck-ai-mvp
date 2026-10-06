import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { OCCASION_MAP } from "./occasions";
import { verdictFor } from "./style-engine";
import type { AnalysisResult } from "./types";

/**
 * Link-preview images (Open Graph) — server only.
 *
 * Shared results are the app's growth loop: a friend sees the preview in a
 * chat before opening anything, so the preview carries the answer itself
 * (score, verdict, the one change). Fonts are a subset of Pretendard built by
 * scripts/subset-og-font.py; look photos are small JPEG copies in assets/og
 * because the renderer does not decode WebP.
 */

export const OG_SIZE = { width: 1200, height: 630 };
export const OG_ALT = "StyleCheck AI — 상황별 코디 적합도 판정";

const ASSETS = path.join(process.cwd(), "assets");

const COLOR = {
  cream: "#fbf7f4",
  blush: "#f9edef",
  linen: "#efe3e1",
  ink: "#3f3134",
  soft: "#6a585c",
  faint: "#7d6a6d",
  rose: "#cf6680",
  deep: "#b04a64",
};

async function fonts() {
  const [medium, bold] = await Promise.all([
    readFile(path.join(ASSETS, "fonts", "og-sans-medium.ttf")),
    readFile(path.join(ASSETS, "fonts", "og-sans-bold.ttf")),
  ]);
  return [
    { name: "OG", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "OG", data: bold, weight: 700 as const, style: "normal" as const },
  ];
}

async function lookPhoto(sampleId?: string): Promise<string | null> {
  if (!sampleId || !/^[a-z-]+$/.test(sampleId)) return null;
  try {
    const jpg = await readFile(path.join(ASSETS, "og", `${sampleId}.jpg`));
    return `data:image/jpeg;base64,${jpg.toString("base64")}`;
  } catch {
    return null;
  }
}

function Photo({ src }: { src: string | null }) {
  const frame = { width: 330, height: 440, borderRadius: 28, display: "flex" } as const;
  if (src)
    // eslint-disable-next-line @next/next/no-img-element -- rendered to PNG by next/og, not in the DOM
    return <img src={src} alt="" width={330} height={440} style={{ ...frame, objectFit: "cover" }} />;
  // The photo itself is never shared — a quiet hanger stands in for it.
  return (
    <div style={{ ...frame, background: COLOR.blush, alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
      <svg width="140" height="90" viewBox="0 0 140 90" fill="none" stroke={COLOR.rose} strokeWidth="6" strokeLinecap="round">
        <path d="M70 8 Q84 8 84 20 Q84 30 70 34" />
        <path d="M70 34 L10 66 Q4 70 10 74 L130 74 Q136 70 130 66 Z" />
      </svg>
      <div style={{ marginTop: 22, fontSize: 24, color: COLOR.faint }}>사진은 공유되지 않아요</div>
    </div>
  );
}

function Frame({ photo, children }: { photo: string | null; children: React.ReactNode }) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        gap: 64,
        padding: "0 88px",
        background: COLOR.cream,
        fontFamily: "OG",
        color: COLOR.ink,
        wordBreak: "keep-all",
      }}
    >
      <Photo src={photo} />
      <div style={{ display: "flex", flexDirection: "column", flex: 1, minWidth: 0 }}>
        {children}
        <div style={{ display: "flex", alignItems: "center", marginTop: 40, fontSize: 24, color: COLOR.faint }}>
          <span style={{ fontWeight: 700, color: COLOR.ink }}>StyleCheck</span>
          <span style={{ fontWeight: 700, color: COLOR.rose, marginLeft: 6 }}>AI</span>
          <span style={{ marginLeft: 16 }}>· 미래에이아이랩 MVP 샘플</span>
        </div>
      </div>
    </div>
  );
}

/** Preview for a shared result: answer first, then the one change. */
export async function resultPreview(result: AnalysisResult) {
  const occasion = OCCASION_MAP[result.occasion].label;
  const rec = result.primaryRecommendation;
  return new ImageResponse(
    (
      <Frame photo={await lookPhoto(result.sampleId)}>
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: COLOR.deep }}>{occasion} 코디 적합도</div>
        <div style={{ display: "flex", alignItems: "flex-end", marginTop: 8 }}>
          <span style={{ fontSize: 150, fontWeight: 700, lineHeight: 1 }}>{result.overallScore}</span>
          <span style={{ fontSize: 34, color: COLOR.faint, marginLeft: 10, marginBottom: 18 }}>/100</span>
        </div>
        <div style={{ display: "flex", fontSize: 46, fontWeight: 700, marginTop: 12 }}>{verdictFor(result.overallScore)}</div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            marginTop: 32,
            padding: "22px 28px",
            borderRadius: 20,
            background: COLOR.blush,
          }}
        >
          <div style={{ display: "flex", fontSize: 22, fontWeight: 700, color: COLOR.deep }}>한 가지만 바꾼다면</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 8, fontSize: 30, fontWeight: 700 }}>
            <span style={{ color: COLOR.faint, textDecoration: "line-through" }}>{rec.from}</span>
            <span style={{ color: COLOR.rose, margin: "0 14px" }}>→</span>
            <span>{rec.to}</span>
            <span style={{ marginLeft: "auto", paddingLeft: 20, color: COLOR.deep }}>{rec.scoreAfter}점</span>
          </div>
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await fonts() }
  );
}

/** Site-wide preview. */
export async function sitePreview() {
  return new ImageResponse(
    (
      <Frame photo={await lookPhoto("wedding-navy")}>
        <div style={{ display: "flex", fontSize: 28, fontWeight: 700, color: COLOR.deep }}>상황별 코디 적합도 체크</div>
        <div style={{ display: "flex", flexDirection: "column", marginTop: 16, fontSize: 84, fontWeight: 700, lineHeight: 1.15 }}>
          <span>오늘 이 옷,</span>
          <span>괜찮을까요?</span>
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 30, color: COLOR.soft, lineHeight: 1.5 }}>
          사진과 가는 곳을 알려주면 적합도와 바꿀 한 가지를 알려드려요.
        </div>
      </Frame>
    ),
    { ...OG_SIZE, fonts: await fonts() }
  );
}
