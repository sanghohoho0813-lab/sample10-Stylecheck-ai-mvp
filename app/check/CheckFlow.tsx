"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import OutfitUploader from "@/components/OutfitUploader";
import OccasionGrid from "@/components/OccasionGrid";
import ConditionForm from "@/components/ConditionForm";
import AnalysisLoading from "@/components/AnalysisLoading";
import { SAMPLE_MAP } from "@/lib/demo-samples";
import { currentSeason, MOODS, OCCASION_MAP } from "@/lib/occasions";
import { runStyleAnalysis } from "@/lib/style-engine";
import { getPreferredMoods, getSavePhotos, makeId, saveAnalysis } from "@/lib/storage";
import type { AnalysisConditions, OccasionId } from "@/lib/types";

type Step = "upload" | "occasion" | "conditions" | "loading";

const STEP_ORDER: Step[] = ["upload", "occasion", "conditions", "loading"];
const STEP_LABELS = ["사진", "상황", "조건"];

/** Neutral hanger illustration stored instead of the photo when photo-saving is off. */
const PHOTO_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#f9edef"/><g stroke="#cf6680" stroke-width="10" fill="none" stroke-linecap="round"><path d="M 300 300 Q 326 300 326 324 Q 326 340 300 350"/><path d="M 300 350 L 160 420 Q 148 428 160 436 L 440 436 Q 452 428 440 420 Z"/></g><text x="300" y="520" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#9a8789">사진 저장 안 함</text></svg>`
)}`;

export default function CheckFlow() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<Step>("upload");
  const [image, setImage] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [moodFromPrefs, setMoodFromPrefs] = useState(false);
  const [conditions, setConditions] = useState<AnalysisConditions>({
    companion: null,
    place: null,
    mood: null,
    season: currentSeason(),
    note: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Deep links (/check?sample=<id>, /check?occasion=<id>) and the preferred
  // mood from 마이페이지, which becomes the default "원하는 느낌".
  useEffect(() => {
    const preferred = getPreferredMoods().find((m) => (MOODS as readonly string[]).includes(m));
    if (preferred) {
      setConditions((c) => ({ ...c, mood: preferred }));
      setMoodFromPrefs(true);
    }

    const sampleParam = params.get("sample");
    const occasionParam = params.get("occasion");
    if (sampleParam && SAMPLE_MAP[sampleParam]) {
      const s = SAMPLE_MAP[sampleParam];
      setSampleId(s.id);
      setImage(s.image);
      setOccasion(s.occasion);
      setStep("conditions");
    } else if (occasionParam && OCCASION_MAP[occasionParam as OccasionId]) {
      setOccasion(occasionParam as OccasionId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Each step is its own screen — start it from the top.
  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [step]);

  const stepIndex = STEP_ORDER.indexOf(step);

  const applySample = (id: string) => {
    const s = SAMPLE_MAP[id];
    if (!s) return;
    setSampleId(s.id);
    setImage(s.image);
    setOccasion((prev) => prev ?? s.occasion);
    setError(null);
    setStep("occasion");
  };

  const goNext = () => {
    setError(null);
    if (step === "upload") {
      if (!image) return setError("먼저 코디 사진을 올려주세요.");
      setStep("occasion");
    } else if (step === "occasion") {
      if (!occasion) return setError("어디에 입고 갈 옷인지 알려주세요.");
      setStep("conditions");
    } else if (step === "conditions") {
      setStep("loading");
    }
  };

  const goBack = () => {
    setError(null);
    if (step === "occasion") setStep("upload");
    else if (step === "conditions") setStep("occasion");
  };

  const finishAnalysis = useCallback(() => {
    if (!image || !occasion) return;
    const sample = sampleId ? SAMPLE_MAP[sampleId] : undefined;
    const result = runStyleAnalysis({
      imageKey: sample ? sample.id : `upload-${image.length}-${image.slice(-24)}`,
      image,
      occasion,
      conditions,
      sample,
    });
    const id = makeId();
    // Respect the "save analysis photos" setting from 마이페이지 (privacy choice)
    const keepPhoto = Boolean(sample) || getSavePhotos();
    saveAnalysis({
      ...result,
      image: keepPhoto ? result.image : PHOTO_PLACEHOLDER,
      id,
      createdAt: new Date().toISOString(),
      favorite: false,
    });
    // replace: browser back from the result returns to where the user started, not into the spinner
    router.replace(`/result/${id}`);
  }, [image, occasion, conditions, sampleId, router]);

  // Kept short so it never truncates in the 360px sticky bar
  const primaryLabel = step === "conditions" ? "코디 판정하기" : "다음";
  // Until the step's required input exists, "다음" stays visually quiet so the
  // step's own action (촬영 / 앨범 / 상황 선택) is the one primary on screen.
  // It remains clickable and explains what is missing.
  const blocked = (step === "upload" && !image) || (step === "occasion" && !occasion);
  const sample = sampleId ? SAMPLE_MAP[sampleId] : undefined;

  const renderButtons = (compact = false) => (
    <>
      {step !== "upload" && (
        <button
          type="button"
          onClick={goBack}
          aria-label="이전 단계"
          className={`inline-flex h-12 shrink-0 items-center justify-center gap-1.5 rounded-full border border-linen bg-white text-body-sm font-semibold text-ink-soft transition-colors hover:bg-blush/60 ${
            compact ? "w-12" : "px-5"
          }`}
        >
          <ArrowLeft className="h-4 w-4" />
          {!compact && "이전"}
        </button>
      )}
      <button
        type="button"
        onClick={goNext}
        aria-disabled={blocked}
        className={`inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full px-5 text-body font-semibold transition-colors duration-200 ${
          blocked ? "bg-blush-deep text-ink-faint" : "bg-rose text-white hover:bg-rose-deep active:bg-rose-deep"
        }`}
      >
        <span className="truncate">{primaryLabel}</span>
        {step !== "conditions" && <ArrowRight className="h-4 w-4 shrink-0" />}
      </button>
    </>
  );

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-6 md:px-8 md:pb-20 md:pt-12">
      {step !== "loading" && (
        <div className="mb-8" aria-label={`${stepIndex + 1}/${STEP_LABELS.length}단계 ${STEP_LABELS[stepIndex]}`}>
          <div className="flex items-center justify-between text-meta">
            <span className="font-semibold text-rose-deep">
              {stepIndex + 1}. {STEP_LABELS[stepIndex]}
            </span>
            <span className="tabular-nums text-ink-faint">
              {stepIndex + 1} / {STEP_LABELS.length}
            </span>
          </div>
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {STEP_LABELS.map((label, i) => (
              <span
                key={label}
                className={`h-1 flex-1 rounded-full transition-colors duration-200 ${i <= stepIndex ? "bg-rose" : "bg-blush-deep"}`}
              />
            ))}
          </div>
        </div>
      )}

      {step === "upload" && (
        <OutfitUploader
          image={image}
          isSample={Boolean(sampleId)}
          sampleName={sample?.name}
          onImage={(dataUrl) => {
            setSampleId(null);
            setImage(dataUrl);
            setError(null);
          }}
          onSample={applySample}
          onClear={() => {
            setImage(null);
            setSampleId(null);
          }}
          error={error}
        />
      )}

      {step === "occasion" && (
        <OccasionGrid
          selected={occasion}
          onSelect={(id) => {
            setOccasion(id);
            setError(null);
          }}
          error={error}
        />
      )}

      {step === "conditions" && (
        <ConditionForm conditions={conditions} onChange={setConditions} moodFromPrefs={moodFromPrefs} />
      )}

      {step === "loading" && image && <AnalysisLoading image={image} onDone={finishAnalysis} />}

      {step !== "loading" && (
        <>
          {/* Desktop: inline actions */}
          <div className="mt-10 hidden items-center gap-3 md:flex">
            {renderButtons()}
          </div>
          {/* Phones: thumb-reach sticky action bar (the tab bar is hidden in this flow) */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-ivory/95 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
            <div className="mx-auto flex max-w-2xl items-center gap-2">
              {renderButtons(true)}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
