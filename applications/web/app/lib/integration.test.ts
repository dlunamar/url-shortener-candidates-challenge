import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { InMemoryUrlRepository } from "@url-shortener/engine";
import { handleShorten } from "./shorten.server";
import { handleResolve } from "./resolve.server";
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

/**
 * Full create -> redirect flow through the real route handlers
 * (Request in, redirect target out), sharing one repository
 * like production.
 */
describe("create -> redirect integration", () => {
  it("shortens, redirects and counts the click", async () => {
    const repo = new InMemoryUrlRepository();
    const shared = {
      repo,
      rateLimiter: new RateLimiter(),
      urlAllowed: async () => true,
    };

    const form = new FormData();
    form.set("url", "https://example.com/full-flow");
    const created = await handleShorten(
      new Request("http://localhost/", {
        method: "POST",
        body: form,
        headers: { "x-forwarded-for": "7.7.7.7" },
      }),
      shared,
    );
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    const code = created.shortenedUrl.split("/s/")[1] ?? "";
    expect(code).toMatch(/^[A-Za-z0-9]{7}$/);

    const first = await handleResolve(code, repo);
    expect(first).toEqual({ ok: true, url: "https://example.com/full-flow" });
    expect((await repo.findByCode(code))?.clicks).toBe(1);

    await handleResolve(code, repo);
    expect((await repo.findByCode(code))?.clicks).toBe(2);
  });
});
