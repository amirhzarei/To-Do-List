import { z } from "zod";
import { ListId, UserId } from "../task/task.schema";

/**
 * Database-facing TaskList shape (完整 row).
 */
export const TaskListSchema = z.object({
  id: ListId,
  owner_id: UserId,
  title: z.string().min(1).max(120),
  color: z.string().max(32).nullable().optional(),
  is_shared: z.boolean(),
  created_at: z.string().datetime(),
});

export type TaskList = z.infer<typeof TaskListSchema>;

/**
 * Fields a client may provide when creating a list.
 * Server supplies: id, owner_id, created_at, is_shared (defaults false).
 */
export const CreateListInput = z.object({
  title: z.string().min(1).max(120),
  color: z.string().max(32).nullable().optional(),
});
export type CreateListInputType = z.infer<typeof CreateListInput>;

/**
 * Update: must include id plus at least one mutable field.
 */
export const UpdateListInput = z
  .object({
    id: ListId,
    title: z.string().min(1).max(120).optional(),
    color: z.string().max(32).nullable().optional(),
  })
  .refine((d) => Object.keys(d).some((k) => k !== "id"), {
    message: "At least one updated field required",
  });

export type UpdateListInputType = z.infer<typeof UpdateListInput>;
