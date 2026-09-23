import { redirect } from "react-router";
import type { Route } from "./+types/s.$code";
import { handleResolve } from "~/lib/resolve.server";

export async function loader({ params }: Route.LoaderArgs) {
  const result = await handleResolve(params.code);
  if (!result.ok) {
    throw new Response(result.message, { status: result.status });
  }
  return redirect(result.url);
}

export function headers() {
  return {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
  };
}
