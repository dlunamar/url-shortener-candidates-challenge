import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { rmSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { PrismaClient } from "@prisma/client";
import { PrismaUrlRepository } from "./prisma-url-repository";
import { createShortenedUrl } from "../domain/url";
import { CodeCollisionError } from "../domain/errors";

const testDir = dirname(fileURLToPath(import.meta.url));
const schemaPath = join(testDir, "..", "..", "prisma", "schema.prisma");
const dbFileName = `.test-${process.pid}.db`;

const require = createRequire(import.meta.url);
const prismaBin = join(
  dirname(require.resolve("prisma/package.json")),
  "build",
  "index.js",
);

let client: PrismaClient;
let repo: PrismaUrlRepository;

beforeAll(() => {
  // Ephemeral database: relative sqlite paths resolve from the schema
  // directory, so this file lands in libs/engine/prisma/ and is removed
  // afterwards. Never touches dev.db.
  process.env.DATABASE_URL = `file:./${dbFileName}`;
  execFileSync(
    process.execPath,
    [prismaBin, "db", "push", "--schema", schemaPath],
    { stdio: "pipe" },
  );
  client = new PrismaClient();
  repo = new PrismaUrlRepository(client);
}, 60000);

afterAll(async () => {
  await client.$disconnect();
  for (const suffix of ["", "-journal"]) {
    rmSync(join(testDir, "..", "..", "prisma", `${dbFileName}${suffix}`), {
      force: true,
    });
  }
});

describe("PrismaUrlRepository", () => {
  it("saves and finds a URL by code", async () => {
    const saved = await repo.save(
      createShortenedUrl({
        code: "aB3dE9x",
        originalUrl: "https://example.com/article",
      }),
    );
    expect(saved.code).toBe("aB3dE9x");
    expect(saved.clicks).toBe(0);

    const found = await repo.findByCode("aB3dE9x");
    expect(found?.originalUrl).toBe("https://example.com/article");
    expect(found?.clicks).toBe(0);
    expect(found?.createdAt).toBeInstanceOf(Date);

    expect(await repo.findByCode("missing")).toBeNull();
    expect(await repo.exists("aB3dE9x")).toBe(true);
    expect(await repo.exists("missing")).toBe(false);
  });

  it("maps duplicate codes to CodeCollisionError", async () => {
    await repo.save(
      createShortenedUrl({
        code: "DUP0001",
        originalUrl: "https://example.com/first",
      }),
    );
    await expect(
      repo.save(
        createShortenedUrl({
          code: "DUP0001",
          originalUrl: "https://example.com/second",
        }),
      ),
    ).rejects.toBeInstanceOf(CodeCollisionError);
  });

  it("increments clicks atomically", async () => {
    expect(await repo.incrementClicks("nope000")).toBeNull();

    await repo.save(
      createShortenedUrl({
        code: "CLK0001",
        originalUrl: "https://example.com/clicked",
      }),
    );
    expect((await repo.incrementClicks("CLK0001"))?.clicks).toBe(1);
    expect((await repo.incrementClicks("CLK0001"))?.clicks).toBe(2);
  });

  it("lists every stored URL", async () => {
    const urls = await repo.findAll();
    const codes = urls.map((u) => u.code);
    expect(codes).toContain("aB3dE9x");
    expect(codes).toContain("DUP0001");
    expect(codes).toContain("CLK0001");
  });
});
