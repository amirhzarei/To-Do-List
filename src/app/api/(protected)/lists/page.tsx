'use client';

import { useState } from 'react';
import { useLists } from '@/hooks/use-lists';
import { useTasks } from '@/hooks/use-tasks';

export default function ListsPage() {
    const { listsQuery, createMutation, deleteMutation } = useLists();
    const [activeListId, setActiveListId] = useState<string | null>(null);
    const { tasksQuery, createTask, deleteTask } = useTasks(activeListId);

    return (
        <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
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
                {listsQuery.isLoading && <p className="text-sm text-neutral-500">Loading lists...</p>}
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
                    {listsQuery.data?.length === 0 && <li className="text-xs text-neutral-500">No lists yet.</li>}
                </ul>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Tasks {activeListId ? '' : '(select a list)'}</h2>
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
                <ul className="space-y-2">
                    {(tasksQuery.data || []).map((t: any) => (
                        <li
                            key={t.id}
                            className="border rounded p-3 flex items-center gap-2 text-sm"
                        >
                            <span className="flex-1">{t.title}</span>
                            <button
                                onClick={() => deleteTask.mutate(t.id)}
                                className="text-xs text-red-500 hover:underline"
                            >
                                Delete
                            </button>
                        </li>
                    ))}
                    {activeListId && tasksQuery.data?.length === 0 && (
                        <li className="text-xs text-neutral-500">No tasks in this list.</li>
                    )}
                </ul>
            </div>
        </div>
    );
}