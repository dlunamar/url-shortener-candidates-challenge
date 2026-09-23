import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UrlListItem, type UrlListEntry } from "./url-list-item";

export function UrlList({
  urls,
  baseUrl,
}: {
  urls: UrlListEntry[];
  baseUrl: string;
}) {
  return (
    <Card aria-label="Shortened URLs">
      <CardHeader>
        <CardTitle>Shortened URLs</CardTitle>
      </CardHeader>
      <CardContent className="px-0">
        {urls.length === 0 ? (
          <p className="px-6 text-sm text-zinc-500">
            No shortened URLs yet — create your first one above.
          </p>
        ) : (
          <ul>
            {urls.map((entry) => (
              <UrlListItem key={entry.code} entry={entry} baseUrl={baseUrl} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
