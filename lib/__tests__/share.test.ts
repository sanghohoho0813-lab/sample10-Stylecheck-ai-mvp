import { describe, expect, it } from "vitest";
import { SAMPLE_MAP } from "../demo-samples";
import { SHARED_PLACEHOLDER } from "../placeholder";
import { encodeShare, resultFromShare, shareUrl } from "../share";
import { runStyleAnalysis, verdictFor } from "../style-engine";
import type { AnalysisResult } from "../types";

const createdAt = "2026-10-06T06:30:00.000Z";

function sampleResult(overrides: Partial<AnalysisResult> = {}): AnalysisResult {
  const sample = SAMPLE_MAP["wedding-navy"];
  return {
    ...runStyleAnalysis({
      imageKey: sample.id,
      image: sample.image,
      occasion: sample.occasion,
      conditions: { companion: "가족", place: "예식장", mood: "단정한", season: "summer", note: "" },
      sample,
    }),
    id: "sc-test-1",
    createdAt,
    favorite: true,
    ...overrides,
  };
}

function uploadResult(): AnalysisResult {
  return {
    ...runStyleAnalysis({
      imageKey: "upload-91822-cXdlcnR5dWlvcGFzZGZn",
      image: "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQ",
      occasion: "family-meeting",
      conditions: { companion: "상사", place: "호텔", mood: null, season: "winter", note: "" },
    }),
    id: "sc-test-2",
    createdAt,
    favorite: false,
  };
}

const decodePayload = (code: string) =>
  JSON.parse(Buffer.from(code.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf8"));

describe("share links", () => {
  it("rebuild the same verdict on a device with no history", () => {
    for (const original of [sampleResult(), uploadResult()]) {
      const shared = resultFromShare(encodeShare(original), original.id)!;
      expect(shared).not.toBeNull();
      expect(shared.overallScore).toBe(original.overallScore);
      expect(verdictFor(shared.overallScore)).toBe(verdictFor(original.overallScore));
      expect(shared.scores).toEqual(original.scores);
      expect(shared.primaryRecommendation).toEqual(original.primaryRecommendation);
      expect(shared.positives).toEqual(original.positives);
      expect(shared.conditionNotes).toEqual(original.conditionNotes);
      expect(shared.conditions).toEqual(original.conditions);
      expect(shared.createdAt).toBe(createdAt);
    }
  });

  it("never carry the photo", () => {
    const original = uploadResult();
    const code = encodeShare(original);
    expect(JSON.stringify(decodePayload(code))).not.toContain("data:image");
    expect(resultFromShare(code, original.id)!.image).toBe(SHARED_PLACEHOLDER);
  });

  it("keep sample photos, which are public", () => {
    const original = sampleResult();
    expect(resultFromShare(encodeShare(original), original.id)!.image).toBe(original.image);
  });

  it("carry the completion event but not the owner's favourites", () => {
    const applied = sampleResult({ appliedAt: createdAt });
    const shared = resultFromShare(encodeShare(applied), applied.id)!;
    expect(shared.appliedAt).not.toBeNull();
    expect(shared.favorite).toBe(false);
  });

  it("stay short and URL-safe", () => {
    const url = shareUrl(sampleResult(), "https://stylecheck.example");
    expect(url.length).toBeLessThan(400);
    expect(new URL(url).searchParams.get("share")).toMatch(/^[A-Za-z0-9_-]+$/);
  });

  it.each([
    ["empty", ""],
    ["garbage", "not-base64-%%%"],
    ["truncated", encodeShare(sampleResult()).slice(0, 40)],
  ])("reject a %s code", (_, code) => {
    expect(resultFromShare(code, "x")).toBeNull();
  });

  it("reject tampered payloads instead of rendering nonsense", () => {
    const payload = decodePayload(encodeShare(sampleResult()));
    const encode = (p: object) => Buffer.from(JSON.stringify(p)).toString("base64url");
    expect(resultFromShare(encode({ ...payload, sc: [140, 150] }), "x")).toBeNull();
    expect(resultFromShare(encode({ ...payload, o: "graduation" }), "x")).toBeNull();
    expect(resultFromShare(encode({ ...payload, s: "../../etc" }), "x")).toBeNull();
    expect(resultFromShare(encode({ ...payload, d: [1, 2] }), "x")).toBeNull();
    expect(resultFromShare(encode({ ...payload, v: 2 }), "x")).toBeNull();
  });
});
