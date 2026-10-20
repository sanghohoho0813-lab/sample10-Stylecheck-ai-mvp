"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Info } from "lucide-react";
import OutfitUploader from "@/components/OutfitUploader";
import SituationStep from "@/components/SituationStep";
import AnalysisLoading from "@/components/AnalysisLoading";
import { useToast } from "@/components/Toast";
import { SAMPLE_MAP } from "@/lib/demo-samples";
import { conditionsFor, currentSeason, MOODS, OCCASION_MAP } from "@/lib/occasions";
import { PHOTO_PLACEHOLDER } from "@/lib/placeholder";
import { runStyleAnalysis } from "@/lib/style-engine";
import { getDraft, getPreferredMoods, getSavePhotos, makeId, saveAnalysis, setDraft } from "@/lib/storage";
import type { AnalysisConditions, OccasionId } from "@/lib/types";
import { photoTip, type PhotoInfo, type PreparedImage } from "@/lib/utils";
import LookImage from "@/components/LookImage";

type Step = "upload" | "occasion" | "loading";

// The same outer frame in every state (wide enough for the docked photo on
// desktop), so swapping the loading placeholder for a step never shifts it.
const FRAME = "mx-auto max-w-2xl px-5 pb-10 pt-6 md:px-8 md:pb-20 md:pt-12 lg:max-w-5xl";

const STEPS: { id: Exclude<Step, "loading">; label: string }[] = [
  { id: "upload", label: "사진" },
  { id: "occasion", label: "상황" },
];
const ALL_STEPS: Step[] = ["upload", "occasion", "loading"];

/** History entries written by the earlier three-step flow ("conditions") land on 상황. */
const asStep = (s: unknown): Step | undefined =>
  s === "conditions" ? "occasion" : ALL_STEPS.includes(s as Step) ? (s as Step) : undefined;

const freshConditions = (): AnalysisConditions => ({
  companion: null,
  place: null,
  mood: null,
  season: currentSeason(),
  note: "",
});

const isOccasion = (v: string | null): v is OccasionId => Boolean(v && OCCASION_MAP[v as OccasionId]);

/**
 * 사진 → 상황 → 판정. 상황 is the only required answer; its details are optional
 * and shown on the same screen. A photo picked on the home page arrives here
 * already on 상황 (?from=home).
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
  const [photo, setPhoto] = useState<PhotoInfo | null>(null);
  const [sampleId, setSampleId] = useState<string | null>(null);
  const [occasion, setOccasion] = useState<OccasionId | null>(null);
  const [moodFromPrefs, setMoodFromPrefs] = useState(false);
  const [conditions, setConditions] = useState<AnalysisConditions>(freshConditions);
  const [error, setError] = useState<string | null>(null);
  /** Blocked "코디 판정하기" taps — each one re-runs the grid's nudge */
  const [attempt, setAttempt] = useState(0);

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
    if (!occ && s === "loading") return "occasion";
    return s;
  };

  // ── Start: home handoff › resumed draft › deep link (?sample= / ?occasion=) › fresh
  useEffect(() => {
    // Handoffs: a photo picked on home (?from=home) or "same situation, new photo" from a result (?from=again)
    const fromHome = params.get("from") === "home" || params.get("from") === "again";
    const historyStep = asStep(window.history.state?.scStep) ?? (fromHome ? "occasion" : undefined);
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
      setPhoto(draft.photo ?? null);
      setSampleId(draft.sampleId);
      setConditions({ ...freshConditions(), ...draft.conditions });
      setMoodFromPrefs(draft.moodFromPrefs);
      next = historyStep === "loading" ? "occasion" : historyStep ?? "upload";
      restored = true;
    } else if (sampleParam && SAMPLE_MAP[sampleParam]) {
      const s = SAMPLE_MAP[sampleParam];
      setSampleId(s.id);
      img = s.image;
      occ = s.occasion;
      next = "occasion";
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
    const savedTrail = (window.history.state?.scTrail as unknown[] | undefined)
      ?.map(asStep)
      .filter((x): x is Step => Boolean(x));
    trail.current = restored && Array.isArray(savedTrail) && savedTrail.length ? [...savedTrail.slice(0, -1), next] : [next];
    // Drop ?from=home so a later refresh resumes from the draft, not the handoff
    window.history.replaceState(
      { ...window.history.state, scStep: next, scTrail: trail.current },
      "",
      fromHome ? "/check" : undefined
    );
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
      const target = asStep(e.state?.scStep);
      if (!target) return;
      const saved: Step[] = Array.isArray(e.state.scTrail)
        ? e.state.scTrail.map(asStep).filter((x: Step | undefined): x is Step => Boolean(x))
        : [];
      trail.current = saved.length ? saved : [target];
      setError(null);
      setStep(reachable(target === "loading" ? "occasion" : target));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  // ── Keep the draft current ─────────────────────────────────────────────
  useEffect(() => {
    if (!ready || finishing.current) return;
    setDraft({ image, photo, sampleId, occasion, conditions, moodFromPrefs });
  }, [ready, image, photo, sampleId, occasion, conditions, moodFromPrefs]);

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

  const chooseOccasion = (id: OccasionId) => {
    setOccasion(id);
    setError(null);
    // Answers the new situation doesn't ask about would silently move the score
    setConditions((c) => conditionsFor(id, c));
  };

  /** A photo was picked — there is nothing left to do on 사진, so move on. */
  const takePhoto = (picked: PreparedImage) => {
    setSampleId(null);
    setImage(picked.dataUrl);
    setPhoto(picked.info);
    advance("occasion");
  };

  const applySample = (id: string) => {
    const s = SAMPLE_MAP[id];
    if (!s) return;
    setSampleId(s.id);
    setImage(s.image);
    setPhoto(null);
    if (!occasion) chooseOccasion(s.occasion); // a sample knows its situation; keep one the user already chose
    advance("occasion");
  };

  const goNext = () => {
    if (step === "upload") {
      if (!image) return setError("먼저 코디 사진을 올려주세요.");
      advance("occasion");
    } else if (step === "occasion") {
      if (!occasion) {
        // The button sits in the bottom bar; the question may be off screen
        setError("어디에 입고 갈 옷인지 하나만 골라주세요.");
        setAttempt((a) => a + 1);
        const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        document.getElementById("step-title")?.scrollIntoView({ block: "start", behavior: still ? "auto" : "smooth" });
        return;
      }
      advance("loading");
    }
  };

  const goBack = () => {
    if (step === "occasion") retreat("upload");
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
      retreat("occasion");
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
      <div className={FRAME} aria-busy="true">
        <div key="loading" className="mx-auto max-w-2xl">
          <div className="skeleton h-72 rounded-lg" />
        </div>
      </div>
    );
  }

  // Kept short so it never truncates in the 360px sticky bar
  const primaryLabel = step === "occasion" ? "코디 판정하기" : "다음";
  // Until the step's required input exists, "다음" stays visually quiet so the
  // step's own action (촬영 / 앨범 / 상황 선택) is the one primary on screen.
  // It remains pressable and explains what is missing.
  const blocked = (step === "upload" && !image) || (step === "occasion" && !occasion);
  const sample = sampleId ? SAMPLE_MAP[sampleId] : undefined;
  const photoName = sample?.name ?? "내 코디 사진";
  const tip = sample ? null : photoTip(photo);

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
        {step !== "occasion" && <ArrowRight className="h-4 w-4 shrink-0" />}
      </button>
    </>
  );

  // Desktop: while choosing the situation, the photo docks beside the form
  // instead of shrinking to a thumbnail.
  const docked = step === "occasion" && Boolean(image);

  return (
    <div className={FRAME}>
      <div
        key="flow"
        className={
          docked
            ? "lg:grid lg:grid-cols-[17rem_minmax(0,1fr)] lg:grid-rows-[auto_1fr] lg:items-start lg:gap-x-14"
            : "mx-auto max-w-2xl"
        }
      >
        {step !== "loading" && (
          <nav aria-label="코디 확인 단계" className="mb-7 lg:col-start-2">
            <ol className="grid grid-cols-2 gap-2">
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

        {/* What is being judged — the photo stays in view while choosing the
            situation: a strip above the form on phones, a card docked beside
            it on desktop. One element either way. */}
        {docked && image && (
          <div className="mb-7 rounded-md bg-white p-2 shadow-subtle lg:sticky lg:top-28 lg:col-start-1 lg:row-span-2 lg:row-start-1 lg:mb-0 lg:overflow-hidden lg:rounded-lg lg:p-0">
            <div className="flex items-center gap-3 lg:block">
              <LookImage
                src={image}
                alt=""
                sizes="(min-width: 1024px) 272px, 56px"
                className="w-14 shrink-0 rounded-sm lg:w-full lg:rounded-none"
                priority
              />
              <div className="flex min-w-0 flex-1 items-center gap-3 lg:p-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-semibold text-ink">{photoName}</p>
                  <p className="truncate text-meta text-ink-faint">{sample ? "샘플 코디로 확인해요" : "이 사진으로 확인해요"}</p>
                </div>
                <button
                  type="button"
                  onClick={() => retreat("upload")}
                  className="btn btn-xs btn-quiet px-3 lg:border lg:border-linen lg:px-3.5"
                >
                  사진 변경
                </button>
              </div>
            </div>
            {tip && (
              <p className="mt-2 flex items-start gap-2 border-t border-linen px-1 pt-2 text-meta text-ink-soft lg:mx-4 lg:mt-0 lg:px-0 lg:pb-4 lg:pt-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                {tip}
              </p>
            )}
          </div>
        )}

        <div className="min-w-0 lg:col-start-2">
          {step === "upload" && (
            <OutfitUploader
              image={image}
              photo={photo}
              isSample={Boolean(sampleId)}
              sampleName={sample?.name}
              onImage={takePhoto}
              onSample={applySample}
              occasionLabel={occasion ? OCCASION_MAP[occasion].label : undefined}
              onClear={() => {
                setImage(null);
                setPhoto(null);
                setSampleId(null);
              }}
              error={error}
            />
          )}

          {step === "occasion" && (
            <SituationStep
              occasion={occasion}
              onOccasion={chooseOccasion}
              conditions={conditions}
              onConditions={setConditions}
              moodFromPrefs={moodFromPrefs}
              error={error}
              attempt={attempt}
            />
          )}

          {step === "loading" && image && (
            <AnalysisLoading
              image={image}
              caption={
                occasion
                  ? `${[OCCASION_MAP[occasion].label, conditions.companion, conditions.place].filter(Boolean).join(" · ")} 기준`
                  : undefined
              }
              onDone={finishAnalysis}
            />
          )}

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
      </div>
    </div>
  );
}
