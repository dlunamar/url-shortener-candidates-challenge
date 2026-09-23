import { describe, expect, it } from "vitest";
import { InMemoryUrlRepository } from "./in-memory-url-repository";
import { createShortenedUrl } from "../domain/url";

describe("InMemoryUrlRepository", () => {
  it("saves, finds and checks existence", async () => {
    const repo = new InMemoryUrlRepository();
    const url = createShortenedUrl({
      code: "aB3dE9x",
      originalUrl: "https://example.com",
    });
    expect(await repo.findByCode("aB3dE9x")).toBeNull();
    expect(await repo.exists("aB3dE9x")).toBe(false);

    await repo.save(url);
    expect(await repo.findByCode("aB3dE9x")).toEqual(url);
    expect(await repo.exists("aB3dE9x")).toBe(true);
  });

  it("increments clicks and returns null for unknown codes", async () => {
    const repo = new InMemoryUrlRepository();
    expect(await repo.incrementClicks("missing")).toBeNull();

    await repo.save(
      createShortenedUrl({
        code: "aB3dE9x",
        originalUrl: "https://example.com",
      }),
    );
    expect((await repo.incrementClicks("aB3dE9x"))?.clicks).toBe(1);
    expect((await repo.incrementClicks("aB3dE9x"))?.clicks).toBe(2);
  });

  it("lists everything stored", async () => {
    const repo = new InMemoryUrlRepository();
    await repo.save(
      createShortenedUrl({ code: "AAAAAAA", originalUrl: "https://a.test" }),
    );
    await repo.save(
      createShortenedUrl({ code: "BBBBBBB", originalUrl: "https://b.test" }),
    );
    expect((await repo.findAll()).map((u) => u.code).sort()).toEqual([
      "AAAAAAA",
      "BBBBBBB",
    ]);
  });
});
