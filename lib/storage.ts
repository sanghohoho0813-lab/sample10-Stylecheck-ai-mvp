import type { AnalysisResult } from "./types";

/**
 * Local persistence layer for the MVP demo.
 * Mirrors the Supabase tables (style_analyses / favorites) documented in
 * supabase/schema.sql — swap the implementation to Supabase queries when
 * credentials are configured, keeping the same function signatures.
 */

const HISTORY_KEY = "stylecheck.history.v1";
const MAX_HISTORY = 30;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function listAnalyses(): AnalysisResult[] {
  if (typeof window === "undefined") return [];
  return safeParse<AnalysisResult[]>(localStorage.getItem(HISTORY_KEY), []);
}

export function getAnalysis(id: string): AnalysisResult | null {
  return listAnalyses().find((a) => a.id === id) ?? null;
}

export function saveAnalysis(result: AnalysisResult): void {
  const list = listAnalyses().filter((a) => a.id !== result.id);
  list.unshift(result);
  persist(list.slice(0, MAX_HISTORY));
}

export function toggleFavorite(id: string): boolean {
  const list = listAnalyses();
  const target = list.find((a) => a.id === id);
  if (!target) return false;
  target.favorite = !target.favorite;
  persist(list);
  return target.favorite;
}

export function deleteAnalysis(id: string): void {
  persist(listAnalyses().filter((a) => a.id !== id));
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
