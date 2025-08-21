import { getServerSupabase } from '@/lib/supabase/server';

export async function listLists() {
  const supabase = await getServerSupabase();
  const { data, error } = await supabase
    .from('task_list')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw new Error('listLists: ' + error.message);
  return data || [];
}

export async function insertList(input: {
  title: string;
  color?: string | null;
  owner_id: string;
}) {
  const supabase = await getServerSupabase();
  console.log('[insertList] inserting with owner_id', input.owner_id);
  const { data, error } = await supabase
    .from('task_list')
    .insert({
      title: input.title,
      color: input.color ?? null,
      owner_id: input.owner_id,
    })
    .select()
    .single();
  if (error) {
    console.error('[insertList] error', error);
    throw new Error('insertList: ' + error.message);
  }
  return data;
}

export async function deleteList(id: string, owner_id: string) {
  const supabase = await getServerSupabase();
  const { error } = await supabase
    .from('task_list')
    .delete()
    .eq('id', id)
    .eq('owner_id', owner_id);
  if (error) throw new Error('deleteList: ' + error.message);
  return true;
}
