import {
  InvalidCodeError,
  UrlNotFoundError,
  resolveUrl,
  type UrlRepository,
} from "@url-shortener/engine";
import { getUrlRepository } from "./repository.server";

export type ResolveResult =
  | { ok: true; url: string }
  | { ok: false; status: 400 | 404; message: string };

/**
 * Framework-agnostic resolve flow. The React Router `loader` maps success
 * to `redirect()` and failure to a thrown `Response` with the status.
 */
export async function handleResolve(
  code: string,
  repo: UrlRepository = getUrlRepository(),
): Promise<ResolveResult> {
  try {
    const url = await resolveUrl(code, { repo });
    return { ok: true, url: url.originalUrl };
  } catch (error) {
    if (error instanceof InvalidCodeError) {
      return { ok: false, status: 400, message: error.message };
    }
    if (error instanceof UrlNotFoundError) {
      return { ok: false, status: 404, message: "Not Found" };
    }
    throw error;
  }
}
