export type { ShortenedUrl } from "./domain/url";
export { createShortenedUrl } from "./domain/url";
export type { UrlRepository } from "./domain/url-repository";
export {
  InvalidUrlError,
  InvalidCodeError,
  UrlNotFoundError,
  CodeCollisionError,
} from "./domain/errors";

export {
  BASE62_ALPHABET,
  CODE_LENGTH,
  createCodeGenerator,
  generateCode,
  type CodeGenerator,
} from "./code-generator";

export {
  MAX_URL_LENGTH,
  ShortenInputSchema,
  ShortCodeSchema,
  type ShortenInput,
  type ShortCode,
} from "./schemas";

export {
  MAX_GENERATION_ATTEMPTS,
  shortenUrl,
  type ShortenUrlDeps,
} from "./use-cases/shorten-url";
export { resolveUrl, type ResolveUrlDeps } from "./use-cases/resolve-url";
export { listUrls, type ListUrlsDeps } from "./use-cases/list-urls";

export { InMemoryUrlRepository } from "./infra/in-memory-url-repository";
export { PrismaUrlRepository } from "./infra/prisma-url-repository";
export { prisma } from "./infra/prisma-client";
