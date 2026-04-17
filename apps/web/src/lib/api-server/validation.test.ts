// @vitest-environment node
import { describe, it, expect } from "vitest";
import {
  validateCreateTravelPlan,
  validateCreateItineraryItem,
  validateUpdateItineraryItem,
  validateReorderItineraryItems,
  validateCreateShareInvite,
  validateAcceptShareInvite,
  validateMoveItineraryItem,
} from "./validation";
import { ValidationError } from "./errors";

describe("validateCreateTravelPlan", () => {
  const valid = {
    destination_city: "Paris",
    start_date: "2026-06-01",
    end_date: "2026-06-10",
  };

  it("accepts a valid payload", () => {
    expect(validateCreateTravelPlan(valid)).toEqual(valid);
  });

  it("trims destination_city whitespace", () => {
    const result = validateCreateTravelPlan({ ...valid, destination_city: "  Paris  " });
    expect(result.destination_city).toBe("Paris");
  });

  it("throws when destination_city is empty", () => {
    expect(() => validateCreateTravelPlan({ ...valid, destination_city: "  " })).toThrow(
      ValidationError,
    );
  });

  it("throws when start_date is invalid format", () => {
    expect(() => validateCreateTravelPlan({ ...valid, start_date: "01-06-2026" })).toThrow(
      ValidationError,
    );
  });

  it("throws when end_date is before start_date", () => {
    expect(() =>
      validateCreateTravelPlan({ ...valid, start_date: "2026-06-10", end_date: "2026-06-01" }),
    ).toThrow(ValidationError);
  });

  it("accepts same start_date and end_date", () => {
    expect(() =>
      validateCreateTravelPlan({ ...valid, start_date: "2026-06-01", end_date: "2026-06-01" }),
    ).not.toThrow();
  });

  it("throws when body is not an object", () => {
    expect(() => validateCreateTravelPlan("invalid")).toThrow(ValidationError);
  });
});

describe("validateCreateItineraryItem", () => {
  it("accepts a valid description", () => {
    expect(validateCreateItineraryItem({ description: "Breakfast" })).toEqual({
      description: "Breakfast",
      time: null,
    });
  });

  it("trims description whitespace", () => {
    expect(validateCreateItineraryItem({ description: "  Breakfast  " })).toEqual({
      description: "Breakfast",
      time: null,
    });
  });

  it("throws when description is empty", () => {
    expect(() => validateCreateItineraryItem({ description: "   " })).toThrow(ValidationError);
  });

  it("throws when description exceeds 2000 chars", () => {
    expect(() =>
      validateCreateItineraryItem({ description: "a".repeat(2001) }),
    ).toThrow(ValidationError);
  });
});

describe("validateUpdateItineraryItem", () => {
  it("delegates to the same rules as create", () => {
    expect(validateUpdateItineraryItem({ description: "Museum visit" })).toEqual({
      description: "Museum visit",
      time: null,
    });
    expect(() => validateUpdateItineraryItem({ description: "" })).toThrow(ValidationError);
  });
});

describe("validateReorderItineraryItems", () => {
  const uuid1 = "11111111-1111-1111-1111-111111111111";
  const uuid2 = "22222222-2222-2222-2222-222222222222";

  it("accepts a valid list of UUIDs", () => {
    expect(validateReorderItineraryItems({ item_ids_in_order: [uuid1, uuid2] })).toEqual({
      item_ids_in_order: [uuid1, uuid2],
    });
  });

  it("throws when array is empty", () => {
    expect(() => validateReorderItineraryItems({ item_ids_in_order: [] })).toThrow(
      ValidationError,
    );
  });

  it("throws when an ID is not a valid UUID", () => {
    expect(() =>
      validateReorderItineraryItems({ item_ids_in_order: ["not-a-uuid"] }),
    ).toThrow(ValidationError);
  });

  it("throws when IDs are not unique", () => {
    expect(() =>
      validateReorderItineraryItems({ item_ids_in_order: [uuid1, uuid1] }),
    ).toThrow(ValidationError);
  });
});

describe("validateCreateShareInvite", () => {
  it("accepts a valid email", () => {
    expect(validateCreateShareInvite({ invited_email: "user@example.com" })).toEqual({
      invited_email: "user@example.com",
    });
  });

  it("lowercases and trims the email", () => {
    expect(validateCreateShareInvite({ invited_email: "  User@Example.COM  " })).toEqual({
      invited_email: "user@example.com",
    });
  });

  it("throws for an invalid email", () => {
    expect(() => validateCreateShareInvite({ invited_email: "notanemail" })).toThrow(
      ValidationError,
    );
  });
});

describe("validateAcceptShareInvite", () => {
  it("accepts a valid token", () => {
    expect(validateAcceptShareInvite({ token: "a".repeat(32) })).toEqual({
      token: "a".repeat(32),
    });
  });

  it("throws when token is shorter than 16 chars", () => {
    expect(() => validateAcceptShareInvite({ token: "short" })).toThrow(ValidationError);
  });

  it("throws when token is missing", () => {
    expect(() => validateAcceptShareInvite({})).toThrow(ValidationError);
  });
});

describe("validateMoveItineraryItem", () => {
  it("accepts a valid target_day with no time", () => {
    expect(validateMoveItineraryItem({ target_day: "2026-06-05" })).toEqual({
      target_day: "2026-06-05",
      time: null,
    });
  });

  it("accepts a valid target_day with a valid time", () => {
    expect(validateMoveItineraryItem({ target_day: "2026-06-05", time: "09:30" })).toEqual({
      target_day: "2026-06-05",
      time: "09:30",
    });
  });

  it("throws when target_day is missing", () => {
    expect(() => validateMoveItineraryItem({})).toThrow(ValidationError);
  });

  it("throws when target_day is not a valid date format", () => {
    expect(() => validateMoveItineraryItem({ target_day: "06-05-2026" })).toThrow(ValidationError);
  });

  it("throws when time is not in HH:MM format", () => {
    expect(() => validateMoveItineraryItem({ target_day: "2026-06-05", time: "9:30" })).toThrow(ValidationError);
  });

  it("treats empty string time as null", () => {
    expect(validateMoveItineraryItem({ target_day: "2026-06-05", time: "" })).toEqual({
      target_day: "2026-06-05",
      time: null,
    });
  });

  it("throws when body is not an object", () => {
    expect(() => validateMoveItineraryItem("invalid")).toThrow(ValidationError);
  });
});
