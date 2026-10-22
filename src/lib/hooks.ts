"use client";

import { useCallback, useEffect, useState } from "react";
import { api, errorMessage } from "./api";
import type { Product } from "./types";

/** True after the first client render — use before reading persisted (localStorage) state. */
export function useHydrated() {
  const [h, setH] = useState(false);
  useEffect(() => setH(true), []);
  return h;
}

export function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

/**
 * Minimal client data hook: fetches `path` (null = skip), exposes loading / error / reload.
 * Requests are cancelled on unmount or when the path changes.
 */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<{ data: T | undefined; error: string | null; loading: boolean }>({ data: undefined, error: null, loading: !!path });
  const [nonce, setNonce] = useState(0);
  useEffect(() => {
    if (!path) {
      setState({ data: undefined, error: null, loading: false });
      return;
    }
    const ctrl = new AbortController();
    setState((s) => ({ ...s, loading: true, error: null }));
    api<T>(path, { signal: ctrl.signal })
      .then((data) => setState({ data, error: null, loading: false }))
      .catch((e) => {
        if ((e as Error)?.name === "AbortError") return;
        setState((s) => ({ data: s.data, error: errorMessage(e), loading: false }));
      });
    return () => ctrl.abort();
  }, [path, nonce]);
  const reload = useCallback(() => setNonce((n) => n + 1), []);
  const mutate = useCallback((fn: (d: T | undefined) => T | undefined) => setState((s) => ({ ...s, data: fn(s.data) })), []);
  return { ...state, reload, mutate };
}

/** Products for a list of slugs (cart, checkout, wishlist). */
export function useProductsBySlug(slugs: string[]) {
  const key = [...new Set(slugs)].sort().join(",");
  const r = useApi<Product[]>(key ? `/products?slugs=${encodeURIComponent(key)}&limit=200` : null);
  return { ...r, map: new Map((r.data ?? []).map((p) => [p.slug, p])) };
}
