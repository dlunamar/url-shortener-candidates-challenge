import { describe, expect, it } from "vitest";
import { InMemoryUrlRepository, shortenUrl } from "@url-shortener/engine";
import { handleResolve } from "./resolve.server";

async function seededRepo() {
  const repo = new InMemoryUrlRepository();
  await shortenUrl(
    { url: "https://example.com/article" },
    { repo, generateCode: () => "aB3dE9x" },
  );
  return repo;
}

describe("handleResolve", () => {
  it("resolves the original URL", async () => {
    const result = await handleResolve("aB3dE9x", await seededRepo());
    expect(result).toEqual({
      ok: true,
      url: "https://example.com/article",
    });
  });

  it("reports 404 for an unknown code", async () => {
    const result = await handleResolve("bB3dE9x", await seededRepo());
    expect(result).toMatchObject({ ok: false, status: 404 });
  });

  it("reports 400 for a malformed code", async () => {
    const result = await handleResolve("!!", await seededRepo());
    expect(result).toMatchObject({ ok: false, status: 400 });
  });
});
