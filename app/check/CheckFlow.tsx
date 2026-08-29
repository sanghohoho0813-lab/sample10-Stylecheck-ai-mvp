"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import OutfitUploader from "@/components/OutfitUploader";
import OccasionGrid from "@/components/OccasionGrid";
import ConditionForm from "@/components/ConditionForm";
import AnalysisLoading from "@/components/AnalysisLoading";
import { SAMPLE_MAP } from "@/lib/demo-samples";
import { currentSeason, OCCASION_MAP } from "@/lib/occasions";
import { runStyleAnalysis } from "@/lib/style-engine";
import { makeId, saveAnalysis } from "@/lib/storage";
import type { AnalysisConditions, OccasionId } from "@/lib/types";

type Step = "upload" | "occasion" | "conditions" | "loading";

const STEP_ORDER: Step[] = ["upload", "occasion", "conditions", "loading"];
const STEP_LABELS = ["사진", "상황", "조건", "분석"];

/** Neutral hanger illustration stored instead of the photo when photo-saving is off. */
const PHOTO_PLACEHOLDER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800"><rect width="600" height="800" fill="#f9edef"/><g stroke="#d2697f" stroke-width="10" fill="none" stroke-linecap="round"><path d="M 300 300 Q 326 300 326 324 Q 326 340 300 350"/><path d="M 300 350 L 160 420 Q 148 428 160 436 L 440 436 Q 452 428 440 420 Z"/></g><text x="300" y="520" text-anchor="middle" font-family="sans-serif" font-size="24" fill="#a3908f">사진 저장 안 함</text></svg>`
)}`;

export default function CheckFlow() {
  const router = useRouter();
  const params = useSearchParams();

  const [step, setStep] = useState<Step>("upload");
  const [image, setImage] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [conditions, setConditions] = useState<AnalysisConditions>({
    companion: null,
    place: null,
    mood: null,
    season: currentSeason(),
    note: "",
  });
  const [error, setError] = useState<string | null>(null);

  // Deep links: /check?sample=<id> (demo mode) and /check?occasion=<id>
  useEffect(() => {
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
      if (!image) {
        setError("먼저 코디 사진을 올려주세요.");
        return;
      }
      setStep("occasion");
    } else if (step === "occasion") {
      if (!occasion) {
        setError("어디에 입고 갈 옷인지 알려주세요.");
        return;
      }
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
    // Respect the "save analysis photos" setting from My Page (privacy choice)
    const keepPhoto = sample || localStorage.getItem("stylecheck.savephoto.v1") !== "off";
    saveAnalysis({
      ...result,
      image: keepPhoto ? result.image : PHOTO_PLACEHOLDER,
      id,
      createdAt: new Date().toISOString(),
      favorite: false,
    });
    router.push(`/result/${id}`);
  }, [image, occasion, conditions, sampleId, router]);

  const occasionLabel = useMemo(() => (occasion ? OCCASION_MAP[occasion].label : null), [occasion]);

  return (
    <div className="mx-auto max-w-2xl px-5 pb-16 pt-8 md:px-8 md:pt-12">
      {/* Stepper */}
      {step !== "loading" && (
        <>
          {/* Compact on phones — four full chips do not fit at this type scale */}
          <div className="mb-7 sm:hidden" aria-label="분석 단계">
            <div className="flex items-center justify-between">
              <span className="text-[0.75rem] font-semibold text-rose-deep">
                {stepIndex + 1}. {STEP_LABELS[stepIndex]}
              </span>
              <span className="text-[0.6875rem] font-medium text-ink-faint">
                {stepIndex + 1} / {STEP_LABELS.length}
              </span>
            </div>
            <div className="mt-2 flex gap-1.5">
              {STEP_LABELS.map((label, i) => (
                <span
                  key={label}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                    i <= stepIndex ? "bg-rose" : "bg-blush-deep"
                  }`}
                />
              ))}
            </div>
          </div>

          <ol className="mb-8 hidden items-center justify-center gap-0 sm:flex" aria-label="분석 단계">
            {STEP_LABELS.map((label, i) => {
              const done = i < stepIndex;
              const current = i === stepIndex;
              return (
                <li key={label} className="flex items-center">
                  {i > 0 && <span className={`h-px w-6 md:w-12 ${i <= stepIndex ? "bg-rose" : "bg-linen"}`} aria-hidden />}
                  <span
                    className={`mx-1.5 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[0.6875rem] font-semibold transition-colors duration-200 md:text-xs ${
                      current
                        ? "bg-rose text-white shadow-rose/50 shadow-sm"
                        : done
                          ? "bg-blush text-rose-deep"
                          : "bg-white text-ink-faint border border-linen"
                    }`}
                  >
                    {i + 1}. {label}
                  </span>
                </li>
              );
            })}
          </ol>
        </>
      )}

      {step === "upload" && (
        <OutfitUploader
          image={image}
          isSample={Boolean(sampleId)}
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

      {step === "occasion" && <OccasionGrid selected={occasion} onSelect={(id) => { setOccasion(id); setError(null); }} error={error} />}

      {step === "conditions" && <ConditionForm conditions={conditions} onChange={setConditions} />}

      {step === "loading" && image && <AnalysisLoading image={image} onDone={finishAnalysis} />}

      {/* Footer controls */}
      {step !== "loading" && (
        <div className="mt-10 flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
          {step !== "upload" && (
            <button
              type="button"
              onClick={goBack}
              className="inline-flex items-center justify-center gap-1.5 rounded-full border border-linen bg-white px-5 py-3.5 text-sm font-semibold text-ink-soft transition-colors hover:bg-blush/60"
            >
              <ArrowLeft className="h-4 w-4" />
              이전
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            className="inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-rose px-4 py-3.5 text-[0.9375rem] font-semibold text-white shadow-rose transition-all duration-200 hover:bg-rose-deep active:scale-[0.98] sm:px-6"
          >
            {step === "conditions" ? (
              <>
                <Sparkles className="h-4.5 w-4.5 shrink-0" />
                <span className="truncate">
                  {occasionLabel && <span className="hidden sm:inline">{occasionLabel} </span>}
                  코디 판정하기
                </span>
              </>
            ) : (
              <>
                다음
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
