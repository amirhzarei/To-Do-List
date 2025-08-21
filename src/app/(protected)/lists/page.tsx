import { getCurrentUser } from '@/lib/auth/get-current-user';
import { getServerSupabase } from '@/lib/supabase/server';

type TaskList = {
    id: string;
    title: string;
    created_at?: string;
    // add other fields if needed
};

export default async function ListsPage() {
    const user = await getCurrentUser();
    if (!user) {
        return <div className="p-6 text-sm">Please sign in.</div>;
    }
    const supabase = getServerSupabase();
    const { data: lists } = await supabase
        .from('task_list')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-xl font-semibold">Your Lists</h1>
            <ul className="space-y-2">
                {lists?.map((l: TaskList) => (
                    <li key={l.id} className="border rounded p-3">
                        <div className="font-medium">{l.title}</div>
                    </li>
                )) || <li>No lists.</li>}
            </ul>
        </div>
    );
}