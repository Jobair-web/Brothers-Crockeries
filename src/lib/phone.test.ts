import { describe, expect, it } from "vitest";
import { identifierToEmail, isPhoneEmail, normalizeBdPhone } from "./phone";

describe("normalizeBdPhone", () => {
  it("accepts local, +880 and 880 formats", () => {
    expect(normalizeBdPhone("01712345678")).toBe("01712345678");
    expect(normalizeBdPhone("+8801712345678")).toBe("01712345678");
    expect(normalizeBdPhone("880 1712-345678")).toBe("01712345678");
  });
  it("rejects invalid numbers", () => {
    expect(normalizeBdPhone("01212345678")).toBeNull();
    expect(normalizeBdPhone("12345")).toBeNull();
  });
});

describe("identifierToEmail", () => {
  it("keeps real emails (lower-cased)", () => {
    expect(identifierToEmail(" Shop@Example.com ")).toEqual({ email: "shop@example.com" });
  });
  it("maps a phone number to a deterministic internal email", () => {
    const r = identifierToEmail("01712345678");
    expect(r?.phone).toBe("01712345678");
    expect(isPhoneEmail(r?.email)).toBe(true);
  });
  it("returns null for garbage", () => {
    expect(identifierToEmail("hello")).toBeNull();
  });
});
