import { expect, test } from "@playwright/test";
import { countOf, isPhone } from "./helpers";

test.describe("빈 화면 · 오류 · 설정", () => {
  test("a first visit starts with seeded history", async ({ page }) => {
    await page.goto("/history");
    expect(await countOf(page, "전체")).toBe(3);
    expect(await countOf(page, "저장한 코디")).toBe(1);
    expect(await countOf(page, "추천 적용")).toBe(1);
  });

  test("empty history offers a way in instead of zero-count filters", async ({ page }) => {
    await page.goto("/history");
    await page.evaluate(() => localStorage.setItem("stylecheck.history.v1", "[]"));
    await page.reload();
    await expect(page.getByRole("tab")).toHaveCount(0);
    await expect(page.getByRole("link", { name: "사진이 없다면 샘플로 체험하기" })).toBeVisible();
    await page.goto("/mypage");
    await expect(page.getByRole("list", { name: "내 기록 요약" })).not.toContainText("0점");
  });

  test("an empty filter points back to all records", async ({ page }) => {
    await page.goto("/history?filter=favorite");
    await page.getByRole("button", { name: "저장 해제" }).click();
    await page.getByRole("button", { name: "전체 기록 보기" }).click();
    await expect(page.getByRole("tab", { selected: true })).toContainText("전체");
  });

  test("the preferred mood becomes the default 원하는 느낌", async ({ page }) => {
    await page.goto("/mypage");
    await page.getByRole("button", { name: /세련된/ }).click();
    await page.goto("/check?sample=wedding-navy");
    await expect(page.getByRole("button", { name: "세련된", exact: true })).toHaveAttribute("aria-pressed", "true");
    await expect(page.getByText("선호 스타일에서 불러왔어요")).toBeVisible();
  });

  test("reset returns the demo to its first-visit state", async ({ page }) => {
    await page.goto("/history");
    await page.getByRole("button", { name: "기록 삭제" }).first().click();
    await page.goto("/mypage");
    await page.getByRole("button", { name: "초기화" }).click();
    await page.getByRole("button", { name: "한 번 더 눌러 초기화" }).click();
    await page.goto("/history");
    expect(await countOf(page, "전체")).toBe(3);
  });

  test("unknown results and routes have friendly screens", async ({ page }) => {
    await page.goto("/result/does-not-exist");
    await expect(page.getByText("결과를 찾을 수 없어요")).toBeVisible();
    const response = await page.goto("/no-such-page");
    expect(response?.status()).toBe(404);
    await expect(page.getByText("페이지를 찾을 수 없어요")).toBeVisible();
  });

  test("the guide's section nav follows the reader", async ({ page }, info) => {
    await page.goto("/guide#date");
    const nav = page.getByRole("navigation", { name: isPhone(info) ? "상황 바로가기" : "상황 목록" });
    await expect(nav.locator("[aria-current=location]")).toContainText("데이트");
  });

  test("keyboard users can skip to the content", async ({ page }, info) => {
    test.skip(isPhone(info), "keyboard path");
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "본문 바로가기" });
    await expect(skip).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(page.locator("#main")).toBeFocused();
  });
});
