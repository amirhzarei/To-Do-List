"use client";

import { createBrowserClient } from "@supabase/ssr";

export function getBrowserSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    if (process.env.NODE_ENV === "development") {
      console.warn("Supabase env vars missing (browser).");
    }
    return null as any;
  }
  return createBrowserClient(url, anon);
}
