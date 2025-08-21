'use client';

import { FormEvent, useState } from 'react';
import { supabaseSignUp } from '@/lib/auth/bridge';
import Link from 'next/link';

export default function SignUpPage() {
    const [status, setStatus] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function onSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setErr(null);
        setStatus(null);
        setLoading(true);
        const form = e.currentTarget;
        const email = (form.elements.namedItem('email') as HTMLInputElement).value;
        const password = (form.elements.namedItem('password') as HTMLInputElement).value;
        try {
            const res = await supabaseSignUp(email, password);
            if (res.needsVerification) {
                setStatus('Check your email to confirm.');
            } else {
                setStatus('Signed in!');
            }
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-dvh flex items-center justify-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-sm space-y-4 border rounded-lg p-6">
                <h1 className="text-xl font-semibold">Create Account</h1>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <input name="email" type="email" required className="w-full rounded border px-3 py-2 text-sm" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium">Password</label>
                    <input name="password" type="password" required className="w-full rounded border px-3 py-2 text-sm" />
                </div>
                {err && <p className="text-sm text-red-600">{err}</p>}
                {status && <p className="text-sm text-green-600">{status}</p>}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded bg-brand text-brand-foreground py-2 text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Creating...' : 'Sign Up'}
                </button>
                <p className="text-xs text-neutral-500">
                    Already have an account? <Link href="/signin" className="text-brand underline">Sign In</Link>
                </p>
            </form>
        </div>
    );
}