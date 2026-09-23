import { createShortenedUrl, type ShortenedUrl } from "../domain/url";
import type { UrlRepository } from "../domain/url-repository";
import { CodeCollisionError, InvalidUrlError } from "../domain/errors";
import { generateCode, type CodeGenerator } from "../code-generator";
import { ShortenInputSchema } from "../schemas";

export const MAX_GENERATION_ATTEMPTS = 5;

export interface ShortenUrlDeps {
  repo: UrlRepository;
  generateCode?: CodeGenerator;
  maxAttempts?: number;
}

export async function shortenUrl(
  input: { url: string },
  deps: ShortenUrlDeps,
): Promise<ShortenedUrl> {
  const parsed = ShortenInputSchema.safeParse(input);
  if (!parsed.success) {
    throw new InvalidUrlError(parsed.error.issues[0]?.message ?? "Invalid URL");
  }

  const generate = deps.generateCode ?? generateCode;
  const maxAttempts = deps.maxAttempts ?? MAX_GENERATION_ATTEMPTS;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const code = generate();
    if (!(await deps.repo.exists(code))) {
      return deps.repo.save(
        createShortenedUrl({ code, originalUrl: parsed.data.url }),
      );
    }
  }

  throw new CodeCollisionError(
    `Could not generate a unique code after ${maxAttempts} attempts`,
  );
}
