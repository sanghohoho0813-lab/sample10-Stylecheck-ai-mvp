import { describe, expect, it } from "vitest";
import { DEMO_SAMPLES } from "../demo-samples";
import { LOOK_TINTS } from "../look-tints";

describe("look tints", () => {
  it("every sample photo has a loading colour", () => {
    for (const s of DEMO_SAMPLES) expect(LOOK_TINTS[s.image], s.id).toMatch(/^#[0-9a-f]{6}$/);
  });
});
