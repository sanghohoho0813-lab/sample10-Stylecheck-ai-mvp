import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";
import { visibleButton } from "./helpers";

/**
 * Automated WCAG 2.1 A/AA audit (axe-core) of every screen, on phone and
 * desktop. Serious and critical findings fail the build.
 *
 * Excluded: the shared 미래AI랩 back/forward pill (a separate, centrally
 * maintained script) and the "StyleCheck AI" logotype, which WCAG 1.4.3
 * exempts from contrast requirements.
 */
async function audit(page: Page) {
  await page.waitForLoadState("networkidle");
  // Entrances finished (looping ones — shimmer, pulse — never do)
  await page.waitForFunction(() =>
    document.getAnimations().every((a) => a.playState !== "running" || a.effect?.getTiming().iterations === Infinity),
  );
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .exclude("[data-mirae-history-nav]")
    .exclude("[data-logotype]")
    .analyze();
  return violations
    .filter((v) => v.impact === "serious" || v.impact === "critical")
    .map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(" ")).join(" | ")}`);
}

test.describe("접근성", () => {
  // Audit the settled screen, not a frame of an entrance animation
  test.use({ contextOptions: { reducedMotion: "reduce" } });

  for (const path of ["/", "/check", "/check?sample=wedding-navy", "/result/seed-date", "/history", "/mypage", "/guide", "/no-such-page"]) {
    test(`${path} passes an automated WCAG A/AA audit`, async ({ page }) => {
      await page.goto(path);
      expect(await audit(page)).toEqual([]);
    });
  }

  test("the applied state passes too, and the loading screen names its progress", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await visibleButton(page, "코디 판정하기").click();
    // The loading screen changes every 700ms, too fast to audit as a whole —
    // its one control must still be named
    await expect(page.getByRole("progressbar", { name: "판정 진행률" })).toBeVisible();
    await page.waitForURL("**/result/**");
    await visibleButton(page, "추천대로 바꿔 입기").click();
    await expect(page.getByRole("status").filter({ hasText: "추천대로 바꿔 입었어요" })).toBeVisible();
    expect(await audit(page)).toEqual([]);
  });
});
