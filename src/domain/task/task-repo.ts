import { getServerSupabase } from '@/lib/supabase/server';
import { Task } from './task.schema';

export async function listTasksForList(listId: string): Promise<Task[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('task')
    .select('*')
    .eq('list_id', listId)
    .order('position', { ascending: true, nullsFirst: true })
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Task[]) || [];
}

export async function insertTask(input: any) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.from('task').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateTask(id: string, partial: Record<string, any>) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('task')
    .update(partial)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTask(id: string) {
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('task').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}
