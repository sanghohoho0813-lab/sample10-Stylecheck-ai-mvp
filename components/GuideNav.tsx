"use client";

import { useEffect, useRef, useState } from "react";
import { OCCASIONS } from "@/lib/occasions";
import { OccasionIcon, OccasionLabel } from "./OccasionIcon";

/** Id of the guide section currently under the sticky header. */
function useActiveSection(offset = 160): string {
  const [active, setActive] = useState<string>(OCCASIONS[0].id);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      let current: string = OCCASIONS[0].id;
      for (const o of OCCASIONS) {
        const el = document.getElementById(o.id);
        if (el && el.getBoundingClientRect().top - offset <= 0) current = o.id;
      }
      // At the very bottom the last short sections can never reach the offset.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const hash = window.location.hash.slice(1);
        if (OCCASIONS.some((o) => o.id === hash)) current = hash;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("hashchange", update);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("hashchange", update);
      cancelAnimationFrame(frame);
    };
  }, [offset]);

  return active;
}

/** Phones and tablets: one sticky, horizontally scrolling row under the header. */
export function GuideChipBar() {
  const active = useActiveSection();
  const row = useRef<HTMLDivElement>(null);

  // Keep the current chip in view as the page scrolls.
  useEffect(() => {
    const el = row.current;
    const chip = el?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    if (!el || !chip) return;
    el.scrollTo({ left: chip.offsetLeft - el.clientWidth / 2 + chip.clientWidth / 2, behavior: "smooth" });
  }, [active]);

  return (
    <nav
      aria-label="상황 바로가기"
      className="sticky top-14 z-30 -mx-5 border-b border-linen bg-cream/95 backdrop-blur-md md:top-16 md:-mx-8 lg:hidden"
    >
      <div ref={row} className="no-scrollbar flex gap-2 overflow-x-auto px-5 py-2.5 md:px-8">
        {OCCASIONS.map((o) => {
          const on = o.id === active;
          return (
            <a
              key={o.id}
              href={`#${o.id}`}
              data-id={o.id}
              aria-current={on ? "location" : undefined}
              className={`chip h-9 shrink-0 px-3.5 ${on ? "border-ink bg-ink text-white" : "chip-off"}`}
            >
              {o.label}
            </a>
          );
        })}
      </div>
    </nav>
  );
}

/** Desktop: a quiet table of contents that follows the reader. */
export function GuideSideNav() {
  const active = useActiveSection(140);
  return (
    <nav aria-label="상황 목록" className="sticky top-24 hidden self-start lg:block">
      <ul className="space-y-0.5 border-l border-linen">
        {OCCASIONS.map((o) => {
          const on = o.id === active;
          return (
            <li key={o.id}>
              <a
                href={`#${o.id}`}
                aria-current={on ? "location" : undefined}
                className={`-ml-px flex items-center gap-2.5 border-l-2 py-1.5 pl-4 text-body-sm transition-colors duration-150 ${
                  on ? "border-rose-deep font-semibold text-rose-deep" : "border-transparent text-ink-soft hover:text-ink"
                }`}
              >
                <OccasionIcon id={o.id} className="h-4 w-4 shrink-0" />
                <OccasionLabel label={o.label} />
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
