import type { ShortenedUrl } from "./url";

/**
 * Persistence port. The domain only knows this interface; infrastructure
 * (in-memory for tests, Prisma + SQLite in production) implements it.
 */
export interface UrlRepository {
  save(url: ShortenedUrl): Promise<ShortenedUrl>;
  findByCode(code: string): Promise<ShortenedUrl | null>;
  exists(code: string): Promise<boolean>;
  /**
   * Atomically increments the click counter and returns the updated
   * entity, or null when the code does not exist.
   */
  incrementClicks(code: string): Promise<ShortenedUrl | null>;
  findAll(): Promise<ShortenedUrl[]>;
}
