import { data, useActionData, useLoaderData } from "react-router";
import type { Route } from "./+types/_index";
import { listUrls } from "@url-shortener/engine";
import { handleShorten } from "~/lib/shorten.server";
import { getUrlRepository } from "~/lib/repository.server";
import { getBaseUrl } from "~/lib/base-url";
import { ShortenForm } from "~/components/shorten-form";
import { UrlList } from "~/components/url-list";

export async function loader() {
  const urls = await listUrls({ repo: getUrlRepository() });
  return {
    baseUrl: `${getBaseUrl()}/s/`,
    urls: urls.map((url) => ({
      ...url,
      createdAt: url.createdAt.toISOString(),
    })),
  };
}

export async function action({ request }: Route.ActionArgs) {
  const result = await handleShorten(request);
  if (result.ok) {
    return data({ shortenedUrl: result.shortenedUrl });
  }
  return data(
    { error: result.error },
    { status: result.status, headers: result.headers },
  );
}

export function headers() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}

export function meta({}: Route.MetaArgs) {
  return [
    { title: "URL Shortener" },
    { name: "description", content: "Shorten your URLs quickly and easily" },
  ];
}

export default function Index() {
  const { baseUrl, urls } = useLoaderData<typeof loader>();
  const actionData = useActionData<typeof action>();

  return (
    <main className="min-h-screen bg-zinc-50">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-4 py-12">
        <h1 className="text-center text-3xl font-bold tracking-tight">
          URL Shortener
        </h1>
        <ShortenForm actionData={actionData} />
        <UrlList urls={urls} baseUrl={baseUrl} />
      </div>
    </main>
  );
}
