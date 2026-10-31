'use client';

import { useEffect, useSyncExternalStore } from 'react';

export type Me = { id: string; name: string; email: string; role: string; profileImage: string | null };
type State = { status: 'loading' | 'ready'; user: Me | null };

// A tiny shared store: the public pages are static, so the header asks /api/me once in the browser
let state: State = { status: 'loading', user: null };
const serverState: State = { status: 'loading', user: null };
const listeners = new Set<() => void>();
let inflight: Promise<void> | null = null;

const emit = () => listeners.forEach((listener) => listener());
const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function refreshMe(): Promise<void> {
  if (inflight) return inflight;

  inflight = fetch('/api/me', { cache: 'no-store' })
    .then((res) => res.json())
    .then((json) => {
      state = { status: 'ready', user: json.user ?? null };
    })
    .catch(() => {
      state = { status: 'ready', user: null };
    })
    .finally(() => {
      inflight = null;
      emit();
    });

  return inflight;
}

// Call this right after logout so the header updates immediately
export function clearMe() {
  state = { status: 'ready', user: null };
  emit();
}

export function useMe(): State {
  const snapshot = useSyncExternalStore(subscribe, () => state, () => serverState);

  useEffect(() => {
    if (state.status === 'loading') void refreshMe();
  }, []);

  return snapshot;
}
