import { SAMPLE_MAP } from "./demo-samples";
import { COMPANIONS, MOODS, OCCASION_MAP, PLACES } from "./occasions";
import { SHARED_PLACEHOLDER } from "./placeholder";
import { generateAlternatives, runStyleAnalysis } from "./style-engine";
import type { AnalysisResult, OccasionId, ScoreSet, Season } from "./types";

/**
 * Share links that work on a friend's device.
 *
 * Results live in the owner's browser, so a plain /result/<id> link is empty
 * anywhere else. The link instead carries the engine inputs (sample or image
 * key, occasion, conditions) plus the numbers the owner saw; the receiving
 * device re-runs the deterministic engine for the wording and pins the
 * numbers so both people see the same verdict. The photo itself is never
 * shared.
 */

interface SharePayload {
  v: 1;
  o: OccasionId;
  /** Demo sample id, or the upload's deterministic image key */
  s?: string;
  k?: string;
  /** companion / place / mood as indexes into the option lists (-1 = none) */
  c: [number, number, number];
  n: Season;
  /** overall score, score after the fix */
  sc: [number, number];
  /** dimension scores in ScoreSet key order */
  d: number[];
  a?: 1;
  t: number;
}

const DIMENSIONS: (keyof ScoreSet)[] = ["occasion", "formality", "color", "silhouette", "seasonal", "detail"];
const SEASONS: Season[] = ["spring", "summer", "autumn", "winter"];

const indexIn = (list: readonly string[], v: string | null) => (v ? list.indexOf(v) : -1);
const pick = (list: readonly string[], i: unknown) =>
  typeof i === "number" && i >= 0 && i < list.length ? list[i] : null;

function toBase64Url(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let bin = "";
  bytes.forEach((b) => (bin += String.fromCharCode(b)));
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(code: string): string {
  const bin = atob(code.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

export function encodeShare(r: AnalysisResult): string {
  const payload: SharePayload = {
    v: 1,
    o: r.occasion,
    ...(r.sampleId ? { s: r.sampleId } : { k: r.imageKey ?? r.id }),
    c: [
      indexIn(COMPANIONS, r.conditions.companion),
      indexIn(PLACES, r.conditions.place),
      indexIn(MOODS, r.conditions.mood),
    ],
    n: r.conditions.season,
    sc: [r.overallScore, r.primaryRecommendation.scoreAfter],
    d: DIMENSIONS.map((k) => r.scores[k]),
    ...(r.appliedAt ? { a: 1 as const } : {}),
    t: Math.round(Date.parse(r.createdAt) / 60000),
  };
  return toBase64Url(JSON.stringify(payload));
}

export function shareUrl(r: AnalysisResult, origin: string): string {
  return `${origin}/result/${encodeURIComponent(r.id)}?share=${encodeShare(r)}`;
}

const isScore = (n: unknown): n is number => typeof n === "number" && Number.isFinite(n) && n >= 0 && n <= 100;

function decode(code: string): SharePayload | null {
  try {
    const p = JSON.parse(fromBase64Url(code)) as SharePayload;
    if (p?.v !== 1 || !OCCASION_MAP[p.o] || !SEASONS.includes(p.n)) return null;
    if (!Array.isArray(p.c) || !Array.isArray(p.sc) || !p.sc.every(isScore)) return null;
    if (!Array.isArray(p.d) || p.d.length !== DIMENSIONS.length || !p.d.every(isScore)) return null;
    if (!p.s && !p.k) return null;
    if (p.s && !SAMPLE_MAP[p.s]) return null;
    return p;
  } catch {
    return null;
  }
}

/** Rebuilds a read-only result from a share code, or null if the code is damaged. */
export function resultFromShare(code: string, id: string): AnalysisResult | null {
  const p = decode(code);
  if (!p) return null;
  const sample = p.s ? SAMPLE_MAP[p.s] : undefined;
  const base = runStyleAnalysis({
    imageKey: sample ? sample.id : p.k!,
    image: sample ? sample.image : SHARED_PLACEHOLDER,
    occasion: p.o,
    conditions: {
      companion: pick(COMPANIONS, p.c[0]),
      place: pick(PLACES, p.c[1]),
      mood: pick(MOODS, p.c[2]),
      season: p.n,
      note: "",
    },
    sample,
  });
  const [overall, after] = p.sc;
  const primaryRecommendation = { ...base.primaryRecommendation, scoreBefore: overall, scoreAfter: after };
  const createdAt = new Date((Number(p.t) || 0) * 60000 || Date.now()).toISOString();
  return {
    ...base,
    id,
    createdAt,
    favorite: false,
    overallScore: overall,
    scores: Object.fromEntries(DIMENSIONS.map((k, i) => [k, p.d[i]])) as unknown as ScoreSet,
    primaryRecommendation,
    alternatives: generateAlternatives(overall, primaryRecommendation),
    appliedAt: p.a ? createdAt : null,
  };
}
