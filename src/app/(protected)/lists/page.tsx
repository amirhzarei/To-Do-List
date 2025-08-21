import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getServerSupabase } from '@/lib/supabase/server';
import ListsClient from '@/components/lists/lists-client';

export const dynamic = 'force-dynamic';

export default async function ListsPage() {
    const user = await getCurrentUser();
    if (!user) {
        // You can choose redirect('/signin') instead:
        return <div className="p-6 text-sm">Please sign in.</div>;
    }

    // Optional: fetch initial lists for faster first paint
    const supabase = await getServerSupabase();
    const { data: lists, error } = await supabase
        .from('task_list')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) {
        return <div className="p-6 text-sm text-red-600">Error: {error.message}</div>;
    }

    return (
        <ListsClient
            initialLists={lists || []}
            userId={user.id}
        />
    );
}