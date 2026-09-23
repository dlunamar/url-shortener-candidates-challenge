import { describe, expect, it } from "vitest";
import {
  BASE62_ALPHABET,
  CODE_LENGTH,
  createCodeGenerator,
  generateCode,
} from "./code-generator";

describe("code generator", () => {
  it("uses the base62 alphabet with the default length", () => {
    expect(BASE62_ALPHABET).toBe(
      "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
    );
    expect(CODE_LENGTH).toBe(7);
    const code = generateCode();
    expect(code).toHaveLength(CODE_LENGTH);
    expect(code).toMatch(/^[A-Za-z0-9]+$/);
  });

  it("generates unique codes (no collisions in a batch of 1000)", () => {
    const codes = new Set<string>();
    for (let i = 0; i < 1000; i++) {
      codes.add(generateCode());
    }
    expect(codes.size).toBe(1000);
  });

  it("supports a custom length", () => {
    const generate = createCodeGenerator(10);
    expect(generate()).toHaveLength(10);
  });

  it("rejects a non-positive length", () => {
    expect(() => createCodeGenerator(0)).toThrow(RangeError);
    expect(() => createCodeGenerator(-3)).toThrow(RangeError);
  });
});
