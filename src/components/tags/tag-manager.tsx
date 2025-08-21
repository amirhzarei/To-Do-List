'use client';

import { useTags } from '@/hooks/use-tags';
import { useState } from 'react';

export function TagManager() {
    const { tagsQuery, createTag, deleteTag } = useTags();
    const [name, setName] = useState('');
    const [color, setColor] = useState('');

    return (
        <div className="space-y-3">
            <h3 className="text-sm font-semibold">Tags</h3>
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    if (!name.trim()) return;
                    createTag.mutate({ name: name.trim(), color: color.trim() || undefined });
                    setName('');
                    setColor('');
                }}
                className="flex flex-col gap-2"
            >
                <div className="flex gap-2">
                    <input
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="New tag"
                        className="flex-1 rounded border px-2 py-1 text-xs"
                    />
                    <input
                        value={color}
                        onChange={e => setColor(e.target.value)}
                        placeholder="#hex / color"
                        className="w-28 rounded border px-2 py-1 text-xs"
                    />
                </div>
                <button
                    className="self-start rounded bg-brand text-brand-foreground px-3 py-1 text-xs"
                    disabled={createTag.isPending}
                >
                    {createTag.isPending ? '...' : 'Add'}
                </button>
            </form>
            <ul className="space-y-1 max-h-48 overflow-auto">
                {(tagsQuery.data || []).map((t: any) => (
                    <li
                        key={t.id}
                        className="flex items-center gap-2 text-xs border rounded px-2 py-1"
                        style={t.color ? { borderColor: t.color } : undefined}
                    >
                        <span className="truncate">{t.name}</span>
                        {t.color && (
                            <span
                                className="inline-block w-3 h-3 rounded"
                                style={{ backgroundColor: t.color }}
                                aria-label={t.color}
                            />
                        )}
                        <button
                            onClick={() => deleteTag.mutate(t.id)}
                            className="ml-auto text-red-500 hover:underline"
                        >
                            x
                        </button>
                    </li>
                ))}
                {tagsQuery.isLoading && <li className="text-neutral-400">Loading...</li>}
            </ul>
        </div>
    );
}