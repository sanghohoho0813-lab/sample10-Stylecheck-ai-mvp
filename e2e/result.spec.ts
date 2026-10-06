import { expect, test } from "@playwright/test";
import { checkUploadedOutfit, countOf, visibleButton } from "./helpers";

test.describe("결과 · 기록", () => {
  test("applying the fix and saving persist across reloads, history and My Page", async ({ page }) => {
    const resultUrl = await checkUploadedOutfit(page);

    await visibleButton(page, "추천대로 바꿔 입기").click();
    await expect(page.getByRole("status").filter({ hasText: "바꿔 입기로 했어요" })).toBeVisible();
    await page.getByRole("button", { name: "저장", exact: true }).click();
    await expect(page.getByRole("button", { name: "저장됨" })).toBeVisible();

    await page.reload();
    await expect(page.getByText("바꿔 입기로 했어요")).toBeVisible();
    await expect(page.getByRole("button", { name: "저장됨" })).toBeVisible();

    await page.goto("/history?filter=applied");
    await expect(page.getByRole("tab", { selected: true })).toContainText("추천 적용");
    expect(await countOf(page, "추천 적용")).toBe(2);
    expect(await countOf(page, "전체")).toBe(4);
    await expect(page.getByRole("listitem").first()).toContainText("결혼식");

    await page.goto("/mypage");
    const summary = page.getByRole("list", { name: "내 기록 요약" });
    await expect(summary).toContainText(/확인한 코디\s*4\s*회/);
    await expect(summary).toContainText(/추천 적용\s*2\s*회/);
    await summary.getByRole("link", { name: /저장한 코디/ }).click();
    await expect(page).toHaveURL(/filter=favorite/);

    // Undo the completion
    await page.goto(resultUrl);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await page.reload();
    await expect(visibleButton(page, "추천대로 바꿔 입기")).toBeVisible();
  });

  test("deleting a record can be undone", async ({ page }) => {
    await page.goto("/history");
    expect(await countOf(page, "전체")).toBe(3);
    await page.getByRole("button", { name: "기록 삭제" }).first().click();
    expect(await countOf(page, "전체")).toBe(2);
    await page.getByRole("button", { name: "되돌리기" }).click();
    expect(await countOf(page, "전체")).toBe(3);
  });

  test("a share link shows the same verdict, read-only, on a device with no history", async ({ page, browser }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined }));
    await checkUploadedOutfit(page);
    await visibleButton(page, "추천대로 바꿔 입기").click();
    await page.getByRole("button", { name: "친구에게 물어보기" }).click();
    const url = (await page.evaluate(() => navigator.clipboard.readText())).split("\n").pop()!;
    const verdict = await page.locator("#verdict").innerText();

    const friend = await (await browser.newContext()).newPage();
    await friend.goto(url);
    await expect(friend.locator("#verdict")).toHaveText(verdict);
    await expect(friend.getByText("친구가 공유한 코디 판정")).toBeVisible();
    await expect(friend.getByText("추천대로 바꿔 입기로 했대요")).toBeVisible();
    await expect(friend.getByRole("button", { name: "추천대로 바꿔 입기" })).toHaveCount(0);
    // The link preview carries the verdict too
    const ogImage = await friend.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/og/result?share=");
    const preview = await friend.request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(preview.headers()["content-type"]).toBe("image/png");
    await friend.context().close();
  });

  test("a damaged share link explains itself", async ({ page }) => {
    await page.goto("/result/sc-x?share=eyJ2IjoxLCJv");
    await expect(page.getByText("공유 링크가 잘렸거나 올바르지 않아요")).toBeVisible();
  });
});
