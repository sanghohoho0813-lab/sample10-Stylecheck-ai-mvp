"use client";

import Link from "next/link";
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
    <header className="sticky top-0 z-40 border-b border-linen/80 bg-ivory/90 backdrop-blur-md md:top-10">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <span className="font-display text-[1.2rem] font-semibold tracking-tight text-ink sm:text-[1.35rem]">
            StyleCheck <em className="not-italic text-rose">AI</em>
          </span>
        </Link>

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
      </div>
    </header>
  );
}
