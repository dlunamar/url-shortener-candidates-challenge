import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InMemoryUrlRepository } from "@url-shortener/engine";
import { handleShorten, type ShortenDeps } from "./shorten.server";
import { RateLimiter } from "./rate-limit";

const originalPublicUrl = process.env.PUBLIC_URL;

beforeEach(() => {
  process.env.PUBLIC_URL = "http://localhost:5173";
});

afterEach(() => {
  if (originalPublicUrl === undefined) {
    delete process.env.PUBLIC_URL;
  } else {
    process.env.PUBLIC_URL = originalPublicUrl;
  }
});

function postRequest(url: string | null, ip = "9.9.9.9"): Request {
  const form = new FormData();
  if (url !== null) {
    form.set("url", url);
  }
  return new Request("http://localhost/", {
    method: "POST",
    body: form,
    headers: { "x-forwarded-for": ip },
  });
}

function deps(): ShortenDeps {
  return {
    repo: new InMemoryUrlRepository(),
    rateLimiter: new RateLimiter(),
    urlAllowed: async () => true,
  };
}

describe("handleShorten", () => {
  it("shortens a valid URL", async () => {
    const result = await handleShorten(
      postRequest("https://example.com/article"),
      deps(),
    );
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.shortenedUrl).toMatch(/\/s\/[A-Za-z0-9]{7}$/);
    }
  });

  it("rejects invalid input with status 400", async () => {
    for (const url of ["not-a-url", "javascript:alert(1)", ""]) {
      const result = await handleShorten(postRequest(url), deps());
      expect(result).toMatchObject({ ok: false, status: 400 });
      if (!result.ok) {
        expect(typeof result.error).toBe("string");
      }
    }
  });

  it("rejects a missing field with status 400", async () => {
    const result = await handleShorten(postRequest(null), deps());
    expect(result).toMatchObject({ ok: false, status: 400 });
  });

  it("rejects disallowed targets with status 400", async () => {
    const result = await handleShorten(postRequest("https://example.com"), {
      ...deps(),
      urlAllowed: async () => false,
    });
    expect(result).toMatchObject({
      ok: false,
      status: 400,
      error: "URL target is not allowed",
    });
  });

  it("rate-limits with 429 and Retry-After", async () => {    const shared = deps();
    shared.rateLimiter = new RateLimiter(1, 60_000);
    const first = await handleShorten(
      postRequest("https://example.com/a"),
      shared,
    );
    expect(first.ok).toBe(true);
    const second = await handleShorten(
      postRequest("https://example.com/b"),
      shared,
    );
    expect(second).toMatchObject({ ok: false, status: 429 });
    if (!second.ok) {
      expect(second.headers?.["Retry-After"]).toBeDefined();
    }
  });

  it("fails fast with 500 when PUBLIC_URL is missing", async () => {
    delete process.env.PUBLIC_URL;
    const result = await handleShorten(
      postRequest("https://example.com/a"),
      deps(),
    );
    expect(result).toMatchObject({ ok: false, status: 500 });
  });
});
