import { DEMO_SAMPLES } from "./demo-samples";
import { currentSeason, OCCASION_MAP } from "./occasions";
import { isStoredPhoto, PHOTO_PLACEHOLDER } from "./placeholder";
import { runStyleAnalysis } from "./style-engine";
import type { AnalysisConditions, AnalysisResult } from "./types";

/**
 * Local persistence layer for the MVP demo.
 * Mirrors the Supabase tables (style_analyses / favorites) documented in
 * supabase/schema.sql — swap the implementation to Supabase queries when
 * credentials are configured, keeping the same function signatures.
 */

const HISTORY_KEY = "stylecheck.history.v1";
const PREF_KEY = "stylecheck.prefs.v1";
const PHOTO_KEY = "stylecheck.savephoto.v1";
const MAX_HISTORY = 30;
const DAY = 24 * 60 * 60 * 1000;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/* ── Storage access ──────────────────────────────────────────────────────
   localStorage can throw (blocked cookies, private modes) or be full.
   Blocked → keep working in memory for this tab. Full → report it so the
   caller can make room. */

const memory = new Map<string, string>();

const isQuotaError = (e: unknown) =>
  e instanceof DOMException && (e.name === "QuotaExceededError" || e.name === "NS_ERROR_DOM_QUOTA_REACHED" || e.code === 22);

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return memory.get(key) ?? null;
  }
}

/** false only when storage is full. */
function write(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (e) {
    if (isQuotaError(e)) return false;
    memory.set(key, value);
    return true;
  }
}

function remove(key: string): void {
  memory.delete(key);
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

/* ── Demo seed ───────────────────────────────────────────────────────────
   A first-time visitor sees a lived-in account: three past checks dated
   relative to today, one of them saved and one with the fix applied.
   Seeding happens once (when no history key exists). Deleting records
   keeps them deleted; "데모 데이터 초기화" removes the key to reseed. */

interface SeedSpec {
  id: string;
  sampleId: string;
  daysAgo: number;
  conditions: Omit<AnalysisConditions, "season" | "note">;
  favorite?: boolean;
  applied?: boolean;
}

const SEEDS: SeedSpec[] = [
  {
    id: "seed-date",
    sampleId: "date-feminine",
    daysAgo: 2,
    conditions: { companion: "연인", place: "카페", mood: "자연스러운" },
    favorite: true,
    applied: true,
  },
  {
    id: "seed-interview",
    sampleId: "interview-black",
    daysAgo: 5,
    conditions: { companion: "처음 만나는 사람", place: "회사", mood: "단정한" },
  },
  {
    id: "seed-friends",
    sampleId: "friends-casual",
    daysAgo: 9,
    conditions: { companion: "친구", place: "식당", mood: "편안한" },
  },
];

function buildSeed(now = Date.now(), only?: string): AnalysisResult[] {
  return SEEDS.filter((spec) => !only || spec.id === only).flatMap((spec) => {
    const sample = DEMO_SAMPLES.find((s) => s.id === spec.sampleId);
    if (!sample) return [];
    const conditions: AnalysisConditions = { ...spec.conditions, season: currentSeason(), note: "" };
    const createdAt = new Date(now - spec.daysAgo * DAY - 3 * 60 * 60 * 1000).toISOString();
    const result = runStyleAnalysis({
      imageKey: sample.id,
      image: sample.image,
      occasion: sample.occasion,
      conditions,
      sample,
    });
    return [
      {
        ...result,
        id: spec.id,
        createdAt,
        favorite: Boolean(spec.favorite),
        appliedAt: spec.applied ? new Date(Date.parse(createdAt) + 10 * 60 * 1000).toISOString() : null,
      },
    ];
  });
}

/* ── Records from older versions ─────────────────────────────────────────
   History written by earlier builds may miss newer fields. Anything the
   screens cannot render is dropped instead of crashing the page; seeded demo
   records are regenerated so they match the current engine. */

function isRenderable(a: unknown): a is AnalysisResult {
  const r = a as AnalysisResult;
  return (
    Boolean(r) &&
    typeof r.id === "string" &&
    typeof r.image === "string" &&
    typeof r.overallScore === "number" &&
    Boolean(OCCASION_MAP[r.occasion]) &&
    Boolean(r.scores) &&
    Boolean(r.conditions) &&
    typeof r.primaryRecommendation?.to === "string" &&
    Array.isArray(r.positives) &&
    r.positives.length > 0 &&
    Array.isArray(r.improvements) &&
    r.improvements.length > 0 &&
    Array.isArray(r.items) &&
    Array.isArray(r.alternatives)
  );
}

function normalize(r: AnalysisResult): AnalysisResult {
  if (r.id.startsWith("seed-") && !r.conditionNotes) {
    const fresh = buildSeed(Date.now(), r.id)[0];
    if (fresh) return { ...fresh, createdAt: r.createdAt, favorite: Boolean(r.favorite), appliedAt: r.appliedAt ?? null };
  }
  const conditionDefaults: AnalysisConditions = { companion: null, place: null, mood: null, season: currentSeason(), note: "" };
  const recDefaults = { slot: "", scoreBefore: r.overallScore, scoreAfter: Math.min(97, r.overallScore + 5) };
  return {
    ...r,
    favorite: Boolean(r.favorite),
    appliedAt: r.appliedAt ?? null,
    wardrobeSuggestion: r.wardrobeSuggestion ?? null,
    conditions: { ...conditionDefaults, ...r.conditions },
    primaryRecommendation: { ...recDefaults, ...r.primaryRecommendation },
  };
}

/* ── History ─────────────────────────────────────────────────────────── */

export function listAnalyses(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  const raw = read(HISTORY_KEY);
  if (raw === null) {
    const seeded = buildSeed();
    persist(seeded);
    return seeded;
  }
  const parsed = safeParse<unknown>(raw, []);
  return Array.isArray(parsed) ? parsed.filter(isRenderable).map(normalize) : [];
}

export function getAnalysis(id: string): AnalysisResult | null {
  return listAnalyses().find((a) => a.id === id) ?? null;
}

export type SaveStatus = "saved" | "trimmed" | "failed";

/** "trimmed" = saved after removing photos from older records to make room. */
export function saveAnalysis(result: AnalysisResult): SaveStatus {
  const list = listAnalyses().filter((a) => a.id !== result.id);
  list.unshift(result);
  return persist(list.slice(0, MAX_HISTORY));
}

function update(id: string, patch: (a: AnalysisResult) => void): AnalysisResult | null {
  const list = listAnalyses();
  const target = list.find((a) => a.id === id);
  if (!target) return null;
  patch(target);
  persist(list);
  return target;
}

export function toggleFavorite(id: string): boolean {
  return update(id, (a) => {
    a.favorite = !a.favorite;
  })?.favorite ?? false;
}

/** The flow's completion event: commit to (or undo) the primary recommendation. */
export function setRecommendationApplied(id: string, applied: boolean): AnalysisResult | null {
  return update(id, (a) => {
    a.appliedAt = applied ? new Date().toISOString() : null;
  });
}

/** Removes a record and returns what is needed to undo it. */
export function deleteAnalysis(id: string): { record: AnalysisResult; index: number } | null {
  const list = listAnalyses();
  const index = list.findIndex((a) => a.id === id);
  if (index < 0) return null;
  const [record] = list.splice(index, 1);
  persist(list);
  return { record, index };
}

export function restoreAnalysis(record: AnalysisResult, index: number): void {
  const list = listAnalyses().filter((a) => a.id !== record.id);
  list.splice(Math.min(index, list.length), 0, record);
  persist(list.slice(0, MAX_HISTORY));
}

/**
 * Uploaded photos are the only large thing stored. When storage is full,
 * photos are removed from the oldest records first (the record, score and
 * recommendation stay), then — only if that is still not enough — the
 * oldest records themselves.
 */
function persist(list: AnalysisResult[]): SaveStatus {
  const attempt = (l: AnalysisResult[]) => write(HISTORY_KEY, JSON.stringify(l));
  if (attempt(list)) return "saved";

  const slim = list.map((a) => ({ ...a }));
  for (let i = slim.length - 1; i >= 0; i--) {
    if (!isStoredPhoto(slim[i].image)) continue;
    slim[i].image = PHOTO_PLACEHOLDER;
    if (attempt(slim)) return "trimmed";
  }
  for (let n = slim.length - 1; n >= 1; n--) {
    if (attempt(slim.slice(0, n))) return "trimmed";
  }
  return "failed";
}

export function makeId(): string {
  return `sc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Preferences ─────────────────────────────────────────────────────── */

export function getPreferredMoods(): string[] {
  if (typeof window === "undefined") return [];
  const parsed = safeParse<unknown>(read(PREF_KEY), []);
  return Array.isArray(parsed) ? parsed.filter((m): m is string => typeof m === "string") : [];
}

export function setPreferredMoods(moods: string[]): void {
  write(PREF_KEY, JSON.stringify(moods));
}

export function getSavePhotos(): boolean {
  if (typeof window === "undefined") return true;
  return read(PHOTO_KEY) !== "off";
}

export function setSavePhotos(on: boolean): void {
  write(PHOTO_KEY, on ? "on" : "off");
}

/* ── Check-flow draft ────────────────────────────────────────────────────
   Survives a refresh or an accidental tab switch mid-flow (per tab only). */

const DRAFT_KEY = "stylecheck.draft.v1";

export interface CheckDraft {
  image: string | null;
  sampleId: string | null;
  occasion: string | null;
  conditions: AnalysisConditions;
  moodFromPrefs: boolean;
}

export function getDraft(): CheckDraft | null {
  if (typeof window === "undefined") return null;
  try {
    return safeParse<CheckDraft | null>(sessionStorage.getItem(DRAFT_KEY), null);
  } catch {
    return null;
  }
}

export function setDraft(draft: CheckDraft | null): void {
  try {
    if (draft) sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    else sessionStorage.removeItem(DRAFT_KEY);
  } catch {
    /* a large photo may not fit — the flow still works without the draft */
  }
}

/** Clears everything this demo stored; the next read reseeds sample history. */
export function resetDemoData(): void {
  [HISTORY_KEY, PREF_KEY, PHOTO_KEY].forEach(remove);
}
