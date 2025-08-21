'use client';

import { useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';

export function useRealtimeTasks(listId: string | null) {
  useEffect(() => {
    if (!listId) return;
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const channel = supabase
      .channel(`tasks:${listId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'task', filter: `list_id=eq.${listId}` },
        (payload: any) => {
          // Later: dispatch to React Query cache (invalidate or patch)
          console.log('Realtime change', payload);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [listId]);
}
