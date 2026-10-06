// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SAMPLE_MAP } from "../demo-samples";
import { isStoredPhoto, PHOTO_PLACEHOLDER } from "../placeholder";
import { runStyleAnalysis } from "../style-engine";
import type { AnalysisResult } from "../types";

const HISTORY_KEY = "stylecheck.history.v1";

/** Fresh module per test — storage keeps an in-memory fallback at module scope. */
const load = async () => {
  vi.resetModules();
  return import("../storage");
};

function upload(id: string, photoBytes = 2_000): AnalysisResult {
  return {
    ...runStyleAnalysis({
      imageKey: `upload-${id}`,
      image: `data:image/jpeg;base64,${"A".repeat(photoBytes)}`,
      occasion: "interview",
      conditions: { companion: null, place: null, mood: null, season: "autumn", note: "" },
    }),
    id,
    createdAt: new Date().toISOString(),
    favorite: false,
  };
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

describe("history", () => {
  it("starts a first visit with three dated sample records", async () => {
    const { listAnalyses } = await load();
    const list = listAnalyses();
    expect(list.map((a) => a.id)).toEqual(["seed-date", "seed-interview", "seed-friends"]);
    expect(list.filter((a) => a.favorite)).toHaveLength(1);
    expect(list.filter((a) => a.appliedAt)).toHaveLength(1);
  });

  it("persists favourites and the completion event", async () => {
    const { getAnalysis, setRecommendationApplied, toggleFavorite } = await load();
    expect(toggleFavorite("seed-friends")).toBe(true);
    setRecommendationApplied("seed-friends", true);
    const { getAnalysis: reread } = await load();
    expect(reread("seed-friends")).toMatchObject({ favorite: true });
    expect(reread("seed-friends")?.appliedAt).toBeTruthy();
    setRecommendationApplied("seed-friends", false);
    expect(getAnalysis("seed-friends")?.appliedAt).toBeNull();
  });

  it("restores a deleted record to the same position", async () => {
    const { deleteAnalysis, listAnalyses, restoreAnalysis } = await load();
    const before = listAnalyses().map((a) => a.id);
    const removed = deleteAnalysis("seed-interview")!;
    expect(listAnalyses().map((a) => a.id)).not.toContain("seed-interview");
    restoreAnalysis(removed.record, removed.index);
    expect(listAnalyses().map((a) => a.id)).toEqual(before);
  });

  it("keeps the user's deletions instead of reseeding", async () => {
    const { deleteAnalysis, listAnalyses } = await load();
    listAnalyses().forEach((a) => deleteAnalysis(a.id));
    const { listAnalyses: reread } = await load();
    expect(reread()).toEqual([]);
  });

  it("skips records an older build wrote that the screens cannot render", async () => {
    const good = upload("sc-good");
    localStorage.setItem(
      HISTORY_KEY,
      JSON.stringify([good, { id: "sc-broken", occasion: "wedding" }, null, "junk", { ...good, id: "x", occasion: "prom" }])
    );
    const { listAnalyses } = await load();
    expect(listAnalyses().map((a) => a.id)).toEqual(["sc-good"]);
  });

  it("survives a corrupted history value", async () => {
    localStorage.setItem(HISTORY_KEY, "{not json");
    const { listAnalyses } = await load();
    expect(listAnalyses()).toEqual([]);
  });

  it("regenerates demo seeds written before conditions were scored", async () => {
    const sample = SAMPLE_MAP["interview-black"];
    const legacy = {
      ...runStyleAnalysis({
        imageKey: sample.id,
        image: sample.image,
        occasion: sample.occasion,
        conditions: { companion: null, place: null, mood: null, season: "autumn", note: "" },
        sample,
      }),
      id: "seed-interview",
      createdAt: "2026-10-01T03:00:00.000Z",
      favorite: true,
      conditionNotes: undefined,
    };
    localStorage.setItem(HISTORY_KEY, JSON.stringify([legacy]));
    const { listAnalyses } = await load();
    const [seed] = listAnalyses();
    expect(seed.conditionNotes).toBeDefined();
    expect(seed).toMatchObject({ createdAt: legacy.createdAt, favorite: true });
  });
});

describe("when storage is full", () => {
  /** Simulate a quota: any history write above `limit` characters throws. */
  function quota(limit: number) {
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(function (this: Storage, key: string, value: string) {
      if (key === HISTORY_KEY && value.length > limit) throw new DOMException("full", "QuotaExceededError");
      return setItem.call(this, key, value);
    });
  }

  it("drops old photos first and keeps every record", async () => {
    const { listAnalyses, saveAnalysis } = await load();
    listAnalyses().forEach(() => void 0); // seed
    saveAnalysis(upload("sc-old-1", 40_000));
    saveAnalysis(upload("sc-old-2", 40_000));
    quota(100_000);
    expect(saveAnalysis(upload("sc-new", 40_000))).toBe("trimmed");

    const list = listAnalyses();
    expect(list[0].id).toBe("sc-new");
    expect(isStoredPhoto(list[0].image)).toBe(true); // newest keeps its photo
    expect(list.find((a) => a.id === "sc-old-1")?.image).toBe(PHOTO_PLACEHOLDER);
    expect(list).toHaveLength(6);
  });

  it("reports a plain save when it fits", async () => {
    const { saveAnalysis } = await load();
    expect(saveAnalysis(upload("sc-small"))).toBe("saved");
  });
});

describe("when storage is blocked", () => {
  it("keeps working in memory for the tab", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("denied", "SecurityError");
    });
    const { getAnalysis, listAnalyses, saveAnalysis } = await load();
    expect(listAnalyses()).toHaveLength(3);
    expect(saveAnalysis(upload("sc-mem"))).toBe("saved");
    expect(getAnalysis("sc-mem")?.id).toBe("sc-mem");
  });
});

describe("preferences", () => {
  it("ignores malformed preferred moods", async () => {
    localStorage.setItem("stylecheck.prefs.v1", JSON.stringify(["단정한", 3, null, "세련된"]));
    const { getPreferredMoods } = await load();
    expect(getPreferredMoods()).toEqual(["단정한", "세련된"]);
  });

  it("reset clears everything and reseeds", async () => {
    const { deleteAnalysis, listAnalyses, resetDemoData, setPreferredMoods, getPreferredMoods } = await load();
    deleteAnalysis("seed-date");
    setPreferredMoods(["편안한"]);
    resetDemoData();
    expect(listAnalyses()).toHaveLength(3);
    expect(getPreferredMoods()).toEqual([]);
  });
});
