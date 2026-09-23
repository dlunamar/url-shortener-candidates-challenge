import { z } from "zod";
import { CODE_LENGTH } from "./code-generator";

export const MAX_URL_LENGTH = 2048;

const ALLOWED_PROTOCOLS: ReadonlySet<string> = new Set(["http:", "https:"]);

function isHttpUrl(value: string): boolean {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    return false;
  }
  return ALLOWED_PROTOCOLS.has(parsed.protocol);
}

export const ShortenInputSchema = z.object({
  url: z
    .string()
    .trim()
    .min(1, "URL is required")
    .max(MAX_URL_LENGTH, `URL must be at most ${MAX_URL_LENGTH} characters`)
    .refine(isHttpUrl, "URL must be a valid http(s) URL"),
});

export type ShortenInput = z.infer<typeof ShortenInputSchema>;

export const ShortCodeSchema = z
  .string()
  .regex(
    new RegExp(`^[A-Za-z0-9]{${CODE_LENGTH}}$`),
    `Short code must be ${CODE_LENGTH} base62 characters`,
  );

export type ShortCode = z.infer<typeof ShortCodeSchema>;
