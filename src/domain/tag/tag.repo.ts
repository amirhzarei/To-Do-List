import { getServerSupabase } from '@/lib/supabase/server';
import { Tag } from './tag.schema';

export async function listTags(): Promise<Tag[]> {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('task_tag')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error(error.message);
  return (data as Tag[]) || [];
}

export async function insertTag(input: {
  name: string;
  color?: string | null;
  owner_id: string;
}) {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase.from('task_tag').insert(input).select().single();
  if (error) throw new Error(error.message);
  return data;
}

export async function deleteTag(id: string) {
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('task_tag').delete().eq('id', id);
  if (error) throw new Error(error.message);
  return true;
}

export async function attachTag(task_id: string, tag_id: string) {
  const supabase = await getServerSupabase();
  const { error } = await supabase.from('task_tag_map').insert({ task_id, tag_id });
  if (error) throw new Error(error.message);
  return true;
}

export async function detachTag(task_id: string, tag_id: string) {
  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from('task_tag_map')
    .delete()
    .eq('task_id', task_id)
    .eq('tag_id', tag_id);
  if (error) throw new Error(error.message);
  return true;
}
