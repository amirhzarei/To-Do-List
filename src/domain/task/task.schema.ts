import { z } from "zod";

/* Enums */
export const TaskStatusEnum = z.enum([
  "todo",
  "in_progress",
  "done",
  "archived",
]);
export const TaskPriorityEnum = z.enum(["low", "med", "high", "urgent"]);

/* Branded ID types (string UUIDs) */
export const TaskId = z.string().uuid();
export const ListId = z.string().uuid();
export const UserId = z.string().uuid();
export const TagId = z.string().uuid();
export const AttachmentId = z.string().uuid();

/* Base (DB) representation of a Task */
export const TaskBaseSchema = z.object({
  id: TaskId,
  list_id: ListId,
  creator_id: UserId,
  title: z.string().min(1).max(300),
  description: z.string().max(5000).nullable().optional(),
  status: TaskStatusEnum,
  priority: TaskPriorityEnum,
  due_at: z.string().datetime().nullable().optional(),
  recurrence_rule: z.string().nullable().optional(),
  position: z.number().finite().nullable().optional(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  completed_at: z.string().datetime().nullable(),
});

export type Task = z.infer<typeof TaskBaseSchema>;

/* CreateTaskInput: only client-supplied fields (server sets id, creator_id, timestamps) */
export const CreateTaskInput = z.object({
  list_id: ListId,
  title: z.string().min(1).max(300),
  description: z.string().max(5000).optional(),
  priority: TaskPriorityEnum.optional().default("med"),
  due_at: z.string().datetime().nullable().optional(),
  recurrence_rule: z.string().optional(),
  position: z.number().finite().optional(),
  status: TaskStatusEnum.optional().default("todo"),
});
export type CreateTaskInputType = z.infer<typeof CreateTaskInput>;

/* UpdateTaskInput: id plus at least one field */
export const UpdateTaskInput = z
  .object({
    id: TaskId,
    title: z.string().min(1).max(300).optional(),
    description: z.string().max(5000).nullable().optional(),
    status: TaskStatusEnum.optional(),
    priority: TaskPriorityEnum.optional(),
    due_at: z.string().datetime().nullable().optional(),
    recurrence_rule: z.string().nullable().optional(),
    position: z.number().finite().optional(),
    // Allow explicitly setting completed_at (e.g. server action) or unsetting
    completed_at: z.string().datetime().nullable().optional(),
  })
  .refine((data) => Object.keys(data).some((k) => k !== "id"), {
    message: "At least one mutable field required",
  });

export type UpdateTaskInputType = z.infer<typeof UpdateTaskInput>;
