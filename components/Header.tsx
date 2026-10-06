"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

// "코디 확인" is the primary action, so it lives in the button — not repeated as a nav link.
const NAV = [
  { href: "/guide", label: "스타일 가이드" },
  { href: "/history", label: "기록" },
  { href: "/mypage", label: "마이페이지" },
];

export default function Header() {
  const pathname = usePathname() ?? "/";
  const inFlow = pathname.startsWith("/check");

  return (
    <header className="sticky top-0 z-40 border-b border-linen/80 bg-ivory/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:h-16 md:px-8">
        <Link href="/" className="shrink-0 font-display text-title font-semibold tracking-tight text-ink">
          StyleCheck <em className="not-italic text-rose">AI</em>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="주요 메뉴">
          {NAV.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-full px-4 py-2 text-body-sm transition-colors duration-200 ${
                  active ? "font-semibold text-rose-deep" : "font-medium text-ink-soft hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {/* Already inside the check flow — don't offer to start it again */}
          {!inFlow && (
            <Link
              href="/check"
              className="btn btn-xs btn-primary ml-3 px-5"
            >
              코디 확인하기
            </Link>
          )}
        </nav>

        {/* Phones: the bottom tab bar carries navigation; inside the check flow
            the only header action is a way out. */}
        {inFlow && (
          <Link
            href="/"
            aria-label="코디 확인 닫기"
            className="-mr-2 flex h-10 w-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-blush md:hidden"
          >
            <X className="h-5 w-5" />
          </Link>
        )}
      </div>
    </header>
  );
}
