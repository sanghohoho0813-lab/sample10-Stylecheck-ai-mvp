"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Clock3, Heart, Settings2, Shirt } from "lucide-react";
import { listAnalyses } from "@/lib/storage";
import { MOODS } from "@/lib/occasions";
import { useToast } from "@/components/Toast";
import type { AnalysisResult } from "@/lib/types";

const WARDROBE_DEMO = [
  { slot: "신발", name: "블랙 스트레이트팁", color: "#262224" },
  { slot: "신발", name: "베이지 로퍼", color: "#c9b294" },
  { slot: "아우터", name: "차콜 재킷", color: "#4b4649" },
  { slot: "아우터", name: "네이비 니트 베스트", color: "#2c3a55" },
  { slot: "상의", name: "라이트 셔츠", color: "#dbe4ee" },
  { slot: "가방", name: "아이보리 미니백", color: "#efe7db" },
  { slot: "액세서리", name: "진주 이어링", color: "#f3ece2" },
  { slot: "액세서리", name: "실버 미니 워치", color: "#c8c8cc" },
];

const PREF_KEY = "stylecheck.prefs.v1";
const PHOTO_KEY = "stylecheck.savephoto.v1";

export default function MyPage() {
  const toast = useToast();
  const [items, setItems] = useState<AnalysisResult[]>([]);
  const [prefs, setPrefs] = useState<string[]>([]);
  const [savePhotos, setSavePhotos] = useState(true);

  useEffect(() => {
    setItems(listAnalyses());
    try {
      setPrefs(JSON.parse(localStorage.getItem(PREF_KEY) ?? "[]"));
      setSavePhotos(localStorage.getItem(PHOTO_KEY) !== "off");
    } catch {
      /* noop */
    }
  }, []);

  const togglePref = (mood: string) => {
    const next = prefs.includes(mood) ? prefs.filter((m) => m !== mood) : [...prefs, mood];
    setPrefs(next);
    localStorage.setItem(PREF_KEY, JSON.stringify(next));
  };

  const favorites = items.filter((a) => a.favorite);
  const avg = items.length ? Math.round(items.reduce((s, a) => s + a.overallScore, 0) / items.length) : null;

  return (
    <div className="mx-auto max-w-4xl px-5 pb-16 pt-10 md:px-8 md:pt-14">
      {/* Profile */}
      <section className="flex items-center gap-4 rounded-card border border-linen bg-white p-6 shadow-soft">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-blush text-2xl">🙂</span>
        <div className="min-w-0 flex-1">
          <h1 className="font-display text-xl font-semibold text-ink">데모 사용자</h1>
          <p className="mt-0.5 text-[0.8125rem] text-ink-soft">StyleCheck AI 체험 계정이에요.</p>
        </div>
        <Image
          src="/mirae-ai-lab-logo.jpg"
          alt="미래에이아이랩 로고"
          width={90}
          height={27}
          className="hidden h-6 w-auto rounded sm:block"
        />
      </section>

      {/* Stats */}
      <section className="mt-4 grid grid-cols-3 gap-3">
        {[
          { label: "확인한 코디", value: items.length ? `${items.length}회` : "-" },
          { label: "저장한 코디", value: favorites.length ? `${favorites.length}개` : "-" },
          { label: "평균 적합도", value: avg ? `${avg}점` : "-" },
        ].map((s) => (
          <div key={s.label} className="rounded-card border border-linen bg-white px-4 py-4 text-center shadow-soft">
            <p className="font-display text-xl font-semibold text-ink">{s.value}</p>
            <p className="mt-1 text-[0.6875rem] font-medium text-ink-faint">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Quick links */}
      <section className="mt-4 grid gap-3 sm:grid-cols-2">
        <Link
          href="/history"
          className="flex items-center gap-3 rounded-card border border-linen bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush">
            <Clock3 className="h-5 w-5 text-rose" />
          </span>
          <span className="flex-1 text-sm font-semibold text-ink">분석 기록</span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </Link>
        <Link
          href="/history"
          className="flex items-center gap-3 rounded-card border border-linen bg-white p-5 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-lift"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-blush">
            <Heart className="h-5 w-5 text-rose" />
          </span>
          <span className="flex-1 text-sm font-semibold text-ink">저장한 코디</span>
          <ArrowRight className="h-4 w-4 text-ink-faint" />
        </Link>
      </section>

      {/* Wardrobe demo */}
      <section className="mt-4 rounded-card border border-linen bg-white p-6 shadow-soft">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          <Shirt className="h-4 w-4 text-rose" />
          내 옷장 <span className="rounded-full bg-blush px-2 py-0.5 text-[0.625rem] font-bold text-rose-deep">DEMO</span>
        </p>
        <p className="mt-1.5 text-[0.75rem] text-ink-soft">
          자주 입는 옷을 등록하면 대체 코디를 더 쉽게 확인할 수 있어요.
        </p>
        <div className="no-scrollbar -mx-6 mt-4 flex gap-3 overflow-x-auto px-6 pb-1">
          {WARDROBE_DEMO.map((w) => (
            <div key={w.name} className="w-28 shrink-0 rounded-2xl border border-linen bg-ivory p-3">
              <span className="block h-16 rounded-xl border border-linen/60" style={{ backgroundColor: w.color }} />
              <p className="mt-2 truncate text-[0.75rem] font-semibold text-ink">{w.name}</p>
              <p className="text-[0.625rem] text-ink-faint">{w.slot}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Preferred styles */}
      <section className="mt-4 rounded-card border border-linen bg-white p-6 shadow-soft">
        <p className="text-sm font-bold text-ink">선호 스타일</p>
        <p className="mt-1.5 text-[0.75rem] text-ink-soft">선택한 무드는 추천 문구에 참고돼요.</p>
        <div className="mt-3.5 flex flex-wrap gap-2">
          {MOODS.map((m) => {
            const active = prefs.includes(m);
            return (
              <button
                key={m}
                type="button"
                onClick={() => togglePref(m)}
                aria-pressed={active}
                className={`rounded-full border px-3.5 py-2 text-[0.8125rem] font-medium transition-all duration-200 ${
                  active
                    ? "border-rose bg-rose text-white"
                    : "border-linen bg-white text-ink-soft hover:border-rose-soft"
                }`}
              >
                {m}
              </button>
            );
          })}
        </div>
      </section>

      {/* Settings */}
      <section className="mt-4 rounded-card border border-linen bg-white p-6 shadow-soft">
        <p className="flex items-center gap-2 text-sm font-bold text-ink">
          <Settings2 className="h-4 w-4 text-rose" />
          설정
        </p>
        <div className="mt-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-ink">분석 사진을 기록에 저장</p>
            <p className="mt-0.5 text-[0.75rem] leading-relaxed text-ink-soft">
              끄면 결과 점수만 남기고 사진은 저장하지 않아요. 사진은 이 기기 안에서만 보관돼요.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={savePhotos}
            onClick={() => {
              const next = !savePhotos;
              setSavePhotos(next);
              localStorage.setItem(PHOTO_KEY, next ? "on" : "off");
              toast(next ? "사진 저장을 켰어요." : "사진 저장을 껐어요.", "info");
            }}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
              savePhotos ? "bg-rose" : "bg-linen"
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-all duration-200 ${
                savePhotos ? "left-6" : "left-1"
              }`}
            />
          </button>
        </div>
        <p className="mt-5 border-t border-linen pt-4 text-[0.6875rem] leading-relaxed text-ink-faint">
          StyleCheck AI는 얼굴·체형 등 외모를 평가하지 않으며, 착장과 상황의 적합성만 확인해요. 업로드한 사진은 코디
          분석을 위해서만 사용됩니다.
        </p>
      </section>
    </div>
  );
}
