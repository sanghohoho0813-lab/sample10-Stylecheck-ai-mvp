import type { Metadata, Viewport } from "next";
import "./globals.css";
import BrandBar from "@/components/BrandBar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import { ToastProvider } from "@/components/Toast";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "StyleCheck AI — 오늘 이 옷, 괜찮을까요?",
    template: "%s — StyleCheck AI",
  },
  description:
    "사진과 상황을 알려주면 지금 코디가 그 자리에 얼마나 잘 맞는지 확인해드려요. 미래에이아이랩 MVP 샘플.",
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
          <BrandBar />
          <Header />
          {/* Room for the fixed bottom bar on phones (tab bar, or the check flow's action bar) */}
          <div className="pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
            <main>{children}</main>
            <SiteFooter />
          </div>
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
