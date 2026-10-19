import { expect, test } from "@playwright/test";
import { checkUploadedOutfit, currentStep, DARK_PHOTO, isPhone, OUTFIT, visibleButton } from "./helpers";

test.describe("첫 화면 → 코디 확인", () => {
  test("a photo picked on the home page goes straight to 상황", async ({ page }) => {
    await page.goto("/");
    await page.locator('input[data-picker="album"]').setInputFiles(OUTFIT);
    await page.waitForURL(/\/check$/);
    await expect.poll(() => currentStep(page)).toBe("상황");
    await expect(page.getByText("이 사진으로 확인해요")).toBeVisible();
    await page.getByRole("radio", { name: /면접/ }).click();
    await visibleButton(page, "코디 판정하기").click();
    await page.waitForURL("**/result/**");
    await expect(page.getByText("면접").first()).toBeVisible();
  });

  test("tells the user, honestly, when a photo is dark or sideways", async ({ page }) => {
    await page.goto("/check");
    await page.locator('input[data-picker="album"]').setInputFiles(DARK_PHOTO);
    await expect(page.getByText("사진이 조금 어두워요")).toBeVisible();
  });
});

test.describe("코디 확인 흐름", () => {
  test("upload → situation → a result that leads with the verdict and one change", async ({ page }) => {
    await checkUploadedOutfit(page);
    await expect(page.getByText("비즈니스 미팅").first()).toBeVisible();
    await expect(page.getByText("데모 분석").first()).toBeVisible();
    await expect(page.getByText("사진을 인식하지 않은 규칙 기반 예시예요")).toBeVisible();
    // The chosen details are explained, not silently applied
    await expect(page.getByRole("list", { name: "핵심 이유" })).toContainText("호텔에서 상사와 만나는 자리");
    // The one change: what, why, what changes
    const card = page.locator("section", { has: page.locator("#next-action") });
    await expect(card.getByText("바꿀 것")).toBeVisible();
    await expect(card.getByText("왜", { exact: true })).toBeVisible();
    await expect(card.getByText("달라지는 점")).toBeVisible();
    expect(await page.evaluate(() => window.scrollY)).toBeLessThan(5);
  });

  test("only asks what the situation leaves open — everything else is optional", async ({ page }) => {
    await page.goto("/check?sample=interview-black");
    await expect(page.getByText("회사 · 처음 만나는 면접관 기준")).toBeVisible();
    await expect(page.getByText("누구를 만나나요?")).toHaveCount(0);
    await expect(page.getByText("모두 선택 사항")).toBeVisible();
    // Season comes from today's date — shown, not asked
    await expect(page.getByText("오늘 날짜 기준")).toBeVisible();
    await page.getByRole("button", { name: "상황 다시 고르기" }).click();
    await page.getByRole("radio", { name: /비즈니스/ }).click();
    await expect(page.getByText("누구를 만나나요?")).toBeVisible();
    await expect(page.getByText("어디서 만나나요?")).toBeVisible();
  });

  test("explains bad files and moves on once there is a photo", async ({ page }) => {
    await page.goto("/check");
    await expect(visibleButton(page, /^다음/)).toHaveCount(0);
    await page.locator('input[data-picker="album"]').setInputFiles({
      name: "notes.txt",
      mimeType: "text/plain",
      buffer: Buffer.from("not a photo"),
    });
    await expect(page.locator("main").getByRole("alert")).toContainText("JPG, PNG, WEBP");
    await page.locator('input[data-picker="album"]').setInputFiles(OUTFIT);
    await expect.poll(() => currentStep(page)).toBe("상황");
  });

  test("asks for a situation before judging", async ({ page }) => {
    await page.goto("/check");
    await page.locator('input[data-picker="album"]').setInputFiles(OUTFIT);
    await visibleButton(page, "코디 판정하기").click({ force: true }); // aria-disabled, still explains
    await expect(page.locator("main").getByRole("alert")).toContainText("어디에 입고 갈 옷인지");
  });

  test("browser back and forward walk the steps without losing the photo", async ({ page }) => {
    await page.goto("/check");
    await page.locator('input[data-picker="album"]').setInputFiles(OUTFIT);
    await expect.poll(() => currentStep(page)).toBe("상황");
    await page.goBack();
    await expect.poll(() => currentStep(page)).toBe("사진");
    await expect(page.getByAltText("선택한 코디 사진")).toBeVisible();
    await page.goForward();
    await expect.poll(() => currentStep(page)).toBe("상황");
  });

  test("a refresh resumes the same step with the same answers", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await page.getByRole("button", { name: "야외", exact: true }).click();
    await page.reload();
    await expect.poll(() => currentStep(page)).toBe("상황");
    await expect(page.getByRole("button", { name: "야외", exact: true })).toHaveAttribute("aria-pressed", "true");
  });

  test("a sample lands on 상황 with its situation chosen, and back returns to 사진", async ({ page }) => {
    await page.goto("/check");
    await page.getByRole("button", { name: /미니멀 면접 룩/ }).click();
    await expect.poll(() => currentStep(page)).toBe("상황");
    await expect(page.getByText("회사 · 처음 만나는 면접관 기준")).toBeVisible();
    await page.goBack();
    await expect.poll(() => currentStep(page)).toBe("사진");
  });

  test("back from the result skips the flow and returns to where it started", async ({ page }, info) => {
    await page.goto("/history");
    if (isPhone(info)) await page.getByRole("navigation", { name: "하단 메뉴" }).getByRole("link", { name: "코디 확인" }).click();
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
    await page.getByRole("navigation", { name: "하단 메뉴" }).getByRole("link", { name: "코디 확인" }).click();
    await page.getByRole("button", { name: /러블리 캐주얼 룩/ }).click();
    await page.getByRole("button", { name: "코디 확인 닫기" }).click();
    await expect(page).toHaveURL(/\/guide$/);
  });

  test("conditions move the score by the amount they report", async ({ page }) => {
    await page.goto("/check?sample=wedding-navy");
    await page.getByRole("button", { name: "바꾸기", exact: true }).click();
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
    await page.getByRole("button", { name: "상황 다시 고르기" }).click();
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
