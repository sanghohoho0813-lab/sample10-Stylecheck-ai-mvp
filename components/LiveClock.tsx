"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];

function format(now: Date) {
  const y = now.getFullYear();
  const mo = now.getMonth() + 1;
  const d = now.getDate();
  const weekday = WEEKDAYS[now.getDay()];
  const h24 = now.getHours();
  const meridiem = h24 < 12 ? "오전" : "오후";
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    date: `${y}년 ${mo}월 ${d}일`,
    weekday: `${weekday}요일`,
    time: `${meridiem} ${pad(h)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`,
  };
}

/**
 * Live date / weekday / clock ticking to the second.
 * Renders nothing until mounted so server and client markup always match.
 */
export default function LiveClock({ tone = "light" }: { tone?: "light" | "dark" }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const dim = tone === "dark" ? "text-white/60" : "text-ink-faint";
  const strong = tone === "dark" ? "text-white" : "text-ink";
  const accent = tone === "dark" ? "text-rose-soft" : "text-rose-deep";

  if (!now) {
    return (
      <div className="flex items-center gap-2" aria-hidden>
        <span className={`h-3.5 w-40 animate-pulse-soft rounded-full ${tone === "dark" ? "bg-white/20" : "bg-linen"}`} />
      </div>
    );
  }

  const { date, weekday, time } = format(now);

  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 sm:gap-x-2.5" role="status" aria-live="off">
      <span className={`whitespace-nowrap text-[0.5625rem] font-medium sm:text-[0.75rem] ${dim}`}>{date}</span>
      <span className={`whitespace-nowrap text-[0.5625rem] font-semibold sm:text-[0.75rem] ${accent}`}>{weekday}</span>
      <span
        className={`whitespace-nowrap font-display text-[0.75rem] font-semibold tabular-nums sm:text-[1.1rem] ${strong}`}
        suppressHydrationWarning
      >
        {time}
      </span>
    </div>
  );
}
