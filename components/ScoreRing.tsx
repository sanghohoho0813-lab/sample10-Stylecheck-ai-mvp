"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  score: number;
  size?: number;
  stroke?: number;
  animate?: boolean;
  className?: string;
}

/** Large circular score gauge with count-up animation. */
export default function ScoreRing({ score, size = 176, stroke = 10, animate = true, className = "" }: Props) {
  const [display, setDisplay] = useState(animate ? 0 : score);
  const [mounted, setMounted] = useState(!animate);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    if (!animate) {
      setDisplay(score);
      return;
    }
    setMounted(true);
    const duration = 1300;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(score * eased));
      if (p < 1) frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
    return () => {
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [score, animate]);

  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const progress = mounted ? score / 100 : 0;
  // `size` is a design-time px value rendered in rem so the ring grows with
  // the global type scale instead of staying pinned to CSS pixels.
  const rem = (px: number) => `${px / 16}rem`;

  return (
    <div
      className={`relative inline-flex items-center justify-center ${className}`}
      style={{ width: rem(size), height: rem(size) }}
    >
      <svg width={rem(size)} height={rem(size)} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-blush-deep)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--color-rose)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - progress)}
          className="ring-progress"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display font-semibold leading-none text-ink" style={{ fontSize: rem(size * 0.3) }}>
          {display}
        </span>
        <span className="mt-1 text-ink-faint" style={{ fontSize: rem(Math.max(11, size * 0.08)) }}>
          /100
        </span>
      </div>
    </div>
  );
}
