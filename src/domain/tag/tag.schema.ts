import { z } from 'zod';
import { TagId, UserId, TaskId } from '../task/task.schema';

export const TagSchema = z.object({
  id: z.string().uuid(),
  owner_id: z.string().uuid(),
  name: z.string(),
  color: z.string().nullable().optional(),
  created_at: z.string().optional(),
});

export type Tag = z.infer<typeof TagSchema>;

/**
 * Fields a client may send when creating a tag.
 * Server will inject: id, owner_id, created_at
 */
export const CreateTagInput = z.object({
  name: z.string().min(1).max(40),
  color: z.string().max(32).nullable().optional(),
});
export type CreateTagInputType = z.infer<typeof CreateTagInput>;

/**
 * For attaching an existing tag to a task (many-to-many)
 */
export const AttachTagInput = z.object({
  task_id: TaskId,
  tag_id: TagId,
});
