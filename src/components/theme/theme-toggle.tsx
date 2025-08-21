'use client';

import { Moon, Sun } from 'lucide-react';

export function ThemeToggle({
    theme,
    setTheme
}: {
    theme: 'light' | 'dark';
    setTheme: (t: 'light' | 'dark') => void;
}) {
    return (
        <button
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            aria-label="Toggle theme"
            className="fixed bottom-4 left-4  rounded-full border bg-white dark:bg-neutral-800 dark:border-neutral-700 shadow hover:shadow-md transition p-3"
        >
            {theme === 'light' ? (
                <Moon size={18} className="text-neutral-700" />
            ) : (
                <Sun size={18} className="text-yellow-300" />
            )}
        </button>
    );
}