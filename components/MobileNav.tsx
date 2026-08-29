"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sparkles, BookOpen, Clock3, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "홈", icon: Home },
  { href: "/check", label: "검사", icon: Sparkles, primary: true },
  { href: "/guide", label: "가이드", icon: BookOpen },
  { href: "/history", label: "기록", icon: Clock3 },
  { href: "/mypage", label: "마이", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden">
      <div className="mx-auto flex h-16 max-w-md items-stretch justify-around px-0">
        {ITEMS.map(({ href, label, icon: Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname?.startsWith(href);
          if (primary) {
            return (
              <Link key={href} href={href} className="relative -mt-5 flex min-w-0 flex-1 flex-col items-center justify-start px-0.5">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full shadow-rose transition-transform duration-200 active:scale-90 ${
                    active ? "bg-rose-deep" : "bg-rose"
                  }`}
                >
                  <Icon className="h-5 w-5 text-white" strokeWidth={2.2} />
                </span>
                <span className={`mt-1 text-[0.625rem] font-semibold ${active ? "text-rose-deep" : "text-ink-soft"}`}>
                  {label}
                </span>
              </Link>
            );
          }
          return (
            <Link key={href} href={href} className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1 px-0.5">
              <Icon
                className={`h-5 w-5 transition-colors ${active ? "text-rose-deep" : "text-ink-faint"}`}
                strokeWidth={active ? 2.3 : 1.8}
              />
              <span className={`text-[0.625rem] ${active ? "font-semibold text-rose-deep" : "font-medium text-ink-faint"}`}>
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
