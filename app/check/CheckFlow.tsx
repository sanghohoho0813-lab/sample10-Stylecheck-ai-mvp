"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import OutfitUploader from "@/components/OutfitUploader";
import OccasionGrid from "@/components/OccasionGrid";
import ConditionForm from "@/components/ConditionForm";
import AnalysisLoading from "@/components/AnalysisLoading";
import { useToast } from "@/components/Toast";
import { SAMPLE_MAP } from "@/lib/demo-samples";
import { currentSeason, MOODS, OCCASION_MAP } from "@/lib/occasions";
import { PHOTO_PLACEHOLDER } from "@/lib/placeholder";
import { runStyleAnalysis } from "@/lib/style-engine";
import { getDraft, getPreferredMoods, getSavePhotos, makeId, saveAnalysis, setDraft } from "@/lib/storage";
import type { AnalysisConditions, OccasionId } from "@/lib/types";
import LookImage from "@/components/LookImage";

type Step = "upload" | "occasion" | "conditions" | "loading";

const STEPS: { id: Exclude<Step, "loading">; label: string }[] = [
  { id: "upload", label: "사진" },
  { id: "occasion", label: "상황" },
  { id: "conditions", label: "조건" },
];
const ALL_STEPS: Step[] = ["upload", "occasion", "conditions", "loading"];

const freshConditions = (): AnalysisConditions => ({
  companion: null,
  place: null,
  mood: null,
  season: currentSeason(),
  note: "",
});

const isOccasion = (v: string | null): v is OccasionId => Boolean(v && OCCASION_MAP[v as OccasionId]);

/**
 * 사진 → 상황 → 조건 → 판정.
 *
 * Each step is a browser-history entry, so the phone's back button walks back
 * one step instead of throwing the whole flow away. The draft lives in
 * sessionStorage, so a refresh resumes where the user was. When the result is
 * ready the step entries are popped and replaced by the result page — back
 * from the result returns to wherever the user started, not into the flow.
 */
export default function CheckFlow() {
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();

  const [ready, setReady] = useState(false);
  const [step, setStep] = useState<Step>("upload");
  const [image, setImage] = useState<string | null>(null);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [moodFromPrefs, setMoodFromPrefs] = useState(false);
  const [conditions, setConditions] = useState<AnalysisConditions>(freshConditions);
  const [error, setError] = useState<string | null>(null);

  /**
   * The flow's history entries up to the current one, oldest first. Stored in
   * each entry's history.state too, so it survives a refresh.
   */
  const trail = useRef<Step[]>([]);
  const finishing = useRef(false);
  const latest = useRef({ image, occasion });
  latest.current = { image, occasion };

  /** A step is only reachable once the earlier steps have their input. */
  const reachable = (s: Step, img = latest.current.image, occ = latest.current.occasion): Step => {
    if (!img) return "upload";
    if (!occ && (s === "conditions" || s === "loading")) return "occasion";
    return s;
  };

  // ── Start: deep link (?sample= / ?occasion=) › resumed draft › fresh ────
  useEffect(() => {
    const historyStep = window.history.state?.scStep as Step | undefined;
    const draft = historyStep ? getDraft() : null;
    const sampleParam = params.get("sample");
    const occasionParam = params.get("occasion");

    let next: Step = "upload";
    let img: string | null = null;
    let occ: OccasionId | null = null;
    let restored = false;

    if (draft && (!sampleParam || draft.sampleId === sampleParam)) {
      img = draft.image;
      occ = isOccasion(draft.occasion) ? draft.occasion : null;
      setSampleId(draft.sampleId);
      setConditions({ ...freshConditions(), ...draft.conditions });
      setMoodFromPrefs(draft.moodFromPrefs);
      next = historyStep === "loading" ? "conditions" : historyStep ?? "upload";
      restored = true;
    } else if (sampleParam && SAMPLE_MAP[sampleParam]) {
      const s = SAMPLE_MAP[sampleParam];
      setSampleId(s.id);
      img = s.image;
      occ = s.occasion;
      next = "conditions";
    } else if (isOccasion(occasionParam)) {
      occ = occasionParam;
    }

    if (!restored) {
      setDraft(null);
      // 마이페이지 선호 스타일 becomes the default "원하는 느낌".
      const preferred = getPreferredMoods().find((m) => (MOODS as readonly string[]).includes(m));
      if (preferred) {
        setConditions((c) => ({ ...c, mood: preferred }));
        setMoodFromPrefs(true);
      }
    }

    next = ALL_STEPS.includes(next) ? reachable(next, img, occ) : "upload";
    const savedTrail = window.history.state?.scTrail as Step[] | undefined;
    trail.current = restored && Array.isArray(savedTrail) && savedTrail.length ? [...savedTrail.slice(0, -1), next] : [next];
    window.history.replaceState({ ...window.history.state, scStep: next, scTrail: trail.current }, "");
    setImage(img);
    setOccasion(occ);
    setStep(next);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Browser back / forward between steps ───────────────────────────────
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      if (finishing.current) return;
      const target = e.state?.scStep as Step | undefined;
      if (!target || !ALL_STEPS.includes(target)) return;
      trail.current = Array.isArray(e.state.scTrail) ? e.state.scTrail : [target];
      setError(null);
      setStep(reachable(target === "loading" ? "conditions" : target));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── Keep the draft current ─────────────────────────────────────────────
  useEffect(() => {
    if (!ready || finishing.current) return;
    setDraft({ image, sampleId, occasion, conditions, moodFromPrefs });
  }, [ready, image, sampleId, occasion, conditions, moodFromPrefs]);

  // Each step is its own screen — start it from the top, and move keyboard /
  // screen-reader focus to its heading so the change is announced (not on the
  // first screen, where focus belongs to the page).
  const firstStep = useRef(true);
  useEffect(() => {
    window.scrollTo({ top: 0 });
    if (!ready) return;
    if (firstStep.current) {
      firstStep.current = false;
      return;
    }
    document.getElementById("step-title")?.focus({ preventScroll: true });
  }, [step, ready]);

  const advance = (next: Step) => {
    trail.current = [...trail.current, next];
    window.history.pushState({ ...window.history.state, scStep: next, scTrail: trail.current }, "");
    setError(null);
    setStep(next);
  };

  /** Go back to an earlier step — through history when we pushed it, so back/forward stay in sync. */
  const retreat = (target: Step) => {
    setError(null);
    const i = trail.current.lastIndexOf(target);
    const top = trail.current.length - 1;
    if (i >= 0 && i < top) {
      window.history.go(i - top);
      return;
    }
    // Not behind us in history (e.g. a sample link opened straight on 조건)
    trail.current = [...trail.current.slice(0, -1), target];
    window.history.replaceState({ ...window.history.state, scStep: target, scTrail: trail.current }, "");
    setStep(target);
  };

  const stepIndex = Math.min(ALL_STEPS.indexOf(step), STEPS.length - 1);

  const applySample = (id: string) => {
    const s = SAMPLE_MAP[id];
    if (!s) return;
    setSampleId(s.id);
    setImage(s.image);
    setOccasion((prev) => prev ?? s.occasion);
    // A sample already knows its occasion — go straight to 조건, but leave 상황
    // in history so back (or the stepper) can still change it.
    trail.current = [...trail.current, "occasion"];
    window.history.pushState({ ...window.history.state, scStep: "occasion", scTrail: trail.current }, "");
    advance("conditions");
  };

  const goNext = () => {
    if (step === "upload") {
      if (!image) return setError("먼저 코디 사진을 올려주세요.");
      advance("occasion");
    } else if (step === "occasion") {
      if (!occasion) return setError("어디에 입고 갈 옷인지 알려주세요.");
      advance("conditions");
    } else if (step === "conditions") {
      advance("loading");
    }
  };

  const goBack = () => {
    if (step === "occasion") retreat("upload");
    else if (step === "conditions") retreat("occasion");
  };

  const finishAnalysis = useCallback(() => {
    if (!image || !occasion || finishing.current) return;
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
    const status = saveAnalysis({
      ...result,
      image: keepPhoto ? result.image : PHOTO_PLACEHOLDER,
      id,
      createdAt: new Date().toISOString(),
      favorite: false,
    });

    if (status === "failed") {
      toast("기록을 저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.", "info");
      retreat("conditions");
      return;
    }
    if (status === "trimmed") toast("저장 공간이 부족해 오래된 기록의 사진을 정리했어요", "info");

    finishing.current = true;
    setDraft(null);
    const showResult = () => router.replace(`/result/${id}`);
    // Pop this visit's step entries first so back from the result skips the flow.
    const depth = trail.current.length - 1;
    if (depth > 0) {
      const onPop = () => {
        window.removeEventListener("popstate", onPop);
        showResult();
      };
      window.addEventListener("popstate", onPop);
      window.history.go(-depth);
    } else {
      showResult();
    }
  }, [image, occasion, conditions, sampleId, router, toast]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-2xl px-5 pt-6 md:px-8 md:pt-12" aria-busy="true">
        <div className="skeleton h-72 rounded-lg" />
      </div>
    );
  }

  // Kept short so it never truncates in the 360px sticky bar
  const primaryLabel = step === "conditions" ? "코디 판정하기" : "다음";
  // Until the step's required input exists, "다음" stays visually quiet so the
  // step's own action (촬영 / 앨범 / 상황 선택) is the one primary on screen.
  // It remains pressable and explains what is missing.
  const blocked = (step === "upload" && !image) || (step === "occasion" && !occasion);
  const sample = sampleId ? SAMPLE_MAP[sampleId] : undefined;
  const photoName = sample?.name ?? "내 코디 사진";

  const renderButtons = (compact = false) => (
    <>
      {step !== "upload" && (
        <button
          type="button"
          onClick={goBack}
          aria-label="이전 단계"
          className={`btn btn-md btn-secondary ${compact ? "w-12 px-0" : ""}`}
        >
          <ArrowLeft className="h-4 w-4" />
          {!compact && "이전"}
        </button>
      )}
      <button
        type="button"
        onClick={goNext}
        aria-disabled={blocked}
        className={`btn btn-md min-w-0 flex-1 ${blocked ? "bg-blush-deep text-ink-faint" : "btn-primary"}`}
      >
        <span className="truncate">{primaryLabel}</span>
        {step !== "conditions" && <ArrowRight className="h-4 w-4 shrink-0" />}
      </button>
    </>
  );

  return (
    <div className="mx-auto max-w-2xl px-5 pb-10 pt-6 md:px-8 md:pb-20 md:pt-12">
      {step !== "loading" && (
        <nav aria-label="코디 확인 단계" className="mb-7">
          <ol className="grid grid-cols-3 gap-2">
            {STEPS.map((s, i) => {
              const state = i < stepIndex ? "done" : i === stepIndex ? "current" : "todo";
              const body = (
                <>
                  <span
                    className={`block h-1 rounded-full transition-colors duration-200 ${
                      state === "todo" ? "bg-blush-deep" : "bg-rose"
                    }`}
                  />
                  <span
                    className={`mt-2 flex items-center gap-1.5 text-meta ${
                      state === "current"
                        ? "font-semibold text-rose-deep"
                        : state === "done"
                          ? "font-medium text-ink-soft"
                          : "text-ink-faint"
                    }`}
                  >
                    {state === "done" ? (
                      <Check className="h-3.5 w-3.5 text-sage" strokeWidth={2.75} aria-hidden />
                    ) : (
                      <span className="tabular-nums">{i + 1}</span>
                    )}
                    {s.label}
                  </span>
                </>
              );
              return (
                <li key={s.id}>
                  {state === "done" ? (
                    <button
                      type="button"
                      onClick={() => retreat(s.id)}
                      className="block w-full rounded-sm text-left transition-opacity hover:opacity-75"
                      aria-label={`${s.label} 단계로 돌아가기`}
                    >
                      {body}
                    </button>
                  ) : (
                    <div aria-current={state === "current" ? "step" : undefined}>{body}</div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}

      {/* What is being judged — visible on every step after the photo */}
      {(step === "occasion" || step === "conditions") && image && (
        <div className="mb-7 flex items-center gap-3 rounded-md bg-white py-2 pl-2 pr-2 shadow-subtle">
          <LookImage src={image} alt="" sizes="44px" className="w-11 shrink-0 rounded-sm" />
          <div className="min-w-0 flex-1">
            {step === "conditions" && occasion ? (
              <>
                <p className="truncate text-body-sm font-semibold text-ink">{OCCASION_MAP[occasion].label}</p>
                <p className="truncate text-meta text-ink-faint">{photoName}</p>
              </>
            ) : (
              <>
                <p className="truncate text-body-sm font-semibold text-ink">{photoName}</p>
                <p className="truncate text-meta text-ink-faint">이 사진으로 확인해요</p>
              </>
            )}
          </div>
          <button
            type="button"
            onClick={() => retreat(step === "conditions" ? "occasion" : "upload")}
            className="btn btn-xs btn-quiet px-3"
          >
            {step === "conditions" ? "상황 변경" : "사진 변경"}
          </button>
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
          occasionLabel={occasion ? OCCASION_MAP[occasion].label : undefined}
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

      {/* No photo yet: 촬영 / 앨범 / 샘플 are the only actions — a dead "다음" would just be noise */}
      {step !== "loading" && !(step === "upload" && !image) && (
        <>
          {/* Desktop: inline actions */}
          <div className="mt-10 hidden items-center gap-3 md:flex">{renderButtons()}</div>
          {/* Phones: thumb-reach sticky action bar (the tab bar is hidden in this flow) */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-linen bg-ivory/95 px-5 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:hidden">
            <div className="mx-auto flex max-w-2xl items-center gap-2">{renderButtons(true)}</div>
          </div>
        </>
      )}
    </div>
  );
}
