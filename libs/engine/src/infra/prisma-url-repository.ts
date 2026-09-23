import { Prisma, type PrismaClient } from "@prisma/client";
import type { ShortenedUrl } from "../domain/url";
import type { UrlRepository } from "../domain/url-repository";
import { CodeCollisionError } from "../domain/errors";
import { prisma as sharedPrisma } from "./prisma-client";

type ShortUrlRow = {
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: Date;
};

function toDomain(row: ShortUrlRow): ShortenedUrl {
  return {
    code: row.code,
    originalUrl: row.originalUrl,
    clicks: row.clicks,
    createdAt: row.createdAt,
  };
}

/**
 * Prisma + SQLite implementation of the UrlRepository port.
 * The domain never sees Prisma types: rows are mapped at the boundary.
 */
export class PrismaUrlRepository implements UrlRepository {
  constructor(private readonly client: PrismaClient = sharedPrisma) {}

  async save(url: ShortenedUrl): Promise<ShortenedUrl> {
    try {
      const row = await this.client.shortUrl.create({
        data: {
          code: url.code,
          originalUrl: url.originalUrl,
          clicks: url.clicks,
          createdAt: url.createdAt,
        },
      });
      return toDomain(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        throw new CodeCollisionError(
          `Short code "${url.code}" already exists`,
        );
      }
      throw error;
    }
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    const row = await this.client.shortUrl.findUnique({ where: { code } });
    return row ? toDomain(row) : null;
  }

  async exists(code: string): Promise<boolean> {
    const row = await this.client.shortUrl.findUnique({
      where: { code },
      select: { code: true },
    });
    return row !== null;
  }

  async incrementClicks(code: string): Promise<ShortenedUrl | null> {
    try {
      const row = await this.client.shortUrl.update({
        where: { code },
        data: { clicks: { increment: 1 } },
      });
      return toDomain(row);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2025"
      ) {
        return null;
      }
      throw error;
    }
  }

  async findAll(): Promise<ShortenedUrl[]> {
    const rows = await this.client.shortUrl.findMany({
      orderBy: { createdAt: "desc" },
    });
    return rows.map(toDomain);
  }
}
