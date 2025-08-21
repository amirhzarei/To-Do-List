'use client';

import { useEffect } from 'react';
import { getBrowserSupabase } from '@/lib/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

type TableName = 'task' | 'task_list' | 'task_tag';

export function useRealtimeTables(tables: TableName[]) {
  const qc = useQueryClient();

  useEffect(() => {
    const supabase = getBrowserSupabase();
    if (!supabase) return;
    const channels = tables.map((tbl) =>
      supabase
        .channel(`realtime:${tbl}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: tbl },
          (payload: any) => {
            if (tbl === 'task_list') {
              qc.setQueryData(['lists'], (old: any[] | undefined) => {
                if (!old) return old;
                if (payload.eventType === 'INSERT') return [payload.new, ...old];
                if (payload.eventType === 'UPDATE')
                  return old.map((l) => (l.id === payload.new.id ? payload.new : l));
                if (payload.eventType === 'DELETE')
                  return old.filter((l) => l.id !== payload.old.id);
                return old;
              });
            }
            if (tbl === 'task') {
              const listId = (payload.new?.list_id || payload.old?.list_id) as
                | string
                | undefined;
              if (!listId) return;
              qc.setQueryData(['tasks', listId], (old: any[] | undefined) => {
                if (!old) return old;
                if (payload.eventType === 'INSERT') return [payload.new, ...old];
                if (payload.eventType === 'UPDATE')
                  return old.map((t) => (t.id === payload.new.id ? payload.new : t));
                if (payload.eventType === 'DELETE')
                  return old.filter((t) => t.id !== payload.old.id);
                return old;
              });
            }
            if (tbl === 'task_tag') {
              qc.invalidateQueries({ queryKey: ['tags'] });
            }
          },
        )
        .subscribe(),
    );
    return () => {
      channels.forEach((ch) => {
        supabase.removeChannel(ch);
      });
    };
  }, [qc, tables]);
}
