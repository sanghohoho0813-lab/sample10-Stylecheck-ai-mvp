"use client";

import { useEffect, useState } from "react";
import { Check } from "lucide-react";

const STAGES = [
  "전체적인 스타일 균형을 확인하고 있어요.",
  "상황에 맞는 격식 수준을 비교하고 있어요.",
  "컬러와 아이템 조합을 확인하고 있어요.",
  "조금 더 좋은 코디 방법을 찾고 있어요.",
  "분석이 완료되었습니다.",
];

const STAGE_MS = 720;

export default function AnalysisLoading({ image, onDone }: { image: string; onDone: () => void }) {
  const [stage, setStage] = useState(0);

  useEffect(() => {
    if (stage >= STAGES.length - 1) {
      const t = setTimeout(onDone, 500);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => setStage((s) => s + 1), STAGE_MS);
    return () => clearTimeout(t);
  }, [stage, onDone]);

  const progress = ((stage + 1) / STAGES.length) * 100;

  return (
    <div className="animate-fade-in flex flex-col items-center pt-2 text-center">
      <div className="relative">
        <div className="absolute -inset-4 animate-pulse-soft rounded-[2rem] bg-rose-soft/50 blur-xl" aria-hidden />
        <div className="relative overflow-hidden rounded-photo border border-linen bg-white p-2 shadow-lift">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={image} alt="분석 중인 코디 사진" className="aspect-[3/4] w-44 rounded-[1.35rem] object-cover md:w-52" />
          {/* scan line */}
          <div
            className="pointer-events-none absolute inset-x-2 top-2 h-16 rounded-t-[1.35rem] bg-gradient-to-b from-rose/25 to-transparent"
            style={{ transform: `translateY(${(stage % 2 === 0 ? 0.1 : 0.55) * 100}%)`, transition: "transform 0.7s ease-in-out" }}
            aria-hidden
          />
        </div>
      </div>

      <h2 className="mt-8 font-display text-xl font-semibold text-ink md:text-2xl">AI가 코디를 확인하고 있어요</h2>

      <div className="mt-5 h-1.5 w-56 overflow-hidden rounded-full bg-blush-deep/70">
        <div
          className="h-full rounded-full bg-rose transition-all duration-700 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <ul className="mt-6 w-full max-w-sm space-y-2.5 text-left" aria-live="polite">
        {STAGES.map((text, i) => {
          const done = i < stage;
          const current = i === stage;
          if (i > stage) return null;
          return (
            <li
              key={text}
              className={`flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-[13px] transition-all duration-300 ${
                current ? "animate-fade-up bg-white font-semibold text-ink border border-linen shadow-soft" : "text-ink-faint"
              }`}
            >
              {done ? (
                <Check className="h-4 w-4 shrink-0 text-sage" strokeWidth={3} />
              ) : (
                <span className="h-2 w-2 shrink-0 animate-pulse-soft rounded-full bg-rose" />
              )}
              {text}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
