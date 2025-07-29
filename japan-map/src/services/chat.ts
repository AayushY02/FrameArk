// frontend/src/services/chat.ts
import { useMutation } from '@tanstack/react-query';
import type { MeshFeature } from '@/types/mesh';

interface Payload {
  meshes: MeshFeature[];
  history: { role: 'user' | 'assistant'; content: string }[];
}

async function callGPT({ meshes, history }: Payload) {
  const r = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ meshes, history }),
  });
  if (!r.ok) throw new Error(await r.text());
  return (await r.json()) as {
    messages: { role: 'user' | 'assistant'; content: string }[];
  };
}

export function useChatGPT() {
  const { mutateAsync: ask, isPending, error } = useMutation({ mutationFn: callGPT });
  return { ask, isPending, error };
}
