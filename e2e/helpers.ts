import path from "node:path";
import { expect, type Page, type TestInfo } from "@playwright/test";

export const OUTFIT = path.join(__dirname, "fixtures", "outfit.png");

export const isPhone = (info: TestInfo) => info.project.name === "phone";

/** The label of the step the stepper marks as current (사진 / 상황 / 조건). */
export async function currentStep(page: Page) {
  const text = await page.locator("[aria-current=step]").innerText();
  return text.replace(/[\s\d]/g, "");
}

/** The phone and desktop layouts render the flow buttons in different places — use the visible one. */
export const visibleButton = (page: Page, name: string | RegExp) =>
  page.getByRole("button", { name }).locator("visible=true").first();

/** Count shown on a history filter tab — waits until history has loaded from storage. */
export async function countOf(page: Page, tab: string) {
  const locator = page.getByRole("tab", { name: new RegExp(tab) });
  await expect(locator).toHaveText(/\d/);
  return Number((await locator.innerText()).replace(/[^0-9]/g, ""));
}

export const DARK_PHOTO = path.join(__dirname, "fixtures", "dark-landscape.jpg");

/** Upload → (auto) 상황 → 비즈니스 미팅 · 상사 · 호텔 → result. Returns the result URL. */
export async function checkUploadedOutfit(page: Page) {
  await page.goto("/check");
  await page.locator('input[data-picker="album"]').setInputFiles(OUTFIT);
  // Picking a photo completes 사진 — the flow moves on by itself
  await expect(page.getByRole("radiogroup", { name: "상황 선택" })).toBeVisible();
  await page.getByRole("radio", { name: /비즈니스/ }).click();
  await page.getByRole("button", { name: "상사", exact: true }).click();
  await page.getByRole("button", { name: "호텔", exact: true }).click();
  await visibleButton(page, "코디 판정하기").click();
  await page.waitForURL("**/result/**");
  await expect(page.locator("#verdict")).toBeVisible();
  return page.url();
}
