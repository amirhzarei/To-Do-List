import { cookies, headers } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { authOptions } from '@/lib/auth/options';
import { getServerSession } from 'next-auth';

export async function getServerSupabase(authenticated = true) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.warn('Supabase env vars missing.');
    return null as any;
  }

  // Base client (cookie mode) – retains Supabase auth cookies if they exist.
  const base = createServerClient(url, anon, { cookies: cookies() });

  if (!authenticated) return base;

  // Pull NextAuth session for access token bridging (Mode A)
  const session = await getServerSession(authOptions);
  const access = (session as any)?.supabaseAccessToken;
  if (!access) return base; // returns possibly anon cookie-based client

  // Create a separate client instance and set the access token using the auth method.
  const authClient = createServerClient(url, anon, {
    cookies: cookies(),
  });

  await authClient.auth.setSession({ access_token: access, refresh_token: '' });

  return authClient;
}
