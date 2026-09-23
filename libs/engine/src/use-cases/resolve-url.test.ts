import { describe, expect, it } from "vitest";
import { resolveUrl } from "./resolve-url";
import { shortenUrl } from "./shorten-url";
import { InMemoryUrlRepository } from "../infra/in-memory-url-repository";
import { InvalidCodeError, UrlNotFoundError } from "../domain/errors";

describe("resolveUrl", () => {
  it("resolves the original URL and counts the click", async () => {
    const repo = new InMemoryUrlRepository();
    await shortenUrl(
      { url: "https://example.com/article" },
      { repo, generateCode: () => "aB3dE9x" },
    );

    const first = await resolveUrl("aB3dE9x", { repo });
    expect(first.originalUrl).toBe("https://example.com/article");
    expect(first.clicks).toBe(1);

    const second = await resolveUrl("aB3dE9x", { repo });
    expect(second.clicks).toBe(2);
  });

  it("throws UrlNotFoundError for an unknown code", async () => {
    const repo = new InMemoryUrlRepository();
    await expect(resolveUrl("aB3dE9x", { repo })).rejects.toBeInstanceOf(
      UrlNotFoundError,
    );
  });

  it("throws InvalidCodeError for a malformed code", async () => {
    const repo = new InMemoryUrlRepository();
    await expect(resolveUrl("!!", { repo })).rejects.toBeInstanceOf(
      InvalidCodeError,
    );
    await expect(resolveUrl("", { repo })).rejects.toBeInstanceOf(
      InvalidCodeError,
    );
  });
});
