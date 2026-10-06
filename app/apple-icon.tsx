import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/** Home-screen icon — the same hanger-and-check mark as app/icon.svg, full bleed for iOS masking. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#f9edef" }}>
        <svg width="180" height="180" viewBox="0 0 64 64">
          <path
            d="M 32 14 Q 37 14 37 18.5 Q 37 21.5 32 23.5 M 32 23.5 L 12 33 Q 10 34.2 12 35.5 L 52 35.5 Q 54 34.2 52 33 Z"
            fill="none"
            stroke="#d2697f"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="46" cy="47" r="9" fill="#d2697f" />
          <path d="M 42.5 47 L 45 49.5 L 50 44.5" fill="none" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size
  );
}
