/**
 * Validated base URL for building public short links.
 * Throws instead of composing "undefined/..." links (fail fast, 500).
 */
export function getBaseUrl(): string {
  const value = process.env.PUBLIC_URL?.trim();
  if (!value) {
    throw new Error("PUBLIC_URL is not configured");
  }
  return value.replace(/\/+$/, "");
}
