'use client';

import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    DragEndEvent
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    verticalListSortingStrategy,
    useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';

function SortableItem({
    id,
    title,
    onDelete
}: {
    id: string;
    title: string;
    onDelete: () => void;
}) {
    const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
        id
    });
    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.6 : 1,
        cursor: 'grab'
    };
    return (
        <li
            ref={setNodeRef}
            style={style}
            className="border rounded p-3 flex items-center gap-2 bg-white dark:bg-neutral-900"
            {...attributes}
            {...listeners}
        >
            <span className="flex-1 text-sm">{title}</span>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                }}
                className="text-xs text-red-500 hover:underline"
            >
                Delete
            </button>
        </li>
    );
}

export function TaskListDraggable({
    listId,
    tasks,
    onDeleteTask
}: {
    listId: string;
    tasks: { id: string; title: string, creator_id: string, status: string }[];
    onDeleteTask: (id: string) => void;
}) {
    const qc = useQueryClient();
    const [items, setItems] = useState(tasks.map((t) => t.id));

    // Keep internal list in sync with external changes
    useEffect(() => {
        setItems(tasks.map((t) => t.id));
    }, [tasks.map((t) => t.id).join(',')]);

    const reorderMutation = useMutation({
        mutationFn: async (orderedIds: string[]) => {
            const res = await fetch('/api/tasks/reorder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ list_id: listId, ordered_ids: orderedIds, creator_id: tasks[0]?.creator_id, title: tasks[0]?.title, status: tasks[0]?.status })
            });
            const json = await res.json();
            if (json.error) throw new Error(json.error);
        },
        onError: () => {
            // If server rejects, refetch real order
            qc.invalidateQueries({ queryKey: ['tasks', listId] });
        }
    });

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 5 }
        })
    );

    function handleDragEnd(event: DragEndEvent) {
        const { active, over } = event;
        if (!over || active.id === over.id) return;
        const oldIndex = items.indexOf(active.id as string);
        const newIndex = items.indexOf(over.id as string);
        const newItems = arrayMove(items, oldIndex, newIndex);
        setItems(newItems);

        // Optimistic reorder of cached tasks
        qc.setQueryData(['tasks', listId], (old: any[] | undefined) => {
            if (!old) return old;
            const orderMap = newItems.reduce((acc: any, id: string, idx: number) => {
                acc[id] = idx;
                return acc;
            }, {} as Record<string, number>);
            return [...old].sort((a, b) => orderMap[a.id] - orderMap[b.id]);
        });

        reorderMutation.mutate(newItems);
    }

    return (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                    {items.map((id) => {
                        const task = tasks.find((t) => t.id === id);
                        if (!task) return null;
                        return (
                            <SortableItem
                                key={task.id}
                                id={task.id}
                                title={task.title}
                                onDelete={() => onDeleteTask(task.id)}
                            />
                        );
                    })}
                </ul>
            </SortableContext>
        </DndContext>
    );
}