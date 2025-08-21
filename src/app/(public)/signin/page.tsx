'use client';

import { FormEvent, useState } from 'react';
import { supabaseEmailPasswordSignIn } from '@/lib/auth/bridge';
import Link from 'next/link';

export default function SignInPage() {
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        setLoading(true);
        try {
            await supabaseEmailPasswordSignIn(email, password);
        } catch (err: any) {
            setError(err.message || 'Sign in failed');
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center p-6">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-4 border rounded-lg p-6 shadow-sm"
            >
                <h1 className="text-xl font-semibold">Sign In</h1>
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Email</label>
                    <input
                        name="email"
                        type="email"
                        required
                        className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring focus:ring-brand/40"
                        placeholder="you@example.com"
                    />
                </div>
                <div className="space-y-2">
                    <label className="block text-sm font-medium">Password</label>
                    <input
                        name="password"
                        type="password"
                        required
                        className="w-full rounded border px-3 py-2 text-sm outline-none focus:ring focus:ring-brand/40"
                        placeholder="••••••••"
                    />
                </div>
                {error && <p className="text-sm text-red-600">{error}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-brand text-brand-foreground py-2 text-sm font-medium hover:opacity-90 disabled:opacity-50"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>

                <p className="text-xs text-neutral-500">
                    Don&apos;t have an account? (Add a Sign Up flow later)
                </p>
                <Link href="/" className="text-xs text-brand underline">
                    Back to home
                </Link>
            </form>
        </div>
    );
}