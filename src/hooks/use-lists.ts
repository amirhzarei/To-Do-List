'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const KEY = ['lists'];

export function useLists() {
  const qc = useQueryClient();

  const listsQuery = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await fetch('/api/lists');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (input: { title: string; color?: string | null }) => {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.detail || json.error);
      return json.data;
    },
    onSuccess: (newList) => {
      qc.setQueryData(KEY, (old: any[] | undefined) => [newList, ...(old || [])]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/lists/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) throw new Error(json.detail || json.error);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(KEY, (old: any[] | undefined) =>
        (old || []).filter((l) => l.id !== id),
      );
    },
  });

  return { listsQuery, createMutation, deleteMutation };
}
