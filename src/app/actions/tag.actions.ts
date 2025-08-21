'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import {
  listTags,
  insertTag,
  deleteTag,
  attachTag,
  detachTag,
} from '@/domain/tag/tag.repo';

const CreateTagSchema = z.object({
  name: z.string().min(1).max(40),
  color: z.string().max(32).nullable().optional(),
});

const AttachSchema = z.object({
  task_id: z.string().uuid(),
  tag_id: z.string().uuid(),
});

export async function fetchTagsAction() {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    const data = await listTags();
    return { data };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function createTagAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = CreateTagSchema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };
  try {
    const tag = await insertTag({
      name: parsed.data.name,
      color: parsed.data.color ?? null,
      owner_id: user.id,
    });
    return { data: tag };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function deleteTagAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    await deleteTag(id);
    return { data: true };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function attachTagAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = AttachSchema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };
  try {
    await attachTag(parsed.data.task_id, parsed.data.tag_id);
    return { data: true };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function detachTagAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = AttachSchema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };
  try {
    await detachTag(parsed.data.task_id, parsed.data.tag_id);
    return { data: true };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}
