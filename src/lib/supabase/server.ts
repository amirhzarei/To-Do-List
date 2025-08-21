import { cookies, headers } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export function getServerSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase env vars missing (server).");
    }
    return null as any;
  }
  return createServerClient(url, anon, { cookies: cookies() });
}
