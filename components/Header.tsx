"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/check", label: "코디 확인" },
  { href: "/guide", label: "스타일 가이드" },
  { href: "/history", label: "기록" },
  { href: "/mypage", label: "마이페이지" },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-linen/80 bg-ivory/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 md:px-8">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="font-display text-[1.35rem] font-semibold tracking-tight text-ink">
              StyleCheck <em className="not-italic text-rose">AI</em>
            </span>
          </Link>
          <span className="hidden h-5 w-px bg-linen sm:block" aria-hidden />
          <span className="hidden items-center gap-1.5 rounded-full border border-linen bg-white/70 py-1 pl-1.5 pr-2.5 sm:flex">
            <Image
              src="/mirae-ai-lab-logo.jpg"
              alt="미래에이아이랩 로고"
              width={83}
              height={25}
              className="h-[18px] w-auto rounded-sm"
              priority
            />
            <span className="text-[11px] font-medium text-ink-soft whitespace-nowrap">MVP 샘플</span>
          </span>
        </div>

        <nav className="hidden items-center gap-1 md:flex">
          {NAV.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                  active
                    ? "bg-blush font-semibold text-rose-deep"
                    : "font-medium text-ink-soft hover:bg-blush/60 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          <Link
            href="/check"
            className="ml-2 rounded-full bg-rose px-4 py-2 text-sm font-semibold text-white shadow-rose transition-all duration-200 hover:bg-rose-deep"
          >
            코디 확인하기
          </Link>
        </nav>

        {/* mobile: compact lab badge */}
        <span className="flex items-center gap-1.5 rounded-full border border-linen bg-white/70 py-1 pl-1.5 pr-2 sm:hidden">
          <Image
            src="/mirae-ai-lab-logo.jpg"
            alt="미래에이아이랩 로고"
            width={66}
            height={20}
            className="h-4 w-auto rounded-sm"
          />
          <span className="text-[10px] font-medium text-ink-soft">MVP</span>
        </span>
      </div>
    </header>
  );
}
