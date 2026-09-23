import { useState } from "react";
import { Form, useNavigation } from "react-router";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

export type ShortenActionData =
  | { shortenedUrl: string }
  | { error: string }
  | undefined;

export function ShortenForm({ actionData }: { actionData: ShortenActionData }) {
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [copied, setCopied] = useState(false);

  const hasError = actionData != null && "error" in actionData;
  const createdUrl =
    actionData != null && "shortenedUrl" in actionData
      ? actionData.shortenedUrl
      : null;

  async function copy(value: string) {
    if (typeof navigator === "undefined" || !navigator.clipboard) {
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Shorten a URL</CardTitle>
        <CardDescription>
          Paste a link below to generate a short, shareable URL.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form method="post" className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="url" className="text-sm font-medium">
              Destination URL
            </label>
            <Input
              id="url"
              name="url"
              type="url"
              placeholder="https://example.com/very/long/link"
              required
              autoComplete="off"
              aria-invalid={hasError}
              aria-describedby={hasError ? "shorten-error" : undefined}
            />
          </div>
          <Button type="submit" disabled={submitting} aria-busy={submitting}>
            {submitting ? "Shortening…" : "Shorten URL"}
          </Button>
        </Form>

        {hasError && (
          <p
            id="shorten-error"
            role="alert"
            className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {actionData.error}
          </p>
        )}

        {createdUrl && (
          <div className="mt-4 rounded-md bg-zinc-50 p-3">
            <p className="mb-1 text-sm font-medium">Your shortened URL</p>
            <div className="flex items-center gap-2">
              <a
                href={createdUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1 truncate font-mono text-sm text-zinc-900 underline"
              >
                {createdUrl}
              </a>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => copy(createdUrl)}
              >
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
