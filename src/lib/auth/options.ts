import type { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { z } from 'zod';

const SupabaseSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  expires_at: z.number().optional(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable().optional(),
  }),
});

function parseSupabaseJson(raw: string) {
  try {
    return { parsed: SupabaseSessionSchema.parse(JSON.parse(raw)), error: null as any };
  } catch (e) {
    return { parsed: null, error: e };
  }
}

const ENABLE_REMOTE_VALIDATION = false; // <-- set to false for now

async function fetchSupabaseUser(accessToken: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) throw new Error('Supabase env missing');
  const resp = await fetch(`${url}/auth/v1/user`, {
    headers: { Authorization: `Bearer ${accessToken}`, apikey: anon },
    cache: 'no-store',
  });
  if (!resp.ok) throw new Error(`User fetch failed ${resp.status} ${await resp.text()}`);
  return resp.json();
}

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt' },
  providers: [
    CredentialsProvider({
      name: 'supabase-bridge',
      credentials: {
        supabase_json: { label: 'Supabase Session JSON', type: 'text' },
      },
      async authorize(credentials) {
        console.log('[AUTH DEBUG] authorize start');
        if (!credentials?.supabase_json) {
          console.warn('[AUTH WARN] No supabase_json');
          return null;
        }
        const { parsed, error } = parseSupabaseJson(credentials.supabase_json);
        if (error || !parsed) {
          console.error('[AUTH ERROR] parse', error);
          return null;
        }
        if (!parsed.access_token) {
          console.error('[AUTH ERROR] missing access_token');
          return null;
        }

        if (ENABLE_REMOTE_VALIDATION) {
          try {
            const userResp = await fetchSupabaseUser(parsed.access_token);
            const supaUser = userResp?.user;
            if (!supaUser || supaUser.id !== parsed.user.id) {
              console.warn('[AUTH WARN] mismatch user id');
              return null;
            }
          } catch (e) {
            console.error('[AUTH ERROR] validation fetch', e);
            return null;
          }
        } else {
          console.log('[AUTH DEBUG] TRUST MODE (no remote validation)');
        }

        return {
          id: parsed.user.id,
          email: parsed.user.email || undefined,
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
          expires_at: parsed.expires_at,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        (token as any).access_token = (user as any).access_token;
        (token as any).refresh_token = (user as any).refresh_token;
        (token as any).expires_at = (user as any).expires_at;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      (session as any).supabaseAccessToken = (token as any).access_token;
      return session;
    },
  },
  pages: { signIn: '/signin' },
  logger: {
    error(code, meta) {
      console.error('[NEXTAUTH ERROR]', code, meta);
    },
    warn(code: any, ...meta: any[]) {
      console.warn('[NEXTAUTH WARN]', code, ...meta);
    },
    debug(code, meta) {
      console.debug('[NEXTAUTH DEBUG]', code, meta);
    },
  },
};
