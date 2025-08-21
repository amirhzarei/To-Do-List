'use client';

import { ReactNode, useEffect, useState } from 'react';
import { ThemeToggle } from './theme-toggle';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [mounted, setMounted] = useState(false);
    const [theme, setTheme] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const stored = localStorage.getItem('theme');
        if (stored === 'dark') setTheme('dark');
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [theme, mounted]);

    if (!mounted) {
        return (
            <div className="opacity-0">
                {children}
            </div>
        );
    }

    return (
        <>
            <ThemeToggle theme={theme} setTheme={setTheme} />
            {children}
        </>
    );
}