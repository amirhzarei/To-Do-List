"use server";

import { z } from "zod";
import { getCurrentUser } from "@/lib/auth/get-current-user";
import { getServerSupabase } from "@/lib/supabase/server";

const Input = z.object({
  title: z.string().min(1).max(120),
  color: z.string().max(32).optional().nullable(),
});

export async function createListAction(raw: unknown) {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "UNAUTHORIZED" };
  }
  const parsed = Input.safeParse(raw);
  if (!parsed.success) {
    return { error: "INVALID_INPUT", issues: parsed.error.issues };
  }
  const supabase = getServerSupabase();
  if (!supabase) return { error: "SERVER_CONFIG" };

  const { data, error } = await supabase
    .from("task_list")
    .insert({
      title: parsed.data.title,
      color: parsed.data.color,
      owner_id: user.id,
    })
    .select()
    .single();

  if (error) {
    return { error: "DB_ERROR", detail: error.message };
  }
  return { data };
}
