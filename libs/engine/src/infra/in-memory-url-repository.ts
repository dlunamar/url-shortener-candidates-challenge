import type { ShortenedUrl } from "../domain/url";
import type { UrlRepository } from "../domain/url-repository";

/**
 * In-memory UrlRepository implementation. Intended for unit tests and
 * local development only — production uses Prisma + SQLite (Phase 2).
 */
export class InMemoryUrlRepository implements UrlRepository {
  private readonly store = new Map<string, ShortenedUrl>();

  async save(url: ShortenedUrl): Promise<ShortenedUrl> {
    this.store.set(url.code, url);
    return url;
  }

  async findByCode(code: string): Promise<ShortenedUrl | null> {
    return this.store.get(code) ?? null;
  }

  async exists(code: string): Promise<boolean> {
    return this.store.has(code);
  }

  async incrementClicks(code: string): Promise<ShortenedUrl | null> {
    const current = this.store.get(code);
    if (!current) {
      return null;
    }
    const updated: ShortenedUrl = { ...current, clicks: current.clicks + 1 };
    this.store.set(code, updated);
    return updated;
  }

  async findAll(): Promise<ShortenedUrl[]> {
    return [...this.store.values()];
  }
}
