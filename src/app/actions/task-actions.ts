'use server';

import { z } from 'zod';
import { getCurrentUser } from '@/lib/auth/get-current-user';
import { TaskStatusEnum, TaskPriorityEnum } from '@/domain/task/task.schema';
import {
  deleteTask,
  insertTask,
  listTasksForList,
  updateTask,
} from '@/domain/task/task-repo';

const CreateTaskSchema = z.object({
  list_id: z.string().uuid(),
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  priority: TaskPriorityEnum.optional(),
  due_at: z.string().datetime().nullable().optional(),
  position: z.number().finite().optional(),
});

const UpdateTaskSchema = z
  .object({
    id: z.string().uuid(),
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).nullable().optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    due_at: z.string().datetime().nullable().optional(),
    position: z.number().finite().optional(),
    completed_at: z.string().datetime().nullable().optional(),
  })
  .refine((d) => Object.keys(d).some((k) => k !== 'id'), {
    message: 'At least one field to update required',
  });

export async function createTaskAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = CreateTaskSchema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };
  try {
    const task = await insertTask({
      ...parsed.data,
      creator_id: user.id,
    });
    return { data: task };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function updateTaskAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  const parsed = UpdateTaskSchema.safeParse(raw);
  if (!parsed.success) return { error: 'INVALID_INPUT', issues: parsed.error.issues };
  try {
    const { id, ...rest } = parsed.data;
    const task = await updateTask(id, rest);
    return { data: task };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function deleteTaskAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    await deleteTask(id);
    return { data: true };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}

export async function fetchTasksForListAction(listId: string) {
  const user = await getCurrentUser();
  if (!user) return { error: 'UNAUTHORIZED' };
  try {
    const tasks = await listTasksForList(listId);
    return { data: tasks };
  } catch (e: any) {
    return { error: 'DB_ERROR', detail: e.message };
  }
}
