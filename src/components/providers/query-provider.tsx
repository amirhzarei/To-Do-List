'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState, useEffect } from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { persistQueryClient } from '@tanstack/react-query-persist-client';
import localforage from 'localforage';
import type { PersistedClient } from '@tanstack/react-query-persist-client';

const ONE_HOUR = 1000 * 60 * 60;

export function QueryProvider({ children }: { children: ReactNode }) {
    const [client] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        staleTime: 30_000,
                        gcTime: 5 * 60 * 1000,
                        retry: 1,
                        refetchOnWindowFocus: false
                    }
                }
            })
    );

    const [ready, setReady] = useState(false);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            localforage.config({
                name: 'taskflow-cache',
                storeName: 'react-query'
            });

            const persister = {
                persistClient: async (c: PersistedClient) => {
                    await localforage.setItem('rq-cache', c);
                },
                restoreClient: async () => {
                    const cached = await localforage.getItem<PersistedClient>('rq-cache');
                    return cached === null ? undefined : cached;
                },
                removeClient: async () => {
                    await localforage.removeItem('rq-cache');
                }
            };

            persistQueryClient({
                queryClient: client,
                persister,
                maxAge: ONE_HOUR
            });

            if (!cancelled) setReady(true);
        })();
        return () => {
            cancelled = true;
        };
    }, [client]);

    if (!ready) {
        return null; // or a small loader
    }

    return (
        <QueryClientProvider client={client}>
            {children}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}