"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, ApiError, configureAuth } from "@/lib/api";
import type { Me } from "@/lib/types";

export type CartLine = { slug: string; variant?: string; qty: number };

type CartState = {
  lines: CartLine[];
  add: (slug: string, qty?: number, variant?: string) => void;
  setQty: (slug: string, qty: number, variant?: string) => void;
  remove: (slug: string, variant?: string) => void;
  clear: () => void;
};

const same = (a: CartLine, slug: string, variant?: string) => a.slug === slug && a.variant === variant;

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      add: (slug, qty = 1, variant) =>
        set((s) => {
          const found = s.lines.find((l) => same(l, slug, variant));
          if (found) return { lines: s.lines.map((l) => (same(l, slug, variant) ? { ...l, qty: Math.min(10, l.qty + qty) } : l)) };
          return { lines: [...s.lines, { slug, variant, qty: Math.min(10, qty) }] };
        }),
      setQty: (slug, qty, variant) =>
        set((s) => ({
          lines: qty <= 0 ? s.lines.filter((l) => !same(l, slug, variant)) : s.lines.map((l) => (same(l, slug, variant) ? { ...l, qty: Math.min(10, qty) } : l)),
        })),
      remove: (slug, variant) => set((s) => ({ lines: s.lines.filter((l) => !same(l, slug, variant)) })),
      clear: () => set({ lines: [] }),
    }),
    { name: "sm-cart" },
  ),
);

/* ───────── Auth ───────── */

type AuthState = {
  accessToken: string | null;
  refreshToken: string | null;
  user: Me | null;
  setSession: (s: { accessToken: string; refreshToken: string; user: Me }) => void;
  setUser: (u: Me) => void;
  logout: () => Promise<void>;
  /** Re-fetch the profile (family, addresses…) from the server. */
  reload: () => Promise<Me | null>;
};

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      setSession: ({ accessToken, refreshToken, user }) => {
        set({ accessToken, refreshToken, user });
        void useWishlist.getState().syncAfterLogin(user);
      },
      setUser: (user) => set({ user }),
      logout: async () => {
        const rt = get().refreshToken;
        set({ accessToken: null, refreshToken: null, user: null });
        if (rt) await api("/auth/logout", { body: { refreshToken: rt }, auth: false }).catch(() => {});
      },
      reload: async () => {
        if (!get().accessToken) return null;
        try {
          const me = await api<Me>("/account/profile");
          set({ user: me });
          return me;
        } catch (e) {
          if (e instanceof ApiError && (e.status === 401 || e.status === 403)) set({ accessToken: null, refreshToken: null, user: null });
          return null;
        }
      },
    }),
    { name: "rj-auth", partialize: (s) => ({ accessToken: s.accessToken, refreshToken: s.refreshToken, user: s.user }) },
  ),
);

// single-flight refresh so parallel 401s trigger one refresh
let refreshing: Promise<string | null> | null = null;
async function refreshAccess(): Promise<string | null> {
  if (refreshing) return refreshing;
  refreshing = (async () => {
    const rt = useAuth.getState().refreshToken;
    if (!rt) return null;
    try {
      const r = await api<{ accessToken: string; refreshToken: string; user: Me }>("/auth/refresh", { body: { refreshToken: rt }, auth: false });
      useAuth.setState({ accessToken: r.accessToken, refreshToken: r.refreshToken, user: r.user });
      return r.accessToken;
    } catch (e) {
      // only sign out when the server rejected the token (not on network errors)
      if (e instanceof ApiError && e.status >= 400 && e.status < 500) useAuth.setState({ accessToken: null, refreshToken: null, user: null });
      return null;
    }
  })();
  try {
    return await refreshing;
  } finally {
    refreshing = null;
  }
}

configureAuth({
  getToken: () => useAuth.getState().accessToken,
  refresh: refreshAccess,
  onLost: () => useAuth.setState({ accessToken: null, refreshToken: null, user: null }),
});

/* ───────── Wishlist (local for guests, synced when signed in) ───────── */

type WishState = {
  slugs: string[];
  toggle: (slug: string) => Promise<boolean>;
  syncAfterLogin: (user: Me) => Promise<void>;
};
export const useWishlist = create<WishState>()(
  persist(
    (set, get) => ({
      slugs: [],
      toggle: async (slug) => {
        const had = get().slugs.includes(slug);
        set({ slugs: had ? get().slugs.filter((x) => x !== slug) : [...get().slugs, slug] }); // optimistic
        if (!useAuth.getState().accessToken) return !had;
        try {
          const r = await api<{ added: boolean; slugs: string[] }>("/account/wishlist/toggle", { body: { slug } });
          set({ slugs: r.slugs });
          return r.added;
        } catch {
          set({ slugs: had ? [...get().slugs, slug] : get().slugs.filter((x) => x !== slug) }); // roll back
          return had;
        }
      },
      syncAfterLogin: async () => {
        try {
          const r = await api<{ slugs: string[] }>("/account/wishlist/merge", { body: { slugs: get().slugs } });
          set({ slugs: r.slugs });
        } catch {
          /* keep local list */
        }
      },
    }),
    { name: "sm-wishlist" },
  ),
);

/* ───────── UI ───────── */

type UiState = {
  fontScale: number;
  setFontScale: (n: number) => void;
  toast: { id: number; text: string; tone?: "success" | "info" | "error" } | null;
  showToast: (text: string, tone?: "success" | "info" | "error") => void;
  cartPulse: number;
};
export const useUi = create<UiState>()(
  persist(
    (set) => ({
      fontScale: 1,
      setFontScale: (n) => set({ fontScale: Math.min(1.25, Math.max(0.9, Math.round(n * 100) / 100)) }),
      toast: null,
      showToast: (text, tone = "success") => set((s) => ({ toast: { id: Date.now(), text, tone }, cartPulse: s.cartPulse + (tone === "success" ? 1 : 0) })),
      cartPulse: 0,
    }),
    { name: "sm-ui", partialize: (s) => ({ fontScale: s.fontScale }) },
  ),
);

export const toast = (text: string, tone?: "success" | "info" | "error") => useUi.getState().showToast(text, tone);
