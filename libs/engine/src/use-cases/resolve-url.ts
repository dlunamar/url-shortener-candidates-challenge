import type { ShortenedUrl } from "../domain/url";
import type { UrlRepository } from "../domain/url-repository";
import { InvalidCodeError, UrlNotFoundError } from "../domain/errors";
import { ShortCodeSchema } from "../schemas";

export interface ResolveUrlDeps {
  repo: UrlRepository;
}

export async function resolveUrl(
  code: string,
  deps: ResolveUrlDeps,
): Promise<ShortenedUrl> {
  const parsed = ShortCodeSchema.safeParse(code);
  if (!parsed.success) {
    throw new InvalidCodeError(
      parsed.error.issues[0]?.message ?? "Invalid short code",
    );
  }

  const updated = await deps.repo.incrementClicks(parsed.data);
  if (!updated) {
    throw new UrlNotFoundError(`No URL found for code "${parsed.data}"`);
  }
  return updated;
}
