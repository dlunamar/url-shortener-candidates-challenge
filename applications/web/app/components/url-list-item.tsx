export interface UrlListEntry {
  code: string;
  originalUrl: string;
  clicks: number;
  createdAt: string;
}

export function UrlListItem({
  entry,
  baseUrl,
}: {
  entry: UrlListEntry;
  baseUrl: string;
}) {
  const shortUrl = `${baseUrl}${entry.code}`;
  return (
    <li className="flex flex-col gap-1 border-b border-zinc-100 px-4 py-3 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <a
          href={shortUrl}
          className="block truncate font-mono text-sm font-medium text-zinc-900 underline"
          title={shortUrl}
        >
          {shortUrl}
        </a>
        <p className="truncate text-sm text-zinc-500" title={entry.originalUrl}>
          {entry.originalUrl}
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-3 text-sm text-zinc-500">
        <span
          aria-label={`${entry.clicks} ${entry.clicks === 1 ? "click" : "clicks"}`}
          className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-700"
        >
          {entry.clicks} {entry.clicks === 1 ? "click" : "clicks"}
        </span>
        <time dateTime={entry.createdAt}>
          {new Date(entry.createdAt).toLocaleDateString()}
        </time>
      </div>
    </li>
  );
}
