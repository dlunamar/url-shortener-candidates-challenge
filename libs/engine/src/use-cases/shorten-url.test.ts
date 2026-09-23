import { describe, expect, it } from "vitest";
import { shortenUrl } from "./shorten-url";
import { InMemoryUrlRepository } from "../infra/in-memory-url-repository";
import { createShortenedUrl } from "../domain/url";
import { CodeCollisionError, InvalidUrlError } from "../domain/errors";

function sequentialGenerator(codes: string[]) {
  let i = 0;
  return () => codes[i++ % codes.length]!;
}

describe("shortenUrl", () => {
  it("creates a shortened URL with zero clicks", async () => {
    const repo = new InMemoryUrlRepository();
    const result = await shortenUrl(
      { url: "https://example.com/article" },
      { repo, generateCode: () => "aB3dE9x" },
    );
    expect(result.code).toBe("aB3dE9x");
    expect(result.originalUrl).toBe("https://example.com/article");
    expect(result.clicks).toBe(0);
    expect(result.createdAt).toBeInstanceOf(Date);
    expect(await repo.findByCode("aB3dE9x")).toEqual(result);
  });

  it("retries when the generated code already exists", async () => {
    const repo = new InMemoryUrlRepository();
    await repo.save(
      createShortenedUrl({
        code: "AAAAAAA",
        originalUrl: "https://example.com/taken",
      }),
    );
    const result = await shortenUrl(
      { url: "https://example.com/new" },
      { repo, generateCode: sequentialGenerator(["AAAAAAA", "BBBBBBB"]) },
    );
    expect(result.code).toBe("BBBBBBB");
  });

  it("throws CodeCollisionError when every attempt collides", async () => {
    const repo = new InMemoryUrlRepository();
    await repo.save(
      createShortenedUrl({
        code: "AAAAAAA",
        originalUrl: "https://example.com/taken",
      }),
    );
    await expect(
      shortenUrl(
        { url: "https://example.com/new" },
        { repo, generateCode: () => "AAAAAAA", maxAttempts: 3 },
      ),
    ).rejects.toBeInstanceOf(CodeCollisionError);
  });

  it("throws InvalidUrlError for invalid input", async () => {
    const repo = new InMemoryUrlRepository();
    await expect(
      shortenUrl(
        { url: "javascript:alert(1)" },
        { repo, generateCode: () => "aB3dE9x" },
      ),
    ).rejects.toBeInstanceOf(InvalidUrlError);
    await expect(
      shortenUrl({ url: "" }, { repo, generateCode: () => "aB3dE9x" }),
    ).rejects.toBeInstanceOf(InvalidUrlError);
  });
});
