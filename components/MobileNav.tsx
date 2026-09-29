"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Camera, Clock3, House, User } from "lucide-react";

const ITEMS = [
  { href: "/", label: "홈", icon: House },
  { href: "/guide", label: "가이드", icon: BookOpen },
  { href: "/check", label: "검사", icon: Camera, primary: true },
  { href: "/history", label: "기록", icon: Clock3 },
  { href: "/mypage", label: "마이", icon: User },
];

export default function MobileNav() {
  const pathname = usePathname() ?? "/";

  // The check flow is a focused task with its own sticky action bar.
  if (pathname.startsWith("/check")) return null;

  return (
    <nav
      aria-label="하단 메뉴"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-ivory/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md md:hidden"
    >
      <div className="mx-auto flex h-16 max-w-md items-stretch">
        {ITEMS.map(({ href, label, icon: Icon, primary }) => {
          const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className="flex min-w-0 flex-1 flex-col items-center justify-center gap-1"
            >
              {primary ? (
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-rose text-white">
                  <Icon className="h-[1.1rem] w-[1.1rem]" strokeWidth={2} />
                </span>
              ) : (
                <Icon
                  className={`h-[1.35rem] w-[1.35rem] ${active ? "text-rose-deep" : "text-ink-faint"}`}
                  strokeWidth={active ? 2.1 : 1.7}
                />
              )}
              <span
                className={`text-caption ${
                  active ? "font-semibold text-rose-deep" : primary ? "font-semibold text-ink-soft" : "text-ink-faint"
                }`}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
