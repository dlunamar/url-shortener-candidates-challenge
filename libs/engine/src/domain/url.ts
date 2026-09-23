export interface ShortenedUrl {
  readonly code: string;
  readonly originalUrl: string;
  readonly clicks: number;
  readonly createdAt: Date;
}

export function createShortenedUrl(input: {
  code: string;
  originalUrl: string;
}): ShortenedUrl {
  return {
    code: input.code,
    originalUrl: input.originalUrl,
    clicks: 0,
    createdAt: new Date(),
  };
}
