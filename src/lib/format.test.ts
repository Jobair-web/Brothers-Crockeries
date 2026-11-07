import { describe, expect, it } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
  it("formats taka with thousands separators", () => {
    expect(formatPrice(12430)).toBe("৳12,430");
    expect(formatPrice(849.6)).toBe("৳850");
  });
});
