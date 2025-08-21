'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const KEY = ['tags'];

export function useTags() {
  const qc = useQueryClient();

  const tagsQuery = useQuery({
    queryKey: KEY,
    queryFn: async () => {
      const res = await fetch('/api/tags');
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data || [];
    },
  });

  const createTag = useMutation({
    mutationFn: async (input: { name: string; color?: string | null }) => {
      const res = await fetch('/api/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return json.data;
    },
    onSuccess: (tag) => {
      qc.setQueryData(KEY, (old: any[] | undefined) => [tag, ...(old || [])]);
    },
  });

  const deleteTag = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/tags/${id}`, { method: 'DELETE' });
      const json = await res.json();
      if (json.error) throw new Error(json.error);
      return id;
    },
    onSuccess: (id) => {
      qc.setQueryData(KEY, (old: any[] | undefined) =>
        (old || []).filter((t) => t.id !== id),
      );
    },
  });

  return { tagsQuery, createTag, deleteTag };
}
