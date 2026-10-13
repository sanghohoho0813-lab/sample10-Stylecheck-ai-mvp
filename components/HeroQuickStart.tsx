"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, Camera, ImagePlus, LoaderCircle } from "lucide-react";
import { adviceFor } from "@/lib/advice";
import { currentSeason, MOODS, OCCASION_MAP } from "@/lib/occasions";
import { getPreferredMoods, listAnalyses, setDraft } from "@/lib/storage";
import type { AnalysisResult } from "@/lib/types";
import { formatRelativeDay, type PreparedImage } from "@/lib/utils";
import { usePhotoPicker } from "./usePhotoPicker";

/**
 * The first screen's one job: get from "오늘 이 옷 괜찮나?" to a photo in one
 * tap. The picked photo is handed to /check as a draft, which opens on 상황 —
 * the 사진 step is already done.
 */
export default function HeroQuickStart({ sampleHref }: { sampleHref: string }) {
  const router = useRouter();
  const [dragging, setDragging] = useState(false);
  const [last, setLast] = useState<AnalysisResult | null>(null);

  const start = (picked: PreparedImage) => {
    const mood = getPreferredMoods().find((m) => (MOODS as readonly string[]).includes(m)) ?? null;
    setDraft({
      image: picked.dataUrl,
      photo: picked.info,
      sampleId: null,
      occasion: null,
      conditions: { companion: null, place: null, mood, season: currentSeason(), note: "" },
      moodFromPrefs: Boolean(mood),
    });
    router.push("/check?from=home");
  };
  const picker = usePhotoPicker(start);

  // A returning user's own last check (demo seeds don't count as "yours")
  useEffect(() => {
    setLast(listAnalyses().find((a) => !a.id.startsWith("seed-")) ?? null);
  }, []);

  return (
    <div
      className="relative animate-fade-up"
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        picker.handleFile(e.dataTransfer.files?.[0]);
      }}
    >
      {picker.inputs}
      {dragging && (
        <div className="pointer-events-none absolute -inset-4 z-10 flex items-center justify-center rounded-lg border-2 border-dashed border-rose bg-ivory/90 text-lead font-semibold text-rose-deep">
          여기에 놓으면 바로 확인해요
        </div>
      )}

      <p className="text-meta font-semibold text-rose-deep">외출 전 30초 코디 체크</p>
      <h1 className="mt-3 font-display text-display font-semibold tracking-tight text-ink lg:text-hero">
        오늘 이 옷,
        <br />
        괜찮을까요?
      </h1>
      <p className="mt-5 max-w-md text-body text-ink-soft md:text-lead">
        사진 한 장과 가는 곳만 알려주세요. 괜찮은지, 하나만 바꾼다면 무엇인지 알려드려요.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:max-w-md sm:flex-row">
        {/* Phones open the camera; desktops open the file picker */}
        <button
          type="button"
          onClick={picker.openCamera}
          disabled={picker.preparing}
          className="btn btn-lg btn-primary sm:hidden"
        >
          {picker.preparing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <Camera className="h-5 w-5" />}
          {picker.preparing ? "사진 준비 중…" : "사진 찍고 확인하기"}
        </button>
        <button type="button" onClick={picker.openAlbum} disabled={picker.preparing} className="btn btn-lg btn-secondary sm:hidden">
          <ImagePlus className="h-5 w-5 text-rose-deep" />
          앨범에서 고르기
        </button>
        <button
          type="button"
          onClick={picker.openAlbum}
          disabled={picker.preparing}
          className="btn btn-lg btn-primary hidden sm:inline-flex"
        >
          {picker.preparing ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ImagePlus className="h-5 w-5" />}
          {picker.preparing ? "사진 준비 중…" : "사진 올리고 확인하기"}
        </button>
      </div>

      {picker.error && (
        <p role="alert" className="mt-3 max-w-md rounded-sm bg-white px-4 py-3 text-body-sm font-medium text-rose-deep">
          {picker.error}
        </p>
      )}

      <p className="mt-4 text-body-sm text-ink-soft">
        <span className="hidden sm:inline">사진을 여기로 끌어다 놓아도 돼요 · </span>
        <Link href={sampleHref} className="font-semibold text-ink underline decoration-linen underline-offset-4 hover:decoration-ink">
          사진이 없다면 샘플로 체험하기
        </Link>
      </p>

      {/* Reserved line: appears for returning users without shifting the page */}
      <p className="mt-6 min-h-6 text-meta">
        {last && (
          <Link href={`/result/${last.id}`} className="group inline-flex items-center gap-1.5 text-ink-soft hover:text-ink">
            <span className="text-ink-faint">지난번</span>
            {formatRelativeDay(last.createdAt)} {OCCASION_MAP[last.occasion].label} ·{" "}
            {last.appliedAt ? "추천대로 바꿔 입음" : adviceFor(last).headline}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </p>
    </div>
  );
}
