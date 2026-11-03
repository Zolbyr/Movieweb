"use client";

import { useCallback, useEffect, useState } from "react";

export async function getMovies<T>(path: string, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/tmdb/${path}`, { signal }).catch((error: unknown) => {
    if (signal?.aborted) throw error;
    throw new Error("Киноны мэдээллийг татаж чадсангүй. Холболтоо шалгаад дахин оролдоно уу.");
  });
  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error("Киноны мэдээллийг уншиж чадсангүй. Дахин оролдоно уу.");
  }
  if (!response.ok) throw new Error(data.error || "Киноны мэдээллийг ачаалж чадсангүй. Дахин оролдоно уу.");
  return data;
}

export function useMovies<T>(path: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<{ path: string | null; data: T | null; error: string | null; loading: boolean }>({ path, data: null, error: null, loading: Boolean(path) });
  const retry = useCallback(() => setAttempt((value) => value + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    if (!path) {
      setState({ path, data: null, error: null, loading: false });
      return () => controller.abort();
    }
    setState({ path, data: null, error: null, loading: true });
    getMovies<T>(path, controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ path, data, error: null, loading: false });
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) setState({ path, data: null, error: error instanceof Error ? error.message : "Киноны мэдээллийг ачаалж чадсангүй. Дахин оролдоно уу.", loading: false });
      });
    return () => controller.abort();
  }, [path, attempt]);

  // Never render a previous request's data while a new route is loading.
  return { ...(state.path === path ? state : { data: null, error: null, loading: Boolean(path) }), retry };
}
