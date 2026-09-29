"use client";

import { useEffect, useState } from "react";

const WEEKDAYS = ["일", "월", "화", "수", "목", "금", "토"];
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Live date / weekday / time to the second — secondary information, so it is
 * set small and muted. Phones get a compact form that fits on one line with
 * the brand mark. Renders a fixed-width placeholder until mounted so server
 * and client markup always match.
 */
export default function LiveClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  if (!now) {
    return <span className="inline-block h-4 w-32 rounded-full bg-linen/70" aria-hidden />;
  }

  const wd = WEEKDAYS[now.getDay()];
  const h24 = now.getHours();
  const time = `${pad(h24)}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
  const full = `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${wd}요일`;

  return (
    <time dateTime={now.toISOString()} className="whitespace-nowrap text-meta tabular-nums text-ink-faint">
      <span className="sm:hidden">
        {now.getMonth() + 1}.{now.getDate()} ({wd})
      </span>
      <span className="hidden sm:inline">{full}</span>
      <span className="ml-2 font-medium text-ink-soft">{time}</span>
    </time>
  );
}
