import { expect, test } from "@playwright/test";
import { checkUploadedOutfit, currentStep, isPhone, OUTFIT, visibleButton } from "./helpers";

test.describe("코디 확인 흐름", () => {
  test("upload → situation → conditions → a result that names the situation", async ({ page }) => {
    await checkUploadedOutfit(page);
    await expect(page.getByText("결혼식 코디 적합도")).toBeVisible();
    await expect(page.getByText("데모 분석").first()).toBeVisible();
    // The chosen conditions are explained, not silently applied
    await expect(page.getByRole("list", { name: "핵심 이유" })).toContainText("호텔에서 상사와 만나는 자리");
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test("only offers 다음 once there is a photo, and explains bad files", async ({ page }) => {
    await page.goto("/check");
    await expect(visibleButton(page, /^다음/)).toHaveCount(0);
    await page.locator("input[type=file]").first().setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a photo"),
    });
    await expect(page.locator("main").getByRole("alert")).toContainText("JPG, PNG, WEBP");
    await page.locator("input[type=file]").first().setInputFiles(OUTFIT);
    await expect(page.locator("main").getByRole("alert")).toHaveCount(0);
    await expect(visibleButton(page, /^다음/)).toBeVisible();
  });

  test("asks for a situation before moving on", async ({ page }) => {
    await page.goto("/check");
    await page.locator("input[type=file]").first().setInputFiles(OUTFIT);
    await visibleButton(page, /^다음/).click();
    await visibleButton(page, /^다음/).click({ force: true }); // aria-disabled, still explains
    await expect(page.locator("main").getByRole("alert")).toContainText("어디에 입고 갈 옷인지");
  });

  test("browser back and forward walk the steps without losing the photo", async ({ page }) => {
    await page.goto("/check");
    await page.locator("input[type=file]").first().setInputFiles(OUTFIT);
    await visibleButton(page, /^다음/).click();
    expect(await currentStep(page)).toBe("상황");
    await page.goBack();
    expect(await currentStep(page)).toBe("사진");
    await expect(page.getByAltText("선택한 코디 사진")).toBeVisible();
    await page.goForward();
    expect(await currentStep(page)).toBe("상황");
  });

  test("a refresh resumes the same step with the same answers", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await page.getByRole("button", { name: "거래처", exact: true }).click();
    await page.reload();
    expect(await currentStep(page)).toBe("조건");
    await expect(page.getByRole("button", { name: "거래처", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("a sample skips to 조건, and back still reaches 상황", async ({ page }) => {
    await page.goto("/check");
    await page.getByRole("button", { name: /미니멀 면접 룩/ }).click();
    expect(await currentStep(page)).toBe("조건");
    await page.goBack();
    expect(await currentStep(page)).toBe("상황");
    await expect(page.getByRole("radio", { name: /면접/ })).toHaveAttribute("aria-checked", "true");
  });

  test("back from the result skips the flow and returns to where it started", async ({ page }, info) => {
    await page.goto("/history");
    if (isPhone(info)) await page.getByRole("navigation", { name: "하단 메뉴" }).getByRole("link", { name: "검사" }).click();
    else await page.getByRole("banner").getByRole("link", { name: "코디 확인하기" }).click();
    await page.waitForURL("**/check");
    await page.getByRole("button", { name: /클래식 하객 룩/ }).click();
    await visibleButton(page, "코디 판정하기").click();
    await page.waitForURL("**/result/**");
    await page.goBack();
    await expect(page).toHaveURL(/\/history$/);
  });

  test("the close button returns to the page the check started from", async ({ page }, info) => {
    test.skip(!isPhone(info), "the close button is part of the phone header");
    await page.goto("/guide");
    await page.getByRole("navigation", { name: "하단 메뉴" }).getByRole("link", { name: "검사" }).click();
    await page.getByRole("button", { name: /러블리 캐주얼 룩/ }).click();
    await page.getByRole("button", { name: "코디 확인 닫기" }).click();
    await expect(page).toHaveURL(/\/guide$/);
  });

  test("conditions move the score by the amount they report", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await page.getByRole("button", { name: "여름", exact: true }).click();
    await visibleButton(page, "코디 판정하기").click();
    await page.waitForURL("**/result/**");
    await expect(page.getByRole("list", { name: "핵심 이유" })).toContainText("여름에 입기엔 조금 더워 보여요");
    const toggle = page.getByRole("button", { name: /자세히 보기/ });
    if ((await toggle.getAttribute("aria-expanded")) !== "true") await toggle.click();
    await expect(page.locator("#detail-panel").getByText("−3점")).toBeVisible();
  });

  test("the situation picker works from the keyboard", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await page.getByRole("button", { name: "상황 단계로 돌아가기" }).click();
    const selected = page.getByRole("radio", { checked: true });
    await expect(selected).toContainText("결혼식");
    await selected.focus();
    await page.keyboard.press("ArrowRight");
    await expect(page.getByRole("radio", { name: /면접/ })).toBeFocused();
    await expect(page.getByRole("radio", { name: /면접/ })).toHaveAttribute("aria-checked", "true");
    await page.keyboard.press("End");
    await expect(page.getByRole("radio", { name: /장례식/ })).toHaveAttribute("aria-checked", "true");
  });
});
