"use client";

import {
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from "next-auth/react";
import { getBrowserSupabase } from "@/lib/supabase/client";

export async function supabaseEmailPasswordSignIn(
  email: string,
  password: string,
) {
  const supabase = getBrowserSupabase();
  if (!supabase) throw new Error("Supabase client not ready");
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  const payload = {
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
    user: {
      id: data.user?.id,
      email: data.user?.email,
    },
  };
  await nextAuthSignIn("credentials", {
    supabase_json: JSON.stringify(payload),
    redirect: true,
    callbackUrl: "/",
  });
}

export async function supabaseSignOut() {
  const supabase = getBrowserSupabase();
  if (supabase) {
    await supabase.auth.signOut();
  }
  await nextAuthSignOut({ redirect: true, callbackUrl: "/signin" });
}
