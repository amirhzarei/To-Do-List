'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getServerSupabase } from '@/lib/supabase/server';

const Schema = z.object({
  list_id: z.string().uuid(),
  ordered_ids: z.array(z.string().uuid()).min(1),
  creator_id: z.string().uuid(),
  title: z.string().min(2).max(100),
  status: z.enum(['todo', 'in_progress', 'done']),
});

export async function reorderTasksAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = Schema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };

  const { list_id, ordered_ids, creator_id, title, status } = parsed.data;

  const supabase = await getServerSupabase();
  // Fetch existing to ensure all belong to list & visible
  const { data: tasks, error: fetchErr } = await supabase
    .from('task')
    .select('id')
    .eq('list_id', list_id);
  if (fetchErr) return { error: 'DB_ERROR', detail: fetchErr.message };

  const existingIds = new Set(tasks?.map((t: any) => t.id) || []);
  for (const id of ordered_ids) {
    if (!existingIds.has(id)) {
      return { error: 'INVALID_IDS', detail: `Task ${id} not in list` };
    }
  }

  // ✅ FIX: Include list_id in the upsert
  const updates = ordered_ids.map((id, idx) => ({
    id,
    list_id, // ✅ Add this line!
    creator_id, // Ensure creator_id is set for ownership
    title,
    status,
    position: (idx + 1) * 1000,
  }));

  const { error: upErr } = await supabase
    .from('task')
    .upsert(updates, { onConflict: 'id' });
  if (upErr) return { error: 'DB_ERROR', detail: upErr.message };

  return { data: true };
}
