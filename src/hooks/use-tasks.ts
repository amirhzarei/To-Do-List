'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useTasks(listId: string | null | undefined) {
  const qc = useQueryClient();
  const key = ['tasks', listId];

  const tasksQuery = useQuery({
    queryKey: key,
    enabled: !!listId,
    queryFn: async () => {
      const res = await fetch(`/api/tasks/list/${listId}`);
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    },
  });

  const createTask = useMutation({
    mutationFn: async (input: { list_id: string; title: string }) => {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (task) => {
      qc.setQueryData(key, (old: any[]) => [task, ...(old || [])]);
    },
  });

  const updateTask = useMutation({
    mutationFn: async (input: { id: string; [k: string]: any }) => {
      const res = await fetch(`/api/tasks/${input.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (updated) => {
      qc.setQueryData(key, (old: any[]) =>
        (old || []).map((t) => (t.id === updated.id ? updated : t)),
      );
    },
  });

  const deleteTask = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(key, (old: any[]) => (old || []).filter((t) => t.id !== id));
    },
  });

  return {
    tasksQuery,
    createTask,
    updateTask,
    deleteTask,
  };
}
