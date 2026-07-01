import { redirect } from "react-router";
import type { Route } from "./+types/auth.callback";
import { getSupabaseServerClient } from "~/utils/supabase.server";

export async function loader({ request }: Route.LoaderArgs) {
  const { supabase, headers } = getSupabaseServerClient(request);
  const url = new URL(request.url);
  const code = url.searchParams.get("code");

  if (code) {
    await supabase.auth.exchangeCodeForSession(code);
  }

  return redirect("/app/dashboard", { headers });
}