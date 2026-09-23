import { describe, expect, it } from "vitest";
import {
  RateLimiter,
  getClientIp,
  SHORTEN_LIMIT,
  SHORTEN_WINDOW_MS,
} from "./rate-limit";

describe("RateLimiter", () => {
  it("allows requests under the limit", () => {
    const limiter = new RateLimiter(2, 1000);
    expect(limiter.check("ip", 0)).toEqual({ allowed: true });
    expect(limiter.check("ip", 0)).toEqual({ allowed: true });
  });

  it("blocks over the limit with Retry-After and recovers after the window", () => {
    const limiter = new RateLimiter(2, 1000);
    limiter.check("ip", 0);
    limiter.check("ip", 0);
    const blocked = limiter.check("ip", 0);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSec).toBe(1);
    expect(limiter.check("ip", 1001).allowed).toBe(true);
  });

  it("tracks keys independently and defaults to 10/min", () => {
    expect(SHORTEN_LIMIT).toBe(10);
    expect(SHORTEN_WINDOW_MS).toBe(60_000);
    const limiter = new RateLimiter(1, 1000);
    expect(limiter.check("a", 0).allowed).toBe(true);
    expect(limiter.check("b", 0).allowed).toBe(true);
    expect(limiter.check("a", 0).allowed).toBe(false);
  });
});

describe("getClientIp", () => {
  it("uses the first x-forwarded-for entry", () => {
    const request = new Request("http://localhost/", {
      headers: { "x-forwarded-for": "1.2.3.4, 5.6.7.8" },
    });
    expect(getClientIp(request)).toBe("1.2.3.4");
  });

  it("falls back to unknown without the header", () => {
    expect(getClientIp(new Request("http://localhost/"))).toBe("unknown");
  });
});
