import type { Metadata, Viewport } from "next";
import "./globals.css";
import BrandBar from "@/components/BrandBar";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import { ToastProvider } from "@/components/Toast";

export const metadata: Metadata = {
  title: "StyleCheck AI — 오늘 이 옷, 괜찮을까요?",
  description:
    "사진과 상황을 알려주면 지금 코디가 얼마나 잘 맞는지 확인해드려요. 미래에이아이랩 MVP 샘플.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fbf7f4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
        <ToastProvider>
          <BrandBar />
          <Header />
          <main className="pb-24 md:pb-0">{children}</main>
          <MobileNav />
        </ToastProvider>
      </body>
    </html>
  );
}
