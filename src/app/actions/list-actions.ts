'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { deleteList, insertList, listLists } from '@/domain/list/list-repo';

const CreateListSchema = z.object({
  title: z.string().min(1).max(120),
  color: z.string().max(32).nullable().optional(),
});

export async function fetchListsAction() {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    const data = await listLists();
    return { data };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function createListAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = CreateListSchema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };
  try {
    const list = await insertList({
      title: parsed.data.title,
      color: parsed.data.color ?? null,
      owner_id: user.id,
    });
    return { data: list };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function deleteListAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    await deleteList(id, user.id);
    return { data: true };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}
