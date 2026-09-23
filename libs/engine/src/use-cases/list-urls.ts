import type { ShortenedUrl } from "../domain/url";
import type { UrlRepository } from "../domain/url-repository";

export interface ListUrlsDeps {
  repo: UrlRepository;
}

export function listUrls(deps: ListUrlsDeps): Promise<ShortenedUrl[]> {
  return deps.repo.findAll();
}
