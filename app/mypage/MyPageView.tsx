"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronRight, RotateCcw, User } from "lucide-react";
import SampleBridgeCTA from "@/components/SampleBridgeCTA";
import { useToast } from "@/components/Toast";
import {
  getPreferredMoods,
  getSavePhotos,
  listAnalyses,
  resetDemoData,
  setPreferredMoods,
  setSavePhotos as persistSavePhotos,
} from "@/lib/storage";
import { MOODS } from "@/lib/occasions";
import { WARDROBE } from "@/lib/wardrobe";

// Top-to-toe order, then extras
const SLOT_ORDER = ["아우터", "상의", "하의", "신발", "가방", "액세서리"];
const WARDROBE_SLOTS = [...new Set(WARDROBE.map((w) => w.slot))].sort(
  (a, b) => (SLOT_ORDER.indexOf(a) + 99) % 99 - (SLOT_ORDER.indexOf(b) + 99) % 99
);
import type { AnalysisResult } from "@/lib/types";

export default function MyPageView() {
  const toast = useToast();
  const [items, setItems] = useState<AnalysisResult[] | null>(null);
  const [prefs, setPrefs] = useState<string[]>([]);
  const [savePhotos, setSavePhotos] = useState(true);
  const [confirmReset, setConfirmReset] = useState(false);

  const load = () => {
    setItems(listAnalyses());
    setPrefs(getPreferredMoods());
    setSavePhotos(getSavePhotos());
  };

  useEffect(load, []);

  // Second tap within 4s confirms the reset; otherwise the button quietly re-arms.
  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 4000);
    return () => clearTimeout(t);
  }, [confirmReset]);

  const togglePref = (mood: string) => {
    const next = prefs.includes(mood) ? prefs.filter((m) => m !== mood) : [...prefs, mood];
    setPrefs(next);
    setPreferredMoods(next);
  };

  const onReset = () => {
    if (!confirmReset) return setConfirmReset(true);
    resetDemoData();
    setConfirmReset(false);
    load();
    toast("데모 데이터를 처음 상태로 되돌렸어요", "info");
  };

  const list = items ?? [];
  // Each count opens the matching history filter — one place for both the number and the way in.
  const stats: { label: string; value: number | null; unit: string; href?: string }[] = [
    { label: "확인한 코디", value: list.length, unit: "회", href: "/history" },
    { label: "저장한 코디", value: list.filter((a) => a.favorite).length, unit: "개", href: "/history?filter=favorite" },
    { label: "추천 적용", value: list.filter((a) => a.appliedAt).length, unit: "회", href: "/history?filter=applied" },
    {
      label: "평균 적합도",
      // No records → no average (a "0점" would read as a terrible score)
      value: list.length ? Math.round(list.reduce((s, a) => s + a.overallScore, 0) / list.length) : null,
      unit: "점",
    },
  ];

  return (
    <>
      <div className="mx-auto max-w-4xl px-5 pb-12 pt-8 md:px-8 md:pt-12">
        {/* ── Profile ─────────────────────────────────────────────────── */}
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-blush text-rose-deep">
            <User className="h-6 w-6" strokeWidth={1.8} />
          </span>
          <div>
            <h1 className="font-display text-section font-semibold text-ink">데모 사용자</h1>
            <p className="mt-0.5 text-body-sm text-ink-soft">샘플 계정으로 체험하고 있어요</p>
          </div>
        </div>

        <ul
          aria-label="내 기록 요약"
          className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-md border border-linen bg-linen sm:grid-cols-4"
        >
          {stats.map((s) => {
            const body = (
              <>
                <span className="flex items-center justify-between gap-1 text-meta text-ink-soft">
                  {s.label}
                  {s.href && <ChevronRight className="h-4 w-4 text-ink-faint" aria-hidden />}
                </span>
                <span className="mt-1 block whitespace-nowrap font-display text-section font-semibold tabular-nums text-ink">
                  {items && s.value !== null ? s.value : "–"}
                  {items && s.value !== null && (
                    <span className="ml-0.5 font-body text-body-sm font-normal text-ink-faint">{s.unit}</span>
                  )}
                </span>
              </>
            );
            return (
              <li key={s.label} className="bg-white">
                {s.href ? (
                  <Link href={s.href} className="block h-full px-4 py-4 transition-colors duration-150 hover:bg-blush/50">
                    {body}
                  </Link>
                ) : (
                  <div className="px-4 py-4">{body}</div>
                )}
              </li>
            );
          })}
        </ul>

        {/* ── Wardrobe ────────────────────────────────────────────────── */}
        <section aria-labelledby="wardrobe" className="mt-12">
          <div className="flex items-baseline justify-between gap-3">
            <h2 id="wardrobe" className="font-display text-title font-semibold text-ink">
              내 옷장
            </h2>
            <span className="text-caption text-ink-faint">데모 · {WARDROBE.length}개</span>
          </div>
          <p className="mt-1 text-body-sm text-ink-soft">추천한 아이템이 옷장에 있으면 결과 화면에서 알려드려요.</p>
          {/* Read at a glance: grouped by slot, a colour dot instead of big swatches */}
          <dl className="mt-4 divide-y divide-linen border-y border-linen">
            {WARDROBE_SLOTS.map((slot) => (
              <div key={slot} className="flex gap-4 py-3">
                <dt className="w-16 shrink-0 pt-1.5 text-meta text-ink-faint">{slot}</dt>
                <dd className="flex min-w-0 flex-1 flex-wrap gap-x-4 gap-y-1.5">
                  {WARDROBE.filter((w) => w.slot === slot).map((w) => (
                    <span key={w.id} className="inline-flex items-center gap-2 py-0.5 text-body-sm text-ink">
                      <span
                        className="h-3.5 w-3.5 shrink-0 rounded-full border border-ink/10"
                        style={{ backgroundColor: w.color }}
                        aria-hidden
                      />
                      {w.name}
                    </span>
                  ))}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        {/* ── Preferred style ─────────────────────────────────────────── */}
        <section aria-labelledby="prefs" className="mt-12 border-t border-linen pt-8">
          <h2 id="prefs" className="font-display text-title font-semibold text-ink">
            선호 스타일
          </h2>
          <p className="mt-1 text-body-sm text-ink-soft">
            먼저 고른 무드가 코디 확인의 ‘원하는 느낌’ 기본값으로 들어가요.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {MOODS.map((m) => {
              const index = prefs.indexOf(m);
              const on = index >= 0;
              return (
                <button
                  key={m}
                  type="button"
                  onClick={() => togglePref(m)}
                  aria-pressed={on}
                  className={`chip ${on ? "chip-on" : "chip-off"}`}
                >
                  {m}
                  {index === 0 && <span className="text-caption text-white/80">기본</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Settings ────────────────────────────────────────────────── */}
        <section aria-labelledby="settings" className="mt-12 border-t border-linen pt-8">
          <h2 id="settings" className="font-display text-title font-semibold text-ink">
            설정
          </h2>

          <div className="mt-4 flex items-center justify-between gap-6 py-2">
            <div>
              <p className="text-body font-semibold text-ink" id="save-photo-label">
                분석 사진을 기록에 저장
              </p>
              <p className="mt-0.5 text-body-sm text-ink-soft">끄면 점수와 추천만 남기고 사진은 저장하지 않아요.</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={savePhotos}
              aria-labelledby="save-photo-label"
              onClick={() => {
                const next = !savePhotos;
                setSavePhotos(next);
                persistSavePhotos(next);
                toast(next ? "사진을 기록에 함께 저장해요" : "앞으로 사진은 저장하지 않아요", "info");
              }}
              className={`relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200 ${
                savePhotos ? "bg-rose-deep" : "bg-ink-faint/40"
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-subtle transition-[left] duration-200 ${
                  savePhotos ? "left-6" : "left-1"
                }`}
              />
            </button>
          </div>

          <div className="mt-4 flex items-center justify-between gap-6 border-t border-linen py-4">
            <div>
              <p className="text-body font-semibold text-ink">데모 데이터 초기화</p>
              <p className="mt-0.5 text-body-sm text-ink-soft">기록·저장·선호 스타일을 지우고 샘플 기록으로 되돌려요.</p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className={`btn btn-xs ${confirmReset ? "bg-danger text-white" : "btn-secondary text-ink-soft"}`}
            >
              <RotateCcw className="h-4 w-4" />
              {confirmReset ? "한 번 더 눌러 초기화" : "초기화"}
            </button>
          </div>

          <p className="mt-6 text-meta text-ink-faint">
            StyleCheck AI는 얼굴·체형 등 외모를 평가하지 않고 착장과 상황의 적합성만 확인해요. 모든 데이터는 이 기기의
            브라우저에만 저장돼요.
          </p>
        </section>
      </div>

      <SampleBridgeCTA maxWidthClass="max-w-4xl" />
    </>
  );
}
