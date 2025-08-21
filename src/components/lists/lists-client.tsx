'use client';

import { useState, useEffect } from 'react';
import { useLists } from '@/hooks/use-lists';
import { useTasks } from '@/hooks/use-tasks';
import { TaskListDraggable } from '@/components/tasks/task-list-draggable';
import { useRealtimeTables } from '@/hooks/use-realtime';
import { useQueryClient } from '@tanstack/react-query';
import { TagManager } from '../tags/tag-manager';

interface ListsClientProps {
    initialLists: any[];
    userId: string;
}

export default function ListsClient({ initialLists }: ListsClientProps) {
    const qc = useQueryClient();

    // Seed initial lists into React Query cache ONCE
    useEffect(() => {
        qc.setQueryData(['lists'], (prev: any[] | undefined) => {
            if (prev && prev.length > 0) return prev; // keep existing if navigated back
            return initialLists;
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Subscribe to realtime changes
    useRealtimeTables(['task_list', 'task', 'task_tag']);

    const { listsQuery, createMutation, deleteMutation } = useLists();
    const [activeListId, setActiveListId] = useState<string | null>(null);

    const { tasksQuery, createTask, deleteTask } = useTasks(activeListId);

    return (
        <div className="grid gap-6 md:grid-cols-3">
            {/* Lists Column */}
            <div className="space-y-4 md:col-span-1">
                <h2 className="text-lg font-semibold">Lists</h2>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        const form = e.currentTarget;
                        const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
                        if (!title) return;
                        createMutation.mutate({ title });
                        form.reset();
                    }}
                    className="flex gap-2"
                >
                    <input
                        name="title"
                        placeholder="New list title"
                        className="flex-1 rounded border px-3 py-2 text-sm"
                    />
                    <button
                        type="submit"
                        disabled={createMutation.isPending}
                        className="rounded bg-brand text-brand-foreground px-3 py-2 text-sm"
                    >
                        {createMutation.isPending ? '...' : 'Add'}
                    </button>
                </form>
                {listsQuery.isLoading && (
                    <p className="text-sm text-neutral-500">Loading lists...</p>
                )}
                {listsQuery.error && (
                    <p className="text-sm text-red-600">{(listsQuery.error as any).message}</p>
                )}
                <ul className="space-y-2">
                    {(listsQuery.data || []).map((l: any) => (
                        <li
                            key={l.id}
                            className={`border rounded p-3 cursor-pointer ${activeListId === l.id ? 'bg-neutral-50 dark:bg-neutral-800' : ''
                                }`}
                            onClick={() => setActiveListId(l.id)}
                        >
                            <div className="flex items-center gap-2">
                                <span className="font-medium text-sm">{l.title}</span>
                                <button
                                    onClick={(ev) => {
                                        ev.stopPropagation();
                                        deleteMutation.mutate(l.id);
                                        if (activeListId === l.id) setActiveListId(null);
                                    }}
                                    className="ml-auto text-xs text-red-500 hover:underline"
                                >
                                    Delete
                                </button>
                            </div>
                        </li>
                    ))}
                    {listsQuery.data?.length === 0 && (
                        <li className="text-xs text-neutral-500">No lists yet.</li>
                    )}
                </ul>
            </div>

            {/* Tasks + Tags Column */}
            <div className="space-y-6 md:col-span-2">
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">
                        Tasks {activeListId ? '' : '(select a list)'}
                    </h2>
                    {activeListId && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const form = e.currentTarget;
                                const title = (form.elements.namedItem('title') as HTMLInputElement).value.trim();
                                if (!title) return;
                                createTask.mutate({ list_id: activeListId, title });
                                form.reset();
                            }}
                            className="flex gap-2"
                        >
                            <input
                                name="title"
                                placeholder="Add task"
                                className="flex-1 rounded border px-3 py-2 text-sm"
                            />
                            <button
                                type="submit"
                                disabled={createTask.isPending}
                                className="rounded bg-brand text-brand-foreground px-3 py-2 text-sm"
                            >
                                {createTask.isPending ? '...' : 'Add'}
                            </button>
                        </form>
                    )}
                    {activeListId && tasksQuery.isLoading && (
                        <p className="text-sm text-neutral-500">Loading tasks...</p>
                    )}

                    {activeListId && (
                        <TaskListDraggable
                            listId={activeListId}
                            tasks={(tasksQuery.data || []).map((t: any) => ({
                                id: t.id,
                                title: t.title,
                                creator_id: t.creator_id,
                                status: t.status
                            }))}
                            onDeleteTask={(id) => deleteTask.mutate(id)}
                        />
                    )}

                    {activeListId && tasksQuery.data?.length === 0 && !tasksQuery.isLoading && (
                        <p className="text-xs text-neutral-500">No tasks in this list.</p>
                    )}
                </div>

                <div className="pt-4">
                    <TagManager />
                </div>
            </div>
        </div>
    );
}