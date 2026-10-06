"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import LookImage from "./LookImage";

const STAGES = [
  "전체적인 스타일 균형을 보고 있어요",
  "상황에 맞는 격식 수준을 비교하고 있어요",
  "컬러와 아이템 조합을 확인하고 있어요",
  "한 가지만 바꾼다면 무엇이 좋을지 찾고 있어요",
];

const STAGE_MS = 700;

export default function AnalysisLoading({ image, onDone }: { image: string; onDone: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length) {
      const t = setTimeout(onDone, 350);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [stage, onDone]);

  const progress = Math.min(100, (stage / STAGES.length) * 100);

  return (
    <div className="flex animate-fade-in flex-col items-center pt-2 text-center" aria-busy="true">
      <div className="relative w-40 overflow-hidden rounded-lg md:w-48">
        <LookImage src={image} alt="확인 중인 코디 사진" sizes="192px" className="w-full" priority />
        {/* A single scan line — the only motion that says "reading the photo" */}
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white/0 via-white/35 to-white/0"
          style={{
            transform: `translateY(${(stage % 2 === 0 ? 0 : 3) * 100}%)`,
            transition: `transform ${STAGE_MS}ms ease-in-out`,
          }}
          aria-hidden
        />
      </div>

      <h1 id="step-title" tabIndex={-1} className="outline-none mt-8 font-display text-title font-semibold text-ink md:text-section">코디를 확인하고 있어요</h1>

      <div
        className="mt-5 h-1 w-48 overflow-hidden rounded-full bg-blush-deep"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div className="h-full rounded-full bg-rose transition-[width] duration-500 ease-out" style={{ width: `${progress}%` }} />
      </div>

      <ol className="mt-7 w-full max-w-xs space-y-3 text-left" aria-live="polite">
        {STAGES.map((text, i) => {
          if (i > stage) return null;
          const done = i < stage;
          return (
            <li
              key={text}
              className={`flex items-start gap-2.5 text-body-sm ${done ? "text-ink-faint" : "animate-fade-up font-semibold text-ink"}`}
            >
              {done ? (
                <Check className="mt-1 h-4 w-4 shrink-0 text-sage" strokeWidth={2.5} />
              ) : (
                <span className="mt-2 h-2 w-2 shrink-0 animate-pulse-soft rounded-full bg-rose" />
              )}
              {text}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
