'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';

const links = [
    { href: '/lists', label: 'Lists' }
];

export function NavLinks() {
    const pathname = usePathname();
    return (
        <nav className="flex items-center gap-4">
            {links.map(l => (
                <Link
                    key={l.href}
                    href={l.href}
                    className={clsx(
                        'text-sm',
                        pathname.startsWith(l.href)
                            ? 'text-brand font-medium'
                            : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-200'
                    )}
                >
                    {l.label}
                </Link>
            ))}
        </nav>
    );
}