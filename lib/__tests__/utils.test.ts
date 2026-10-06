import { describe, expect, it } from "vitest";
import { formatDate, formatRelativeDay, withEuro, withGwa } from "../utils";

describe("Korean particles", () => {
  it.each([
    ["블랙 로퍼", "블랙 로퍼로"], // no final consonant
    ["블랙 스트레이트팁", "블랙 스트레이트팁으로"], // final consonant
    ["차콜 재킷", "차콜 재킷으로"],
    ["진주 이어링", "진주 이어링으로"],
    ["미니 크로스백", "미니 크로스백으로"],
    ["가방", "가방으로"],
    ["실버 미니 워치", "실버 미니 워치로"],
    ["팔", "팔로"], // ㄹ takes 로
    ["Loafer", "Loafer로"], // non-Hangul falls back to 로
  ])("%s → %s", (word, expected) => {
    expect(withEuro(word)).toBe(expected);
  });

  it.each([
    ["친구", "친구와"],
    ["상사", "상사와"],
    ["가족", "가족과"],
    ["연인", "연인과"],
    ["처음 만나는 사람", "처음 만나는 사람과"],
  ])("%s → %s", (word, expected) => {
    expect(withGwa(word)).toBe(expected);
  });
});

describe("dates", () => {
  const now = new Date(2026, 9, 6, 15, 0); // 2026-10-06 (화) 15:00 local

  it("formats a full date with the weekday", () => {
    expect(formatDate(new Date(2026, 8, 29, 9).toISOString())).toBe("9월 29일 (화)");
  });

  it.each([
    [new Date(2026, 9, 6, 9, 5), "오늘 09:05"],
    [new Date(2026, 9, 5, 23, 59), "어제 23:59"],
    [new Date(2026, 9, 1, 12), "5일 전"],
    [new Date(2026, 8, 20, 12), "9월 20일"],
  ])("%s → %s", (date, expected) => {
    expect(formatRelativeDay(date.toISOString(), now)).toBe(expected);
  });
});
