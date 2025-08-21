'use client';

import { useSession } from 'next-auth/react';
import { supabaseSignOut } from '@/lib/auth/bridge';

export function UserMenu() {
    const { data: session, status } = useSession();

    if (status === 'loading') return <span className="text-xs text-neutral-400">...</span>;

    if (!session?.user) {
        return (
            <a
                href="/signin"
                className="text-sm text-brand hover:underline"
            >
                Sign In
            </a>
        );
    }

    return (
        <div className="flex items-center gap-3">
            <span className="text-sm text-neutral-600 dark:text-neutral-300">
                {session.user.email || 'User'}
            </span>
            <button
                onClick={() => supabaseSignOut()}
                className="text-xs rounded border px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
                Sign Out
            </button>
        </div>
    );
}