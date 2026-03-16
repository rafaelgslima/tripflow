import { describe, expect, it } from "vitest";
import { toDateOnlyISOString } from "./index";

describe("toDateOnlyISOString", () => {
  it("returns YYYY-MM-DD", () => {
    const date = new Date("2026-03-20T15:30:00.000Z");
    expect(toDateOnlyISOString(date)).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("normalizes to date only", () => {
    const date = new Date("2026-03-20T23:59:59.999Z");
    expect(toDateOnlyISOString(date)).toBe("2026-03-20");
  });
});
