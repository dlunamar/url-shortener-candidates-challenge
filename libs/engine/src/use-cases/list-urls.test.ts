import { describe, expect, it } from "vitest";
import { listUrls } from "./list-urls";
import { shortenUrl } from "./shorten-url";
import { InMemoryUrlRepository } from "../infra/in-memory-url-repository";

describe("listUrls", () => {
  it("returns every stored URL", async () => {
    const repo = new InMemoryUrlRepository();
    expect(await listUrls({ repo })).toEqual([]);

    await shortenUrl(
      { url: "https://example.com/a" },
      { repo, generateCode: () => "AAAAAAA" },
    );
    await shortenUrl(
      { url: "https://example.com/b" },
      { repo, generateCode: () => "BBBBBBB" },
    );

    const urls = await listUrls({ repo });
    expect(urls).toHaveLength(2);
    expect(urls.map((u) => u.code).sort()).toEqual(["AAAAAAA", "BBBBBBB"]);
  });
});
