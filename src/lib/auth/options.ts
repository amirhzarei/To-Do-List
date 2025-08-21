import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { z } from "zod";
import { getServerSupabase } from "@/lib/supabase/server";

// Extend NextAuth session type to include 'id' on user
declare module "next-auth" {
  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
    supabaseAccessToken?: string;
  }
}

/**
 * We treat Supabase Auth as the source of truth.
 * The credentials provider here simply trusts a pre-validated
 * Supabase access token passed from the client after a Supabase sign-in.
 *
 * Security note:
 * We verify the token by calling getUser() via a server Supabase client
 * created with the provided access token (impersonating).
 */
const SupabaseSessionSchema = z.object({
  access_token: z.string(),
  refresh_token: z.string().optional(),
  user: z.object({
    id: z.string().uuid(),
    email: z.string().email().nullable().optional(),
  }),
});

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    CredentialsProvider({
      // name shows up on default NextAuth sign-in form (we won't use that form).
      name: "supabase-bridge",
      credentials: {
        supabase_json: { label: "Supabase Session JSON", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.supabase_json) return null;
        let parsed;
        try {
          parsed = SupabaseSessionSchema.parse(
            JSON.parse(credentials.supabase_json),
          );
        } catch {
          return null;
        }

        // Validate access token actually works (defense-in-depth)
        const serverClient = getServerSupabase();
        if (!serverClient) return null;

        // We create a temporary supabase client impersonating user token.
        // Using @supabase/ssr createServerClient again with custom headers.
        // Simpler: call auth.getUser() with admin service role & the token.
        const { data: userData } = await serverClient.auth.getUser(
          parsed.access_token,
        );
        if (!userData?.user || userData.user.id !== parsed.user.id) {
          return null;
        }

        return {
          id: parsed.user.id,
          // NextAuth reserved fields
          email: parsed.user.email || undefined,
          // Custom tokens saved into JWT in callbacks
          access_token: parsed.access_token,
          refresh_token: parsed.refresh_token,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // On initial sign in
      if (user) {
        token.sub = user.id;
        (token as any).access_token = (user as any).access_token;
        (token as any).refresh_token = (user as any).refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      (session as any).supabaseAccessToken = (token as any).access_token;
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
};
