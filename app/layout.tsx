import type { Metadata, Viewport } from "next";
import "./globals.css";
import BrandBar from "@/components/BrandBar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import { ToastProvider } from "@/components/Toast";
import Script from "next/script";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");
const DESCRIPTION =
  "사진과 상황을 알려주면 지금 코디가 그 자리에 얼마나 잘 맞는지 확인해드려요. 미래에이아이랩 MVP 샘플.";

export const metadata: Metadata = {
  // Absolute URLs for link previews (opengraph-image, /og/result)
  metadataBase: new URL(SITE_URL),
  title: {
    default: "StyleCheck AI — 오늘 이 옷, 괜찮을까요?",
    template: "%s — StyleCheck AI",
  },
  description: DESCRIPTION,
  applicationName: "StyleCheck AI",
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "StyleCheck AI",
    title: "StyleCheck AI — 오늘 이 옷, 괜찮을까요?",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#fbf7f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- App Router root layout: applies to every route */}
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif+KR:wght@400;500;600&family=Noto+Sans+KR:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="min-h-screen">
        {/* 미래AI랩 데모 공용 뒤로·앞으로 버튼 */}
        <Script src="/mirae-history-nav.js" strategy="beforeInteractive" />
        <ToastProvider>
          <a
            href="#main"
            className="sr-only z-[2147483002] rounded-full bg-ink px-4 py-2 text-body-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-3"
          >
            본문 바로가기
          </a>
          <BrandBar />
          <Header />
          {/* Room for the fixed bottom bar on phones (tab bar, or the check flow's action bar) */}
          <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <main id="main" tabIndex={-1} className="outline-none">
              {children}
            </main>
            <SiteFooter />
          </div>
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
