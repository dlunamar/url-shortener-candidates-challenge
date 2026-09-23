import {
  PrismaUrlRepository,
  prisma,
  type UrlRepository,
} from "@url-shortener/engine";

let shared: UrlRepository | undefined;

/**
 * Production repository singleton. Lazily built so importing this module
 * never opens a database connection (tests inject their own repository).
 */
export function getUrlRepository(): UrlRepository {
  shared ??= new PrismaUrlRepository(prisma);
  return shared;
}
