import { expect, test } from "@playwright/test";
import { checkUploadedOutfit, countOf, isPhone, visibleButton } from "./helpers";

test.describe("결과 · 추천 적용 · 기록", () => {
  test("applying the one change shows before → after and becomes part of the history", async ({ page }) => {
    const resultUrl = await checkUploadedOutfit(page);
    const before = await page.locator("#verdict").innerText();

    await visibleButton(page, "추천대로 바꿔 입기").click();
    const done = page.getByRole("status").filter({ hasText: "추천대로 바꿔 입었어요" });
    await expect(done).toBeVisible();
    await expect(done).toContainText("기록에 남겼어요");
    await expect(page.locator("#verdict")).toHaveText("이제 비즈니스 미팅에 딱 맞아요");
    expect(before).not.toBe("이제 비즈니스 미팅에 딱 맞아요");
    await expect(page.getByText("바꿔 입음", { exact: true })).toBeVisible();
    await page.getByRole("button", { name: "저장", exact: true }).click();
    await expect(page.getByRole("button", { name: "저장됨" })).toBeVisible();

    await page.reload();
    await expect(page.getByText("추천대로 바꿔 입었어요")).toBeVisible();
    await expect(page.getByRole("button", { name: "저장됨" })).toBeVisible();

    await page.getByRole("link", { name: "기록에서 보기" }).click();
    await expect(page).toHaveURL(/filter=applied/);
    await expect(page.getByRole("tab", { selected: true })).toContainText("바꿔 입음");
    expect(await countOf(page, "바꿔 입음")).toBe(2);
    expect(await countOf(page, "전체")).toBe(4);
    const newest = page.getByRole("listitem").filter({ hasText: "비즈니스 미팅" }).first();
    await expect(newest).toContainText("바꿔 입음");
    await expect(newest).toContainText("한 가지");

    await page.goto("/mypage");
    const summary = page.getByRole("list", { name: "내 기록 요약" });
    await expect(summary).toContainText(/확인한 코디\s*4\s*회/);
    await expect(summary).toContainText(/바꿔 입음\s*2\s*회/);
    await summary.getByRole("link", { name: /저장한 코디/ }).click();
    await expect(page).toHaveURL(/filter=favorite/);

    // Undo the completion
    await page.goto(resultUrl);
    await page.getByRole("button", { name: "되돌리기" }).click();
    await page.reload();
    await expect(visibleButton(page, "추천대로 바꿔 입기")).toBeVisible();
  });

  test("on phones the result's actions stay under the thumb", async ({ page }, info) => {
    test.skip(!isPhone(info), "the phone action bar");
    await page.goto("/check?sample=wedding-navy");
    await visibleButton(page, "코디 판정하기").click();
    await page.waitForURL("**/result/**");
    // The detail screen brings its own bar instead of the tab bar
    await expect(page.getByRole("navigation", { name: "하단 메뉴" })).toHaveCount(0);
    const bar = page.getByRole("group", { name: "이 결과로 할 일" });

    await page.evaluate(() => window.scrollTo(0, 700));
    await bar.getByRole("button", { name: "추천대로 바꿔 입기" }).click();
    // Applying from far down brings the changed verdict and score into view
    await expect(page.locator("#verdict")).toHaveText("이제 결혼식에 딱 맞아요");
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
    await expect(bar.getByRole("button", { name: "다시 확인하기" })).toBeVisible();

    await bar.getByRole("button", { name: "저장", exact: true }).click();
    await expect(bar.getByRole("button", { name: "저장됨" })).toBeVisible();
  });

  test("alternatives sit under the one change for when the item is missing", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await visibleButton(page, "코디 판정하기").click();
    await page.waitForURL("**/result/**");
    await page.getByText("이게 없다면").click();
    await expect(page.getByText("미니멀 재킷을 레이어링")).toBeVisible();
  });

  test("checking again keeps the situation and asks only for a new photo", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await page.getByRole("button", { name: "야외", exact: true }).click();
    await visibleButton(page, "코디 판정하기").click();
    await page.waitForURL("**/result/**");
    await page.getByRole("button", { name: "바꿔 입고 다시 확인하기" }).click();
    await page.waitForURL(/\/check$/);
    await expect(page.getByText("결혼식", { exact: true }).first()).toBeVisible();
    await expect(page.getByText("기준으로 확인해요")).toBeVisible();
  });

  test("deleting a record can be undone", async ({ page }) => {
    await page.goto("/history");
    expect(await countOf(page, "전체")).toBe(3);
    await page.getByRole("button", { name: "기록 삭제" }).first().click();
    expect(await countOf(page, "전체")).toBe(2);
    await page.getByRole("button", { name: "되돌리기" }).click();
    expect(await countOf(page, "전체")).toBe(3);
  });

  test("history separates the last seven days from earlier records", async ({ page }) => {
    await page.goto("/history");
    await expect(page.getByRole("heading", { name: /최근 7일 · 2/ })).toBeVisible();
    await expect(page.getByRole("heading", { name: /이전 기록 · 1/ })).toBeVisible();
    // A filter with records from one period alone needs no headings
    await page.getByRole("tab", { name: /저장한 코디/ }).click();
    await expect(page.getByRole("heading", { name: /최근 7일/ })).toHaveCount(0);
  });

  test("history names the user's patterns once there is enough data", async ({ page }) => {
    await page.goto("/history");
    const patterns = page.getByRole("region", { name: "내 스타일 패턴" });
    await expect(patterns).toBeVisible();
    await expect(patterns).toContainText(/최근 3번 중 \d번/);
  });

  test("a share link shows situation, verdict and advice — without the photo — on a clean device", async ({ page, browser }) => {
    await page.context().grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.addInitScript(() => Object.defineProperty(navigator, "share", { value: undefined }));
    await checkUploadedOutfit(page);
    const verdict = await page.locator("#verdict").innerText();
    await visibleButton(page, "추천대로 바꿔 입기").click();
    await page.getByRole("button", { name: "친구에게 물어보기" }).click();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    const url = copied.split("\n").pop()!;
    // The message itself reads on its own in a chat
    expect(copied).toMatch(/^비즈니스 미팅 코디 판정: .+ 어떻게 생각해\?/);

    const friend = await (await browser.newContext()).newPage();
    await friend.goto(url);
    await expect(friend.getByText("친구가 공유한 코디 판정")).toBeVisible();
    await expect(friend.getByText("친구는 추천대로 바꿔 입었어요")).toBeVisible();
    await expect(friend.getByRole("button", { name: "추천대로 바꿔 입기" })).toHaveCount(0);
    await expect(friend.getByAltText("공유된 코디").first()).toHaveAttribute("src", /^data:image\/svg/);
    expect(verdict.length).toBeGreaterThan(0);
    // The link preview carries the verdict too
    const ogImage = await friend.locator('meta[property="og:image"]').getAttribute("content");
    expect(ogImage).toContain("/og/result?share=");
    const ogTitle = await friend.locator('meta[property="og:title"]').getAttribute("content");
    expect(ogTitle).toMatch(/^비즈니스 미팅 코디 — /);
    const preview = await friend.request.get(new URL(ogImage!).pathname + new URL(ogImage!).search);
    expect(preview.headers()["content-type"]).toBe("image/png");
    await friend.context().close();
  });

  test("a damaged share link explains itself", async ({ page }) => {
    await page.goto("/result/sc-x?share=eyJ2IjoxLCJv");
    await expect(page.getByText("공유 링크가 잘렸거나 올바르지 않아요")).toBeVisible();
  });
});
