import './globals.css';
import { ReactNode } from 'react';
import { Metadata } from 'next';
import { ThemeProvider } from '@/components/theme/theme-provider';
import { QueryProvider } from '@/components/providers/query-provider';
import { AuthSessionProvider } from '@/components/providers/auth-session-provider';
import { UserMenu } from '@/components/auth/user-menu';

export const metadata: Metadata = {
  title: 'TaskFlow',
  description: 'Modern real-time, offline-first task manager.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <AuthSessionProvider>
            <QueryProvider>
              <div className="min-h-dvh flex flex-col">
                <header className="border-b px-4 py-2 flex items-center gap-4">
                  <span className="font-semibold text-lg">TaskFlow</span>
                  <div className="ml-auto" />
                  <UserMenu />
                </header>
                <main className="flex-1 p-4">{children}</main>
                <footer className="border-t px-4 py-2 text-xs text-neutral-500">
                  © {new Date().getFullYear()} TaskFlow
                </footer>
              </div>
            </QueryProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}