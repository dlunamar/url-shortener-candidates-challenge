import {
  CodeCollisionError,
  InvalidUrlError,
  ShortenInputSchema,
  shortenUrl,
  type UrlRepository,
} from "@url-shortener/engine";
import { getUrlRepository } from "./repository.server";
import {
  getClientIp,
  shortenRateLimiter,
  type RateLimiter,
} from "./rate-limit";
import { isUrlSafe } from "./url-safety.server";
import { getBaseUrl } from "./base-url";

export interface ShortenDeps {
  repo?: UrlRepository;
  rateLimiter?: RateLimiter;
  urlAllowed?: (url: string) => Promise<boolean>;
}

export type ShortenResult =
  | { ok: true; shortenedUrl: string }
  | {
      ok: false;
      error: string;
      status: number;
      headers?: Record<string, string>;
    };

/**
 * Framework-agnostic shortening flow: plain input (Request) in, plain
 * result object out. The React Router `action` maps it to `data()`.
 */
export async function handleShorten(
  request: Request,
  deps: ShortenDeps = {},
): Promise<ShortenResult> {
  const repo = deps.repo ?? getUrlRepository();
  const rateLimiter = deps.rateLimiter ?? shortenRateLimiter;
  const urlAllowed = deps.urlAllowed ?? isUrlSafe;

  let baseUrl: string;
  try {
    baseUrl = getBaseUrl();
  } catch {
    return { ok: false, error: "Service misconfigured", status: 500 };
  }

  const limited = rateLimiter.check(getClientIp(request));
  if (!limited.allowed) {
    return {
      ok: false,
      error: "Too many requests. Try again later.",
      status: 429,
      headers: { "Retry-After": String(limited.retryAfterSec ?? 60) },
    };
  }

  const formData = await request.formData();
  const raw = (formData.get("url") ?? "").toString();
  const parsed = ShortenInputSchema.safeParse({ url: raw });
  if (!parsed.success) {
    return {
      ok: false,
      error: parsed.error.issues[0]?.message ?? "Invalid URL",
      status: 400,
    };
  }

  if (!(await urlAllowed(parsed.data.url))) {
    return { ok: false, error: "URL target is not allowed", status: 400 };
  }

  try {
    const shortened = await shortenUrl({ url: parsed.data.url }, { repo });
    return {
      ok: true,
      shortenedUrl: `${baseUrl}/s/${shortened.code}`,
    };
  } catch (error) {
    if (error instanceof InvalidUrlError) {
      return { ok: false, error: error.message, status: 400 };
    }
    if (error instanceof CodeCollisionError) {
      return {
        ok: false,
        error: "Service temporarily unavailable. Try again.",
        status: 503,
      };
    }
    return { ok: false, error: "Something went wrong", status: 500 };
  }
}
