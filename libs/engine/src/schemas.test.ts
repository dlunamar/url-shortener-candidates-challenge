import { describe, expect, it } from "vitest";
import { MAX_URL_LENGTH, ShortCodeSchema, ShortenInputSchema } from "./schemas";

describe("ShortenInputSchema", () => {
  it("accepts valid http(s) URLs", () => {
    expect(
      ShortenInputSchema.safeParse({ url: "https://example.com/path?q=1" })
        .success,
    ).toBe(true);
    expect(ShortenInputSchema.safeParse({ url: "http://example.com" }).success)
      .toBe(true);
  });

  it("trims surrounding whitespace", () => {
    const parsed = ShortenInputSchema.safeParse({
      url: "  https://example.com  ",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.url).toBe("https://example.com");
    }
  });

  it("rejects empty, malformed, overlong and dangerous URLs", () => {
    expect(ShortenInputSchema.safeParse({ url: "" }).success).toBe(false);
    expect(ShortenInputSchema.safeParse({ url: "not-a-url" }).success).toBe(
      false,
    );
    expect(
      ShortenInputSchema.safeParse({ url: "javascript:alert(1)" }).success,
    ).toBe(false);
    expect(
      ShortenInputSchema.safeParse({ url: "data:text/plain,hi" }).success,
    ).toBe(false);
    expect(
      ShortenInputSchema.safeParse({ url: "ftp://example.com" }).success,
    ).toBe(false);
    expect(
      ShortenInputSchema.safeParse({
        url: `https://example.com/${"a".repeat(MAX_URL_LENGTH)}`,
      }).success,
    ).toBe(false);
  });
});

describe("ShortCodeSchema", () => {
  it("accepts 7 base62 characters", () => {
    expect(ShortCodeSchema.safeParse("aB3dE9x").success).toBe(true);
  });

  it("rejects malformed codes", () => {
    expect(ShortCodeSchema.safeParse("abc").success).toBe(false);
    expect(ShortCodeSchema.safeParse("toolongcode").success).toBe(false);
    expect(ShortCodeSchema.safeParse("abc-def").success).toBe(false);
    expect(ShortCodeSchema.safeParse("").success).toBe(false);
  });
});
