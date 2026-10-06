import type { NextRequest } from "next/server";
import { resultPreview, sitePreview } from "@/lib/og";
import { resultFromShare } from "@/lib/share";

/**
 * GET /og/result?share=<code> — preview image for a shared result.
 * The code fully determines the image, so it is cached like a static asset;
 * a damaged code falls back to the site preview instead of erroring.
 */
export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("share") ?? "";
  const result = code.length <= 1024 ? resultFromShare(code, "preview") : null;
  const image = result ? await resultPreview(result) : await sitePreview();
  image.headers.set("Cache-Control", "public, max-age=31536000, immutable");
  return image;
}
