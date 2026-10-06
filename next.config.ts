import type { NextConfig } from "next";

/**
 * Baseline response headers. No X-Frame-Options / frame-ancestors: the
 * 미래에이아이랩 site previews its demos in an iframe.
 */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Preview images read their font subset and photo copies from assets/ at runtime
  outputFileTracingIncludes: {
    "/og/result": ["./assets/**/*"],
    "/opengraph-image": ["./assets/**/*"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
