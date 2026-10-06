import type { Metadata } from "next";
import { OCCASION_MAP } from "@/lib/occasions";
import { resultFromShare } from "@/lib/share";
import { verdictFor } from "@/lib/style-engine";
import ResultView from "./ResultView";

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ share?: string | string[] }>;
}

const shareCode = (value: string | string[] | undefined) => (typeof value === "string" ? value : undefined);

/**
 * Owners' results live in their browser, so the server only knows a result
 * when it arrives as a share link — that is exactly when a chat app asks for
 * the preview, so the preview carries the verdict.
 */
export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { id } = await params;
  const share = shareCode((await searchParams).share);
  const result = share ? resultFromShare(share, id) : null;
  if (!result || !share) return { title: "판정 결과", robots: { index: false } };

  const occasion = OCCASION_MAP[result.occasion].label;
  const title = `${occasion} 코디 ${result.overallScore}점 — ${verdictFor(result.overallScore)}`;
  const rec = result.primaryRecommendation;
  const description = `한 가지만 바꾼다면: ${rec.from} → ${rec.to} (${rec.scoreAfter}점). 친구가 StyleCheck AI로 확인한 코디예요.`;
  const image = { url: `/og/result?share=${share}`, width: 1200, height: 630, alt: title };
  return {
    title,
    description,
    robots: { index: false },
    openGraph: { title, description, images: [image], type: "article" },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export default async function ResultPage({ params, searchParams }: Props) {
  const { id } = await params;
  return <ResultView id={id} share={shareCode((await searchParams).share)} />;
}
