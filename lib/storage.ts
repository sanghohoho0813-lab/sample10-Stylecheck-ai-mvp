import { DEMO_SAMPLES } from "./demo-samples";
import { currentSeason } from "./occasions";
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

function buildSeed(now = Date.now()): AnalysisResult[] {
  return SEEDS.flatMap((spec) => {
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

/* ── History ─────────────────────────────────────────────────────────── */

export function listAnalyses(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(HISTORY_KEY);
  if (raw === null) {
    const seeded = buildSeed();
    persist(seeded);
    return seeded;
  }
  return safeParse<AnalysisResult[]>(raw, []);
}

export function getAnalysis(id: string): AnalysisResult | null {
  return listAnalyses().find((a) => a.id === id) ?? null;
}

export function saveAnalysis(result: AnalysisResult): void {
  const list = listAnalyses().filter((a) => a.id !== result.id);
  list.unshift(result);
  persist(list.slice(0, MAX_HISTORY));
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

function persist(list: AnalysisResult[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // storage full — drop oldest entries (uploaded photos are large) and retry once
    try {
      localStorage.setItem(HISTORY_KEY, JSON.stringify(list.slice(0, 8)));
    } catch {
      /* give up quietly; the in-memory flow still works */
    }
  }
}

export function makeId(): string {
  return `sc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/* ── Preferences ─────────────────────────────────────────────────────── */

export function getPreferredMoods(): string[] {
  if (typeof window === "undefined") return [];
  return safeParse<string[]>(localStorage.getItem(PREF_KEY), []);
}

export function setPreferredMoods(moods: string[]): void {
  try {
    localStorage.setItem(PREF_KEY, JSON.stringify(moods));
  } catch {
    /* noop */
  }
}

export function getSavePhotos(): boolean {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(PHOTO_KEY) !== "off";
}

export function setSavePhotos(on: boolean): void {
  try {
    localStorage.setItem(PHOTO_KEY, on ? "on" : "off");
  } catch {
    /* noop */
  }
}

/** Clears everything this demo stored; the next read reseeds sample history. */
export function resetDemoData(): void {
  try {
    [HISTORY_KEY, PREF_KEY, PHOTO_KEY].forEach((k) => localStorage.removeItem(k));
  } catch {
    /* noop */
  }
}
