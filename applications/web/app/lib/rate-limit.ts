export const SHORTEN_LIMIT = 10;
export const SHORTEN_WINDOW_MS = 60_000;

/**
 * Sliding-window rate limiter. In-memory per process instance: limits do
 * not survive restarts and are not shared between instances. Documented
 * limitation — a distributed store (Redis) would be the next step.
 */
export class RateLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number = SHORTEN_LIMIT,
    private readonly windowMs: number = SHORTEN_WINDOW_MS,
  ) {}

  check(
    key: string,
    now: number = Date.now(),
  ): { allowed: boolean; retryAfterSec?: number } {
    const cutoff = now - this.windowMs;
    const recent = (this.hits.get(key) ?? []).filter((t) => t > cutoff);
    if (recent.length >= this.limit) {
      const oldest = recent[0] ?? now;
      this.hits.set(key, recent);
      return {
        allowed: false,
        retryAfterSec: Math.max(
          1,
          Math.ceil((oldest + this.windowMs - now) / 1000),
        ),
      };
    }
    recent.push(now);
    this.hits.set(key, recent);
    return { allowed: true };
  }
}

export const shortenRateLimiter = new RateLimiter();

/**
 * Best-effort client IP. React Router does not expose the socket in
 * action/loader args, so this relies on `x-forwarded-for` and falls back
 * to a shared "unknown" bucket (e.g. direct local dev without a proxy).
 */
export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const first = forwarded?.split(",")[0]?.trim();
  return first && first.length > 0 ? first : "unknown";
}
